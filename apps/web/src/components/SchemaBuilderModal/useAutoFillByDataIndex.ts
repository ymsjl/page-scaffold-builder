import { useMemo, useRef, useEffect } from "react";
import { Form, FormInstance } from "antd";
import type { SchemaField, ProCommonColumn } from "@/types";
import { createProCommonColumnFromSchemeField } from "./createProCommonColumnFromSchemeField";

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
