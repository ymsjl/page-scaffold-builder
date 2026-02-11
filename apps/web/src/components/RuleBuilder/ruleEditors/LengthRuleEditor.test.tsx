import { describe, it, expect } from 'vitest';
import LengthRuleEditor from './LengthRuleEditor';

describe('LengthRuleEditor export', () => {
  it('is exported (function or memo object)', () => {
    expect(['function','object']).toContain(typeof LengthRuleEditor);
  });
});
