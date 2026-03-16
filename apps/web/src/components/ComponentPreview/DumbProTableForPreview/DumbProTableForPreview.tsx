import React from 'react';
import { Col, Row } from 'antd';
import { type DragEndEvent, DndContext, closestCenter, useSensor, useSensors } from '@dnd-kit/core';
import { restrictToHorizontalAxis } from '@dnd-kit/modifiers';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { AltDragPointerSensor } from '@/components/ComponentPreview/altDragPointerSensor';
import { createSchemaColumnSource, focusSchemaColumn } from '@/editing/bindings/schemaColumns';
import { selectActiveEditingSource } from '@/editing/store/selectors';
import { isSameEditableSource } from '@/editing/types/EditableSource';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  moveColumnForSelectedNode,
  selectNode,
  upsertColumnOfSelectedNode,
} from '@/store/componentTreeSlice/componentTreeSlice';
import { componentNodesSelectors } from '@/store/componentTreeSlice/componentTreeSelectors';
import { entityModelSelectors } from '@/store/entityModelSlice/selectors';
import type { ProCommonColumn } from '@/types';
import { getFieldLabel, getFieldName, getColumnDragId } from '../BetaSchemaFormForPreview/helper';
import { ColumnCellSlot } from '../ProTableForPreview/ColumnCellSlot';
import { generateDataSource } from '../ProTableForPreview/mapValueTypeToValue';
import { SortableHeaderCell } from './SortableHeaderCell';
import { SortableSearchField } from './SortableSearchField';
import * as styles from './DumbProTableForPreview.css';
import { getColumnTitleText, useToolbarActionNodes } from './shared';
import type { InlineEditMode, SerializableProTableProps } from './types';

type ActiveColumnSurface = {
  dragId: string;
  kind: 'header' | 'search-label';
};

export const DumbProTableForPreview: React.FC<SerializableProTableProps> = React.memo((props) => {
  const {
    previewNodeId,
    columns = [],
    rowActions,
    toolbar,
    headerTitle,
    search = { layout: 'vertical', defaultCollapsed: false },
  } = props;
  const dispatch = useAppDispatch();
  const activeSource = useAppSelector(selectActiveEditingSource);
  const [hoveredColumnId, setHoveredColumnId] = React.useState<string | null>(null);
  const [inlineEditMode, setInlineEditMode] = React.useState<InlineEditMode>(null);
  const [activeColumnSurface, setActiveColumnSurface] = React.useState<ActiveColumnSurface | null>(
    null,
  );
  const sensors = useSensors(
    useSensor(AltDragPointerSensor, {
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

      const columnIndex = columns.findIndex((item) => item.key === column.key);
      if (columnIndex >= 0) {
        setActiveColumnSurface({
          dragId: getColumnDragId(column, columnIndex),
          kind: 'header',
        });
      }

      dispatch(
        focusSchemaColumn({
          ownerNodeId: previewNodeId,
          column,
          columnIndex,
          interactionSource: 'canvas',
          surface: 'header',
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

      const columnIndex = columns.findIndex((item) => item.key === column.key);
      if (columnIndex >= 0) {
        setActiveColumnSurface({
          dragId: getColumnDragId(column, columnIndex),
          kind: 'search-label',
        });
      }

      dispatch(
        focusSchemaColumn({
          ownerNodeId: previewNodeId,
          column,
          columnIndex,
          interactionSource: 'canvas',
          surface: 'search-field',
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
      {search !== false ? (
        <section className={`${styles.surface} ${styles.searchPanel}`}>
          <div className={styles.section}>
            {visibleSearchColumns.length > 0 ? (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleSearchDragEnd}
              >
                <SortableContext items={visibleSearchColumns.map((item) => item.dragId)}>
                  <Row gutter={[16, 16]}>
                    {visibleSearchColumns.map((item) => {
                      const columnSource = previewNodeId
                        ? createSchemaColumnSource({
                            ownerNodeId: previewNodeId,
                            column: item.column,
                            columnIndex: item.columnIndex,
                            surface: 'search-field',
                          })
                        : null;
                      const matchesActiveSource = isSameEditableSource(activeSource, columnSource);
                      const isEditing =
                        inlineEditMode?.kind === 'search-label' &&
                        inlineEditMode.columnKey === item.column.key;
                      const isSelected =
                        matchesActiveSource &&
                        activeColumnSurface?.kind === 'search-label' &&
                        activeColumnSurface.dragId === item.dragId;
                      return (
                        <Col key={item.dragId} xs={24} sm={12} md={8}>
                          <SortableSearchField
                            key={item.dragId}
                            item={item}
                            previewNodeId={previewNodeId}
                            entityFields={entityFields}
                            isSelected={isSelected}
                            onFocus={() =>
                              setActiveColumnSurface({
                                dragId: item.dragId,
                                kind: 'search-label',
                              })
                            }
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
                            onStartEditing={() => {
                              setActiveColumnSurface({
                                dragId: item.dragId,
                                kind: 'search-label',
                              });
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
                              });
                            }}
                          />
                        </Col>
                      );
                    })}
                  </Row>
                </SortableContext>
              </DndContext>
            ) : (
              <div className={styles.emptyState}>所有列都被设置为仅表格显示，暂无查询表单项。</div>
            )}
          </div>
        </section>
      ) : null}

      <div className={styles.section}>
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
                          surface: 'header',
                        })
                      : null;
                    const isSelected = isSameEditableSource(activeSource, columnSource);
                    const showSelected =
                      isSelected &&
                      (activeColumnSurface
                        ? activeColumnSurface.kind === 'header' &&
                          activeColumnSurface.dragId === item.dragId
                        : true);
                    const isColumnActive = hoveredColumnId === item.dragId || showSelected;
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
                          isSelected={showSelected}
                          onFocus={() =>
                            setActiveColumnSurface({
                              dragId: item.dragId,
                              kind: 'header',
                            })
                          }
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
                          onStartEditing={() => {
                            setActiveColumnSurface({
                              dragId: item.dragId,
                              kind: 'header',
                            });
                            setInlineEditMode({
                              kind: 'header',
                              columnKey: item.column.key,
                              draft: getColumnTitleText(item.column),
                            });
                          }}
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
    </div>
  );
});

DumbProTableForPreview.displayName = 'DumbProTableForPreview';

export default DumbProTableForPreview;
