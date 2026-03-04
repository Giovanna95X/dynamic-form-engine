import { ref } from 'vue';
import type { ComputedRef, Ref } from 'vue';
import type { FormSchema, FieldSchema, FieldState, ValidationRule } from '@/engine/types';

async function applyRule(
  rule: ValidationRule,
  value: any,
  label: string,
): Promise<string | null> {
  const empty = value === undefined || value === null || value === '';
  switch (rule.type) {
    case 'required':
      if (empty || value === false) return rule.message ?? `${label} 不能为空`;
      break;
    case 'min':
      if (!empty && Number(value) < rule.value)
        return rule.message ?? `${label} 不能小于 ${rule.value}`;
      break;
    case 'max':
      if (!empty && Number(value) > rule.value)
        return rule.message ?? `${label} 不能大于 ${rule.value}`;
      break;
    case 'minLength':
      if (!empty && String(value).length < rule.value)
        return rule.message ?? `${label} 不能少于 ${rule.value} 个字符`;
      break;
    case 'maxLength':
      if (!empty && String(value).length > rule.value)
        return rule.message ?? `${label} 不能超过 ${rule.value} 个字符`;
      break;
    case 'pattern': {
      if (!empty) {
        if (rule.value === 'email-list') {
          const parts = String(value).split(',').map((e) => e.trim());
          const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!parts.every((e) => re.test(e)))
            return rule.message ?? `${label} 包含无效邮箱地址`;
        } else {
          const re = new RegExp(rule.value);
          if (!re.test(String(value)))
            return rule.message ?? `${label} 格式不正确`;
        }
      }
      break;
    }
    case 'remote':
      if (!empty && rule.url) {
        try {
          const res = await fetch(`${rule.url}?value=${encodeURIComponent(value)}`);
          const data = await res.json();
          if (!data.valid) return data.message ?? `${label} 验证未通过`;
        } catch {
          return `${label} 远程校验失败`;
        }
      }
      break;
  }
  return null;
}

function flattenFields(fields: FieldSchema[]): FieldSchema[] {
  return fields.flatMap((f) =>
    f.type === 'group' && f.children
      ? flattenFields(f.children)
      : [f],
  );
}

export function useValidation(
  schema: FormSchema,
  formData: Ref<Record<string, any>>,
  fieldStates: ComputedRef<Record<string, FieldState>>,
) {
  const errors = ref<Record<string, string>>({});
  const allFields = flattenFields(schema.fields);

  async function validateField(key: string): Promise<boolean> {
    const field = allFields.find((f) => f.key === key);
    if (!field) return true;

    // 隐藏字段跳过校验并清除旧错误
    if (!fieldStates.value[key]?.visible) {
      delete errors.value[key];
      return true;
    }

    const value = formData.value[key];
    const rules: ValidationRule[] = [...(field.rules ?? [])];

    // 联动计算出 required=true 时，自动注入 required 规则
    if (fieldStates.value[key]?.required) {
      rules.unshift({ type: 'required' });
    }

    for (const rule of rules) {
      const error = await applyRule(rule, value, field.label);
      if (error) {
        errors.value[key] = error;
        return false;
      }
    }
    delete errors.value[key];
    return true;
  }

  async function validateAll(): Promise<boolean> {
    const results = await Promise.all(allFields.map((f) => validateField(f.key)));
    return results.every(Boolean);
  }

  function clearErrors() {
    errors.value = {};
  }

  return { errors, validateField, validateAll, clearErrors };
}
