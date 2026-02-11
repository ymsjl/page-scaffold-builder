import { useMemo, useRef, useEffect } from "react";
import { Form, FormInstance } from "antd";
import { getRecommendedWidth } from "./getRecommendedWidth";
import type { ProValueEnum } from "../ColumnSchemaEditorProps";
import type { SchemaField, ProCommonColumn } from "@/types";
import { VALUE_TYPE_ENUM_MAP } from "./constants";

export const createProCommonColumnFromSchemeField = (
  field?: SchemaField,
): Omit<ProCommonColumn, "key"> & { key?: string } => {
  const valueType = field?.valueType || "text";
  const result: Omit<ProCommonColumn, "key"> & { dataIndex?: string } = {
    title: field?.title ?? "",
    dataIndex: field?.key ?? "",
    valueType: VALUE_TYPE_ENUM_MAP[valueType] || valueType,
    // width: getRecommendedWidth(valueType),
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

export const useAutoFillByDataIndex = (
  form: FormInstance<
    Pick<
      ProCommonColumn,
      "title" | "dataIndex" | "valueType" | "width" | "hideInSearch" | "formItemProps"
    >
  >,
  entityFields: SchemaField[],
  initialDataIndex?: string,
) => {
  const prevDataIndexRef = useRef<string>();
  const dataIndexValue = Form.useWatch("dataIndex", form);
  const entityFieldMap = useMemo(() => {
    const arr = (entityFields || []).map(
      (f) => [f.key, f] as [string, SchemaField],
    );
    return new Map<string, SchemaField>(arr);
  }, [entityFields]);

  useEffect(() => {
    if (dataIndexValue !== prevDataIndexRef.current) {
      const prevDataIndex = prevDataIndexRef.current;
      prevDataIndexRef.current = dataIndexValue;

      // 表单的值被初始化时，不自动填充,避免覆盖已有值
      if ((prevDataIndex === undefined) && (initialDataIndex === dataIndexValue)) return;

      // 根据 dataIndex 在实体字段中查找匹配项
      const matchedField = entityFieldMap.get(dataIndexValue);
      if (dataIndexValue !== "" && !matchedField) return;
      const formItemProps = form.getFieldValue("formItemProps") || {};
      const nextColumn = createProCommonColumnFromSchemeField(matchedField);
      form.setFieldsValue({
        ...nextColumn,
        formItemProps: {
          ...(nextColumn.formItemProps ?? {}),
          ...formItemProps,
        },
      });
    }
  }, [dataIndexValue, entityFieldMap, form, initialDataIndex]);
};
