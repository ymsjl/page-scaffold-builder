import React from 'react';
import { Button, Dropdown, Tooltip } from 'antd';
import type { MenuProps } from 'antd';
import { CSS } from '@dnd-kit/utilities';
import { DeleteOutlined, EditOutlined, NumberOutlined, PlusOutlined } from '@ant-design/icons';
import { EditableShell } from '@/components/EditableShell/EditableShell';
import { setHoverSource } from '@/editing/store/editingSlice';
import { useAppDispatch } from '@/store/hooks';
import type { SchemaField } from '@/types';
import { getFieldLabel, getFieldName } from '../BetaSchemaFormForPreview/helper';
import { InlineEditableText } from './InlineEditableText';
import { renderSearchControl } from './shared';
import type { SearchableColumn } from './types';
import * as styles from './DumbProTableForPreview.css';
import { useSortableSchemaColumn } from './useSortableSchemaColumn';

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
      emptyInsertLabel: '空字段',
      surface: 'search-field',
    });

    const labelText = String(
      getFieldLabel(
        column as Record<string, unknown>,
        getFieldName(column as Record<string, unknown>, columnIndex),
      ),
    );

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
          updateColumn({ hideInSearch: !column.hideInSearch });
        }
      },
      [column, focusColumn, handleDelete, handleEdit, insertBehind, previewNodeId, updateColumn],
    );

    const editableLabel = (
      <InlineEditableText
        isEditing={isEditing}
        draftValue={draftValue}
        displayText={labelText}
        onDraftChange={onDraftChange}
        onApplyDraft={onApplyDraft}
        onCancelDraft={onCancelDraft}
        onActivate={() => focusColumn()}
        onStartEditing={onStartEditing}
        buttonClassName={styles.labelButton}
        textClassName={styles.labelText}
      />
    );

    const fieldShell = projection ? (
      <EditableShell
        target={projection}
        selected={isSelected}
        dragActivatorProps={canOperate ? { ...listeners, ...attributes } : undefined}
        altDragEnabled={canOperate}
        data-dragging={isDragging || undefined}
        className={`${styles.shellStretch} ${isDragging ? styles.draggingShell : ''}`}
        onSelect={(event) => {
          if (event.type !== 'contextmenu') {
            event.stopPropagation();
            focusColumn();
          }
        }}
        onMouseEnter={() => {
          if (columnSource) {
            dispatch(setHoverSource(columnSource));
          }
        }}
        onMouseLeave={() => dispatch(setHoverSource(null))}
        toolbar={
          <div className={styles.compactToolbar}>
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
        <Dropdown
          trigger={isEditing ? [] : ['contextMenu']}
          menu={{ items: menuItems, onClick: handleMenuClick }}
        >
          <div className={styles.fieldContent}>
            <div className={styles.fieldLabelRow}>{editableLabel}</div>
            <div className={styles.fieldControl}>{renderSearchControl(column, columnIndex)}</div>
          </div>
        </Dropdown>
      </EditableShell>
    ) : (
      <div className={styles.fieldContent}>
        <div className={styles.fieldLabelRow}>{editableLabel}</div>
        <div className={styles.fieldControl}>{renderSearchControl(column, columnIndex)}</div>
      </div>
    );

    return (
      <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }}>
        {fieldShell}
      </div>
    );
  },
);

SortableSearchField.displayName = 'SortableSearchField';
