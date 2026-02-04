import type React from "react";
import { ProCommonColumn, PropAttribute } from "@/types";

export const COMPONENT_TYPES = ["Page", "Table", "Form"] as const;
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

  /**
   * 组件支持的操作列表。
   *
   * 每个字符串表示一个操作标识符（例如点击、提交、自定义动作的 key），
   * 用于声明由该组件原型创建的组件实例在设计器或运行时中可触发的行为。
   */
  actions?: string[];
}

export interface ComponentNode<P = Record<string, any>>
  extends Omit<ComponentInstance<P>, "children"> {
  parentId?: ComponentId | null;
  childrenIds: ComponentId[];
}

export interface NormalizedComponentTree {
  nodesById: Record<ComponentId, ComponentNode>;
  rootIds: ComponentId[];
}

export type ComponentNodeWithColumns = ComponentNode<{
  entityModelId?: string;
  columns: ProCommonColumn[];
}>;
