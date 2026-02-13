import { z } from "zod";

// ============== 控制流节点 ==============

/** 开始节点 */
export const StartNodeParamsSchema = z.object({
  triggerType: z.enum(["manual", "event", "schedule"]).default("manual"),
});
export type StartNodeParams = z.infer<typeof StartNodeParamsSchema>;

/** 条件分支节点 */
export const ConditionNodeParamsSchema = z.object({
  /** 条件表达式 */
  condition: z.string(),
  /** 表达式语法类型 */
  expressionType: z.enum(["javascript", "jsonLogic"]).default("javascript"),
});
export type ConditionNodeParams = z.infer<typeof ConditionNodeParamsSchema>;

/** 循环节点 */
export const LoopNodeParamsSchema = z.object({
  loopType: z.enum(["forEach", "while", "times"]),
  /** forEach: 数组路径 */
  arrayPath: z.string().optional(),
  /** while: 条件 */
  condition: z.string().optional(),
  /** times: 次数 */
  count: z.number().optional(),
});
export type LoopNodeParams = z.infer<typeof LoopNodeParamsSchema>;

// ============== 数据处理节点 ==============

/** 数据转换节点 */
export const TransformNodeParamsSchema = z.object({
  /** 转换脚本（访问 input, 返回 output） */
  script: z.string().optional(),
  /** 转换映射配置（简单模式） */
  mapping: z.any().optional(),
});
export type TransformNodeParams = z.infer<typeof TransformNodeParamsSchema>;

/** 变量设置节点 */
export const SetVariableNodeParamsSchema = z.object({
  variableName: z.string(),
  value: z.any().optional(),
  /** 值表达式 */
  valueExpression: z.string().optional(),
});
export type SetVariableNodeParams = z.infer<typeof SetVariableNodeParamsSchema>;

// ============== 内置 Action 节点 ==============

/** HTTP 请求节点 */
export const HttpRequestNodeParamsSchema = z.object({
  url: z.string(),
  method: z.enum(["GET", "POST", "PUT", "DELETE", "PATCH"]).default("GET"),
  headers: z.any().optional(),
  body: z.any().optional(),
  timeout: z.number().optional(),
});
export type HttpRequestNodeParams = z.infer<typeof HttpRequestNodeParamsSchema>;

/** 导航节点 */
export const NavigateNodeParamsSchema = z.object({
  path: z.string(),
  query: z.any().optional(),
  openInNewTab: z.boolean().default(false),
  replace: z.boolean().default(false),
});
export type NavigateNodeParams = z.infer<typeof NavigateNodeParamsSchema>;

/** 消息提示节点 */
export const ShowMessageNodeParamsSchema = z.object({
  messageType: z.enum(["success", "error", "warning", "info"]),
  content: z.string(),
  duration: z.number().default(3000),
});
export type ShowMessageNodeParams = z.infer<typeof ShowMessageNodeParamsSchema>;

/** 延时节点 */
export const DelayNodeParamsSchema = z.object({
  duration: z.number(),
});
export type DelayNodeParams = z.infer<typeof DelayNodeParamsSchema>;

// ============== 组件特定节点 ==============

/** 表格刷新节点 */
export const TableRefreshNodeParamsSchema = z.object({
  componentId: z.string().optional(),
  resetPage: z.boolean().default(false),
  clearFilters: z.boolean().default(false),
});
export type TableRefreshNodeParams = z.infer<
  typeof TableRefreshNodeParamsSchema
>;

/** 表格设置选中行节点 */
export const TableSetSelectedRowsNodeParamsSchema = z.object({
  componentId: z.string().optional(),
  rowKeys: z.array(z.string()),
});
export type TableSetSelectedRowsNodeParams = z.infer<
  typeof TableSetSelectedRowsNodeParamsSchema
>;

/** 表单提交节点 */
export const FormSubmitNodeParamsSchema = z.object({
  componentId: z.string().optional(),
  validate: z.boolean().default(true),
  submitUrl: z.string().optional(),
  submitMethod: z.enum(["POST", "PUT", "PATCH"]).default("POST"),
});
export type FormSubmitNodeParams = z.infer<typeof FormSubmitNodeParamsSchema>;

/** 表单重置节点 */
export const FormResetNodeParamsSchema = z.object({
  componentId: z.string().optional(),
  initialValues: z.any().optional(),
});
export type FormResetNodeParams = z.infer<typeof FormResetNodeParamsSchema>;

/** 表单设置字段值节点 */
export const FormSetFieldValueNodeParamsSchema = z.object({
  componentId: z.string().optional(),
  fieldName: z.string(),
  value: z.any(),
});
export type FormSetFieldValueNodeParams = z.infer<
  typeof FormSetFieldValueNodeParamsSchema
>;

/** 表单批量设置字段值节点 */
export const FormSetFieldsValueNodeParamsSchema = z.object({
  componentId: z.string().optional(),
  values: z.any(),
});
export type FormSetFieldsValueNodeParams = z.infer<
  typeof FormSetFieldsValueNodeParamsSchema
>;

// ============== 节点注册表 ==============

export const NODE_TYPE_SCHEMAS = {
  // 控制流
  start: StartNodeParamsSchema,
  condition: ConditionNodeParamsSchema,
  loop: LoopNodeParamsSchema,

  // 数据处理
  transform: TransformNodeParamsSchema,
  setVariable: SetVariableNodeParamsSchema,
  "action.setVariable": SetVariableNodeParamsSchema,

  // 内置 Actions
  httpRequest: HttpRequestNodeParamsSchema,
  navigate: NavigateNodeParamsSchema,
  showMessage: ShowMessageNodeParamsSchema,
  delay: DelayNodeParamsSchema,

  // 组件 Actions
  "table.refresh": TableRefreshNodeParamsSchema,
  "table.setSelectedRows": TableSetSelectedRowsNodeParamsSchema,
  "form.submit": FormSubmitNodeParamsSchema,
  "form.reset": FormResetNodeParamsSchema,
  "form.setFieldValue": FormSetFieldValueNodeParamsSchema,
  "form.setFieldsValue": FormSetFieldsValueNodeParamsSchema,
} as const;

export type NodeType = keyof typeof NODE_TYPE_SCHEMAS;

/**
 * Action Node Type (完整类型字符串，用于可视化编辑器)
 */
export type ActionNodeType =
  | "control.entry"
  | "control.exit"
  | "control.condition"
  | "control.loop"
  | "control.parallel"
  | "control.delay"
  | "data.transform"
  | "data.merge"
  | "data.filter"
  | "action.httpRequest"
  | "action.setVariable"
  | "action.navigate"
  | "action.showMessage"
  | "action.confirm"
  | "component.table.refresh"
  | "component.form.submit"
  | "component.form.validate"
  | "component.form.reset"
  | "component.modal.open"
  | "component.modal.close";

/** 所有节点参数类型的联合类型 */
export type NodeParams =
  | StartNodeParams
  | ConditionNodeParams
  | LoopNodeParams
  | TransformNodeParams
  | SetVariableNodeParams
  | HttpRequestNodeParams
  | NavigateNodeParams
  | ShowMessageNodeParams
  | DelayNodeParams
  | TableRefreshNodeParams
  | TableSetSelectedRowsNodeParams
  | FormSubmitNodeParams
  | FormResetNodeParams
  | FormSetFieldValueNodeParams
  | FormSetFieldsValueNodeParams;
