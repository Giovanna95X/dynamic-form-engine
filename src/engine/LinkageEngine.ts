import type { Condition, LogicGroup } from './types';

function evaluateCondition(
  condition: Condition,
  formData: Record<string, any>,
): boolean {
  const val = formData[condition.field];
  switch (condition.operator) {
    case 'eq':       return val === condition.value;
    case 'neq':      return val !== condition.value;
    case 'in':       return Array.isArray(condition.value) && condition.value.includes(val);
    case 'notIn':    return Array.isArray(condition.value) && !condition.value.includes(val);
    case 'empty':    return val === undefined || val === null || val === '';
    case 'notEmpty': return val !== undefined && val !== null && val !== '';
    case 'gt':       return Number(val) > Number(condition.value);
    case 'lt':       return Number(val) < Number(condition.value);
    default:         return true;
  }
}

/**
 * 递归求值，支持 AND / OR 嵌套逻辑组合
 */
export function evaluate(
  rule: Condition | LogicGroup,
  formData: Record<string, any>,
): boolean {
  if ('logic' in rule) {
    const results = rule.conditions.map((c) => evaluate(c, formData));
    return rule.logic === 'and' ? results.every(Boolean) : results.some(Boolean);
  }
  return evaluateCondition(rule, formData);
}
