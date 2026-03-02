import { createSlice, createEntityAdapter } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { ActionFlow, ActionNodeBase, ActionEdge } from '@/types/actions';
import { makeIdCreator } from '@/utils/makeIdCreator';

// ============================================
// Entity Adapters
// ============================================

export const flowAdapter = createEntityAdapter<ActionFlow>();

// ============================================
// ID 生成器
// ============================================

export const makeFlowId = makeIdCreator('flow');
export const makeNodeId = makeIdCreator('node');
export const makeEdgeId = makeIdCreator('edge');

// ============================================
// State 定义
// ============================================

interface ActionFlowsState {
  flows: ReturnType<typeof flowAdapter.getInitialState>;
  /** 当前编辑的 flow ID */
  activeFlowId: string | null;
  /** 当前选中的节点 IDs */
  selectedNodeIds: string[];
}

export type ActionFlowsSnapshot = Pick<
  ActionFlowsState,
  'flows' | 'activeFlowId' | 'selectedNodeIds'
>;

const initialState: ActionFlowsState = {
  flows: flowAdapter.getInitialState(),
  activeFlowId: null,
  selectedNodeIds: [],
};

// ============================================
// Slice
// ============================================

const slice = createSlice({
  name: 'actionFlows',
  initialState,
  reducers: {
    /**
     * @description 创建新的 Action Flow
     * @param action.payload.name 流程名称
     * @param action.payload.description 流程描述
     * @param action.payload.id 可选的流程 ID（如果不提供则自动生成）
     */
    createFlow: (
      state,
      action: PayloadAction<{
        name: string;
        description?: string;
        id?: string;
      }>,
    ) => {
      const flow: ActionFlow = {
        id: action.payload.id || makeFlowId(),
        name: action.payload.name,
        description: action.payload.description,
        nodes: [],
        edges: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      flowAdapter.addOne(state.flows, flow);
      state.activeFlowId = flow.id;
    },

    /**
     * @description 更新 Flow
     * @param action.payload.id Flow ID
     * @param action.payload.changes 更新内容
     */
    updateFlow: (
      state,
      action: PayloadAction<{
        id: string;
        changes: Partial<Omit<ActionFlow, 'id'>>;
      }>,
    ) => {
      const { id, changes } = action.payload;
      flowAdapter.updateOne(state.flows, {
        id,
        changes: {
          ...changes,
          updatedAt: Date.now(),
        },
      });
    },

    /**
     * @description 删除 Flow
     * @param action.payload Flow ID
     */
    deleteFlow: (state, action: PayloadAction<string>) => {
      flowAdapter.removeOne(state.flows, action.payload);
      if (state.activeFlowId === action.payload) {
        state.activeFlowId = null;
      }
    },

    /**
     * @description 设置当前编辑的 Flow
     * @param action.payload Flow ID
     */
    setActiveFlow: (state, action: PayloadAction<string | null>) => {
      state.activeFlowId = action.payload;
    },

    /**
     * @description 添加节点到当前 Flow
     * @param action.payload.type 节点类型
     * @param action.payload.label 节点标签
     * @param action.payload.position 节点位置
     * @param action.payload.params 节点参数
     */
    addNode: (
      state,
      action: PayloadAction<{
        type: string;
        label?: string;
        position?: { x: number; y: number };
        params?: Record<string, any>;
      }>,
    ) => {
      if (!state.activeFlowId) return;

      const flow = state.flows.entities[state.activeFlowId];
      if (!flow) return;

      const node: ActionNodeBase = {
        id: makeNodeId(),
        type: action.payload.type,
        label: action.payload.label || `${action.payload.type} Node`,
        params: action.payload.params || {},
        position: action.payload.position || { x: 0, y: 0 },
        inputs: [],
        outputs: [],
        disabled: false,
      };

      flow.nodes.push(node);
      flow.updatedAt = Date.now();
    },

    /**
     * @description 更新节点
     * @param action.payload.nodeId 节点 ID
     * @param action.payload.changes 更新内容
     */
    updateNode: (
      state,
      action: PayloadAction<{
        nodeId: string;
        changes: Partial<ActionNodeBase>;
      }>,
    ) => {
      if (!state.activeFlowId) return;

      const flow = state.flows.entities[state.activeFlowId];
      if (!flow) return;

      const nodeIndex = flow.nodes.findIndex((n) => n.id === action.payload.nodeId);
      if (nodeIndex >= 0) {
        Object.assign(flow.nodes[nodeIndex], action.payload.changes);
        flow.updatedAt = Date.now();
      }
    },

    /**
     * @description 批量更新节点位置（用于拖拽）
     * @param action.payload 节点位置更新数组
     */
    updateNodePositions: (
      state,
      action: PayloadAction<
        Array<{
          nodeId: string;
          position: { x: number; y: number };
        }>
      >,
    ) => {
      if (!state.activeFlowId) return;

      const flow = state.flows.entities[state.activeFlowId];
      if (!flow) return;

      action.payload.forEach(({ nodeId, position }) => {
        const node = flow.nodes.find((n) => n.id === nodeId);
        if (node) {
          node.position = position;
        }
      });

      flow.updatedAt = Date.now();
    },

    /**
     * @description 删除节点（同时删除相关的边）
     * @param action.payload 节点 ID
     */
    deleteNode: (state, action: PayloadAction<string>) => {
      if (!state.activeFlowId) return;

      const flow = state.flows.entities[state.activeFlowId];
      if (!flow) return;

      // 删除节点
      flow.nodes = flow.nodes.filter((n) => n.id !== action.payload);

      // 删除相关的边
      flow.edges = flow.edges.filter(
        (e) => e.source !== action.payload && e.target !== action.payload,
      );

      // 从选中列表中移除
      state.selectedNodeIds = state.selectedNodeIds.filter((id) => id !== action.payload);

      flow.updatedAt = Date.now();
    },

    /**
     * @description 添加边（连接）
     * @param action.payload 边定义
     */
    addEdge: (state, action: PayloadAction<Omit<ActionEdge, 'id'>>) => {
      if (!state.activeFlowId) return;

      const flow = state.flows.entities[state.activeFlowId];
      if (!flow) return;

      // 检查是否已存在相同的连接
      const existingEdge = flow.edges.find(
        (e) =>
          e.source === action.payload.source &&
          e.sourcePort === action.payload.sourcePort &&
          e.target === action.payload.target &&
          e.targetPort === action.payload.targetPort,
      );

      if (existingEdge) return;

      const edge: ActionEdge = {
        id: makeEdgeId(),
        ...action.payload,
      };

      flow.edges.push(edge);
      flow.updatedAt = Date.now();
    },

    /**
     * @description 更新边
     * @param action.payload.edgeId 边 ID
     * @param action.payload.changes 更新内容
     */
    updateEdge: (
      state,
      action: PayloadAction<{
        edgeId: string;
        changes: Partial<ActionEdge>;
      }>,
    ) => {
      if (!state.activeFlowId) return;

      const flow = state.flows.entities[state.activeFlowId];
      if (!flow) return;

      const edgeIndex = flow.edges.findIndex((e) => e.id === action.payload.edgeId);
      if (edgeIndex >= 0) {
        Object.assign(flow.edges[edgeIndex], action.payload.changes);
        flow.updatedAt = Date.now();
      }
    },

    /**
     * @description 删除边
     * @param action.payload 边 ID
     */
    deleteEdge: (state, action: PayloadAction<string>) => {
      if (!state.activeFlowId) return;

      const flow = state.flows.entities[state.activeFlowId];
      if (!flow) return;

      flow.edges = flow.edges.filter((e) => e.id !== action.payload);
      flow.updatedAt = Date.now();
    },

    /**
     * @description 选中节点
     * @param action.payload 节点 ID 数组
     */
    selectNodes: (state, action: PayloadAction<string[]>) => {
      state.selectedNodeIds = action.payload;
    },

    /**
     * @description 清空选中
     */
    clearSelection: (state) => {
      state.selectedNodeIds = [];
    },

    /**
     * @description 设置流程入口节点
     * @param action.payload 节点 ID
     */
    setEntryNode: (state, action: PayloadAction<string | null>) => {
      if (!state.activeFlowId) return;

      const flow = state.flows.entities[state.activeFlowId];
      if (!flow) return;

      flow.entryNodeId = action.payload || undefined;
      flow.updatedAt = Date.now();
    },

    hydrateFromSnapshot: (state, action: PayloadAction<Partial<ActionFlowsSnapshot>>) => {
      const next = action.payload;
      if (next.flows) {
        state.flows = next.flows;
      }
      if (typeof next.activeFlowId !== 'undefined') {
        state.activeFlowId = next.activeFlowId;
      }
      if (Array.isArray(next.selectedNodeIds)) {
        state.selectedNodeIds = next.selectedNodeIds;
      }
    },
  },
});

export const actionFlowsActions = slice.actions;
export const {
  createFlow,
  updateFlow,
  deleteFlow,
  setActiveFlow,
  addNode,
  updateNode,
  updateNodePositions,
  deleteNode,
  addEdge,
  updateEdge,
  deleteEdge,
  selectNodes,
  clearSelection,
  setEntryNode,
  hydrateFromSnapshot,
} = slice.actions;
export default slice.reducer;

// ============================================
// Selectors
// ============================================

export const flowSelectors = flowAdapter.getSelectors(
  (state: { actionFlows: ActionFlowsState }) => state.actionFlows.flows,
);

// ============================================
// Persist 配置
// ============================================

// Persist the main actionFlows slice fields so user-created flows survive across sessions.
export const actionFlowsPersistWhitelist: (keyof ActionFlowsState)[] = [
  'flows',
  'activeFlowId',
  'selectedNodeIds',
];
