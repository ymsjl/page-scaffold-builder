import { RuleNode, RuleNodeType } from "../RuleParamsDateSchema";
import { normalizeType } from "./utils";
import type { AntdRule, RuleNodeStrategy } from "./types";

export class RuleNodeContext {
  private registry: Record<RuleNodeType, RuleNodeStrategy>;

  constructor(registry: Record<RuleNodeType, RuleNodeStrategy>) {
    this.registry = registry;
  }

  getStrategy(type: RuleNodeType): RuleNodeStrategy {
    return this.registry[type];
  }

  getStrategyOrThrow(type: RuleNodeType): RuleNodeStrategy {
    const strategy = this.registry[type];
    if (!strategy) {
      throw new Error(`Unsupported RuleNodeType: ${type}`);
    }
    return strategy;
  }

  getStrategyForNode(node: RuleNode): RuleNodeStrategy | null {
    const normalizedType = normalizeType(node);
    if (normalizedType === null) return null;
    return this.registry[normalizedType] ?? null;
  }

  getStrategyForNodeOrThrow(node: RuleNode): RuleNodeStrategy {
    const normalizedType = normalizeType(node);
    if (normalizedType === null) {
      throw new Error("Unsupported RuleNodeType");
    }
    return this.getStrategyOrThrow(normalizedType);
  }

  toRule(node: RuleNode, message: string): AntdRule | null {
    const strategy = this.getStrategyForNodeOrThrow(node);
    return strategy.toRule(node, message);
  }

  applyFieldProps(node: RuleNode, fieldProps: Record<string, any>): void {
    const strategy = this.getStrategyForNodeOrThrow(node);
    strategy.applyFieldProps(node, fieldProps);
  }
}
