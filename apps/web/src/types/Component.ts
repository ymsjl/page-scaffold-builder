import type React from "react";
import { ProCommonColumn, PropAttribute } from "@/types";

export const COMPONENT_TYPES = [
  "Page",
  "Table",
  "Form",
  "Description",
  "Button",
  "Text",
  "Modal",
] as const;
export type ComponentType = (typeof COMPONENT_TYPES)[number];

export type SlotRenderMode = "inline" | "panel";
export type SlotKind = "reactNode" | "reactNodeArray";

export interface SlotDefinition {
  id: string;
  path: string;
  label: string;
  kind: SlotKind;
  acceptTypes?: ComponentType[];
  renderMode?: SlotRenderMode;
  wrap?: boolean;
  placeholder?: string;
}

/**
 * 表示对另一个组件节点的引用
 * 用于 ReactNode 类型的 props，允许将组件树中的节点作为 props 传递
 */
export interface NodeRef {
  type: "nodeRef";
  nodeId: string;
}

export interface ToolbarActionButtonProps {
  key?: string;
  children: React.ReactNode;
  type?: "default" | "primary" | "dashed" | "link" | "text";
  size?: "large" | "middle" | "small";
  danger?: boolean;
  disabled?: boolean;
  loading?: boolean;
  block?: boolean;
  ghost?: boolean;
  htmlType?: "button" | "submit" | "reset";
}

/**
 * 检查一个值是否为 NodeRef
 */
export function isNodeRef(value: unknown): value is NodeRef {
  return (
    typeof value === "object" &&
    value !== null &&
    "type" in value &&
    (value as NodeRef).type === "nodeRef" &&
    "nodeId" in value &&
    typeof (value as NodeRef).nodeId === "string"
  );
}

export type ComponentId = string;

// 组件 “实例”
export interface ComponentInstance<P = Record<string, any>> {
  /** 组件节点唯一标识 */
  id: ComponentId;

  name: string;

  /** 组件属性 */
  props: P;

  type: ComponentType;

  /** 是否为容器组件 */
  isContainer?: boolean;

  /** 子组件节点 */
  children?: ComponentInstance[];
  /**
   * Action 绑定配置
   *
   * 映射事件名到 Action Flow ID
   * 例如: { "onClick": "flow_123", "onSubmit": "flow_456" }
   */
  actionBindings?: Record<string, string>;
}

// 组件类型元信息，相当于组件的“类定义”
export interface ComponentPrototype {
  // 组件类型名称
  name: ComponentType;

  label: string;

  /** 组件描述 */
  description?: string;

  isContainer: boolean;

  /** 组件实现，用于预览和渲染 */
  component: React.ComponentType<any>;

  /** 组件默认属性，用于新建组件节点时初始化 props */
  defaultProps: Record<string, any>;

  /** 组件属性定义，用于属性面板生成 */
  propsTypes?: Record<string, PropAttribute>;

  /** 组件插槽定义，用于 ReactNode 类型 props 的拖拽与渲染 */
  slots?: SlotDefinition[];

  /**
   * 组件支持的事件列表
   *
   * 定义该组件可以触发 Action Flow 的事件
   * 例如: ["onClick", "onSubmit", "onLoad", "onChange"]
   */
  supportedEvents?: Array<{
    /** 事件标识符 */
    eventName: string;
    /** 事件显示名称 */
    label: string;
    /** 事件描述 */
    description?: string;
  }>;
}

export interface ComponentNode<P = Record<string, any>> extends Omit<
  ComponentInstance<P>,
  "children"
> {
  parentId?: ComponentId | null;
  childrenIds: ComponentId[];
}

export interface NormalizedComponentTree {
  entities: {
    nodes: Record<ComponentId, ComponentNode>;
  };
  result: ComponentId[];
}

export type ComponentNodeWithColumns = ComponentNode<{
  entityModelId?: string;
  columns: ProCommonColumn[];
}>;
