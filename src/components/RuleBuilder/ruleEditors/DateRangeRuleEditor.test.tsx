import { describe, it, expect } from 'vitest';
import DateRangeRuleEditor from './DateRangeRuleEditor';

describe('DateRangeRuleEditor export', () => {
  it('is exported (function or memo object)', () => {
    expect(['function','object']).toContain(typeof DateRangeRuleEditor);
  });
});
