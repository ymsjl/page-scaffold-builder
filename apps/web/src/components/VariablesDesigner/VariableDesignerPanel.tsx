import React, { useCallback, useEffect } from "react";
import { Form, Input, Modal, message } from "antd";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { componentTreeActions } from "@/store/componentTree/componentTreeSlice";
import {
  selectEditingVariable,
  selectIsVariableModalOpen,
  variableSelectors,
} from "@/store/componentTree/componentTreeSelectors";
import type { PrimitiveVariableValue } from "@/types";

type VariableFormValues = {
  name: string;
  initialValue: string;
};

const parseInitialValue = (raw: string): PrimitiveVariableValue => {
  const trimmed = raw.trim();
  if (trimmed.toLowerCase() === "true") return true;
  if (trimmed.toLowerCase() === "false") return false;
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) return Number(trimmed);
  return raw;
};

const formatInitialValue = (value: PrimitiveVariableValue): string => {
  if (typeof value === "string") return value;
  return String(value);
};

const VariableDesignerPanel: React.FC = () => {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector(selectIsVariableModalOpen);
  const editingVariable = useAppSelector(selectEditingVariable);
  const variables = useAppSelector(variableSelectors.selectAll);
  const [form] = Form.useForm<VariableFormValues>();

  useEffect(() => {
    if (!isOpen) return;
    form.setFieldsValue({
      name: editingVariable?.name ?? "",
      initialValue:
        editingVariable?.initialValue !== undefined
          ? formatInitialValue(editingVariable.initialValue)
          : "",
    });
  }, [editingVariable, form, isOpen]);

  const handleClose = useCallback(() => {
    dispatch(componentTreeActions.closeVariableModal());
    form.resetFields();
  }, [dispatch, form]);

  const handleSave = useCallback(async () => {
    try {
      const values = await form.validateFields();
      const name = values.name.trim();
      const duplicated = variables.some(
        (item) =>
          item.name === name &&
          (!editingVariable || item.id !== editingVariable.id),
      );

      if (duplicated) {
        message.warning("变量名已存在，请使用其他名称");
        return;
      }

      dispatch(
        componentTreeActions.applyVariableChange({
          name,
          initialValue: parseInitialValue(values.initialValue),
        }),
      );
      message.success("变量已保存");
    } catch {
      return;
    }
  }, [dispatch, editingVariable, form, variables]);

  return (
    <Modal
      open={isOpen}
      title={editingVariable ? "编辑变量" : "新建变量"}
      onCancel={handleClose}
      onOk={handleSave}
      destroyOnClose
      okText="保存"
    >
      <Form
        form={form}
        layout="vertical"
      >
        <Form.Item
          label="变量名"
          name="name"
          rules={[
            { required: true, message: "请输入变量名" },
            {
              pattern: /^[A-Za-z_$][A-Za-z0-9_$]*$/,
              message: "变量名仅支持字母、数字、_、$，且不能以数字开头",
            },
          ]}
        >
          <Input placeholder="例如：isModalOpen" />
        </Form.Item>
        <Form.Item
          label="初始值"
          name="initialValue"
          rules={[{ required: true, message: "请输入初始值" }]}
          extra="支持 boolean/string/number，例如：false、hello、123"
        >
          <Input placeholder="例如：false" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default VariableDesignerPanel;
