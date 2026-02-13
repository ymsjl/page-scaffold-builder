/**
 * Action Flow 类型定义
 *
 * 仅导出类型，不导出实现
 */

// 核心类型
export type {
  PortType,
  Port,
  ActionNodeBase,
  ActionNodeBase as ActionNode, // 别名导出
  ActionEdge,
  ActionFlow,
  NodeExecutionResult,
  FlowExecutionContext,
} from "./ActionFlowTypes";

// Schema（用于运行时验证）
export {
  PortTypeSchema,
  PortSchema,
  ActionNodeBaseSchema,
  ActionEdgeSchema,
  ActionFlowSchema,
  NodeExecutionResultSchema,
  FlowExecutionContextSchema,
} from "./ActionFlowTypes";

// 节点类型
export type {
  NodeType,
  ActionNodeType,
  NodeParams,
  StartNodeParams,
  ConditionNodeParams,
  LoopNodeParams,
  TransformNodeParams,
  SetVariableNodeParams,
  HttpRequestNodeParams,
  NavigateNodeParams,
  ShowMessageNodeParams,
  DelayNodeParams,
  TableRefreshNodeParams,
  TableSetSelectedRowsNodeParams,
  FormSubmitNodeParams,
  FormResetNodeParams,
  FormSetFieldValueNodeParams,
  FormSetFieldsValueNodeParams,
} from "./NodeTypes";

export { NODE_TYPE_SCHEMAS } from "./NodeTypes";

// Node Params Schemas
export {
  StartNodeParamsSchema,
  ConditionNodeParamsSchema,
  LoopNodeParamsSchema,
  TransformNodeParamsSchema,
  SetVariableNodeParamsSchema,
  HttpRequestNodeParamsSchema,
  NavigateNodeParamsSchema,
  ShowMessageNodeParamsSchema,
  DelayNodeParamsSchema,
  TableRefreshNodeParamsSchema,
  TableSetSelectedRowsNodeParamsSchema,
  FormSubmitNodeParamsSchema,
  FormResetNodeParamsSchema,
  FormSetFieldValueNodeParamsSchema,
  FormSetFieldsValueNodeParamsSchema,
} from "./NodeTypes";
