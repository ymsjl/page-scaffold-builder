import z from 'zod';

export enum RuleNodeType {
  Required = 0, // required
  TextLength = 1, // 文本长度
  TextRegexPattern = 2, // 正则表达式
  NumericRange = 3, // 数值范围
  Decimal = 4, // 浮点数，保留小数位数
  DateRange = 5, // 日期范围
  DateRangeSpan = 6,
}

export const RuleTemplateSchema = z.object({
  type: z.enum(RuleNodeType),
  name: z.string(),
  description: z.string().optional(),
  defaultParams: z.record(z.string(), z.any()).optional(),
  applicableTo: z.array(z.string()),
});

/** @description 规则模板的类型定义 */
export type RuleTemplate = z.infer<typeof RuleTemplateSchema>;

export const RuleParamsOperatorSchema = z.enum(['eq', 'gte', 'lte', 'between']);
export type RuleParamsOperator = z.infer<typeof RuleParamsOperatorSchema>;

// 用来表示规则节点中，文本长度类型参数的结构
export const RuleParamsOfTextLengthSchema = z.object({
  len: z.int().optional(),
  min: z.int().optional(),
  max: z.int().optional(),
  operator: RuleParamsOperatorSchema.optional(),
});
export type RuleParamsOfTextLength = z.infer<typeof RuleParamsOfTextLengthSchema>;

// 用来表示规则节点中，正则表达式类型参数的结构
export const RuleParamsOfPatternSchema = z.object({
  pattern: z.string(),
});
export type RuleParamsOfPattern = z.infer<typeof RuleParamsOfPatternSchema>;

// 用来表示规则节点中，数字范围类型参数的结构
export const RuleParamsOfNumericRangeSchema = z.object({
  min: z.number().optional(),
  max: z.number().optional(),
  operator: RuleParamsOperatorSchema.optional(),
});
export type RuleParamsOfNumericRange = z.infer<typeof RuleParamsOfNumericRangeSchema>;

// 用来表示规则节点中，小数位数类型参数的结构
export const RuleParamsOfDecimalSchema = z.object({
  precision: z.int().optional(),
  decimals: z.int().optional(),
  scale: z.int().optional(),
});
export type RuleParamsOfDecimal = z.infer<typeof RuleParamsOfDecimalSchema>;

// 用来表示规则节点中，日期范围类型参数的结构
// 可以是绝对日期字符串，或者相对日期对象，
// 绝对日期的值是字符串格式的日期，例如 "2024-01-01"；
// 相对日期的值是一个对象，包含预设的相对日期类型（如 "today"、"lastDayOfMonth"、"lastDayOfYear"）和一个整数偏移量（以天为单位）。
export const RuleParamsAbsoluteDateSchema = z.string();

export enum RelativeDatePresets {
  Today = 'Today',
  LastDayOfMonth = 'LastDayOfMonth',
  LastDayOfYear = 'LastDayOfYear',
}

export const RuleParamsRelativeDateSchema = z.object({
  preset: z.enum(RelativeDatePresets).default(RelativeDatePresets.Today),
  offset: z.int(),
});

export const RuleParamsDateSchema = z.union([
  RuleParamsAbsoluteDateSchema,
  RuleParamsRelativeDateSchema,
]);

export type RuleParamsDate = z.infer<typeof RuleParamsDateSchema>;

export const DateRangeParamsSchema = z.object({
  minDate: RuleParamsDateSchema.optional(),
  maxDate: RuleParamsDateSchema.optional(),
  operator: RuleParamsOperatorSchema.optional(),
});

// 代表日期范围规则的参数结构
export const DateRangeSpanParamsSchema = z.object({
  minSpan: z.number().optional(),
  maxSpan: z.number().optional(),
  operator: RuleParamsOperatorSchema.optional(),
});
export type DateRangeParams = z.infer<typeof DateRangeParamsSchema>;

export const RuleNodeParamsSchema = z.object({
  operator: RuleParamsOperatorSchema.optional(),
});

export type RuleNodeParams = z.infer<typeof RuleNodeParamsSchema>;

export const RuleNodeSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(RuleNodeType),
  enabled: z.boolean().default(true),
  params: z.record(z.string(), z.any()).default({}),
  message: z.string().default(''),
});

export type RuleNode = z.infer<typeof RuleNodeSchema>;
