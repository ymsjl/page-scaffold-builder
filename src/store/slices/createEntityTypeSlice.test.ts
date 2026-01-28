import { describe, it, expect } from 'vitest';
import { createStore } from 'zustand/vanilla';
import { createEntityTypeSlice } from './createEntityTypeSlice';

describe('createEntityTypeSlice', () => {
  it('upserts and deletes entity types', () => {
    const store = createStore((set, get) => ({ ...createEntityTypeSlice(set, get) }));
    const s = store.getState();

    s.setEditingEntityType({ name: 'ET', fields: [] } as any);
    s.upsertEntityType({} as any);
    expect(s.entityType.allIds.length).toBe(1);
    const id = s.entityType.allIds[0];

    s.setEditingEntityType({ id, name: 'ET2' } as any);
    s.upsertEntityType({} as any);
    expect(s.entityType.byId[id].name).toBe('ET2');

    s.deleteEntityType(id);
    expect(s.entityType.allIds.length).toBe(0);
  });

  it('manages fields of editingEntityType', () => {
    const store = createStore((set, get) => ({ ...createEntityTypeSlice(set, get) }));
    const s = store.getState();

    s.setEditingEntityType({ fields: [{ id: 'f1' }] } as any);
    s.setFieldsOfEditingEntityType([{ id: 'f2' }]);
    expect(s.editingEntityType!.fields[0].id).toBe('f2');

    s.removeFieldsOfEditingEntityType('f2');
    expect(s.editingEntityType!.fields.length).toBe(0);
  });
});
