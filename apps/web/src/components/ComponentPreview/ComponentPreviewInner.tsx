import React, { useMemo } from "react";
import type { ComponentNode } from "@/types";
import type { getComponentPrototype } from "../../componentMetas";
import { useResolvedProps } from "./ReactNodeRenderer";
import { CONTAINER_STYLE, FINAL_CONTAINER_STYLE } from "./previewStyles";

type ComponentPreviewInnerProps = {
  node: ComponentNode;
  componentPrototype: NonNullable<ReturnType<typeof getComponentPrototype>>;
  containerVariant?: "builder" | "final";
};

const ComponentPreviewInner = React.memo(
  ({
    node,
    componentPrototype,
    containerVariant = "builder",
  }: ComponentPreviewInnerProps) => {
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

    const containerStyle =
      containerVariant === "final" ? FINAL_CONTAINER_STYLE : CONTAINER_STYLE;

    return (
      <div
        id="modal-preview-root"
        style={{ ...containerStyle, position: "relative" }}
      >
        {" "}
        {componentElem}
      </div>
    );
  },
);

export default ComponentPreviewInner;
