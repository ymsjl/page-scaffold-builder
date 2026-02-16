import { type RuleNode, RuleNodeType, RuleParamsOfTextLengthSchema } from '../RuleParamsDateSchema';
import LengthRuleEditor from '../ruleEditors/LengthRuleEditor';
import { BaseStrategy } from './BaseStrategy';
import type { AntdRule } from './types';

export class TextLengthStrategy extends BaseStrategy {
  Editor = LengthRuleEditor;

  constructor() {
    super(RuleNodeType.TextLength);
  }

  buildDefaultMessage(node: Pick<RuleNode, 'type' | 'params'>): string {
    if (!this.type) return '长度不符合要求';
    const { success, data, error } = RuleParamsOfTextLengthSchema.safeParse(node.params);
    if (!success) return error.message;
    const { min, max, len } = data;

    if (len !== undefined) return `长度需为 ${len}`;
    if (min !== undefined && max !== undefined) return `长度需在 ${min}-${max} 之间`;
    if (min !== undefined) return `长度需至少 ${min}`;
    if (max !== undefined) return `长度需不超过 ${max}`;
    return '长度不符合要求';
  }

  toRule(node: RuleNode, message: string): AntdRule {
    if (!this.type) return { message } as AntdRule;
    const { min, max, len } = RuleParamsOfTextLengthSchema.parse(node.params);
    const r: any = { message, type: 'string' };
    if (len !== undefined) r.len = len;
    if (min !== undefined) r.min = min;
    if (max !== undefined) r.max = max;
    return r as AntdRule;
  }

  applyFieldProps(node: RuleNode, fieldProps: Record<string, any>): void {
    if (!this.type) return;
    const { len, min, max } = (node.params ?? {}) as any;
    const nextProps: Record<string, any> = {};
    if (typeof len === 'number') nextProps.maxLength = len;
    if (typeof max === 'number')
      nextProps.maxLength = Math.max(nextProps.maxLength ?? fieldProps.maxLength ?? -Infinity, max);
    if (typeof min === 'number')
      nextProps.minLength = Math.min((fieldProps.minLength ?? min) as number, min);
    Object.assign(fieldProps, nextProps);
  }
}
