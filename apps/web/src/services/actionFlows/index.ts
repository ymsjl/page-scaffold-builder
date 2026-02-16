/**
 * Action Flow 系统
 *
 * 可视化节点流程编辑器系统，支持图结构的 Action 定义和执行
 */

// Hooks
export { useFlowExecutor } from './hooks/useFlowExecutor';
export { useActionFlow } from './hooks/useActionFlow';
export { useActionFlowHandler } from './hooks/useActionFlowHandler';

// 执行引擎
export { FlowExecutor } from './core/FlowExecutor';

// 策略
export { nodeStrategyRegistry, NodeStrategyRegistry } from './strategies/NodeStrategyRegistry';
export type { NodeStrategy } from './strategies/NodeStrategy';
export { BaseNodeStrategy } from './strategies/BaseNodeStrategy';

// Redux
export { actionFlowsActions } from '@/store/actionFlows/actionFlowsSlice';
export * from '@/store/actionFlows/actionFlowsSelectors';

// 类型
export type {
  ActionFlow,
  ActionNodeBase,
  ActionEdge,
  Port,
  PortType,
  FlowExecutionContext,
  NodeExecutionResult,
} from '@/types/actions';
