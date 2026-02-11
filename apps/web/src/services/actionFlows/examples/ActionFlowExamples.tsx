/**
 * Action Flow 使用示例
 * 
 * 展示如何创建、编辑和执行 Action Flow
 */

import React from "react";
import { Button, Space, Card } from "antd";
import { useActionFlow, useFlowExecutor } from "@/services/actionFlows";

/**
 * 示例 1: 创建一个简单的HTTP请求流程
 */
export function Example1_CreateSimpleFlow() {
  const { createFlow, addNode, addEdge } = useActionFlow();

  const handleCreateFlow = () => {
    // 创建流程
    createFlow("用户列表加载", "从API获取用户列表并显示消息");

    // 添加HTTP请求节点
    addNode("httpRequest", {
      label: "获取用户数据",
      position: { x: 100, y: 100 },
      params: {
        url: "https://jsonplaceholder.typicode.com/users",
        method: "GET",
      },
    });

    // 添加成功消息节点
    addNode("showMessage", {
      label: "显示成功消息",
      position: { x: 400, y: 100 },
      params: {
        messageType: "success",
        content: "用户数据加载成功！",
        duration: 2000,
      },
    });

    // 连接两个节点（HTTP请求成功后显示消息）
    // 注意: 实际使用时需要获取刚创建节点的真实 ID
    // 这里仅作为示例展示 API 用法
  };

  return (
    <Card title="示例 1: 创建简单流程">
      <Button type="primary" onClick={handleCreateFlow}>
        创建用户列表加载流程
      </Button>
    </Card>
  );
}

/**
 * 示例 2: 执行 Flow
 */
export function Example2_ExecuteFlow() {
  const { executeFlow, isExecuting, executionResults } = useFlowExecutor();
  const [flowId, setFlowId] = React.useState("flow_123");

  const handleExecute = async () => {
    try {
      const results = await executeFlow(flowId, {
        variables: {
          userId: "user_001",
          locale: "zh-CN",
        },
      });

      console.log("执行结果:", results);
    } catch (error) {
      console.error("执行失败:", error);
    }
  };

  return (
    <Card title="示例 2: 执行 Flow">
      <Space direction="vertical" style={{ width: "100%" }}>
        <Button
          type="primary"
          onClick={handleExecute}
          loading={isExecuting}
          disabled={isExecuting}
        >
          {isExecuting ? "执行中..." : "执行 Flow"}
        </Button>

        {executionResults.length > 0 && (
          <div>
            <h4>执行结果:</h4>
            <pre>{JSON.stringify(executionResults, null, 2)}</pre>
          </div>
        )}
      </Space>
    </Card>
  );
}

/**
 * 示例 3: 复杂流程 - 带条件分支的用户注册
 */
export function Example3_ComplexFlow() {
  const { activeFlow, nodes, edges, addNode, addEdge } = useActionFlow();

  const handleCreateComplexFlow = () => {
    // 1. 添加表单提交节点
    addNode("form.submit", {
      label: "提交注册表单",
      position: { x: 100, y: 100 },
      params: {
        validate: true,
      },
    });

    // 2. 添加HTTP请求节点（注册API）
    addNode("httpRequest", {
      label: "调用注册API",
      position: { x: 300, y: 100 },
      params: {
        url: "/api/register",
        method: "POST",
      },
    });

    // 3. 添加条件节点（检查是否成功）
    addNode("condition", {
      label: "检查注册结果",
      position: { x: 500, y: 100 },
      params: {
        condition: "inputs.success === true",
      },
    });

    // 4. 成功分支 - 显示成功消息
    addNode("showMessage", {
      label: "注册成功",
      position: { x: 700, y: 50 },
      params: {
        messageType: "success",
        content: "注册成功！",
      },
    });

    // 5. 成功分支 - 跳转到登录页
    addNode("navigate", {
      label: "跳转登录",
      position: { x: 900, y: 50 },
      params: {
        path: "/login",
      },
    });

    // 6. 失败分支 - 显示错误消息
    addNode("showMessage", {
      label: "注册失败",
      position: { x: 700, y: 150 },
      params: {
        messageType: "error",
        content: "注册失败，请重试",
      },
    });

    // 连接节点（实际使用时需要真实的节点 ID）
    // 表单提交 -> HTTP请求 -> 条件判断 -> 成功/失败分支
  };

  return (
    <Card title="示例 3: 复杂流程（用户注册）">
      <Space direction="vertical" style={{ width: "100%" }}>
        <Button type="primary" onClick={handleCreateComplexFlow}>
          创建注册流程
        </Button>

        {activeFlow && (
          <div>
            <h4>当前流程: {activeFlow.name}</h4>
            <p>节点数: {nodes.length}</p>
            <p>边数: {edges.length}</p>
          </div>
        )}
      </Space>
    </Card>
  );
}

