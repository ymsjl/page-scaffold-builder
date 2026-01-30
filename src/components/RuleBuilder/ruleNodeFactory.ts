import { getDefaultRuleMessage } from './utils/ruleMapping';
import type { RuleNode, RuleNodeType } from './utils/ruleMapping';

export const createNodeId = () => `rule_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

// Accept optional params override so callers can create nodes with specific options (e.g., date range as single-date range)
export function createNodeByType(type: RuleNodeType, opts?: Partial<Record<string, any>>): RuleNode {
  const params: Record<string, any> = (() => {
    switch (type) {
      case 'length':
        return { min: 2, max: 30, operator: 'between' };
      case 'range':
        return { min: 0, max: 100, valueType: 'number', operator: 'between' };
      case 'pattern':
        return { pattern: '^[a-zA-Z0-9_]+$' };
      case 'enum':
        return { enum: ['A', 'B'] };
      // Keep span and dateRange as-is
      case 'dateSpan':
        return { minSpan: undefined, maxSpan: undefined, operator: 'between' };
      case 'dateRange':
        return { minDate: '', maxDate: '', operator: 'between' };
      default:
        return {};
    }
  })();

  const mergedParams = { ...params, ...(opts || {}) };

  return {
    id: createNodeId(),
    type,
    enabled: true,
    params: mergedParams,
    message: getDefaultRuleMessage({ id: 'temp', type, enabled: true, params: mergedParams, message: '' }),
  } as RuleNode;
}
