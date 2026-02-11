# Action Flow 可视化编辑器

## 概述

基于 React Flow 的可视化流程编辑器，支持拖拽创建节点、连接节点、编辑属性等功能。

## 安装的依赖

```json
{
  "@xyflow/react": "^12.10.0"
}
```

## 核心组件

### 1. FlowEditor - 主编辑器

流程编辑器的核心组件，提供画布、节点渲染、连接管理等功能。

```tsx
import { FlowEditor } from "@/components/FlowEditor";

<FlowEditor flowId={flowId} flow={flow} />;
```

**Props:**

- `flowId: string` - 流程ID
- `flow: ActionFlow` - 流程数据对象

**功能特性:**

- ✅ 拖拽添加节点
- ✅ 连接节点（支持执行流和数据流）
- ✅ 节点位置调整
- ✅ 实时同步到 Redux
- ✅ 缩放和平移画布
- ✅ 小地图导航
- ✅ 执行流程

### 2. NodeLibrary - 节点库面板

左侧节点库面板，包含所有可用的节点类型。

```tsx
import { NodeLibrary } from "@/components/FlowEditor";

<NodeLibrary onNodeSelect={(nodeType) => console.log(nodeType)} />;
```

**节点分类:**

- **控制流**: 入口、出口、条件分支、循环、并行、延迟
- **数据处理**: 数据转换、合并数据、过滤数据
- **动作**: HTTP请求、页面导航、显示消息、确认对话框
- **组件操作**: 表格、表单、弹窗操作

### 3. NodeProperties - 属性编辑面板

右侧属性编辑面板，用于编辑选中节点的参数。

```tsx
import { NodeProperties } from "@/components/FlowEditor";

<NodeProperties
  flowId={flowId}
  node={selectedNode}
  onClose={() => setSelectedNode(null)}
/>;
```

**支持的参数类型:**

- HTTP 请求配置
- 导航路径
- 消息内容和类型
- 条件表达式
- 循环配置
- 组件引用

### 4. CustomNode - 自定义节点渲染

节点的视觉表现，根据节点类型显示不同的图标和颜色。

**设计特点:**

- 彩色标题栏（控制流=蓝色，数据=绿色，动作=橙色，组件=紫色）
- 图标标识（每种节点类型有专属emoji图标）
- 端口可视化（顶部/底部=执行流，左侧/右侧=数据流）
- 参数预览（显示前2个参数）

## 使用示例

### 完整示例（FlowEditorDemo）

```tsx
import React, { useEffect } from "react";
import { FlowEditor } from "@/components/FlowEditor";
import { useActionFlow } from "@/services/actionFlows/hooks/useActionFlow";
import { useAppSelector } from "@/store/hooks";

export const FlowEditorDemo: React.FC = () => {
  const { createFlow } = useActionFlow();
  const flows = useAppSelector(selectAllFlows);
  const [selectedFlowId, setSelectedFlowId] = React.useState<string | null>(
    null,
  );

  // 初始化：创建默认流程
  useEffect(() => {
    if (flows.length === 0) {
      const flowId = createFlow("示例流程");
      setSelectedFlowId(flowId);
    } else {
      setSelectedFlowId(flows[0].id);
    }
  }, []);

  const selectedFlow = flows.find((f) => f.id === selectedFlowId);

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      {selectedFlow && (
        <FlowEditor flowId={selectedFlow.id} flow={selectedFlow} />
      )}
    </div>
  );
};
```

### Hooks API

#### useActionFlow

管理流程的增删改查操作。

```tsx
const {
  // 创建新流程（返回 flowId）
  createFlow,

  // 添加节点
  addNode,

  // 更新节点
  updateNode,

  // 删除节点
  deleteNodes,

  // 添加边
  addEdge,

  // 删除边
  deleteEdges,

  // ...其他方法
} = useActionFlow();
```

