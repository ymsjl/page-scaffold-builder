import { z } from 'zod';

export const SchemaFieldSchema = z.object({
  id: z.string(),
  key: z.string(),
  title: z.string().optional(),
  valueType: z.string(),
  isNullable: z.boolean().optional(),
  isUnique: z.boolean().optional(),
  isFilterable: z.boolean().optional(),
  isAutoGenerate: z.boolean().optional(),
  description: z.string().optional(),
  defaultValue: z.any().optional(),
  extra: z.record(z.string(), z.any()).optional(),
});

export type SchemaField = z.infer<typeof SchemaFieldSchema>;

export const EntityModelSchema = z
  .object({
    id: z.string(),
    name: z.string().min(1, 'Name is required'),
    title: z.string().min(1, 'Title is required'),
    fields: z.array(SchemaFieldSchema),
    primaryKey: z.string().optional(),
  })
  .strict()
  .superRefine((val, ctx) => {
    const ids = val.fields.map((f: any) => f.id);
    if (!ids.includes(val.primaryKey)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'primaryKey must be one of field ids',
      });
    }
    const dup = ids.find((id: string, i: number) => ids.indexOf(id) !== i);
    if (dup) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Duplicate field id: ${dup}`,
      });
    }
  });

export type EntityModel = z.infer<typeof EntityModelSchema>;

export const PropAttributeSchema = z.object({
  name: z.string(),
  label: z.string(),
  group: z.string().optional(),
  // `reactNode` and `reactNodeArray` represent props that accept React component references
  type: z.enum([
    'string',
    'number',
    'boolean',
    'enum',
    'date',
    'object',
    'array',
    'schema',
    'reactNode',
    'reactNodeArray',
  ]),
  // For reactNode/reactNodeArray types, specify which component types can be dropped
  acceptTypes: z.array(z.string()).optional(),
  // Optional UI hint for property panel rendering
  valueType: z.string().optional(),
  options: z.array(z.object({ label: z.string(), value: z.any() })).optional(),
  defaultValue: z.any().optional(),
  required: z.boolean().optional(),
  description: z.string().optional(),
  get children() {
    return z.array(PropAttributeSchema).optional();
  },
});

export type PropAttribute = z.infer<typeof PropAttributeSchema>;
