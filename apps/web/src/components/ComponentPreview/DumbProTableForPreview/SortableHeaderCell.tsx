import React from 'react';
import { Button, Dropdown, Tooltip } from 'antd';
import type { MenuProps } from 'antd';
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
import { setHoverSource } from '@/editing/store/editingSlice';
import { useAppDispatch } from '@/store/hooks';
import type { ProCommonColumn, SchemaField } from '@/types';
import { InlineEditableText } from './InlineEditableText';
import { getColumnTitleText } from './shared';
import * as styles from './DumbProTableForPreview.css';
import { useSortableSchemaColumn } from './useSortableSchemaColumn';

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
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
      canOperate,
      columnSource,
      projection,
      insertItems,
      focusColumn,
      insertBehind,
      handleDelete,
      handleEdit,
      updateColumn,
    } = useSortableSchemaColumn({
      dragId,
      column,
      columnIndex,
      previewNodeId,
      entityFields,
      onFocus,
      emptyInsertLabel: '空列',
    });

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
          updateColumn({ hideInSearch: !column.hideInSearch });
          return;
        }

        if (key === 'hideInTable') {
          updateColumn({ hideInTable: !column.hideInTable });
        }
      },
      [column, focusColumn, handleDelete, handleEdit, insertBehind, previewNodeId, updateColumn],
    );

    const controlButtonClassName = isDragging
      ? `${styles.controlButton} ${styles.dragButton} ${styles.dragButtonDragging}`
      : `${styles.controlButton} ${styles.dragButton}`;

    const editableContent = (
      <InlineEditableText
        isEditing={isEditing}
        draftValue={draftValue}
        displayText={getColumnTitleText(column)}
        onDraftChange={onDraftChange}
        onApplyDraft={onApplyDraft}
        onCancelDraft={onCancelDraft}
        onActivate={focusColumn}
        onStartEditing={onStartEditing}
        buttonClassName={styles.headerTitleButton}
        textClassName={styles.headerTitleText}
        wrapperClassName={styles.headerContent}
      />
    );

    const columnShell = projection ? (
      <EditableShell
        target={projection}
        selected={isSelected}
        className={`${styles.columnShell} ${styles.shellStretch} ${isDragging ? styles.draggingShell : ''}`}
        onSelect={(event) => {
          if (event.type !== 'contextmenu') {
            event.stopPropagation();
          }
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
        <Dropdown
          trigger={isEditing ? [] : ['contextMenu']}
          menu={{ items: menuItems, onClick: handleMenuClick }}
        >
          <div className={styles.columnContent}>
            <div className={styles.headerShell}>{editableContent}</div>
            <div className={styles.bodyCell}>{cellContent}</div>
          </div>
        </Dropdown>
      </EditableShell>
    ) : (
      <div className={styles.columnContent}>
        <div className={styles.headerShell}>{editableContent}</div>
        <div className={styles.bodyCell}>{cellContent}</div>
      </div>
    );

    return (
      <div
        ref={setNodeRef}
        style={{ transform: CSS.Transform.toString(transform), transition }}
        className={
          isColumnActive ? `${styles.columnLane} ${styles.columnLaneActive}` : styles.columnLane
        }
      >
        {columnShell}
      </div>
    );
  },
);

SortableHeaderCell.displayName = 'SortableHeaderCell';
