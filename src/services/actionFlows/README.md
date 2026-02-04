# Action Flow 系统

基于图结构的可视化 Action 流程系统，支持节点编辑和动态执行。

## 架构概览

```
┌─────────────────────┐
│   React Components  │  ← UI 层（可选的可视化编辑器）
└──────────┬──────────┘
           │
┌──────────▼──────────┐
│   Redux Store       │  ← 状态管理（Flow、Node、Edge）
│   (actionFlows)     │
└──────────┬──────────┘
           │
┌──────────▼──────────┐
│   FlowExecutor      │  ← 执行引擎（图遍历、拓扑排序）
└──────────┬──────────┘
           │
┌──────────▼──────────┐
│  Node Strategies    │  ← 节点策略（HTTP、导航、表单等）
└─────────────────────┘
```

## 核心概念

### 1. Action Flow (流程)

包含多个节点和连接边的有向图，表示完整的动作流程。

### 2. Node (节点)

流程中的执行单元，每个节点有类型、参数、输入端口和输出端口。

### 3. Edge (边)

连接两个节点，定义数据流和执行顺序。

### 4. Strategy (策略)

每种节点类型的具体实现逻辑。

## 快速开始

### 1. 创建 Flow

```typescript
import { useActionFlow } from "@/services/actionFlows";

function MyComponent() {
  const { createFlow, addNode, addEdge } = useActionFlow();

  const handleCreate = () => {
    // 创建流程
    createFlow("My First Flow", "测试流程");

    // 添加 HTTP 请求节点
    addNode("httpRequest", {
      label: "获取用户数据",
      params: {
        url: "https://api.example.com/users",
        method: "GET",
      },
    });

    // 添加消息提示节点
    addNode("showMessage", {
      label: "显示成功消息",
      params: {
        messageType: "success",
        content: "数据加载成功",
      },
    });

    // 连接两个节点
    addEdge({
      source: "node_1",
      sourcePort: "success",
      target: "node_2",
      targetPort: "trigger",
    });
  };

  return <button onClick={handleCreate}>Create Flow</button>;
}
```

### 2. 执行 Flow

```typescript
import { useFlowExecutor } from "@/services/actionFlows";

function MyComponent() {
  const { executeFlow, isExecuting, executionResults } = useFlowExecutor();

  const handleExecute = async () => {
    const results = await executeFlow("flow_123", {
      variables: {
        userId: "user_001",
      },
    });

    console.log("Execution results:", results);
  };

  return (
    <button onClick={handleExecute} disabled={isExecuting}>
      {isExecuting ? "Executing..." : "Execute Flow"}
    </button>
  );
}
```

## 内置节点类型

### 控制流节点

- **start**: 开始节点
- **condition**: 条件分支
- **loop**: 循环
- **delay**: 延时

### 数据处理节点

- **transform**: 数据转换
- **setVariable**: 设置变量

### Action 节点

- **httpRequest**: HTTP 请求
- **navigate**: 页面导航
- **showMessage**: 消息提示

### 组件节点

- **table.refresh**: 刷新表格
- **table.setSelectedRows**: 设置选中行
- **form.submit**: 提交表单
- **form.reset**: 重置表单
- **form.setFieldValue**: 设置字段值

## 扩展自定义节点

### 1. 创建策略类

```typescript
import { BaseNodeStrategy } from "@/services/actionFlows/strategies/BaseNodeStrategy";
import type {
  ActionNodeBase,
  FlowExecutionContext,
  Port,
} from "@/types/actions";

export class CustomNodeStrategy extends BaseNodeStrategy {
  type = "custom.myNode";
  label = "My Custom Node";
  description = "自定义节点示例";
  icon = "StarOutlined";
  category = "action" as const;

  async execute(
    node: ActionNodeBase,
    inputs: Record<string, any>,
    context: FlowExecutionContext,
  ): Promise<Record<string, any>> {
    // 实现节点逻辑
    const input = this.getInput(inputs, "input", "");

    // 业务逻辑
    const result = `Processed: ${input}`;

    return this.createOutput({
      output: result,
      success: true,
    });
  }

  getInputPorts(_node: ActionNodeBase): Port[] {
    return [
      { id: "trigger", name: "Trigger", type: "exec", required: false },
      { id: "input", name: "Input", type: "string", required: false },
    ];
  }

  getOutputPorts(_node: ActionNodeBase): Port[] {
    return [
      { id: "completed", name: "Completed", type: "exec", required: false },
      { id: "output", name: "Output", type: "string", required: false },
      { id: "success", name: "Success", type: "boolean", required: false },
    ];
  }

  getDefaultParams(): Record<string, any> {
    return {
      someParam: "default value",
    };
  }
}
```

