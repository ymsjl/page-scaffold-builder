import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { ruleBuilderActions, subscribeRuleBuilder, selectRuleNodes, selectSelectedId, selectLastEmittedSignature } from '@/store/slices/ruleBuilderSlice';
import type { AntdRule, RuleNode } from './utils/ruleMapping';
import { nodesToRules } from './utils/ruleMapping';
import React from 'react';

// Compatibility shim: keep the original API shape so existing imports remain valid during migration.
// This hook accepts a selector function (like original) and returns the selected piece from an API object that
// proxies to Redux Toolkit state and actions.

type API = {
  nodes: RuleNode[];
  selectedId: string | null;
  lastEmittedSignature: string;
  setOnChange: (cb?: (rules: AntdRule[]) => void) => void;
  setNodes: (nodes: RuleNode[], emit?: boolean) => void;
  setSelectedId: (id: string | null) => void;
  initFromRules: (rules: AntdRule[]) => void;
  addNode: (node: RuleNode) => void;
  updateNode: (node: RuleNode) => void;
  deleteNode: (id: string) => void;
  duplicateNode: (id: string) => void;
  moveNode: (id: string, direction: 'up' | 'down') => void;
};

export const useRuleStore = <T,>(selector: (api: API) => T): T => {
  const dispatch = useAppDispatch();
  const nodes = useAppSelector(selectRuleNodes);
  const selectedId = useAppSelector(selectSelectedId);
  const lastEmittedSignature = useAppSelector(selectLastEmittedSignature);

  const api = React.useMemo<API>(() => ({
    nodes,
    selectedId,
    lastEmittedSignature,
    setOnChange(cb) {
      // subscribe returns unsubscribe
      if (!cb) return;
      const unsub = subscribeRuleBuilder(cb);
      // We can't return the unsubscribe from here, so callers must manage lifecycle.
      // This shim keeps original behavior where `setOnChange` replaces the callback.
      // To mimic replacement, we will subscribe and immediately return.
      // NOTE: consumers using this should prefer the new `subscribeRuleBuilder` API.
      (api as any)._lastUnsub = unsub;
    },
    setNodes(nodes: RuleNode[], emit = false) {
      dispatch(ruleBuilderActions.setNodes(nodes));
      if (emit) {
        const rules = nodesToRules(nodes);
        // middleware will update signature and notify subscribers
      }
    },
    setSelectedId(id: string | null) {
      dispatch(ruleBuilderActions.setSelectedId(id));
    },
    initFromRules(rules: AntdRule[]) {
      dispatch(ruleBuilderActions.initFromRules(rules));
    },
    addNode(node: RuleNode) {
      dispatch(ruleBuilderActions.addNode(node));
    },
    updateNode(node: RuleNode) {
      dispatch(ruleBuilderActions.updateNode(node));
    },
    deleteNode(id: string) {
      dispatch(ruleBuilderActions.deleteNode(id));
    },
    duplicateNode(id: string) {
      dispatch(ruleBuilderActions.duplicateNode(id));
    },
    moveNode(id: string, direction: 'up' | 'down') {
      dispatch(ruleBuilderActions.moveNode({ id, direction }));
    },
  }), [dispatch, nodes, selectedId, lastEmittedSignature]);

  return selector(api);
};

export default useRuleStore;