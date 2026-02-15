import React, { useCallback } from 'react';
import { Modal, List, Button, Space, Empty, Tag, message, Flex } from 'antd';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { componentTreeActions } from '@/store/componentTreeSlice/componentTreeSlice';
import {
  DeleteOutlined,
  EditOutlined,
  NodeExpandOutlined,
  HolderOutlined,
} from '@ant-design/icons';
import type { ProCommonColumn } from '@/types';
import {
  selectColumnsOfSelectedNode,
  selectEntityModelInUse,
} from '@/store/componentTreeSlice/componentTreeSelectors';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { SchemaBuilderModal } from './SchemaBuilderModal';
import * as styles from './SchemaBuilderModal.css';

const ValueTyps = [
  { label: '文本', value: 'text' },
  { label: '文本域', value: 'textarea' },
  { label: '密码', value: 'password' },
  { label: '数字', value: 'digit' },
  { label: '日期', value: 'date' },
  { label: '日期时间', value: 'dateTime' },
  { label: '日期范围', value: 'dateRange' },
  { label: '时间', value: 'time' },
  { label: '下拉选择', value: 'select' },
  { label: '多选', value: 'checkbox' },
  { label: '单选', value: 'radio' },
  { label: '开关', value: 'switch' },
  { label: '进度条', value: 'progress' },
  { label: '百分比', value: 'percent' },
  { label: '金额', value: 'money' },
];

interface SchemaListProps {
  selectedEntityModelId?: string;
}

interface SortableItemProps {
  field: ProCommonColumn;
  onEdit: (field: ProCommonColumn) => void;
  onDelete: (key: string) => void;
}

const SortableItem: React.FC<SortableItemProps> = React.memo(({ field, onEdit, onDelete }) => {
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
    <List.Item ref={setNodeRef} style={style}>
      <Flex gap={8} className={styles.fullWidth} align="center">
        <div {...attributes} {...listeners} className={styles.dragHandle}>
          <HolderOutlined className={styles.dragIcon} />
        </div>
        <div className={styles.fieldTitle}>{field.title}</div>
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
});

SortableItem.displayName = 'SortableItem';

const AddColumnsFromEntityModelButton: React.FC = React.memo(() => {
  const dispatch = useAppDispatch();
  const entityFields = useAppSelector(selectEntityModelInUse)?.fields || [];

  const handleAddColumnsFromEntityModel = useCallback(() => {
    dispatch(componentTreeActions.addColumnsFromEntityModelToSelectedNode());
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

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  const handleStartEdit = useCallback(
    (field: ProCommonColumn) => dispatch(componentTreeActions.startEditingColumn(field)),
    [dispatch],
  );

  const handleDelete = useCallback(
    (key: string) => {
      Modal.confirm({
        title: '确认删除',
        content: '确定要删除这个字段吗？',
        onOk: () => {
          dispatch(componentTreeActions.deleteColumnForSelectedNode(key));
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
          componentTreeActions.moveColumnForSelectedNode({
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
                renderItem={(field) => (
                  <SortableItem
                    key={field.key}
                    field={field}
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
