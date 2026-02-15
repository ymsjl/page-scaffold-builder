import React, { useCallback, useMemo, useState, useRef } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Panel,
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  type Node,
  type Edge,
  type NodeChange,
  type EdgeChange,
  applyNodeChanges,
  applyEdgeChanges,
  ConnectionMode,
  ReactFlowProvider,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Button, Space, message, Layout } from 'antd';
import { PlayCircleOutlined, SaveOutlined, UndoOutlined } from '@ant-design/icons';
import { useActionFlow } from '@/services/actionFlows/hooks/useActionFlow';
import { useFlowExecutor } from '@/services/actionFlows/hooks/useFlowExecutor';
import type { ActionNode, ActionEdge, ActionFlow, ActionNodeType } from '@/types/actions';
import { CustomNode } from './CustomNode';
import { NodeLibrary } from './NodeLibrary';
import { NodeProperties } from './NodeProperties';
import * as styles from './FlowEditor.css';

const { Sider, Content } = Layout;

const nodeTypes = {
  custom: CustomNode,
};

interface FlowEditorProps {
  flowId: string;
  flow: ActionFlow;
}

/**
 * 将 ActionNode 转换为 ReactFlow Node
 */
function toReactFlowNode(node: ActionNode): Node {
  return {
    id: node.id,
    type: 'custom',
    position: node.position || { x: 0, y: 0 },
    data: node,
    style: node.style,
  };
}

/**
 * 将 ActionEdge 转换为 ReactFlow Edge
 */
function toReactFlowEdge(edge: ActionEdge): Edge {
  return {
    id: edge.id,
    source: edge.source,
    target: edge.target,
    sourceHandle: edge.sourceHandle,
    targetHandle: edge.targetHandle,
    label: edge.label,
    type: edge.animated ? 'smoothstep' : 'default',
    animated: edge.animated,
    style: {
      stroke: edge.sourceHandle?.includes('exec') ? '#1890ff' : '#52c41a',
      strokeWidth: 2,
    },
  };
}

/**
 * 流程编辑器内部组件
 */
