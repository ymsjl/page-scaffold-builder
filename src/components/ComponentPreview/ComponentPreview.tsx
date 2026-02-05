import React, { useMemo } from "react";
import { Typography, Divider } from "antd";
import { getComponentPrototype } from "../../componentMetas";
import { useAppSelector } from "../../store/hooks";
import { selectNodeForPreview } from "@/store/componentTree/componentTreeSelectors";
import { DropZone } from "@/components/DropZone";
import { useRenderNodeRefs } from "./ReactNodeRenderer";
import type { NodeRef, SlotDefinition } from "@/types";
import { isNodeRef } from "@/types";
import SlotItemWrapper from "@/components/SlotItemWrapper";

interface ComponentPreviewProps { }

function getValueByPath(obj: Record<string, unknown>, path: string): unknown {
  const parts = path.split(".");
  let current: unknown = obj;

  for (const part of parts) {
    if (current && typeof current === "object" && part in current) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }

  return current;
}

function setValueByPath(
  obj: Record<string, unknown>,
  path: string,
  value: unknown,
): Record<string, unknown> {
  const parts = path.split(".");

  const setValue = (
    target: Record<string, unknown>,
    index: number,
  ): Record<string, unknown> => {
    const key = parts[index];
    if (index === parts.length - 1) {
      return { ...target, [key]: value };
    }

    const currentChild = target[key];
    const nextChild =
      currentChild && typeof currentChild === "object"
        ? (currentChild as Record<string, unknown>)
        : {};

    return {
      ...target,
      [key]: setValue(nextChild, index + 1),
    };
  };

  return setValue(obj, 0);
}

const ComponentPreview: React.FC<ComponentPreviewProps> = () => {
  const node = useAppSelector(selectNodeForPreview);

  if (!node) {
    const emptyStyle: React.CSSProperties = {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: "100%",
      color: "#999",
      fontSize: "14px",
      backgroundColor: "#fafafa",
      border: "4px solid #e8e8e8",
      borderRadius: "16px",
    };

    return <div style={emptyStyle}>请选择一个组件实例以查看预览</div>;
  }

  const componentPrototype = getComponentPrototype(node.type);

  if (!componentPrototype) {
    const errorStyle: React.CSSProperties = {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: "100%",
      color: "#ff4d4f",
      fontSize: "14px",
      backgroundColor: "#fff2f0",
      border: "1px solid #ffccc7",
      borderRadius: "4px",
    };

    return <div style={errorStyle}>未知的组件类型: {node.type}</div>;
  }

  return (<ComponentPreviewInner node={node} componentPrototype={componentPrototype} />);
};

const ComponentPreviewInner: React.FC<{
  node: NonNullable<ReturnType<typeof selectNodeForPreview>>;
  componentPrototype: NonNullable<ReturnType<typeof getComponentPrototype>>;
}> = ({ node, componentPrototype }) => {
  const defaultProps = componentPrototype.defaultProps || {};
  const mergedProps = { ...defaultProps, ...node.props };
  const slots: SlotDefinition[] = componentPrototype.slots || [];

  const slotRefsMap = useMemo(() => {
    const map: Record<string, NodeRef[]> = {};
    for (const slot of slots) {
      const value = getValueByPath(node.props, slot.path);
      const refs: NodeRef[] = [];

      if (Array.isArray(value)) {
        refs.push(...value.filter(isNodeRef));
      } else if (isNodeRef(value)) {
        refs.push(value);
      }

      map[slot.id] = refs;
    }
    return map;
  }, [node.props, slots]);

  const allRefs = useMemo(
    () => Object.values(slotRefsMap).flat(),
    [slotRefsMap],
  );

  const renderedNodes = useRenderNodeRefs(allRefs);

  const nodeIdToElement = useMemo(() => {
    const map: Record<string, React.ReactNode> = {};
    let index = 0;
    for (const ref of allRefs) {
      map[ref.nodeId] = renderedNodes[index];
      index += 1;
    }
    return map;
  }, [allRefs, renderedNodes]);

  const resolvedProps = useMemo(() => {
    let newProps: Record<string, unknown> = { ...mergedProps };

    for (const slot of slots) {
      const refs = slotRefsMap[slot.id] || [];
      const elements = refs
        .map((ref) => nodeIdToElement[ref.nodeId])
        .filter(Boolean);

      const wrappedElements = slot.wrap
        ? refs
          .map((ref) => {
            const element = nodeIdToElement[ref.nodeId];
            if (!element) return null;
            return (
              <SlotItemWrapper
                key={`${slot.id}:${ref.nodeId}`}
                nodeId={ref.nodeId}
                targetNodeId={node.id}
                propPath={slot.path}
              >
                {element}
              </SlotItemWrapper>
            );
          })
          .filter(Boolean)
        : elements;

      const dropZone = (
        <DropZone
          key={`${slot.id}:drop`}
          id={`${node.id}:${slot.path}`}
          targetNodeId={node.id}
          propPath={slot.path}
          acceptTypes={slot.acceptTypes}
          label={slot.label}
        />
      );

      // Inline slots:
      // - For reactNodeArray slots we always render the DropZone first,
      //   followed by any existing children. This keeps a visible primary
      //   drop target at the start of the list.
      // - For single reactNode slots we instead treat the DropZone as a
      //   fallback, only showing it when there is no existing content.
      // This asymmetry is intentional to keep single-item slots less
      // visually intrusive while still encouraging drops into list slots.
      if (slot.renderMode === "inline") {
        if (slot.kind === "reactNodeArray") {
          newProps = setValueByPath(newProps, slot.path, [dropZone, ...wrappedElements]);
        } else {
          newProps = setValueByPath(newProps, slot.path, wrappedElements[0] ?? dropZone);
        }
      } else if (slot.kind === "reactNodeArray") {
        newProps = setValueByPath(newProps, slot.path, wrappedElements);
      } else {
        newProps = setValueByPath(newProps, slot.path, wrappedElements[0]);
      }
    }

    return newProps;
  }, [mergedProps, slots, slotRefsMap, nodeIdToElement, node.id]);

  const Component = componentPrototype.component;

  const containerStyle: React.CSSProperties = {
    padding: "20px",
    height: "100%",
    overflow: "auto",
    backgroundColor: "#fafafa",
    border: "4px solid #e8e8e8",
    borderRadius: "16px",
  };

  const renderComponent = () => {
    if (typeof Component === "string") {
      const htmlElement = Component as keyof JSX.IntrinsicElements;
      const { children, ...props } = resolvedProps;
      return React.createElement(
        htmlElement,
        {
          ...props,
          key: node.id,
        },
        children as React.ReactNode,
      );
    }

    return (
      <Component {...resolvedProps} key={node.id}>
        {resolvedProps.children as React.ReactNode}
      </Component>
    );
  };

  const panelSlots = slots.filter((slot) => slot.renderMode !== "inline");

  return (
    <div style={containerStyle}>
      {panelSlots.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            拖拽组件到下方插槽
          </Typography.Text>
          <div
            style={{
              marginTop: 8,
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            {panelSlots.map((slot) => (
              <DropZone
                key={slot.id}
                id={`${node.id}:${slot.path}`}
                targetNodeId={node.id}
                propPath={slot.path}
                acceptTypes={slot.acceptTypes}
                nodeRefs={slotRefsMap[slot.id] || []}
                label={slot.label}
                placeholder={slot.placeholder ?? `拖入 ${slot.label}`}
              />
            ))}
          </div>
          <Divider style={{ margin: "16px 0" }} />
        </div>
      )}
      {renderComponent()}
    </div>
  );
};

export default ComponentPreview;
