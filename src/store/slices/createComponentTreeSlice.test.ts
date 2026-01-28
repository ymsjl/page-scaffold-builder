import { describe, it, expect } from 'vitest';
import { createStore } from 'zustand/vanilla';
import { createComponentTreeSlice } from './createComponentTreeSlice';

describe('createComponentTreeSlice', () => {
  it('adds and removes nodes recursively', () => {
    const store = createStore((set, get) => ({ ...createComponentTreeSlice(set as any, get as any, {} as any) } as any));
    const s = store.getState() as any;

    s.addNewNode(null, 'Container');
    const rootIds = s.componentTree.rootIds;
    expect(rootIds.length).toBe(1);
    const rootId = rootIds[0];
    expect(s.componentTree.nodesById[rootId].type).toBe('Container');

    s.addNewNode(rootId, 'Text');
    expect(s.componentTree.nodesById[rootId].childrenIds.length).toBe(1);
    const childId = s.componentTree.nodesById[rootId].childrenIds[0];

    s.removeNode(rootId);
    expect(s.componentTree.nodesById[rootId]).toBeUndefined();
    expect(s.componentTree.nodesById[childId]).toBeUndefined();
    expect(s.componentTree.rootIds.length).toBe(0);
  });

  it('selects and updates node', () => {
    const store = createStore((set, get) => ({ ...createComponentTreeSlice(set as any, get as any, {} as any) } as any));
    const s = store.getState() as any;
    s.addNewNode(null, 'Text');
    const id = s.componentTree.rootIds[0];
    s.selectNode(id);
    expect(s.componentTree.selectedNodeId).toBe(id);
    s.updateNode(id, { name: 'Updated' });
    expect(s.componentTree.nodesById[id].name).toBe('Updated');
  });
});
