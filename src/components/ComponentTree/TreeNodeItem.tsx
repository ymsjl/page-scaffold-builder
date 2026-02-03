import React from "react";
import type { ComponentInstance, ComponentType } from "@/types";
import { PlusOutlined, DeleteOutlined, CheckOutlined } from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { componentTreeActions } from "@/store/slices/componentTree/componentTreeSlice";
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

  const addNewNode = (parentId: string | null, type: ComponentType) => {
    dispatch(componentTreeActions.addNode({ parentId, type }));
  };
  const updateNode = (id: string, updates: Partial<any>) =>
    dispatch(componentTreeActions.updateNode({ id, updates }));
  const removeNode = (id: string) =>
    dispatch(componentTreeActions.removeNode(id));

  React.useEffect(() => {
    if (!isEditing) {
      setEditingName(node.name);
    }
  }, [node.name, isEditing]);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeNode(node.id);
  };

  const handleSaveEdit = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (editingName && editingName.trim()) {
      updateNode(node.id, { name: editingName.trim() });
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
    addNewNode(node.id, type);
    dispatch(componentTreeActions.expandNode(node.id));
    setShowAddDropdownNodeId(null);
  };

  const dropdownItems = availableComponents.map((comp) => ({
    key: comp.type,
    label: comp.label,
  }));

  return (
    <div style={{ padding: '4px', paddingLeft: `${level * 20}px` }}>
      <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
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
