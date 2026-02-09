# Selector/Getter 架构优化分析

## 当前架构（三层结构）

```
[Result Functions]  纯逻辑，接受数据返回结果
       ↑
[Getters]          从 ComponentTreeState (WritableDraft) 提取
       ↑              ↑
[Selectors]        [Reducers]
createSelector     Immer可变操作
RootState只读
```

## 关键理解

### 为什么需要两套系统？

1. **Reducers** 需要 `getXXX`：
   - 接受 `WritableDraft<ComponentTreeState>` (Immer 可变草稿)
   - 返回**可变引用**，支持直接赋值修改
   - 不能使用 `selectXXX`（返回只读值，无法配合 Immer）

2. **React Components** 需要 `selectXXX`：
   - 从 `RootState` 选择（需要访问 `state.componentTree`）
   - 需要 memoization 优化
   - 返回只读值（符合 React 不可变性）

### Reducers 实际使用情况（检查结果）

```typescript
// ✅ 唯一被使用的 getter
- withSelectedNodeColumns (在 columnReducers.ts 中使用 5 次)

// ✅ 其他都是直接访问 state
- state.editingColumn
- state.components.entities
- state.entityModel
- state.rootIds
- 等等...
```

## 重复模式分析

## 重复模式分析

### 1. 基础访问器（被内部复用）

```typescript
// ✅ 必需 - 被 withSelectedNodeColumns 内部使用
export const getComponents = (state) => state.components;
export const getComponentsEntities = (state) => getComponents(state).entities;
export const getSelectedNodeId = (state) => state.selectedNodeId;
export const getSelectedNode = (state) => {
  const selectedId = getSelectedNodeId(state);
  return selectedId ? getComponentsEntities(state)[selectedId] : null;
};
export const getSelectedNodeWithColumns = (state) => {
  const node = getSelectedNode(state);
  return isComponentNodeWithColumns(node) ? node : null;
};
```

### 2. 高阶工具（Reducers 直接使用）

```typescript
// ✅ 必需 - columnReducers.ts 使用 5 次
export const withSelectedNodeColumns = <T>(...) => ...;

// ✅ 备用 - 目前未使用但有价值
export const withSelectedNode = <T>(...) => ...;
```

### 3. 基础访问器（Selectors 需要）

```typescript
// ✅ 必需 - 被 selectors 使用export const getEditingColumn = (state) => state.editingColumn || null;
export const getEntityModelState = (state) => state.entityModel;
export const getPreviewRootNodeId = (state) => {
  /* 查找 Page 类型 */
};
export const getIsEntityModelModalOpen = (state) =>
  state.isEntityModelModalOpen;
export const getEditingEntityModelId = (state) => state.editingEntityModelId;
```

### 4. Result Functions（纯逻辑复用）

```typescript
// ✅ 必需 - 被 selectors 复用
export const getColumnsOfSelectedNodeResult = (node) => ...;
export const getTypeOfSelectedNodeResult = (node) => ...;
// ... 其他 result functions
```

### 5. 🔴 中间桥接层（冗余！）

```typescript
// ❌ 删除 - 只是调用 getSelectedNode + result function
export const getColumnsOfSelectedNode = (state) =>
  getColumnsOfSelectedNodeResult(getSelectedNode(state));

export const getTypeOfSelectedNode = (state) =>
  getTypeOfSelectedNodeResult(getSelectedNode(state));

export const getNodeForPreview = (state) =>
  getNodeForPreviewResult(getSelectedNode(state));

export const getFirstParentPageNode = (state) =>
  getFirstParentPageNodeResult(getSelectedNode(state), getComponents(state));

export const getSelectedNodeEntityModelId = (state) =>
  getSelectedNodeEntityModelIdResult(getSelectedNode(state));

export const getPreviewRootNode = (state) =>
  getPreviewRootNodeResult(getPreviewRootNodeId(state), getComponents(state));

export const getRuleNodesOfEditingColumn = (state) =>
  getRuleNodesOfEditingColumnResult(getEditingColumn(state));

export const getEditingColumnProps = (state) =>
  getEditingColumnPropsResult(getEditingColumn(state));

export const getEntityModelInUse = (state) =>
  getEntityModelInUseResult(
    getSelectedNodeEntityModelId(state),
    getEntityModelState(state),
  );

export const getEditingEntityModel = (state) =>
  getEditingEntityModelResult(
    getEditingEntityModelId(state),
    getEntityModelState(state),
  );
```

