<script setup lang="ts">
import { reactive, watch } from 'vue';

const props = defineProps<{
  modelValue: Record<string, any> | null;
  disabled?: boolean;
}>();

const emit = defineEmits<{ 'update:modelValue': [v: Record<string, any>] }>();

const config = reactive({
  severity:  props.modelValue?.severity  ?? 'warning',
  condition: props.modelValue?.condition ?? 'gt',
  value:     props.modelValue?.value     ?? 80,
  duration:  props.modelValue?.duration  ?? 5,
  silence:   props.modelValue?.silence   ?? 30,
});

watch(config, (v) => emit('update:modelValue', { ...v }), { deep: true });

const severities = [
  { label: '严重', value: 'critical', color: '#ef4444' },
  { label: '警告', value: 'warning',  color: '#f59e0b' },
  { label: '信息', value: 'info',     color: '#3b82f6' },
];

const conditions = [
  { label: '大于',   value: 'gt'  },
  { label: '小于',   value: 'lt'  },
  { label: '大于等于', value: 'gte' },
  { label: '小于等于', value: 'lte' },
];
</script>

<template>
  <div class="widget-box">
    <div class="widget-title">
      <span class="widget-icon">🔔</span>告警规则配置
      <span class="widget-badge">AlertRuleWidget</span>
    </div>

    <div class="widget-body">
      <!-- 告警级别 -->
      <div class="w-field">
        <div class="w-label">告警级别</div>
        <div class="severity-group">
          <label
            v-for="s in severities"
            :key="s.value"
            class="severity-card"
            :class="{ active: config.severity === s.value }"
            :style="config.severity === s.value ? `border-color: ${s.color}; background: ${s.color}18` : ''"
          >
            <input type="radio" :value="s.value" v-model="config.severity" :disabled="disabled" style="display:none" />
            <span class="sev-dot" :style="`background: ${s.color}`" />
            <span class="sev-label" :style="config.severity === s.value ? `color: ${s.color}` : ''">
              {{ s.label }}
            </span>
          </label>
        </div>
      </div>

      <!-- 触发条件 -->
      <div class="w-field">
        <div class="w-label">触发条件</div>
        <div class="condition-row">
          <span class="condition-prefix">指标值</span>
          <select v-model="config.condition" :disabled="disabled" class="w-select sm">
            <option v-for="c in conditions" :key="c.value" :value="c.value">{{ c.label }}</option>
          </select>
          <input
            type="number"
            v-model.number="config.value"
            :disabled="disabled"
            class="w-input sm"
            placeholder="阈值"
          />
          <span class="condition-suffix">% 持续</span>
          <input
            type="number"
            v-model.number="config.duration"
            :disabled="disabled"
            min="1"
            class="w-input sm"
          />
          <span class="condition-suffix">分钟</span>
        </div>
      </div>

      <!-- 静默时间 -->
      <div class="w-field">
        <div class="w-label">告警静默（分钟）</div>
        <div class="silence-row">
          <input
            type="range"
            v-model.number="config.silence"
            :disabled="disabled"
            min="5" max="1440" step="5"
            class="w-range"
          />
          <span class="silence-val">{{ config.silence }} 分钟</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.widget-box { border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; }

.widget-title {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 16px;
  background: var(--bg-elevated); border-bottom: 1px solid var(--border);
  font-size: 13px; font-weight: 600; color: var(--text-primary);
}

.widget-icon { font-size: 15px; }

.widget-badge {
  margin-left: auto; font-size: 10px; font-family: monospace;
  color: #22c55e; background: rgba(34,197,94,0.1);
  border: 1px solid rgba(34,197,94,0.3);
  padding: 2px 8px; border-radius: 10px;
}

.widget-body { padding: 16px; display: flex; flex-direction: column; gap: 14px; }
.w-label { font-size: 12px; color: var(--text-muted); margin-bottom: 8px; }

.severity-group { display: flex; gap: 8px; }

.severity-card {
  flex: 1; display: flex; align-items: center; gap: 8px;
  padding: 10px 14px;
  background: var(--bg-primary); border: 1px solid var(--border);
  border-radius: var(--radius); cursor: pointer; transition: all 0.15s;
}

.sev-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.sev-label { font-size: 13px; font-weight: 500; color: var(--text-secondary); }

.condition-row {
  display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
}

.condition-prefix,
.condition-suffix {
  font-size: 13px; color: var(--text-muted); white-space: nowrap;
}

.w-select,
.w-input {
  padding: 8px 12px;
  background: var(--bg-primary); border: 1px solid var(--border);
  border-radius: var(--radius); color: var(--text-primary);
  font-size: 14px; outline: none; transition: border-color 0.15s;
}

.w-select:focus, .w-input:focus { border-color: var(--accent); }
.w-select { appearance: none; cursor: pointer; }
.w-select.sm { width: 90px; }
.w-input.sm  { width: 70px; }

.silence-row {
  display: flex; align-items: center; gap: 12px;
}

.w-range {
  flex: 1; height: 4px; appearance: none;
  background: var(--border); border-radius: 2px; cursor: pointer;
  outline: none;
}

.w-range::-webkit-slider-thumb {
  appearance: none; width: 16px; height: 16px;
  background: var(--accent); border-radius: 50%; cursor: pointer;
}

.silence-val {
  font-size: 13px; font-weight: 600; color: var(--accent);
  min-width: 70px; text-align: right;
}
</style>
