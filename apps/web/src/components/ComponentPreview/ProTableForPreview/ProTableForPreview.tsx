import React from 'react';
import { ProTable } from '@ant-design/pro-components';
import { Button } from 'antd';
import type { ProColumns } from '@ant-design/pro-components';
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { restrictToHorizontalAxis } from '@dnd-kit/modifiers';
import { SortableContext, horizontalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { HolderOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { AddComponentIntoPreview } from '@/components/DropZone/DropZone';
import SlotItemWrapper from '@/components/SlotItemWrapper/SlotItemWrapper';
import type { NodeRef, ProCommonColumn, SchemaField } from '@/types';
import { mapProCommonColumnToProps } from '@/store/mapProCommonColumnToProps';
import {
  selectNode,
  moveColumnForSelectedNode,
  upsertColumnOfSelectedNode,
} from '@/store/componentTreeSlice/componentTreeSlice';
import { componentNodesSelectors } from '@/store/componentTreeSlice/componentTreeSelectors';
import { entityModelSelectors } from '@/store/entityModelSlice/selectors';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { createProCommonColumnFromSchemeField } from '@/components/SchemaBuilderModal/createProCommonColumnFromSchemeField';
import { ColumnTitleMenu } from './ColumnTitleMenu';
import { ColumnCellSlot } from './ColumnCellSlot';
import { generateDataSource } from './mapValueTypeToValue';
import { useRenderNodeRefs } from '../propResolvers';
import { normalizeNodeRefs } from '../nodeRefLogic';

// drag styles are expressed via classnames in CSS; logic below assigns classes where needed.

import * as ptStyles from './ProTableForPreview.css';

type ProTableProps = React.ComponentProps<typeof ProTable>;

type PreviewExtras = {
  previewNodeId?: string;
};

type HeaderCellProps = React.HTMLAttributes<HTMLTableCellElement> & {
  id: string;
  disabled?: boolean;
  columnIndex?: number;
};

type BodyCellProps = React.HTMLAttributes<HTMLTableCellElement> & {
  id?: string;
};

const TableBodyCell: React.FC<BodyCellProps> = (props) => {
  return <td {...props} className={ptStyles.tableCell} />;
};

const TableHeaderCell: React.FC<HeaderCellProps> = ({ disabled, columnIndex, ...props }) => {
  const dispatch = useAppDispatch();
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: props.id,
    disabled,
  });

  const classes = [ptStyles.tableCell, ptStyles.tableHeader];
  if (isDragging) {
    classes.push(ptStyles.tableCellActive);
  }

  const headerAttrs: Record<string, any> = {};
  if (isDragging) headerAttrs['data-dragging'] = 'true';

  const headerChildren = typeof props.children === 'function' ? null : props.children;
  const resolvedIndex = typeof columnIndex === 'number' ? columnIndex : -1;

  const onInsertNewColumnBehind = () => {
    const newColumn = createProCommonColumnFromSchemeField(undefined, 'Table');
    newColumn.title = '新列';
    const insertPos = resolvedIndex >= 0 ? resolvedIndex + 1 : 1;
    dispatch(
      upsertColumnOfSelectedNode({
        insertPos,
        changes: newColumn,
      }),
    );
  };
  return (
    <th
      {...props}
      style={{ ...props.style, transform: CSS.Transform.toString(transform), transition }}
      ref={setNodeRef}
      className={classes.join(' ')}
    >
      <span className={ptStyles.headerContent}>
        <button
          type="button"
          ref={setActivatorNodeRef}
          className={`${ptStyles.handle} ${disabled ? ptStyles.handleDisabled : ''} ${isDragging ? ptStyles.handleDragging : ''}`}
          onClick={(event) => event.stopPropagation()}
          {...listeners}
          {...attributes}
          {...headerAttrs}
        >
          <HolderOutlined className={ptStyles.handleIcon} />
        </button>
        <div className={ptStyles.fieldActions}>
          <button type="button" className={ptStyles.actionButton}>
            <EditOutlined />
          </button>
          <button type="button" className={ptStyles.actionButton}>
            <DeleteOutlined />
          </button>
        </div>
        <span className={ptStyles.headerTitle}>{headerChildren}</span>
        <div className={ptStyles.addColumnIndicatorLayout}>
          <div className={ptStyles.addColumnIndicator} />
        </div>
        <div className={ptStyles.addColumnButtonWrapper}>
          <button
            type="button"
            className={ptStyles.addColumnButton}
            onClick={onInsertNewColumnBehind}
          >
            +
          </button>
        </div>
      </span>
    </th>
  );
};

const getColumnDragId = (column: ProCommonColumn, index: number) => {
  const dataIndex = Array.isArray(column.dataIndex) ? column.dataIndex.join('.') : column.dataIndex;
  return String(column.key ?? dataIndex ?? `col-${index}`);
};