### 2. 注册策略

```typescript
import { nodeStrategyRegistry } from "@/services/actionFlows";
import { CustomNodeStrategy } from "./CustomNodeStrategy";

// 注册自定义策略
nodeStrategyRegistry.register(new CustomNodeStrategy());
```

## 绑定到组件

在组件原型中定义支持的事件：

```typescript
// src/componentMetas.ts
export const componentPrototypeMap: Record<ComponentType, ComponentPrototype> =
  {
    Table: {
      name: "Table",
      label: "表格组件",
      // ...
      supportedEvents: [
        {
          eventName: "onLoad",
          label: "加载时",
          description: "组件挂载时触发",
        },
        {
          eventName: "onRowClick",
          label: "行点击",
          description: "点击表格行时触发",
        },
        {
          eventName: "onRefreshClick",
          label: "刷新点击",
          description: "点击刷新按钮时触发",
        },
      ],
    },
  };
```

## 性能优化

系统遵循 Vercel React 最佳实践：

1. **并行执行**: 独立节点使用 `Promise.all()` 并行执行
2. **模块级缓存**: 策略实例使用单例模式
3. **稳定引用**: Hooks 使用 `useRef` 保持执行器实例稳定
4. **避免重复序列化**: Redux 使用 Entity Adapter

## 未来扩展

- [ ] 可视化编辑器集成 (React Flow)
- [ ] 节点库面板
- [ ] 调试模式（断点、单步执行）
- [ ] Flow 版本控制
- [ ] 导入/导出 JSON
- [ ] 子流程支持
- [ ] 类型推断系统

## 示例：完整的用户列表加载流程

```typescript
// 1. 创建 Flow
const flow: ActionFlow = {
  id: "flow_user_list",
  name: "用户列表加载",
  nodes: [
    {
      id: "node_1",
      type: "httpRequest",
      label: "获取用户列表",
      params: {
        url: "https://api.example.com/users",
        method: "GET",
      },
      position: { x: 100, y: 100 },
      inputs: [],
      outputs: [],
    },
    {
      id: "node_2",
      type: "condition",
      label: "检查是否成功",
      params: {
        condition: "inputs.success === true",
      },
      position: { x: 300, y: 100 },
      inputs: [],
      outputs: [],
    },
    {
      id: "node_3",
      type: "showMessage",
      label: "成功提示",
      params: {
        messageType: "success",
        content: "加载成功",
      },
      position: { x: 500, y: 50 },
      inputs: [],
      outputs: [],
    },
    {
      id: "node_4",
      type: "showMessage",
      label: "失败提示",
      params: {
        messageType: "error",
        content: "加载失败",
      },
      position: { x: 500, y: 150 },
      inputs: [],
      outputs: [],
    },
  ],
  edges: [
    {
      id: "edge_1",
      source: "node_1",
      sourcePort: "success",
      target: "node_2",
      targetPort: "trigger",
    },
    {
      id: "edge_2",
      source: "node_2",
      sourcePort: "true",
      target: "node_3",
      targetPort: "trigger",
    },
    {
      id: "edge_3",
      source: "node_2",
      sourcePort: "false",
      target: "node_4",
      targetPort: "trigger",
    },
  ],
};

// 2. 执行
const results = await executeFlow(flow.id);
```

## 文件结构

```
src/
├── types/actions/
│   ├── ActionFlowTypes.ts      # 核心类型定义
│   ├── NodeTypes.ts            # 节点参数 schemas
│   └── index.ts                # 类型导出
├── store/actionFlows/
│   ├── actionFlowsSlice.ts     # Redux slice
│   └── actionFlowsSelectors.ts # Selectors
├── services/actionFlows/
│   ├── core/
│   │   └── FlowExecutor.ts     # 执行引擎
│   ├── strategies/
│   │   ├── NodeStrategy.ts     # 策略接口
│   │   ├── BaseNodeStrategy.ts # 基类
│   │   ├── HttpRequestNodeStrategy.ts
│   │   ├── NavigateNodeStrategy.ts
│   │   └── ...
│   ├── hooks/
│   │   ├── useFlowExecutor.ts  # 执行 Hook
│   │   └── useActionFlow.ts    # 管理 Hook
│   └── index.ts                # 统一导出
```
