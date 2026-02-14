import { describe, it, expect } from 'vitest';
import type { RootState } from '../rootReducer';
import actionFlowsReducer, { actionFlowsActions } from './actionFlowsSlice';
import { selectActionFlowOptions } from './actionFlowsSelectors';

describe('selectActionFlowOptions', () => {
  it('returns stable option references for the same state', () => {
    let state = actionFlowsReducer(undefined, { type: '' } as any);
    state = actionFlowsReducer(
      state,
      actionFlowsActions.createFlow({
        id: 'flow_1',
        name: 'Flow A',
        description: '',
      }),
    );

    const rootState = { actionFlows: state } as RootState;

    const first = selectActionFlowOptions(rootState);
    const second = selectActionFlowOptions(rootState);

    expect(first).toBe(second);
    expect(first).toEqual([{ label: 'Flow A', value: 'flow_1' }]);
  });
});
