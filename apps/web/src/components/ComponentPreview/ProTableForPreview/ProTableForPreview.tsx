import React from "react";
import { ProTable } from "@ant-design/pro-components";
import type { ProColumns } from "@ant-design/pro-components";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type {
  DragEndEvent,
  DragOverEvent,
  UniqueIdentifier,
} from "@dnd-kit/core";
import { restrictToHorizontalAxis } from "@dnd-kit/modifiers";
import {
  SortableContext,
  horizontalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { HolderOutlined } from "@ant-design/icons";
import type { NodeRef, ProCommonColumn } from "@/types";
import { mapProCommonColumnToProps } from "@/store/componentTree/mapProCommonColumnToProps";
import { componentTreeActions } from "@/store/componentTree/componentTreeSlice";
import {
  componentNodesSelectors,
  entityModelSelectors,
} from "@/store/componentTree/componentTreeSelectors";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { ColumnTitleMenu } from "./ColumnTitleMenu";
import { ColumnCellSlot } from "./ColumnCellSlot";
import { generateDataSource } from "./mapValueTypeToValue";

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
  direction?: "left" | "right";
};

type PlaceholderState = {
  id: string | null;
  index: number | null;
};

const DragIndexContext = React.createContext<DragIndexState>({
  active: null,
  over: null,
});

const PLACEHOLDER_PREFIX = "__drag_placeholder__";

const makePlaceholderId = (activeId: UniqueIdentifier) =>
  `${PLACEHOLDER_PREFIX}${String(activeId)}`;

const isPlaceholderId = (id: UniqueIdentifier | null) =>
  typeof id === "string" && id.startsWith(PLACEHOLDER_PREFIX);

const dragActiveStyle = (dragState: DragIndexState, id: string) => {
  const { active, over } = dragState;
  let style: React.CSSProperties = {};
  if (active && active === id) {
    style = {
      opacity: 0.5,
    };
  } else if (over && isPlaceholderId(id)) {
    style = {
      opacity: 0.4,
      borderInline: "1px solid #1677ff",
      backgroundColor: "rgba(22, 119, 255, 0.06)",
    };
  }
  return style;
};

const TableBodyCell: React.FC<BodyCellProps> = (props) => {
  const dragState = React.useContext(DragIndexContext);
  return (
    <td
      {...props}
      style={{
        ...props.style,
        ...dragActiveStyle(dragState, props.id),
        transition: "background-color 0.15s ease, border-color 0.15s ease",
      }}
    />
  );
};

const TableHeaderCell: React.FC<HeaderCellProps> = ({ disabled, ...props }) => {
  const dragState = React.useContext(DragIndexContext);
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, isDragging } =
    useSortable({
      id: props.id,
      disabled,
    });
  const style: React.CSSProperties = {
    ...props.style,
    cursor: disabled ? "default" : "grab",
    ...(isDragging
      ? { position: "relative", zIndex: 9999, userSelect: "none" }
      : {}),
    ...dragActiveStyle(dragState, props.id),
    transition: "background-color 0.15s ease, border-color 0.15s ease",
  };
  const handleStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 20,
    height: 20,
    borderRadius: 4,
    color: disabled ? "rgba(0, 0, 0, 0.25)" : "rgba(0, 0, 0, 0.45)",
    background: isDragging ? "rgba(22, 119, 255, 0.15)" : "transparent",
    transition: "background-color 0.15s ease, color 0.15s ease",
    cursor: disabled ? "default" : isDragging ? "grabbing" : "grab",
    flex: "0 0 auto",
  };
  const contentStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    width: "100%",
  };
  const headerChildren =
    typeof props.children === "function" ? null : props.children;
  return (
    <th {...props} ref={setNodeRef} style={style} {...attributes}>
      <span style={contentStyle}>
        <span
          ref={setActivatorNodeRef}
          style={handleStyle}
          onClick={(event) => event.stopPropagation()}
          {...listeners}
        >
          <HolderOutlined style={{ fontSize: 14 }} />
        </span>
        <span style={{ flex: 1, minWidth: 0 }}>{headerChildren}</span>
      </span>
    </th>
  );
};

const getColumnDragId = (column: ProCommonColumn, index: number) => {
  const dataIndex = Array.isArray(column.dataIndex)
    ? column.dataIndex.join(".")
    : column.dataIndex;
  return String(column.key ?? dataIndex ?? `col-${index}`);
};

export type SerializableProTableProps = Omit<ProTableProps, "columns"> &
  PreviewExtras & {
    columns?: ProCommonColumn[];
    rowActions?: NodeRef[];
  };

