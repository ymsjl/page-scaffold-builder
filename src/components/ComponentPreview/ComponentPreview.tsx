import React, { useMemo } from "react";
import { Typography, Divider } from "antd";
import { getComponentPrototype } from "../../componentMetas";
import { useAppSelector } from "../../store/hooks";
import { selectNodeForPreview } from "@/store/componentTree/componentTreeSelectors";
import { DropZone } from "@/components/DropZone";
import { useRenderNodeRefs } from "./ReactNodeRenderer";
import type { NodeRef, PropAttribute } from "@/types";
import { isNodeRef } from "@/types";

interface ComponentPreviewProps { }

/**
 * 从 propsTypes 中递归查找 reactNode/reactNodeArray 类型的属性
 */
function findReactNodeProps(
  propsTypes: Record<string, PropAttribute> | undefined,
  parentPath: string = ""
): Array<{ path: string; attr: PropAttribute }> {
  if (!propsTypes) return [];

  const results: Array<{ path: string; attr: PropAttribute }> = [];

  for (const [key, attr] of Object.entries(propsTypes)) {
    const currentPath = parentPath ? `${parentPath}.${key}` : key;

    if (attr.type === "reactNode" || attr.type === "reactNodeArray") {
      results.push({ path: currentPath, attr });
    }

    // 递归查找子属性
    if (attr.children && Array.isArray(attr.children)) {
      for (const child of attr.children) {
        const childPath = `${currentPath}.${child.name}`;
        if (child.type === "reactNode" || child.type === "reactNodeArray") {
          results.push({ path: childPath, attr: child });
        }
        // 可以继续递归，但通常不需要太深
      }
    }
  }

  return results;
}

/**
 * 从 props 对象中按路径获取值
 */
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

/**
 * 创建带有解析后 ReactNode 的 props
 */
function useResolvedProps(
  originalProps: Record<string, unknown>,
  reactNodePaths: Array<{ path: string; attr: PropAttribute }>
): Record<string, unknown> {
  // 收集所有需要渲染的 nodeRefs
  const allNodeRefs: NodeRef[] = [];
  const pathToRefs: Record<string, NodeRef[]> = {};

  for (const { path } of reactNodePaths) {
    const value = getValueByPath(originalProps, path);
    const refs: NodeRef[] = [];

    if (Array.isArray(value)) {
      refs.push(...value.filter(isNodeRef));
    } else if (isNodeRef(value)) {
      refs.push(value);
    }

    pathToRefs[path] = refs;
    allNodeRefs.push(...refs);
  }

  // 使用 hook 渲染所有 nodeRefs
  const renderedNodes = useRenderNodeRefs(allNodeRefs);

  // 构建映射
  const nodeIdToElement: Record<string, React.ReactNode> = {};
  let index = 0;
  for (const ref of allNodeRefs) {
    if (isNodeRef(ref)) {
      nodeIdToElement[ref.nodeId] = renderedNodes[index];
      index++;
    }
  }

  // 构建新的 props 对象
  return useMemo(() => {
    const newProps = { ...originalProps };

    for (const { path } of reactNodePaths) {
      const refs = pathToRefs[path] || [];
      const rendered = refs.map((ref) => nodeIdToElement[ref.nodeId]).filter(Boolean);

      // 按路径设置值
      const parts = path.split(".");
      let current: Record<string, unknown> = newProps;

      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        if (!current[part] || typeof current[part] !== "object") {
          current[part] = {};
        }
        current = current[part] as Record<string, unknown>;
      }

      const lastPart = parts[parts.length - 1];
      current[lastPart] = rendered.length > 0 ? rendered : undefined;
    }

    return newProps;
  }, [originalProps, reactNodePaths, pathToRefs, nodeIdToElement]);
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

  // 查找 ReactNode 类型的属性
  const reactNodeProps = findReactNodeProps(componentPrototype.propsTypes);

  return (
    <ComponentPreviewInner
      node={node}
      componentPrototype={componentPrototype}
      reactNodeProps={reactNodeProps}
    />
  );
};

/**
 * 内部组件，用于在 hooks 规则下正确调用
 */
const ComponentPreviewInner: React.FC<{
  node: NonNullable<ReturnType<typeof selectNodeForPreview>>;
  componentPrototype: NonNullable<ReturnType<typeof getComponentPrototype>>;
  reactNodeProps: Array<{ path: string; attr: PropAttribute }>;
}> = ({ node, componentPrototype, reactNodeProps }) => {
  const defaultProps = componentPrototype.defaultProps || {};
  const mergedProps = { ...defaultProps, ...node.props };

  // 解析 NodeRef 为实际 React 元素
  const resolvedProps = useResolvedProps(mergedProps, reactNodeProps);

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

  // 如果有 ReactNode 类型的属性，显示拖放区域
  const hasDropZones = reactNodeProps.length > 0;

  return (
    <div style={containerStyle}>
      {hasDropZones && (
        <div style={{ marginBottom: 16 }}>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            拖拽组件到下方插槽
          </Typography.Text>
          <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 8 }}>
            {reactNodeProps.map(({ path, attr }) => {
              const value = getValueByPath(node.props, path);
              const nodeRefs: NodeRef[] = Array.isArray(value)
                ? value.filter(isNodeRef)
                : isNodeRef(value)
                  ? [value]
                  : [];

              return (
                <DropZone
                  key={path}
                  id={`${node.id}:${path}`}
                  targetNodeId={node.id}
                  propPath={path}
                  acceptTypes={(attr as PropAttribute & { acceptTypes?: string[] }).acceptTypes}
                  nodeRefs={nodeRefs}
                  label={attr.label}
                  placeholder={`拖入 ${attr.label || path}`}
                />
              );
            })}
          </div>
          <Divider style={{ margin: "16px 0" }} />
        </div>
      )}
      {renderComponent()}
    </div>
  );
};

export default ComponentPreview;
