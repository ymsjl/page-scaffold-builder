import { RuleNode, RuleNodeType, RuleParamsOfDecimalSchema } from "../RuleParamsDateSchema";
import DecimalRuleEditor from "../ruleEditors/DecimalRuleEditor";
import { BaseStrategy } from "./BaseStrategy";
import type { AntdRule } from "./types";

export class DecimalStrategy extends BaseStrategy {
  Editor = DecimalRuleEditor;

  constructor() {
    super(RuleNodeType.Decimal);
  }

  buildDefaultMessage(node: Pick<RuleNode, "type" | "params">): string {
    const { success, data } = RuleParamsOfDecimalSchema.safeParse(node.params);
    if (!success) return "小数位数不符合要求";
    const precision = data.precision ?? data.decimals ?? data.scale;
    if (precision !== undefined) return `小数位数需为 ${precision}`;
    return "小数位数不符合要求";
  }

  toRule(node: RuleNode, message: string): AntdRule {
    const { precision, decimals, scale } = RuleParamsOfDecimalSchema.parse(
      node.params,
    );
    const limit = precision ?? decimals ?? scale;
    const validator = async (_rule: any, value: any) => {
      if (value === undefined || value === null || value === "")
        return Promise.resolve();
      if (limit === undefined) return Promise.resolve();
      const text =
        typeof value === "number" ? String(value) : String(value).trim();
      if (!text || Number.isNaN(Number(text)))
        return Promise.reject(new Error(message));
      const decimalsCount = text.split(".")[1]?.length ?? 0;
      if (decimalsCount > limit) return Promise.reject(new Error(message));
      return Promise.resolve();
    };
    return { validator, message } as AntdRule;
  }

  applyFieldProps(node: RuleNode, fieldProps: Record<string, any>): void {
    const params = (node.params ?? {}) as any;
    const prec = params.precision ?? params.decimals ?? params.scale;
    if (typeof prec === "number" && prec >= 0) {
      fieldProps.precision = prec;
      fieldProps.step = Number((1 / Math.pow(10, prec)).toFixed(prec));
    }
  }
}
