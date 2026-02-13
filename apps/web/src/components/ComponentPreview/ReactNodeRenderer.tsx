import React, { useMemo } from "react";
import { useAppSelector } from "@/store/hooks";
import {
  componentNodesSelectors,
  selectVariableValues,
} from "@/store/componentTree/componentTreeSelectors";
import { getComponentPrototype } from "@/componentMetas";
import {
  type ComponentNode,
  type ComponentPrototype,
  type NodeRef,
  isNodeRef,
  isVariableRef,
} from "@/types";
import {
  buildResolvedProps,
  collectSlotRefs,
  mapNodeRefsToItems,
} from "./previewLogic";
import { getValueByPath, setValueByPath } from "./slotPath";
import { DropZone } from "@/components/DropZone/DropZone";
import SlotItemWrapper from "@/components/SlotItemWrapper/SlotItemWrapper";
import { usePreviewMode } from "./previewMode";
import { useActionFlowHandler } from "@/services/actionFlows";

interface ReactNodeRendererProps {
  /** 节点引用数组 */
  nodeRefs: NodeRef[];
}

const buildChildrenRefs = (childrenIds: string[]): NodeRef[] =>
  childrenIds.map((nodeId) => ({ type: "nodeRef", nodeId }));

const resolveVariableRefsInValue = (
  value: unknown,
  variableValues: Record<string, unknown>,
): unknown => {
  if (isVariableRef(value)) {
    return variableValues[value.variableName];
  }

  if (Array.isArray(value)) {
    return value.map((item) =>
      resolveVariableRefsInValue(item, variableValues),
    );
  }

  if (isNodeRef(value) || value === null || typeof value !== "object") {
    return value;
  }

  return Object.entries(value as Record<string, unknown>).reduce(
    (acc, [key, childValue]) => {
      acc[key] = resolveVariableRefsInValue(childValue, variableValues);
      return acc;
    },
    {} as Record<string, unknown>,
  );
};

export const useResolvedProps = (
  node: ComponentNode,
  componentPrototype: ComponentPrototype,
) => {
  const previewMode = usePreviewMode();
  const variableValues = useAppSelector(selectVariableValues);
  const { createFlowHandler } = useActionFlowHandler();
  const nodeProps = node.props || {};
  const slots = componentPrototype.slots || [];
  const actionFlowPropPaths = useMemo(
    () =>
      Object.values(componentPrototype.propsTypes || {})
        .filter((prop) => prop.type === "actionFlow")
        .map((prop) => prop.name),
    [componentPrototype.propsTypes],
  );
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
    [
      node.id,
      node.type,
      nodeProps,
      componentPrototype.defaultProps,
      previewMode,
    ],
  );

  if (node.isContainer) {
    mergedProps.children = buildChildrenRefs(node.childrenIds || []);
  }

  const resolvedVariableProps = useMemo(
    () =>
      resolveVariableRefsInValue(mergedProps, variableValues) as Record<
        string,
        unknown
      >,
    [mergedProps, variableValues],
  );

  const executableFlowProps = useMemo(() => {
    return actionFlowPropPaths.reduce((acc, propPath) => {
      const flowId = getValueByPath(acc, propPath);
      if (typeof flowId !== "string" || !flowId) {
        return acc;
      }

      return setValueByPath(
        acc,
        propPath,
        createFlowHandler(flowId, {
          componentId: node.id,
          componentProps: nodeProps,
          eventName: propPath,
        }),
      );
    }, resolvedVariableProps);
  }, [
    actionFlowPropPaths,
    createFlowHandler,
    node.id,
    nodeProps,
    resolvedVariableProps,
  ]);

  return useMemo(
    () =>
      buildResolvedProps({
        mergedProps: executableFlowProps,
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
          ) : null,
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
    [
      executableFlowProps,
      slots,
      slotRefsMap,
      nodeIdToElement,
      node.id,
      previewMode,
    ],
  );
};

/**
 * 渲染单个引用的组件节点
 */
const RenderSingleNodeOrNull: React.FC<{ nodeId: string }> = ({ nodeId }) => {
  const previewMode = usePreviewMode();
  const node = useAppSelector((state) =>
    componentNodesSelectors.selectById(state, nodeId),
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
