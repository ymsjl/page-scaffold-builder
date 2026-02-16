import { type RuleNode, RuleNodeType, RuleParamsOfPatternSchema } from '../RuleParamsDateSchema';
import PatternRuleEditor from '../ruleEditors/PatternRuleEditor';
import { BaseStrategy } from './BaseStrategy';
import type { AntdRule } from './types';

export class TextRegexPatternStrategy extends BaseStrategy {
  Editor = PatternRuleEditor;

  constructor() {
    super(RuleNodeType.TextRegexPattern);
  }

  buildDefaultMessage(node: Pick<RuleNode, 'type' | 'params'>): string {
    if (!this.type || !node) return '格式不正确';
    return '格式不正确';
  }

  toRule(node: RuleNode, message: string): AntdRule {
    if (!this.type) return { message } as AntdRule;
    const { pattern } = RuleParamsOfPatternSchema.parse(node.params);
    const r: any = { message };
    if (pattern) r.pattern = new RegExp(pattern);
    return r as AntdRule;
  }

  applyFieldProps(node: RuleNode, fieldProps: Record<string, any>): void {
    if (!this.type) return;
    const { pattern } = (node.params ?? {}) as any;
    const nextProps: Record<string, any> = {};
    if (pattern) nextProps.pattern = pattern;
    Object.assign(fieldProps, nextProps);
  }
}
