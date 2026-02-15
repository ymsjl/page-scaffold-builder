import React from 'react';
import type { ComponentInstance, ComponentType } from '@/types';
import { PlusOutlined, DeleteOutlined, CheckOutlined, HolderOutlined } from '@ant-design/icons';
import { useDraggable } from '@dnd-kit/core';
import { useAppDispatch } from '@/store/hooks';
import {
  updateNode,
  removeNode,
  expandNode,
  addNodeToSlot,
} from '@/store/componentTreeSlice/componentTreeSlice';
import { availableComponents, getComponentPrototype } from '@/componentMetas';
import { Button, Input, Space, Dropdown, Typography } from 'antd';

import * as styles from './TreeNodeItem.css';

interface TreeNodeItemProps {
  node: ComponentInstance;
  level: number;
  showAddDropdownNodeId: string | null;
  setShowAddDropdownNodeId: (id: string | null) => void;
}

const TreeNodeItem: React.FC<TreeNodeItemProps> = ({
  node,
  level,
  showAddDropdownNodeId,
  setShowAddDropdownNodeId,
}) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editingName, setEditingName] = React.useState(node.name);

  const dispatch = useAppDispatch();
  const isAddDropdownVisible = showAddDropdownNodeId === node.id;

  // 仅为非容器组件启用拖拽
  const isDraggable = !node.isContainer;
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `tree-node-${node.id}`,
    data: {
      type: 'treeNode',
      nodeId: node.id,
      nodeType: node.type,
    },
    disabled: !isDraggable,
  });

  const style: React.CSSProperties = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.5 : 1,
      }
    : {};

  React.useEffect(() => {
    if (!isEditing) {
      setEditingName(node.name);
    }
  }, [node.name, isEditing]);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(removeNode(node.id));
  };

  const handleSaveEdit = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (editingName && editingName.trim()) {
      dispatch(
        updateNode({
          id: node.id,
          updates: { name: editingName.trim() },
        }),
      );
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditingName(node.name);
    }
  };

  const handleBlur = () => {
    handleSaveEdit();
  };

  const handleSelectComponentFromMenu = ({ key }: { key: string }) => {
    const type = key as ComponentType;
    if (!node?.id) {
      // eslint-disable-next-line no-console
      console.warn('[TreeNodeItem] handleSelectComponent: missing node id', node);
      return;
    }

    const prototype = getComponentPrototype(type);
    dispatch(
      addNodeToSlot({
        targetNodeId: node.id,
        propPath: 'children',
        type,
        label: prototype?.label,
        isContainer: prototype?.isContainer,
        defaultProps: prototype?.defaultProps,
      }),
    );
    dispatch(expandNode(node.id));
    setShowAddDropdownNodeId(null);
  };

  const dropdownItems = availableComponents.map((comp) => ({
    key: comp.type,
    label: comp.label,
  }));

  return (
    <div
      ref={setNodeRef}
      className={styles.root}
      style={{ paddingLeft: `${level * 8}px`, ...style }}
      {...attributes}
    >
      <div className={styles.row}>
        {/* 拖拽手柄 - 仅非容器组件显示 */}
        {isDraggable && (
          <div
            {...listeners}
            className={`${styles.handle} ${isDragging ? styles.handleGrabbing : ''}`}
          >
            <HolderOutlined className={styles.handleIcon} />
          </div>
        )}

        <div className={styles.nameContainer}>
          {isEditing ? (
            <Input
              size="small"
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleBlur}
              autoFocus
            />
          ) : (
            <Typography.Text
              onDoubleClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
                setEditingName(node.name);
              }}
            >
              {node.name}
            </Typography.Text>
          )}
        </div>

        <Space size={4} className={styles.actionsSpace}>
          {isEditing ? (
            <Button size="small" icon={<CheckOutlined />} onClick={handleSaveEdit} />
          ) : (
            <>
              {node.isContainer && (
                <Dropdown
                  menu={{
                    items: dropdownItems,
                    onClick: handleSelectComponentFromMenu,
                  }}
                  trigger={['click']}
                  open={isAddDropdownVisible}
                  onOpenChange={(open) => {
                    if (open) {
                      setShowAddDropdownNodeId(node.id);
                    } else {
                      setShowAddDropdownNodeId(null);
                    }
                  }}
                >
                  <Button
                    size="small"
                    type="text"
                    icon={<PlusOutlined />}
                    onClick={(e) => e.stopPropagation()}
                  />
                </Dropdown>
              )}

              <Button size="small" type="text" icon={<DeleteOutlined />} onClick={handleDelete} />
            </>
          )}
        </Space>
      </div>
    </div>
  );
};

export default TreeNodeItem;
