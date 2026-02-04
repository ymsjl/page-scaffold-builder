import { z } from "zod";

// ============================================
// 端口系统（数据流）
// ============================================

/** 端口类型枚举 */
export const PortTypeSchema = z.enum([
  "exec",        // 执行流（控制流）
  "any",         // 任意数据
  "string",
  "number",
  "boolean",
  "object",
  "array",
  "httpResponse", // HTTP 响应
  "formData",     // 表单数据
]);
export type PortType = z.infer<typeof PortTypeSchema>;

/** 端口定义 */
export const PortSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: PortTypeSchema,
  /** 是否必需连接 */
  required: z.boolean().default(false),
  /** 默认值（未连接时） */
  defaultValue: z.any().optional(),
});
export type Port = z.infer<typeof PortSchema>;

// ============================================
// Action Node（图节点）
// ============================================

/** Action 节点基础定义 */
export const ActionNodeBaseSchema = z.object({
  id: z.string(),
  /** 节点类型（对应策略） */
  type: z.string(),
  /** 显示名称 */
  label: z.string(),
  /** 节点参数配置 */
  params: z.any().default({}),
  
  // ==== 可视化相关 ====
  /** 节点在画布上的位置 */
  position: z.object({
    x: z.number().default(0),
    y: z.number().default(0),
  }).optional(),
  
  /** UI 样式（颜色、图标等） */
  style: z.any().optional(),
  
  // ==== 端口定义 ====
  /** 输入端口 */
  inputs: z.array(PortSchema).default([]),
  /** 输出端口 */
  outputs: z.array(PortSchema).default([]),
  
  // ==== 元数据 ====
  /** 节点描述 */
  description: z.string().optional(),
  /** 是否禁用 */
  disabled: z.boolean().default(false),
});
export type ActionNodeBase = z.infer<typeof ActionNodeBaseSchema>;

// ============================================
// Action Edge（图边/连接）
// ============================================

/** 边连接定义 */
export const ActionEdgeSchema = z.object({
  id: z.string(),
  /** 源节点 ID */
  source: z.string(),
  /** 源端口 ID */
  sourcePort: z.string().optional(),
  /** React Flow 源 Handle ID */
  sourceHandle: z.string().optional(),
  /** 目标节点 ID */
  target: z.string(),
  /** 目标端口 ID */
  targetPort: z.string().optional(),
  /** React Flow 目标 Handle ID */
  targetHandle: z.string().optional(),
  
  // ==== 条件执行 ====
  /** 条件表达式（可选，用于条件分支） */
  condition: z.string().optional(),
  
  // ==== 可视化相关 ====
  /** 边的样式 */
  style: z.any().optional(),
  /** 边的标签 */
  label: z.string().optional(),
  /** 是否显示动画 */
  animated: z.boolean().optional(),
});
export type ActionEdge = z.infer<typeof ActionEdgeSchema>;

// ============================================
// Action Flow（完整流程）
// ============================================

/** Action 流程图定义 */
export const ActionFlowSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  
  /** 所有节点 */
  nodes: z.array(ActionNodeBaseSchema).default([]),
  /** 所有边 */
  edges: z.array(ActionEdgeSchema).default([]),
  
  /** 入口节点 ID */
  entryNodeId: z.string().optional(),
  
  /** 流程变量（初始上下文） */
  variables: z.any().optional(),
  
  /** 创建/更新时间 */
  createdAt: z.number().optional(),
  updatedAt: z.number().optional(),
});
export type ActionFlow = z.infer<typeof ActionFlowSchema>;

// ============================================
// 执行上下文（运行时）
// ============================================

/** 节点执行结果 */
export const NodeExecutionResultSchema = z.object({
  nodeId: z.string(),
  success: z.boolean(),
  /** 输出数据（按端口 ID 索引） */
  outputs: z.any(),
  error: z.string().optional(),
  /** 执行耗时 (ms) */
  duration: z.number().optional(),
});
export type NodeExecutionResult = z.infer<typeof NodeExecutionResultSchema>;

/** Flow 执行上下文 */
export const FlowExecutionContextSchema = z.object({
  flowId: z.string(),
  /** 组件上下文（触发来源） */
  componentId: z.string().optional(),
  componentProps: z.any().optional(),
  
  /** 全局服务访问 */
  services: z.object({
    store: z.any().optional(),      // Redux store
    router: z.any().optional(),     // 路由
    message: z.any().optional(),    // 消息服务
  }).optional(),
  
  /** 流程变量（动态） */
  variables: z.any().default({}),
  
  /** 已执行节点的输出缓存 */
  nodeOutputs: z.any().default({}),
  
  /** 触发事件数据 */
  eventData: z.any().optional(),
});
export type FlowExecutionContext = z.infer<typeof FlowExecutionContextSchema>;
