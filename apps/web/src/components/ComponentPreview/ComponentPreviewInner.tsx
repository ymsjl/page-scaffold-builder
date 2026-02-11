import React, { useMemo } from "react";
import type { ComponentNode } from "@/types";
import type { getComponentPrototype } from "../../componentMetas";
import { useResolvedProps } from "./ReactNodeRenderer";
import { CONTAINER_STYLE } from "./previewStyles";

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

