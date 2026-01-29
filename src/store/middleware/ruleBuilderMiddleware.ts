import { Middleware } from '@reduxjs/toolkit';
import { nodesToRules } from '@/components/RuleBuilder/utils/ruleMapping';
import { ruleBuilderActions, selectLastEmittedSignature, _emitToSubscribers } from '@/store/slices/ruleBuilderSlice';
import type { RootState } from '@/store/store';
import type { AntdRule } from '@/components/RuleBuilder/utils/ruleMapping';

const serializeRules = (rules: AntdRule[] = []) => {
  const normalized = rules.map(rule => {
    if (typeof rule === 'function') return { __fn: true } as any;
    const { pattern, ...rest } = rule as any;
    return {
      ...rest,
      pattern: pattern ? pattern.toString() : undefined,
    } as any;
  });
  return JSON.stringify(normalized);
};

const ACTIONS_TO_WATCH = new Set([
  ruleBuilderActions.setNodes.type,
  ruleBuilderActions.addNode.type,
  ruleBuilderActions.updateNode.type,
  ruleBuilderActions.deleteNode.type,
  ruleBuilderActions.duplicateNode.type,
  ruleBuilderActions.moveNode.type,
  ruleBuilderActions.replaceNodes.type,
  ruleBuilderActions.initFromRules.type,
]);

export const ruleBuilderMiddleware: Middleware<{}, RootState> = store => next => action => {
  const result = next(action);
  try {
    if (!ACTIONS_TO_WATCH.has(action.type)) return result;

    const state = store.getState();
    const nodes = state.ruleBuilder.nodes;
    const rules = nodesToRules(nodes);
    const sig = serializeRules(rules);
    const prevSig = selectLastEmittedSignature(state);

    if (sig && sig === prevSig) return result;

    // update signature and notify subscribers
    store.dispatch(ruleBuilderActions.setLastEmittedSignature(sig));
    _emitToSubscribers(rules);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('ruleBuilderMiddleware error', err);
  }
  return result;
};
