import { describe, it, expect } from 'vitest';
import entityModelReducer, { entityModelActions, EntityModelState } from './entityModelSlice';

describe('entityModelSlice', () => {
  it('upserts and deletes entity models', () => {
    let state = entityModelReducer(undefined, { type: '' }) as EntityModelState;

    state = entityModelReducer(state, entityModelActions.startCreateNew());
    expect(state.isDrawerOpen).toBe(true);
    state = entityModelReducer(state, entityModelActions.applyEntityModelChange({ title: 'et1', name: 'ET', fields: [] } as any));
    expect(state.ids.length).toBe(1);
    const id = state.ids[0] as string;
    const entity = state.entities[id];
    expect(entity).toMatchObject({ title: 'et1', name: 'ET', fields: [] });

    state = entityModelReducer(state, entityModelActions.startEdit(id));
    state = entityModelReducer(state, entityModelActions.applyEntityModelChange({ title: 'et2', primaryKey: 'pk2', name: 'ET2', fields: [] }));
    expect(state.entities[id]).toMatchObject({ title: 'et2', name: 'ET2', fields: [] });

    state = entityModelReducer(state, entityModelActions.deleteEntityModel(id));
    expect(state.ids.length).toBe(0);
  });

  it('manages fields of editingEntityModel', () => {
    let state = entityModelReducer(undefined, { type: '' } as any) as any;

    state = entityModelReducer(state, entityModelActions.startCreateNew());
    expect((state as any).editingEntityModel.fields[0].id).toBe('f2');
  });
});