**问题**: 这些函数**没有被任何 reducer 使用**，只在 selectors 中被调用一次，然后 selectors 也是同样的逻辑！

## 优化方案 ⭐

### 核心原则

**保留**:

1. ✅ **基础访问器** - 被 `withSelectedNodeColumns` 等内部复用
2. ✅ **高阶工具** - `withSelectedNodeColumns`、`withSelectedNode` (Reducers 使用)
3. ✅ **简单访问器** - 被 selectors 直接使用（如 `getEditingColumn`）
4. ✅ **Result Functions** - 纯逻辑，被 selectors 复用

**删除**:

1. ❌ **中间桥接 getter** - 不被 reducers 使用，只在 selector 中调用一次

### 优化后的结构

```typescript
// ===== componentTreeGetters.ts =====

// 1️⃣ Type Guards
export function isComponentNodeWithColumns(...): ... {}

// 2️⃣ 基础访问器（内部复用）
export const getComponents = (state) => state.components;
export const getComponentsEntities = (state) => getComponents(state).entities;
export const getSelectedNodeId = (state) => state.selectedNodeId;
export const getSelectedNode = (state) => {
  const selectedId = getSelectedNodeId(state);
  return selectedId ? getComponentsEntities(state)[selectedId] : null;
};
export const getSelectedNodeWithColumns = (state) => {
  const node = getSelectedNode(state);
  return isComponentNodeWithColumns(node) ? node : null;
};

// 3️⃣ 简单访问器（被 selectors 使用）
export const getEditingColumn = (state) => state.editingColumn || null;
export const getEntityModelState = (state) => state.entityModel;
export const getIsEntityModelModalOpen = (state) => state.isEntityModelModalOpen;
export const getEditingEntityModelId = (state) => state.editingEntityModelId;
export const getPreviewRootNodeId = (state) => {
  const entities = getComponentsEntities(state);
  const rootId = state.rootIds.find((id) => entities[id]?.type === "Page");
  return rootId ?? null;
};

// 4️⃣ Result Functions（纯逻辑）
export const getColumnsOfSelectedNodeResult = (node) =>
  node ? (node.props?.columns ?? []) : [];

export const getTypeOfSelectedNodeResult = (node) =>
  node ? node.type : null;

export const getNodeForPreviewResult = (node) => {
  if (!node) return null;
  const props = { ...(node.props ?? {}) };
  const componentPrototype = getComponentPrototype(node.type);
  if (!componentPrototype) return { ...node, props };
  if ("columns" in (componentPrototype.propsTypes || {}) &&
    Array.isArray(props.columns)) {
    props.columns = props.columns.map(mapProCommonColumnToProps);
  }
  return { ...node, props };
};

export const getFirstParentPageNodeResult = (node, components) => {
  if (!node) return null;
  const entities = components.entities;
  let currentNode = node;
  while (currentNode.parentId) {
    const parentNode = entities[currentNode.parentId];
    if (!parentNode) break;
    if (parentNode.type === "Page") currentNode = parentNode;
    else currentNode = parentNode;
  }
  return currentNode.type === "Page" ? currentNode : null;
};

export const getSelectedNodeEntityModelIdResult = (node) =>
  node?.props?.entityModelId || null;

export const getPreviewRootNodeResult = (rootNodeId, components) =>
  rootNodeId ? components.entities[rootNodeId] ?? null : null;

export const getRuleNodesOfEditingColumnResult = (editingColumn) =>
  editingColumn?.ruleNodes || [];

export const getEditingColumnPropsResult = (editingColumn) => {
  if (!editingColumn) return {} as Omit<ProCommonColumn, "ruleNodes">;
  return mapProCommonColumnToProps(editingColumn);
};

export const getEntityModelInUseResult = (entityModelId, entityModelState) =>
  entityModelId ? entityModelState.entities[entityModelId] : null;

export const getEditingEntityModelResult = (editingEntityModelId, entityModelState) => {
  if (!editingEntityModelId) return null;
  return entityModelState.entities[editingEntityModelId] || null;
};

// 5️⃣ 高阶工具（Reducers 使用）
export const withSelectedNode = <T = void>(...) => { ... };
export const withSelectedNodeColumns = <T = void>(...) => { ... };


// ===== componentTreeSelectors.tsx =====

// 基础 selectors
export const selectComponentTreeState = (state: RootState) =>
  state.componentTree;

export const selectComponents = createSelector(
  selectComponentTreeState,
  getters.getComponents
);

export const selectSelectedNode = createSelector(
  selectComponentTreeState,
  getters.getSelectedNode
);

export const selectEditingColumn = createSelector(
  selectComponentTreeState,
  getters.getEditingColumn
);

export const selectEntityModelState = createSelector(
  selectComponentTreeState,
  getters.getEntityModelState
);

export const selectPreviewRootNodeId = createSelector(
  selectComponentTreeState,
  getters.getPreviewRootNodeId
);

// 派生 selectors - 直接组合基础 selector + result function
export const selectColumnsOfSelectedNode = createSelector(
  selectSelectedNode,
  getters.getColumnsOfSelectedNodeResult
);

export const selectTypeOfSelectedNode = createSelector(
  selectSelectedNode,
  getters.getTypeOfSelectedNodeResult
);

export const selectNodeForPreview = createSelector(
  selectSelectedNode,
  getters.getNodeForPreviewResult
);

export const selectFirstParentPageNode = createSelector(
  [selectSelectedNode, selectComponents],
  getters.getFirstParentPageNodeResult
);

export const selectSelectedNodeEntityModelId = createSelector(
  selectSelectedNode,
  getters.getSelectedNodeEntityModelIdResult
);

export const selectPreviewRootNode = createSelector(
  [selectPreviewRootNodeId, selectComponents],
  getters.getPreviewRootNodeResult
);

export const selectRuleNodesOfEditingColumn = createSelector(
  selectEditingColumn,
  getters.getRuleNodesOfEditingColumnResult
);

export const selectEditingColumnProps = createSelector(
  selectEditingColumn,
  getters.getEditingColumnPropsResult
);

export const selectEntityModelInUse = createSelector(
  [selectSelectedNodeEntityModelId, selectEntityModelState],
  getters.getEntityModelInUseResult
);

export const selectEditingEntityModel = createSelector(
  [selectEditingEntityModelId, selectEntityModelState],
  getters.getEditingEntityModelResult
);
```