/**
 * 示例 4: 并行执行多个请求
 */
export function Example4_ParallelExecution() {
  const { createFlow, addNode } = useActionFlow();

  const handleCreateParallelFlow = () => {
    createFlow("并行数据加载", "同时加载用户、文章和评论数据");

    // 添加开始节点
    addNode("start", {
      label: "开始",
      position: { x: 100, y: 200 },
    });

    // 添加三个并行的HTTP请求节点
    addNode("httpRequest", {
      label: "获取用户",
      position: { x: 300, y: 100 },
      params: {
        url: "https://jsonplaceholder.typicode.com/users",
        method: "GET",
      },
    });

    addNode("httpRequest", {
      label: "获取文章",
      position: { x: 300, y: 200 },
      params: {
        url: "https://jsonplaceholder.typicode.com/posts",
        method: "GET",
      },
    });

    addNode("httpRequest", {
      label: "获取评论",
      position: { x: 300, y: 300 },
      params: {
        url: "https://jsonplaceholder.typicode.com/comments",
        method: "GET",
      },
    });

    // 添加汇总节点
    addNode("showMessage", {
      label: "全部加载完成",
      position: { x: 600, y: 200 },
      params: {
        messageType: "success",
        content: "所有数据加载完成",
      },
    });
  };

  return (
    <Card title="示例 4: 并行执行">
      <Button type="primary" onClick={handleCreateParallelFlow}>
        创建并行加载流程
      </Button>
      <p style={{ marginTop: 16 }}>
        这个流程会同时发起三个HTTP请求，所有请求完成后显示成功消息
      </p>
    </Card>
  );
}

/**
 * 示例 5: 绑定到组件事件
 */
export function Example5_BindToComponent() {
  return (
    <Card title="示例 5: 绑定到组件">
      <p>在组件实例中配置 actionBindings:</p>
      <pre>{`
{
  id: "table_1",
  type: "Table",
  actionBindings: {
    "onLoad": "flow_loadData",      // 加载时执行
    "onRefresh": "flow_refreshData", // 刷新时执行
    "onRowClick": "flow_viewDetail"  // 点击行时执行
  }
}
      `}</pre>
      <p>在组件原型中定义支持的事件:</p>
      <pre>{`
{
  name: "Table",
  supportedEvents: [
    {
      eventName: "onLoad",
      label: "加载时",
      description: "组件挂载时触发"
    },
    {
      eventName: "onRefresh",
      label: "刷新时",
      description: "点击刷新按钮时触发"
    }
  ]
}
      `}</pre>
    </Card>
  );
}

/**
 * 完整示例应用
 */
export function ActionFlowExamples() {
  return (
    <div style={{ padding: 24 }}>
      <h1>Action Flow 系统使用示例</h1>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Example1_CreateSimpleFlow />
        <Example2_ExecuteFlow />
        <Example3_ComplexFlow />
        <Example4_ParallelExecution />
        <Example5_BindToComponent />
      </Space>
    </div>
  );
}
