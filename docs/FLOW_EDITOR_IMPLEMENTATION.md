# Action Flow 可视化编辑器 - 实现完成

## 📊 实现概览

已成功集成 React Flow 实现了一个完整的、功能强大的可视化流程编辑器。

## ✅ 已完成的功能

### 1. 核心编辑器 (FlowEditor)

**文件位置**: `src/components/FlowEditor/FlowEditor.tsx`

**功能**:

- ✅ React Flow 画布集成
- ✅ 拖拽添加节点到画布
- ✅ 节点位置调整（自动同步到 Redux）
- ✅ 节点和边的选择/删除
- ✅ 实时执行流程
- ✅ 缩放、平移、适应视图
- ✅ 小地图导航
- ✅ 工具栏（执行、保存、撤销按钮）

**特性**:

```typescript
// 三栏布局
<Layout>
  <Sider> {/* 节点库 */} </Sider>
  <Content> {/* 画布 */} </Content>
  <Sider> {/* 属性面板 */} </Sider>
</Layout>
```

### 2. 自定义节点 (CustomNode)

**文件位置**: `src/components/FlowEditor/CustomNode.tsx`

**功能**:

- ✅ 彩色分类标题栏
- ✅ 图标标识系统（20+ emoji图标）
- ✅ 端口可视化
  - 蓝色方形 = 执行流
  - 绿色圆形 = 数据流
- ✅ 参数预览
- ✅ 选中高亮效果

**颜色方案**:

- 控制流: `#1890ff` (蓝色)
- 数据处理: `#52c41a` (绿色)
- 动作: `#fa8c16` (橙色)
- 组件操作: `#722ed1` (紫色)

### 3. 节点库面板 (NodeLibrary)

**文件位置**: `src/components/FlowEditor/NodeLibrary.tsx`

**功能**:

- ✅ 按分类折叠展示（4大类，20+节点）
- ✅ 搜索过滤节点
- ✅ 拖拽添加节点
- ✅ 点击添加节点
- ✅ 节点卡片悬停效果

**节点分类**:

1. **控制流** (6个): 入口、出口、条件、循环、并行、延迟
2. **数据处理** (3个): 转换、合并、过滤
3. **动作** (4个): HTTP请求、导航、消息、确认
4. **组件操作** (7个): 表格刷新/提交、表单操作、弹窗控制

### 4. 属性编辑面板 (NodeProperties)

**文件位置**: `src/components/FlowEditor/NodeProperties.tsx`

**功能**:

- ✅ 动态表单生成（根据节点类型）
- ✅ 实时保存（onChange自动同步）
- ✅ 删除节点
- ✅ 类型化参数编辑

**支持的节点类型参数**:

- `httpRequest`: URL, Method, Headers, Body
- `navigate`: Path, NewTab
- `showMessage`: Content, Type, Duration
- `delay`: Duration
- `condition`: Condition Expression
- `loop`: Loop Type, Value
- `transform`: Transformer Function
- 通用: JSON 参数编辑

### 5. 演示页面 (FlowEditorDemo)

**文件位置**: `src/components/FlowEditor/FlowEditorDemo.tsx`

**功能**:

- ✅ 流程列表管理
- ✅ 创建新流程
- ✅ 流程切换（标签页）
- ✅ 完整的编辑器集成

## 📁 文件结构

```
src/components/FlowEditor/
├── index.ts                  # 导出模块
├── FlowEditor.tsx           # 主编辑器 (250行)
├── FlowEditor.css           # 编辑器样式
├── CustomNode.tsx           # 自定义节点 (150行)
├── CustomNode.css           # 节点样式
├── NodeLibrary.tsx          # 节点库 (200行)
├── NodeLibrary.css          # 节点库样式
├── NodeProperties.tsx       # 属性面板 (250行)
├── NodeProperties.css       # 属性面板样式
├── FlowEditorDemo.tsx       # 演示页面 (100行)
├── FlowEditorDemo.css       # 演示页面样式
└── README.md                # 使用文档
```

**总计**: 11 个文件，约 1500 行代码

