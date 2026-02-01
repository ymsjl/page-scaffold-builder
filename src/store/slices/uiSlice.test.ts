import { describe, it, expect } from 'vitest';
import uiReducer, { uiActions } from './uiSlice';

describe('uiSlice', () => {
  it('toggles entity type designer panel', () => {
    let state = uiReducer(undefined, { type: '' });

    state = uiReducer(state, uiActions.setEntityTypeDesignerPanelOpen(true));
    expect(state.entityTypeDesignerPanelOpen).toBe(true);
  });
});
