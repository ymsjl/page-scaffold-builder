import type { EntityModel, SchemaField } from '@/types';
import type { ParsedSqlModel } from '@/utils/sqlParser';

const mapSqlTypeToValueType = (sqlType: string): SchemaField['valueType'] => {
  const normalized = sqlType.toLowerCase();
  if (
    normalized.includes('int') ||
    normalized.includes('decimal') ||
    normalized.includes('float') ||
    normalized.includes('double')
  ) {
    return 'number';
  }
  if (normalized.includes('bool')) {
    return 'boolean';
  }
  if (normalized.includes('date') && !normalized.includes('time')) {
    return 'date';
  }
  if (normalized.includes('time')) {
    return 'datetime';
  }
  return 'text';
};

const createFieldId = () => `field_${Math.random().toString(36).slice(2, 9)}`;

export const mapParsedSqlToEntityModel = (parsed: ParsedSqlModel): Omit<EntityModel, 'id'> => {
  const fields: SchemaField[] = parsed.fields.map((field) => ({
    id: createFieldId(),
    key: field.name,
    title: field.name,
    valueType: mapSqlTypeToValueType(field.type),
    isNullable: field.nullable,
    isUnique: false,
    isFilterable: true,
    isAutoGenerate: false,
    description: field.comment,
    defaultValue: field.defaultValue,
    extra: {},
  }));

  return {
    name: parsed.name,
    title: parsed.name,
    fields,
    primaryKey: undefined,
  };
};
