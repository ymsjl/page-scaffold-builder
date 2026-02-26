import React from 'react';
import { DeleteOutlined, HolderOutlined, PlusOutlined, EditOutlined } from '@ant-design/icons';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import * as styles from './SortableFormItemShell.css';

type SortableFormItemShellProps = {
  id: string;
  canDrag: boolean;
  onInsertBehind: () => void;
  onDelete: () => void;
  onEdit?: () => void;
  children: React.ReactNode;
};

export const SortableFormItemShell: React.FC<SortableFormItemShellProps> = React.memo(
  ({ id, canDrag, onInsertBehind, onDelete, onEdit, children }) => {
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
          <button type="button" className={styles.actionButton} onClick={onEdit}>
            <EditOutlined />
          </button>
          <button type="button" className={styles.actionButton} onClick={onDelete}>
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
