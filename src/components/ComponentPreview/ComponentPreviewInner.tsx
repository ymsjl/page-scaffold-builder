import React, { useMemo } from "react";
import type { ComponentId, ComponentPrototype, SlotDefinition } from "@/types";
import type { selectNodeForPreview } from "@/store/componentTree/componentTreeSelectors";
import type { getComponentPrototype } from "../../componentMetas";
import { useRenderNodeRefs } from "./ReactNodeRenderer";
import { CONTAINER_STYLE } from "./previewStyles";
import { collectSlotRefs, mapNodeRefsToItems } from "./previewLogic";

import { DropZone } from "@/components/DropZone/DropZone";
import SlotItemWrapper from "@/components/SlotItemWrapper/SlotItemWrapper";
import { buildResolvedProps } from "./previewLogic";

type ComponentPreviewInnerProps = {
  node: NonNullable<ReturnType<typeof selectNodeForPreview>>;
  componentPrototype: NonNullable<ReturnType<typeof getComponentPrototype>>;
};

const ComponentPreviewInner = React.memo(
  ({ node: { id: nodeId, props: nodeProps }, componentPrototype }: ComponentPreviewInnerProps) => {
    const resolvedProps = useResolvedProps(nodeId, nodeProps || {}, componentPrototype);

    const componentElem = useMemo(() => {
      const Component = componentPrototype.component;
      if (typeof Component === "string") {
        const { children, ...props } = resolvedProps;
        return React.createElement(
          Component as keyof JSX.IntrinsicElements,
          { ...props, key: nodeId },
          children as React.ReactNode,
        );
      }
      return (
        <Component {...resolvedProps} key={nodeId}>
          {resolvedProps.children as React.ReactNode}
        </Component>
      );
    }, [resolvedProps, componentPrototype.component, nodeId]);

    return (
      <div style={CONTAINER_STYLE}>
        {componentElem}
      </div>
    );
  },
);

export default ComponentPreviewInner;

function useResolvedProps(
  nodeId: ComponentId,
  nodeProps: Record<string, unknown>,
  componentPrototype: ComponentPrototype,
) {
  const slots: SlotDefinition[] = componentPrototype.slots || [];
  const slotRefsMap = useMemo(() => collectSlotRefs(nodeProps, slots), [nodeProps, slots]);
  const allRefs = useMemo(() => Object.values(slotRefsMap).flat(), [slotRefsMap]);
  const renderedNodes = useRenderNodeRefs(allRefs);
  const nodeIdToElement = useMemo(() => mapNodeRefsToItems(allRefs, renderedNodes), [allRefs, renderedNodes]);
  const mergedProps = { ...(componentPrototype.defaultProps || {}), ...nodeProps };

  const resolvedProps = useMemo(
    () => buildResolvedProps({
      mergedProps,
      slots,
      slotRefsMap,
      nodeIdToElement,
      createDropZone: (slot) => (
        <DropZone
          key={`${slot.id}:drop`}
          id={`${nodeId}:${slot.path}`}
          targetNodeId={nodeId}
          propPath={slot.path}
          acceptTypes={slot.acceptTypes}
          label={slot.label} />
      ),
      wrapElement: (slot, ref, element) => (
        <SlotItemWrapper
          key={`${slot.id}:${ref.nodeId}`}
          nodeId={ref.nodeId}
          targetNodeId={nodeId}
          propPath={slot.path}
        >
          {element}
        </SlotItemWrapper>
      ),
    }),
    [mergedProps, slots, slotRefsMap, nodeIdToElement, nodeId]
  );
  return resolvedProps;
}

