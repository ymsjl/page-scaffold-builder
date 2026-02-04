import React from "react";
import { useAppSelector } from "@/store/hooks";
import { getComponentPrototype } from "@/componentMetas";
import type { NodeRef, ComponentNode } from "@/types";
import { isNodeRef } from "@/types";

interface ReactNodeRendererProps {
  /** 节点引用数组 */
  nodeRefs: NodeRef[];
}

/**
 * 渲染单个引用的组件节点
 */
const RenderSingleNode: React.FC<{ nodeId: string }> = ({ nodeId }) => {
  const node = useAppSelector(
    (state) => state.componentTree.components.entities[nodeId]
  ) as ComponentNode | undefined;

  if (!node) {
    return null;
  }

  const prototype = getComponentPrototype(node.type);
  if (!prototype) {
    return null;
  }

  const Component = prototype.component;
  const defaultProps = prototype.defaultProps || {};
  const mergedProps = { ...defaultProps, ...node.props };

  // 处理 HTML 元素类型
  if (typeof Component === "string") {
    const { children, ...restProps } = mergedProps;
    return React.createElement(
      Component as keyof JSX.IntrinsicElements,
      { ...restProps, key: node.id },
      children
    );
  }

  // React 组件类型
  return (
    <Component {...mergedProps} key={node.id}>
      {mergedProps.children}
    </Component>
  );
};

/**
 * 渲染多个节点引用为 React 元素数组
 * 用于 toolbar.actions 等接收 ReactNode[] 的 props
 */
export const ReactNodeRenderer: React.FC<ReactNodeRendererProps> = ({
  nodeRefs,
}) => {
  const validRefs = nodeRefs.filter(isNodeRef);

  if (validRefs.length === 0) {
    return null;
  }

  return (
    <>
      {validRefs.map((ref) => (
        <RenderSingleNode key={ref.nodeId} nodeId={ref.nodeId} />
      ))}
    </>
  );
};

/**
 * 将 NodeRef 数组转换为可渲染的 React 元素数组
 * 用于直接传递给组件 props
 */
export const useRenderNodeRefs = (nodeRefs: unknown[]): React.ReactNode[] => {
  const nodes = useAppSelector((state) => state.componentTree.components.entities);

  return React.useMemo(() => {
    return nodeRefs
      .filter(isNodeRef)
      .map((ref) => {
        const node = nodes[ref.nodeId] as ComponentNode | undefined;
        if (!node) return null;

        const prototype = getComponentPrototype(node.type);
        if (!prototype) return null;

        const Component = prototype.component;
        const defaultProps = prototype.defaultProps || {};
        const mergedProps = { ...defaultProps, ...node.props };

        if (typeof Component === "string") {
          const { children, ...restProps } = mergedProps;
          return React.createElement(
            Component as keyof JSX.IntrinsicElements,
            { ...restProps, key: node.id },
            children
          );
        }

        return React.createElement(Component, {
          ...mergedProps,
          key: node.id,
          children: mergedProps.children,
        });
      })
      .filter(Boolean);
  }, [nodeRefs, nodes]);
};

export default ReactNodeRenderer;
