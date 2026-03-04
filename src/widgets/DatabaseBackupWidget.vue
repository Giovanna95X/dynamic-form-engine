<script setup lang="ts">
import { reactive, watch } from 'vue';

const props = defineProps<{
  modelValue: Record<string, any> | null;
  disabled?: boolean;
}>();

const emit = defineEmits<{ 'update:modelValue': [v: Record<string, any>] }>();

const config = reactive({
  database:   props.modelValue?.database   ?? '',
  strategy:   props.modelValue?.strategy   ?? 'full',
  schedule:   props.modelValue?.schedule   ?? '02:00',
  retention:  props.modelValue?.retention  ?? 7,
  compress:   props.modelValue?.compress   ?? true,
});

watch(config, (v) => emit('update:modelValue', { ...v }), { deep: true });

const databases = [
  { label: 'prod-mysql-01', value: 'prod-mysql-01' },
  { label: 'prod-mysql-02', value: 'prod-mysql-02' },
  { label: 'prod-redis-01', value: 'prod-redis-01' },
  { label: 'bi-postgres-01', value: 'bi-postgres-01' },
];

const strategies = [
  { label: '全量备份', value: 'full',        desc: '完整备份所有数据，耗时较长' },
  { label: '增量备份', value: 'incremental', desc: '仅备份上次以来的变更数据' },
];
</script>

<template>
  <div class="widget-box">
    <div class="widget-title">
      <span class="widget-icon">🗄️</span>数据库备份配置
      <span class="widget-badge">DatabaseBackupWidget</span>
    </div>

    <div class="widget-body">
      <!-- 数据库选择 -->
      <div class="w-field">
        <div class="w-label">目标数据库</div>
        <select v-model="config.database" :disabled="disabled" class="w-select">
          <option value="" disabled>请选择数据库</option>
          <option v-for="db in databases" :key="db.value" :value="db.value">
            {{ db.label }}
          </option>
        </select>
      </div>

      <!-- 备份策略 -->
      <div class="w-field">
        <div class="w-label">备份策略</div>
        <div class="strategy-group">
          <label
            v-for="s in strategies"
            :key="s.value"
            class="strategy-card"
            :class="{ active: config.strategy === s.value }"
          >
            <input
              type="radio"
              :value="s.value"
              v-model="config.strategy"
              :disabled="disabled"
              style="display:none"
            />
            <div class="sc-title">{{ s.label }}</div>
            <div class="sc-desc">{{ s.desc }}</div>
          </label>
        </div>
      </div>

      <!-- 执行时间 + 保留天数 -->
      <div class="w-row">
        <div class="w-field">
          <div class="w-label">执行时间</div>
          <input type="time" v-model="config.schedule" :disabled="disabled" class="w-input" />
        </div>
        <div class="w-field">
          <div class="w-label">保留天数</div>
          <input
            type="number"
            v-model.number="config.retention"
            :disabled="disabled"
            min="1" max="365"
            class="w-input"
          />
        </div>
      </div>

      <!-- 压缩开关 -->
      <div class="w-field w-inline">
        <label class="switch-wrap">
          <input
            type="checkbox"
            v-model="config.compress"
            :disabled="disabled"
            style="display:none"
          />
          <span class="switch-track" :class="{ on: config.compress }">
            <span class="switch-thumb" />
          </span>
          <span class="switch-text">启用 Gzip 压缩（节省约 60% 存储空间）</span>
        </label>
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
  color: #a855f7;
  background: rgba(168,85,247,0.1);
  border: 1px solid rgba(168,85,247,0.3);
  padding: 2px 8px;
  border-radius: 10px;
  font-family: monospace;
}

.widget-body { padding: 16px; display: flex; flex-direction: column; gap: 14px; }
.w-label { font-size: 12px; color: var(--text-muted); margin-bottom: 8px; }

.w-select,
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

.w-select:focus, .w-input:focus { border-color: var(--accent); }
.w-select { appearance: none; cursor: pointer; }
.w-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

.strategy-group { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }

.strategy-card {
  padding: 12px;
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  cursor: pointer;
  transition: border-color 0.15s;
}

.strategy-card.active { border-color: var(--accent); background: var(--accent-dim); }

.sc-title { font-size: 13px; font-weight: 600; color: var(--text-primary); margin-bottom: 4px; }
.sc-desc  { font-size: 11px; color: var(--text-muted); line-height: 1.4; }

.w-inline { display: flex; align-items: center; }

.switch-wrap { display: flex; align-items: center; gap: 10px; cursor: pointer; }

.switch-track {
  width: 38px;
  height: 22px;
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: 11px;
  position: relative;
  transition: background 0.2s;
  flex-shrink: 0;
}

.switch-track.on { background: var(--accent); border-color: var(--accent); }

.switch-thumb {
  position: absolute;
  top: 2px; left: 2px;
  width: 16px; height: 16px;
  background: #fff;
  border-radius: 50%;
  transition: transform 0.2s;
}

.switch-track.on .switch-thumb { transform: translateX(16px); }

.switch-text { font-size: 12px; color: var(--text-secondary); }
</style>
