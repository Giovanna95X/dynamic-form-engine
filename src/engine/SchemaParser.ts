import type { FormSchema, FieldSchema, FieldType } from './types';

export function parseSchema(raw: unknown): FormSchema {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Schema 必须是一个 JSON 对象');
  }
  const schema = raw as Record<string, any>;
  if (!schema.id)     throw new Error('Schema 缺少必填字段：id');
  if (!schema.fields || !Array.isArray(schema.fields)) {
    throw new Error('Schema 缺少必填字段：fields（数组）');
  }
  return {
    id:          schema.id,
    version:     schema.version ?? '1.0',
    title:       schema.title   ?? '未命名表单',
    description: schema.description,
    submitApi:   schema.submitApi,
    fields:      schema.fields.map(injectDefaults),
  };
}

function injectDefaults(field: FieldSchema): FieldSchema {
  return {
    defaultValue: getDefaultByType(field.type),
    placeholder:  getPlaceholder(field),
    rules:        [],
    ...field,
    children: field.children?.map(injectDefaults),
  };
}

function getDefaultByType(type: FieldType): any {
  switch (type) {
    case 'switch': return false;
    case 'number': return null;
    default:       return '';
  }
}

function getPlaceholder(field: FieldSchema): string {
  switch (field.type) {
    case 'select':   return `请选择${field.label}`;
    case 'date':     return '请选择日期';
    case 'number':   return `请输入${field.label}`;
    case 'textarea': return `请输入${field.label}`;
    default:         return `请输入${field.label}`;
  }
}
