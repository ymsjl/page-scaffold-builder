import type { ActionNodeBase, FlowExecutionContext, Port } from "@/types/actions";

/**
 * 节点策略接口
 * 
 * 每个节点类型对应一个策略实现
 */
export interface NodeStrategy {
  /** 节点类型（唯一标识） */
  type: string;
  
  /** 节点显示名称 */
  label: string;
  
  /** 节点描述 */
  description?: string;
  
  /** 节点图标（Ant Design 图标名称） */
  icon?: string;
  
  /** 节点分类 */
  category?: "control" | "data" | "action" | "component";
  
  /** 
   * 执行节点逻辑
   * @param node 节点定义
   * @param inputs 输入数据（来自上游节点）
   * @param context 执行上下文
   * @returns 输出数据（按端口 ID 索引）
   */
  execute(
    node: ActionNodeBase,
    inputs: Record<string, any>,
    context: FlowExecutionContext
  ): Promise<Record<string, any>>;
  
  /**
   * 获取节点的输入端口定义
   * 可以根据节点配置动态生成
   */
  getInputPorts(node: ActionNodeBase): Port[];
  
  /**
   * 获取节点的输出端口定义
   * 可以根据节点配置动态生成
   */
  getOutputPorts(node: ActionNodeBase): Port[];
  
  /**
   * 验证节点配置
   * @returns 验证结果，包含是否有效和错误信息
   */
  validate?(node: ActionNodeBase): { valid: boolean; errors?: string[] };
  
  /**
   * 获取节点默认参数
   */
  getDefaultParams?(): Record<string, any>;
}
