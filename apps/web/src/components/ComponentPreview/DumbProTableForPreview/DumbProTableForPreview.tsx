import React from 'react';
import { Button, DatePicker, Dropdown, Input, InputNumber, Select, Switch, Tooltip } from 'antd';
import type { MenuProps } from 'antd';
import {
  type DragEndEvent,
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { restrictToHorizontalAxis, restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  SortableContext,
  horizontalListSortingStrategy,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  DeleteOutlined,
  EditOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  HolderOutlined,
  NumberOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { EditableShell } from '@/components/EditableShell/EditableShell';
import { AddComponentIntoPreview } from '@/components/DropZone/DropZone';
import SlotItemWrapper from '@/components/SlotItemWrapper/SlotItemWrapper';
import { createProCommonColumnFromSchemeField } from '@/components/SchemaBuilderModal/createProCommonColumnFromSchemeField';
import {
  createSchemaColumnProjection,
  createSchemaColumnSource,
  focusSchemaColumn,
  openSchemaColumnEditor,
} from '@/editing/bindings/schemaColumns';
import { setHoverSource } from '@/editing/store/editingSlice';
import { selectActiveEditingSource } from '@/editing/store/selectors';
import { isSameEditableSource } from '@/editing/types/EditableSource';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  deleteColumnForSelectedNode,
  moveColumnForSelectedNode,
  selectNode,
  upsertColumnOfSelectedNode,
} from '@/store/componentTreeSlice/componentTreeSlice';
import { componentNodesSelectors } from '@/store/componentTreeSlice/componentTreeSelectors';
import { entityModelSelectors } from '@/store/entityModelSlice/selectors';
import type { NodeRef, ProCommonColumn, SchemaField } from '@/types';
import { useRenderNodeRefs } from '../propResolvers';
import { normalizeNodeRefs } from '../nodeRefLogic';
import { ColumnCellSlot } from '../ProTableForPreview/ColumnCellSlot';
import { generateDataSource } from '../ProTableForPreview/mapValueTypeToValue';
import {
  getColumnDragId,
  getFieldLabel,
  getFieldName,
  getSelectOptions,
} from '../BetaSchemaFormForPreview/helper';
import * as styles from './DumbProTableForPreview.css';

type PreviewExtras = {
  previewNodeId?: string;
};

export type SerializableProTableProps = PreviewExtras & {
  columns?: ProCommonColumn[];
  rowActions?: NodeRef[];
  headerTitle?: React.ReactNode;
  ghost?: boolean;
  rowKey?: string;
  search?:
    | {
        layout?: 'vertical' | 'horizontal';
        defaultCollapsed?: boolean;
      }
    | false;
  toolbar?: {
    actions?: unknown;
  };
  pagination?:
    | {
        defaultPageSize?: number;
        showSizeChanger?: boolean;
      }
    | false;
  [key: string]: unknown;
};

type InlineEditMode =
  | { kind: 'header'; columnKey: string; draft: string }
  | { kind: 'search-label'; columnKey: string; draft: string }
  | null;

type SearchableColumn = {
  column: ProCommonColumn;
  columnIndex: number;
  dragId: string;
};

const getColumnTitleText = (column: ProCommonColumn) => {
  if (typeof column.title === 'string' && column.title.trim()) {
    return column.title;
  }

  if (Array.isArray(column.dataIndex)) {
    return column.dataIndex.join('.');
  }

  return String(column.dataIndex || column.key || '未命名列');
};

const renderSearchControl = (column: ProCommonColumn, index: number) => {
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

const buildInsertedColumn = ({
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

const useToolbarActionNodes = ({
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

type SortableHeaderCellProps = {
  dragId: string;
  column: ProCommonColumn;
  columnIndex: number;
  previewNodeId?: string;
  entityFields: SchemaField[];
  isColumnActive: boolean;
  isEditing: boolean;
  draftValue: string;
  onDraftChange: (nextValue: string) => void;
  onApplyDraft: () => void;
  onCancelDraft: () => void;
  onStartEditing: () => void;
  onHoverChange: (nextHovered: boolean) => void;
  cellContent: React.ReactNode;
};

const SortableHeaderCell: React.FC<SortableHeaderCellProps> = ({
  dragId,
  column,
  columnIndex,
  previewNodeId,
  entityFields,
  isColumnActive,
  isEditing,
  draftValue,
  onDraftChange,
  onApplyDraft,
  onCancelDraft,
  onStartEditing,
  onHoverChange,
  cellContent,
}) => {
  const dispatch = useAppDispatch();
  const activeSource = useAppSelector(selectActiveEditingSource);
  const canOperate = Boolean(previewNodeId);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: dragId,
    disabled: !canOperate,
  });

  const columnSource = React.useMemo(() => {
    if (!previewNodeId) {
      return null;
    }

    return createSchemaColumnSource({ ownerNodeId: previewNodeId, column, columnIndex });
  }, [column, columnIndex, previewNodeId]);

  const projection = React.useMemo(() => {
    if (!previewNodeId) {
      return null;
    }

    return createSchemaColumnProjection({ ownerNodeId: previewNodeId, column, columnIndex });
  }, [column, columnIndex, previewNodeId]);

  const isSelected = isSameEditableSource(activeSource, columnSource);
  const insertItems = React.useMemo<MenuProps['items']>(() => {
    return [
      { key: 'insert:empty', label: '空列' },
      { type: 'divider' },
      ...entityFields.map((field) => ({ key: `insert:${field.key}`, label: field.key })),
    ];
  }, [entityFields]);

  const focusColumn = React.useCallback(() => {
    if (!previewNodeId || !columnSource) {
      return;
    }

    dispatch(
      focusSchemaColumn({
        ownerNodeId: previewNodeId,
        column,
        columnIndex,
        interactionSource: 'canvas',
      }),
    );
  }, [column, columnIndex, columnSource, dispatch, previewNodeId]);

  const insertBehind = React.useCallback(
    (fieldKey?: string) => {
      if (!previewNodeId) {
        return;
      }

      focusColumn();
      dispatch(
        upsertColumnOfSelectedNode({
          insertPos: columnIndex + 1,
          changes: buildInsertedColumn({ componentType: 'Table', entityFields, fieldKey }),
        }),
      );
    },
    [columnIndex, dispatch, entityFields, focusColumn, previewNodeId],
  );

  const handleDelete = React.useCallback(() => {
    if (!previewNodeId || !column.key) {
      return;
    }

    focusColumn();
    dispatch(deleteColumnForSelectedNode(column.key));
  }, [column.key, dispatch, focusColumn, previewNodeId]);

  const handleEdit = React.useCallback(() => {
    if (!previewNodeId) {
      return;
    }

    dispatch(
      openSchemaColumnEditor({
        ownerNodeId: previewNodeId,
        column,
        columnIndex,
        interactionSource: 'canvas',
      }),
    );
  }, [column, columnIndex, dispatch, previewNodeId]);

  const menuItems = React.useMemo<MenuProps['items']>(
    () => [
      { key: 'title', label: getColumnTitleText(column), disabled: true },
      { key: 'edit', label: '编辑该列', icon: <EditOutlined />, disabled: !canOperate },
      { key: 'delete', label: '删除该列', icon: <DeleteOutlined />, disabled: !canOperate },
      {
        key: 'insert',
        label: '在后方新增一列',
        disabled: !canOperate,
        children: insertItems,
        icon: <PlusOutlined />,
      },
      { type: 'divider' },
      {
        key: 'hideInSearch',
        label: column.hideInSearch ? '显示表单项' : '隐藏表单项',
        disabled: !canOperate,
        icon: column.hideInSearch ? <EyeOutlined /> : <EyeInvisibleOutlined />,
      },
      {
        key: 'hideInTable',
        label: column.hideInTable ? '显示表格列' : '隐藏表格列',
        disabled: !canOperate,
        icon: column.hideInTable ? <EyeOutlined /> : <EyeInvisibleOutlined />,
      },
      { type: 'divider' },
      { key: 'rules', label: '数据校验规则', icon: <NumberOutlined />, disabled: !canOperate },
    ],
    [canOperate, column, insertItems],
  );

  const handleMenuClick = React.useCallback<NonNullable<MenuProps['onClick']>>(
    ({ key, domEvent }) => {
      domEvent.stopPropagation();
      if (!previewNodeId || !column.key) {
        return;
      }

      focusColumn();

      if (key === 'edit' || key === 'rules') {
        handleEdit();
        return;
      }

      if (key === 'delete') {
        handleDelete();
        return;
      }

      if (typeof key === 'string' && key.startsWith('insert:')) {
        const fieldKey = key === 'insert:empty' ? undefined : key.replace('insert:', '');
        insertBehind(fieldKey);
        return;
      }

      if (key === 'hideInSearch') {
        dispatch(
          upsertColumnOfSelectedNode({ key: column.key, hideInSearch: !column.hideInSearch }),
        );
        return;
      }

      if (key === 'hideInTable') {
        dispatch(upsertColumnOfSelectedNode({ key: column.key, hideInTable: !column.hideInTable }));
      }
    },
    [column, dispatch, focusColumn, handleDelete, handleEdit, insertBehind, previewNodeId],
  );

  const controlButtonClassName = isDragging
    ? `${styles.controlButton} ${styles.dragButton} ${styles.dragButtonDragging}`
    : `${styles.controlButton} ${styles.dragButton}`;

  const editableContent = isEditing ? (
    <Input
      size="small"
      autoFocus
      value={draftValue}
      onChange={(event) => onDraftChange(event.target.value)}
      onBlur={onApplyDraft}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          event.currentTarget.blur();
        }
        if (event.key === 'Escape') {
          onCancelDraft();
        }
      }}
      onClick={(event) => event.stopPropagation()}
    />
  ) : (
    <div className={styles.headerContent}>
      <button
        type="button"
        className={styles.headerTitleButton}
        onClick={(event) => event.stopPropagation()}
        onDoubleClick={(event) => {
          event.stopPropagation();
          onStartEditing();
        }}
      >
        <span className={styles.headerTitleText}>{getColumnTitleText(column)}</span>
      </button>
      <div className={styles.headerSubtext}>{String(column.valueType ?? 'text')}</div>
      <div className={styles.columnWidthHint}>
        {column.width ? `宽度 ${column.width}px` : '自动宽度'}
      </div>
    </div>
  );

  const columnShell = projection ? (
    <EditableShell
      target={projection}
      selected={isSelected}
      className={`${styles.columnShell} ${styles.shellStretch} ${isDragging ? styles.draggingShell : ''}`}
      onSelect={(event) => {
        event.stopPropagation();
        focusColumn();
      }}
      onMouseEnter={() => {
        if (columnSource) {
          dispatch(setHoverSource(columnSource));
        }
        onHoverChange(true);
      }}
      onMouseLeave={() => {
        dispatch(setHoverSource(null));
        onHoverChange(false);
      }}
      toolbar={
        <div className={styles.compactToolbar}>
          <Tooltip title="拖动排序">
            <Button
              size="small"
              type="text"
              className={controlButtonClassName}
              icon={<HolderOutlined />}
              onClick={(event) => event.stopPropagation()}
              {...listeners}
              {...attributes}
            />
          </Tooltip>
          <Tooltip title="编辑列">
            <Button size="small" type="text" icon={<EditOutlined />} onClick={handleEdit} />
          </Tooltip>
          <Tooltip title="删除列">
            <Button
              size="small"
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={handleDelete}
            />
          </Tooltip>
          <Tooltip title="在后方插入一列">
            <Button
              size="small"
              type="text"
              icon={<PlusOutlined />}
              onClick={() => insertBehind()}
            />
          </Tooltip>
        </div>
      }
    >
      <div className={styles.columnContent}>
        <div className={styles.headerShell}>{editableContent}</div>
        <div className={styles.bodyCell}>{cellContent}</div>
      </div>
    </EditableShell>
  ) : (
    <div className={styles.columnContent}>
      <div className={styles.headerShell}>{editableContent}</div>
      <div className={styles.bodyCell}>{cellContent}</div>
    </div>
  );

  return (
    <Dropdown
      trigger={isEditing ? [] : ['contextMenu']}
      menu={{ items: menuItems, onClick: handleMenuClick }}
    >
      <div
        ref={setNodeRef}
        style={{ transform: CSS.Transform.toString(transform), transition }}
        className={
          isColumnActive ? `${styles.columnLane} ${styles.columnLaneActive}` : styles.columnLane
        }
      >
        {columnShell}
      </div>
    </Dropdown>
  );
};

type SortableSearchFieldProps = {
  item: SearchableColumn;
  previewNodeId?: string;
  isEditing: boolean;
  draftValue: string;
  onDraftChange: (nextValue: string) => void;
  onApplyDraft: () => void;
  onCancelDraft: () => void;
  onStartEditing: () => void;
  entityFields: SchemaField[];
};

const SortableSearchField: React.FC<SortableSearchFieldProps> = ({
  item,
  previewNodeId,
  isEditing,
  draftValue,
  onDraftChange,
  onApplyDraft,
  onCancelDraft,
  onStartEditing,
  entityFields,
}) => {
  const { column, columnIndex, dragId } = item;
  const dispatch = useAppDispatch();
  const activeSource = useAppSelector(selectActiveEditingSource);
  const canOperate = Boolean(previewNodeId);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: dragId,
    disabled: !canOperate,
  });

  const columnSource = React.useMemo(() => {
    if (!previewNodeId) {
      return null;
    }

    return createSchemaColumnSource({ ownerNodeId: previewNodeId, column, columnIndex });
  }, [column, columnIndex, previewNodeId]);

  const projection = React.useMemo(() => {
    if (!previewNodeId) {
      return null;
    }

    return createSchemaColumnProjection({ ownerNodeId: previewNodeId, column, columnIndex });
  }, [column, columnIndex, previewNodeId]);

  const isSelected = isSameEditableSource(activeSource, columnSource);
  const labelText = String(
    getFieldLabel(
      column as Record<string, unknown>,
      getFieldName(column as Record<string, unknown>, columnIndex),
    ),
  );

  const focusColumn = React.useCallback(() => {
    if (!previewNodeId || !columnSource) {
      return;
    }

    dispatch(
      focusSchemaColumn({
        ownerNodeId: previewNodeId,
        column,
        columnIndex,
        interactionSource: 'canvas',
      }),
    );
  }, [column, columnIndex, columnSource, dispatch, previewNodeId]);

  const insertBehind = React.useCallback(() => {
    if (!previewNodeId) {
      return;
    }

    focusColumn();
    dispatch(
      upsertColumnOfSelectedNode({
        insertPos: columnIndex + 1,
        changes: buildInsertedColumn({ componentType: 'Table', entityFields }),
      }),
    );
  }, [columnIndex, dispatch, entityFields, focusColumn, previewNodeId]);

  const handleDelete = React.useCallback(() => {
    if (!previewNodeId || !column.key) {
      return;
    }

    focusColumn();
    dispatch(deleteColumnForSelectedNode(column.key));
  }, [column.key, dispatch, focusColumn, previewNodeId]);

  const handleEdit = React.useCallback(() => {
    if (!previewNodeId) {
      return;
    }

    dispatch(
      openSchemaColumnEditor({
        ownerNodeId: previewNodeId,
        column,
        columnIndex,
        interactionSource: 'canvas',
      }),
    );
  }, [column, columnIndex, dispatch, previewNodeId]);

  const editableLabel = isEditing ? (
    <Input
      size="small"
      autoFocus
      value={draftValue}
      onChange={(event) => onDraftChange(event.target.value)}
      onBlur={onApplyDraft}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          event.currentTarget.blur();
        }
        if (event.key === 'Escape') {
          onCancelDraft();
        }
      }}
      onClick={(event) => event.stopPropagation()}
    />
  ) : (
    <button
      type="button"
      className={styles.labelButton}
      onClick={(event) => event.stopPropagation()}
      onDoubleClick={(event) => {
        event.stopPropagation();
        onStartEditing();
      }}
    >
      <span className={styles.labelText}>{labelText}</span>
    </button>
  );

  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }}>
      {projection ? (
        <EditableShell
          target={projection}
          selected={isSelected}
          className={`${styles.fieldShell} ${styles.shellStretch} ${isDragging ? styles.draggingShell : ''}`}
          onSelect={(event) => {
            event.stopPropagation();
            focusColumn();
          }}
          onMouseEnter={() => {
            if (columnSource) {
              dispatch(setHoverSource(columnSource));
            }
          }}
          onMouseLeave={() => dispatch(setHoverSource(null))}
          toolbar={
            <div className={styles.compactToolbar}>
              <Tooltip title="拖动排序">
                <Button
                  size="small"
                  type="text"
                  className={
                    isDragging
                      ? `${styles.controlButton} ${styles.dragButton} ${styles.dragButtonDragging}`
                      : `${styles.controlButton} ${styles.dragButton}`
                  }
                  icon={<HolderOutlined />}
                  onClick={(event) => event.stopPropagation()}
                  {...listeners}
                  {...attributes}
                />
              </Tooltip>
              <Tooltip title="编辑字段">
                <Button size="small" type="text" icon={<EditOutlined />} onClick={handleEdit} />
              </Tooltip>
              <Tooltip title="删除字段">
                <Button
                  size="small"
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={handleDelete}
                />
              </Tooltip>
              <Tooltip title="在后方插入字段">
                <Button size="small" type="text" icon={<PlusOutlined />} onClick={insertBehind} />
              </Tooltip>
            </div>
          }
        >
          <div className={styles.fieldContent}>
            <div className={styles.fieldLabelRow}>
              {editableLabel}
              <span className={styles.fieldMeta}>{String(column.valueType ?? 'text')}</span>
            </div>
            <div className={styles.fieldControl}>{renderSearchControl(column, columnIndex)}</div>
          </div>
        </EditableShell>
      ) : (
        <div className={styles.fieldContent}>
          <div className={styles.fieldLabelRow}>{editableLabel}</div>
          <div className={styles.fieldControl}>{renderSearchControl(column, columnIndex)}</div>
        </div>
      )}
    </div>
  );
};

