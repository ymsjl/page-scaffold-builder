import type { StateCreator } from 'zustand';
import type { Mutators } from '../sliceTypes';
import type { UISlice, BuilderState } from '../BuilderState';

export const createUISlice: StateCreator<BuilderState, Mutators, [], UISlice> = (set, get) => ({
  showAddDropdownNodeId: null,
  showAddDropdown: (id: string | null) => set({ showAddDropdownNodeId: id }),

  entityTypeDesignerPanelOpen: false,
  setEntityTypeDesignerPanelOpen: (v: boolean) => set({ entityTypeDesignerPanelOpen: v }),

  schemaEditorVisible: false,
  closeSchemaEditor: () => set({ schemaEditorVisible: false }),

  editingColumn: null,
  setEditingColumn: (_column: any) => set({ editingColumn: _column }),
});
