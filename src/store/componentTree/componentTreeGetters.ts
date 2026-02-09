import type { ComponentNode, ComponentNodeWithColumns, } from "@/types/Component";
import type { ComponentTreeState } from "./componentTreeSlice";
import { getSelectedNode, getSelectedNodeWithColumns, MaybeWritable } from "./componentTreeSelectors";

export const withSelectedNode = <T = void>(
  state: MaybeWritable<ComponentTreeState>,
  fn: (node: MaybeWritable<ComponentNode>) => T,
): T | undefined => {
  const node = getSelectedNode(state);
  return node ? fn(node) : undefined;
};

/**
 * 对选中节点（带列配置）执行操作
 */
export const withSelectedNodeColumns = <T = void>(
  state: MaybeWritable<ComponentTreeState>,
  fn: (node: MaybeWritable<ComponentNodeWithColumns>) => T,
): T | undefined => {
  const node = getSelectedNodeWithColumns(state);
  return node ? fn(node) : undefined;
};