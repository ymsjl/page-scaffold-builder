import React from 'react';
import { Button, Tooltip } from 'antd';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { EditableShell } from '@/components/EditableShell/EditableShell';
import { createNodeSlotProjection, focusNodeSlot } from '@/editing/bindings/nodeSlots';
import { createNodeSlotSource } from '@/editing/types';
import { selectActiveEditingSource } from '@/editing/store/selectors';
import { isSameEditableSource } from '@/editing/types/EditableSource';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setHoverSource } from '@/editing/store/editingSlice';
import { selectNode, removeNodeRefFromProps } from '@/store/componentTreeSlice/componentTreeSlice';

interface SlotItemWrapperProps {
  /**
   * Optional id of the node rendered inside this slot.
   *
   * When omitted or undefined, the wrapper will render `children` as-is,
   * without the selectable/removable overlay or click/keyboard handlers.
   * This is typically used for plain content that should not be selectable
   * as a separate node in the component tree.
   */
  nodeId?: string;
  targetNodeId: string;
  propPath: string;
  children: React.ReactNode;
}

const SlotItemWrapper = ({
  nodeId,
  targetNodeId,
  propPath,
  children,
}: SlotItemWrapperProps): React.ReactNode => {
  const dispatch = useAppDispatch();
  const activeSource = useAppSelector(selectActiveEditingSource);
  if (!children) {
    return null;
  }

  if (!nodeId) {
    return children;
  }

  const slotSource = createNodeSlotSource({
    ownerNodeId: targetNodeId,
    propPath,
    nodeId,
  });

  const target = createNodeSlotProjection({
    ownerNodeId: targetNodeId,
    propPath,
    nodeId,
  });

  const isSelected = isSameEditableSource(activeSource, slotSource);

  const handleSelect = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    dispatch(selectNode(nodeId));
    dispatch(focusNodeSlot({ ownerNodeId: targetNodeId, propPath, nodeId }));
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(
      removeNodeRefFromProps({
        targetNodeId,
        propPath,
        refNodeId: nodeId,
      }),
    );
  };

  return (
    <EditableShell
      target={target}
      selected={isSelected}
      onSelect={handleSelect}
      onMouseEnter={() => dispatch(setHoverSource(slotSource))}
      onMouseLeave={() => dispatch(setHoverSource(null))}
      toolbar={
        <>
          <Tooltip title="选中组件">
            <Button size="small" type="text" icon={<EditOutlined />} onClick={handleSelect} />
          </Tooltip>
          <Tooltip title="移除组件">
            <Button
              size="small"
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={handleRemove}
            />
          </Tooltip>
        </>
      }
    >
      {children}
    </EditableShell>
  );
};

export default SlotItemWrapper;
