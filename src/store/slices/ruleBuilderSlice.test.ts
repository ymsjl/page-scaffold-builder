import { describe, it, expect } from 'vitest';
import reducer, { ruleBuilderActions } from './ruleBuilderSlice';

describe('ruleBuilderSlice normalization', () => {
  it('migrates legacy dateMin/dateMax nodes to range (date)', () => {
    const initialState = { nodes: [], selectedId: null } as any;
    const legacyNodes = [
      { id: 'a', type: 'dateMin', enabled: true, params: { minDate: '2020-01-01' }, message: '' },
      { id: 'b', type: 'dateMax', enabled: true, params: { maxDate: '2020-12-31' }, message: '' },
    ];
    const state = reducer(initialState, ruleBuilderActions.setNodes(legacyNodes));
    expect(state.nodes.length).toBe(2);
    expect(state.nodes[0].type).toBe('range');
    expect(state.nodes[0].params.valueType).toBe('date');
    expect(state.nodes[0].params.minDate).toBe('2020-01-01');
    expect(state.nodes[1].type).toBe('range');
    expect(state.nodes[1].params.valueType).toBe('date');
    expect(state.nodes[1].params.maxDate).toBe('2020-12-31');
  });
});