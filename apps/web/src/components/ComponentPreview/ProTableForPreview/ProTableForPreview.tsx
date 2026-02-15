import React from 'react';
import { ProTable } from '@ant-design/pro-components';
import type { ProColumns } from '@ant-design/pro-components';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent, DragOverEvent, UniqueIdentifier } from '@dnd-kit/core';
import { restrictToHorizontalAxis } from '@dnd-kit/modifiers';
import { SortableContext, horizontalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { HolderOutlined } from '@ant-design/icons';
import type { NodeRef, ProCommonColumn } from '@/types';
import { mapProCommonColumnToProps } from '@/store/mapProCommonColumnToProps';
import { componentTreeActions } from '@/store/componentTreeSlice/componentTreeSlice';
import {
  componentNodesSelectors,
  entityModelSelectors,
} from '@/store/componentTreeSlice/componentTreeSelectors';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { ColumnTitleMenu } from './ColumnTitleMenu';
import { ColumnCellSlot } from './ColumnCellSlot';
import { generateDataSource } from './mapValueTypeToValue';

// drag styles are expressed via classnames in CSS; logic below assigns classes where needed.

import * as ptStyles from './ProTableForPreview.css';

type ProTableProps = React.ComponentProps<typeof ProTable>;

type PreviewExtras = {
  __previewNodeId?: string;
};

type HeaderCellProps = React.HTMLAttributes<HTMLTableCellElement> & {
  id: string;
  disabled?: boolean;
};

type BodyCellProps = React.HTMLAttributes<HTMLTableCellElement> & {
  id: string;
};

type DragIndexState = {
  active: UniqueIdentifier | null;
  over: UniqueIdentifier | null;
};

type PlaceholderState = {
  id: string | null;
  index: number | null;
};

const DragIndexContext = React.createContext<DragIndexState>({
  active: null,
  over: null,
});

const PLACEHOLDER_PREFIX = '__drag_placeholder__';

const makePlaceholderId = (activeId: UniqueIdentifier) =>
  `${PLACEHOLDER_PREFIX}${String(activeId)}`;

const isPlaceholderId = (id: UniqueIdentifier | null) =>
  typeof id === 'string' && id.startsWith(PLACEHOLDER_PREFIX);

const getColumnIndexById = (columnDragIds: string[], id: UniqueIdentifier | null) => {
  if (!id) return -1;
  return columnDragIds.findIndex((columnId) => columnId === id);
};

const getColumnTitleText = (columns: ProCommonColumn[], index: number) => {
  if (index < 0 || index >= columns.length) return null;
  const title = columns[index]?.title;
  if (typeof title === 'function') return null;
  if (typeof title === 'string' || typeof title === 'number') {
    return String(title);
  }
  return null;
};

const getDropTargetIndex = (from: number, rawTarget: number) => {
  let to = rawTarget;
  if (from < to) {
    to -= 1;
  }
  return to;
};

const getRawTargetIndex = (from: number, overIndex: number) =>
  overIndex + (overIndex > from ? 1 : 0);

const getDragOverlayHint = (params: {
  columns: ProCommonColumn[];
  columnDragIds: string[];
  dragState: DragIndexState;
  placeholder: PlaceholderState;
  dragTitleText: string | null;
}) => {
  const { columns, columnDragIds, dragState, placeholder, dragTitleText } = params;
  if (!dragTitleText || !dragState.active) return null;

  const from = getColumnIndexById(columnDragIds, dragState.active);
  if (from === -1) return `把 ${dragTitleText} 移到这里`;

  const overIndex = getColumnIndexById(columnDragIds, dragState.over);
  if (overIndex === -1) return `把 ${dragTitleText} 移到这里`;

  const rawTarget =
    placeholder.id && placeholder.index !== null
      ? placeholder.index
      : getRawTargetIndex(from, overIndex);
  const to = getDropTargetIndex(from, rawTarget);

  if (to === from) {
    return `把 ${dragTitleText} 放回原位`;
  }

  const isMovingRight = to > from;
  const baseTitleText = getColumnTitleText(columns, overIndex);
  if (!baseTitleText) return `把 ${dragTitleText} 移到这里`;

  const direction = isMovingRight ? '后面' : '前面';
  return `把 ${dragTitleText} 移到 ${baseTitleText} 的${direction}`;
};

const TableBodyCell: React.FC<BodyCellProps> = (props) => {
  const { id, style } = props;
  const dragState = React.useContext(DragIndexContext);
  const classes = [ptStyles.tableCell];
  if (dragState.active && dragState.active === id) {
    classes.push(ptStyles.tableCellActive);
  } else if (dragState.over && isPlaceholderId(id)) {
    classes.push(ptStyles.tableCellPlaceholder);
  }
  return <td {...props} className={classes.join(' ')} style={style} />;
};

const TableHeaderCell: React.FC<HeaderCellProps> = ({ disabled, ...props }) => {
  const dragState = React.useContext(DragIndexContext);
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, isDragging } = useSortable({
    id: props.id,
    disabled,
  });

  const classes = [ptStyles.tableCell, ptStyles.tableHeader];
  if (dragState.active && dragState.active === props.id) {
    classes.push(ptStyles.tableCellActive);
  } else if (dragState.over && isPlaceholderId(props.id)) {
    classes.push(ptStyles.tableCellPlaceholder);
  }

  const headerAttrs: Record<string, any> = {};
  if (isDragging) headerAttrs['data-dragging'] = 'true';

  const headerChildren = typeof props.children === 'function' ? null : props.children;

  return (
    <th
      {...props}
      ref={setNodeRef}
      className={classes.join(' ')}
      style={props.style}
      {...attributes}
      {...headerAttrs}
    >
      <span className={ptStyles.headerContent}>
        <button
          type="button"
          ref={setActivatorNodeRef}
          className={`${ptStyles.handle} ${disabled ? ptStyles.handleDisabled : ''} ${isDragging ? ptStyles.handleDragging : ''}`}
          onClick={(event) => event.stopPropagation()}
          {...listeners}
        >
          <HolderOutlined className={ptStyles.handleIcon} />
        </button>
        <span className={ptStyles.headerTitle}>{headerChildren}</span>
      </span>
    </th>
  );
};

