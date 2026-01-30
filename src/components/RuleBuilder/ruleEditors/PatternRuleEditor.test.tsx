import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import PatternRuleEditor from './PatternRuleEditor';
import { UI_PATTERN_PRESETS } from '../utils';

describe('PatternRuleEditor', () => {
  it('disables input for preset and selecting custom clears preset value', async () => {
    const updateParams = vi.fn();
    render(
      <PatternRuleEditor
        params={{ pattern: UI_PATTERN_PRESETS.find((p) => p.key === 'email')!.value }}
        updateParams={updateParams}
      />,
    );

    const input = screen.getByPlaceholderText('自定义正则表达式');
    expect(input).toBeDisabled();

    // open select dropdown and choose '自定义' (custom)
    await userEvent.click(screen.getByRole('combobox'));
    const customOption = await screen.findByText('自定义');
    await userEvent.click(customOption);

    expect(updateParams).toHaveBeenCalledWith({ pattern: '' });
  });

  it('typing into input calls updateParams with typed value', async () => {
    const calls: Array<Record<string, any>> = [];

    function Controlled() {
      const [pattern, setPattern] = React.useState('');
      return (
        <PatternRuleEditor
          params={{ pattern }}
          updateParams={(next) => {
            calls.push(next);
            setPattern(next.pattern);
          }}
        />
      );
    }

    render(<Controlled />);

    const input = screen.getByPlaceholderText('自定义正则表达式') as HTMLInputElement;
    await userEvent.type(input, '^abc');

    // the controlled wrapper updates its state, so we should see the final accumulated value
    expect(calls).toContainEqual({ pattern: '^abc' });
  });
});
