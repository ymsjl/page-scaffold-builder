import { selectNode } from '@/store/componentTreeSlice/componentTreeSlice';
import type { AppDispatch } from '@/store/storeTypes';
import { createEditableProjection, createNodeSlotSource } from '../types';
import { setActiveSource } from '../store/editingSlice';

export type NodeSlotBindingArgs = {
  ownerNodeId: string;
  propPath: string;
  nodeId: string;
  label?: string;
};

export const createNodeSlotProjection = ({
  ownerNodeId,
  propPath,
  nodeId,
  label,
}: NodeSlotBindingArgs) => {
  const source = createNodeSlotSource({ ownerNodeId, propPath, nodeId });

  return createEditableProjection({
    source,
    label,
    capabilities: ['selectable', 'removable', 'open-panel'],
  });
};

export const focusNodeSlot = ({
  ownerNodeId,
  propPath,
  nodeId,
}: Omit<NodeSlotBindingArgs, 'label'>) => {
  return (dispatch: AppDispatch) => {
    dispatch(selectNode(nodeId));
    dispatch(
      setActiveSource({
        source: createNodeSlotSource({ ownerNodeId, propPath, nodeId }),
        interactionSource: 'canvas',
      }),
    );
  };
};
