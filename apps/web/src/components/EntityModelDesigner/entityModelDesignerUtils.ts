import type { SchemaField } from "@/types";

import type { EnumOption } from "./entityModelDesignerTypes";

export const FIELD_VALUE_TYPE_ENUM = {
  text: { text: "text" },
  number: { text: "number" },
  money: { text: "money" },
  boolean: { text: "boolean" },
  enum: { text: "enum" },
  date: { text: "date" },
  datetime: { text: "datetime" },
} satisfies Record<string, { text: string }>;

export const makeRandomId = (prefix: string) =>
  `${prefix}_${Math.random().toString(36).slice(2, 9)}`;

export const createNewFieldDraft = (): SchemaField => ({
  id: makeRandomId("field"),
  key: "",
  title: "",
  valueType: "text",
  isNullable: false,
  isUnique: false,
  isFilterable: true,
  isAutoGenerate: false,
  description: "",
  defaultValue: undefined,
  extra: {},
});

export const parseEnumOptionsFromExtra = (
  fieldExtraOptions: unknown,
  fieldId: string,
): EnumOption[] => {
  if (!Array.isArray(fieldExtraOptions)) return [];
  return fieldExtraOptions
    .filter((opt) => opt && typeof opt === "object")
    .map((opt, index) => ({
      id: `enum_${fieldId}_${index}`,
      label: String((opt as any).label ?? ""),
      value: String((opt as any).value ?? ""),
    }));
};

export const buildEnumExtraFromOptions = (enumOptions: EnumOption[]) => ({
  options: enumOptions
    .filter(
      (opt) =>
        String(opt.label).trim() !== "" && String(opt.value).trim() !== "",
    )
    .map(({ label, value }) => ({ label, value })),
});
