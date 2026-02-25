import React from 'react';
import type { ComponentType, NodeRef } from '@/types';
import { AddComponentIntoPreview } from '@/components/DropZone/DropZone';
import SlotItemWrapper from '@/components/SlotItemWrapper/SlotItemWrapper';
import { useRenderNodeRefs } from '../propResolvers';
import * as ptStyles from './ProTableForPreview.css';

export const ColumnCellSlot: React.FC<{
  targetNodeId: string | undefined;
  acceptTypes?: ComponentType[];
  nodeRefs: NodeRef[];
  propPath: string;
}> = ({ targetNodeId, acceptTypes, nodeRefs, propPath }) => {
  const elements = useRenderNodeRefs(nodeRefs);

  if (!targetNodeId) {
    return elements;
  }

  return (
    <div className={ptStyles.slotWrapper}>
      {nodeRefs.map((ref, index) => {
        const element = elements[index];
        if (!element) return null;
        return (
          <SlotItemWrapper
            key={ref.nodeId}
            nodeId={ref.nodeId}
            targetNodeId={targetNodeId}
            propPath={propPath}
          >
            {element}
          </SlotItemWrapper>
        );
      })}
      <AddComponentIntoPreview
        targetNodeId={targetNodeId}
        propPath={propPath}
        direction="horizontal"
        acceptTypes={acceptTypes}
      />
    </div>
  );
};
