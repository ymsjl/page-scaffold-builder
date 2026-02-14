import { describe, it, expect } from 'vitest';
import componentTreeReducer, { componentTreeActions } from './componentTreeSlice';

describe('componentTreeSlice', () => {
  it('adds and removes nodes recursively', () => {
    let state = componentTreeReducer(undefined, { type: '' } as any) as any;

    state = componentTreeReducer(
      state,
      componentTreeActions.addNode({ parentId: null, type: 'Page' }),
    );

    expect(state.normalizedTree.result.length).toBe(1);
    const rootId = state.normalizedTree.result[0];
    expect(state.normalizedTree.entities.nodes[rootId].type).toBe('Page');

    state = componentTreeReducer(
      state,
      componentTreeActions.addNode({ parentId: rootId, type: 'Table' }),
    );
    expect(state.normalizedTree.entities.nodes[rootId].childrenIds.length).toBe(1);
    const childId = state.normalizedTree.entities.nodes[rootId].childrenIds[0];

    state = componentTreeReducer(state, componentTreeActions.removeNode(rootId));
    expect(state.normalizedTree.entities.nodes[rootId]).toBeUndefined();
    expect(state.normalizedTree.entities.nodes[childId]).toBeUndefined();
    expect(state.normalizedTree.result.length).toBe(0);
  });
});
