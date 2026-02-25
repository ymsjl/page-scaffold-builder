import React from 'react';
import { DeleteOutlined, HolderOutlined, PlusOutlined } from '@ant-design/icons';
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
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { ProCommonColumn } from '@/types';
import { mapProCommonColumnToProps } from '@/store/mapProCommonColumnToProps';
import {
  deleteColumnForSelectedNode,
  moveColumnForSelectedNode,
  selectNode,
  upsertColumnOfSelectedNode,
} from '@/store/componentTreeSlice/componentTreeSlice';
import { useAppDispatch } from '@/store/hooks';
import { createProCommonColumnFromSchemeField } from '@/components/SchemaBuilderModal/createProCommonColumnFromSchemeField';
import { makeColumnId } from '@/utils/makeIdCreator';
import { usePreviewMode } from '../previewMode';
import * as styles from './BetaSchemaFormForPreview.css';

type SerializableBetaSchemaFormProps = {
  previewNodeId?: string;
  columns?: ProCommonColumn[];
} & Record<string, unknown>;

type SortableFormItemShellProps = {
  id: string;
  canDrag: boolean;
  onInsertBehind: () => void;
  onDelete: () => void;
  children: React.ReactNode;
};

type NormalizedFormColumn = Record<string, any>;

const getColumnDragId = (column: ProCommonColumn, index: number) => {
  const dataIndex = Array.isArray(column.dataIndex) ? column.dataIndex.join('.') : column.dataIndex;
  return String(column.key ?? dataIndex ?? `form-item-${index}`);
};

const getFormItemPropsObject = (column: NormalizedFormColumn) => {
  const formItemProps = column.formItemProps;
  if (!formItemProps || typeof formItemProps === 'function') {
    return {} as Record<string, any>;
  }

  return formItemProps as Record<string, any>;
};

const getFieldName = (column: NormalizedFormColumn, index: number) => {
  const formItemProps = getFormItemPropsObject(column);
  const formItemName = formItemProps.name;
  if (Array.isArray(formItemName)) return formItemName;
  if (typeof formItemName === 'string' && formItemName.length > 0) return formItemName;

  const dataIndex = column.dataIndex;
  if (Array.isArray(dataIndex)) return dataIndex;
  if (typeof dataIndex === 'string' && dataIndex.length > 0) return dataIndex;

  return String(column.key ?? `form-item-${index}`);
};

const getFieldLabel = (column: NormalizedFormColumn, fallbackName: string | string[]) => {
  const formItemProps = getFormItemPropsObject(column);
  const fallbackText = Array.isArray(fallbackName) ? fallbackName.join('.') : fallbackName;
  return formItemProps.label ?? column.title ?? fallbackText;
};

const getSelectOptions = (column: NormalizedFormColumn) => {
  const fieldProps = (column.fieldProps ?? {}) as Record<string, unknown>;
  if (Array.isArray(fieldProps.options)) {
    return fieldProps.options;
  }

  if (!column.valueEnum || typeof column.valueEnum !== 'object') {
    return undefined;
  }

  return Object.entries(column.valueEnum).map(([value, option]) => {
    const optionObject = option as { text?: string };
    return {
      value,
      label: optionObject.text ?? value,
    };
  });
};

const renderEditableField = (column: NormalizedFormColumn, index: number) => {
  const name = getFieldName(column, index);
  const label = getFieldLabel(column, name);
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

const SortableFormItemShell: React.FC<SortableFormItemShellProps> = React.memo(
  ({ id, canDrag, onInsertBehind, onDelete, children }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      setActivatorNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({
      id,
      disabled: !canDrag,
    });

    const shellClassName = isDragging
      ? `${styles.formItemShell} ${styles.formItemDragging}`
      : styles.formItemShell;

    return (
      <div
        ref={setNodeRef}
        style={{ transform: CSS.Transform.toString(transform), transition }}
        className={shellClassName}
      >
        <button
          type="button"
          ref={setActivatorNodeRef}
          className={`${styles.dragHandle} ${!canDrag ? styles.dragHandleDisabled : ''}`}
          onClick={(event) => event.stopPropagation()}
          {...attributes}
          {...listeners}
        >
          <HolderOutlined className={styles.dragHandleIcon} />
        </button>

        <div className={styles.itemContent}>{children}</div>

        <div className={styles.fieldActions}>
          <button type="button" className={styles.deleteFieldButton} onClick={onDelete}>
            <DeleteOutlined />
          </button>
        </div>

        <div className={styles.addFieldButtonLayout}>
          <div className={styles.addFieldDivider} />
          <button type="button" className={styles.addFieldButton} onClick={onInsertBehind}>
            <PlusOutlined />
          </button>
        </div>
      </div>
    );
  },
);

SortableFormItemShell.displayName = 'SortableFormItemShell';

const BetaSchemaFormForPreview: React.FC<SerializableBetaSchemaFormProps> = React.memo((props) => {
  const { previewNodeId, columns = [], ...restProps } = props;
  const dispatch = useAppDispatch();
  const previewMode = usePreviewMode();
  const BetaSchemaFormComponent = BetaSchemaForm as unknown as React.ComponentType<any>;
  const ProFormComponent = ProForm as unknown as React.ComponentType<any>;
  const isPurePreview = previewMode === 'pure' || !previewNodeId;

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
      submitter={false}
      initialValues={restProps.initialValues as Record<string, unknown> | undefined}
    >
      {columns.map((column, index) => {
        const dragId = getColumnDragId(column, index);
        const normalizedColumn = normalizedColumns[index];

        return (
          <SortableFormItemShell
            key={dragId}
            id={dragId}
            canDrag={canDrag}
            onDelete={() => onDeleteField(column.key)}
            onInsertBehind={() => onInsertNewFieldBehind(index)}
          >
            {renderEditableField(normalizedColumn, index)}
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
