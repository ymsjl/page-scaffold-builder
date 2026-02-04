import { useCallback, useRef, useState } from "react";
import { useAppSelector } from "@/store/hooks";
import { flowAdapter } from "@/store/actionFlows/actionFlowsSlice";
import type { FlowExecutionContext, NodeExecutionResult } from "@/types/actions";
import { FlowExecutor } from "../core/FlowExecutor";
import { nodeStrategyRegistry } from "../strategies/NodeStrategyRegistry";
import { message } from "antd";

// 创建 flowSelectors
const flowSelectors = flowAdapter.getSelectors(
  (state: any) => state.actionFlows?.flows
);

/**
 * 使用 FlowExecutor 的 Hook
 * 
 * 提供执行 Action Flow 的能力
 */
export function useFlowExecutor() {
  // 使用 useRef 保持执行器实例稳定 (Vercel best practice: rerender-use-ref-transient-values)
  const executorRef = useRef(new FlowExecutor(nodeStrategyRegistry));
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResults, setExecutionResults] = useState<NodeExecutionResult[]>([]);

  /**
   * 执行指定的 Flow
   */
  const executeFlow = useCallback(async (
    flowId: string,
    context?: Partial<FlowExecutionContext>
  ): Promise<NodeExecutionResult[]> => {
    setIsExecuting(true);
    setExecutionResults([]);

    try {
      // 从 Redux 获取 Flow
      const flow = flowSelectors.selectById(
        { actionFlows: { flows: flowSelectors.selectAll } } as any,
        flowId
      );

      if (!flow) {
        throw new Error(`Flow not found: ${flowId}`);
      }

      // 构建执行上下文
      const executionContext: FlowExecutionContext = {
        flowId,
        variables: flow.variables || {},
        nodeOutputs: {},
        ...context,
      };

      // 执行 Flow
      const results = await executorRef.current.executeFlow(flow, executionContext);
      setExecutionResults(results);

      // 检查是否有失败的节点
      const failedNodes = results.filter(r => !r.success);
      if (failedNodes.length > 0) {
        message.error(`Flow execution completed with ${failedNodes.length} error(s)`);
      } else {
        message.success("Flow executed successfully");
      }

      return results;
    } catch (error) {
      message.error(`Flow execution failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    } finally {
      setIsExecuting(false);
    }
  }, []);

  /**
   * 清空执行结果
   */
  const clearResults = useCallback(() => {
    setExecutionResults([]);
  }, []);

  return {
    executeFlow,
    isExecuting,
    executionResults,
    clearResults,
  };
}
