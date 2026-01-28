import { describe, it, expect } from 'vitest';
import { createStore } from 'zustand/vanilla';
import { createComponentTreeSlice } from './createComponentTreeSlice';
import { createSelectedNodeSlice } from './createSelectedNodeSlice';

describe('createSelectedNodeSlice', () => {
  it('upserts, moves, deletes and applies columns', () => {
    const store = createStore((set, get) => ({ ...createComponentTreeSlice(set as any, get as any, {} as any), ...createSelectedNodeSlice(set as any, get as any, {} as any) } as any));
    const s = store.getState() as any;
    s.addNewNode(null, 'Table');
    const id = s.componentTree.rootIds[0];
    s.selectNode(id);

    s.upsertColumn({ title: 'A' } as any);
    expect(s.componentTree.nodesById[id].props.columns.length).toBe(1);
    const key = s.componentTree.nodesById[id].props.columns[0].key;

    s.upsertColumn({ key: 'k2', title: 'B' } as any);
    expect(s.componentTree.nodesById[id].props.columns.length).toBe(2);

    s.moveColumn(0, 1);
    expect(s.componentTree.nodesById[id].props.columns[1].key).toBe(key);

    s.applyColumnChanges({ key: 'k2', title: 'B2' } as any);
    expect(s.componentTree.nodesById[id].props.columns.find((c: any) => c.key === 'k2').title).toBe('B2');

    s.deleteColumn('k2');
    expect(s.componentTree.nodesById[id].props.columns.find((c: any) => c.key === 'k2')).toBeUndefined();
  });
});
