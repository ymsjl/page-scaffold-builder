import type { NodeStrategy } from "./NodeStrategy";
import { HttpRequestNodeStrategy } from "./HttpRequestNodeStrategy";
import { NavigateNodeStrategy } from "./NavigateNodeStrategy";
import { ShowMessageNodeStrategy } from "./ShowMessageNodeStrategy";
import { DelayNodeStrategy } from "./DelayNodeStrategy";
import { SetVariableNodeStrategy } from "./SetVariableNodeStrategy";

/**
 * 节点策略注册表
 *
 * 管理所有可用的节点策略
 */
export class NodeStrategyRegistry {
  private strategies: Map<string, NodeStrategy> = new Map();

  constructor() {
    this.registerDefaultStrategies();
  }

  /**
   * 注册默认策略
   */
  private registerDefaultStrategies(): void {
    // 内置 Actions
    this.register(new HttpRequestNodeStrategy());
    this.register(new SetVariableNodeStrategy());
    this.register(new NavigateNodeStrategy());
    this.register(new ShowMessageNodeStrategy());
    this.register(new DelayNodeStrategy());

    // 后续可以添加更多策略
    // this.register(new TableRefreshNodeStrategy());
    // this.register(new FormSubmitNodeStrategy());
  }

  /**
   * 注册策略
   */
  register(strategy: NodeStrategy): void {
    if (this.strategies.has(strategy.type)) {
      console.warn(
        `Strategy for type "${strategy.type}" already exists. Overwriting.`,
      );
    }
    this.strategies.set(strategy.type, strategy);
  }

  /**
   * 获取策略
   */
  getStrategy(type: string): NodeStrategy {
    const strategy = this.strategies.get(type);
    if (!strategy) {
      throw new Error(`No strategy registered for type: ${type}`);
    }
    return strategy;
  }

  /**
   * 检查策略是否存在
   */
  hasStrategy(type: string): boolean {
    return this.strategies.has(type);
  }

  /**
   * 获取所有已注册的策略
   */
  getAllStrategies(): NodeStrategy[] {
    return Array.from(this.strategies.values());
  }

  /**
   * 获取所有策略类型
   */
  getAllTypes(): string[] {
    return Array.from(this.strategies.keys());
  }

  /**
   * 按分类获取策略
   */
  getStrategiesByCategory(
    category: "control" | "data" | "action" | "component",
  ): NodeStrategy[] {
    return this.getAllStrategies().filter((s) => s.category === category);
  }
}

// 导出单例实例
export const nodeStrategyRegistry = new NodeStrategyRegistry();