const getColumnDragId = (column: ProCommonColumn, index: number) => {
  const dataIndex = Array.isArray(column.dataIndex) ? column.dataIndex.join('.') : column.dataIndex;
  return String(column.key ?? dataIndex ?? `col-${index}`);
};

export type SerializableProTableProps = Omit<ProTableProps, 'columns'> &
  PreviewExtras & {
    columns?: ProCommonColumn[];
    rowActions?: NodeRef[];
  };

const ProTableForPreview: React.FC<SerializableProTableProps> = (props) => {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { __previewNodeId, columns = [], rowActions, ...restProps } = props;
  const dispatch = useAppDispatch();
  const tableNode = useAppSelector((state) =>
    __previewNodeId
      ? (componentNodesSelectors.selectById(state, __previewNodeId) as
          | { props?: { entityModelId?: string } }
          | undefined)
      : undefined,
  );
  const entityModel = useAppSelector((state) => {
    const entityModelId = tableNode?.props?.entityModelId;
    return entityModelId ? entityModelSelectors.selectById(state, entityModelId) : null;
  });
  const entityFields = React.useMemo(() => entityModel?.fields ?? [], [entityModel]);
  const dataSource = [generateDataSource(columns)];
  const canDrag = Boolean(__previewNodeId) && Array.isArray(columns) && columns.length > 1;

  const [dragState, setDragState] = React.useState<DragIndexState>({
    active: null,
    over: null,
  });
  const [placeholder, setPlaceholder] = React.useState<PlaceholderState>({
    id: null,
    index: null,
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 4 },
    }),
  );

  const columnDragIds = React.useMemo(() => {
    if (!Array.isArray(columns)) return [] as string[];
    return columns.map((column, index) => getColumnDragId(column, index));
  }, [columns]);

  const visualColumns = React.useMemo(() => {
    if (!Array.isArray(columns)) return columns;
    if (!placeholder.id || placeholder.index === null) return columns;

    const activeIndex = columnDragIds.findIndex((id) => id === dragState.active);
    if (activeIndex === -1) return columns;

    const sourceColumn = columns[activeIndex];
    if (!sourceColumn) return columns;

    const placeholderColumn = {
      ...sourceColumn,
      key: placeholder.id,
      hideInSearch: true,
    } as ProCommonColumn;

    const next = [...columns];
    const insertIndex = Math.min(Math.max(placeholder.index, 0), next.length);
    next.splice(insertIndex, 0, placeholderColumn);
    return next;
  }, [columns, columnDragIds, dragState.active, placeholder.id, placeholder.index]);

  const visualColumnIds = React.useMemo(() => {
    if (!Array.isArray(visualColumns)) return [] as string[];
    return visualColumns.map((column, index) => getColumnDragId(column, index));
  }, [visualColumns]);

  const mergedColumns = React.useMemo(() => {
    if (!Array.isArray(visualColumns)) return visualColumns;
    return visualColumns.map((column, index) => {
      const normalizedColumn = mapProCommonColumnToProps(column) as ProColumns<Record<string, any>>;
      const dragId = getColumnDragId(column, index);
      const isPlaceholder = placeholder.id === dragId;
      const realIndex = columnDragIds.findIndex((id) => id === dragId);
      const columnIndex = realIndex >= 0 ? realIndex : index;

      const existingHeaderCell = normalizedColumn.onHeaderCell;
      normalizedColumn.onHeaderCell = (col: Record<string, any>) => ({
        ...(typeof existingHeaderCell === 'function' ? existingHeaderCell(col) : null),
        id: dragId,
        disabled: !canDrag || isPlaceholder,
      });

      const existingOnCell = normalizedColumn.onCell;
      normalizedColumn.onCell = (record: Record<string, any>, rowIndex?: number) => ({
        ...(typeof existingOnCell === 'function' ? existingOnCell(record, rowIndex) : null),
        id: dragId,
      });

      if (!isPlaceholder && typeof normalizedColumn.title !== 'function') {
        normalizedColumn.title = (
          <ColumnTitleMenu
            column={column}
            columnIndex={columnIndex}
            tableNodeId={__previewNodeId}
            entityFields={entityFields}
          >
            {normalizedColumn.title}
          </ColumnTitleMenu>
        );
      }

      if (!isPlaceholder && typeof normalizedColumn.formItemProps !== 'function') {
        normalizedColumn.formItemProps = {
          ...normalizedColumn.formItemProps,
          label: (
            <ColumnTitleMenu
              column={column}
              columnIndex={columnIndex}
              tableNodeId={__previewNodeId}
              entityFields={entityFields}
            >
              {normalizedColumn?.formItemProps?.label ?? column.title}
            </ColumnTitleMenu>
          ),
        };
      }

      if (!isPlaceholder && __previewNodeId && normalizedColumn.valueType === 'option') {
        normalizedColumn.render = () => (
          <ColumnCellSlot
            targetNodeId={__previewNodeId}
            acceptTypes={['Button']}
            nodeRefs={rowActions || []}
            propPath="rowActions"
          />
        );
      }

      return normalizedColumn;
    });
  }, [
    canDrag,
    columnDragIds,
    __previewNodeId,
    entityFields,
    placeholder.id,
    rowActions,
    visualColumns,
  ]);

  const mergedComponents = React.useMemo(() => {
    const base = restProps.components ?? {};
    return {
      ...base,
      header: { ...base.header, cell: TableHeaderCell },
      body: { ...base.body, cell: TableBodyCell },
    };
  }, [restProps.components]);

  const handleDragOver = React.useCallback(
    ({ active, over }: DragOverEvent) => {
      if (!over || !canDrag) return;
      if (isPlaceholderId(over.id)) return;
      const activeIndex = getColumnIndexById(columnDragIds, active.id);
      const overIndex = getColumnIndexById(columnDragIds, over.id);

      if (activeIndex === -1 || overIndex === -1 || activeIndex === overIndex) {
        setPlaceholder({ id: null, index: null });
        setDragState({ active: active.id, over: over.id });
        return;
      }

      const rawTarget = getRawTargetIndex(activeIndex, overIndex);
      const to = getDropTargetIndex(activeIndex, rawTarget);
      if (to === activeIndex) {
        setPlaceholder({ id: null, index: null });
        setDragState({ active: active.id, over: over.id });
        return;
      }

      setPlaceholder({ id: makePlaceholderId(active.id), index: rawTarget });
      setDragState({ active: active.id, over: over.id });
    },
    [canDrag, columnDragIds],
  );

  const handleDragEnd = React.useCallback(
    ({ active, over }: DragEndEvent) => {
      if (!over || !canDrag) {
        setDragState({ active: null, over: null });
        setPlaceholder({ id: null, index: null });
        return;
      }

      const from = getColumnIndexById(columnDragIds, active.id);
      const hasPlaceholder = placeholder.id && placeholder.index !== null;
      const rawTarget = hasPlaceholder
        ? placeholder.index
        : getRawTargetIndex(from, getColumnIndexById(columnDragIds, over.id));
      let to = typeof rawTarget === 'number' ? rawTarget : -1;

      if (from === -1 || to === -1 || !__previewNodeId) {
        setDragState({ active: null, over: null });
        setPlaceholder({ id: null, index: null });
        return;
      }

      if (from < to) {
        to -= 1;
      }

      if (from === to) {
        setDragState({ active: null, over: null });
        setPlaceholder({ id: null, index: null });
        return;
      }

      dispatch(componentTreeActions.selectNode(__previewNodeId));
      dispatch(componentTreeActions.moveColumnForSelectedNode({ from, to }));
      setDragState({ active: null, over: null });
      setPlaceholder({ id: null, index: null });
    },
    [canDrag, columnDragIds, dispatch, placeholder.id, placeholder.index, __previewNodeId],
  );

  const handleDragCancel = React.useCallback(() => {
    setDragState({ active: null, over: null });
    setPlaceholder({ id: null, index: null });
  }, []);

  const dragOverlayTitle = React.useMemo(() => {
    if (!dragState.active || !Array.isArray(columns)) return null;
    const index = getColumnIndexById(columnDragIds, dragState.active);
    if (index === -1) return null;
    const title = columns[index]?.title;
    if (typeof title === 'function') return null;
    return title ?? null;
  }, [columnDragIds, columns, dragState.active]);

  const dragOverlayTitleText = React.useMemo(() => {
    if (!dragState.active || !Array.isArray(columns)) return null;
    const index = getColumnIndexById(columnDragIds, dragState.active);
    return getColumnTitleText(columns, index);
  }, [columnDragIds, columns, dragState.active]);

  const dragOverlayHint = React.useMemo(() => {
    if (!Array.isArray(columns)) return null;
    return getDragOverlayHint({
      columns,
      columnDragIds,
      dragState,
      placeholder,
      dragTitleText: dragOverlayTitleText,
    });
  }, [columnDragIds, columns, dragOverlayTitleText, dragState, placeholder]);

  return (
    <DndContext
      sensors={sensors}
      modifiers={[restrictToHorizontalAxis]}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragCancel={handleDragCancel}
      collisionDetection={closestCenter}
    >
      <SortableContext items={visualColumnIds} strategy={horizontalListSortingStrategy}>
        <DragIndexContext.Provider value={dragState}>
          <ProTable
            {...restProps}
            columns={mergedColumns as any}
            dataSource={dataSource}
            components={mergedComponents}
          />
        </DragIndexContext.Provider>
      </SortableContext>
      <DragOverlay className={ptStyles.dragOverlay} dropAnimation={{ duration: 150 }}>
        {dragOverlayTitle ? (
          <div className={ptStyles.dragPreview}>
            <div className={ptStyles.dragHint}>{dragOverlayHint ?? ''}</div>
            <span className={ptStyles.dragContent}>
              <HolderOutlined className={ptStyles.dragIcon} />
              <span>{dragOverlayTitle}</span>
            </span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default ProTableForPreview;
