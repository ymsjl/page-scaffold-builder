import { type RuleNode, RuleNodeType } from '../RuleParamsDateSchema';
import { BaseStrategy } from './BaseStrategy';
import type { AntdRule } from './types';

export class RequiredStrategy extends BaseStrategy {
  constructor() {
    super(RuleNodeType.Required);
  }

  buildDefaultMessage(node: Pick<RuleNode, 'type' | 'params'>): string {
    if (!this.type || !node) return '此字段为必填项';
    return '此字段为必填项';
  }

  toRule(node: RuleNode, message: string): AntdRule {
    if (!this.type || !node) return { required: true, message } as AntdRule;
    return { required: true, message } as AntdRule;
  }

  applyFieldProps(node: RuleNode, fieldProps: Record<string, any>): void {
    if (!this.type || !node || !fieldProps) {
      // no-op
    }
  }
}
