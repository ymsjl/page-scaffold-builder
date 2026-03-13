import React from 'react';
import { Button, DatePicker, Input, InputNumber, Select, Switch } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { AddComponentIntoPreview } from '@/components/DropZone/DropZone';
import SlotItemWrapper from '@/components/SlotItemWrapper/SlotItemWrapper';
import { createProCommonColumnFromSchemeField } from '@/components/SchemaBuilderModal/createProCommonColumnFromSchemeField';
import type { ProCommonColumn, SchemaField } from '@/types';
import { getFieldName, getSelectOptions } from '../BetaSchemaFormForPreview/helper';
import { normalizeNodeRefs } from '../nodeRefLogic';
import { useRenderNodeRefs } from '../propResolvers';
import type { SerializableProTableProps } from './types';
import * as styles from './DumbProTableForPreview.css';

export const getColumnTitleText = (column: ProCommonColumn) => {
  if (typeof column.title === 'string' && column.title.trim()) {
    return column.title;
  }

  if (Array.isArray(column.dataIndex)) {
    return column.dataIndex.join('.');
  }

  return String(column.dataIndex || column.key || '未命名列');
};

export const renderSearchControl = (column: ProCommonColumn, index: number) => {
  const normalizedName = getFieldName(column as Record<string, unknown>, index);
  const valueType = String(column.valueType ?? 'text').toLowerCase();

  if (valueType === 'textarea') {
    return <Input.TextArea disabled rows={3} placeholder="请输入" />;
  }

  if (valueType === 'digit' || valueType === 'money') {
    return <InputNumber disabled className={styles.inlineInput} placeholder="请输入" />;
  }

  if (valueType === 'switch') {
    return <Switch disabled />;
  }

  if (valueType === 'date' || valueType === 'datepicker' || valueType === 'datetime') {
    return <DatePicker disabled className={styles.inlineInput} placeholder="请选择日期" />;
  }

  if (valueType === 'select') {
    return (
      <Select
        disabled
        className={styles.inlineInput}
        placeholder="请选择"
        options={getSelectOptions(column as Record<string, unknown>) as never[] | undefined}
      />
    );
  }

  if (valueType === 'option') {
    return <div className={styles.controlNote}>该列在搜索区通常不显示输入控件</div>;
  }

  return (
    <Input
      disabled
      placeholder={`请输入 ${Array.isArray(normalizedName) ? normalizedName.join('.') : normalizedName}`}
    />
  );
};

export const buildInsertedColumn = ({
  componentType,
  entityFields,
  fieldKey,
}: {
  componentType: 'Table';
  entityFields: SchemaField[];
  fieldKey?: string;
}) => {
  const field = entityFields.find((item) => item.key === fieldKey);
  const nextColumn = createProCommonColumnFromSchemeField(field, componentType);
  nextColumn.title = field?.key ?? '新列';
  return nextColumn;
};

export const useToolbarActionNodes = ({
  toolbar,
  previewNodeId,
}: {
  toolbar: SerializableProTableProps['toolbar'];
  previewNodeId?: string;
}) => {
  const toolbarActionRefs = React.useMemo(
    () => normalizeNodeRefs(toolbar?.actions),
    [toolbar?.actions],
  );
  const renderedToolbarActions = useRenderNodeRefs(toolbarActionRefs);

  return React.useMemo(() => {
    if (!previewNodeId) {
      return renderedToolbarActions;
    }

    const wrappedActions = toolbarActionRefs.reduce<React.ReactNode[]>((acc, ref, index) => {
      const element = renderedToolbarActions[index];
      if (!element) {
        return acc;
      }

      acc.push(
        <SlotItemWrapper
          key={ref.nodeId}
          nodeId={ref.nodeId}
          targetNodeId={previewNodeId}
          propPath="toolbar.actions"
        >
          {element}
        </SlotItemWrapper>,
      );

      return acc;
    }, []);

    wrappedActions.push(
      <AddComponentIntoPreview
        key="toolbar.actions:add"
        targetNodeId={previewNodeId}
        propPath="toolbar.actions"
        direction="horizontal"
        acceptTypes={['Button']}
      >
        {({ onClick }) => (
          <Button type="dashed" size="middle" icon={<PlusOutlined />} onClick={onClick}>
            新建操作
          </Button>
        )}
      </AddComponentIntoPreview>,
    );

    return wrappedActions;
  }, [previewNodeId, renderedToolbarActions, toolbarActionRefs]);
};