### 删除的函数列表

从 `componentTreeGetters.ts` 中删除以下10个函数：

```typescript
// ❌ 删除 - 不被 reducers 使用，只是桥接
getColumnsOfSelectedNode;
getTypeOfSelectedNode;
getNodeForPreview;
getFirstParentPageNode;
getSelectedNodeEntityModelId;
getPreviewRootNode;
getRuleNodesOfEditingColumn;
getEditingColumnProps;
getEntityModelInUse;
getEditingEntityModel;
```

## 优化收益

### 代码减少量

- **删除 10 个中间桥接函数** (~100 行代码)
- **componentTreeGetters.ts**: 从 ~250 行 → ~150 行 (减少40%)
- **componentTreeSelectors.tsx**: 保持简洁，无额外增加

### 职责更清晰

**componentTreeGetters.ts** (给 Reducers):

```
✅ Type Guards
✅ 基础访问器 (内部复用)
✅ 简单访问器 (被 selectors 直接使用)
✅ Result Functions (纯逻辑)
✅ 高阶工具 (withSelectedNodeColumns 等)
```

**componentTreeSelectors.tsx** (给 React):

```
✅ 基础 selectors (访问 RootState)
✅ 派生 selectors (组合 + memoization)
```

### 维护优势

1. **减少同步修改点**: 删除中间层后，只需修改 Result Function 和 Selector
2. **更容易理解**:
   - Getters = Reducers 的工具箱
   - Selectors = React 的数据访问层
3. **性能无损**: Result Functions 仍然被复用，memoization 保持不变

### 对比图

**优化前**:

```
ComponentTreeState  →  getXXX (桥接)  →  selectXXX  →  React
       ↓
   Reducers (只用 withSelectedNodeColumns)
```

**优化后**:

```
ComponentTreeState  →  getXXXResult  →  selectXXX  →  React
       ↓
   Reducers (用 withSelectedNodeColumns + 基础访问器)
```

## 实施清单

- [ ] 从 componentTreeGetters.ts 删除 10 个中间桥接函数
- [ ] 验证没有其他文件导入这些被删除的函数
- [ ] 运行测试确保功能正常
- [ ] 更新 componentTreeGetters.ts 的注释和组织结构
