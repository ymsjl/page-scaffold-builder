import React from "react";
import type { ComponentInstance, ComponentType } from "@/types";
import { PlusOutlined, DeleteOutlined, CheckOutlined, HolderOutlined } from "@ant-design/icons";
import { useDraggable } from "@dnd-kit/core";
import { useAppDispatch } from "@/store/hooks";
import { componentTreeActions } from "@/store/componentTree/componentTreeSlice";
import { availableComponents } from "@/componentMetas";
import { Button, Input, Space, Dropdown, Typography } from "antd";

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
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: `tree-node-${node.id}`,
    data: {
      type: "treeNode",
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
    dispatch(componentTreeActions.removeNode(node.id));
  };

  const handleSaveEdit = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (editingName && editingName.trim()) {
      dispatch(componentTreeActions.updateNode({ id: node.id, updates: { name: editingName.trim() } }));
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSaveEdit();
    } else if (e.key === "Escape") {
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
      console.warn("[TreeNodeItem] handleSelectComponent: missing node id", node);
      return;
    }
    dispatch(componentTreeActions.addNode({ parentId: node.id, type }));
    dispatch(componentTreeActions.expandNode(node.id));
    setShowAddDropdownNodeId(null);
  };

  const dropdownItems = availableComponents.map((comp) => ({
    key: comp.type,
    label: comp.label,
  }));

  return (
    <div
      ref={setNodeRef}
      style={{ padding: '4px', paddingLeft: `${level * 8}px`, ...style }}
      {...attributes}
    >
      <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
        {/* 拖拽手柄 - 仅非容器组件显示 */}
        {isDraggable && (
          <div
            {...listeners}
            style={{
              cursor: isDragging ? 'grabbing' : 'grab',
              padding: '0 4px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <HolderOutlined style={{ color: '#999', fontSize: 12 }} />
          </div>
        )}
        <div style={{ flex: 1 }}>
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

        <Space size={4}>
          {isEditing ? (
            <Button
              size="small"
              icon={<CheckOutlined />}
              onClick={handleSaveEdit}
            />
          ) : (
            <>
              {node.isContainer && (
                <Dropdown
                  menu={{ items: dropdownItems, onClick: handleSelectComponentFromMenu }}
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

              <Button
                size="small"
                type="text"
                icon={<DeleteOutlined />}
                onClick={handleDelete}
              />
            </>
          )}
        </Space>
      </div>
    </div>
  );
};

export default TreeNodeItem;