const DumbProTableForPreview: React.FC<SerializableProTableProps> = React.memo((props) => {
  const {
    previewNodeId,
    columns = [],
    rowActions,
    toolbar,
    headerTitle,
    search = { layout: 'vertical', defaultCollapsed: false },
    pagination = { defaultPageSize: 10, showSizeChanger: true },
  } = props;
  const dispatch = useAppDispatch();
  const activeSource = useAppSelector(selectActiveEditingSource);
  const [hoveredColumnId, setHoveredColumnId] = React.useState<string | null>(null);
  const [inlineEditMode, setInlineEditMode] = React.useState<InlineEditMode>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 4 },
    }),
  );

  const tableNode = useAppSelector((state) =>
    previewNodeId
      ? (componentNodesSelectors.selectById(state, previewNodeId) as
          | { props?: { entityModelId?: string } }
          | undefined)
      : undefined,
  );
  const entityModel = useAppSelector((state) => {
    const entityModelId = tableNode?.props?.entityModelId;
    return entityModelId ? entityModelSelectors.selectById(state, entityModelId) : null;
  });
  const entityFields = React.useMemo(() => entityModel?.fields ?? [], [entityModel]);
  const dataSource = React.useMemo(() => generateDataSource(columns), [columns]);
  const toolbarActionNodes = useToolbarActionNodes({ toolbar, previewNodeId });

  const visibleTableColumns = React.useMemo(
    () =>
      columns
        .map((column, columnIndex) => ({
          column,
          columnIndex,
          dragId: getColumnDragId(column, columnIndex),
        }))
        .filter(({ column }) => !column.hideInTable),
    [columns],
  );
  const visibleSearchColumns = React.useMemo(
    () =>
      columns
        .map((column, columnIndex) => ({
          column,
          columnIndex,
          dragId: getColumnDragId(column, columnIndex),
        }))
        .filter(({ column }) => !column.hideInSearch),
    [columns],
  );

  const handleTableDragEnd = React.useCallback(
    ({ active, over }: DragEndEvent) => {
      if (!over || !previewNodeId || active.id === over.id) {
        return;
      }

      const from = visibleTableColumns.find((item) => item.dragId === active.id)?.columnIndex;
      const to = visibleTableColumns.find((item) => item.dragId === over.id)?.columnIndex;
      if (typeof from !== 'number' || typeof to !== 'number' || from === to) {
        return;
      }

      dispatch(selectNode(previewNodeId));
      dispatch(moveColumnForSelectedNode({ from, to }));
    },
    [dispatch, previewNodeId, visibleTableColumns],
  );

  const handleSearchDragEnd = React.useCallback(
    ({ active, over }: DragEndEvent) => {
      if (!over || !previewNodeId || active.id === over.id) {
        return;
      }

      const from = visibleSearchColumns.find((item) => item.dragId === active.id)?.columnIndex;
      const to = visibleSearchColumns.find((item) => item.dragId === over.id)?.columnIndex;
      if (typeof from !== 'number' || typeof to !== 'number' || from === to) {
        return;
      }

      dispatch(selectNode(previewNodeId));
      dispatch(moveColumnForSelectedNode({ from, to }));
    },
    [dispatch, previewNodeId, visibleSearchColumns],
  );

  const applyHeaderRename = React.useCallback(
    (column: ProCommonColumn) => {
      if (!inlineEditMode || inlineEditMode.kind !== 'header') {
        return;
      }

      const nextTitle = inlineEditMode.draft.trim();
      if (!nextTitle) {
        setInlineEditMode(null);
        return;
      }

      if (!previewNodeId || !column.key) {
        setInlineEditMode(null);
        return;
      }

      dispatch(
        focusSchemaColumn({
          ownerNodeId: previewNodeId,
          column,
          columnIndex: columns.findIndex((item) => item.key === column.key),
          interactionSource: 'canvas',
        }),
      );
      dispatch(upsertColumnOfSelectedNode({ key: column.key, title: nextTitle }));
      setInlineEditMode(null);
    },
    [columns, dispatch, inlineEditMode, previewNodeId],
  );

  const applySearchLabelRename = React.useCallback(
    (column: ProCommonColumn) => {
      if (!inlineEditMode || inlineEditMode.kind !== 'search-label') {
        return;
      }

      const nextLabel = inlineEditMode.draft.trim();
      if (!nextLabel) {
        setInlineEditMode(null);
        return;
      }

      if (!previewNodeId || !column.key) {
        setInlineEditMode(null);
        return;
      }

      dispatch(
        focusSchemaColumn({
          ownerNodeId: previewNodeId,
          column,
          columnIndex: columns.findIndex((item) => item.key === column.key),
          interactionSource: 'canvas',
        }),
      );
      dispatch(
        upsertColumnOfSelectedNode({
          key: column.key,
          formItemProps: {
            ...column.formItemProps,
            label: nextLabel,
          },
        }),
      );
      setInlineEditMode(null);
    },
    [columns, dispatch, inlineEditMode, previewNodeId],
  );

  const visibleRowActions = React.useMemo(() => rowActions ?? [], [rowActions]);

  const renderColumnCellContent = React.useCallback(
    (column: ProCommonColumn) => {
      if (String(column.valueType ?? '').toLowerCase() === 'option') {
        return (
          <ColumnCellSlot
            targetNodeId={previewNodeId}
            acceptTypes={['Button']}
            nodeRefs={visibleRowActions}
            propPath="rowActions"
          />
        );
      }

      return (
        <div className={styles.valueText}>
          {String(dataSource[column.dataIndex as string] ?? '示例值')}
        </div>
      );
    },
    [dataSource, previewNodeId, visibleRowActions],
  );

  return (
    <div className={styles.root}>
      <section className={`${styles.surface} ${styles.headerPanel}`}>
        <div className={styles.header}>
          <div className={styles.titleBlock}>
            <h3 className={styles.heading}>{headerTitle || '示意表格'}</h3>
          </div>
          <div className={styles.toolbarActions}>
            {toolbarActionNodes.length > 0 ? (
              toolbarActionNodes
            ) : (
              <div className={styles.toolbarPlaceholder}>工具栏操作区</div>
            )}
          </div>
        </div>
      </section>

      {search !== false ? (
        <section className={`${styles.surface} ${styles.searchPanel}`}>
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitle}>查询表单</div>
              <div className={styles.sectionHint}>
                {visibleSearchColumns.length > 0
                  ? `${search.layout === 'horizontal' ? '水平' : '垂直'}布局示意，双击标签可直接改名`
                  : '当前没有可显示的查询字段'}
              </div>
            </div>
            {visibleSearchColumns.length > 0 ? (
              <DndContext
                sensors={sensors}
                modifiers={[restrictToVerticalAxis]}
                collisionDetection={closestCenter}
                onDragEnd={handleSearchDragEnd}
              >
                <SortableContext
                  items={visibleSearchColumns.map((item) => item.dragId)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className={styles.searchGrid}>
                    {visibleSearchColumns.map((item) => {
                      const isEditing =
                        inlineEditMode?.kind === 'search-label' &&
                        inlineEditMode.columnKey === item.column.key;
                      return (
                        <SortableSearchField
                          key={item.dragId}
                          item={item}
                          previewNodeId={previewNodeId}
                          entityFields={entityFields}
                          isEditing={Boolean(isEditing)}
                          draftValue={isEditing ? (inlineEditMode?.draft ?? '') : ''}
                          onDraftChange={(nextValue) =>
                            setInlineEditMode((current) =>
                              current?.kind === 'search-label' &&
                              current.columnKey === item.column.key
                                ? { ...current, draft: nextValue }
                                : current,
                            )
                          }
                          onApplyDraft={() => applySearchLabelRename(item.column)}
                          onCancelDraft={() => setInlineEditMode(null)}
                          onStartEditing={() =>
                            setInlineEditMode({
                              kind: 'search-label',
                              columnKey: item.column.key,
                              draft: String(
                                getFieldLabel(
                                  item.column as Record<string, unknown>,
                                  getFieldName(
                                    item.column as Record<string, unknown>,
                                    item.columnIndex,
                                  ),
                                ),
                              ),
                            })
                          }
                        />
                      );
                    })}
                  </div>
                </SortableContext>
              </DndContext>
            ) : (
              <div className={styles.emptyState}>所有列都被设置为仅表格显示，暂无查询表单项。</div>
            )}
          </div>
        </section>
      ) : null}

      <section className={`${styles.surface} ${styles.dataPanel}`}>
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitle}>数据表格</div>
            <div className={styles.selectedSummary}>
              <span>{visibleTableColumns.length} 列</span>
              <span className={styles.countText}>悬停列会高亮整列，双击列头可直接改名</span>
            </div>
          </div>
          {visibleTableColumns.length > 0 ? (
            <DndContext
              sensors={sensors}
              modifiers={[restrictToHorizontalAxis]}
              collisionDetection={closestCenter}
              onDragEnd={handleTableDragEnd}
            >
              <SortableContext
                items={visibleTableColumns.map((item) => item.dragId)}
                strategy={horizontalListSortingStrategy}
              >
                <div className={styles.tableWrap}>
                  <div className={styles.columnsRow}>
                    {visibleTableColumns.map((item) => {
                      const columnSource = previewNodeId
                        ? createSchemaColumnSource({
                            ownerNodeId: previewNodeId,
                            column: item.column,
                            columnIndex: item.columnIndex,
                          })
                        : null;
                      const isSelected = isSameEditableSource(activeSource, columnSource);
                      const isColumnActive = hoveredColumnId === item.dragId || isSelected;
                      const isEditing =
                        inlineEditMode?.kind === 'header' &&
                        inlineEditMode.columnKey === item.column.key;

                      return (
                        <div
                          key={item.dragId}
                          className={styles.columnWrap}
                          style={item.column.width ? { width: item.column.width } : undefined}
                        >
                          <SortableHeaderCell
                            dragId={item.dragId}
                            column={item.column}
                            columnIndex={item.columnIndex}
                            previewNodeId={previewNodeId}
                            entityFields={entityFields}
                            isColumnActive={isColumnActive}
                            isEditing={Boolean(isEditing)}
                            draftValue={isEditing ? (inlineEditMode?.draft ?? '') : ''}
                            onDraftChange={(nextValue) =>
                              setInlineEditMode((current) =>
                                current?.kind === 'header' && current.columnKey === item.column.key
                                  ? { ...current, draft: nextValue }
                                  : current,
                              )
                            }
                            onApplyDraft={() => applyHeaderRename(item.column)}
                            onCancelDraft={() => setInlineEditMode(null)}
                            onStartEditing={() =>
                              setInlineEditMode({
                                kind: 'header',
                                columnKey: item.column.key,
                                draft: getColumnTitleText(item.column),
                              })
                            }
                            onHoverChange={(nextHovered) =>
                              setHoveredColumnId(nextHovered ? item.dragId : null)
                            }
                            cellContent={renderColumnCellContent(item.column)}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </SortableContext>
            </DndContext>
          ) : (
            <div className={styles.emptyState}>当前没有可显示的表格列。</div>
          )}
        </div>
        {pagination !== false ? (
          <div className={styles.pagination}>
            <span>
              每页 {pagination?.defaultPageSize ?? 10} 条
              {pagination?.showSizeChanger ? '，支持切换页大小' : ''}
            </span>
            <div className={styles.pagerGroup}>
              <span className={styles.pageBadge}>1</span>
              <span className={styles.pageBadge}>2</span>
              <span className={styles.pageBadge}>3</span>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
});

DumbProTableForPreview.displayName = 'DumbProTableForPreview';

export default DumbProTableForPreview;
