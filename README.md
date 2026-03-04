# 动态表单渲染引擎

> JSON Schema 驱动的企业级动态表单渲染引擎，复刻美团私有云"动态组装项目"核心链路。

**在线预览：** _部署中_

---

## 项目背景

在美团私有云服务高可用保障平台，存在大量运维操作场景（服务器扩容、数据库备份、负载均衡配置等）。每个场景的表单结构、字段联动规则、业务组件各不相同，若每个场景单独开发维护成本极高。

实际工程中采用"动态组装"方案：**后端下发 JSON 配置描述 → 前端运行时解析 → 从组件注册表动态加载对应业务组件**。本项目为该方案的脱敏复刻版。

---

## 技术亮点

### 1. Schema 驱动的运行时渲染

表单结构完全由 JSON Schema 描述，前端无任何硬编码的字段定义。同一套渲染引擎可驱动任意形态的表单，新增场景只需提供 JSON 配置。

```json
{
  "id": "server-ops-v1",
  "title": "服务器运维工单",
  "fields": [
    { "key": "opType", "type": "select", "label": "操作类型" },
    {
      "key": "scaleConfig",
      "type": "component",
      "component": "ServerScaleWidget",
      "visible": { "field": "opType", "operator": "eq", "value": "scale" }
    }
  ]
}
```

### 2. 组件注册表（Component Registry）

业务组件以字符串名称注册，渲染器在运行时按 Schema 中的 `component` 字段动态解析并懒加载，实现**组件与渲染引擎的完全解耦**。

```typescript
// 注册
registerWidget('ServerScaleWidget', () => import('@/widgets/ServerScaleWidget.vue'));

// 解析（渲染器内部）
const component = resolveWidget(field.component); // 按名称取出 AsyncComponent
```

新增业务组件只需在 Registry 中注册一行，无需修改渲染器代码。

### 3. 联动引擎（Linkage Engine）

支持 `visible` / `required` / `disabled` 三种联动规则，条件表达式支持 AND / OR 多级逻辑组合，所有逻辑在 JSON 中声明，引擎负责求值。

```json
{
  "key": "emailList",
  "visible": {
    "logic": "or",
    "conditions": [
      { "field": "notifyType", "operator": "eq", "value": "email" },
      { "field": "notifyType", "operator": "eq", "value": "both"  }
    ]
  }
}
```

联动求值为纯函数，可独立测试，与 Vue 响应式系统通过 `computed` 连接，字段状态变化自动触发视图更新。

### 4. 自定义 Hooks 解耦复杂逻辑

将表单的三个核心关切拆分为独立 Composable，职责清晰、可独立复用：

| Hook | 职责 |
|---|---|
| `useFormState` | 初始化 formData，收集嵌套字段默认值 |
| `useLinkage` | 监听 formData，计算每个字段的 visible / required / disabled |
| `useValidation` | 按字段 rules 校验，隐藏字段自动跳过，支持异步远程校验 |

`FormRenderer` 只负责组装这三个 Hook 并通过 `provide` 向下分发，子渲染器通过 `inject` 消费，避免 props 逐层透传。

### 5. Schema Playground

内置实时编辑器：左侧修改 JSON Schema，右侧表单 300ms debounce 响应。支持解析错误提示、字段联动实时预览、提交结果展示，是向客户演示"配置驱动界面"价值的最直观手段。

---

## 架构设计

```
后端 / 配置中心
      │ 下发 JSON Schema
      ▼
  SchemaParser          验证合法性 · 注入默认值
      │
      ├──▶ LinkageEngine    条件求值：visible / required / disabled
      │
      └──▶ Component Registry   name → defineAsyncComponent 懒加载
                │
                ▼
          Form Renderer     FieldRenderer × N + GroupRenderer 嵌套
                │
                ▼
          formData（响应式）
                │
                ├──▶ LinkageEngine 重新求值（字段变更触发）
                └──▶ useValidation Hook
```

---

## 项目结构

```
src/
├── engine/
│   ├── types.ts              # 全部 TypeScript 类型定义
│   ├── LinkageEngine.ts      # 联动条件求值器
│   ├── Registry.ts           # 业务组件注册表
│   └── SchemaParser.ts       # Schema 解析与默认值注入
├── hooks/
│   ├── useFormState.ts       # 表单数据状态管理
│   ├── useLinkage.ts         # 联动计算
│   └── useValidation.ts      # 校验引擎（含异步支持）
├── renderer/
│   ├── FormRenderer.vue      # 顶层渲染器
│   ├── FieldRenderer.vue     # 字段路由（按 type 分发）
│   └── GroupRenderer.vue     # 嵌套分组渲染
├── widgets/                  # 业务组件（类比企业内部组件库）
│   ├── ServerScaleWidget.vue
│   ├── DatabaseBackupWidget.vue
│   ├── LoadBalancerWidget.vue
│   └── AlertRuleWidget.vue
├── schemas/                  # 模拟后端下发的 JSON 配置
│   ├── server-ops.json       # 运维工单（组件注册表演示）
│   └── alert-config.json     # 告警配置（多级联动演示）
└── views/
    ├── DemoView.vue          # 两个完整场景演示
    └── SchemaPlayground.vue  # 实时 JSON 编辑器
```

---

## 演示场景

### Demo 1 — 服务器运维工单

选择不同操作类型，渲染引擎从注册表动态加载对应业务组件：

- 选择「服务器扩容」→ 加载 `ServerScaleWidget`（实例规格、磁盘、数量配置）
- 选择「数据库备份」→ 加载 `DatabaseBackupWidget`（备份策略、执行时间、保留天数）
- 选择「负载均衡配置」→ 加载 `LoadBalancerWidget`（均衡算法、健康检查、会话保持）

### Demo 2 — 告警规则配置

演示纯字段联动与 AND/OR 多级条件：

- 选择监控指标后，触发条件配置组件出现
- 通知方式选「邮件」或「邮件 + 飞书」→ 邮件列表字段显示且变为必填
- 通知方式选「飞书」或「邮件 + 飞书」→ Webhook 地址字段显示且变为必填

---

## 本地运行

```bash
npm install
npm run dev
```

访问 `http://localhost:5173`

---

## 技术栈

| 方向 | 选型 |
|---|---|
| 构建 | Vite 5 |
| 框架 | Vue 3 + TypeScript |
| 状态 | 纯 Composables（无 Pinia） |
| 样式 | CSS Variables 暗色系 |
| 路由 | Vue Router 4 |
