<script setup lang="ts">
import { ref, computed, shallowRef } from 'vue';
import { parseSchema } from '@/engine/SchemaParser';
import FormRenderer from '@/renderer/FormRenderer.vue';
import serverOpsRaw from '@/schemas/server-ops.json';
import alertConfigRaw from '@/schemas/alert-config.json';

const scenarios = [
  {
    id: 'server-ops',
    label: '运维工单',
    tag: 'Demo 1',
    desc: '组件注册表 + 条件渲染',
    raw: serverOpsRaw,
  },
  {
    id: 'alert-config',
    label: '告警配置',
    tag: 'Demo 2',
    desc: '多级联动 + AND/OR 条件',
    raw: alertConfigRaw,
  },
];

const activeId = ref('server-ops');
const active = computed(() => scenarios.find((s) => s.id === activeId.value)!);
const schema = computed(() => parseSchema(active.value.raw));

const submitResult = shallowRef<Record<string, any> | null>(null);
const showResult = ref(false);

function handleSubmit(data: Record<string, any>) {
  submitResult.value = data;
  showResult.value = true;
}

function switchScenario(id: string) {
  activeId.value = id;
  showResult.value = false;
  submitResult.value = null;
}
</script>

<template>
  <div class="demo-view fade-in">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="page-tag">渲染引擎 · 演示场景</div>
      <h1 class="page-title">Schema 驱动的动态表单</h1>
      <p class="page-desc">
        切换场景，观察同一渲染引擎如何根据不同 JSON Schema 动态组装表单结构与联动规则。
      </p>
    </div>

    <!-- 场景切换 -->
    <div class="scenario-tabs">
      <button
        v-for="s in scenarios"
        :key="s.id"
        class="scenario-tab"
        :class="{ active: activeId === s.id }"
        @click="switchScenario(s.id)"
      >
        <span class="tab-tag">{{ s.tag }}</span>
        <span class="tab-label">{{ s.label }}</span>
        <span class="tab-desc">{{ s.desc }}</span>
      </button>
    </div>

    <!-- 主体区域 -->
    <div class="demo-body">
      <!-- 左侧：表单 -->
      <div class="form-panel">
        <div class="panel-header">
          <span class="panel-title">{{ schema.title }}</span>
          <span class="schema-id">{{ schema.id }} · v{{ schema.version }}</span>
        </div>
        <div class="panel-body">
          <FormRenderer :key="activeId" :schema="schema" @submit="handleSubmit" />
        </div>
      </div>

      <!-- 右侧：Schema 源码 + 提交结果 -->
      <div class="info-panel">
        <!-- 提交结果 -->
        <template v-if="showResult && submitResult">
          <div class="result-panel">
            <div class="result-header">
              <span class="result-ok">✓ 校验通过，表单数据</span>
            </div>
            <pre class="result-json">{{ JSON.stringify(submitResult, null, 2) }}</pre>
          </div>
        </template>

        <!-- Schema 源码预览 -->
        <div class="schema-panel">
          <div class="schema-header">JSON Schema 源码</div>
          <pre class="schema-json">{{ JSON.stringify(active.raw, null, 2) }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.demo-view { max-width: 1100px; }

.page-header { margin-bottom: 28px; }

.page-tag {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 20px;
  background: var(--accent-dim);
  color: var(--accent);
  font-size: 12px;
  font-weight: 500;
  margin-bottom: 12px;
  border: 1px solid rgba(59,130,246,0.3);
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 10px;
  letter-spacing: -0.5px;
}

.page-desc {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.7;
  max-width: 600px;
}

/* 场景切换 */
.scenario-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 24px;
}

.scenario-tab {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  padding: 14px 16px;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  cursor: pointer;
  text-align: left;
  transition: border-color 0.15s, background 0.15s;
}

.scenario-tab:hover { border-color: var(--border-hover); }
.scenario-tab.active {
  border-color: var(--accent);
  background: var(--accent-dim);
}

.tab-tag {
  font-size: 10px;
  font-weight: 600;
  color: var(--accent);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.tab-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.tab-desc {
  font-size: 11px;
  color: var(--text-muted);
}

/* 主体 */
.demo-body {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 20px;
  align-items: start;
}

/* 表单面板 */
.form-panel {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  background: var(--bg-elevated);
  border-bottom: 1px solid var(--border);
}

.panel-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}

.schema-id {
  font-size: 11px;
  color: var(--text-muted);
  font-family: monospace;
}

.panel-body { padding: 20px; }

/* 右侧面板 */
.info-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.result-panel {
  background: var(--bg-surface);
  border: 1px solid rgba(34,197,94,0.4);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.result-header {
  padding: 10px 16px;
  background: rgba(34,197,94,0.08);
  border-bottom: 1px solid rgba(34,197,94,0.2);
}

.result-ok {
  font-size: 13px;
  font-weight: 600;
  color: var(--success);
}

.result-json {
  padding: 14px 16px;
  font-size: 12px;
  font-family: monospace;
  color: var(--text-secondary);
  line-height: 1.6;
  overflow-x: auto;
  max-height: 280px;
  overflow-y: auto;
  margin: 0;
}

.schema-panel {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.schema-header {
  padding: 10px 16px;
  background: var(--bg-elevated);
  border-bottom: 1px solid var(--border);
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.schema-json {
  padding: 14px 16px;
  font-size: 11px;
  font-family: monospace;
  color: var(--text-muted);
  line-height: 1.6;
  overflow-x: auto;
  max-height: 500px;
  overflow-y: auto;
  margin: 0;
}
</style>
