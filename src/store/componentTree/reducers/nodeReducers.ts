import { PayloadAction } from "@reduxjs/toolkit";
import { WritableDraft } from "immer";
import type { ComponentNode } from "@/types/Component";
import type { ComponentTreeState } from "../componentTreeSlice";
import { getComponentPrototype } from "@/componentMetas";
import { makeNodeId } from "../componentTreeSlice";
import { adapter } from "../componentTreeSlice";

/**
 * 节点管理相关的 Reducers
 * 负责节点的增删改查、选择、展开等操作
 */
export const createNodeReducers = () => {
  type State = WritableDraft<ComponentTreeState>;

  return {
    /**
     * @description 添加组件节点
     * @param action.payload.parentId 父组件节点ID
     * @param action.payload.type 组件类型
     */
    addNode: (
      state: State,
      action: PayloadAction<Pick<ComponentNode, "parentId" | "type">>,
    ) => {
      const { parentId, type } = action.payload;
      const prototype = getComponentPrototype(type);
      const node: ComponentNode = {
        id: makeNodeId(),
        parentId,
        type,
        name: `New ${prototype?.label}`,
        isContainer: prototype?.isContainer,
        props: prototype?.defaultProps ? { ...prototype.defaultProps } : {},
        childrenIds: [],
      };
      adapter.addOne(state.components, node);

      if (!parentId) {
        state.rootIds.push(node.id);
        return;
      }

      const parentNode = state.components.entities[parentId];
      if (parentNode && !parentNode.childrenIds.includes(node.id)) {
        parentNode.childrenIds.push(node.id);
      }
    },

    /**
     * @description 移除组件节点及其子节点
     * @param action.payload 组件节点ID
     */
    removeNode: (
      state: State,
      action: PayloadAction<string>,
    ) => {
      const id = action.payload;
      const node = state.components.entities[id];
      if (!node) return;

      if (node.parentId) {
        const parent = state.components.entities[node.parentId];
        if (parent?.childrenIds) {
          const idx = parent.childrenIds.indexOf(id);
          if (idx >= 0) {
            parent.childrenIds.splice(idx, 1);
          }
        }
      } else {
        const idx = state.rootIds.indexOf(id);
        if (idx >= 0) {
          state.rootIds.splice(idx, 1);
        }
      }

      const removeRecursively = (nodeId: string) => {
        const n = state.components.entities[nodeId];
        if (n?.childrenIds) n.childrenIds.forEach(removeRecursively);
        adapter.removeOne(state.components, nodeId);
      };
      removeRecursively(id);
    },

    /**
     * @description 更新组件节点
     * @param action.payload.id 组件节点ID
     * @param action.payload.updates 组件节点更新内容
     */
    updateNode: (
      state: State,
      action: PayloadAction<{ id: string; updates: Partial<ComponentNode> }>,
    ) => {
      const { id, updates } = action.payload;
      adapter.updateOne(state.components, { id, changes: updates });
    },

    /**
     * @description 选择组件节点
     * @param action.payload 组件节点ID
     */
    selectNode: (
      state: State,
      action: PayloadAction<string | null>,
    ) => {
      state.selectedNodeId = action.payload;
    },

    /**
     * @description 设置展开的节点ID列表
     * @param action.payload 展开的节点ID列表
     */
    setExpandedKeys: (
      state: State,
      action: PayloadAction<string[]>,
    ) => {
      state.expandedKeys = action.payload;
    },

    /**
     * @description 展开指定节点
     * @param action.payload 节点ID
     */
    expandNode: (
      state: State,
      action: PayloadAction<string>,
    ) => {
      const nodeId = action.payload;
      if (!state.expandedKeys.includes(nodeId)) {
        state.expandedKeys.push(nodeId);
      }
    },
  };
};
