import { describe, it, expect } from 'vitest';
import componentTreeReducer, { componentTreeActions } from './componentTreeSlice';

describe('componentTreeSlice', () => {
  it('adds and removes nodes recursively', () => {
    let state = componentTreeReducer(undefined, { type: '' } as any) as any;

    state = componentTreeReducer(state, componentTreeActions.addNode({ parentId: null, type: 'Container' }));

    expect(state.rootIds.length).toBe(1);
    const rootId = state.rootIds[0];
    expect(state.components.entities[rootId].type).toBe('Container');

    state = componentTreeReducer(state, componentTreeActions.addNode({ parentId: rootId, type: 'Table' }));
    expect(state.components.entities[rootId].childrenIds.length).toBe(1);
    const childId = state.components.entities[rootId].childrenIds[0];

    state = componentTreeReducer(state, componentTreeActions.removeNode(rootId));
    expect(state.components.entities[rootId]).toBeUndefined();
    expect(state.components.entities[childId]).toBeUndefined();
    expect(state.rootIds.length).toBe(0);
  });
});
