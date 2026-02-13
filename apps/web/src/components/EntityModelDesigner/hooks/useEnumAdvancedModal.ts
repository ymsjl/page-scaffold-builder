import { useCallback, useMemo, useState } from "react";
import type { FormInstance } from "antd";
import { message } from "antd";

import type { EntityModel, SchemaField } from "@/types";
import { componentTreeActions } from "@/store/componentTree/componentTreeSlice";

import type { EnumOption } from "../entityModelDesignerTypes";
import {
  buildEnumExtraFromOptions,
  parseEnumOptionsFromExtra,
} from "../entityModelDesignerUtils";

export function useEnumAdvancedModal(params: {
  form: FormInstance<EntityModel>;
  entityModelId: string | null | undefined;
  dispatch: (action: any) => void;
}) {
  const { form, entityModelId, dispatch } = params;
  const [isOpen, setIsOpen] = useState(false);
  const [fieldId, setFieldId] = useState<string | null>(null);
  const [enumOptions, setEnumOptions] = useState<EnumOption[]>([]);

  const editableKeys = useMemo<React.Key[]>(
    () => enumOptions.map((opt) => opt.id),
    [enumOptions],
  );

  const close = useCallback(() => {
    setIsOpen(false);
    setFieldId(null);
    setEnumOptions([]);
  }, []);

  const openForField = useCallback((field: SchemaField) => {
    if (String(field.valueType) !== "enum") {
      message.info("当前仅支持 enum 类型的高级设置");
      return;
    }
    const initialOptions = parseEnumOptionsFromExtra(
      field.extra?.options,
      String(field.id),
    );
    setEnumOptions(initialOptions);
    setFieldId(String(field.id));
    setIsOpen(true);
  }, []);

  const save = useCallback(() => {
    if (!fieldId) return;
    const fields = (form.getFieldValue("fields") as SchemaField[]) || [];
    const nextExtra = buildEnumExtraFromOptions(enumOptions);
    const nextFields = fields.map((field) =>
      field.id === String(fieldId)
        ? {
            ...field,
            extra: nextExtra,
          }
        : field,
    );

    form.setFieldValue("fields", nextFields);

    if (entityModelId) {
      dispatch(
        componentTreeActions.updateEntityFieldExtra({
          entityModelId,
          fieldId: String(fieldId),
          extra: nextExtra,
        }),
      );
    }

    message.success("已更新枚举配置");
    close();
  }, [close, dispatch, entityModelId, enumOptions, fieldId, form]);

  return {
    isOpen,
    fieldId,
    enumOptions,
    setEnumOptions,
    editableKeys,
    openForField,
    close,
    save,
  };
}
