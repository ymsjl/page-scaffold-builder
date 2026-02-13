import type { ProCommonColumn, SchemaField } from "@/types";
import type { ProValueEnum } from "../ColumnSchemaEditorProps";
import { VALUE_TYPE_ENUM_MAP } from "./constants";
import { getRecommendedWidth } from "./getRecommendedWidth";

export const createProCommonColumnFromSchemeField = (
  field?: SchemaField,
): Omit<ProCommonColumn, "key"> & { key?: string } => {
  const valueType = field?.valueType || "text";
  const result: Omit<ProCommonColumn, "key"> & { dataIndex?: string } = {
    title: field?.title ?? "",
    dataIndex: field?.key ?? "",
    valueType: VALUE_TYPE_ENUM_MAP[valueType] || valueType,
    width: getRecommendedWidth(valueType) ?? 120,
    hideInSearch: field ? !field?.isFilterable : false,
    formItemProps: {
      name: field?.key ?? "",
      label: field?.title ?? "",
    },
  };

  if (!field) return result;

  if (field.valueType === "enum") {
    if (field.extra?.options && Array.isArray(field.extra?.options)) {
      result.valueEnum = field.extra.options.reduce(
        (acc: ProValueEnum, option: any) => {
          const key = String(option.value ?? option.id);
          acc[key] = {
            text: option.label ?? String(option.value ?? option.id),
            status: option.status,
            color: option.color,
          };
          return acc;
        },
        {} as ProValueEnum,
      );
    }
  }

  return result;
};
