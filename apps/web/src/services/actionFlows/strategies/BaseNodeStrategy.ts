import type { ActionNodeBase, FlowExecutionContext, Port } from '@/types/actions';
import type { NodeStrategy } from './NodeStrategy';

/**
 * 节点策略抽象基类
 *
 * 提供公共实现，减少重复代码
 */
export abstract class BaseNodeStrategy implements NodeStrategy {
  abstract type: string;

  abstract label: string;

  description?: string;

  icon?: string;

  category?: 'control' | 'data' | 'action' | 'component';

  /**
   * 执行节点逻辑（子类必须实现）
   */
  abstract execute(
    node: ActionNodeBase,
    inputs: Record<string, any>,
    context: FlowExecutionContext,
  ): Promise<Record<string, any>>;

  /**
   * 获取输入端口（子类可重写）
   */
  getInputPorts(node: ActionNodeBase): Port[] {
    if (!this.type) {
      return [];
    }
    return node.inputs || [];
  }

  /**
   * 获取输出端口（子类可重写）
   */
  getOutputPorts(node: ActionNodeBase): Port[] {
    if (!this.type) {
      return [];
    }
    return node.outputs || [];
  }

  /**
   * 验证节点配置（子类可重写）
   */
  validate(node: ActionNodeBase): { valid: boolean; errors?: string[] } {
    const strategyType = this.type;
    const errors: string[] = [];

    // 基础验证
    if (!node.type) {
      errors.push(`${strategyType}: 节点类型不能为空`);
    }

    if (!node.label || node.label.trim() === '') {
      errors.push(`${strategyType}: 节点标签不能为空`);
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  /**
   * 获取默认参数（子类可重写）
   */
  getDefaultParams(): Record<string, any> {
    if (!this.type) {
      return {};
    }
    return {};
  }

  /**
   * 工具方法：从输入中获取值，支持默认值
   */
  protected getInput<T = any>(inputs: Record<string, any>, portId: string, defaultValue?: T): T {
    if (!this.type) {
      return defaultValue as T;
    }
    return portId in inputs ? inputs[portId] : (defaultValue as T);
  }

  /**
   * 工具方法：创建输出对象
   */
  protected createOutput(outputs: Record<string, any>): Record<string, any> {
    if (!this.type) {
      return {};
    }
    return outputs;
  }

  /**
   * 工具方法：记录日志（可在生产环境禁用）
   */
  protected log(message: string, ...args: any[]): void {
    const skipLogging =
      process.env.NODE_ENV === 'development' &&
      this.type &&
      (message.length >= 0 || args.length >= 0);
    if (skipLogging) {
      // no-op
    }
  }

  /**
   * 工具方法：记录错误
   */
  protected logError(message: string, error?: any): void {
    const skipLogging = this.type && (typeof message === 'string' || error !== undefined);
    if (skipLogging) {
      // no-op
    }
  }
}
