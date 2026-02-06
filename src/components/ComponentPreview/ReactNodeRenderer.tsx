import React, { useMemo } from "react";
import { useAppSelector } from "@/store/hooks";
import { getComponentPrototype } from "@/componentMetas";
import { type NodeRef, type ComponentNode, isNodeRef } from "@/types";
import { componentNodesSelectors } from "@/store/componentTree/componentTreeSelectors";
import { resolveNodeFromPrototype, resolveRenderableNodes, type ResolvedNode, } from "./nodeRefLogic";

interface ReactNodeRendererProps {
  /** 节点引用数组 */
  nodeRefs: NodeRef[];
}

const renderResolvedNode = ({
  component,
  mergedProps,
  nodeId,
}: ResolvedNode): React.ReactElement => {
  if (typeof component === "string") {
    const { children, ...restProps } = mergedProps;
    return React.createElement(
      component as keyof JSX.IntrinsicElements,
      { ...restProps, key: nodeId },
      children as React.ReactNode,
    );
  }

  const Component = component;
  return (
    <Component {...mergedProps} key={nodeId}>
      {mergedProps.children as React.ReactNode}
    </Component>
  );
};

/**
 * 渲染单个引用的组件节点
 */
const RenderSingleNode: React.FC<{ nodeId: string }> = ({ nodeId }) => {
  const node = useAppSelector(
    (state) => state.componentTree.components.entities[nodeId],
  ) as ComponentNode | undefined;

  if (!node) {
    return null;
  }

  const prototype = getComponentPrototype(node.type);
  if (!prototype) {
    return null;
  }

  const resolved = resolveNodeFromPrototype(node, prototype);
  return renderResolvedNode(resolved);
};

/**
 * 渲染多个节点引用为 React 元素数组
 * 用于接收 ReactNode[] 的 props
 */
export const ReactNodeRenderer: React.FC<ReactNodeRendererProps> = ({
  nodeRefs,
}) => {
  const validRefs = useMemo(() => nodeRefs.filter(isNodeRef), [nodeRefs]);

  if (validRefs.length === 0) {
    return null;
  }

  return (
    <>
      {validRefs.map((ref) => <RenderSingleNode key={ref.nodeId} nodeId={ref.nodeId} />)}
    </>
  );
};

/**
 * 将 NodeRef 数组转换为可渲染的 React 元素数组
 * 用于直接传递给组件 props
 */
export const useRenderNodeRefs = (nodeRefs: unknown[]): React.ReactNode[] => {
  const nodes = useAppSelector(componentNodesSelectors.selectEntities);

  const validRefs = React.useMemo(
    () => nodeRefs.filter(isNodeRef) as NodeRef[],
    [nodeRefs],
  );

  const resolvedNodes = React.useMemo(
    () => resolveRenderableNodes(validRefs, nodes, getComponentPrototype),
    [validRefs, nodes],
  );

  return React.useMemo(
    () => resolvedNodes.map((resolved) => renderResolvedNode(resolved)),
    [resolvedNodes],
  );
};

export default ReactNodeRenderer;
