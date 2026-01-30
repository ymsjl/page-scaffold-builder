import { describe, it, expect } from 'vitest';
import { computeOperatorParams, getNodeTitle, UI_PATTERN_PRESETS } from './utils';

describe('RuleBuilder utils', () => {
  it('UI_PATTERN_PRESETS includes expected keys', () => {
    const keys = UI_PATTERN_PRESETS.map((p) => p.key);
    expect(keys).toContain('phoneChina');
    expect(keys).toContain('email');
    expect(keys).toContain('custom');
  });

  it('getNodeTitle returns localized titles', () => {
    expect(getNodeTitle({ type: 'required' } as any)).toBe('必填');
    expect(getNodeTitle({ type: 'length' } as any)).toBe('文本长度');
    expect(getNodeTitle({ type: 'pattern' } as any)).toBe('正则表达式');
  });

  it('computeOperatorParams handles eq', () => {
    const params = { min: 1, max: 3 };
    expect(computeOperatorParams('eq', params)).toEqual({ operator: 'eq', min: 1, max: 1 });
    const lenParams = { len: 5 };
    expect(computeOperatorParams('eq', lenParams, 'min', 'max', 'len')).toEqual({ operator: 'eq', len: 5, min: undefined, max: undefined });
  });

  it('computeOperatorParams handles between/gte/lte', () => {
    expect(computeOperatorParams('between', { min: 2, max: 4 })).toEqual({ operator: 'between', min: 2, max: 4 });
    expect(computeOperatorParams('gte', { min: 2, max: 4 })).toEqual({ operator: 'gte', min: 2, max: undefined });
    expect(computeOperatorParams('lte', { min: 2, max: 4 })).toEqual({ operator: 'lte', max: 4, min: undefined });
  });
});
