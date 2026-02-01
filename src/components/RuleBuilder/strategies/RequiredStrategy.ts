import { RuleNode, RuleNodeType } from "../RuleParamsDateSchema";
import { BaseStrategy } from "./BaseStrategy";
import type { AntdRule } from "./types";

export class RequiredStrategy extends BaseStrategy {
  constructor() {
    super(RuleNodeType.Required);
  }

  buildDefaultMessage(_node: Pick<RuleNode, "type" | "params">): string {
    return "此字段为必填项";
  }

  toRule(_node: RuleNode, message: string): AntdRule {
    return { required: true, message } as AntdRule;
  }

  applyFieldProps(_node: RuleNode, _fieldProps: Record<string, any>): void {
    return undefined;
  }
}
