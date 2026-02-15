import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { ComponentNode, NormalizedComponentTree } from '@/types/Component';
import type { PrimitiveVariableValue, ProCommonColumn } from '@/types';
import { merge } from 'lodash-es';
import { makeNodeId } from '@/utils/makeIdCreator';
import { getSelectedNodeWithColumns } from './componentTreeSelectors';
import { createNodeRefReducers } from './nodeReducers/nodeRefReducers';
import { createEmptyNormalizedTree } from './componentTreeNormalization';
import { variableAdapter } from '../variablesSlice/variableAdapter';
import { upsertColumnOnNode } from './helper';

export interface ComponentTreeState {
  selectedNodeId: string | null;
  expandedKeys: string[];
  normalizedTree: NormalizedComponentTree;
  variables: ReturnType<typeof variableAdapter.getInitialState>;
  variableValues: Record<string, PrimitiveVariableValue>;
  isVariableModalOpen: boolean;
  editingVariableId: string | null;
}

const initialState: ComponentTreeState = {
  selectedNodeId: null,
  expandedKeys: [],
  normalizedTree: createEmptyNormalizedTree(),

  variables: variableAdapter.getInitialState({}),
  variableValues: {},
  isVariableModalOpen: false,
  editingVariableId: null,
};

export type ComponentTreeSnapshot = Pick<
  ComponentTreeState,
  'selectedNodeId' | 'expandedKeys' | 'normalizedTree'
>;

const slice = createSlice({
  name: 'componentTree',
  initialState,
  reducers: {
    ...createNodeRefReducers(),
    /**
     * @description 添加组件节点
     * @param action.payload.parentId 父组件节点ID
     * @param action.payload.type 组件类型
     * @param action.payload.label 组件名称（可选，默认为"New {type}"）
     * @param action.payload.isContainer 是否为容器组件（可选）
     * @param action.payload.defaultProps 默认属性（可选）
     */
    addNode: (
      state,
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
    removeNode: (state, { payload: id }: PayloadAction<string>) => {
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
      state,
      { payload: { id, updates } }: PayloadAction<{ id: string; updates: Partial<ComponentNode> }>,
    ) => {
      const { nodes } = state.normalizedTree.entities;
      const node = nodes[id];
      if (!node) return;
      nodes[id] = { ...node, ...updates };
    },

    updateNodeProps: (
      state,
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
    selectNode: (state, { payload }: PayloadAction<string | null>) => {
      state.selectedNodeId = payload;
    },

    /**
     * @description 设置展开的节点ID列表
     * @param action.payload 展开的节点ID列表
     */
    setExpandedKeys: (state, { payload }: PayloadAction<string[]>) => {
      state.expandedKeys = payload;
    },

    /**
     * @description 展开指定节点
     * @param action.payload 节点ID
     */
    expandNode: (state, { payload }: PayloadAction<string>) => {
      const nodeId = payload;
      if (!state.expandedKeys.includes(nodeId)) {
        state.expandedKeys.push(nodeId);
      }
    },

    addColumns: (state, { payload }: PayloadAction<ProCommonColumn[]>) => {
      const node = getSelectedNodeWithColumns(state);
      if (!node) return;

      const { props } = node;
      props.columns = props?.columns ?? [];
      props.columns.push(...payload);
    },

    /**
     * @description 直接插入或更新选中节点的列配置
     * 找到当前选择的节点，找到节点的 props.columns 数组，
     * 如果存在相同 key 的列配置则更新，否则插入新列配置
     * @param action.payload 列属性完整内容
     */
    upsertColumnOfSelectedNode: (
      state,
      {
        payload,
      }: PayloadAction<
        | Partial<ProCommonColumn>
        | {
            insertPos?: number;
            changes: Partial<ProCommonColumn>;
          }
      >,
    ) => {
      const node = getSelectedNodeWithColumns(state);
      if (!node) return;

      const changes = 'changes' in payload ? payload.changes : payload;
      const insertPos = 'insertPos' in payload ? payload.insertPos : undefined;
      upsertColumnOnNode(node.props, changes, insertPos);
    },

    /**
     * @description 删除选中节点的列配置
     * @param payload 列的 key;
     */
    deleteColumnForSelectedNode: (state, action: PayloadAction<string>) => {
      const node = getSelectedNodeWithColumns(state);
      if (!node) return;

      const { props } = node;
      const idx = props.columns.findIndex((c) => c.key === action.payload);
      if (idx >= 0) {
        props.columns.splice(idx, 1);
      }
    },

    /**
     * @description 移动选中节点的列配置顺序
     * @param action.payload.from 源索引
     * @param action.payload.to 目标索引
     * 找到当前选择的节点，找到节点的 props.columns 数组，
     * 将源索引的列配置移动到目标索引位置
     */
    moveColumnForSelectedNode: (state, action: PayloadAction<{ from: number; to: number }>) => {
      const { from, to } = action.payload;
      const node = getSelectedNodeWithColumns(state);
      if (!node) return;

      const { props } = node;
      const { columns } = props;
      if (from < 0 || from >= columns.length || to < 0 || to >= columns.length) return;

      const [movedItem] = columns.splice(from, 1);
      columns.splice(to, 0, movedItem);
    },

    ...createNodeRefReducers(),
    hydrateFromSnapshot: (state, action: PayloadAction<Partial<ComponentTreeSnapshot>>) => {
      const next = action.payload;

      if (typeof next.selectedNodeId !== 'undefined') {
        state.selectedNodeId = next.selectedNodeId;
      }
      if (Array.isArray(next.expandedKeys)) {
        state.expandedKeys = next.expandedKeys;
      }
      if (next.normalizedTree) {
        state.normalizedTree = next.normalizedTree;
      }
    },
  },
});

export const componentTreeActions = slice.actions;
export const {
  addNode,
  selectNode,
  updateNode,
  updateNodeProps,
  removeNode,
  setExpandedKeys,
  expandNode,

  addNodeToSlot,
  addNodeRefToProps,
  removeNodeRefFromProps,
  reorderNodeRefsInProps,

  addColumns,
  upsertColumnOfSelectedNode,
  deleteColumnForSelectedNode,
  moveColumnForSelectedNode,

  hydrateFromSnapshot,
} = slice.actions;
export default slice.reducer;
