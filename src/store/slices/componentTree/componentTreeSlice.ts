import {
  createSlice,
  createEntityAdapter,
  PayloadAction,
} from "@reduxjs/toolkit";
import type { NormalizedComponentNode } from "@/types/Component";
import type { ProCommonColumn } from "@/types";
import { ProCommonColumnSchema } from "@/types/tableColumsTypes";
import { ruleNodeContext } from "@/components/RuleBuilder/strategies";
import { RuleNode, RuleNodeParams, RuleTemplate } from "@/components/RuleBuilder/RuleParamsDateSchema";
import { makeIdCreator } from "../makeIdCreator";
import { original, WritableDraft } from "immer";

const adapter = createEntityAdapter<NormalizedComponentNode>({
  selectId: (n) => n.id,
});

const makeColumnId = makeIdCreator("column");

const initialState = adapter.getInitialState({
  rootIds: [] as string[],
  selectedNodeId: null as string | null,
  expandedKeys: [] as string[],
  editingColumn: null as Partial<ProCommonColumn> | null,
});

type ComponentTreeState = typeof initialState;

const upsertColumnOfSelectedNode = (
  state: WritableDraft<ComponentTreeState>,
  changes: ProCommonColumn,
) => {
  const selectedId = state.selectedNodeId;
  if (!selectedId) return;
  const node = state.entities[selectedId] as
    | NormalizedComponentNode<{ columns: ProCommonColumn[] }>
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
}

const slice = createSlice({
  name: "componentTree",
  initialState,
  reducers: {
    addNode: (
      state,
      action: PayloadAction<
        NormalizedComponentNode & { parentId?: string | null }
      >,
    ) => {
      const node = action.payload;
      adapter.addOne(state, node);
      if (node.parentId) {
        const parent = state.entities[node.parentId];
        if (parent) parent.childrenIds = parent.childrenIds || [];
        parent && parent.childrenIds.push(node.id);
      } else {
        state.rootIds.push(node.id);
      }
    },

    removeNode: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      const node = state.entities[id];
      if (!node) return;
      if (node.parentId) {
        const parent = state.entities[node.parentId];
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
        const n = state.entities[nodeId];
        if (n?.childrenIds) n.childrenIds.forEach(removeRecursively);
        adapter.removeOne(state, nodeId);
      };
      removeRecursively(id);
    },

    updateNode: (
      state,
      action: PayloadAction<{
        id: string;
        updates: Partial<NormalizedComponentNode>;
      }>,
    ) => {
      const { id, updates } = action.payload;
      adapter.updateOne(state, { id, changes: updates });
    },

    selectNode: (state, action: PayloadAction<string | null>) => {
      state.selectedNodeId = action.payload;
    },

    setExpandedKeys: (state, action: PayloadAction<string[]>) => {
      state.expandedKeys = action.payload;
    },

    expandNode: (state, action: PayloadAction<string>) => {
      const nodeId = action.payload;
      if (!state.expandedKeys.includes(nodeId)) {
        state.expandedKeys.push(nodeId);
      }
    },

    applyChangesToColumnOfSelectedNode: (
      state,
      action: PayloadAction<Partial<ProCommonColumn>>,) => {
      const editingColumn = state.editingColumn;
      if (!editingColumn) return;
      const { key = makeColumnId() } = editingColumn;
      const nextColumn = ProCommonColumnSchema.parse({ ...action.payload, ...editingColumn, key });
      upsertColumnOfSelectedNode(state, nextColumn);
    },

    upsertColumnOfSelectedNode: (
      state,
      action: PayloadAction<ProCommonColumn>,
    ) => {
      upsertColumnOfSelectedNode(state, action.payload);
    },

    deleteColumnForSelectedNode: (state, action: PayloadAction<string>) => {
      const { payload: targetKey } = action;
      const selectedId = state.selectedNodeId;
      if (!selectedId) return;
      const node = state.entities[selectedId] as
        | NormalizedComponentNode<{ columns: ProCommonColumn[] }>
        | undefined;
      if (!node) return;
      const targetColumnIdx = (node.props?.columns ?? []).findIndex(
        (c) => c.key === targetKey,
      );
      if (targetColumnIdx < 0) return;
      node.props.columns.splice(targetColumnIdx, 1);
    },

    moveColumnForSelectedNode: (
      state,
      action: PayloadAction<{ from: number; to: number }>,
    ) => {
      const { from, to } = action.payload;
      const selectedId = state.selectedNodeId;
      if (!selectedId) return;
      const node = state.entities[selectedId] as
        | NormalizedComponentNode<{ columns: ProCommonColumn[] }>
        | undefined;
      if (!node) return;
      const columns: ProCommonColumn[] = node.props?.columns || [];
      if (from < 0 || from >= columns.length || to < 0 || to >= columns.length)
        return;
      const [moved] = columns.splice(from, 1);
      columns.splice(to, 0, moved);
      node.props = { ...node.props, columns };
    },

    setEditingColumn: (
      state,
      action: PayloadAction<ProCommonColumn | null | {}>,
    ) => {
      state.editingColumn = action.payload;
    },

    updateEditingColumn(state, action: PayloadAction<Partial<ProCommonColumn>>) {
      if (!state.editingColumn) return;
      Object.assign(state.editingColumn, action.payload);
    },

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

    updateRuleNodeParamsOfEditingColumn(
      state,
      action: PayloadAction<{ id: string; params: RuleNodeParams }>,
    ) {
      if (!state.editingColumn?.ruleNodes) return;
      const { id, params } = action.payload;
      const targetNode = state.editingColumn?.ruleNodes.find((n) => n.id === id);
      if (!targetNode) return;
      Object.assign(targetNode.params, {}, params);
      targetNode.message =
        targetNode.message ||
        ruleNodeContext
          .getStrategyForNodeOrThrow(targetNode)
          .buildDefaultMessage(targetNode);
    },

    deleteRuleNodeOfEditingColumn(state, action: PayloadAction<string>) {
      if (!state.editingColumn?.ruleNodes) return;
      state.editingColumn.ruleNodes = state.editingColumn.ruleNodes.filter((n) => n.id !== action.payload);
    }
  }
});

export const componentTreeActions = slice.actions;
export default slice.reducer;
export const componentTreeAdapter = adapter;

export const makeRuleId = makeIdCreator("rule");

