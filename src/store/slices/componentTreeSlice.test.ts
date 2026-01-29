import { describe, it, expect } from 'vitest';
import componentTreeReducer, { componentTreeActions } from './componentTreeSlice';

describe('componentTreeSlice', () => {
  it('adds and removes nodes recursively', () => {
    let state = componentTreeReducer(undefined, { type: '' } as any) as any;

    const rootId = 'root_1';
    state = componentTreeReducer(state, componentTreeActions.addNode({ id: rootId, parentId: null, name: 'Root', type: 'Container', isContainer: true, props: {}, childrenIds: [] }));

    expect(state.rootIds.length).toBe(1);
    expect(state.entities[rootId].type).toBe('Container');

    const childId = 'child_1';
    state = componentTreeReducer(state, componentTreeActions.addNode({ id: childId, parentId: rootId, name: 'Child', type: 'Text', props: {}, childrenIds: [] }));
    expect(state.entities[rootId].childrenIds.length).toBe(1);

    state = componentTreeReducer(state, componentTreeActions.removeNode(rootId));
    expect(state.entities[rootId]).toBeUndefined();
    expect(state.entities[childId]).toBeUndefined();
    expect(state.rootIds.length).toBe(0);
  });

  it('selects and updates node', () => {
    let state = componentTreeReducer(undefined, { type: '' } as any) as any;
    const id = 'node_text_1';
    state = componentTreeReducer(state, componentTreeActions.addNode({ id, parentId: null, name: 'TextNode', type: 'Text', props: {}, childrenIds: [] }));
    state = componentTreeReducer(state, componentTreeActions.selectNode(id));
    expect(state.selectedNodeId).toBe(id);
    state = componentTreeReducer(state, componentTreeActions.updateNode({ id, updates: { name: 'Updated' } }));
    expect(state.entities[id].name).toBe('Updated');
  });
});
