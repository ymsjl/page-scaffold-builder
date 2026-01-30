import { describe, it, expect } from 'vitest';
import DateRangeEditor from './DateRangeEditor';

describe('DateRangeEditor export', () => {
  it('is exported (function or memo object)', () => {
    expect(['function', 'object']).toContain(typeof DateRangeEditor);
  });
});
