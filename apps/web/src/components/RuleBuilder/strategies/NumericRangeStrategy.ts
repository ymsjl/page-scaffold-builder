import {
  RuleNode,
  RuleNodeType,
  RuleParamsOfNumericRangeSchema,
} from "../RuleParamsDateSchema";
import NumericRangeEditor from "../ruleEditors/NumericRangeEditor";
import { BaseStrategy } from "./BaseStrategy";
import type { AntdRule } from "./types";

export class NumericRangeStrategy extends BaseStrategy {
  Editor = NumericRangeEditor;

  constructor() {
    super(RuleNodeType.NumericRange);
  }

  buildDefaultMessage(node: Pick<RuleNode, "type" | "params">): string {
    const { success, data, error } = RuleParamsOfNumericRangeSchema.safeParse(
      node.params,
    );
    if (!success) return error.message;
    const { min, max } = data;
    if (min !== undefined && max !== undefined)
      return `该数字需在 ${min}-${max} 之间`;
    if (min !== undefined) return `该数字需不小于 ${min}`;
    if (max !== undefined) return `该数字需不大于 ${max}`;
    return "不符合要求";
  }

  toRule(node: RuleNode, message: string): AntdRule {
    const { min, max } = RuleParamsOfNumericRangeSchema.parse(node.params);
    const r: any = { message, type: "number" };
    if (min !== undefined) r.min = min;
    if (max !== undefined) r.max = max;
    return r as AntdRule;
  }

  applyFieldProps(node: RuleNode, fieldProps: Record<string, any>): void {
    const { min, max } = (node.params ?? {}) as any;
    if (typeof min === "number") fieldProps.min = min;
    if (typeof max === "number") fieldProps.max = max;
  }
}