**注意**: API 已更新，所有操作都需要 `flowId` 作为第一个参数：

```tsx
// ✅ 正确
addNode(flowId, 'action.httpRequest', {
  label: 'Get Data',
  position: { x: 100, y: 100 },
  params: { url: '/api/data' }
});

// ❌ 错误（旧API）
addNode('action.httpRequest', { ... });
```

#### useFlowExecutor

执行流程。

```tsx
const { executeFlow, isExecuting } = useFlowExecutor();

// 执行流程
await executeFlow(flowId);
```

## 布局结构

```
┌─────────────────────────────────────────────────────────────┐
│  Header (FlowEditorDemo)                                    │
├──────────┬──────────────────────────────────────┬──────────┤
│          │                                      │          │
│  Node    │        Canvas (FlowEditor)           │  Node    │
│  Library │                                      │  Props   │
│          │  - Background Grid                   │          │
│  (280px) │  - Nodes                             │ (320px)  │
│          │  - Edges                             │          │
│          │  - Controls (Zoom, Fit)              │          │
│          │  - MiniMap                           │          │
│          │                                      │          │
└──────────┴──────────────────────────────────────┴──────────┘
```

## 快捷键和交互

### 画布操作

- **鼠标滚轮**: 缩放
- **鼠标拖拽**: 平移画布
- **点击节点**: 选中节点
- **Delete**: 删除选中的节点/边

### 节点操作

- **从节点库拖拽**: 添加节点到画布
- **点击节点库中的节点**: 在中心位置添加
- **拖拽节点**: 移动位置
- **从端口拖拽**: 创建连接

### 连接规则

- **蓝色方形端口**: 执行流（顶部输入，底部输出）
- **绿色圆形端口**: 数据流（左侧输入，右侧输出）
- 不同类型的端口无法连接

## 样式自定义

所有组件都提供了 CSS 类名，可以通过覆盖样式进行自定义：

```css
/* 节点样式 */
.custom-node {
  border-radius: 8px;
}

/* 选中状态 */
.custom-node.selected {
  border-color: #1890ff;
}

/* 节点库 */
.node-library {
  background: white;
}
```

## 性能优化

1. **节点缓存**: CustomNode 使用 React.memo 避免不必要的重渲染
2. **状态同步**: 只在拖拽结束时才同步位置到 Redux
3. **选择器优化**: 使用 createSelector 进行 memoization
4. **懒加载**: 节点组件按需渲染

## 数据流

```
┌──────────────┐
│  FlowEditor  │
└──────┬───────┘
       │
       ├─→ ReactFlow (UI State)
       │   ├─ nodes[]
       │   └─ edges[]
       │
       └─→ Redux (Persistent State)
           └─ actionFlows
               ├─ flows (Entity Adapter)
               └─ activeFlowId
```

## 已知限制

1. **撤销/重做**: 当前仅显示占位按钮
2. **节点验证**: 不检查循环依赖（执行器会检测）
3. **类型推断**: 端口类型需手动管理
4. **子流程**: 尚未实现

## 下一步扩展

- [ ] 撤销/重做功能
- [ ] 节点分组
- [ ] 复制粘贴节点
- [ ] 导入/导出 JSON
- [ ] 多选节点批量操作
- [ ] 搜索和过滤节点
- [ ] 键盘快捷键
- [ ] 画布对齐辅助线

## 故障排除

### 节点不显示

- 检查 `flow.nodes` 是否包含 `position` 字段
- 确保 `nodeTypes` 已正确注册

### 连接失败

- 检查源节点和目标节点是否都存在
- 确认端口类型匹配

### Redux 状态不同步

- 确保 `flowId` 正确传递
- 检查 `setActiveFlow` 是否被调用

## 参考资源

- [React Flow 文档](https://reactflow.dev/)
- [Action Flow 核心文档](../../../services/actionFlows/README.md)
- [示例代码](./FlowEditorDemo.tsx)
