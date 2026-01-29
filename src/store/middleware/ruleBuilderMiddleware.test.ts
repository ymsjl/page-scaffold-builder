import { describe, it, expect, vi } from 'vitest';
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import ruleBuilderReducer, { ruleBuilderActions, subscribeRuleBuilder } from '@/store/slices/ruleBuilderSlice';
import { ruleBuilderMiddleware } from './ruleBuilderMiddleware';
import { nodesToRules } from '@/components/RuleBuilder/utils/ruleMapping';

describe('ruleBuilderMiddleware', () => {
  it('emits to subscribers and updates signature on changes', () => {
    const store = configureStore({
      reducer: combineReducers({ ruleBuilder: ruleBuilderReducer }),
      middleware: (gdm) => gdm().concat(ruleBuilderMiddleware),
    });

    const cb = vi.fn();
    const unsub = subscribeRuleBuilder(cb);

    const node = {
      id: 'rule_1',
      type: 'required',
      enabled: true,
      params: {},
      message: '必填',
    } as any;

    store.dispatch(ruleBuilderActions.addNode(node));

    expect(cb).toHaveBeenCalledTimes(1);
    expect(cb).toHaveBeenCalledWith(nodesToRules([node]));

    // dispatch initFromRules with same rules should not re-emit
    const rules = nodesToRules([node]);
    store.dispatch(ruleBuilderActions.initFromRules(rules));
    expect(cb).toHaveBeenCalledTimes(1);

    unsub();
  });
});