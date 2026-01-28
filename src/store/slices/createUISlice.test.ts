import { describe, it, expect } from 'vitest';
import { createStore } from 'zustand/vanilla';
import { createUISlice } from './createUISlice';

describe('createUISlice', () => {
  it('toggles schema editor and dropdown', () => {
    const store = createStore((set, get) => ({ ...createUISlice(set, get) }));
    const s = store.getState();

    s.showAddDropdown('node1');
    expect(s.showAddDropdownNodeId).toBe('node1');

    s.setEntityTypeDesignerPanelOpen(true);
    expect(s.entityTypeDesignerPanelOpen).toBe(true);

    s.closeSchemaEditor();
    expect(s.schemaEditorVisible).toBe(false);

    s.setEditingColumn({ key: 'c1' } as any);
    expect(s.editingColumn?.key).toBe('c1');
  });
});
