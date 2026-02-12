import React, { useMemo } from "react";
import { useAppSelector } from "@/store/hooks";
import { componentNodesSelectors } from "@/store/componentTree/componentTreeSelectors";
import { getComponentPrototype } from "@/componentMetas";
import {
  type ComponentNode,
  type ComponentPrototype,
  type NodeRef,
  isNodeRef,
} from "@/types";
import {
  buildResolvedProps,
  collectSlotRefs,
  mapNodeRefsToItems,
} from "./previewLogic";
import { DropZone } from "@/components/DropZone/DropZone";
import SlotItemWrapper from "@/components/SlotItemWrapper/SlotItemWrapper";
import { usePreviewMode } from "./previewMode";

interface ReactNodeRendererProps {
  /** 节点引用数组 */
  nodeRefs: NodeRef[];
}

const buildChildrenRefs = (childrenIds: string[]): NodeRef[] =>
  childrenIds.map((nodeId) => ({ type: "nodeRef", nodeId }));

export const useResolvedProps = (
  node: ComponentNode,
  componentPrototype: ComponentPrototype,
) => {
  const previewMode = usePreviewMode();
  const nodeProps = node.props || {};
  const slots = componentPrototype.slots || [];
  const slotRefsMap = useMemo(
    () => collectSlotRefs(nodeProps, slots),
    [nodeProps, slots],
  );
  const allRefs = useMemo(
    () => Object.values(slotRefsMap).flat(),
    [slotRefsMap],
  );
  const renderedNodes = useRenderNodeRefs(allRefs);
  const nodeIdToElement = useMemo(
    () => mapNodeRefsToItems(allRefs, renderedNodes),
    [allRefs, renderedNodes],
  );

  const mergedProps = useMemo<Record<string, unknown>>(
    () => ({
      ...(previewMode === "edit" && node.type === "Table"
        ? { __previewNodeId: node.id }
        : {}),
      ...(componentPrototype.defaultProps || {}),
      ...nodeProps,
    }),
    [node.id, node.type, nodeProps, componentPrototype.defaultProps, previewMode],
  );

  if (node.isContainer) {
    mergedProps.children = buildChildrenRefs(node.childrenIds || []);
  }

  return useMemo(
    () =>
      buildResolvedProps({
        mergedProps,
        slots,
        slotRefsMap,
        nodeIdToElement,
        createDropZone: (slot) =>
          previewMode === "edit" ? (
            <DropZone
              key={`${slot.id}:drop`}
              id={`${node.id}:${slot.path}`}
              targetNodeId={node.id}
              propPath={slot.path}
              acceptTypes={slot.acceptTypes}
              label={slot.label}
            />
          ) : (
            null
          ),
        wrapElement: (slot, ref, element) =>
          previewMode === "edit" ? (
            <SlotItemWrapper
              key={`${slot.id}:${ref.nodeId}`}
              nodeId={ref.nodeId}
              targetNodeId={node.id}
              propPath={slot.path}
            >
              {element}
            </SlotItemWrapper>
          ) : (
            element
          ),
      }),
    [mergedProps, slots, slotRefsMap, nodeIdToElement, node.id, previewMode],
  );
};

/**
 * 渲染单个引用的组件节点
 */
const RenderSingleNodeOrNull: React.FC<{ nodeId: string }> = ({ nodeId }) => {
  const previewMode = usePreviewMode();
  const node = useAppSelector(
    (state) => componentNodesSelectors.selectById(state, nodeId),
  ) as ComponentNode | undefined;

  if (!node) {
    return null;
  }

  const prototype = getComponentPrototype(node.type, { previewMode });
  if (!prototype) {
    return null;
  }

  return <RenderSingleNode node={node} componentPrototype={prototype} />;
};

const RenderSingleNode: React.FC<{
  node: ComponentNode;
  componentPrototype: ComponentPrototype;
}> = React.memo(({ node, componentPrototype }) => {
  const resolvedProps = useResolvedProps(node, componentPrototype);
  const Component = componentPrototype.component;
  if (typeof Component === "string") {
    const { children, ...restProps } = resolvedProps;
    return React.createElement(
      Component as keyof JSX.IntrinsicElements,
      { ...restProps, key: node.id },
      children as React.ReactNode,
    );
  }
  return (
    <Component {...resolvedProps} key={node.id}>
      {resolvedProps.children as React.ReactNode}
    </Component>
  );
});
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
      {validRefs.map((ref) => (
        <RenderSingleNodeOrNull key={ref.nodeId} nodeId={ref.nodeId} />
      ))}
    </>
  );
};

/**
 * 将 NodeRef 数组转换为可渲染的 React 元素数组
 * 用于直接传递给组件 props
 */
export const useRenderNodeRefs = (nodeRefs: unknown[]): React.ReactNode[] => {
  const validRefs = React.useMemo(
    () => nodeRefs.filter(isNodeRef) as NodeRef[],
    [nodeRefs],
  );

  return React.useMemo(
    () =>
      validRefs.map((ref) => (
        <RenderSingleNodeOrNull key={ref.nodeId} nodeId={ref.nodeId} />
      )),
    [validRefs],
  );
};

export default ReactNodeRenderer;