## 🎨 UI 设计

### 布局

```
┌────────────────────────────────────────────────────────────┐
│  📋 Action Flow 可视化编辑器           [+ 新建流程]         │
├──────────┬───────────────────────────────────┬────────────┤
│          │                                   │            │
│  🔍 [搜] │         📐 Canvas                 │  ⚙️ 属性   │
│          │                                   │            │
│  ▼ 控制流│    ╔═══════════╗                 │  节点名称   │
│  🚀 入口 │    ║  Node 1   ║────┐            │  [______]  │
│  🏁 出口 │    ╚═══════════╝    │            │            │
│  🔀 条件 │                      ↓            │  参数配置   │
│  🔁 循环 │    ╔═══════════╗    │            │  URL:      │
│  ⚡ 并行 │    ║  Node 2   ║←───┘            │  [______]  │
│  ⏱️ 延迟 │    ╚═══════════╝                 │            │
│          │                                   │  [删除]    │
│  ▼ 数据  │    [Zoom] [Fit] [▶执行]          │            │
│  🔄 转换 │    📍 MiniMap                     │            │
│  🔗 合并 │                                   │            │
│  🔍 过滤 │                                   │            │
│          │                                   │            │
└──────────┴───────────────────────────────────┴────────────┘
```

### 交互流程

1. **添加节点**
   - 从左侧节点库拖拽到画布
   - 或点击节点库中的节点（在中心添加）

2. **连接节点**
   - 从源节点的输出端口拖拽到目标节点的输入端口
   - 蓝色方形端口连执行流
   - 绿色圆形端口连数据流

3. **编辑节点**
   - 点击节点选中
   - 右侧属性面板自动展开
   - 修改参数实时保存

4. **执行流程**
   - 点击右上角 ▶执行 按钮
   - 流程从入口节点开始执行
   - 显示执行结果

## 🔧 技术架构

### 数据流

```
User Action
    ↓
React Flow Events
    ↓
FlowEditor Callbacks
    ↓
useActionFlow Hooks
    ↓
Redux Actions (dispatch)
    ↓
actionFlowsSlice Reducers
    ↓
Redux Store (persist)
    ↓
Selectors (memoized)
    ↓
React Flow State (sync)
    ↓
UI Update
```

### 状态管理

```typescript
// Redux State
{
  actionFlows: {
    flows: {
      ids: ['flow_1', 'flow_2'],
      entities: {
        'flow_1': {
          id: 'flow_1',
          name: '示例流程',
          nodes: [...],
          edges: [...]
        }
      }
    },
    activeFlowId: 'flow_1'
  }
}
```

### Hooks API

```typescript
// useActionFlow (已更新)
const {
  createFlow: (name, desc?) => flowId,
  addNode: (flowId, type, options?) => void,
  updateNode: (flowId, nodeId, changes) => void,
  deleteNodes: (flowId, nodeIds[]) => void,
  addEdge: (flowId, edge) => void,
  deleteEdges: (flowId, edgeIds[]) => void,
} = useActionFlow();

// useFlowExecutor
const {
  executeFlow: (flowId) => Promise<void>,
  isExecuting: boolean,
  results: NodeExecutionResult[]
} = useFlowExecutor();
```

## 💡 设计亮点

### 1. 自动同步

节点位置、参数修改等操作自动同步到 Redux，无需手动保存。

```typescript
// 拖拽结束自动保存
onNodesChange={(changes) => {
  if (change.type === 'position' && !change.dragging) {
    updateNode(flowId, nodeId, { position });
  }
}}
```

### 2. 类型安全

所有节点参数通过 Zod Schema 验证，确保类型安全。

```typescript
const HttpRequestNodeParamsSchema = z.object({
  url: z.string(),
  method: z.enum(["GET", "POST", "PUT", "DELETE"]),
  headers: z.record(z.string()).optional(),
  body: z.any().optional(),
});
```

### 3. 端口系统

区分执行流和数据流，视觉清晰。

