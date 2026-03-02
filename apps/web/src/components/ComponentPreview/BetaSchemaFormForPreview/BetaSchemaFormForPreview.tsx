import React from 'react';
import { Input } from 'antd';
import {
  BetaSchemaForm,
  ProForm,
  ProFormDatePicker,
  ProFormDigit,
  ProFormSelect,
  ProFormSwitch,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import type { DragEndEvent } from '@dnd-kit/core';
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { ProCommonColumn } from '@/types';
import { mapProCommonColumnToProps } from '@/store/mapProCommonColumnToProps';
import {
  deleteColumnForSelectedNode,
  moveColumnForSelectedNode,
  selectNode,
  upsertColumnOfSelectedNode,
} from '@/store/componentTreeSlice/componentTreeSlice';
import { startEditingColumn } from '@/store/columnEditorSlice/columnEditorSlice';

import { useAppDispatch } from '@/store/hooks';
import { createProCommonColumnFromSchemeField } from '@/components/SchemaBuilderModal/createProCommonColumnFromSchemeField';
import { makeColumnId } from '@/utils/makeIdCreator';
import { usePreviewMode } from '../previewMode';
import { SortableFormItemShell } from './SortableFormItemShell';

import {
  getFieldName,
  getFieldLabel,
  getFormItemPropsObject,
  getSelectOptions,
  getColumnDragId,
} from './helper';

type SerializableBetaSchemaFormProps = {
  previewNodeId?: string;
  columns?: ProCommonColumn[];
} & Record<string, unknown>;

export type NormalizedFormColumn = Record<string, any>;

const renderEditableField = (
  column: NormalizedFormColumn,
  index: number,
  labelOverride?: React.ReactNode,
) => {
  const name = getFieldName(column, index);
  const label = labelOverride ?? getFieldLabel(column, name);
  const valueType = String(column.valueType ?? 'text').toLowerCase();
  const formItemProps = { ...getFormItemPropsObject(column), name, label };
  const fieldProps = (column.fieldProps ?? {}) as Record<string, any>;

  if (valueType === 'textarea') {
    return <ProFormTextArea formItemProps={formItemProps} fieldProps={fieldProps} />;
  }

  if (valueType === 'digit' || valueType === 'money') {
    return <ProFormDigit formItemProps={formItemProps} fieldProps={fieldProps} />;
  }

  if (valueType === 'switch') {
    return <ProFormSwitch formItemProps={formItemProps} fieldProps={fieldProps} />;
  }

  if (valueType === 'date' || valueType === 'datepicker') {
    return <ProFormDatePicker formItemProps={formItemProps} fieldProps={fieldProps} />;
  }

  if (valueType === 'select') {
    return (
      <ProFormSelect
        formItemProps={formItemProps}
        fieldProps={fieldProps}
        options={getSelectOptions(column)}
      />
    );
  }

  return <ProFormText formItemProps={formItemProps} fieldProps={fieldProps} />;
};

const BetaSchemaFormForPreview: React.FC<SerializableBetaSchemaFormProps> = React.memo((props) => {
  const { previewNodeId, columns = [], ...restProps } = props;
  const dispatch = useAppDispatch();
  const previewMode = usePreviewMode();
  const BetaSchemaFormComponent = BetaSchemaForm as unknown as React.ComponentType<any>;
  const ProFormComponent = ProForm as unknown as React.ComponentType<any>;
  const isPurePreview = previewMode === 'pure' || !previewNodeId;
  const [editingLabelId, setEditingLabelId] = React.useState<string | null>(null);
  const [draftLabel, setDraftLabel] = React.useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 4 },
    }),
  );

  const canDrag = !isPurePreview && columns.length > 1;

  const columnDragIds = React.useMemo(
    () => columns.map((column, index) => getColumnDragId(column, index)),
    [columns],
  );

  const onInsertNewFieldBehind = React.useCallback(
    (columnIndex: number) => {
      if (isPurePreview || !previewNodeId) return;
      const newFieldKey = makeColumnId();
      const draftColumn = createProCommonColumnFromSchemeField(undefined, 'Form');
      const newColumn = {
        ...draftColumn,
        key: newFieldKey,
        dataIndex: newFieldKey,
        title: '新字段',
        valueType: 'text',
        formItemProps: {
          ...draftColumn.formItemProps,
          name: newFieldKey,
          label: '新字段',
        },
      };
      dispatch(selectNode(previewNodeId));
      dispatch(
        upsertColumnOfSelectedNode({
          insertPos: columnIndex + 1,
          changes: newColumn,
        }),
      );
    },
    [dispatch, isPurePreview, previewNodeId],
  );

  const onDeleteField = React.useCallback(
    (columnKey?: string) => {
      if (isPurePreview || !previewNodeId || !columnKey) return;
      dispatch(selectNode(previewNodeId));
      dispatch(deleteColumnForSelectedNode(columnKey));
    },
    [dispatch, isPurePreview, previewNodeId],
  );

  const onEditField = React.useCallback(
    (column: ProCommonColumn) => {
      if (isPurePreview || !previewNodeId) return;
      dispatch(selectNode(previewNodeId));
      dispatch(startEditingColumn(column));
    },
    [dispatch, isPurePreview, previewNodeId],
  );

  const handleDragEnd = React.useCallback(
    ({ active, over }: DragEndEvent) => {
      if (!over || !previewNodeId || !canDrag || active.id === over.id) return;
      const from = columnDragIds.findIndex((id) => id === active.id);
      const to = columnDragIds.findIndex((id) => id === over.id);
      if (from < 0 || to < 0 || from === to) return;
      dispatch(selectNode(previewNodeId));
      dispatch(moveColumnForSelectedNode({ from, to }));
    },
    [canDrag, columnDragIds, dispatch, previewNodeId],
  );

  const startEditingLabel = React.useCallback(
    (labelId: string, currentLabel: string) => {
      if (isPurePreview) return;
      setEditingLabelId(labelId);
      setDraftLabel(currentLabel);
    },
    [isPurePreview],
  );

  const cancelEditingLabel = React.useCallback(() => {
    setEditingLabelId(null);
    setDraftLabel('');
  }, []);

  const applyEditingLabel = React.useCallback(
    (column: ProCommonColumn) => {
      const nextLabel = draftLabel.trim();
      if (!nextLabel) {
        cancelEditingLabel();
        return;
      }

      if (!previewNodeId || !column.key) {
        setEditingLabelId(null);
        return;
      }

      dispatch(selectNode(previewNodeId));
      dispatch(
        upsertColumnOfSelectedNode({
          key: column.key,
          title: nextLabel,
          formItemProps: {
            ...column.formItemProps,
            label: nextLabel,
          },
        }),
      );

      setEditingLabelId(null);
    },
    [cancelEditingLabel, dispatch, draftLabel, previewNodeId],
  );

  const normalizedColumns = React.useMemo(
    () => columns.map((column) => mapProCommonColumnToProps(column) as NormalizedFormColumn),
    [columns],
  );

  const pureContent = (
    <BetaSchemaFormComponent
      {...restProps}
      columns={normalizedColumns}
      layout={(restProps.layout as string | undefined) ?? 'vertical'}
      submitter={false}
    />
  );

  if (isPurePreview) {
    return pureContent;
  }

  const editContent = (
    <ProFormComponent
      layout={(restProps.layout as string | undefined) ?? 'vertical'}
      // submitter={false}
      initialValues={restProps.initialValues as Record<string, unknown> | undefined}
    >
      {columns.map((column, index) => {
        const dragId = getColumnDragId(column, index);
        const normalizedColumn = normalizedColumns[index];
        const fieldName = getFieldName(normalizedColumn, index);
        const labelText = getFieldLabel(normalizedColumn, fieldName);
        const isEditingLabel = editingLabelId === dragId;
        const labelNode = isEditingLabel ? (
          <Input
            size="small"
            value={draftLabel}
            autoFocus
            onChange={(event) => setDraftLabel(event.target.value)}
            onBlur={() => applyEditingLabel(column)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.currentTarget.blur();
              }
              if (event.key === 'Escape') {
                cancelEditingLabel();
              }
            }}
            onClick={(event) => event.stopPropagation()}
          />
        ) : (
          <button
            type="button"
            style={{
              background: 'none',
              border: 0,
              padding: 0,
              textAlign: 'left',
              cursor: 'text',
            }}
            onClick={(event) => event.stopPropagation()}
            onDoubleClick={(event) => {
              event.stopPropagation();
              startEditingLabel(dragId, String(labelText ?? ''));
            }}
          >
            {labelText}
          </button>
        );

        return (
          <SortableFormItemShell
            key={dragId}
            id={dragId}
            canDrag={canDrag}
            onDelete={() => onDeleteField(column.key)}
            onEdit={() => onEditField(column)}
            onInsertBehind={() => onInsertNewFieldBehind(index)}
          >
            {renderEditableField(normalizedColumn, index, labelNode)}
          </SortableFormItemShell>
        );
      })}
    </ProFormComponent>
  );

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={columnDragIds} strategy={verticalListSortingStrategy}>
        {editContent}
      </SortableContext>
    </DndContext>
  );
});

BetaSchemaFormForPreview.displayName = 'BetaSchemaFormForPreview';

export default BetaSchemaFormForPreview;
