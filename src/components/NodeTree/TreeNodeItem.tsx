import React from 'react';
import type { ComponentInstance, ComponentType } from "@/types";
import { PlusOutlined, DeleteOutlined, CheckOutlined } from '@ant-design/icons';
import { useBuilderStore } from '@/store/useBuilderStore';
import { availableComponents } from '@/componentMetas';

interface TreeNodeItemProps {
  node: ComponentInstance;
  level: number;
}

const TreeNodeItem: React.FC<TreeNodeItemProps> = ({ node, level }) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editingName, setEditingName] = React.useState(node.name);

  const showAddDropdown = useBuilderStore(s => s.showAddDropdownNodeId === node.id);
  const showAddDropdownAction = useBuilderStore(s => s.showAddDropdown);
  const addNewNode = useBuilderStore(s => s.componentTree.actions.addNewNode);
  const updateNode = useBuilderStore(s => s.componentTree.actions.updateNode);
  const removeNode = useBuilderStore(s => s.componentTree.actions.removeNode);
  const isSelected = useBuilderStore(s => s.componentTree.data.selectedNodeId === node.id);

  React.useEffect(() => {
    if (!isEditing) {
      setEditingName(node.name);
    }
  }, [node.name, isEditing]);

  const handleAddChildClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    showAddDropdownAction(node.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeNode(node.id);
  };

  const handleSaveEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (editingName && editingName.trim()) {
      updateNode(node.id, { name: editingName.trim() });
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (editingName && editingName.trim()) {
        updateNode(node.id, { name: editingName.trim() });
      }
      setIsEditing(false);
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditingName(node.name);
    }
  };

  const handleBlur = () => {
    if (editingName && editingName.trim()) {
      updateNode(node.id, { name: editingName.trim() });
    }
    setIsEditing(false);
  };

  const handleSelectComponent = (e: React.MouseEvent, type: ComponentType) => {
    e.stopPropagation();
    if (!node?.id) {
      // eslint-disable-next-line no-console
      console.warn('[TreeNodeItem] handleSelectComponent: missing node id', node);
      return;
    }

    addNewNode(node.id, type);
    showAddDropdownAction(null);
  };

  const styles: { [key: string]: React.CSSProperties } = {
    treeNodeItem: {
      display: 'flex',
      alignItems: 'center',
      padding: '8px',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      backgroundColor: isSelected ? '#e6f7ff' : 'transparent',
    },
    treeNodeItemHover: {},
    treeNodeContent: {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
    },
    treeNodeLabel: {
      fontSize: '14px',
      color: '#333',
      userSelect: 'none',
    },
    treeNodeInput: {
      padding: '4px 8px',
      border: '1px solid #d9d9d9',
      borderRadius: '2px',
      outline: 'none',
      fontSize: '14px',
    },
    treeNodeActions: {
      display: 'flex',
      gap: '4px',
      alignItems: 'center',
    },
    treeNodeBtnWrapper: {
      position: 'relative',
    },
    treeNodeBtn: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '28px',
      height: '28px',
      border: 'none',
      background: 'transparent',
      cursor: 'pointer',
      borderRadius: '4px',
      transition: 'all 0.2s',
      color: '#8c8c8c',
    },
    treeNodeDropdown: {
      position: 'absolute',
      top: '100%',
      left: 0,
      zIndex: 1000,
      background: 'white',
      border: '1px solid #e8e8e8',
      borderRadius: '4px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
      minWidth: '150px',
      maxHeight: '300px',
      overflowY: 'auto',
    },
    dropdownItem: {
      padding: '8px 12px',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      fontSize: '14px',
    },
  };

  return (
    <div>
      <div style={{ ...styles.treeNodeItem, paddingLeft: `${level * 20}px` }}>
        <div style={styles.treeNodeContent}>
          {isEditing ? (
            <input
              type="text"
              style={styles.treeNodeInput}
              value={editingName}
              onChange={e => setEditingName(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleBlur}
              autoFocus
            />
          ) : (
            <span
              style={styles.treeNodeLabel}
              onDoubleClick={e => {
                e.stopPropagation();
                setIsEditing(true);
                setEditingName(node.name);
              }}
            >
              {node.name}
            </span>
          )}
        </div>
        <div style={styles.treeNodeActions}>
          {isEditing ? (
            <button style={styles.treeNodeBtn} onClick={handleSaveEdit} type="button">
              <CheckOutlined />
            </button>
          ) : (
            <>
              {node.isContainer && (
                <div style={styles.treeNodeBtnWrapper}>
                  <button style={styles.treeNodeBtn} onClick={handleAddChildClick} type="button">
                    <PlusOutlined />
                  </button>
                  {showAddDropdown && (
                    <div style={styles.treeNodeDropdown}>
                      {availableComponents.map(comp => (
                        <div key={comp.type} style={styles.dropdownItem} onClick={e => handleSelectComponent(e, comp.type)}>
                          {comp.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              <button style={styles.treeNodeBtn} onClick={handleDelete} type="button">
                <DeleteOutlined />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TreeNodeItem;
