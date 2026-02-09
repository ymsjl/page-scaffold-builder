import type { ComponentNodeWithColumns } from "@/types/Component";
import type { ComponentTreeState } from "./componentTreeSlice";
import {
  getSelectedNodeWithColumns,
  MaybeWritable,
} from "./componentTreeSelectors";

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
