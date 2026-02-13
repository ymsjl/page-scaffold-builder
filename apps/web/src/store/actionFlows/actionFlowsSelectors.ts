import { createSelector } from "reselect";
import type { RootState } from "../rootReducer";
import { flowAdapter } from "./actionFlowsSlice";

// ============================================
// 基础 Selectors
// ============================================

export const selectActionFlowsState = (state: RootState) => state.actionFlows;

export const flowSelectors = flowAdapter.getSelectors(
  (state: RootState) => state.actionFlows.flows,
);

// ============================================
// Flow Selectors
// ============================================

export const selectActiveFlowId = (state: RootState) =>
  state.actionFlows.activeFlowId;

export const selectActiveFlow = createSelector(
  [flowSelectors.selectEntities, selectActiveFlowId],
  (entities, activeId) => (activeId ? entities[activeId] : null),
);

export const selectAllFlows = createSelector(
  flowSelectors.selectAll,
  (flows) => flows,
);

export const selectActionFlowOptions = createSelector(selectAllFlows, (flows) =>
  flows.map((flow) => ({ label: flow.name, value: flow.id })),
);

export const selectFlowById = (flowId: string) =>
  createSelector(
    flowSelectors.selectEntities,
    (entities) => entities[flowId] || null,
  );

// ============================================
// Node Selectors
// ============================================

export const selectActiveFlowNodes = createSelector(
  selectActiveFlow,
  (flow) => flow?.nodes || [],
);

export const selectActiveFlowNodeById = (nodeId: string) =>
  createSelector(
    selectActiveFlowNodes,
    (nodes) => nodes.find((n) => n.id === nodeId) || null,
  );

export const selectActiveFlowNodesByType = (nodeType: string) =>
  createSelector(selectActiveFlowNodes, (nodes) =>
    nodes.filter((n) => n.type === nodeType),
  );

// ============================================
// Edge Selectors
// ============================================

export const selectActiveFlowEdges = createSelector(
  selectActiveFlow,
  (flow) => flow?.edges || [],
);

export const selectActiveFlowEdgeById = (edgeId: string) =>
  createSelector(
    selectActiveFlowEdges,
    (edges) => edges.find((e) => e.id === edgeId) || null,
  );

export const selectIncomingEdges = (nodeId: string) =>
  createSelector(selectActiveFlowEdges, (edges) =>
    edges.filter((e) => e.target === nodeId),
  );

export const selectOutgoingEdges = (nodeId: string) =>
  createSelector(selectActiveFlowEdges, (edges) =>
    edges.filter((e) => e.source === nodeId),
  );

// ============================================
// Selection Selectors
// ============================================

export const selectSelectedNodeIds = (state: RootState) =>
  state.actionFlows.selectedNodeIds;

export const selectSelectedNodes = createSelector(
  [selectActiveFlowNodes, selectSelectedNodeIds],
  (nodes, selectedIds) => nodes.filter((n) => selectedIds.includes(n.id)),
);

export const selectIsNodeSelected = (nodeId: string) =>
  createSelector(selectSelectedNodeIds, (selectedIds) =>
    selectedIds.includes(nodeId),
  );

// ============================================
// 图结构分析 Selectors
// ============================================

/**
 * 获取入口节点（没有输入边的节点）
 */
export const selectEntryNodes = createSelector(
  [selectActiveFlowNodes, selectActiveFlowEdges],
  (nodes, edges) => {
    const nodesWithInput = new Set(edges.map((e) => e.target));
    return nodes.filter((n) => !nodesWithInput.has(n.id));
  },
);

/**
 * 获取出口节点（没有输出边的节点）
 */
export const selectExitNodes = createSelector(
  [selectActiveFlowNodes, selectActiveFlowEdges],
  (nodes, edges) => {
    const nodesWithOutput = new Set(edges.map((e) => e.source));
    return nodes.filter((n) => !nodesWithOutput.has(n.id));
  },
);

/**
 * 获取孤立节点（既没有输入也没有输出的节点）
 */
export const selectIsolatedNodes = createSelector(
  [selectActiveFlowNodes, selectActiveFlowEdges],
  (nodes, edges) => {
    const connectedNodes = new Set([
      ...edges.map((e) => e.source),
      ...edges.map((e) => e.target),
    ]);
    return nodes.filter((n) => !connectedNodes.has(n.id));
  },
);

/**
 * 检查图中是否存在循环
 */
export const selectHasCycle = createSelector(
  [selectActiveFlowNodes, selectActiveFlowEdges],
  (nodes, edges) => {
    // 使用深度优先搜索检测循环
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const adjacencyList = new Map<string, string[]>();
    edges.forEach((edge) => {
      if (!adjacencyList.has(edge.source)) {
        adjacencyList.set(edge.source, []);
      }
      adjacencyList.get(edge.source)!.push(edge.target);
    });

    const hasCycleUtil = (nodeId: string): boolean => {
      visited.add(nodeId);
      recursionStack.add(nodeId);

      const neighbors = adjacencyList.get(nodeId) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          if (hasCycleUtil(neighbor)) {
            return true;
          }
        } else if (recursionStack.has(neighbor)) {
          return true;
        }
      }

      recursionStack.delete(nodeId);
      return false;
    };

    for (const node of nodes) {
      if (!visited.has(node.id)) {
        if (hasCycleUtil(node.id)) {
          return true;
        }
      }
    }

    return false;
  },
);

// ============================================
// Flow 元数据 Selectors
// ============================================

export const selectActiveFlowMetadata = createSelector(
  selectActiveFlow,
  (flow) =>
    flow
      ? {
          id: flow.id,
          name: flow.name,
          description: flow.description,
          nodeCount: flow.nodes.length,
          edgeCount: flow.edges.length,
          createdAt: flow.createdAt,
          updatedAt: flow.updatedAt,
        }
      : null,
);
