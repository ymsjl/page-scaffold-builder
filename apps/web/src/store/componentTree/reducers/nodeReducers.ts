import { type PayloadAction } from '@reduxjs/toolkit';
import { type WritableDraft } from 'immer';
import { merge } from 'lodash-es';
import type { ComponentInstance, ComponentNode } from '@/types/Component';
import { makeNodeId } from '@/utils/makeIdCreator';
import type { ComponentTreeState } from '../componentTreeSlice';
import { normalizeComponentTree } from '../componentTreeNormalization';

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
     * @param action.payload.label 组件名称（可选，默认为"New {type}"）
     * @param action.payload.isContainer 是否为容器组件（可选）
     * @param action.payload.defaultProps 默认属性（可选）
     */
    addNode: (
      state: State,
      {
        payload: { parentId, type, label, isContainer, defaultProps },
      }: PayloadAction<
        Pick<ComponentNode, 'parentId' | 'type'> & {
          label?: string;
          isContainer?: boolean;
          defaultProps?: Record<string, any>;
        }
      >,
    ) => {
      const { nodes } = state.normalizedTree.entities;
      const rootIds = state.normalizedTree.result;
      const node: ComponentNode = {
        id: makeNodeId(),
        parentId,
        type,
        name: label || `New ${type}`,
        isContainer: isContainer ?? false,
        props: defaultProps ? { ...defaultProps } : {},
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
    removeNode: (state: State, { payload: id }: PayloadAction<string>) => {
      const { nodes } = state.normalizedTree.entities;
      const rootIds = state.normalizedTree.result;
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
      { payload: { id, updates } }: PayloadAction<{ id: string; updates: Partial<ComponentNode> }>,
    ) => {
      const { nodes } = state.normalizedTree.entities;
      const node = nodes[id];
      if (!node) return;
      nodes[id] = { ...node, ...updates };
    },

    updateNodeProps: (
      state: State,
      { payload: { id, props } }: PayloadAction<{ id: string; props: Record<string, any> }>,
    ) => {
      const { nodes } = state.normalizedTree.entities;
      const node = nodes[id];
      if (!node) return;
      nodes[id].props = merge({}, nodes[id].props, props);
    },

    /**
     * @description 选择组件节点
     * @param action.payload 组件节点ID
     */
    selectNode: (state: State, { payload }: PayloadAction<string | null>) => {
      state.selectedNodeId = payload;
    },

    /**
     * @description 设置展开的节点ID列表
     * @param action.payload 展开的节点ID列表
     */
    setExpandedKeys: (state: State, { payload }: PayloadAction<string[]>) => {
      state.expandedKeys = payload;
    },

    pushNodeToPropertyPanel: (state: State, { payload }: PayloadAction<string>) => {
      if (!state.propertyPanelNodeIds) {
        state.propertyPanelNodeIds = [];
      }
      if (!state.propertyPanelNodeIds.includes(payload)) {
        state.propertyPanelNodeIds.push(payload);
      }
    },

    popNodeFromPropertyPanel: (state: State) => {
      if (!state.propertyPanelNodeIds) {
        return;
      }
      state.propertyPanelNodeIds.pop();
    },

    /**
     * @description 展开指定节点
     * @param action.payload 节点ID
     */
    expandNode: (state: State, { payload }: PayloadAction<string>) => {
      const nodeId = payload;
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
      { payload }: PayloadAction<ComponentInstance | ComponentInstance[]>,
    ) => {
      state.normalizedTree = normalizeComponentTree(payload);
    },
  };
};
