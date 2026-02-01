import React from "react";
import { getComponentPrototype } from "../componentMetas";
import { useAppSelector } from "../store/hooks";
import { selectSelectedNode } from "../store/selectors";

interface ComponentPreviewProps {}

const ComponentPreview: React.FC<ComponentPreviewProps> = () => {
  const node = useAppSelector(selectSelectedNode);

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
      borderRadius: "4px",
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
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    padding: "24px",
    height: "100%",
    overflow: "auto",
    backgroundColor: "#f5f5f5",
  };

  const previewContainerStyle: React.CSSProperties = {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: "4px",
    padding: "24px",
    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.03)",
    overflow: "auto",
    minHeight: "400px",
  };

  const headerStyle: React.CSSProperties = {
    fontSize: "14px",
    color: "#666",
    marginBottom: "16px",
    paddingBottom: "12px",
    borderBottom: "1px solid #e8e8e8",
  };

  const renderComponent = () => {
    if (typeof Component === "string") {
      const htmlElement = Component as keyof JSX.IntrinsicElements;
      const { children, ...props } = node.props;
      return React.createElement(
        htmlElement,
        {
          ...(componentPrototype.defaultProps || {}),
          ...props,
          key: node.id,
        },
        children,
      );
    }

    return (
      <Component {...node.props} key={node.id}>
        {node.props.children}
      </Component>
    );
  };

  return <div style={containerStyle}>{renderComponent()}</div>;
};

export default ComponentPreview;
