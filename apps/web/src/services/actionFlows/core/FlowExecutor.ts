import type {
  ActionFlow,
  ActionNodeBase,
  ActionEdge,
  FlowExecutionContext,
  NodeExecutionResult
} from "@/types/actions";
import { NodeStrategyRegistry } from "../strategies/NodeStrategyRegistry";

/**
 * Flow 执行引擎
 * 
 * 负责执行 Action Flow 图：
 * - 图遍历：从入口节点开始，按边连接顺序执行
 * - 拓扑排序：处理依赖关系，确保数据流正确
 * - 并行执行：没有依赖关系的节点可并行执行
 */
export class FlowExecutor {
  constructor(
    private strategyRegistry: NodeStrategyRegistry
  ) { }

  /**
   * 执行完整的 Flow
   */
  async executeFlow(
    flow: ActionFlow,
    context: FlowExecutionContext
  ): Promise<NodeExecutionResult[]> {
    const results: NodeExecutionResult[] = [];
    const nodeMap = new Map(flow.nodes.map(n => [n.id, n]));
    const edgesBySource = this.groupEdgesBySource(flow.edges);

    // 找到入口节点（没有输入边的节点或指定的入口节点）
    const entryNodes = this.findEntryNodes(flow);

    if (entryNodes.length === 0) {
      throw new Error("No entry nodes found in flow");
    }

    // 使用广度优先遍历
    const queue: ActionNodeBase[] = [...entryNodes];
    const executed = new Set<string>();

    while (queue.length > 0) {
      // 获取所有可立即执行的节点（依赖已满足）
      const readyNodes = queue.filter(node =>
        this.areInputsSatisfied(node, flow.edges, executed)
      );

      if (readyNodes.length === 0) {
        // 检查是否有循环依赖
        if (queue.length > 0) {
          throw new Error("Circular dependency detected in flow");
        }
        break;
      }

      // 并行执行所有就绪节点 (Vercel 最佳实践: async-parallel)
      const batchResults = await Promise.all(
        readyNodes.map(node => this.executeNode(node, flow, context))
      );

      // 记录结果
      results.push(...batchResults);
      batchResults.forEach(result => {
        executed.add(result.nodeId);
        // 缓存节点输出
        context.nodeOutputs[result.nodeId] = result.outputs;
      });

      // 移除已执行节点，添加下游节点
      readyNodes.forEach(node => {
        const index = queue.indexOf(node);
        if (index >= 0) queue.splice(index, 1);

        // 添加下游节点
        const outgoingEdges = edgesBySource.get(node.id) || [];
        outgoingEdges.forEach(edge => {
          // 检查条件（如果有）
          if (edge.condition && !this.evaluateCondition(edge.condition, context)) {
            return;
          }

          const targetNode = nodeMap.get(edge.target);
          if (targetNode && !executed.has(targetNode.id) && !queue.includes(targetNode)) {
            queue.push(targetNode);
          }
        });
      });
    }

    return results;
  }

  /**
   * 执行单个节点
   */
  private resolveStrategyType(nodeType: string): string {
    if (this.strategyRegistry.hasStrategy(nodeType)) {
      return nodeType;
    }

    const aliasMap: Record<string, string> = {
      "action.httpRequest": "httpRequest",
      "action.navigate": "navigate",
      "action.showMessage": "showMessage",
      "control.delay": "delay",
    };

    const mappedType = aliasMap[nodeType];
    if (mappedType && this.strategyRegistry.hasStrategy(mappedType)) {
      return mappedType;
    }

    return nodeType;
  }

