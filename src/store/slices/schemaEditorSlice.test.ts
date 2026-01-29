import { describe, it, expect } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import componentTreeReducer, { componentTreeActions } from './componentTreeSlice';
import schemaEditorReducer from './schemaEditorSlice';

describe('schemaEditor slice thunks', () => {
  it('upserts, moves, deletes and applies columns', async () => {
    const store = configureStore({ reducer: { componentTree: componentTreeReducer, schemaEditor: schemaEditorReducer } }) as any;

    const id = 'node_table_1';
    store.dispatch(
      componentTreeActions.addNode({ id, parentId: null, name: 'Table', type: 'Table', props: { columns: [] }, childrenIds: [] } as any),
    );
    store.dispatch(componentTreeActions.selectNode(id));

    await store.dispatch(componentTreeActions.upsertColumnForSelectedNode({ key: 'k1', title: 'A' } as any));
    let state = store.getState();
    expect(state.componentTree.entities[id].props.columns.length).toBe(1);
    const key = state.componentTree.entities[id].props.columns[0].key;

    await store.dispatch(componentTreeActions.upsertColumnForSelectedNode({ key: 'k2', title: 'B' } as any));
    state = store.getState();
    expect(state.componentTree.entities[id].props.columns.length).toBe(2);

    await store.dispatch(componentTreeActions.moveColumnForSelectedNode({ from: 0, to: 1 }));
    state = store.getState();
    expect(state.componentTree.entities[id].props.columns[1].key).toBe(key);

    await store.dispatch(componentTreeActions.upsertColumnForSelectedNode({ key: 'k2', title: 'B2' } as any));
    state = store.getState();
    expect(state.componentTree.entities[id].props.columns.find((c: any) => c.key === 'k2').title).toBe('B2');

    await store.dispatch(componentTreeActions.deleteColumnForSelectedNode('k2'));
    state = store.getState();
    expect(state.componentTree.entities[id].props.columns.find((c: any) => c.key === 'k2')).toBeUndefined();
  });
});
