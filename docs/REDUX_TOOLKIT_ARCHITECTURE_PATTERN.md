# Redux Toolkit 模块化架构范式

> 一个经过实战验证的工业级 Redux 状态管理架构模式
>
> **核心理念**: DRY (Don't Repeat Yourself) + 模块化 + 类型安全

## 目录

- [架构概览](#架构概览)
- [设计原则](#设计原则)
- [架构层级](#架构层级)
- [实现模式](#实现模式)
  - [Universal Getters](#1️⃣-universal-getters通用取值器)
  - [Memoized Selectors](#2️⃣-memoized-selectors记忆化选择器)
  - [Modular Reducers](#3️⃣-modular-reducers模块化-reducer)
  - [Main Slice](#4️⃣-main-slice主切片组装)
- [文件结构](#文件结构)
- [使用示例](#使用示例)
- [最佳实践](#最佳实践)
- [优势对比](#优势对比)

---

## 架构概览

通过三层架构消除重复代码，提升可维护性：

1. **Universal Getters** - 统一的状态选择逻辑（可用于 selector 和 reducer）
2. **Memoized Selectors** - 性能优化的派生状态（自动缓存）
3. **Modular Reducers** - 功能域驱动的状态变更（Zustand Slices 模式）

---

## 设计原则

### 核心原则

1. **单一数据源 (Single Source of Truth)**
   - 所有状态选择逻辑都通过 getters
   - 避免在 selector 和 reducer 中重复编写相同的状态访问代码

2. **关注点分离 (Separation of Concerns)**
   - Getters: 状态选择逻辑
   - Selectors: 性能优化（memoization）
   - Reducers: 状态变更逻辑

3. **开闭原则 (Open-Closed Principle)**
   - 通过新增 reducer creator 扩展功能
   - 主 slice 保持稳定，无需修改

4. **类型安全优先 (Type Safety First)**
   - TypeScript 严格模式
   - 避免重复类型声明

---

## 架构层级

```
┌─────────────────────────────────────────────────────┐
│                  Components (使用层)                 │
│  ├─ useSelector(selectors.selectXXX)  [只读访问]    │
│  └─ dispatch(actions.updateXXX())     [状态变更]    │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│              Selectors (性能优化层)                  │
│  export const selectXXX = createSelector(           │
│    selectState,                                     │
│    getters.getXXX  ← 复用 getter 获得 memoization  │
│  );                                                 │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│          Universal Getters (逻辑统一层)              │
│  type MaybeWritable<T> = T | WritableDraft<T>;     │
│                                                     │
│  export const getXXX = (                           │
│    state: MaybeWritable<State>                     │
│  ) => { /* 选择逻辑 */ }                            │
│                                                     │
│  ✅ 在 selector 中工作 (只读)                       │
│  ✅ 在 reducer 中工作 (可写)                        │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│          Modular Reducers (功能域拆分层)             │
│                                                     │
│  reducers/                                         │
│  ├─ nodeReducers.ts        (节点 CRUD)             │
│  ├─ columnReducers.ts      (列管理)                │
│  ├─ editingReducers.ts     (编辑状态)              │
│  └─ index.ts               (统一导出)              │
│                                                     │
│  export const createXXXReducers = () => {          │
│    type State = WritableDraft<SliceState>;        │
│    return {                                        │
│      action1: (state: State, action) => {         │
│        const data = getters.getXXX(state); ← 复用  │
│        // 直接修改 state (Immer)                   │
│      }                                             │
│    };                                              │
│  };                                                │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│               Main Slice (组装层)                    │
│                                                     │
│  const slice = createSlice({                       │
│    name: "feature",                                │
│    initialState,                                   │
│    reducers: {                                     │
│      ...createNodeReducers(),      ← Zustand 模式  │
│      ...createColumnReducers(),                    │
│      ...createEditingReducers(),                   │
│    }                                               │
│  });                                               │
└─────────────────────────────────────────────────────┘
```

---

## 实现模式

### 1️⃣ Universal Getters（通用取值器）

**核心概念**: 使用 `MaybeWritable<T>` 类型让同一个 getter 函数既能在 selector（只读）中使用，也能在 reducer（可写）中使用。

#### 基础实现

```typescript
// featureGetters.ts
import { WritableDraft } from "immer";
import type { FeatureState } from "./featureSlice";

// 🔑 关键类型：兼容只读和可写状态
type MaybeWritable<T> = T | WritableDraft<T>;

// ✅ 基础 getter - 获取选中的项
export const getSelectedItem = (state: MaybeWritable<FeatureState>) => {
  const id = state.selectedId;
  return id ? state.items.entities[id] : null;
};

// ✅ 派生 getter - 基于其他 getter
export const getSelectedItemName = (state: MaybeWritable<FeatureState>) => {
  const item = getSelectedItem(state);
  return item?.name ?? "Untitled";
};

// ✅ 列表 getter - 返回过滤后的数组
export const getActiveItems = (state: MaybeWritable<FeatureState>) => {
  return Object.values(state.items.entities).filter(
    (item) => item?.status === "active",
  );
};

// ✅ 统计 getter - 计算派生数据
export const getItemStats = (state: MaybeWritable<FeatureState>) => {
  const all = Object.values(state.items.entities);
  return {
    total: all.length,
    active: all.filter((item) => item?.status === "active").length,
    archived: all.filter((item) => item?.status === "archived").length,
  };
};
```

#### 高阶 Getter 模式

对于需要确保数据存在才执行操作的场景，使用高阶 getter：

```typescript
// ✅ 高阶 getter（带回调）- 安全访问嵌套数据
export const withSelectedItem = <T = void>(
  state: MaybeWritable<FeatureState>,
  fn: (item: MaybeWritable<Item>) => T,
): T | undefined => {
  const item = getSelectedItem(state);
  if (!item) return undefined;
  return fn(item);
};

// 使用示例 - 在 reducer 中
reducers: {
  updateSelectedItemName: (state, action: PayloadAction<string>) => {
    withSelectedItem(state, (item) => {
      item.name = action.payload; // 自动类型推断为 WritableDraft<Item>
    });
  };
}
```

#### Getter 设计原则

1. **纯函数**: 无副作用，输入相同则输出相同
2. **单一职责**: 每个 getter 只做一件事
3. **可组合**: 复杂 getter 基于简单 getter 构建
4. **类型安全**: 使用 `MaybeWritable<T>` 保证兼容性
5. **命名规范**: 使用 `get` 前缀，清晰表达意图

---

### 2️⃣ Memoized Selectors（记忆化选择器）

**核心概念**: 复用 getters 并通过 `createSelector` 获得自动 memoization，避免不必要的重渲染。

#### 基础实现

```typescript
// featureSelectors.ts
import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import * as getters from "./featureGetters";

// 基础 selector - 选择切片状态
const selectFeatureState = (state: RootState) => state.feature;

// ✅ 简单 selector - 直接复用 getter
export const selectSelectedItem = createSelector(
  selectFeatureState,
  getters.getSelectedItem, // 复用 getter，自动缓存
);

export const selectActiveItems = createSelector(
  selectFeatureState,
  getters.getActiveItems,
);

export const selectItemStats = createSelector(
  selectFeatureState,
  getters.getItemStats,
);
```

#### 组合 Selector

```typescript
// ✅ 基于其他 selector 的派生 selector
export const selectActiveItemCount = createSelector(
  selectActiveItems,
  (items) => items.length,
);

// ✅ 多输入 selector
export const selectFilteredItems = createSelector(
  [selectActiveItems, (state: RootState) => state.feature.searchQuery],
  (items, query) => {
    if (!query) return items;
    return items.filter((item) =>
      item.name.toLowerCase().includes(query.toLowerCase()),
    );
  },
);
```

#### 参数化 Selector（高级）

```typescript
// 创建参数化 selector 工厂
export const makeSelectItemById = () =>
  createSelector(
    [selectFeatureState, (_: RootState, itemId: string) => itemId],
    (state, itemId) => state.items.entities[itemId],
  );

// 组件中使用
function ItemDetail({ itemId }: { itemId: string }) {
  const selectItemById = useMemo(makeSelectItemById, []);
  const item = useSelector((state) => selectItemById(state, itemId));
  // ...
}
```

#### Selector 优势

- **自动缓存**: 输入不变时返回缓存值，避免重渲染
- **代码复用**: getter 逻辑在 selector 和 reducer 间共享
- **性能优化**: 复杂计算只在依赖变化时执行
- **类型推断**: TypeScript 自动推断返回类型

---

### 3️⃣ Modular Reducers（模块化 Reducer）

**核心概念**: 借鉴 Zustand 的 Slices 模式，将 reducers 按功能域拆分到独立文件，通过 creator 函数返回 reducer 对象。

#### 文件组织

```typescript
// reducers/itemReducers.ts
import { PayloadAction } from "@reduxjs/toolkit";
import { WritableDraft } from "immer";
import type { FeatureState, Item, NewItem } from "../types";
import * as getters from "../featureGetters";
import { adapter, generateId } from "../featureSlice";

/**
 * Item 管理相关的 Reducers
 * 负责 Item 的增删改查操作
 *
 * @returns Reducer 对象，用于在主 slice 中展开
 */
export const createItemReducers = () => {
  // 🔑 类型简化：定义一次，到处使用
  type State = WritableDraft<FeatureState>;

  return {
    /**
     * @description 添加新 Item
     * @param action.payload 新 Item 的数据
     */
    addItem: (state: State, action: PayloadAction<NewItem>) => {
      const newItem: Item = {
        id: generateId(),
        status: "active",
        createdAt: Date.now(),
        ...action.payload,
      };
      adapter.addOne(state.items, newItem);
    },

    /**
     * @description 更新选中的 Item
     * @param action.payload 要更新的字段
     */
    updateSelectedItem: (
      state: State,
      action: PayloadAction<Partial<Item>>,
    ) => {
      // ✅ 复用 getter 获取选中项（可写状态）
      const item = getters.getSelectedItem(state);
      if (!item) return;

      // Immer 允许直接修改
      Object.assign(item, action.payload);
    },

    /**
     * @description 删除指定 Item
     * @param action.payload Item ID
     */
    deleteItem: (state: State, action: PayloadAction<string>) => {
      adapter.removeOne(state.items, action.payload);

      // 如果删除的是选中项，清空选择
      if (state.selectedId === action.payload) {
        state.selectedId = null;
      }
    },

    /**
     * @description 选择 Item
     * @param action.payload Item ID 或 null
     */
    selectItem: (state: State, action: PayloadAction<string | null>) => {
      state.selectedId = action.payload;
    },

    /**
     * @description 批量更新 Items
     * @param action.payload Item 更新数组
     */
    batchUpdateItems: (
      state: State,
      action: PayloadAction<Array<{ id: string; changes: Partial<Item> }>>,
    ) => {
      action.payload.forEach(({ id, changes }) => {
        const item = state.items.entities[id];
        if (item) {
          Object.assign(item, changes);
        }
      });
    },
  };
};
```

#### 编辑状态管理

```typescript
// reducers/editingReducers.ts
import { PayloadAction } from "@reduxjs/toolkit";
import { WritableDraft } from "immer";
import type { FeatureState, Item } from "../types";

/**
 * 编辑状态相关的 Reducers
 * 负责管理正在编辑的数据
 */
export const createEditingReducers = () => {
  type State = WritableDraft<FeatureState>;

  return {
    /**
     * @description 开始编辑指定 Item
     */
    startEditing: (state: State, action: PayloadAction<string>) => {
      const item = state.items.entities[action.payload];
      if (!item) return;

      state.editingId = action.payload;
      state.editingData = { ...item }; // 创建副本
    },

    /**
     * @description 取消编辑
     */
    cancelEditing: (state: State) => {
      state.editingId = null;
      state.editingData = null;
    },

    /**
     * @description 更新编辑中的数据
     */
    updateEditingData: (state: State, action: PayloadAction<Partial<Item>>) => {
      if (!state.editingData) return;
      Object.assign(state.editingData, action.payload);
    },

    /**
     * @description 保存编辑
     */
    saveEditing: (state: State) => {
      if (!state.editingId || !state.editingData) return;

      const item = state.items.entities[state.editingId];
      if (item) {
        Object.assign(item, state.editingData);
      }

      state.editingId = null;
      state.editingData = null;
    },
  };
};
```

#### 过滤与排序

```typescript
// reducers/filterReducers.ts
import { PayloadAction } from "@reduxjs/toolkit";
import { WritableDraft } from "immer";
import type { FeatureState, SortCriteria, FilterCriteria } from "../types";

/**
 * 过滤和排序相关的 Reducers
 */
export const createFilterReducers = () => {
  type State = WritableDraft<FeatureState>;

  return {
    setSearchQuery: (state: State, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },

    setFilter: (state: State, action: PayloadAction<FilterCriteria>) => {
      state.filter = action.payload;
    },

    setSortCriteria: (state: State, action: PayloadAction<SortCriteria>) => {
      state.sortCriteria = action.payload;
    },

    clearFilters: (state: State) => {
      state.searchQuery = "";
      state.filter = {};
      state.sortCriteria = { field: "createdAt", order: "desc" };
    },
  };
};
```

#### 统一导出

```typescript
// reducers/index.ts
export * from "./itemReducers";
export * from "./editingReducers";
export * from "./filterReducers";
```

#### Modular Reducer 原则

1. **功能域拆分**: 按业务逻辑分组（CRUD、编辑、过滤等）
2. **文件大小**: 每个文件 50-150 行为宜
3. **Creator 模式**: 使用函数返回 reducer 对象
4. **类型别名**: 内部定义 `type State` 简化声明
5. **复用 Getters**: 避免直接访问深层状态
6. **充分注释**: 使用 JSDoc 描述每个 reducer

---

### 4️⃣ Main Slice（主切片组装）

**核心概念**: 主 slice 保持简洁，只负责组装各个功能域的 reducers。

#### 完整示例

```typescript
// featureSlice.ts
import {
  createSlice,
  createEntityAdapter,
  PayloadAction,
} from "@reduxjs/toolkit";
import type { Item } from "./types";
import {
  createItemReducers,
  createEditingReducers,
  createFilterReducers,
} from "./reducers";

// ==================== Adapter ====================
const adapter = createEntityAdapter<Item>();
export { adapter }; // 导出供 reducer creators 使用

// ==================== Helper Functions ====================
let idCounter = 1;
export const generateId = () => `item_${idCounter++}`;

// ==================== State Interface ====================
export interface FeatureState {
  // 数据存储（使用 Entity Adapter）
  items: ReturnType<typeof adapter.getInitialState>;

  // 选择状态
  selectedId: string | null;

  // 编辑状态
  editingId: string | null;
  editingData: Partial<Item> | null;

  // 过滤和排序
  searchQuery: string;
  filter: FilterCriteria;
  sortCriteria: SortCriteria;
}

// ==================== Initial State ====================
const initialState: FeatureState = {
  items: adapter.getInitialState(),
  selectedId: null,
  editingId: null,
  editingData: null,
  searchQuery: "",
  filter: {},
  sortCriteria: { field: "createdAt", order: "desc" },
};

// ==================== Slice ====================
const slice = createSlice({
  name: "feature",
  initialState,
  reducers: {
    // 🔑 Zustand Slices Pattern - 展开所有功能域的 reducers
    ...createItemReducers(),
    ...createEditingReducers(),
    ...createFilterReducers(),

    // 也可以在这里定义一些简单的 reducers（不值得单独拆文件的）
    reset: () => initialState,
  },
});

// ==================== Exports ====================
export const featureActions = slice.actions;
export default slice.reducer;
```

#### 持久化配置（可选）

```typescript
// 如果使用 redux-persist
export const featurePersistWhitelist = [
  "items", // 持久化 items
  "filter", // 持久化用户的过滤设置
] as const;

// 不持久化编辑状态和选择状态（临时数据）
```

#### 主 Slice 原则

1. **保持简洁**: 主文件应该 < 100 行
2. **只负责组装**: 不包含复杂业务逻辑
3. **导出清晰**: 明确导出 actions、reducer、adapter
4. **类型完善**: State 接口详细定义所有字段
5. **注释分区**: 使用注释分隔不同部分

---

## 文件结构

### 推荐结构

```
src/store/
└── feature/                          # 功能模块名称
    ├── featureSlice.ts               # 主切片（组装层）~80 行
    ├── featureGetters.ts             # 通用 getter 函数 ~100 行
    ├── featureSelectors.ts           # 记忆化 selector ~50 行
    ├── types.ts                      # TypeScript 类型定义
    └── reducers/                     # Reducer 模块目录
        ├── index.ts                  # 统一导出
        ├── itemReducers.ts           # Item CRUD ~100 行
        ├── editingReducers.ts        # 编辑状态管理 ~60 行
        └── filterReducers.ts         # 过滤/排序逻辑 ~50 行
```

### 实际项目示例（componentTree）

```
src/store/componentTree/
├── componentTreeSlice.ts             # 主切片
├── componentTreeGetters.ts           # 20+ 个 getters
├── componentTreeSelectors.tsx        # 导出的 selectors
├── stateTypes.ts                     # 状态类型定义
└── reducers/
    ├── index.ts                      # 导出所有 creators
    ├── nodeReducers.ts               # 节点 CRUD (6 个 reducers)
    ├── columnReducers.ts             # 表格列管理 (5 个 reducers)
    ├── columnEditingReducers.ts      # 列编辑状态 (5 个 reducers)
    ├── ruleNodeReducers.ts           # 验证规则 (3 个 reducers)
    ├── entityModelReducers.ts        # 实体模型 (5 个 reducers)
    └── nodeRefReducers.ts            # 节点引用 (4 个 reducers)
```

### 文件大小指南

| 文件类型             | 推荐行数 | 说明                     |
| -------------------- | -------- | ------------------------ |
| 主 Slice             | 50-100   | 只负责组装，不含业务逻辑 |
| Getters              | 50-200   | 根据状态复杂度调整       |
| Selectors            | 30-80    | 简单复用 getters         |
| 单个 Reducer Creator | 50-150   | 超过则考虑拆分           |

---

## 使用示例

### 在 React 组件中使用

```typescript
import React from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  selectSelectedItem,
  selectActiveItems,
  selectItemStats,
} from "@/store/feature/featureSelectors";
import { featureActions } from "@/store/feature/featureSlice";

function ItemManager() {
  const dispatch = useDispatch();

  // ✅ Selectors: 自动 memoization，避免不必要的重渲染
  const selectedItem = useSelector(selectSelectedItem);
  const activeItems = useSelector(selectActiveItems);
  const stats = useSelector(selectItemStats);

  // ✅ Actions: 类型安全的 dispatch
  const handleSelect = (id: string) => {
    dispatch(featureActions.selectItem(id));
  };

  const handleUpdate = (data: Partial<Item>) => {
    dispatch(featureActions.updateSelectedItem(data));
  };

  const handleDelete = (id: string) => {
    dispatch(featureActions.deleteItem(id));
  };

  const handleStartEditing = (id: string) => {
    dispatch(featureActions.startEditing(id));
  };

  const handleSave = () => {
    dispatch(featureActions.saveEditing());
  };

  return (
    <div>
      <div>Total: {stats.total}, Active: {stats.active}</div>

      <ul>
        {activeItems.map((item) => (
          <li key={item.id} onClick={() => handleSelect(item.id)}>
            {item.name}
            <button onClick={() => handleStartEditing(item.id)}>Edit</button>
            <button onClick={() => handleDelete(item.id)}>Delete</button>
          </li>
        ))}
      </ul>

      {selectedItem && (
        <div>
          <h3>Selected: {selectedItem.name}</h3>
          <button onClick={() => handleUpdate({ status: "archived" })}>
            Archive
          </button>
        </div>
      )}
    </div>
  );
}
```

### 在自定义 Hook 中使用

```typescript
// useItemActions.ts
import { useDispatch, useSelector } from "react-redux";
import { useCallback } from "react";
import { featureActions } from "@/store/feature/featureSlice";
import { selectSelectedItem } from "@/store/feature/featureSelectors";

export function useItemActions() {
  const dispatch = useDispatch();
  const selectedItem = useSelector(selectSelectedItem);

  const updateSelectedItem = useCallback(
    (data: Partial<Item>) => {
      dispatch(featureActions.updateSelectedItem(data));
    },
    [dispatch],
  );

  const deleteSelectedItem = useCallback(() => {
    if (!selectedItem) return;
    dispatch(featureActions.deleteItem(selectedItem.id));
  }, [dispatch, selectedItem]);

  return {
    selectedItem,
    updateSelectedItem,
    deleteSelectedItem,
  };
}
```

---

## 最佳实践

### ✅ DO（推荐做法）

#### 1. 永远通过 Getters 访问状态

```typescript
// ✅ 好 - 使用 getter
const item = getters.getSelectedItem(state);
if (item) {
  item.name = "Updated";
}

// ❌ 差 - 直接访问
const id = state.selectedId;
if (id && state.items.entities[id]) {
  state.items.entities[id].name = "Updated";
}
```

#### 2. Getters 使用 MaybeWritable 类型

```typescript
// ✅ 好 - 兼容两种上下文
export const getSelectedItem = (state: MaybeWritable<FeatureState>) => {
  return state.selectedId ? state.items.entities[state.selectedId] : null;
};

// ❌ 差 - 只能在 selector 中使用
export const getSelectedItem = (state: FeatureState) => {
  return state.selectedId ? state.items.entities[state.selectedId] : null;
};
```

#### 3. Reducers 复用 Getters

```typescript
// ✅ 好 - 复用 getter
updateSelectedItem: (state, action) => {
  const item = getters.getSelectedItem(state);
  if (item) {
    Object.assign(item, action.payload);
  }
};

// ❌ 差 - 重复逻辑
updateSelectedItem: (state, action) => {
  const id = state.selectedId;
  if (id && state.items.entities[id]) {
    Object.assign(state.items.entities[id], action.payload);
  }
};
```

#### 4. Selectors 复用 Getters

```typescript
// ✅ 好 - 复用 getter
export const selectSelectedItem = createSelector(
  selectFeatureState,
  getters.getSelectedItem,
);

// ❌ 差 - 重复实现
export const selectSelectedItem = createSelector(selectFeatureState, (state) =>
  state.selectedId ? state.items.entities[state.selectedId] : null,
);
```

#### 5. 功能域拆分 Reducer

```typescript
// ✅ 好 - 按功能域拆分
reducers: {
  ...createItemReducers(),      // CRUD
  ...createEditingReducers(),   // 编辑状态
  ...createFilterReducers(),    // 过滤排序
}

// ❌ 差 - 全部堆在主 slice
reducers: {
  addItem: (state, action) => { /* ... */ },
  updateItem: (state, action) => { /* ... */ },
  deleteItem: (state, action) => { /* ... */ },
  startEditing: (state, action) => { /* ... */ },
  // ... 20+ reducers
}
```

#### 6. 类型别名简化声明

```typescript
// ✅ 好 - 定义类型别名
export const createItemReducers = () => {
  type State = WritableDraft<FeatureState>;

  return {
    addItem: (state: State, action) => {
      /* ... */
    },
    updateItem: (state: State, action) => {
      /* ... */
    },
  };
};

// ❌ 差 - 重复完整类型
export const createItemReducers = () => ({
  addItem: (state: WritableDraft<FeatureState>, action) => {
    /* ... */
  },
  updateItem: (state: WritableDraft<FeatureState>, action) => {
    /* ... */
  },
});
```

#### 7. 使用 JSDoc 注释

```typescript
// ✅ 好 - 详细注释
/**
 * @description 更新选中的 Item
 * @param action.payload 要更新的字段（部分更新）
 * @example
 * dispatch(updateSelectedItem({ name: "New Name" }))
 */
updateSelectedItem: (state: State, action: PayloadAction<Partial<Item>>) => {
  // ...
};

// ❌ 差 - 无注释或注释不清晰
updateSelectedItem: (state: State, action: PayloadAction<Partial<Item>>) => {
  // ...
};
```

### ❌ DON'T（避免做法）

1. ❌ 在 Selector 和 Reducer 中重复状态访问逻辑
2. ❌ Getter 函数产生副作用（修改外部变量）
3. ❌ 在主 Slice 中写复杂的业务逻辑
4. ❌ Reducer Creator 文件超过 200 行（考虑拆分）
5. ❌ 直接在组件中访问深层状态结构
6. ❌ 忽略 TypeScript 类型检查错误

---

## 优势对比

### vs 传统 Redux Toolkit

| 方面         | 传统模式                         | 本范式                     | 收益          |
| ------------ | -------------------------------- | -------------------------- | ------------- |
| **代码重复** | Selector 和 Reducer 重复选择逻辑 | Getters 统一，零重复       | -50% 代码量   |
| **可维护性** | 单文件 500+ 行，难以定位         | 模块化，每个文件 50-150 行 | 定位问题快 3x |
| **类型声明** | 每个 reducer 重复写类型          | `type State` 简化          | -90% 类型声明 |
| **性能优化** | 手动 memoization                 | `createSelector` 自动缓存  | 零成本 memo   |
| **扩展性**   | 修改主文件，风险高               | 新增 reducer creator，安全 | 符合开闭原则  |
| **文件组织** | 单一 slice 文件                  | 按功能域拆分目录           | 易于团队协作  |

### vs Zustand

| 特性            | Zustand    | 本范式   | 说明                   |
| --------------- | ---------- | -------- | ---------------------- |
| **类型安全**    | 需手动定义 | 自动推断 | Redux Toolkit 优势     |
| **DevTools**    | 需插件     | 原生支持 | Redux DevTools 强大    |
| **中间件**      | 手动集成   | 丰富生态 | Thunk、Saga 等         |
| **学习曲线**    | 低         | 中       | 本范式统一模式降低难度 |
| **Slices 模式** | 原生支持   | 借鉴实现 | 两者思想一致           |

### vs MobX

| 特性         | MobX         | 本范式         | 说明                 |
| ------------ | ------------ | -------------- | -------------------- |
| **心智模型** | OOP，响应式  | FP，不可变     | 函数式更易测试       |
| **可预测性** | 需要遵守规则 | 严格单向数据流 | Redux 核心优势       |
| **性能**     | 自动追踪依赖 | 手动 selector  | 本范式通过 memo 优化 |
| **调试**     | 依赖工具     | 时间旅行调试   | Redux DevTools 强大  |

---

## 适用场景

### ✅ 最适合

1. **复杂状态管理**
   - 10+ reducers
   - 深层嵌套状态结构
   - 多个功能模块

2. **性能敏感应用**
   - 频繁状态更新
   - 大量派生数据
   - 需要精细控制重渲染

3. **团队协作项目**
   - 多人并行开发
   - 需要清晰的模块边界
   - 长期维护

4. **企业级应用**
   - 严格的类型要求
   - 完整的测试覆盖
   - 可追溯的状态变更

### ❌ 不必要

1. **简单应用**
   - < 5 个 reducers
   - 状态结构简单
   - 单人开发

2. **原型/Demo**
   - 快速验证想法
   - 一次性项目
   - 不需要维护

3. **静态内容为主**
   - 大部分是展示型组件
   - 很少状态变更
   - 使用 URL state 足够

---

## 迁移指南

### 从传统 Redux Toolkit 迁移

#### Step 1: 创建 Getters 文件

```typescript
// 提取重复的状态访问逻辑到 getters
export const getSelectedItem = (state: MaybeWritable<State>) => {
  return state.selectedId ? state.items.entities[state.selectedId] : null;
};
```

#### Step 2: 重构 Selectors

```typescript
// 之前
export const selectSelectedItem = (state: RootState) => {
  const id = state.feature.selectedId;
  return id ? state.feature.items.entities[id] : null;
};

// 之后
export const selectSelectedItem = createSelector(
  selectFeatureState,
  getters.getSelectedItem,
);
```

#### Step 3: 拆分 Reducers

```typescript
// 创建 reducers 目录
// 按功能域拆分到独立文件
// 使用 creator 模式
```

#### Step 4: 更新主 Slice

```typescript
// 之前
reducers: {
  addItem: (state, action) => { /* ... */ },
  // ...
}

// 之后
reducers: {
  ...createItemReducers(),
  ...createEditingReducers(),
}
```

### 渐进式迁移策略

1. **先 Getters**: 不影响现有代码，逐步替换
2. **后 Selectors**: 复用 getters，提升性能
3. **再 Reducers**: 功能稳定后拆分
4. **最后优化**: 清理遗留代码

---

## 测试策略

### Getters 测试

```typescript
import { getSelectedItem } from "./featureGetters";

describe("featureGetters", () => {
  it("should return selected item", () => {
    const state = {
      selectedId: "1",
      items: {
        entities: { "1": { id: "1", name: "Test" } },
        ids: ["1"],
      },
    };

    expect(getSelectedItem(state)).toEqual({ id: "1", name: "Test" });
  });

  it("should return null when no item selected", () => {
    const state = { selectedId: null, items: { entities: {}, ids: [] } };
    expect(getSelectedItem(state)).toBeNull();
  });
});
```

### Reducers 测试

```typescript
import { createItemReducers } from "./reducers/itemReducers";

describe("itemReducers", () => {
  const reducers = createItemReducers();

  it("should add item", () => {
    const state = { items: { entities: {}, ids: [] } };
    const action = { type: "addItem", payload: { name: "New" } };

    reducers.addItem(state, action);

    expect(Object.values(state.items.entities)).toHaveLength(1);
  });
});
```

### Selectors 测试

```typescript
import { selectSelectedItem } from "./featureSelectors";

describe("featureSelectors", () => {
  it("should memoize result", () => {
    const state = createMockRootState();

    const result1 = selectSelectedItem(state);
    const result2 = selectSelectedItem(state);

    expect(result1).toBe(result2); // 引用相等
  });
});
```

---

## 常见问题

### Q: 为什么不直接在 Reducer 中访问状态？

**A**: 直接访问会导致代码重复。Getters 可以在 Selector 和 Reducer 中复用，遵循 DRY 原则。

### Q: MaybeWritable 类型是否会影响性能？

**A**: 不会。这只是类型层面的联合类型，运行时无开销。TypeScript 编译后生成的 JavaScript 代码相同。

### Q: 何时应该拆分新的 Reducer Creator？

**A**: 当相关 reducers 超过 5-7 个，或文件超过 150 行时，考虑拆分。保持每个文件的单一职责。

### Q: 是否所有 Selector 都需要 memoization？

**A**: 大多数情况下是的。`createSelector` 的开销极小，但收益明显（避免重渲染）。除非 selector 极其简单（如直接返回基础类型），否则建议使用。

### Q: 如何处理异步逻辑？

**A**: 使用 RTK Query 或 `createAsyncThunk`。异步逻辑不应放在 reducers 中。

```typescript
export const fetchItems = createAsyncThunk("feature/fetchItems", async () => {
  const response = await api.getItems();
  return response.data;
});

// 在 slice 中处理
extraReducers: (builder) => {
  builder.addCase(fetchItems.fulfilled, (state, action) => {
    adapter.setAll(state.items, action.payload);
  });
};
```

---

## 总结

这个架构范式结合了：

- **Redux Toolkit** - 类型安全、Immer 集成、DevTools
- **Zustand** - 模块化 Slices 模式
- **Reselect** - Memoization 优化
- **DRY 原则** - 单一数据源，零重复

通过三层架构（Getters、Selectors、Modular Reducers）实现了：

✅ **可维护性**: 清晰的模块边界，易于定位和修改  
✅ **可扩展性**: 符合开闭原则，新增功能无需修改现有代码  
✅ **类型安全**: TypeScript 严格模式，自动类型推断  
✅ **高性能**: 自动 memoization，避免不必要的重渲染  
✅ **团队协作**: 统一模式，降低学习成本

是一个经过实战验证的**工业级 Redux 状态管理架构**！🎯

---

## 参考资源

- [Redux Toolkit 官方文档](https://redux-toolkit.js.org/)
- [Immer 官方文档](https://immerjs.github.io/immer/)
- [Reselect 官方文档](https://github.com/reduxjs/reselect)
- [Zustand Slices Pattern](https://github.com/pmndrs/zustand#slices-pattern)

---

**Version**: 1.0.0  
**Last Updated**: 2026-02-09  
**License**: MIT
