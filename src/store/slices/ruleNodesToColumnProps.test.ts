import { describe, it, expect } from 'vitest';
import { ruleNodesToColumnProps } from "./selectRuleBuilder";
import { RuleNodeType } from '@/components/RuleBuilder/RuleParamsDateSchema';

describe('ruleNodesToColumnProps', () => {
  it('maps text length to fieldProps and rules', () => {
    const nodes: any[] = [
      { id: '1', type: RuleNodeType.TextLength, enabled: true, params: { min: 2, max: 5 }, message: 'len' },
    ];

    const res = ruleNodesToColumnProps(nodes as any);
    expect(res.fieldProps).toBeDefined();
    expect(res.fieldProps!.minLength).toBe(2);
    expect(res.fieldProps!.maxLength).toBe(5);
    expect(res.formItemProps).toBeDefined();
    expect((res.formItemProps!.rules as any[])[0].min).toBe(2);
    expect((res.formItemProps!.rules as any[])[0].max).toBe(5);
  });

  it('maps numeric range to min/max and rules', () => {
    const nodes: any[] = [
      { id: '1', type: RuleNodeType.NumericRange, enabled: true, params: { min: 0, max: 100 }, message: 'range' },
    ];

    const res = ruleNodesToColumnProps(nodes as any);
    expect(res.fieldProps).toBeDefined();
    expect(res.fieldProps!.min).toBe(0);
    expect(res.fieldProps!.max).toBe(100);
    expect(res.formItemProps).toBeDefined();
    expect((res.formItemProps!.rules as any[])[0].min).toBe(0);
    expect((res.formItemProps!.rules as any[])[0].max).toBe(100);
  });

  it('maps decimal precision to precision and step', () => {
    const nodes: any[] = [
      { id: '1', type: RuleNodeType.Decimal, enabled: true, params: { precision: 2 }, message: 'dec' },
    ];

    const res = ruleNodesToColumnProps(nodes as any);
    expect(res.fieldProps).toBeDefined();
    expect(res.fieldProps!.precision).toBe(2);
    expect(res.fieldProps!.step).toBeCloseTo(0.01);
  });

  it('maps text pattern to fieldProps and rules', () => {
    const nodes: any[] = [
      { id: '1', type: RuleNodeType.TextRegexPattern, enabled: true, params: { pattern: '^\\d+$' }, message: 'pat' },
    ];

    const res = ruleNodesToColumnProps(nodes as any);
    expect(res.fieldProps).toBeDefined();
    expect(res.fieldProps!.pattern).toBe('^\\d+$');
    expect(res.formItemProps).toBeDefined();
    const rule = (res.formItemProps!.rules as any[])[0];
    expect(rule.pattern).toBeInstanceOf(RegExp);
    expect(rule.pattern.source).toBe('^\\d+$');
  });

  it('maps date range to minDate/maxDate and disabledDate', () => {
    const nodes: any[] = [
      { id: '1', type: RuleNodeType.DateRange, enabled: true, params: { minDate: '2020-01-01', maxDate: '2020-01-10' }, message: 'date' },
    ];

    const res = ruleNodesToColumnProps(nodes as any);
    expect(res.fieldProps).toBeDefined();
    expect(res.fieldProps!.minDate).toBe('2020-01-01');
    expect(res.fieldProps!.maxDate).toBe('2020-01-10');
    const disabled = res.fieldProps!.disabledDate;
    expect(typeof disabled).toBe('function');
    expect(disabled('2019-12-31')).toBe(true);
    expect(disabled('2020-01-05')).toBe(false);
    expect(disabled('2020-01-11')).toBe(true);
  });
});