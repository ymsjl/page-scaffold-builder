import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  actionFlowsActions,
  makeFlowId,
} from "@/store/actionFlows/actionFlowsSlice";
import {
  selectActiveFlow,
  selectActiveFlowNodes,
  selectActiveFlowEdges,
} from "@/store/actionFlows/actionFlowsSelectors";
import type { ActionNodeBase, ActionEdge } from "@/types/actions";
import { nodeStrategyRegistry } from "../strategies/NodeStrategyRegistry";

/**
 * 管理 Action Flow 的 Hook
 *
 * 提供 Flow 的 CRUD 操作
 */
export function useActionFlow() {
  const dispatch = useAppDispatch();
  const activeFlow = useAppSelector(selectActiveFlow);
  const activeFlowId = useAppSelector(
    (state) => state.actionFlows.activeFlowId,
  );
  const nodes = useAppSelector(selectActiveFlowNodes);
  const edges = useAppSelector(selectActiveFlowEdges);

  /**
   * 创建新的 Flow
   * @returns 新创建的 Flow ID
   */
  const createFlow = useCallback(
    (name: string, description?: string): string => {
      const flowId = makeFlowId();
      dispatch(
        actionFlowsActions.createFlow({ name, description, id: flowId }),
      );
      return flowId;
    },
    [dispatch],
  );

  /**
   * 删除 Flow
   */
  const deleteFlow = useCallback(
    (flowId: string) => {
      dispatch(actionFlowsActions.deleteFlow(flowId));
    },
    [dispatch],
  );

  /**
   * 设置当前编辑的 Flow
   */
  const setActiveFlow = useCallback(
    (flowId: string | null) => {
      dispatch(actionFlowsActions.setActiveFlow(flowId));
    },
    [dispatch],
  );

  /**
   * 添加节点
   */
  const addNode = useCallback(
    (
      flowId: string,
      type: string,
      options?: {
        label?: string;
        position?: { x: number; y: number };
        params?: Record<string, any>;
      },
    ) => {
      // 设置为活动流程
      dispatch(actionFlowsActions.setActiveFlow(flowId));

      // 获取策略的默认参数
      let defaultParams = {};
      if (nodeStrategyRegistry.hasStrategy(type)) {
        const strategy = nodeStrategyRegistry.getStrategy(type);
        defaultParams = strategy.getDefaultParams?.() || {};
      }

      dispatch(
        actionFlowsActions.addNode({
          type,
          label: options?.label,
          position: options?.position,
          params: { ...defaultParams, ...options?.params },
        }),
      );
    },
    [dispatch],
  );

  /**
   * 更新节点
   */
  const updateNode = useCallback(
    (flowId: string, nodeId: string, changes: Partial<ActionNodeBase>) => {
      // 设置为活动流程
      dispatch(actionFlowsActions.setActiveFlow(flowId));
      dispatch(actionFlowsActions.updateNode({ nodeId, changes }));
    },
    [dispatch],
  );

  /**
   * 删除节点
   */
  const deleteNode = useCallback(
    (nodeId: string) => {
      dispatch(actionFlowsActions.deleteNode(nodeId));
    },
    [dispatch],
  );

  /**
   * 删除多个节点
   */
  const deleteNodes = useCallback(
    (flowId: string, nodeIds: string[]) => {
      // 设置为活动流程
      dispatch(actionFlowsActions.setActiveFlow(flowId));
      nodeIds.forEach((nodeId) => {
        dispatch(actionFlowsActions.deleteNode(nodeId));
      });
    },
    [dispatch],
  );

  /**
   * 添加边
   */
  const addEdge = useCallback(
    (flowId: string, edge: Omit<ActionEdge, "id">) => {
      // 设置为活动流程
      dispatch(actionFlowsActions.setActiveFlow(flowId));
      dispatch(actionFlowsActions.addEdge(edge));
    },
    [dispatch],
  );

  /**
   * 更新边
   */
  const updateEdge = useCallback(
    (edgeId: string, changes: Partial<ActionEdge>) => {
      dispatch(actionFlowsActions.updateEdge({ edgeId, changes }));
    },
    [dispatch],
  );

  /**
   * 删除边
   */
  const deleteEdge = useCallback(
    (edgeId: string) => {
      dispatch(actionFlowsActions.deleteEdge(edgeId));
    },
    [dispatch],
  );

  /**
   * 删除多个边
   */
  const deleteEdges = useCallback(
    (flowId: string, edgeIds: string[]) => {
      // 设置为活动流程
      dispatch(actionFlowsActions.setActiveFlow(flowId));
      edgeIds.forEach((edgeId) => {
        dispatch(actionFlowsActions.deleteEdge(edgeId));
      });
    },
    [dispatch],
  );

  /**
   * 选中节点
   */
  const selectNodes = useCallback(
    (nodeIds: string[]) => {
      dispatch(actionFlowsActions.selectNodes(nodeIds));
    },
    [dispatch],
  );

  /**
   * 清空选中
   */
  const clearSelection = useCallback(() => {
    dispatch(actionFlowsActions.clearSelection());
  }, [dispatch]);

  /**
   * 设置入口节点
   */
  const setEntryNode = useCallback(
    (nodeId: string | null) => {
      dispatch(actionFlowsActions.setEntryNode(nodeId));
    },
    [dispatch],
  );

  return {
    // 状态
    activeFlow,
    nodes,
    edges,

    // Flow 操作
    createFlow,
    deleteFlow,
    setActiveFlow,

    // 节点操作
    addNode,
    updateNode,
    deleteNode,
    deleteNodes,

    // 边操作
    addEdge,
    updateEdge,
    deleteEdge,
    deleteEdges,

    // 选择操作
    selectNodes,
    clearSelection,

    // 其他
    setEntryNode,
  };
}
