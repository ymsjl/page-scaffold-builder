import { describe, it, expect } from 'vitest';
import OperatorSelect from './OperatorSelect';

describe('OperatorSelect export', () => {
  it('is exported (function or memo object)', () => {
    expect(['function', 'object']).toContain(typeof OperatorSelect);
  });
});
