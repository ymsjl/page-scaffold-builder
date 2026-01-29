import { describe, it, expect } from 'vitest';
import { rulesToNodes, nodesToRules } from './ruleMapping';

describe('ruleMapping operator inference', () => {
  it('infers between/gte/lte/eq for number rules', () => {
    const rules: any = [
      { type: 'number', min: 1, max: 10 },
      { type: 'number', min: 5 },
      { type: 'number', max: 20 },
      { type: 'number', min: 7, max: 7 },
    ];

    const nodes = rulesToNodes(rules);
    expect(nodes[0].type).toBe('range');
    expect(nodes[0].params.operator).toBe('between');
    expect(nodes[1].params.operator).toBe('gte');
    expect(nodes[2].params.operator).toBe('lte');
    expect(nodes[3].params.operator).toBe('eq');
  });

  it('nodesToRules keeps min/max for range nodes', () => {
    const nodes: any = [
      { id: '1', type: 'range', enabled: true, params: { operator: 'eq', min: 5, max: 5 }, message: 'm' },
      { id: '2', type: 'range', enabled: true, params: { operator: 'gte', min: 3 }, message: 'm2' },
    ];
    const rules = nodesToRules(nodes);
    expect(rules[0].min).toBe(5);
    expect(rules[0].max).toBe(5);
    expect(rules[1].min).toBe(3);
    expect(rules[1].max).toBeUndefined();
  });

  it('dateRange validator validates single date against min/max', async () => {
    const nodes: any = [
      { id: 'd1', type: 'dateRange', enabled: true, params: { minDate: '2020-01-01', maxDate: '2020-01-10' }, message: 'date range' },
    ];
    const rules = nodesToRules(nodes) as any[];
    expect(rules.length).toBe(1);
    const validator = rules[0].validator as Function;
    await expect(validator({}, '2020-01-05')).resolves.toBeUndefined();
    await expect(validator({}, '2019-12-31')).rejects.toBeDefined();
    await expect(validator({}, '2020-01-11')).rejects.toBeDefined();
  });
});
