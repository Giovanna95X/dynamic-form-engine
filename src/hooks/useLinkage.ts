import { computed } from 'vue';
import type { Ref } from 'vue';
import { evaluate } from '@/engine/LinkageEngine';
import type { FormSchema, FieldSchema, FieldState } from '@/engine/types';

function processFields(
  fields: FieldSchema[],
  formData: Record<string, any>,
  states: Record<string, FieldState>,
) {
  for (const field of fields) {
    states[field.key] = {
      visible:  field.visible  ? evaluate(field.visible,  formData) : true,
      required: field.required ? evaluate(field.required, formData) : false,
      disabled: field.disabled ? evaluate(field.disabled, formData) : false,
    };
    if (field.children) {
      processFields(field.children, formData, states);
    }
  }
}

export function useLinkage(schema: FormSchema, formData: Ref<Record<string, any>>) {
  const fieldStates = computed(() => {
    const states: Record<string, FieldState> = {};
    processFields(schema.fields, formData.value, states);
    return states;
  });

  return { fieldStates };
}
