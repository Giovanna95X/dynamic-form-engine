<script setup lang="ts">
import { inject, computed } from 'vue';
import type { Ref, ComputedRef } from 'vue';
import type { FieldSchema, FieldState } from '@/engine/types';
import { resolveWidget } from '@/engine/Registry';
import GroupRenderer from './GroupRenderer.vue';

const props = defineProps<{ field: FieldSchema }>();

const formData    = inject<Ref<Record<string, any>>>('formData')!;
const setField    = inject<(key: string, value: any) => void>('setField')!;
const fieldStates = inject<ComputedRef<Record<string, FieldState>>>('fieldStates')!;
const errors      = inject<Ref<Record<string, string>>>('errors')!;
const validateField = inject<(key: string) => Promise<boolean>>('validateField')!;

const state = computed<FieldState>(
  () => fieldStates.value[props.field.key] ?? { visible: true, required: false, disabled: false },
);

const value = computed({
  get: () => formData.value[props.field.key],
  set: (v) => setField(props.field.key, v),
});

function handleBlur() {
  validateField(props.field.key);
}

const widgetComponent = computed(() =>
  props.field.type === 'component' && props.field.component
    ? resolveWidget(props.field.component)
    : null,
);
</script>

<template>
  <div
    v-if="state.visible"
    class="field-item"
    :class="{ 'has-error': errors[field.key] }"
  >
    <!-- 分组类型 -->
    <GroupRenderer v-if="field.type === 'group'" :field="field" />

    <!-- 业务组件类型 -->
    <template v-else-if="field.type === 'component'">
      <div class="field-label">
        <span v-if="state.required" class="required-mark">*</span>
        {{ field.label }}
      </div>
      <div class="field-control">
        <component
          v-if="widgetComponent"
          :is="widgetComponent"
          :modelValue="value"
          :disabled="state.disabled"
          @update:modelValue="(v: any) => { value = v; validateField(field.key); }"
        />
        <div v-else class="widget-missing">
          组件未注册：{{ field.component }}
        </div>
      </div>
    </template>

    <!-- 标准字段类型 -->
    <template v-else>
      <label class="field-label" :for="field.key">
        <span v-if="state.required" class="required-mark">*</span>
        {{ field.label }}
      </label>
      <div class="field-control">

        <!-- select -->
        <select
          v-if="field.type === 'select'"
          :id="field.key"
          v-model="value"
          :disabled="state.disabled"
          @change="validateField(field.key)"
          class="field-select"
        >
          <option value="" disabled>{{ field.placeholder }}</option>
          <option
            v-for="opt in field.options"
            :key="opt.value"
            :value="opt.value"
          >{{ opt.label }}</option>
        </select>

        <!-- textarea -->
        <textarea
          v-else-if="field.type === 'textarea'"
          :id="field.key"
          v-model="value"
          :placeholder="field.placeholder"
          :disabled="state.disabled"
          @blur="handleBlur"
          class="field-textarea"
          rows="3"
        />

        <!-- switch -->
        <label v-else-if="field.type === 'switch'" class="switch-wrap">
          <input
            type="checkbox"
            :id="field.key"
            v-model="value"
            :disabled="state.disabled"
            @change="validateField(field.key)"
            class="switch-input"
          />
          <span class="switch-track">
            <span class="switch-thumb" />
          </span>
          <span class="switch-text">{{ value ? '开启' : '关闭' }}</span>
        </label>

        <!-- number -->
        <input
          v-else-if="field.type === 'number'"
          type="number"
          :id="field.key"
          v-model.number="value"
          :placeholder="field.placeholder"
          :disabled="state.disabled"
          @blur="handleBlur"
          class="field-input"
        />

        <!-- date -->
        <input
          v-else-if="field.type === 'date'"
          type="date"
          :id="field.key"
          v-model="value"
          :disabled="state.disabled"
          @blur="handleBlur"
          class="field-input"
        />

        <!-- input (default) -->
        <input
          v-else
          type="text"
          :id="field.key"
          v-model="value"
          :placeholder="field.placeholder"
          :disabled="state.disabled"
          @blur="handleBlur"
          class="field-input"
        />
      </div>
    </template>

    <div v-if="errors[field.key]" class="field-error">
      {{ errors[field.key] }}
    </div>
  </div>
</template>

<style scoped>
.field-item {
  padding: 14px 0;
  border-bottom: 1px solid var(--border);
  transition: all 0.15s;
}

.field-item:last-child { border-bottom: none; }

.field-label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.required-mark {
  color: #ef4444;
  margin-right: 3px;
}

.field-control { width: 100%; }

.field-input,
.field-select,
.field-textarea {
  width: 100%;
  padding: 9px 12px;
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  color: var(--text-primary);
  font-size: 14px;
  outline: none;
  transition: border-color 0.15s;
  box-sizing: border-box;
}

.field-input:focus,
.field-select:focus,
.field-textarea:focus {
  border-color: var(--accent);
}

.field-input:disabled,
.field-select:disabled,
.field-textarea:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.field-select {
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 32px;
}

.field-textarea { resize: vertical; min-height: 80px; line-height: 1.6; }

/* Switch */
.switch-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.switch-input { display: none; }

.switch-track {
  width: 42px;
  height: 24px;
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: 12px;
  position: relative;
  transition: background 0.2s, border-color 0.2s;
  flex-shrink: 0;
}

.switch-input:checked + .switch-track {
  background: var(--accent);
  border-color: var(--accent);
}

.switch-thumb {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 16px;
  height: 16px;
  background: #fff;
  border-radius: 50%;
  transition: transform 0.2s;
}

.switch-input:checked + .switch-track .switch-thumb {
  transform: translateX(18px);
}

.switch-text {
  font-size: 13px;
  color: var(--text-secondary);
}

/* error */
.has-error .field-input,
.has-error .field-select,
.has-error .field-textarea {
  border-color: #ef4444;
}

.field-error {
  margin-top: 6px;
  font-size: 12px;
  color: #ef4444;
}

/* widget */
.widget-missing {
  padding: 12px;
  background: rgba(239,68,68,0.1);
  border: 1px dashed rgba(239,68,68,0.4);
  border-radius: var(--radius);
  font-size: 12px;
  color: #f87171;
}
</style>
