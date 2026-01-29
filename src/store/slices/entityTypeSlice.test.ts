import { describe, it, expect } from 'vitest';
import entityTypesReducer, { entityTypesActions, EntityTypeState } from './entityTypesSlice';

describe('entityTypesSlice', () => {
  it('upserts and deletes entity types', () => {
    let state = entityTypesReducer(undefined, { type: '' }) as EntityTypeState;

    state = entityTypesReducer(state, entityTypesActions.startCreateNew());
    expect(state.isDrawerOpen).toBe(true);
    expect(state.editingEntityType).toBeTruthy();
    state = entityTypesReducer(state, entityTypesActions.finishEntityTypeChange({ title: 'et1', name: 'ET', fields: [] } as any));
    expect(state.ids.length).toBe(1);
    const id = state.ids[0] as string;
    const entity = state.entities[id];
    expect(entity).toMatchObject({ title: 'et1', name: 'ET', fields: [] });

    state = entityTypesReducer(state, entityTypesActions.startEdit(id));
    state = entityTypesReducer(state, entityTypesActions.finishEntityTypeChange({ title: 'et2', primaryKey: 'pk2', name: 'ET2', fields: [] }));
    expect(state.entities[id]).toMatchObject({ title: 'et2', name: 'ET2', fields: [] });

    state = entityTypesReducer(state, entityTypesActions.deleteEntityType(id));
    expect(state.ids.length).toBe(0);
  });

  it('manages fields of editingEntityType', () => {
    let state = entityTypesReducer(undefined, { type: '' } as any) as any;

    state = entityTypesReducer(state, entityTypesActions.startCreateNew());
    state = entityTypesReducer(state, entityTypesActions.setFieldsOfEditingEntityType([{ id: 'f2' }] as any));
    expect((state as any).editingEntityType.fields[0].id).toBe('f2');

    state = entityTypesReducer(state, entityTypesActions.removeFieldsOfEditingEntityType('f2'));
    expect((state as any).editingEntityType.fields.length).toBe(0);
  });
});
