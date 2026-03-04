import { ref } from 'vue';
import type { FormSchema, FieldSchema } from '@/engine/types';

function collectDefaults(fields: FieldSchema[], acc: Record<string, any> = {}) {
  for (const field of fields) {
    if (field.type === 'group' && field.children) {
      collectDefaults(field.children, acc);
    } else {
      acc[field.key] = field.defaultValue ?? '';
    }
  }
  return acc;
}

export function useFormState(schema: FormSchema) {
  const formData = ref<Record<string, any>>(collectDefaults(schema.fields));

  function setField(key: string, value: any) {
    formData.value[key] = value;
  }

  function resetForm() {
    const defaults = collectDefaults(schema.fields);
    Object.keys(defaults).forEach((key) => {
      formData.value[key] = defaults[key];
    });
  }

  return { formData, setField, resetForm };
}