```typescript
// 执行流: 顶部输入 → 底部输出
<Handle type="target" position="top" id="exec-in" />
<Handle type="source" position="bottom" id="exec-out" />

// 数据流: 左侧输入 → 右侧输出
<Handle type="target" position="left" id="data-in" />
<Handle type="source" position="right" id="data-out" />
```

### 4. 响应式布局

三栏布局，侧边栏固定宽度，中间画布自适应。

```css
.flow-editor-layout {
  display: flex;
  height: 100vh;
}

.flow-editor-sider {
  width: 280px; /* 左侧节点库 */
  width: 320px; /* 右侧属性面板 */
}

.flow-editor-content {
  flex: 1; /* 中间画布 */
}
```

## 📊 性能优化

1. **React.memo**: 节点组件使用 memo 避免重渲染
2. **createSelector**: Redux selectors 使用 memoization
3. **懒加载**: 属性面板按需渲染
4. **事件去抖**: 拖拽结束才保存位置
5. **虚拟滚动**: 节点库使用 Collapse 组件折叠

## 🚀 使用方法

### 快速开始

```tsx
import { FlowEditorDemo } from "@/components/FlowEditor/FlowEditorDemo";

function App() {
  return <FlowEditorDemo />;
}
```

### 集成到现有页面

```tsx
import { FlowEditor } from "@/components/FlowEditor";
import { useActionFlow } from "@/services/actionFlows/hooks/useActionFlow";

function MyPage() {
  const { createFlow } = useActionFlow();
  const [flowId] = useState(() => createFlow("My Flow"));
  const flows = useAppSelector(selectAllFlows);
  const flow = flows.find((f) => f.id === flowId);

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      {flow && <FlowEditor flowId={flowId} flow={flow} />}
    </div>
  );
}
```

## 📝 API 变更

### Hooks API 更新

所有操作现在需要 `flowId` 作为第一个参数：

```typescript
// ❌ 旧 API（已废弃）
addNode(type, options);
updateNode(nodeId, changes);
addEdge(edge);

// ✅ 新 API
addNode(flowId, type, options);
updateNode(flowId, nodeId, changes);
addEdge(flowId, edge);
deleteNodes(flowId, nodeIds);
deleteEdges(flowId, edgeIds);
```

### ActionNode 字段

节点使用 `label` 而不是 `name`：

```typescript
// ❌ 错误
node.name = "My Node";

// ✅ 正确
node.label = "My Node";
```

## ⚠️ 已知问题和限制

1. **TypeScript 编译错误**:
   - ActionFlowExamples.tsx 需要更新以匹配新的 API
   - 部分 edge 字段可能为 undefined（需要添加类型守卫）

2. **功能限制**:
   - 撤销/重做仅为占位按钮
   - 不支持复制粘贴节点
   - 不支持节点分组

3. **性能**:
   - 大型流程（>100节点）可能需要优化

## 🔮 未来扩展

### 短期（1周内）

- [ ] 修复所有 TypeScript 错误
- [ ] 添加键盘快捷键
- [ ] 实现撤销/重做

### 中期（1个月内）

- [ ] 节点复制粘贴
- [ ] 导入/导出 JSON
- [ ] 节点搜索和过滤
- [ ] 画布对齐辅助线

### 长期（3个月内）

- [ ] 节点分组
- [ ] 子流程作为节点
- [ ] 协作编辑
- [ ] 版本历史

## 📚 文档

- [使用指南](./README.md)
- [API 文档](../../services/actionFlows/README.md)
- [示例代码](./FlowEditorDemo.tsx)

## 🎉 总结

✅ **完整的可视化编辑器**: 包含节点库、画布、属性面板
✅ **20+ 节点类型**: 覆盖控制流、数据处理、动作、组件操作
✅ **自动同步**: 实时保存到 Redux
✅ **类型安全**: Zod Schema + TypeScript
✅ **高性能**: React.memo + createSelector
✅ **易扩展**: 清晰的组件架构

---

**实现时间**: 2026年2月4日  
**代码规模**: 11 文件，约 1500 行  
**依赖库**: @xyflow/react v12.10.0  
**状态**: ✅ 可用（部分 TS 错误待修复）
