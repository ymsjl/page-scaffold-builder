import z from 'zod/v4/classic/external.cjs';

export const RuleTemplateSchema = z.object({
  type: z.string(),
  name: z.string(),
  description: z.string().optional(),
  defaultParams: z.record(z.string(), z.any()).optional(),
  applicableTo: z.array(z.string()),
});

export type RuleTemplate = z.infer<typeof RuleTemplateSchema>;

// 用来表示规则节点中，日期类型参数的结构，可以是绝对日期字符串，或者相对日期对象，
// 绝对日期的值是字符串格式的日期，例如 "2024-01-01"；
// 相对日期的值是一个对象，包含预设的相对日期类型（如 "today"、"yesterday"、"tomorrow"）和一个整数偏移量（以天为单位）。
export const RuleParamsDateSchema = z.object({
  value: z.union([
    z.string(),
    z.object({
      preset: z.enum(['today', 'yesterday', 'tomorrow']),
      offset: z.int(),
    })
  ]),
  type: z.enum(['absolute', 'relative']),
});

export type RuleParamsDate = z.infer<typeof RuleParamsDateSchema>;

export const RuleParamsOperatorSchema = z.enum(['eq', 'gte', 'lte', 'between']);

export type RuleParamsOperator = z.infer<typeof RuleParamsOperatorSchema>;

export const DateRangeParamsSchema = z.object({
  minDate: RuleParamsDateSchema.optional(),
  maxDate: RuleParamsDateSchema.optional(),
  operator: RuleParamsOperatorSchema.optional(),
});

export type DateRangeParams = z.infer<typeof DateRangeParamsSchema>;

export const DateRangeSpanParamsSchema = z.object({
  minSpan: z.number().optional(),
  maxSpan: z.number().optional(),
  operator: RuleParamsOperatorSchema.optional(),
});