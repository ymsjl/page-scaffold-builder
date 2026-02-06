import type { ComponentType } from "react";
import type { ComponentNode, NodeRef } from "@/types";
import { mapProCommonColumnToProps } from "@/store/componentTree/mapProCommonColumnToProps";

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

const buildChildrenRefs = (childrenIds: string[]): NodeRef[] =>
  childrenIds.map((nodeId) => ({ type: "nodeRef", nodeId }));

const normalizeNodePropsForPreview = (
  node: ComponentNode,
  defaultProps: Record<string, unknown> | undefined,
): Record<string, unknown> => {
  const mergedProps = mergeNodeProps(defaultProps, node.props ?? {});

  if (Array.isArray(mergedProps.columns)) {
    mergedProps.columns = mergedProps.columns.map(mapProCommonColumnToProps);
  }

  if (node.isContainer) {
    mergedProps.children = buildChildrenRefs(node.childrenIds ?? []);
  }

  return mergedProps;
};

export const resolveNodeFromPrototype = (
  node: ComponentNode,
  prototype: PrototypeLike,
): ResolvedNode => ({
  nodeId: node.id,
  component: prototype.component,
  mergedProps: normalizeNodePropsForPreview(node, prototype.defaultProps),
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
