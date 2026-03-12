import React, { useCallback } from 'react';
import { Modal, List, Button, Space, Empty, Tag, message, Flex } from 'antd';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  deleteColumnForSelectedNode,
  moveColumnForSelectedNode,
} from '@/store/componentTreeSlice/componentTreeSlice';
import {
  DeleteOutlined,
  EditOutlined,
  NodeExpandOutlined,
  HolderOutlined,
} from '@ant-design/icons';
import type { ProCommonColumn } from '@/types';
import {
  selectActiveColumnTargetInPropertyPanel,
  selectColumnsOfSelectedNode,
  selectFieldsOfEntityModelInUse,
  selectNodeInPropertyPanel,
} from '@/store/componentTreeSlice/componentTreeSelectors';
import { addColumnsFromEntityModelToSelectedNode } from '@/store/componentTreeSlice/thunks';
import { focusSchemaColumn, openSchemaColumnEditor } from '@/editing/bindings/schemaColumns';

import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { SchemaBuilderModal } from './SchemaBuilderModal';
import * as styles from './SchemaBuilderModal.css';
import { ValueTyps } from './constants';

interface SchemaListProps {
  selectedEntityModelId?: string;
}

interface SortableItemProps {
  field: ProCommonColumn;
  fieldIndex: number;
  isActive: boolean;
  onFocus: (field: ProCommonColumn, fieldIndex: number) => void;
  onEdit: (field: ProCommonColumn) => void;
  onDelete: (key: string) => void;
}

const SortableItem: React.FC<SortableItemProps> = React.memo(
  ({ field, fieldIndex, isActive, onFocus, onEdit, onDelete }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
      id: field.key,
    });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
      cursor: isDragging ? 'grabbing' : 'grab',
    };

    const valueTypeLabel =
      ValueTyps.find((opt) => opt.value === field.valueType)?.label || field.valueType;

    return (
      <List.Item
        ref={setNodeRef}
        style={style}
        className={`${styles.sortableItem} ${isActive ? styles.sortableItemActive : ''}`}
      >
        <Flex gap={8} className={styles.fullWidth} align="center">
          <div {...attributes} {...listeners} className={styles.dragHandle}>
            <HolderOutlined className={styles.dragIcon} />
          </div>
          <Button
            type="text"
            className={styles.fieldTitle}
            onClick={() => onFocus(field, fieldIndex)}
          >
            {field.title}
          </Button>
          <Flex gap={8} wrap="wrap">
            <Tag color="blue">{valueTypeLabel}</Tag>
          </Flex>
          <Space size="small">
            <Button size="small" icon={<EditOutlined />} onClick={() => onEdit(field)} />
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => onDelete(field.key as string)}
            />
          </Space>
        </Flex>
      </List.Item>
    );
  },
);

SortableItem.displayName = 'SortableItem';

const AddColumnsFromEntityModelButton: React.FC = React.memo(() => {
  const dispatch = useAppDispatch();
  const entityFields = useAppSelector(selectFieldsOfEntityModelInUse);

  const handleAddColumnsFromEntityModel = useCallback(() => {
    dispatch(addColumnsFromEntityModelToSelectedNode());
  }, [dispatch]);

  return (
    <Button
      hidden={entityFields.length === 0}
      title="从实体模型添加列定义"
      onClick={handleAddColumnsFromEntityModel}
      icon={<NodeExpandOutlined />}
    >
      从实体模型添加列定义
    </Button>
  );
});

AddColumnsFromEntityModelButton.displayName = 'AddColumnsFromEntityModelButton';

export const SchemaList: React.FC<SchemaListProps> = React.memo(() => {
  const dispatch = useAppDispatch();
  const columns = useAppSelector(selectColumnsOfSelectedNode);
  const nodeInPropertyPanel = useAppSelector(selectNodeInPropertyPanel);
  const activeColumnTarget = useAppSelector(selectActiveColumnTargetInPropertyPanel);
  const ownerNodeId = nodeInPropertyPanel?.id;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  const handleStartEdit = useCallback(
    (field: ProCommonColumn) => {
      if (!ownerNodeId) {
        return;
      }

      const fieldIndex = columns.findIndex((column) => column.key === field.key);
      dispatch(
        openSchemaColumnEditor({
          ownerNodeId,
          column: field,
          columnIndex: fieldIndex >= 0 ? fieldIndex : undefined,
          interactionSource: 'panel',
        }),
      );
    },
    [columns, dispatch, ownerNodeId],
  );

  const handleFocus = useCallback(
    (field: ProCommonColumn, fieldIndex: number) => {
      if (!ownerNodeId) {
        return;
      }

      dispatch(
        focusSchemaColumn({
          ownerNodeId,
          column: field,
          columnIndex: fieldIndex,
          interactionSource: 'panel',
        }),
      );
    },
    [dispatch, ownerNodeId],
  );

  const handleDelete = useCallback(
    (key: string) => {
      Modal.confirm({
        title: '确认删除',
        content: '确定要删除这个字段吗？',
        onOk: () => {
          dispatch(deleteColumnForSelectedNode(key));
          message.success('字段已删除');
        },
      });
    },
    [dispatch],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (!over || active.id === over.id) {
        return;
      }

      const oldIndex = columns.findIndex((col) => col.key === active.id);
      const newIndex = columns.findIndex((col) => col.key === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        dispatch(
          moveColumnForSelectedNode({
            from: oldIndex,
            to: newIndex,
          }),
        );
        message.success('排序已更新');
      }
    },
    [columns, dispatch],
  );

  return (
    <>
      <SchemaBuilderModal />
      <Space direction="vertical" className={styles.fullWidth} size="middle">
        {columns.length === 0 ? (
          <Empty description="暂无字段, 点击上方按钮添加" image={Empty.PRESENTED_IMAGE_SIMPLE}>
            <AddColumnsFromEntityModelButton />
          </Empty>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={columns.map((col) => col.key)}
              strategy={verticalListSortingStrategy}
            >
              <List<ProCommonColumn>
                dataSource={columns}
                renderItem={(field, index) => (
                  <SortableItem
                    key={field.key}
                    field={field}
                    fieldIndex={index}
                    isActive={
                      !!activeColumnTarget &&
                      ((activeColumnTarget.itemKey && activeColumnTarget.itemKey === field.key) ||
                        (typeof activeColumnTarget.itemIndex === 'number' &&
                          activeColumnTarget.itemIndex === index))
                    }
                    onFocus={handleFocus}
                    onEdit={handleStartEdit}
                    onDelete={handleDelete}
                  />
                )}
              />
            </SortableContext>
          </DndContext>
        )}
      </Space>
    </>
  );
});

SchemaList.displayName = 'SchemaList';

export default SchemaList;
