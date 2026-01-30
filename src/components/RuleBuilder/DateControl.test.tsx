import { describe, it, expect } from 'vitest';
import DateControl, { DateHelp } from './DateControl';

describe('DateControl exports', () => {
  it('exports a DateControl function', () => {
    expect(typeof DateControl).toBe('function');
  });

  it('exports a DateHelp function', () => {
    expect(typeof DateHelp).toBe('function');
  });
});
