import type { StateCreator } from 'zustand';
import type { Mutators } from '../sliceTypes';
import type { SelectedNodeSlice, BuilderState } from '../BuilderState';
import { makeId } from '../sliceHelpers';
import type { ProCommonColumn } from '@/types/tableColumsTypes';

export const createSelectedNodeSlice: StateCreator<BuilderState, Mutators, [], SelectedNodeSlice> = (set, get) => ({
  selectedNode: {},

  updateProps: (values: Record<string, any>) => {
    const selectedId = (get() as BuilderState).componentTree.selectedNodeId;
    if (!selectedId) return;
    set((draft: any) => {
      const node = draft.componentTree.nodesById[selectedId];
      if (!node) return;
      node.props = { ...node.props, ...values };
    });
  },

  startAddColumn: () => {
    set({ schemaEditorVisible: true, editingColumn: null });
  },

  startEditColumn: (column: ProCommonColumn) => {
    set({ schemaEditorVisible: true, editingColumn: column });
  },

  upsertColumn: (column: ProCommonColumn) => {
    const selectedId = (get() as BuilderState).componentTree.selectedNodeId;
    if (!selectedId) return;
    set((draft: any) => {
      const node = draft.componentTree.nodesById[selectedId];
      if (!node) return;
      const existingColumns: ProCommonColumn[] = (node.props && node.props.columns) || [];
      if (!existingColumns || !Array.isArray(existingColumns)) {
        node.props = { ...(node.props || {}), columns: [column] };
        return;
      }
      if (!column.key) {
        column.key = makeId('column');
        node.props.columns = [...existingColumns, column];
        return;
      }
      const idx = node.props.columns.findIndex((c: any) => c.key === column.key);
      if (idx === -1) {
        throw new Error(`Column with key ${column.key} not found for upsert`);
      }
      node.props.columns[idx] = { ...node.props.columns[idx], ...column };
    });
  },

  moveColumn: (from: number, to: number) => {
    const selectedId = (get() as BuilderState).componentTree.selectedNodeId;
    if (selectedId == null) return;
    set((draft: any) => {
      const node = draft.componentTree.nodesById[selectedId];
      if (!node) return;
      const cols = node.props.columns || [];
      if (!Array.isArray(cols)) return;
      if (from < 0 || from >= cols.length || to < 0 || to >= cols.length) return;
      const [item] = cols.splice(from, 1);
      cols.splice(to, 0, item);
      node.props.columns = cols;
    });
  },

  deleteColumn: (key: string) => {
    const selectedId = (get() as BuilderState).componentTree.selectedNodeId;
    if (!selectedId) return;
    set((draft: any) => {
      const node = draft.componentTree.nodesById[selectedId];
      if (!node) return;
      node.props.columns = (node.props.columns || []).filter((c: any) => c.key !== key);
    });
  },

  applyColumnChanges: (column: ProCommonColumn) => {
    const selectedId = (get() as BuilderState).componentTree.selectedNodeId;
    if (!selectedId) return;
    set((draft: any) => {
      const node = draft.componentTree.nodesById[selectedId];
      if (!node) return;
      const existingColumns: ProCommonColumn[] = node?.props?.columns;
      if (!existingColumns || !Array.isArray(existingColumns)) {
        node.props.columns = [column];
      } else {
        const idx = existingColumns.findIndex((c: any) => c.key === column.key);
        if (idx === -1) {
          throw new Error(`Column with key ${column.key} not found for apply changes`);
        }
        Object.assign(node.props.columns[idx], column);
      }
    });
  },
});
