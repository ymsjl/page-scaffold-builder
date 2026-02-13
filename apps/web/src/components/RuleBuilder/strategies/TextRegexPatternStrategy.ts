import {
  RuleNode,
  RuleNodeType,
  RuleParamsOfPatternSchema,
} from "../RuleParamsDateSchema";
import PatternRuleEditor from "../ruleEditors/PatternRuleEditor";
import { BaseStrategy } from "./BaseStrategy";
import type { AntdRule } from "./types";

export class TextRegexPatternStrategy extends BaseStrategy {
  Editor = PatternRuleEditor;

  constructor() {
    super(RuleNodeType.TextRegexPattern);
  }

  buildDefaultMessage(_node: Pick<RuleNode, "type" | "params">): string {
    return "格式不正确";
  }

  toRule(node: RuleNode, message: string): AntdRule {
    const { pattern } = RuleParamsOfPatternSchema.parse(node.params);
    const r: any = { message };
    if (pattern) r.pattern = new RegExp(pattern);
    return r as AntdRule;
  }

  applyFieldProps(node: RuleNode, fieldProps: Record<string, any>): void {
    const { pattern } = (node.params ?? {}) as any;
    if (pattern) fieldProps.pattern = pattern;
  }
}
