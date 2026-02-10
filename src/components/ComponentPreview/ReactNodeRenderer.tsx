import React, { useMemo } from "react";
import { useAppSelector } from "@/store/hooks";
import { componentNodesSelectors } from "@/store/componentTree/componentTreeSelectors";
import { getComponentPrototype } from "@/componentMetas";
import {
  type ComponentNode,
  type ComponentPrototype,
  type NodeRef,
  ProCommonColumn,
  isNodeRef,
} from "@/types";
import {
  buildResolvedProps,
  collectSlotRefs,
  mapNodeRefsToItems,
} from "./previewLogic";
import { DropZone } from "@/components/DropZone/DropZone";
import SlotItemWrapper from "@/components/SlotItemWrapper/SlotItemWrapper";

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

  const mergedProps = useMemo(() => {
    if (node.type === "Table") {
      // 根据组件的 columns 属性，自动生成自动生成 dataSource 属性
      const columns = nodeProps.columns;
      if (Array.isArray(columns)) {
        const mapValueTypeToValue = (col: ProCommonColumn) => {
          switch (col.valueType) {
            case "text":
              return "示例文本";
            case "digit":
              return 123;
            case "date":
              return "2024-01-01";
            case "dateTime":
              return "2024-01-01 12:00:00";
            case "time":
              return "12:00:00";
            case "money":
              return "¥100.00";
            case "select":
              return Object.keys(col.valueEnum || {}).length > 0
                ? Object.keys(col.valueEnum || {})[0]
                : "选项1";
            default:
              return "示例值";
          }
        };
        const dataSource = [
          columns.reduce((acc, col) => {
            acc[col.dataIndex as string] = mapValueTypeToValue(col);
            return acc;
          }, {} as Record<string, unknown>)
        ];
        return {
          ...nodeProps,
          dataSource,
        };
      }
    }
    const result = ({
      ...(componentPrototype.defaultProps || {}),
      ...nodeProps,
    });
    return result;
  }, [node, nodeProps, componentPrototype]);

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
        createDropZone: (slot) => (
          <DropZone
            key={`${slot.id}:drop`}
            id={`${node.id}:${slot.path}`}
            targetNodeId={node.id}
            propPath={slot.path}
            acceptTypes={slot.acceptTypes}
            label={slot.label}
          />
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
    [mergedProps, slots, slotRefsMap, nodeIdToElement, node.id],
  );
};

/**
 * 渲染单个引用的组件节点
 */
const RenderSingleNodeOrNull: React.FC<{ nodeId: string }> = ({ nodeId }) => {
  const node = useAppSelector(
    (state) => componentNodesSelectors.selectById(state, nodeId),
  ) as ComponentNode | undefined;

  if (!node) {
    return null;
  }

  const prototype = getComponentPrototype(node.type);
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
