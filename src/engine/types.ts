// ── 联动条件 ────────────────────────────────────────────────────────────────

export interface Condition {
  field: string;
  operator: 'eq' | 'neq' | 'in' | 'notIn' | 'empty' | 'notEmpty' | 'gt' | 'lt';
  value?: any;
}

export interface LogicGroup {
  logic: 'and' | 'or';
  conditions: (Condition | LogicGroup)[];
}

// ── 校验规则 ────────────────────────────────────────────────────────────────

export interface ValidationRule {
  type: 'required' | 'min' | 'max' | 'minLength' | 'maxLength' | 'pattern' | 'remote';
  value?: any;
  message?: string;
  url?: string; // type=remote 时的接口地址
}

// ── 字段 Schema ─────────────────────────────────────────────────────────────

export type FieldType =
  | 'input'
  | 'select'
  | 'textarea'
  | 'switch'
  | 'number'
  | 'date'
  | 'group'
  | 'component';

export interface SelectOption {
  label: string;
  value: any;
}

export interface FieldSchema {
  key: string;
  type: FieldType;
  label: string;
  component?: string;       // type=component 时，指向 Registry 中的组件名
  defaultValue?: any;
  placeholder?: string;
  options?: SelectOption[]; // type=select 时的选项列表
  children?: FieldSchema[]; // type=group 时的子字段

  // 联动规则
  visible?: Condition | LogicGroup;
  required?: Condition | LogicGroup;
  disabled?: Condition | LogicGroup;

  // 校验规则
  rules?: ValidationRule[];
}

// ── 顶层 Schema ──────────────────────────────────────────────────────────────

export interface FormSchema {
  id: string;
  version: string;
  title: string;
  description?: string;
  fields: FieldSchema[];
  submitApi?: string;
}

// ── 运行时字段状态 ───────────────────────────────────────────────────────────

export interface FieldState {
  visible: boolean;
  required: boolean;
  disabled: boolean;
}
