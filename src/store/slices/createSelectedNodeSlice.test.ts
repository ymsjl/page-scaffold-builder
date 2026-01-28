import { describe, it, expect } from 'vitest';
import { createStore } from 'zustand/vanilla';
import { createComponentTreeSlice } from './createComponentTreeSlice';
import { createSelectedNodeSlice } from './createSelectedNodeSlice';

describe('createSelectedNodeSlice', () => {
  it('upserts, moves, deletes and applies columns', () => {
    const store = createStore((set, get) => ({ ...createComponentTreeSlice(set, get), ...createSelectedNodeSlice(set, get) }));
    const s = store.getState();
    s.componentTree.actions.addNewNode(null, 'Table');
    const id = s.componentTree.data.rootIds[0];
    s.componentTree.actions.selectNode(id);

    s.selectedNode.upsertColumn({ title: 'A' } as any);
    expect(s.componentTree.data.nodesById[id].props.columns.length).toBe(1);
    const key = s.componentTree.data.nodesById[id].props.columns[0].key;

    s.selectedNode.upsertColumn({ key: 'k2', title: 'B' } as any);
    expect(s.componentTree.data.nodesById[id].props.columns.length).toBe(2);

    s.selectedNode.moveColumn(0, 1);
    expect(s.componentTree.data.nodesById[id].props.columns[1].key).toBe(key);

    s.selectedNode.applyColumnChanges({ key: 'k2', title: 'B2' } as any);
    expect(s.componentTree.data.nodesById[id].props.columns.find((c: any) => c.key === 'k2').title).toBe('B2');

    s.selectedNode.deleteColumn('k2');
    expect(s.componentTree.data.nodesById[id].props.columns.find((c: any) => c.key === 'k2')).toBeUndefined();
  });
});