  private async executeNode(
    node: ActionNodeBase,
    flow: ActionFlow,
    context: FlowExecutionContext
  ): Promise<NodeExecutionResult> {
    if (node.disabled) {
      return {
        nodeId: node.id,
        success: true,
        outputs: {},
      };
    }

    const startTime = Date.now();

    try {
      // 获取节点策略
      const strategyType = this.resolveStrategyType(node.type);
      if (!this.strategyRegistry.hasStrategy(strategyType)) {
        throw new Error(`Unknown node type: ${node.type}`);
      }

      const strategy = this.strategyRegistry.getStrategy(strategyType);

      // 准备输入数据（从上游节点的输出中提取）
      const inputs = this.resolveNodeInputs(node, flow, context);

      // 执行节点
      const outputs = await strategy.execute(node, inputs, context);

      return {
        nodeId: node.id,
        success: true,
        outputs,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      return {
        nodeId: node.id,
        success: false,
        outputs: {},
        error: error instanceof Error ? error.message : String(error),
        duration: Date.now() - startTime,
      };
    }
  }

  /**
   * 解析节点输入（从连接的上游节点获取数据）
   */
  private resolveNodeInputs(
    node: ActionNodeBase,
    flow: ActionFlow,
    context: FlowExecutionContext
  ): Record<string, any> {
    const inputs: Record<string, any> = {};

    // 找到所有连接到此节点的边
    const incomingEdges = flow.edges.filter(e => e.target === node.id);

    incomingEdges.forEach(edge => {
      // 从上游节点的输出中获取数据
      const sourceOutputs = context.nodeOutputs[edge.source] as Record<string, any> | undefined;
      if (
        sourceOutputs &&
        typeof sourceOutputs === 'object' &&
        typeof edge.sourcePort === 'string' &&
        typeof edge.targetPort === 'string' &&
        edge.sourcePort in sourceOutputs
      ) {
        inputs[edge.targetPort] = sourceOutputs[edge.sourcePort];
      }
    });

    // 使用默认值填充未连接的端口
    node.inputs.forEach(port => {
      if (!(port.id in inputs) && port.defaultValue !== undefined) {
        inputs[port.id] = port.defaultValue;
      }
    });

    return inputs;
  }

  /**
   * 检查节点的所有输入是否已满足
   */
  private areInputsSatisfied(
    node: ActionNodeBase,
    edges: ActionEdge[],
    executed: Set<string>
  ): boolean {
    // 找到所有输入边
    const incomingEdges = edges.filter(e => e.target === node.id);

    // 如果没有输入边，则认为已满足
    if (incomingEdges.length === 0) {
      return true;
    }

    // 所有源节点都已执行
    return incomingEdges.every(edge => executed.has(edge.source));
  }

  /**
   * 找到流程的入口节点
   */
  private findEntryNodes(flow: ActionFlow): ActionNodeBase[] {
    // 如果指定了入口节点，使用指定的
    if (flow.entryNodeId) {
      const entryNode = flow.nodes.find(n => n.id === flow.entryNodeId);
      return entryNode ? [entryNode] : [];
    }

    // 否则找到所有没有输入边的节点
    const nodesWithInput = new Set(flow.edges.map(e => e.target));
    return flow.nodes.filter(n => !nodesWithInput.has(n.id));
  }

  /**
   * 按源节点分组边
   */
  private groupEdgesBySource(edges: ActionEdge[]): Map<string, ActionEdge[]> {
    const map = new Map<string, ActionEdge[]>();
    edges.forEach(edge => {
      if (!map.has(edge.source)) {
        map.set(edge.source, []);
      }
      map.get(edge.source)!.push(edge);
    });
    return map;
  }

  /**
   * 评估条件表达式
   */
  private evaluateCondition(condition: string, context: FlowExecutionContext): boolean {
    try {
      // 简单实现：使用 Function 构造器
      // 生产环境建议使用更安全的表达式解析库（如 json-logic）
      const variables = (context as any).variables || {};
      const variableNames = Object.keys(variables);
      const args = ['context', ...variableNames];
      const fn = new Function(
        ...args,
        `return ${condition};`
      ) as (...fnArgs: any[]) => unknown;
      const variableValues = variableNames.map(name => (variables as any)[name]);
      return !!fn(context, ...variableValues);
    } catch (error) {
      console.error("Failed to evaluate condition:", condition, error);
      return false;
    }
  }
}
