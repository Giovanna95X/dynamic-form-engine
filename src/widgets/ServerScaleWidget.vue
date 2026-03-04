<script setup lang="ts">
import { reactive, watch } from 'vue';

const props = defineProps<{
  modelValue: Record<string, any> | null;
  disabled?: boolean;
}>();

const emit = defineEmits<{ 'update:modelValue': [v: Record<string, any>] }>();

const config = reactive({
  instanceType: props.modelValue?.instanceType ?? '',
  cpu:          props.modelValue?.cpu          ?? 4,
  memory:       props.modelValue?.memory       ?? 8,
  disk:         props.modelValue?.disk         ?? 100,
  count:        props.modelValue?.count        ?? 1,
});

watch(config, (v) => emit('update:modelValue', { ...v }), { deep: true });

const instanceTypes = [
  { label: '通用型 n3.medium（2核4G）',   value: 'n3.medium',  cpu: 2,  memory: 4  },
  { label: '通用型 n3.large（4核8G）',    value: 'n3.large',   cpu: 4,  memory: 8  },
  { label: '计算型 c3.xlarge（8核16G）',  value: 'c3.xlarge',  cpu: 8,  memory: 16 },
  { label: '内存型 r3.xlarge（4核32G）',  value: 'r3.xlarge',  cpu: 4,  memory: 32 },
];

function selectInstance(type: typeof instanceTypes[0]) {
  config.instanceType = type.value;
  config.cpu = type.cpu;
  config.memory = type.memory;
}
</script>

<template>
  <div class="widget-box">
    <div class="widget-title">
      <span class="widget-icon">🖥️</span>实例规格配置
      <span class="widget-badge">ServerScaleWidget</span>
    </div>

    <div class="widget-body">
      <!-- 实例类型选择 -->
      <div class="w-field">
        <div class="w-label">实例类型</div>
        <div class="instance-grid">
          <button
            v-for="t in instanceTypes"
            :key="t.value"
            type="button"
            class="instance-card"
            :class="{ active: config.instanceType === t.value }"
            :disabled="disabled"
            @click="selectInstance(t)"
          >
            <div class="ic-name">{{ t.value }}</div>
            <div class="ic-spec">{{ t.cpu }}核 / {{ t.memory }}G</div>
          </button>
        </div>
      </div>

      <!-- 磁盘 + 数量 -->
      <div class="w-row">
        <div class="w-field">
          <div class="w-label">系统盘（GB）</div>
          <input
            type="number"
            v-model.number="config.disk"
            :disabled="disabled"
            min="40"
            max="2000"
            class="w-input"
          />
        </div>
        <div class="w-field">
          <div class="w-label">扩容数量</div>
          <input
            type="number"
            v-model.number="config.count"
            :disabled="disabled"
            min="1"
            max="100"
            class="w-input"
          />
        </div>
      </div>

      <!-- 规格汇总 -->
      <div v-if="config.instanceType" class="spec-summary">
        新增 <strong>{{ config.count }}</strong> 台
        · {{ config.cpu * config.count }} 核
        · {{ config.memory * config.count }}G 内存
        · {{ config.disk * config.count }}G 磁盘
      </div>
    </div>
  </div>
</template>

<style scoped>
.widget-box {
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
}

.widget-title {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: var(--bg-elevated);
  border-bottom: 1px solid var(--border);
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
}

.widget-icon { font-size: 15px; }

.widget-badge {
  margin-left: auto;
  font-size: 10px;
  font-weight: 500;
  color: var(--accent);
  background: var(--accent-dim);
  border: 1px solid rgba(59,130,246,0.3);
  padding: 2px 8px;
  border-radius: 10px;
  font-family: monospace;
}

.widget-body { padding: 16px; display: flex; flex-direction: column; gap: 14px; }

.w-label {
  font-size: 12px;
  color: var(--text-muted);
  margin-bottom: 8px;
}

.instance-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.instance-card {
  padding: 10px 12px;
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  cursor: pointer;
  text-align: left;
  transition: border-color 0.15s, background 0.15s;
}

.instance-card:hover:not(:disabled) { border-color: var(--accent); }
.instance-card.active {
  border-color: var(--accent);
  background: var(--accent-dim);
}

.ic-name {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
  font-family: monospace;
  margin-bottom: 3px;
}

.ic-spec { font-size: 11px; color: var(--text-muted); }

.w-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

.w-input {
  width: 100%;
  padding: 8px 12px;
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  color: var(--text-primary);
  font-size: 14px;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.15s;
}

.w-input:focus { border-color: var(--accent); }
.w-input:disabled { opacity: 0.5; cursor: not-allowed; }

.spec-summary {
  padding: 10px 14px;
  background: rgba(34,197,94,0.08);
  border: 1px solid rgba(34,197,94,0.25);
  border-radius: var(--radius);
  font-size: 13px;
  color: var(--success);
}
</style>
