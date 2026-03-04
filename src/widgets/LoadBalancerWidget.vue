<script setup lang="ts">
import { reactive, watch } from 'vue';

const props = defineProps<{
  modelValue: Record<string, any> | null;
  disabled?: boolean;
}>();

const emit = defineEmits<{ 'update:modelValue': [v: Record<string, any>] }>();

const config = reactive({
  algorithm:       props.modelValue?.algorithm       ?? 'round_robin',
  healthCheckPath: props.modelValue?.healthCheckPath ?? '/health',
  healthCheckPort: props.modelValue?.healthCheckPort ?? 8080,
  interval:        props.modelValue?.interval        ?? 10,
  threshold:       props.modelValue?.threshold       ?? 3,
  sticky:          props.modelValue?.sticky          ?? false,
});

watch(config, (v) => emit('update:modelValue', { ...v }), { deep: true });

const algorithms = [
  { label: '轮询',     value: 'round_robin',  desc: '依次分配，适合均匀服务' },
  { label: '最少连接', value: 'least_conn',   desc: '优先分配最空闲节点' },
  { label: '源IP哈希', value: 'ip_hash',      desc: '同一IP始终路由到同一节点' },
  { label: '加权轮询', value: 'weighted',     desc: '按节点权重比例分配' },
];
</script>

<template>
  <div class="widget-box">
    <div class="widget-title">
      <span class="widget-icon">⚖️</span>负载均衡配置
      <span class="widget-badge">LoadBalancerWidget</span>
    </div>

    <div class="widget-body">
      <!-- 均衡算法 -->
      <div class="w-field">
        <div class="w-label">负载均衡算法</div>
        <div class="algo-grid">
          <label
            v-for="a in algorithms"
            :key="a.value"
            class="algo-card"
            :class="{ active: config.algorithm === a.value }"
          >
            <input type="radio" :value="a.value" v-model="config.algorithm" :disabled="disabled" style="display:none" />
            <div class="ac-title">{{ a.label }}</div>
            <div class="ac-desc">{{ a.desc }}</div>
          </label>
        </div>
      </div>

      <!-- 健康检查 -->
      <div class="w-section-title">健康检查</div>
      <div class="w-row">
        <div class="w-field">
          <div class="w-label">检查路径</div>
          <input type="text" v-model="config.healthCheckPath" :disabled="disabled" class="w-input" placeholder="/health" />
        </div>
        <div class="w-field">
          <div class="w-label">检查端口</div>
          <input type="number" v-model.number="config.healthCheckPort" :disabled="disabled" class="w-input" />
        </div>
      </div>
      <div class="w-row">
        <div class="w-field">
          <div class="w-label">检查间隔（秒）</div>
          <input type="number" v-model.number="config.interval" :disabled="disabled" min="5" max="300" class="w-input" />
        </div>
        <div class="w-field">
          <div class="w-label">失败阈值（次）</div>
          <input type="number" v-model.number="config.threshold" :disabled="disabled" min="1" max="10" class="w-input" />
        </div>
      </div>

      <!-- 会话保持 -->
      <div class="w-field">
        <label class="switch-wrap">
          <input type="checkbox" v-model="config.sticky" :disabled="disabled" style="display:none" />
          <span class="switch-track" :class="{ on: config.sticky }">
            <span class="switch-thumb" />
          </span>
          <span class="switch-text">开启会话保持（Session Sticky）</span>
        </label>
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
  color: #f59e0b; background: rgba(245,158,11,0.1);
  border: 1px solid rgba(245,158,11,0.3);
  padding: 2px 8px; border-radius: 10px;
}

.widget-body { padding: 16px; display: flex; flex-direction: column; gap: 14px; }
.w-label { font-size: 12px; color: var(--text-muted); margin-bottom: 8px; }

.w-section-title {
  font-size: 11px; font-weight: 600; color: var(--text-muted);
  text-transform: uppercase; letter-spacing: 0.5px;
  padding-bottom: 8px; border-bottom: 1px solid var(--border);
}

.algo-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }

.algo-card {
  padding: 10px 12px; background: var(--bg-primary);
  border: 1px solid var(--border); border-radius: var(--radius); cursor: pointer;
  transition: border-color 0.15s;
}

.algo-card.active { border-color: var(--accent); background: var(--accent-dim); }
.ac-title { font-size: 12px; font-weight: 600; color: var(--text-primary); margin-bottom: 3px; }
.ac-desc  { font-size: 11px; color: var(--text-muted); }

.w-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

.w-input {
  width: 100%; padding: 8px 12px;
  background: var(--bg-primary); border: 1px solid var(--border);
  border-radius: var(--radius); color: var(--text-primary);
  font-size: 14px; outline: none; box-sizing: border-box;
  transition: border-color 0.15s;
}
.w-input:focus { border-color: var(--accent); }

.switch-wrap { display: flex; align-items: center; gap: 10px; cursor: pointer; }

.switch-track {
  width: 38px; height: 22px;
  background: var(--bg-elevated); border: 1px solid var(--border);
  border-radius: 11px; position: relative; transition: background 0.2s; flex-shrink: 0;
}
.switch-track.on { background: var(--accent); border-color: var(--accent); }

.switch-thumb {
  position: absolute; top: 2px; left: 2px;
  width: 16px; height: 16px; background: #fff; border-radius: 50%; transition: transform 0.2s;
}
.switch-track.on .switch-thumb { transform: translateX(16px); }
.switch-text { font-size: 12px; color: var(--text-secondary); }
</style>
