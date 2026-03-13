import React from 'react';
import { Button, Dropdown, Input, Tooltip } from 'antd';
import type { MenuProps } from 'antd';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  DeleteOutlined,
  EditOutlined,
  HolderOutlined,
  NumberOutlined,
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
import type { SchemaField } from '@/types';
import { getFieldLabel, getFieldName } from '../BetaSchemaFormForPreview/helper';
import { buildInsertedColumn, renderSearchControl } from './shared';
import type { SearchableColumn } from './types';
import * as styles from './DumbProTableForPreview.css';

type SortableSearchFieldProps = {
  item: SearchableColumn;
  previewNodeId?: string;
  isSelected: boolean;
  onFocus: () => void;
  isEditing: boolean;
  draftValue: string;
  onDraftChange: (nextValue: string) => void;
  onApplyDraft: () => void;
  onCancelDraft: () => void;
  onStartEditing: () => void;
  entityFields: SchemaField[];
};

export const SortableSearchField: React.FC<SortableSearchFieldProps> = React.memo(
  ({
    item,
    previewNodeId,
    isSelected,
    onFocus,
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
        { key: 'insert:empty', label: '空字段' },
        { type: 'divider' },
        ...entityFields.map((field) => ({ key: `insert:${field.key}`, label: field.key })),
      ];
    }, [entityFields]);

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
        { key: 'title', label: labelText, disabled: true },
        { key: 'edit', label: '编辑字段', icon: <EditOutlined />, disabled: !canOperate },
        { key: 'delete', label: '删除字段', icon: <DeleteOutlined />, disabled: !canOperate },
        {
          key: 'insert',
          label: '在后方新增字段',
          disabled: !canOperate,
          children: insertItems,
          icon: <PlusOutlined />,
        },
        { type: 'divider' },
        {
          key: 'hideInSearch',
          label: column.hideInSearch ? '显示表单项' : '隐藏表单项',
          disabled: !canOperate,
        },
        {
          key: 'rules',
          label: '数据校验规则',
          disabled: !canOperate,
          icon: <NumberOutlined />,
        },
      ],
      [canOperate, column.hideInSearch, insertItems, labelText],
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
        }
      },
      [column, dispatch, focusColumn, handleDelete, handleEdit, insertBehind, previewNodeId],
    );

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
        <span className={styles.labelText}>{labelText}</span>
      </button>
    );

    const fieldShell = projection ? (
      <EditableShell
        target={projection}
        selected={isSelected}
        className={`${styles.shellStretch} ${isDragging ? styles.draggingShell : ''}`}
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
        <div className={styles.fieldContent}>
          <div className={styles.fieldLabelRow}>{editableLabel}</div>
          <div className={styles.fieldControl}>{renderSearchControl(column, columnIndex)}</div>
        </div>
      </EditableShell>
    ) : (
      <div className={styles.fieldContent}>
        <div className={styles.fieldLabelRow}>{editableLabel}</div>
        <div className={styles.fieldControl}>{renderSearchControl(column, columnIndex)}</div>
      </div>
    );

    return projection ? (
      <Dropdown
        trigger={isEditing || !isSelected ? [] : ['contextMenu']}
        menu={{ items: menuItems, onClick: handleMenuClick }}
      >
        <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }}>
          {fieldShell}
        </div>
      </Dropdown>
    ) : (
      <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }}>
        {fieldShell}
      </div>
    );
  },
);

SortableSearchField.displayName = 'SortableSearchField';
