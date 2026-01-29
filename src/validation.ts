import { z } from 'zod';

export const SchemaFieldSchema = z.object({
  id: z.string(),
  key: z.string(),
  title: z.string().optional(),
  valueType: z.string(),
  required: z.boolean().optional(),
  isUnique: z.boolean().optional(),
  isFilterable: z.boolean().optional(),
  isAutoGenerate: z.boolean().optional(),
  description: z.string().optional(),
  defaultValue: z.unknown().optional(),
  extra: z.record(z.string(), z.unknown()).optional(),
});

export type SchemaField = z.infer<typeof SchemaFieldSchema>;

export const EntityTypeSchema = z
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
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'primaryKey must be one of field ids' });
    }
    const dup = ids.find((id: string, i: number) => ids.indexOf(id) !== i);
    if (dup) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Duplicate field id: ${dup}` });
    }
  });

export type EntityType = z.infer<typeof EntityTypeSchema>;

export const PropAttributeSchema = z.object({
  name: z.string(),
  label: z.string(),
  group: z.string().optional(),
  type: z.enum(['string', 'number', 'boolean', 'select', 'date', 'object', 'array', 'schema']),
  options: z.array(z.object({ name: z.string(), value: z.any() })).optional(),
  defaultValue: z.any().optional(),
  required: z.boolean().optional(),
  description: z.string().optional(),
  get children() {
    return z.array(PropAttributeSchema).optional();
  }
});

export type PropAttribute = z.infer<typeof PropAttributeSchema>;
