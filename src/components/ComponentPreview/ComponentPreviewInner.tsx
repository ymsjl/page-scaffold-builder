import React, { useMemo } from "react";
import type {
  ComponentId,
  ComponentNode,
  ComponentPrototype,
  NodeRef,
  SlotDefinition,
} from "@/types";
import type { getComponentPrototype } from "../../componentMetas";
import { useRenderNodeRefs } from "./ReactNodeRenderer";
import { CONTAINER_STYLE } from "./previewStyles";
import { collectSlotRefs, mapNodeRefsToItems } from "./previewLogic";

import { DropZone } from "@/components/DropZone/DropZone";
import SlotItemWrapper from "@/components/SlotItemWrapper/SlotItemWrapper";
import { buildResolvedProps } from "./previewLogic";

type ComponentPreviewInnerProps = {
  node: ComponentNode;
  componentPrototype: NonNullable<ReturnType<typeof getComponentPrototype>>;
};

const ComponentPreviewInner = React.memo(
  ({ node, componentPrototype }: ComponentPreviewInnerProps) => {
    const resolvedProps = useResolvedProps(node, componentPrototype);

    const componentElem = useMemo(() => {
      const Component = componentPrototype.component;
      if (typeof Component === "string") {
        const { children, ...props } = resolvedProps;
        return React.createElement(
          Component as keyof JSX.IntrinsicElements,
          { ...props, key: node.id },
          children as React.ReactNode,
        );
      }
      return (
        <Component {...resolvedProps} key={node.id}>
          {resolvedProps.children as React.ReactNode}
        </Component>
      );
    }, [resolvedProps, componentPrototype.component, node.id]);

    return (
      <div style={CONTAINER_STYLE}>
        {componentElem}
      </div>
    );
  },
);

export default ComponentPreviewInner;

function useResolvedProps(
  node: ComponentNode,
  componentPrototype: ComponentPrototype,
) {
  const nodeProps = node.props || {};
  const slots: SlotDefinition[] = componentPrototype.slots || [];
  const slotRefsMap = useMemo(() => collectSlotRefs(nodeProps, slots), [nodeProps, slots]);
  const allRefs = useMemo(() => Object.values(slotRefsMap).flat(), [slotRefsMap]);
  const renderedNodes = useRenderNodeRefs(allRefs);
  const nodeIdToElement = useMemo(() => mapNodeRefsToItems(allRefs, renderedNodes), [allRefs, renderedNodes]);
  const mergedProps = { ...(componentPrototype.defaultProps || {}), ...nodeProps };
  if (node.isContainer) {
    mergedProps.children = buildChildrenRefs(node.childrenIds || []);
  }

  const resolvedProps = useMemo(
    () => buildResolvedProps({
      mergedProps,
      slots,
      slotRefsMap,
      nodeIdToElement,
      createDropZone: (slot) => (
        <DropZone
          key={`${slot.id}:drop`}
          id={`${node.id}:${slot.path}`}
          targetNodeId={node.id}
          propPath={slot.path}
          acceptTypes={slot.acceptTypes}
          label={slot.label} />
      ),
      wrapElement: (slot, ref, element) => (
        <SlotItemWrapper
          key={`${slot.id}:${ref.nodeId}`}
          nodeId={ref.nodeId}
          targetNodeId={node.id}
          propPath={slot.path}
        >
          {element}
        </SlotItemWrapper>
      ),
    }),
    [mergedProps, slots, slotRefsMap, nodeIdToElement, node.id]
  );
  return resolvedProps;
}

function buildChildrenRefs(childrenIds: ComponentId[]): NodeRef[] {
  return childrenIds.map((nodeId) => ({ type: "nodeRef", nodeId }));
}

