import React, { useEffect, useMemo, useRef } from "react";
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
  Card,
} from "antd";
import {
  selectEditingColumn,
  selectSchemaEditorVisible,
  selectSelectedNodeEntityTypeId,
  entityTypesSelectors,
} from "@/store/selectors";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { schemaEditorActions } from "@/store/slices/schemaEditorSlice";
import { LeftOutlined } from "@ant-design/icons";
import { valueTypeOptions } from "./getRecommendedWidth";
import type { ProCommonColumn } from "@/types";
import { makeIdCreator } from "@/store/slices/makeIdCreator";
import { useAutoFillByDataIndex } from "./useAutoFillByDataIndex";
import RuleLibrary from "../RuleBuilder/RuleLibrary";
import RuleCanvas from "../RuleBuilder/RuleCanvas";
import RulePreview from "../RuleBuilder/RulePreview";
import {
  ruleBuilderActions,
  selectCurrentColumnProps,
} from "@/store/slices/ruleBuilderSlice";

interface SchemaBuilderModalProps {
  title?: string;
  schemaMode?: "table" | "form" | "description";
}

const makeColumnId = makeIdCreator("column");

const SchemaBuilderModal: React.FC<SchemaBuilderModalProps> = ({
  schemaMode = "table",
}) => {
  const dispatch = useAppDispatch();
  const editingColumn = useAppSelector(selectEditingColumn);
  const schemaEditorVisible = useAppSelector(selectSchemaEditorVisible);
  const currentColumnProps = useAppSelector(selectCurrentColumnProps);
  const selectedNodeEntityTypeId = useAppSelector(
    selectSelectedNodeEntityTypeId,
  );

  const entityFields = useAppSelector(
    (state) =>
      entityTypesSelectors.selectById(state, selectedNodeEntityTypeId)
        ?.fields || [],
  );

  const [form] =
    Form.useForm<
      Pick<
        ProCommonColumn,
        | "title"
        | "dataIndex"
        | "valueType"
        | "width"
        | "hideInSearch"
        | "formItemProps"
        | "fieldProps"
      >
    >();

  useAutoFillByDataIndex(form, entityFields);

  const handleSaveField = async () => {
    try {
      const { formItemProps, fieldProps, ...values } =
        await form.validateFields();
      const {
        formItemProps: currentFormItemProps,
        fieldProps: currentFieldProps,
      } = currentColumnProps;
      dispatch(
        schemaEditorActions.finishSchemaChanges({
          ...values,
          formItemProps: { ...currentFormItemProps, ...formItemProps },
          fieldProps: { ...currentFieldProps, ...fieldProps },
          key: editingColumn?.key ?? makeColumnId(),
        }),
      );
      dispatch(schemaEditorActions.closeSchemaEditor());
      message.success("保存成功");
    } catch (err) {
      message.error("存在未完成或不合法的配置，请检查表单");
    }
  };

  const drawerTitle = editingColumn?.key ? "编辑字段" : "添加字段";

  const hideInSearchValue = Form.useWatch("hideInSearch", form);
  const hideInFormValue = Form.useWatch("hideInForm", form);
  const valueTypeValue = Form.useWatch("valueType", form);

  const formItemName = Form.useWatch(["formItemProps", "name"], form);
  const formItemLabel = Form.useWatch(["formItemProps", "label"], form);

  const lastValueTypeRef = useRef(valueTypeValue);

  useEffect(() => {
    if (!schemaEditorVisible) {
      lastValueTypeRef.current = valueTypeValue;
      return;
    }
    if (lastValueTypeRef.current !== valueTypeValue) {
      dispatch(ruleBuilderActions.resetState());
    }
    lastValueTypeRef.current = valueTypeValue;
  }, [valueTypeValue, schemaEditorVisible, dispatch]);

  const showFormItemAndFieldProps =
    schemaMode === "table" ? !hideInSearchValue : !hideInFormValue;

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

  const onClose = () => dispatch(schemaEditorActions.closeSchemaEditor())

  return (
    <Drawer
      open={schemaEditorVisible}
      width="700px"
      closeIcon={<LeftOutlined />}
      title={drawerTitle}
      onClose={onClose}
      destroyOnClose
      extra={
        <Button type="primary" onClick={handleSaveField}>
          完成
        </Button>
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
              <Space
                direction="vertical"
                style={{ width: "100%" }}
                size="middle"
              >
                <RulePreview  
                  name={formItemName}
                  label={formItemLabel}
                  valueType={valueTypeValue}
                />
                <RuleLibrary fieldType={valueTypeValue} />
                <RuleCanvas />
              </Space>
            </>
          ) : null}
        </Form>
      </Space>
    </Drawer>
  );
};

export default SchemaBuilderModal;
