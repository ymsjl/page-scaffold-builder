import React from 'react';
import { Button, Dropdown, Input, Tooltip } from 'antd';
import type { MenuProps } from 'antd';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  DeleteOutlined,
  EditOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  HolderOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { EditableShell } from '@/components/EditableShell/EditableShell';
import {
  createSchemaColumnProjection,
  createSchemaColumnSource,
  focusSchemaColumn,
  openSchemaColumnEditor,
} from '@/editing/bindings/schemaColumns';
import { setHoverSource } from '@/editing/store/editingSlice';
import { useAppDispatch } from '@/store/hooks';
import {
  deleteColumnForSelectedNode,
  upsertColumnOfSelectedNode,
} from '@/store/componentTreeSlice/componentTreeSlice';
import type { ProCommonColumn, SchemaField } from '@/types';
import { buildInsertedColumn, getColumnTitleText } from './shared';
import * as styles from './DumbProTableForPreview.css';

type SortableHeaderCellProps = {
  dragId: string;
  column: ProCommonColumn;
  columnIndex: number;
  previewNodeId?: string;
  entityFields: SchemaField[];
  isColumnActive: boolean;
  isSelected: boolean;
  onFocus: () => void;
  isEditing: boolean;
  draftValue: string;
  onDraftChange: (nextValue: string) => void;
  onApplyDraft: () => void;
  onCancelDraft: () => void;
  onStartEditing: () => void;
  onHoverChange: (nextHovered: boolean) => void;
  cellContent: React.ReactNode;
};

export const SortableHeaderCell: React.FC<SortableHeaderCellProps> = React.memo(
  ({
    dragId,
    column,
    columnIndex,
    previewNodeId,
    entityFields,
    isColumnActive,
    isSelected,
    onFocus,
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

      onFocus();
      dispatch(
        focusSchemaColumn({
          ownerNodeId: previewNodeId,
          column,
          columnIndex,
          interactionSource: 'canvas',
        }),
      );
    }, [column, columnIndex, columnSource, dispatch, onFocus, previewNodeId]);

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

      onFocus();
      dispatch(
        openSchemaColumnEditor({
          ownerNodeId: previewNodeId,
          column,
          columnIndex,
          interactionSource: 'canvas',
        }),
      );
    }, [column, columnIndex, dispatch, onFocus, previewNodeId]);

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

        if (key === 'edit') {
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
          dispatch(
            upsertColumnOfSelectedNode({ key: column.key, hideInTable: !column.hideInTable }),
          );
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
          onClick={(event) => {
            event.stopPropagation();
            focusColumn();
          }}
          onDoubleClick={(event) => {
            event.stopPropagation();
            focusColumn();
            onStartEditing();
          }}
        >
          <span className={styles.headerTitleText}>{getColumnTitleText(column)}</span>
        </button>
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
        trigger={isEditing || !isSelected ? [] : ['contextMenu']}
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
  },
);

SortableHeaderCell.displayName = 'SortableHeaderCell';
