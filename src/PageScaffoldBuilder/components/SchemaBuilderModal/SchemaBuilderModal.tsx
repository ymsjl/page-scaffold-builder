import { Drawer, Button, message, Space } from 'antd';
import { LeftOutlined } from '@ant-design/icons';
import { selectedNodeSelector, useBuilderStore } from '../../store/useBuilderStore';
import React, { useMemo, useRef, useEffect } from 'react';
import { Input, Form, Row, Col, Typography, AutoComplete, Select, Divider, Checkbox } from 'antd';
import { getRecommendedWidth, valueTypeOptions } from './getRecommendedWidth';
import RuleBuilder from '../RuleBuilder/RuleBuilder';
import type { ProValueEnum } from '../ColumnSchemaEditorProps';
import { ProCommonColumn } from '../../shims/tableColumsTypes';
import { ProFieldValueType } from '@ant-design/pro-components';
import { SchemaField } from '../../validation';
import { useShallow } from 'zustand/react/shallow';

interface SchemaBuilderModalProps {
  title?: string;
  schemaMode?: 'table' | 'form' | 'description';
}

const createProCommonColumnFromSchemeField = (field: SchemaField): ProCommonColumn => {
  const result: ProCommonColumn = {
    title: field.title,
    dataIndex: field.key,
    key: field.key,
    valueType: (field.valueType || 'text') as ProFieldValueType,
    width: getRecommendedWidth(field.valueType || 'text'),
    hideInSearch: !field.isFilterable,
  };

  if (field.valueType === 'enum') {
    result.valueType = 'select';
    if (field.extra?.options && Array.isArray(field.extra?.options)) {
      result.valueEnum = field.extra.options.reduce((acc: ProValueEnum, option: any) => {
        const key = String(option.value ?? option.id);
        acc[key] = {
          text: option.label ?? String(option.value ?? option.id),
          status: option.status,
          color: option.color,
        };
        return acc;
      }, {} as ProValueEnum);
    }
  }

  return result;
};

const SchemaBuilderModal: React.FC<SchemaBuilderModalProps> = ({ schemaMode = 'table' }) => {
  const editingColumn = useBuilderStore.use.editingColumn();
  const schemaEditorVisible = useBuilderStore.use.schemaEditorVisible();
  const closeSchemaEditor = useBuilderStore.use.closeSchemaEditor();
  const selectedNode = useBuilderStore(selectedNodeSelector);
  const entityTypeId = selectedNode?.props?.entityTypeId as string;
  const selectedNodeColumns = selectedNode?.props?.columns || [];
  const entityFields = useBuilderStore(useShallow(state => state.entityType.byId[entityTypeId].fields || []));

  const [form] = Form.useForm<ProCommonColumn>();
  console.log('entityFields', entityTypeId, entityFields);
  const handleSaveField = async () => {
    try {
      const values = await form.validateFields();
      useBuilderStore.getState().selectedNode.applyColumnChanges(values);
      closeSchemaEditor();
      message.success('保存成功');
    } catch (err) {
      message.error('存在未完成或不合法的配置，请检查表单');
    }
  };

  const drawerTitle =
    editingColumn?.key && selectedNodeColumns.find(f => f.key === editingColumn.key) ? '编辑字段' : '添加字段';

  const entityFieldMap = useMemo(() => {
    const arr = (entityFields || []).map(f => [f.key, f] as [string, SchemaField]);
    return new Map<string, SchemaField>(arr);
  }, [entityFields]);

  const entityFieldOptions = useMemo(
    () =>
      (entityFields || [])
        .filter(f => !!f.key)
        .map(f => ({ value: f.key, label: `${f.key}${f.title ? `（${f.title}）` : ''}` })),
    [entityFields]
  );

  const showInSearchValue = Form.useWatch('showInSearch', form);
  const hideInFormValue = Form.useWatch('hideInForm', form);
  const showFormItemAndFieldProps = schemaMode === 'table' ? Boolean(showInSearchValue) : !Boolean(hideInFormValue);

  const prevDataIndexRef = useRef<string>();
  const dataIndexValue = Form.useWatch('dataIndex', form);

  useEffect(() => {
    if (dataIndexValue && dataIndexValue !== prevDataIndexRef.current) {
      prevDataIndexRef.current = dataIndexValue;
      const matchedField = entityFieldMap.get(dataIndexValue);
      if (!matchedField) return;
      form.setFieldsValue(createProCommonColumnFromSchemeField(matchedField));
    }
  }, [dataIndexValue, entityFieldMap, editingColumn, form]);

  const initFormValues = useMemo(() => {
    if (!editingColumn) return {};
    return editingColumn;
  }, [editingColumn]);

  // 编辑器模式
  return (
    <Drawer
      open={schemaEditorVisible}
      width="700px"
      closeIcon={<LeftOutlined />}
      title={drawerTitle}
      onClose={closeSchemaEditor}
      extra={
        <Button type="primary" onClick={handleSaveField}>
          {' '}
          完成
        </Button>
      }
    >
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <Form form={form} layout="vertical" onFinish={handleSaveField} initialValues={initFormValues}>
          <Typography.Title level={5} id="base-form-group">
            基础
          </Typography.Title>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item label="title" name="title">
                <Input placeholder="请输入字段标题（例如：用户名称、创建时间）" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="dataIndex"
                label="dataIndex"
                required
                tooltip="数据索引，必须以字母或下划线开头"
                rules={[
                  { required: true, message: '请输入 dataIndex' },
                  {
                    pattern: /^[a-zA-Z_][a-zA-Z0-9_]*$/,
                    message: '必须以字母或下划线开头，只能包含字母、数字和下划线',
                  },
                ]}
              >
                <AutoComplete
                  options={entityFieldOptions}
                  placeholder="例如：userName, createTime"
                  allowClear
                  style={{ width: '100%' }}
                  filterOption={(input, option) =>
                    String(option?.value || '')
                      .toLowerCase()
                      .includes(input.toLowerCase()) ||
                    String((option as any)?.label || '')
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="type" name="valueType" required>
                <Select placeholder="选择字段类型" options={valueTypeOptions} showSearch />
              </Form.Item>
            </Col>
            <Col xs={6}>
              <Form.Item label="hideInSearch" name="hideInSearch" valuePropName="checked">
                <Checkbox />
              </Form.Item>
            </Col>
            <Col xs={6}>
              <Form.Item label="hideInTable" name="hideInTable" valuePropName="checked">
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
                  <Form.Item label="字段" name={["formItemProps", "name"]} layout="horizontal">
                    <Input placeholder="字段名" />
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item label="标题" name={["formItemProps", "label"]} layout="horizontal">
                    <Input placeholder="表单项标题" />
                  </Form.Item>
                </Col>
              </Row>
              <Divider />
              <Space direction="vertical" style={{ width: '100%' }} size={6}>
                <RuleBuilder
                  value={editingColumn?.formItemProps?.rules}
                  fieldType={editingColumn?.type || editingColumn?.valueType}
                />
                <Divider />
              </Space>
            </>
          ) : null}
        </Form>
      </Space>
    </Drawer>
  );
};

export default SchemaBuilderModal;

type ValueEnumListItem = {
  id: string;
  value?: string | number;
  label?: string;
  status?: string;
  color?: string;
};

const valueEnumToList = (valueEnum?: ProValueEnum): ValueEnumListItem[] => {
  if (!valueEnum) return [];
  return Object.entries(valueEnum).map(([value, meta]) => ({
    id: String(value),
    value,
    label: meta?.text,
    status: meta?.status,
    color: meta?.color,
  }));
};