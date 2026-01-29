import { getDefaultRuleMessage } from './utils/ruleMapping';
import type { RuleNode, RuleNodeType } from './utils/ruleMapping';

export const createNodeId = () => `rule_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

export function createNodeByType(type: RuleNodeType): RuleNode {
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
      case 'dateMin':
        return { minDate: '' };
      case 'dateMax':
        return { maxDate: '' };
      case 'dateSpan':
        return { minSpan: undefined, maxSpan: undefined, operator: 'between' };
      case 'dateRange':
        return { minDate: '', maxDate: '', operator: 'between' };
      default:
        return {};
    }
  })();

  return {
    id: createNodeId(),
    type,
    enabled: true,
    params,
    message: getDefaultRuleMessage({ id: 'temp', type, enabled: true, params, message: '' }),
  } as RuleNode;
}
