import React, { useState } from "react";
import { Collapse, Input, Card } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import type { ActionNodeType } from "@/types/actions";
import "./NodeLibrary.css";

const { Panel } = Collapse;

/**
 * 节点类型定义
 */
interface NodeTypeDefinition {
  type: ActionNodeType;
  name: string;
  description: string;
  icon: string;
  category: string;
}

/**
 * 节点类型库
 */
const NODE_LIBRARY: NodeTypeDefinition[] = [
  // 控制流节点
  {
    type: "control.entry",
    name: "入口",
    description: "流程的起始点",
    icon: "🚀",
    category: "控制流",
  },
  {
    type: "control.exit",
    name: "出口",
    description: "流程的结束点",
    icon: "🏁",
    category: "控制流",
  },
  {
    type: "control.condition",
    name: "条件分支",
    description: "根据条件选择执行路径",
    icon: "🔀",
    category: "控制流",
  },
  {
    type: "control.loop",
    name: "循环",
    description: "重复执行一组节点",
    icon: "🔁",
    category: "控制流",
  },
  {
    type: "control.parallel",
    name: "并行",
    description: "同时执行多个分支",
    icon: "⚡",
    category: "控制流",
  },
  {
    type: "control.delay",
    name: "延迟",
    description: "等待指定时间后继续",
    icon: "⏱️",
    category: "控制流",
  },

  // 数据处理节点
  {
    type: "data.transform",
    name: "数据转换",
    description: "转换数据格式或结构",
    icon: "🔄",
    category: "数据处理",
  },
  {
    type: "data.merge",
    name: "合并数据",
    description: "合并多个数据源",
    icon: "🔗",
    category: "数据处理",
  },
  {
    type: "data.filter",
    name: "过滤数据",
    description: "根据条件过滤数据",
    icon: "🔍",
    category: "数据处理",
  },

  // 动作节点
  {
    type: "action.httpRequest",
    name: "HTTP 请求",
    description: "发送 HTTP 请求",
    icon: "🌐",
    category: "动作",
  },
  {
    type: "action.setVariable",
    name: "设置变量",
    description: "设置全局变量的值",
    icon: "🧮",
    category: "动作",
  },
  {
    type: "action.navigate",
    name: "页面导航",
    description: "跳转到指定页面",
    icon: "➡️",
    category: "动作",
  },
  {
    type: "action.showMessage",
    name: "显示消息",
    description: "显示提示信息",
    icon: "💬",
    category: "动作",
  },
  {
    type: "action.confirm",
    name: "确认对话框",
    description: "显示确认对话框",
    icon: "❓",
    category: "动作",
  },

  // 组件操作节点
  {
    type: "component.table.refresh",
    name: "刷新表格",
    description: "刷新表格数据",
    icon: "📊",
    category: "组件操作",
  },
  {
    type: "component.form.submit",
    name: "提交表单",
    description: "提交表单数据",
    icon: "📝",
    category: "组件操作",
  },
  {
    type: "component.form.validate",
    name: "验证表单",
    description: "验证表单字段",
    icon: "✅",
    category: "组件操作",
  },
  {
    type: "component.form.reset",
    name: "重置表单",
    description: "重置表单到初始状态",
    icon: "🔄",
    category: "组件操作",
  },
  {
    type: "component.modal.open",
    name: "打开弹窗",
    description: "打开模态对话框",
    icon: "📋",
    category: "组件操作",
  },
  {
    type: "component.modal.close",
    name: "关闭弹窗",
    description: "关闭模态对话框",
    icon: "❌",
    category: "组件操作",
  },
];

/**
 * 按分类分组节点
 */
const nodesByCategory = NODE_LIBRARY.reduce(
  (acc, node) => {
    if (!acc[node.category]) {
      acc[node.category] = [];
    }
    acc[node.category].push(node);
    return acc;
  },
  {} as Record<string, NodeTypeDefinition[]>,
);

interface NodeLibraryProps {
  onNodeSelect: (nodeType: ActionNodeType) => void;
}

/**
 * 节点库面板
 */
export const NodeLibrary: React.FC<NodeLibraryProps> = ({ onNodeSelect }) => {
  const [searchText, setSearchText] = useState("");

  // 过滤节点
  const filteredNodes = NODE_LIBRARY.filter(
    (node) =>
      node.name.toLowerCase().includes(searchText.toLowerCase()) ||
      node.description.toLowerCase().includes(searchText.toLowerCase()) ||
      node.type.toLowerCase().includes(searchText.toLowerCase()),
  );

  // 按分类分组过滤后的节点
  const filteredByCategory = filteredNodes.reduce(
    (acc, node) => {
      if (!acc[node.category]) {
        acc[node.category] = [];
      }
      acc[node.category].push(node);
      return acc;
    },
    {} as Record<string, NodeTypeDefinition[]>,
  );

  // 处理拖拽开始
  const handleDragStart = (
    event: React.DragEvent,
    nodeType: ActionNodeType,
  ) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  // 处理点击节点
  const handleNodeClick = (nodeType: ActionNodeType) => {
    onNodeSelect(nodeType);
  };

  return (
    <div className="node-library">
      <div className="node-library-header">
        <h3>节点库</h3>
        <Input
          placeholder="搜索节点..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
        />
      </div>

      <div className="node-library-content">
        <Collapse
          defaultActiveKey={Object.keys(nodesByCategory)}
          ghost
          expandIconPosition="end"
        >
          {Object.entries(filteredByCategory).map(([category, nodes]) => (
            <Panel header={category} key={category}>
              <div className="node-list">
                {nodes.map((node) => (
                  <Card
                    key={node.type}
                    className="node-card"
                    size="small"
                    draggable
                    onDragStart={(e) => handleDragStart(e, node.type)}
                    onClick={() => handleNodeClick(node.type)}
                  >
                    <div className="node-card-content">
                      <span className="node-card-icon">{node.icon}</span>
                      <div className="node-card-info">
                        <div className="node-card-name">{node.name}</div>
                        <div className="node-card-description">
                          {node.description}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Panel>
          ))}
        </Collapse>

        {filteredNodes.length === 0 && (
          <div className="node-library-empty">
            <p>未找到匹配的节点</p>
          </div>
        )}
      </div>
    </div>
  );
};
