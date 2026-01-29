import { createSlice, createEntityAdapter, PayloadAction } from '@reduxjs/toolkit';
import type { NormalizedComponentNode } from '@/types/Component';
import type { ProCommonColumn } from '@/types';
import { schemaEditorActions } from './schemaEditorSlice';
import { ProCommonColumnSchema } from '@/types/tableColumsTypes';
import { makeIdCreator } from './makeIdCreator';

const adapter = createEntityAdapter<NormalizedComponentNode>({ selectId: (n) => n.id });

const slice = createSlice({
  name: 'componentTree',
  initialState: adapter.getInitialState({
    rootIds: [] as string[],
    selectedNodeId: null as string | null,
  }),
  reducers: {
    addNode: (state, action: PayloadAction<NormalizedComponentNode & { parentId?: string | null }>) => {
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
        };
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

    updateNode: (state, action: PayloadAction<{ id: string; updates: Partial<NormalizedComponentNode> }>) => {
      const { id, updates } = action.payload;
      adapter.updateOne(state, { id, changes: updates });
    },

    selectNode: (state, action: PayloadAction<string | null>) => {
      state.selectedNodeId = action.payload;
    },

    upsertColumnForSelectedNode: (state, action: PayloadAction<ProCommonColumn>) => {
      const selectedId = state.selectedNodeId;
      if (!selectedId) return;
      const node = adapter.getSelectors().selectById(state, selectedId) as NormalizedComponentNode<{ columns: ProCommonColumn[] }>;
      if (!node) return;
      const columns: ProCommonColumn[] = node.props?.columns ? [...node.props.columns] : [];
      const idx = columns.findIndex((c) => c.key === (action.payload).key);
      if (idx >= 0) columns[idx] = action.payload;
      else columns.push(action.payload);
      node.props = { ...node.props, columns };
    },

    deleteColumnForSelectedNode: (state, action: PayloadAction<string>) => {
      const { payload: targetKey } = action
      const selectedId = state.selectedNodeId;
      if (!selectedId) return;
      const node = state.entities[selectedId] as NormalizedComponentNode<{ columns: ProCommonColumn[] }> | undefined;
      if (!node) return;
      const targetColumnIdx = (node.props?.columns ?? []).findIndex((c) => c.key === targetKey);
      if (targetColumnIdx < 0) return;
      node.props.columns.splice(targetColumnIdx, 1);
    },

    moveColumnForSelectedNode: (state, action: PayloadAction<{ from: number; to: number }>) => {
      const { from, to } = action.payload;
      const selectedId = state.selectedNodeId;
      if (!selectedId) return;
      const node = adapter.getSelectors().selectById(state, selectedId) as NormalizedComponentNode<{ columns: ProCommonColumn[] }>;
      if (!node) return;
      const columns: ProCommonColumn[] = node.props?.columns;
      if (from < 0 || from >= columns.length || to < 0 || to >= columns.length) return;
      const [moved] = columns.splice(from, 1);
      columns.splice(to, 0, moved);
      node.props = { ...node.props, columns };
    },
  },
  extraReducers: (builder) => {
    builder.addCase(schemaEditorActions.finishSchemaChanges, (state, action) => {
      const { payload: changes } = action;
      if (!changes) return;

      const selectedId = state.selectedNodeId;
      if (!selectedId) return;
      const node = state.entities[selectedId] as NormalizedComponentNode<{ columns: ProCommonColumn[] }> | undefined;
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
    });
  }
});

export const componentTreeActions = slice.actions;
export default slice.reducer;
export const componentTreeAdapter = adapter;