const FlowEditorInner: React.FC<FlowEditorProps> = ({ flowId, flow }) => {
  const {
    addNode,
    updateNode,
    addEdge: addEdgeToStore,
    deleteNodes,
    deleteEdges,
  } = useActionFlow();
  const { executeFlow, isExecuting } = useFlowExecutor();
  const { screenToFlowPosition } = useReactFlow();
  const [selectedNode, setSelectedNode] = useState<ActionNode | null>(null);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  // 转换为 ReactFlow 格式
  const initialNodes = useMemo(() => flow.nodes.map(toReactFlowNode), [flow.nodes]);
  const initialEdges = useMemo(() => flow.edges.map(toReactFlowEdge), [flow.edges]);

  const [nodes, setNodes] = useNodesState(initialNodes);
  const [edges, setEdges] = useEdgesState(initialEdges);

  // 当 flow 更新时，同步 nodes 和 edges
  React.useEffect(() => {
    setNodes(flow.nodes.map(toReactFlowNode));
  }, [flow.nodes, setNodes]);

  React.useEffect(() => {
    setEdges(flow.edges.map(toReactFlowEdge));
  }, [flow.edges, setEdges]);

  // 处理节点变化（位置、选中等）
  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      // 应用变化到本地状态
      setNodes((nds) => applyNodeChanges(changes, nds));

      // 同步位置变化到 Redux
      changes.forEach((change) => {
        if (change.type === 'position' && change.position && !change.dragging) {
          updateNode(flowId, change.id, { position: change.position });
        }
        if (change.type === 'select' && change.selected) {
          const node = flow.nodes.find((n) => n.id === change.id);
          setSelectedNode(node || null);
        }
      });
    },
    [flowId, flow.nodes, setNodes, updateNode],
  );

  // 处理节点点击
  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      const actionNode = flow.nodes.find((n) => n.id === node.id);
      setSelectedNode(actionNode || null);
    },
    [flow.nodes],
  );

  // 处理边变化
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      setEdges((eds) => applyEdgeChanges(changes, eds));

      // 处理删除边
      changes.forEach((change) => {
        if (change.type === 'remove') {
          deleteEdges(flowId, [change.id]);
        }
      });
    },
    [flowId, setEdges, deleteEdges],
  );

  // 处理连接创建
  const onConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) return;

      const newEdge: Omit<ActionEdge, 'id'> = {
        source: connection.source,
        target: connection.target,
        sourceHandle: connection.sourceHandle ?? undefined,
        targetHandle: connection.targetHandle ?? undefined,
      };

      addEdgeToStore(flowId, newEdge);
      setEdges((eds) => addEdge(connection, eds));
    },
    [flowId, addEdgeToStore, setEdges],
  );

  // 处理节点删除
  const onNodesDelete = useCallback(
    (deletedNodes: Node[]) => {
      const nodeIds = deletedNodes.map((n) => n.id);
      deleteNodes(flowId, nodeIds);
    },
    [flowId, deleteNodes],
  );

  // 执行流程
  const handleExecute = useCallback(async () => {
    try {
      await executeFlow(flowId);
      message.success('流程执行成功');
    } catch (error) {
      message.error(`流程执行失败: ${(error as Error).message}`);
    }
  }, [flowId, executeFlow]);

  // 保存流程（当前已自动保存到 Redux）
  const handleSave = useCallback(() => {
    message.success('流程已保存');
  }, []);

  // 撤销（简化版）
  const handleUndo = useCallback(() => {
    message.info('撤销功能开发中');
  }, []);

  // 处理拖放到画布
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow') as ActionNodeType;
      if (!type) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      // 添加节点到 Redux
      addNode(flowId, type, { position });
    },
    [flowId, addNode, screenToFlowPosition],
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  // 处理从节点库选择节点（点击添加）
  const handleNodeSelect = useCallback(
    (nodeType: ActionNodeType) => {
      // 在画布中心添加节点
      addNode(flowId, nodeType, {
        position: { x: 250, y: 200 },
      });
      message.success('节点已添加');
    },
    [flowId, addNode],
  );

  return (
    <Layout className={styles.flowEditorLayout}>
      {/* 左侧节点库 */}
      <Sider width={280} theme="light" className={styles.flowEditorSider}>
        <NodeLibrary onNodeSelect={handleNodeSelect} />
      </Sider>

      {/* 中间画布 */}
      <Content className={styles.flowEditorContent}>
        <div className={styles.flowEditorContainer} ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodesDelete={onNodesDelete}
            onNodeClick={onNodeClick}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={nodeTypes}
            connectionMode={ConnectionMode.Loose}
            fitView
            attributionPosition="bottom-left"
          >
            <Background />
            <Controls />
            <MiniMap
              nodeColor={(node) => {
                const typePrefix = (node.data as ActionNode).type.split('.')[0];
                const colors: Record<string, string> = {
                  control: '#1890ff',
                  data: '#52c41a',
                  action: '#fa8c16',
                  component: '#722ed1',
                };
                return colors[typePrefix] || colors.action;
              }}
            />

            {/* 工具栏 */}
            <Panel position="top-right">
              <Space direction="vertical">
                <Button
                  type="primary"
                  icon={<PlayCircleOutlined />}
                  onClick={handleExecute}
                  loading={isExecuting}
                >
                  执行
                </Button>
                <Button icon={<SaveOutlined />} onClick={handleSave}>
                  保存
                </Button>
                <Button icon={<UndoOutlined />} onClick={handleUndo}>
                  撤销
                </Button>
              </Space>
            </Panel>

            {/* 信息面板 */}
            <Panel position="top-left">
              <div className={styles.flowInfoPanel}>
                <h3>{flow.name}</h3>
                <div className={styles.flowStats}>
                  <span>节点: {flow.nodes.length}</span>
                  <span>连接: {flow.edges.length}</span>
                </div>
              </div>
            </Panel>
          </ReactFlow>
        </div>
      </Content>

      {/* 右侧属性面板 */}
      <Sider width={320} theme="light" className={styles.flowEditorSider}>
        <NodeProperties flowId={flowId} node={selectedNode} onClose={() => setSelectedNode(null)} />
      </Sider>
    </Layout>
  );
};

/**
 * 流程编辑器组件（带 Provider）
 */
export const FlowEditor: React.FC<FlowEditorProps> = (props) => {
  return (
    <ReactFlowProvider>
      <FlowEditorInner {...props} />
    </ReactFlowProvider>
  );
};
