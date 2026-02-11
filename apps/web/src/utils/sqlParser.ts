import { Parser } from "node-sql-parser";

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

const asRecord = (value: unknown): Record<string, unknown> | null => {
  if (!value || typeof value !== "object") return null;
  return value as Record<string, unknown>;
};

const normalizeIdentifier = (value: unknown): string => {
  if (Array.isArray(value)) {
    const first = value[0];
    const record = asRecord(first);
    const tableName = record?.table || record?.name || record?.value;
    if (typeof tableName === "string") return tableName;
  }
  if (typeof value === "string") return value;
  const record = asRecord(value);
  const name = record?.value || record?.name || record?.column || record?.table;
  if (typeof name === "string") return name;
  return "";
};

const normalizeDataType = (value: unknown): string => {
  if (typeof value === "string") return value;
  const record = asRecord(value);
  const name = record?.dataType || record?.data_type || record?.type;
  if (typeof name === "string") return name;
  return "unknown";
};

const extractLiteralValue = (value: unknown): string | undefined => {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  const record = asRecord(value);
  if (!record) return undefined;
  const inner = record.value;
  if (typeof inner === "string" || typeof inner === "number") {
    return String(inner);
  }
  return undefined;
};

const extractDefaultValue = (value: unknown): string | undefined => {
  const record = asRecord(value);
  if (!record) return undefined;
  const defaultValue =
    record.default ??
    record.default_val ??
    record.default_value ??
    record.value;
  return extractLiteralValue(defaultValue);
};

const isNullable = (definition: Record<string, unknown>): boolean => {
  const nullable = definition.nullable;
  if (typeof nullable === "boolean") return nullable;
  const constraints = definition.constraints;
  if (Array.isArray(constraints)) {
    return !constraints.some((item) =>
      String((item as Record<string, unknown>)?.type).toLowerCase() ===
      "not null",
    );
  }
  return true;
};

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
    const normalizedType = normalizeDataType(dataType);

    fields.push({
      name: columnName,
      type: normalizedType,
      nullable: isNullable(definitionRecord),
      defaultValue: extractDefaultValue(definitionRecord),
      comment:
        typeof definitionRecord.comment === "string"
          ? definitionRecord.comment
          : undefined,
    });
  });
  return fields;
};

export const parseSqlToEntityModel = async (sql: string): Promise<{
  model: ParsedSqlModel;
  warnings: string[];
}> => {
  const parser = new Parser();
  const ast = parser.astify(sql, { database: "MySQL" });
  const statements = Array.isArray(ast) ? ast : [ast];

  const warnings: string[] = [];
  const createStatements = statements.reduce<Record<string, unknown>[]>(
    (acc, statement) => {
      const record = asRecord(statement);
      if (record?.type === "create") {
        acc.push(record);
      }
      return acc;
    },
    [],
  );

  if (createStatements.length === 0) {
    throw new Error("No CREATE TABLE statement found");
  }

  if (createStatements.length > 1) {
    warnings.push("Multiple CREATE TABLE statements detected; using the first.");
  }

  const first = createStatements[0];

  const tableName = normalizeIdentifier(first.table || first.name || "");
  if (!tableName) {
    throw new Error("Unable to determine table name");
  }
  const definitions = Array.isArray(first.create_definitions)
    ? first.create_definitions
    : [];
  const fields = extractFields(definitions);

  if (fields.length === 0) {
    warnings.push("No columns were detected from the SQL input.");
  }

  return {
    model: {
      name: tableName,
      fields,
    },
    warnings,
  };
};
