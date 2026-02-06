import type { ComponentType } from "react";
import type { ComponentNode, NodeRef } from "@/types";

type PrototypeLike = {
  component: ComponentType<Record<string, unknown>> | string;
  defaultProps?: Record<string, unknown>;
};

export type ResolvedNode = {
  nodeId: string;
  component: PrototypeLike["component"];
  mergedProps: Record<string, unknown>;
};

export const mergeNodeProps = (
  defaultProps: Record<string, unknown> | undefined,
  props: Record<string, unknown>,
): Record<string, unknown> => ({
  ...defaultProps,
  ...props,
});

export const resolveNodeFromPrototype = (
  node: ComponentNode,
  prototype: PrototypeLike,
): ResolvedNode => ({
  nodeId: node.id,
  component: prototype.component,
  mergedProps: mergeNodeProps(prototype.defaultProps, node.props),
});

export const resolveRenderableNodes = (
  nodeRefs: NodeRef[],
  nodes: Record<string, ComponentNode | undefined>,
  getPrototype: (type: ComponentNode["type"]) => PrototypeLike | undefined,
): ResolvedNode[] => {
  const resolved: ResolvedNode[] = [];
  for (const ref of nodeRefs) {
    const node = nodes[ref.nodeId];
    if (!node) continue;
    const prototype = getPrototype(node.type);
    if (!prototype) continue;
    resolved.push(resolveNodeFromPrototype(node, prototype));
  }
  return resolved;
};
