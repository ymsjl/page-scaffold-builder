import { describe, it, expect } from 'vitest';
import { createStore } from 'zustand/vanilla';
import { createComponentTreeSlice } from './createComponentTreeSlice';

describe('createComponentTreeSlice', () => {
  it('adds and removes nodes recursively', () => {
    const store = createStore((set, get) => ({ ...createComponentTreeSlice(set, get) }));
    const s = store.getState();

    s.componentTree.actions.addNewNode(null, 'Container');
    const rootIds = s.componentTree.data.rootIds;
    expect(rootIds.length).toBe(1);
    const rootId = rootIds[0];
    expect(s.componentTree.data.nodesById[rootId].type).toBe('Container');

    s.componentTree.actions.addNewNode(rootId, 'Text');
    expect(s.componentTree.data.nodesById[rootId].childrenIds.length).toBe(1);
    const childId = s.componentTree.data.nodesById[rootId].childrenIds[0];

    s.componentTree.actions.removeNode(rootId);
    expect(s.componentTree.data.nodesById[rootId]).toBeUndefined();
    expect(s.componentTree.data.nodesById[childId]).toBeUndefined();
    expect(s.componentTree.data.rootIds.length).toBe(0);
  });

  it('selects and updates node', () => {
    const store = createStore((set, get) => ({ ...createComponentTreeSlice(set, get) }));
    const s = store.getState();
    s.componentTree.actions.addNewNode(null, 'Text');
    const id = s.componentTree.data.rootIds[0];
    s.componentTree.actions.selectNode(id);
    expect(s.componentTree.data.selectedNodeId).toBe(id);
    s.componentTree.actions.updateNode(id, { name: 'Updated' });
    expect(s.componentTree.data.nodesById[id].name).toBe('Updated');
  });
});
