import type React from "react";
import { PropAttribute } from "@/types";

export const COMPONENT_TYPES = ["Container", "Table", "Form"] as const;
export type ComponentType = (typeof COMPONENT_TYPES)[number];

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
}

export interface NormalizedComponentNode<P = Record<string, any>>
  extends Omit<ComponentInstance<P>, "children"> {
  parentId?: ComponentId | null;
  childrenIds: ComponentId[];
}

export interface NormalizedComponentTree {
  nodesById: Record<ComponentId, NormalizedComponentNode>;
  rootIds: ComponentId[];
}
