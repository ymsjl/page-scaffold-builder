import { Parser } from 'node-sql-parser';

type AnyRecord = Record<string, unknown>;

export type ParsedSqlField = {
  name: string;
  type: string;
  nullable: boolean;
  defaultValue?: string;
  comment?: string;
};

export type ParsedSqlModel = {
  name: string;
  fields: ParsedSqlField[];
};

const asRecord = (value: unknown): AnyRecord | null => {
  if (!value || typeof value !== 'object') return null;
  return value as AnyRecord;
};

const firstString = (...values: unknown[]): string | undefined => {
  return values.find((value): value is string => typeof value === 'string' && value.trim());
};

const normalizeIdentifier = (value: unknown): string => {
  if (Array.isArray(value)) {
    const first = value[0];
    const record = asRecord(first);
    const tableName = firstString(record?.table, record?.name, record?.value);
    if (tableName) return tableName;
  }
  if (typeof value === 'string') return value;
  const record = asRecord(value);
  return firstString(record?.value, record?.name, record?.column, record?.table) || '';
};

const normalizeDataType = (value: unknown): string => {
  if (typeof value === 'string') return value;
  const record = asRecord(value);
  const name = firstString(record?.dataType, record?.data_type, record?.type);
  return name || 'unknown';
};

const extractLiteralValue = (value: unknown): string | undefined => {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  const record = asRecord(value);
  if (!record) return undefined;
  const inner = record.value;
  if (typeof inner === 'string' || typeof inner === 'number') {
    return String(inner);
  }
  return undefined;
};

const extractDefaultValue = (value: unknown): string | undefined => {
  const record = asRecord(value);
  if (!record) return undefined;
  const defaultValue = record.default ?? record.default_val ?? record.default_value ?? record.value;
  return extractLiteralValue(defaultValue);
};

const isNullable = (definition: AnyRecord): boolean => {
  const { nullable } = definition;
  if (typeof nullable === 'boolean') return nullable;
  const { constraints } = definition;
  if (!Array.isArray(constraints)) return true;
  return !constraints.some(
    (item) => String((item as AnyRecord)?.type).toLowerCase() === 'not null',
  );
};

const getTableName = (statement: AnyRecord): string =>
  normalizeIdentifier(statement.table || statement.name || '');

const getCreateDefinitions = (statement: AnyRecord): unknown[] =>
  Array.isArray(statement.create_definitions) ? statement.create_definitions : [];

const extractFields = (definitions: unknown[]): ParsedSqlField[] => {
  const fields: ParsedSqlField[] = [];
  definitions.forEach((definition) => {
    const record = asRecord(definition);
    if (!record) return;

    const column = record.column || record.name || record.field || record.resource;
    const columnName = normalizeIdentifier(column);
    if (!columnName) return;

    const definitionRecord = asRecord(record.definition) ?? record;
    const dataType =
      record.dataType ||
      record.data_type ||
      definitionRecord.dataType ||
      definitionRecord.data_type ||
      definitionRecord.type;

    fields.push({
      name: columnName,
      type: normalizeDataType(dataType),
      nullable: isNullable(definitionRecord),
      defaultValue: extractDefaultValue(definitionRecord),
      comment: typeof definitionRecord.comment === 'string' ? definitionRecord.comment : undefined,
    });
  });
  return fields;
};

const collectCreateStatements = (statements: unknown[]): AnyRecord[] =>
  statements.reduce<AnyRecord[]>((acc, statement) => {
    const record = asRecord(statement);
    if (record?.type === 'create') acc.push(record);
    return acc;
  }, []);

export const parseSqlToEntityModel = async (
  sql: string,
): Promise<{
  model: ParsedSqlModel;
  warnings: string[];
}> => {
  const parser = new Parser();
  const ast = parser.astify(sql, { database: 'MySQL' });
  const statements = Array.isArray(ast) ? ast : [ast];

  const warnings: string[] = [];
  const createStatements = collectCreateStatements(statements);

  if (createStatements.length === 0) {
    throw new Error('No CREATE TABLE statement found');
  }

  if (createStatements.length > 1) {
    warnings.push('Multiple CREATE TABLE statements detected; using the first.');
  }

  const first = createStatements[0];
  const tableName = getTableName(first);
  if (!tableName) {
    throw new Error('Unable to determine table name');
  }

  const fields = extractFields(getCreateDefinitions(first));
  if (fields.length === 0) {
    warnings.push('No columns were detected from the SQL input.');
  }

  return {
    model: {
      name: tableName,
      fields,
    },
    warnings,
  };
};
