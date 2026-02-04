import React, { useCallback, useEffect, useMemo, useRef } from "react";
import {
  Drawer,
  Button,
  message,
  Space,
  Input,
  Form,
  Row,
  Col,
  Typography,
  AutoComplete,
  Select,
  Divider,
  Checkbox,
} from "antd";
import { entityModelSelectors, selectComponentTreeState, selectEditingColumn, selectTypeOfSelectedNode } from "@/store/componentTree/componentTreeSelectors";
import { selectSelectedNodeEntityModelId } from "@/store/componentTree/componentTreeSelectors";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { LeftOutlined } from "@ant-design/icons";
import { valueTypeOptions } from "./getRecommendedWidth";
import type { ProCommonColumn } from "@/types";
import { useAutoFillByDataIndex } from "./useAutoFillByDataIndex";
import RuleBuilder from "../RuleBuilder/RuleBuilder";
import { componentTreeActions } from "@/store/componentTree/componentTreeSlice";

export type FormValues = Pick<
  ProCommonColumn,
  | "title"
  | "dataIndex"
  | "valueType"
  | "width"
  | "hideInSearch"
  | "formItemProps"
  | "fieldProps"
>

interface SchemaBuilderModalProps {

}

export const SchemaBuilderModal: React.FC<SchemaBuilderModalProps> = React.memo(({
}) => {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => selectComponentTreeState(state).isSchemaBuilderModalOpen);
  const selectedNodeEntityModelId = useAppSelector(selectSelectedNodeEntityModelId);
  const editingColumn = useAppSelector(selectEditingColumn);
  const onClose = useCallback(() => dispatch(componentTreeActions.setIsSchemaBuilderModalOpen(false)), [dispatch]);
  const componentType = useAppSelector(selectTypeOfSelectedNode);

  const onFinish = (values: FormValues) => {
    dispatch(componentTreeActions.applyChangesToColumnOfSelectedNode(values));
    dispatch(componentTreeActions.setEditingColumn(null));

  };

  const entityFields = useAppSelector(
    (state) =>
      entityModelSelectors.selectById(state, selectedNodeEntityModelId)
        ?.fields || [],
  );

  const [form] = Form.useForm<FormValues>();

  useAutoFillByDataIndex(form, entityFields);

  const handleSaveField = async () => {
    try {
      const values = await form.validateFields();
      onFinish(values);
      onClose();
      message.success("保存成功");
    } catch (err) {
      message.error("存在未完成或不合法的配置，请检查表单");
    }
  };

  const handleSaveAndAddNext = async () => {
    try {
      const values = await form.validateFields();
      onFinish(values);
      message.success("保存成功，可以继续添加下一个字段");
    } catch (err) {
      message.error("存在未完成或不合法的配置，请检查表单");
    }
  };

  const drawerTitle = editingColumn?.key ? "编辑字段" : "添加字段";

  const hideInSearchValue = Form.useWatch("hideInSearch", form);
  const hideInFormValue = Form.useWatch("hideInForm", form);

  const formItemName = Form.useWatch(["formItemProps", "name"], form);
  const formItemLabel = Form.useWatch(["formItemProps", "label"], form);
  const valueTypeValue = Form.useWatch("valueType", form);

  const showFormItemAndFieldProps =
    componentType === "Table" ? !hideInSearchValue : !hideInFormValue;

  const entityFieldOptions = useMemo(
    () =>
      (entityFields || [])
        .filter((f) => !!f.key)
        .map((f) => ({
          value: f.key,
          label: `${f.key}${f.title ? `（${f.title}）` : ""}`,
        })),
    [entityFields],
  );

  const initFormValues = useMemo(() => editingColumn ?? {}, [editingColumn]);

  return (
    <Drawer
      open={isOpen}
      width="700px"
      closeIcon={<LeftOutlined />}
      title={drawerTitle}
      onClose={onClose}
      destroyOnClose
      extra={
        <Space size='small'>
          <Button type="primary" onClick={handleSaveField}>
            完成
          </Button>
          <Button onClick={handleSaveAndAddNext}>
            保存并继续添加
          </Button>
        </Space>
      }
    >
      <Space direction="vertical" style={{ width: "100%" }} size="middle">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveField}
          clearOnDestroy
          initialValues={initFormValues}
        >
          <Typography.Title level={5} id="base-form-group">
            基础
          </Typography.Title>
          <Row gutter={16}>
            <Col xs={24}>
              <Form.Item
                name="dataIndex"
                label="dataIndex"
                required
                tooltip="数据索引，必须以字母或下划线开头"
                rules={[
                  { required: true, message: "请输入 dataIndex" },
                  {
                    pattern: /^[a-zA-Z_][a-zA-Z0-9_]*$/,
                    message:
                      "必须以字母或下划线开头，只能包含字母、数字和下划线",
                  },
                ]}
              >
                <AutoComplete
                  options={entityFieldOptions}
                  placeholder="例如：userName, createTime"
                  allowClear
                  style={{ width: "100%" }}
                  filterOption={(input, option) =>
                    String(option?.value || "")
                      .toLowerCase()
                      .includes(input.toLowerCase()) ||
                    String((option as any)?.label || "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item label="title" name="title">
                <Input placeholder="请输入字段标题（例如：用户名称、创建时间）" />
              </Form.Item>
            </Col>
            <Col xs={24} md={16}>
              <Form.Item label="type" name="valueType" required>
                <Select
                  placeholder="选择字段类型"
                  options={valueTypeOptions}
                  showSearch
                />
              </Form.Item>
            </Col>
            <Col xs={4}>
              <Form.Item
                label="hideInSearch"
                name="hideInSearch"
                valuePropName="checked"
              >
                <Checkbox />
              </Form.Item>
            </Col>
            <Col xs={4}>
              <Form.Item
                label="hideInTable"
                name="hideInTable"
                valuePropName="checked"
              >
                <Checkbox />
              </Form.Item>
            </Col>
          </Row>

          {showFormItemAndFieldProps ? (
            <>
              <Divider />
              <Typography.Title level={5}>表单项配置</Typography.Title>
              <Row gutter={16}>
                <Col xs={24}>
                  <Form.Item
                    label="字段"
                    name={["formItemProps", "name"]}
                    layout="horizontal"
                  >
                    <Input placeholder="字段名" />
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item
                    label="标题"
                    name={["formItemProps", "label"]}
                    layout="horizontal"
                  >
                    <Input placeholder="表单项标题" />
                  </Form.Item>
                </Col>
              </Row>
              <Divider />
              <RuleBuilder
                name={formItemName}
                label={formItemLabel}
                valueType={valueTypeValue}
              />
            </>
          ) : null}
        </Form>
      </Space>
    </Drawer>
  );
});

SchemaBuilderModal.displayName = "SchemaBuilderModal";

export default SchemaBuilderModal;
