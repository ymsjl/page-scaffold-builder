import { createSlice, createEntityAdapter, PayloadAction } from "@reduxjs/toolkit";
import { WritableDraft } from "immer";
import type { ComponentNodeWithColumns, ComponentNode } from "@/types/Component";
import type { EntityModel, ProCommonColumn } from "@/types";
import { ProCommonColumnSchema } from "@/types/tableColumsTypes";
import { ruleNodeContext } from "@/components/RuleBuilder/strategies";
import { RuleNode, RuleNodeParams, RuleTemplate, } from "@/components/RuleBuilder/RuleParamsDateSchema";
import { createProCommonColumnFromSchemeField } from "@/components/SchemaBuilderModal/useAutoFillByDataIndex";
import { makeIdCreator } from "@/utils/makeIdCreator";

const adapter = createEntityAdapter<ComponentNode>();

export const entityModelAdapter = createEntityAdapter<EntityModel>();

export const makeColumnId = makeIdCreator("column");
export const makeNodeId = makeIdCreator("node");
export const makeRuleId = makeIdCreator("rule");
export const makeEntityModelId = makeIdCreator("et");

const initialState = {
  rootIds: [] as string[],
  selectedNodeId: null as string | null,
  expandedKeys: [] as string[],
  editingColumn: null as Partial<ProCommonColumn> | null,
  components: adapter.getInitialState(),
  isSchemaBuilderModalOpen: false,

  entityModel: entityModelAdapter.getInitialState({}),
  isEntityModelModalOpen: false,
  editingEntityModelId: null as string | null,
};

export const componentTreePersistWhitelist = ["entityModel"] as const;

type ComponentTreeState = typeof initialState;

const upsertColumnOfSelectedNode = (
  state: WritableDraft<ComponentTreeState>,
  changes: ProCommonColumn,
) => {
  const selectedId = state.selectedNodeId;
  if (!selectedId) return;
  const node = state.components.entities[selectedId] as
    | ComponentNodeWithColumns
    | undefined;
  if (!node) return;
  const columns = node.props?.columns;
  if (!columns) {
    const validatedChanges = ProCommonColumnSchema.parse(changes);
    node.props.columns = [validatedChanges];
  } else if (Array.isArray(columns)) {
    const idx = columns.findIndex((c) => c.key === changes.key);
    if (idx >= 0) {
      Object.assign(columns[idx], changes);
    } else {
      const validatedChanges = ProCommonColumnSchema.parse(changes);
      columns.push(validatedChanges);
    }
  }
};

