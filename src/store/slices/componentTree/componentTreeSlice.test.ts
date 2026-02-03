import { describe, it, expect } from 'vitest';
import componentTreeReducer, { componentTreeActions } from './componentTreeSlice';

describe('componentTreeSlice', () => {
  it('adds and removes nodes recursively', () => {
    let state = componentTreeReducer(undefined, { type: '' } as any) as any;

    const rootId = 'root_1';
    state = componentTreeReducer(state, componentTreeActions.addNode({ parentId: null, type: 'Container' }));

    expect(state.rootIds.length).toBe(1);
    expect(state.entities[rootId].type).toBe('Container');

    const childId = 'child_1';
    state = componentTreeReducer(state, componentTreeActions.addNode({ parentId: rootId, type: 'Table' }));
    expect(state.entities[rootId].childrenIds.length).toBe(1);

    state = componentTreeReducer(state, componentTreeActions.removeNode(rootId));
    expect(state.entities[rootId]).toBeUndefined();
    expect(state.entities[childId]).toBeUndefined();
    expect(state.rootIds.length).toBe(0);
  });
});
