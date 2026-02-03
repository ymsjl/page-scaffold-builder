import React from "react";
import { getComponentPrototype } from "../../componentMetas";
import { useAppSelector } from "../../store/hooks";
import { selectNodeForPreview } from "@/store/componentTree/componentTreeSelectors";

interface ComponentPreviewProps { }

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
      border: "2px dashed #e8e8e8",
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

  const Component = componentPrototype.component;

  const containerStyle: React.CSSProperties = {
    padding: "24px",
    height: "100%",
    overflow: "auto",
    backgroundColor: "#fafafa",
    border: "2px dashed #e8e8e8",
    borderRadius: "16px",
  };

  const renderComponent = () => {
    const defaultProps = componentPrototype.defaultProps || {};
    if (typeof Component === "string") {
      const htmlElement = Component as keyof JSX.IntrinsicElements;
      const { children, ...props } = node.props;
      return React.createElement(
        htmlElement,
        {
          ...defaultProps,
          ...props,
          key: node.id,
        },
        children,
      );
    }

    const props = { ...defaultProps, ...node.props };

    return (
      <Component {...props} key={node.id}>
        {node.props.children}
      </Component>
    );
  };

  return <div style={containerStyle}>{renderComponent()}</div>;
};

export default ComponentPreview;
