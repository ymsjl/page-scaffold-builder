import type React from "react";
import type { AntdRule, RuleEditorProps, RuleNodeStrategy } from "./types";
import { RuleNode, RuleNodeType } from "../RuleParamsDateSchema";

export abstract class BaseStrategy implements RuleNodeStrategy {
  type: RuleNodeType;
  Editor: React.FC<RuleEditorProps> | null = null;

  protected constructor(type: RuleNodeType) {
    this.type = type;
  }

  abstract buildDefaultMessage(node: Pick<RuleNode, "type" | "params">): string;
  abstract toRule(node: RuleNode, message: string): AntdRule | null;
  abstract applyFieldProps(node: RuleNode, fieldProps: Record<string, any>): void;
}