const useToolbarActions = (
  toolbar: ProTableProps['toolbar'],
  previewNodeId: string | undefined,
) => {
  const toolbarActionRefs = React.useMemo(
    () => normalizeNodeRefs(toolbar?.actions),
    [toolbar?.actions],
  );
  const renderedToolbarActions = useRenderNodeRefs(toolbarActionRefs);

  return React.useMemo(() => {
    if (!toolbar) return undefined;
    if (!previewNodeId) {
      return {
        ...toolbar,
        actions: renderedToolbarActions,
      };
    }

    const wrappedActions = toolbarActionRefs.reduce<React.ReactNode[]>((acc, ref, index) => {
      const element = renderedToolbarActions[index];
      if (!element) return acc;
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

    wrappedActions.unshift(
      <AddComponentIntoPreview
        key="toolbar.actions:add"
        targetNodeId={previewNodeId}
        propPath="toolbar.actions"
        direction="horizontal"
        acceptTypes={['Button']}
      >
        {({ onClick }) => (
          <Button type="dashed" size="middle" icon={<PlusOutlined />} onClick={onClick} />
        )}
      </AddComponentIntoPreview>,
    );

    return {
      ...toolbar,
      actions: wrappedActions,
    };
  }, [previewNodeId, renderedToolbarActions, toolbar, toolbarActionRefs]);
};

const useMergedColumns = (params: {
  canDrag: boolean;
  entityFields: SchemaField[];
  previewNodeId: string | undefined;
  rowActions: NodeRef[] | undefined;
  columns: ProCommonColumn[] | Record<string, unknown>;
}) => {
  const { canDrag, entityFields, previewNodeId, rowActions, columns } = params;

  return React.useMemo(() => {
    if (!Array.isArray(columns)) return columns;
    return columns.map((column, index) => {
      const normalizedColumn = mapProCommonColumnToProps(column) as ProColumns<Record<string, any>>;
      const dragId = getColumnDragId(column, index);
      const columnIndex = index;

      const existingHeaderCell = normalizedColumn.onHeaderCell;
      normalizedColumn.onHeaderCell = (col: Record<string, any>) => ({
        ...(typeof existingHeaderCell === 'function' ? existingHeaderCell(col) : null),
        id: dragId,
        disabled: !canDrag,
        columnIndex,
      });

      const existingOnCell = normalizedColumn.onCell;
      normalizedColumn.onCell = (record: Record<string, any>, rowIndex?: number) => ({
        ...(typeof existingOnCell === 'function' ? existingOnCell(record, rowIndex) : null),
        id: dragId,
      });

      if (typeof normalizedColumn.title !== 'function') {
        normalizedColumn.title = (
          <ColumnTitleMenu
            column={column}
            columnIndex={columnIndex}
            tableNodeId={previewNodeId}
            entityFields={entityFields}
          >
            {normalizedColumn.title}
          </ColumnTitleMenu>
        );
      }

      if (typeof normalizedColumn.formItemProps !== 'function') {
        normalizedColumn.formItemProps = {
          ...normalizedColumn.formItemProps,
          label: (
            <ColumnTitleMenu
              column={column}
              columnIndex={columnIndex}
              tableNodeId={previewNodeId}
              entityFields={entityFields}
            >
              {normalizedColumn?.formItemProps?.label ?? column.title}
            </ColumnTitleMenu>
          ),
        };
      }

      if (previewNodeId && normalizedColumn.valueType === 'option') {
        normalizedColumn.render = () => (
          <ColumnCellSlot
            targetNodeId={previewNodeId}
            acceptTypes={['Button']}
            nodeRefs={rowActions || []}
            propPath="rowActions"
          />
        );
      }

      return normalizedColumn;
    });
  }, [canDrag, entityFields, previewNodeId, rowActions, columns]);
};

export type SerializableProTableProps = Omit<ProTableProps, 'columns'> &
  PreviewExtras & {
    columns?: ProCommonColumn[];
    rowActions?: NodeRef[];
  };

const ProTableForPreview: React.FC<SerializableProTableProps> = (props) => {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { previewNodeId, columns = [], rowActions, toolbar, ...restProps } = props;
  const dispatch = useAppDispatch();
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
  const dataSource = React.useMemo(() => [generateDataSource(columns)], [columns]);
  const mergedToolbar = useToolbarActions(toolbar, previewNodeId);
  const canDrag = Boolean(previewNodeId) && columns.length > 1;
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 4 },
    }),
  );
  const columnDragIds = React.useMemo(
    () => columns.map((column, index) => getColumnDragId(column, index)),
    [columns],
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
  const mergedColumns = useMergedColumns({
    canDrag,
    entityFields,
    previewNodeId,
    rowActions,
    columns,
  });

  const mergedComponents = React.useMemo(() => {
    const base = restProps.components ?? {};
    return {
      ...base,
      header: { ...base.header, cell: TableHeaderCell },
      body: { ...base.body, cell: TableBodyCell },
    };
  }, [restProps.components]);

  return (
    <DndContext
      sensors={sensors}
      modifiers={[restrictToHorizontalAxis]}
      onDragEnd={handleDragEnd}
      collisionDetection={closestCenter}
    >
      <SortableContext items={columnDragIds} strategy={horizontalListSortingStrategy}>
        <ProTable
          {...restProps}
          columns={mergedColumns as any}
          dataSource={dataSource}
          components={mergedComponents}
          toolbar={mergedToolbar}
        />
      </SortableContext>
    </DndContext>
  );
};

export default ProTableForPreview;
