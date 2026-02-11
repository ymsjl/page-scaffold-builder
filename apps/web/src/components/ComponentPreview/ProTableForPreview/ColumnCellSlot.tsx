import React from "react";
import type { ComponentType, NodeRef } from "@/types";
import { DropZone } from "@/components/DropZone/DropZone";
import SlotItemWrapper from "@/components/SlotItemWrapper/SlotItemWrapper";
import { useRenderNodeRefs } from "../ReactNodeRenderer";

export const ColumnCellSlot: React.FC<{
  targetNodeId: string | undefined;
  acceptTypes?: ComponentType[];
  nodeRefs: NodeRef[];
  propPath: string;
}> = ({ targetNodeId, acceptTypes, nodeRefs, propPath }) => {
  const elements = useRenderNodeRefs(nodeRefs);

  if (!targetNodeId) {
    return <>{elements}</>;
  }

  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
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
      <DropZone
        id={`rowActions:${propPath}`}
        targetNodeId={targetNodeId}
        propPath={propPath}
        acceptTypes={acceptTypes}
        label="列渲染内容"
      />
    </div>
  );
};