const slice = createSlice({
  name: "componentTree",
  initialState,
  reducers: {
    /**
     * @description 添加组件节点
     * @param action.payload.id 组件节点ID
     * @param action.payload.parentId 父组件节点ID
     * @param action.payload.name 组件节点名称
     */
    addNode: (
      state,
      action: PayloadAction<Pick<ComponentNode, "parentId" | "type">>,
    ) => {
      const { parentId, type } = action.payload;
      const node: ComponentNode = {
        id: makeNodeId(),
        parentId,
        type,
        name: `New ${type}`,
        isContainer: type === "Container",
        props: {},
        childrenIds: [],
      };
      adapter.addOne(state.components, node);

      if (!parentId) {
        state.rootIds.push(node.id);
        return;
      }

      const readonlyParentNode = adapter
        .getSelectors()
        .selectById(state.components, parentId);

      const childrenIds = readonlyParentNode?.childrenIds.slice() || [];
      if (!childrenIds.includes(node.id)) {
        childrenIds.push(node.id);
      }
      adapter.updateOne(state.components, {
        id: parentId,
        changes: { childrenIds },
      });
    },

    /**
     * @description 移除组件节点及其子节点
     * @param action.payload 组件节点ID
     * @returns
     */
    removeNode: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      const node = state.components.entities[id];
      if (!node) return;
      if (node.parentId) {
        const parent = state.components.entities[node.parentId];
        if (parent) {
          const idx = parent.childrenIds.indexOf(id);
          if (idx >= 0) {
            parent.childrenIds.splice(idx, 1);
          }
        }
      } else {
        const idx = state.rootIds.indexOf(id);
        if (idx >= 0) {
          state.rootIds.splice(idx, 1);
        }
      }
      const removeRecursively = (nodeId: string) => {
        const n = state.components.entities[nodeId];
        if (n?.childrenIds) n.childrenIds.forEach(removeRecursively);
        adapter.removeOne(state.components, nodeId);
      };
      removeRecursively(id);
    },

    /**
     *
     * @param action.payload.id 组件节点ID
     * @param action.payload.updates 组件节点更新内容
     */
    updateNode: (
      state,
      action: PayloadAction<{ id: string; updates: Partial<ComponentNode> }>,
    ) => {
      const { id, updates } = action.payload;
      adapter.updateOne(state.components, { id, changes: updates });
    },

    /**
     * @description 选择组件节点
     * @param action.payload 组件节点ID
     */
    selectNode: (state, action: PayloadAction<string | null>) => {
      state.selectedNodeId = action.payload;
    },

    /**
     * @description 设置展开的节点ID列表
     * @param action.payload 展开的节点ID列表
     */
    setExpandedKeys: (state, action: PayloadAction<string[]>) => {
      state.expandedKeys = action.payload;
    },

    /**
     *
     * @param action.payload 节点ID
     */
    expandNode: (state, action: PayloadAction<string>) => {
      const nodeId = action.payload;
      if (!state.expandedKeys.includes(nodeId)) {
        state.expandedKeys.push(nodeId);
      }
    },


    /**
     * @description 从当前节点相关的实体模型字段中生成列配置
     * (会覆盖当前已有的列配置)
     */
    addColumnsFromEntityModelToSelectedNode: (state) => {
      const selectedId = state.selectedNodeId;
      if (!selectedId) return;
      const node = state.components.entities[selectedId] as
        | ComponentNodeWithColumns
        | undefined;
      if (!node) return;
      const entityModelId = node.props?.entityModelId;
      if (!entityModelId) return;
      const entityModel = state.entityModel.entities[entityModelId];
      if (!entityModel || !Array.isArray(entityModel.fields)) return;
      const currentColumns = node.props.columns;
      const existingKeys = new Set(currentColumns?.map(c => c.key) ?? [])
      const newColumns = entityModel.fields
        .filter(field => !existingKeys.has(field.key))
        .map((field) => ({
          key: makeColumnId(),
          ...createProCommonColumnFromSchemeField(field),
        }));
      node.props.columns = [...(currentColumns || []), ...newColumns];
    },

    /**
     * @description 将编辑中的列属性应用到选中节点的列配置中
     * @param action.payload 列属性更新内容
     */
    applyChangesToColumnOfSelectedNode: (
      state,
      action: PayloadAction<Partial<ProCommonColumn>>,
    ) => {
      const editingColumn = state.editingColumn;
      if (!editingColumn) return;
      const { key = makeColumnId() } = editingColumn;
      const nextColumn = ProCommonColumnSchema.parse({
        ...action.payload,
        ...editingColumn,
        key,
      });
      upsertColumnOfSelectedNode(state, nextColumn);
    },

    /**
     * @description 直接插入或更新选中节点的列配置
     * @param action.payload 列属性完整内容
     */
    upsertColumnOfSelectedNode: (
      state,
      action: PayloadAction<ProCommonColumn>,
    ) => {
      upsertColumnOfSelectedNode(state, action.payload);
    },

    /**
     * @description 删除选中节点的指定列配置
     * @param action.payload 列配置的键值
     */
    deleteColumnForSelectedNode: (state, action: PayloadAction<string>) => {
      const { payload: targetKey } = action;
      const selectedId = state.selectedNodeId;
      if (!selectedId) return;
      const node = adapter
        .getSelectors()
        .selectById(state.components, selectedId) as
        | ComponentNodeWithColumns
        | undefined;
      if (!node) return;
      const targetColumnIdx = (node.props?.columns ?? []).findIndex(
        (c) => c.key === targetKey,
      );
      if (targetColumnIdx < 0) return;
      const columns = (node.props?.columns ?? []).slice();
      columns.splice(targetColumnIdx, 1);
      adapter.updateOne(state.components, {
        id: selectedId,
        changes: {
          props: { ...node.props, columns },
        },
      });
    },

    /**
     * @description 移动选中节点的列配置顺序
     * @param action.payload.from 源索引
     * @param action.payload.to 目标索引
     */
    moveColumnForSelectedNode: (
      state,
      action: PayloadAction<{ from: number; to: number }>,
    ) => {
      const { from, to } = action.payload;
      const selectedId = state.selectedNodeId;
      if (!selectedId) return;
      const node = state.components.entities[selectedId] as
        | ComponentNodeWithColumns
        | undefined;
      if (!node) return;
      const columns = node.props?.columns;
      if (!columns || !Array.isArray(columns)) return;
      if (from < 0 || from >= columns.length || to < 0 || to >= columns.length)
        return;

      // 创建新数组并执行移动操作
      const newColumns = [...columns];
      const [movedItem] = newColumns.splice(from, 1);
      newColumns.splice(to, 0, movedItem);

      // 使用 adapter.updateOne 更新 props.columns，保持与其他 reducer 一致
      adapter.updateOne(state.components, {
        id: selectedId,
        changes: {
          props: {
            ...node.props,
            columns: newColumns,
          },
        },
      });
    },

    /**
     * @description 设置正在编辑的列属性
     * @param action.payload 正在编辑的列属性，或null，或空对象
     */
    setEditingColumn: (
      state,
      action: PayloadAction<ProCommonColumn | null | {}>,
    ) => {
      state.editingColumn = action.payload;
    },

    /**
     * @description 更新正在编辑的列属性部分内容
     * @param action.payload 列属性更新内容
     */
    updateEditingColumn(
      state,
      action: PayloadAction<Partial<ProCommonColumn>>,
    ) {
      if (!state.editingColumn) return;
      Object.assign(state.editingColumn, action.payload);
    },

    /**
     * @description 向正在编辑的列属性中添加规则节点
     * @param action.payload 规则节点模板
     */
    addRuleNodeToEditingColumn(state, action: PayloadAction<RuleTemplate>) {
      if (!state.editingColumn) return;
      const { type, defaultParams, name } = action.payload;
      const newRuleNode = {
        id: makeRuleId(),
        name,
        enabled: true,
        type,
        params: defaultParams || {},
      } as RuleNode;
      newRuleNode.message = ruleNodeContext
        .getStrategyForNodeOrThrow({ ...newRuleNode })
        .buildDefaultMessage({ ...newRuleNode });
      if (!state.editingColumn?.ruleNodes) {
        state.editingColumn.ruleNodes = [newRuleNode];
      } else if (Array.isArray(state.editingColumn.ruleNodes)) {
        state.editingColumn?.ruleNodes?.push(newRuleNode);
      }
    },

    /**
     * @description 更新正在编辑的列属性中的规则节点参数
     * @param action.payload.id 规则节点ID
     * @param action.payload.params 规则节点参数更新内容
     */
    updateRuleNodeParamsOfEditingColumn(
      state,
      action: PayloadAction<{ id: string; params: RuleNodeParams }>,
    ) {
      if (!state.editingColumn?.ruleNodes) return;
      const { id, params } = action.payload;
      const targetNode = state.editingColumn?.ruleNodes.find(
        (n) => n.id === id,
      );
      if (!targetNode) return;
      Object.assign(targetNode.params, params);
      targetNode.message =
        targetNode.message ||
        ruleNodeContext
          .getStrategyForNodeOrThrow(targetNode)
          .buildDefaultMessage(targetNode);
    },

    /**
     * @description 删除正在编辑的列属性中的规则节点
     * @param action.payload 规则节点ID
     */
    deleteRuleNodeOfEditingColumn(state, action: PayloadAction<string>) {
      if (!state.editingColumn?.ruleNodes) return;
      state.editingColumn.ruleNodes = state.editingColumn.ruleNodes.filter(
        (n) => n.id !== action.payload,
      );
    },

    setIsSchemaBuilderModalOpen(state, action: PayloadAction<boolean>) {
      state.isSchemaBuilderModalOpen = action.payload;
    },

    startAddingColumn(state) {
      state.isSchemaBuilderModalOpen = true;
      state.editingColumn = {};
    },

    startEditingColumn(state, action: PayloadAction<ProCommonColumn>) {
      state.isSchemaBuilderModalOpen = true;
      state.editingColumn = { ...action.payload };
    },

    closeEntityModelModal(state) {
      state.isEntityModelModalOpen = false;
    },
    startCreateEntityModel(state) {
      state.isEntityModelModalOpen = true;
      state.editingEntityModelId = null;
    },
    startEditEntityModel(state, action: PayloadAction<string>) {
      state.isEntityModelModalOpen = true;
      state.editingEntityModelId = action.payload;
    },
    applyEntityModelChange: (
      state,
      action: PayloadAction<Omit<EntityModel, "id">>,
    ) => {
      entityModelAdapter.upsertOne(state.entityModel, {
        ...action.payload,
        id: state.editingEntityModelId ?? makeEntityModelId(),
      });
      state.isEntityModelModalOpen = false;
      state.editingEntityModelId = null;
    },
    deleteEntityModel: (state, action: PayloadAction<string>) => {
      entityModelAdapter.removeOne(state.entityModel, action.payload);
    },
  },
});

export const componentTreeActions = slice.actions;
export default slice.reducer;
export const componentTreeAdapter = adapter;
