import { describe, it, expect } from 'vitest';
import uiReducer, { uiActions } from './uiSlice';

describe('uiSlice', () => {
  it('toggles schema editor and dropdown', () => {
    let state = uiReducer(undefined, { type: '' });

    state = uiReducer(state, uiActions.setShowAddDropdownNodeId('node1'));
    expect(state.showAddDropdownNodeId).toBe('node1');

    state = uiReducer(state, uiActions.setEntityTypeDesignerPanelOpen(true));
    expect(state.entityTypeDesignerPanelOpen).toBe(true);
  });
});
