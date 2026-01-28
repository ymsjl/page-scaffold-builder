import type { StateCreator } from 'zustand';
import type { Mutators } from '../sliceTypes';
import type { EntityTypeSlice, BuilderState } from '../BuilderState';
import { makeId } from '../sliceHelpers';

export const createEntityTypeSlice: StateCreator<BuilderState, Mutators, [], EntityTypeSlice> = (set, get) => ({
  entityType: {
    byId: {},
    allIds: [],
  },

  editingEntityType: null,

  setEditingEntityType: (entityType: any) => set({ editingEntityType: entityType }),

  setFieldsOfEditingEntityType: (fields: any) => {
    set((draft: any) => {
      if (!draft.editingEntityType) return;
      draft.editingEntityType.fields = Array.isArray(fields) ? ([...fields] as any) : (fields as any);
    });
  },

  removeFieldsOfEditingEntityType: (id: string) => {
    set((draft: any) => {
      if (!draft.editingEntityType || !draft.editingEntityType.fields) return;
      const index = draft.editingEntityType.fields.findIndex((f: any) => f.id === id);
      if (index === -1) return;
      draft.editingEntityType.fields.splice(index, 1);
    });
  },

  upsertEntityType: (entityType: any) => {
    set((draft: any) => {
      const editingEntityType = get().editingEntityType;
      if (editingEntityType?.id) {
        Object.assign(draft.entityType.byId[editingEntityType.id], editingEntityType, entityType);
      } else {
        const newId = makeId('entityType');
        draft.entityType.byId[newId] = { ...entityType, ...editingEntityType, id: newId };
        draft.entityType.allIds.push(newId);
      }
    });
  },

  deleteEntityType: (id: string) => {
    set((draft: any) => {
      delete draft.entityType.byId[id];
      const index = draft.entityType.allIds.indexOf(id);
      if (index === -1) return;
      draft.entityType.allIds.splice(index, 1);
    });
  },
});
