import { PayloadAction } from "@reduxjs/toolkit";
import { WritableDraft } from "immer";
import type { ComponentInstance, ComponentNode } from "@/types/Component";
import type { ComponentTreeState } from "../componentTreeSlice";
import { getComponentPrototype } from "@/componentMetas";
import { makeNodeId } from "../componentTreeSlice";
import { normalizeComponentTree } from "../componentTreeNormalization";

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
      const nodes = state.normalizedTree.entities.nodes;
      const rootIds = state.normalizedTree.result;
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
      nodes[node.id] = node;

      if (!parentId) {
        rootIds.push(node.id);
        return;
      }

      const parentNode = nodes[parentId];
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
      const nodes = state.normalizedTree.entities.nodes;
      const rootIds = state.normalizedTree.result;
      const id = action.payload;
      const node = nodes[id];
      if (!node) return;

      if (node.parentId) {
        const parent = nodes[node.parentId];
        if (parent?.childrenIds) {
          const idx = parent.childrenIds.indexOf(id);
          if (idx >= 0) {
            parent.childrenIds.splice(idx, 1);
          }
        }
      } else {
        const idx = rootIds.indexOf(id);
        if (idx >= 0) {
          rootIds.splice(idx, 1);
        }
      }

      const removeRecursively = (nodeId: string) => {
        const n = nodes[nodeId];
        if (n?.childrenIds) n.childrenIds.forEach(removeRecursively);
        delete nodes[nodeId];
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
      const nodes = state.normalizedTree.entities.nodes;
      const { id, updates } = action.payload;
      const node = nodes[id];
      if (!node) return;
      nodes[id] = { ...node, ...updates };
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

    /**
     * @description 使用 normalizr 结果替换整棵组件树
     * @param action.payload 原始组件树（包含 children 嵌套）
     */
    setComponentTreeFromRaw: (
      state: State,
      action: PayloadAction<ComponentInstance | ComponentInstance[]>,
    ) => {
      state.normalizedTree = normalizeComponentTree(action.payload);
    },
  };
};
