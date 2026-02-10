import { RuleNodeSchema } from "@/components/RuleBuilder/RuleParamsDateSchema";
import { ProSchema, ProTableProps } from "@ant-design/pro-components";
import { z } from "zod";

export const ProValueEnumSchema = z.object({
  text: z.string(),
  status: z.string().optional(),
  color: z.string().optional(),
});
export type ProValueEnum = z.infer<typeof ProValueEnumSchema>;

export const FormItemPropsSchema = z.object({
  name: z.string().optional(),
  label: z.string().optional(),
  rules: z.any().optional(),
});
export type FormItemPropsZ = z.infer<typeof FormItemPropsSchema>;

export const ProCommonColumnSchema = z.object({
  title: z.string(),
  dataIndex: z.string(),
  key: z.string(),
  valueType: z.string().optional(),
  type: z.string().optional(),
  width: z.number().int().nonnegative().optional(),
  hideInSearch: z.boolean().optional(),
  hideInTable: z.boolean().optional(),
  ruleNodes: z.array(RuleNodeSchema).optional(),
  valueEnum: z.record(z.string(), ProValueEnumSchema).optional(),
  formItemProps: FormItemPropsSchema.optional(),
  fieldProps: z.any().optional(),
});
export type ProCommonColumn = z.infer<typeof ProCommonColumnSchema> &
  Pick<ProSchema<Record<string, any>, string>, "render">;

export type ColumnSchema = ProCommonColumn;
