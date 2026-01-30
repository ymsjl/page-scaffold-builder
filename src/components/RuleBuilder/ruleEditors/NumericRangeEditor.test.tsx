import { describe, it, expect } from 'vitest';
import NumericRangeEditor from './NumericRangeEditor';

describe('NumericRangeEditor export', () => {
  it('is exported (function or memo object)', () => {
    expect(['function', 'object']).toContain(typeof NumericRangeEditor);
  });
});