const ProTableForPreview: React.FC<SerializableProTableProps> = (props) => {
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
    return entityModelId
      ? entityModelSelectors.selectById(state, entityModelId)
      : null;
  });
  const entityFields = entityModel?.fields ?? [];
  const dataSource = [generateDataSource(columns)];
  const canDrag =
    Boolean(__previewNodeId) && Array.isArray(columns) && columns.length > 1;

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

    const activeIndex = columnDragIds.findIndex(
      (id) => id === dragState.active,
    );
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
  }, [
    columns,
    columnDragIds,
    dragState.active,
    placeholder.id,
    placeholder.index,
  ]);

  const visualColumnIds = React.useMemo(() => {
    if (!Array.isArray(visualColumns)) return [] as string[];
    return visualColumns.map((column, index) => getColumnDragId(column, index));
  }, [visualColumns]);

  const mergedColumns = React.useMemo(() => {
    if (!Array.isArray(visualColumns)) return visualColumns;
    return visualColumns.map((column, index) => {
      const normalizedColumn = mapProCommonColumnToProps(column) as ProColumns<
        Record<string, any>
      >;
      const dragId = getColumnDragId(column, index);
      const isPlaceholder = placeholder.id === dragId;
      const realIndex = columnDragIds.findIndex((id) => id === dragId);
      const columnIndex = realIndex >= 0 ? realIndex : index;

      const existingHeaderCell = normalizedColumn.onHeaderCell;
      normalizedColumn.onHeaderCell = (col: Record<string, any>) => ({
        ...(typeof existingHeaderCell === "function"
          ? existingHeaderCell(col)
          : null),
        id: dragId,
        disabled: !canDrag || isPlaceholder,
      });

      const existingOnCell = normalizedColumn.onCell;
      normalizedColumn.onCell = (
        record: Record<string, any>,
        rowIndex?: number,
      ) => ({
        ...(typeof existingOnCell === "function"
          ? existingOnCell(record, rowIndex)
          : null),
        id: dragId,
      });

      if (!isPlaceholder && typeof normalizedColumn.title !== "function") {
        normalizedColumn.title = (
          <ColumnTitleMenu
            column={column}
            columnIndex={columnIndex}
            columnsLength={columns.length}
            tableNodeId={__previewNodeId}
            entityFields={entityFields}
          >
            {normalizedColumn.title}
          </ColumnTitleMenu>
        );
      }

      if (
        !isPlaceholder &&
        typeof normalizedColumn.formItemProps !== "function"
      ) {
        normalizedColumn.formItemProps = {
          ...normalizedColumn.formItemProps,
          label: (
            <ColumnTitleMenu
              column={column}
              columnIndex={columnIndex}
              columnsLength={columns.length}
              tableNodeId={__previewNodeId}
              entityFields={entityFields}
            >
              {normalizedColumn?.formItemProps?.label ?? column.title}
            </ColumnTitleMenu>
          ),
        };
      }

      if (
        !isPlaceholder &&
        __previewNodeId &&
        normalizedColumn.valueType === "option"
      ) {
        normalizedColumn.render = () => (
          <ColumnCellSlot
            targetNodeId={__previewNodeId}
            acceptTypes={["Button"]}
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
    columns,
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
      const activeIndex = columnDragIds.findIndex((id) => id === active.id);
      const overIndex = columnDragIds.findIndex((id) => id === over.id);

      if (
        activeIndex === -1 ||
        overIndex === -1 ||
        activeIndex === overIndex ||
        overIndex === activeIndex + 1
      ) {
        setPlaceholder({ id: null, index: null });
        setDragState({ active: active.id, over: over.id });
        return;
      }

      setPlaceholder({
        id: makePlaceholderId(active.id),
        index: overIndex,
      });
      setDragState({
        active: active.id,
        over: over.id,
        direction: overIndex > activeIndex ? "right" : "left",
      });
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

      const from = columnDragIds.findIndex((id) => id === active.id);
      const hasPlaceholder = placeholder.id && placeholder.index !== null;
      const rawTarget = hasPlaceholder
        ? placeholder.index
        : columnDragIds.findIndex((id) => id === over.id);
      let to = typeof rawTarget === "number" ? rawTarget : -1;

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
    [
      canDrag,
      columnDragIds,
      dispatch,
      placeholder.id,
      placeholder.index,
      __previewNodeId,
    ],
  );

  const handleDragCancel = React.useCallback(() => {
    setDragState({ active: null, over: null });
    setPlaceholder({ id: null, index: null });
  }, []);

  const dragOverlayTitle = React.useMemo(() => {
    if (!dragState.active || !Array.isArray(columns)) return null;
    const index = columnDragIds.findIndex((id) => id === dragState.active);
    if (index === -1) return null;
    const title = columns[index]?.title;
    if (typeof title === "function") return null;
    return title ?? null;
  }, [columnDragIds, columns, dragState.active]);

  return (
    <DndContext
      sensors={sensors}
      modifiers={[restrictToHorizontalAxis]}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragCancel={handleDragCancel}
      collisionDetection={closestCenter}
    >
      <SortableContext
        items={visualColumnIds}
        strategy={horizontalListSortingStrategy}
      >
        <DragIndexContext.Provider value={dragState}>
          <ProTable
            {...restProps}
            columns={mergedColumns}
            dataSource={dataSource}
            components={mergedComponents}
          />
        </DragIndexContext.Provider>
      </SortableContext>
      <DragOverlay style={{ zIndex: 9999 }}>
        {dragOverlayTitle ? (
          <div
            style={{
              backgroundColor: "#f0f5ff",
              opacity: 0.8,
              padding: 12,
              boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
              border: "1px solid rgba(22, 119, 255, 0.35)",
            }}
          >
            <span
              style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
            >
              <HolderOutlined style={{ fontSize: 14, color: "#1677ff" }} />
              <span>{dragOverlayTitle}</span>
            </span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default ProTableForPreview;
