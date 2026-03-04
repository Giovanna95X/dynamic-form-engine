<script setup lang="ts">
import { provide, ref } from 'vue';
import type { FormSchema } from '@/engine/types';
import { useFormState } from '@/hooks/useFormState';
import { useLinkage } from '@/hooks/useLinkage';
import { useValidation } from '@/hooks/useValidation';
import FieldRenderer from './FieldRenderer.vue';

const props = defineProps<{ schema: FormSchema }>();
const emit = defineEmits<{ submit: [data: Record<string, any>] }>();

const { formData, setField, resetForm } = useFormState(props.schema);
const { fieldStates } = useLinkage(props.schema, formData);
const { errors, validateField, validateAll, clearErrors } = useValidation(
  props.schema,
  formData,
  fieldStates,
);

provide('formData', formData);
provide('setField', setField);
provide('fieldStates', fieldStates);
provide('errors', errors);
provide('validateField', validateField);

const submitted = ref(false);

async function handleSubmit() {
  submitted.value = true;
  const valid = await validateAll();
  if (valid) {
    emit('submit', { ...formData.value });
  }
}

function handleReset() {
  resetForm();
  clearErrors();
  submitted.value = false;
}
</script>

<template>
  <form class="form-renderer" @submit.prevent="handleSubmit" novalidate>
    <div v-if="schema.description" class="form-desc">{{ schema.description }}</div>

    <div class="form-fields">
      <FieldRenderer
        v-for="field in schema.fields"
        :key="field.key"
        :field="field"
      />
    </div>

    <div class="form-actions">
      <button type="submit" class="btn-submit">提 交</button>
      <button type="button" class="btn-reset" @click="handleReset">重 置</button>
    </div>
  </form>
</template>

<style scoped>
.form-renderer {
  width: 100%;
}

.form-desc {
  font-size: 13px;
  color: var(--text-muted);
  margin-bottom: 20px;
  line-height: 1.6;
  padding: 10px 14px;
  background: var(--bg-elevated);
  border-radius: var(--radius);
  border-left: 3px solid var(--accent);
}

.form-fields {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 28px;
  padding-top: 20px;
  border-top: 1px solid var(--border);
}

.btn-submit {
  padding: 9px 28px;
  background: var(--accent);
  color: #fff;
  border: none;
  border-radius: var(--radius);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
  letter-spacing: 2px;
}

.btn-submit:hover { background: #2563eb; }

.btn-reset {
  padding: 9px 24px;
  background: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  font-size: 14px;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s;
  letter-spacing: 2px;
}

.btn-reset:hover {
  border-color: var(--border-hover);
  color: var(--text-primary);
}
</style>
