import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AntdRule, RuleNode } from '@/components/RuleBuilder/utils/ruleMapping';
import { rulesToNodes, nodesToRules } from '@/components/RuleBuilder/utils/ruleMapping';

export type RuleBuilderState = {
  nodes: RuleNode[];
  selectedId: string | null;
  lastEmittedSignature: string;
};

const initialState: RuleBuilderState = {
  nodes: [],
  selectedId: null,
  lastEmittedSignature: '',
};

const slice = createSlice({
  name: 'ruleBuilder',
  initialState,
  reducers: {
    setNodes(state, action: PayloadAction<RuleNode[]>) {
      state.nodes = action.payload;
    },
    setSelectedId(state, action: PayloadAction<string | null>) {
      state.selectedId = action.payload;
    },
    initFromRules(state, action: PayloadAction<AntdRule[]>) {
      const rules = action.payload;
      const sig = serializeRules(rules);
      // avoid echo if same signature
      if (sig && sig === state.lastEmittedSignature) return;
      const nodes = rulesToNodes(rules);
      state.nodes = nodes;
      state.selectedId = nodes[0]?.id ?? null;
    },
    addNode(state, action: PayloadAction<RuleNode>) {
      state.nodes.push(action.payload);
    },
    updateNode(state, action: PayloadAction<RuleNode>) {
      state.nodes = state.nodes.map(n => (n.id === action.payload.id ? action.payload : n));
    },
    deleteNode(state, action: PayloadAction<string>) {
      state.nodes = state.nodes.filter(n => n.id !== action.payload);
      if (state.selectedId === action.payload) state.selectedId = null;
    },
    duplicateNode(state, action: PayloadAction<string>) {
      const target = state.nodes.find(n => n.id === action.payload);
      if (!target) return;
      const clone = { ...target, id: `rule_${Date.now()}_${Math.random().toString(36).slice(2, 9)}` } as RuleNode;
      state.nodes.push(clone);
    },
    moveNode(state, action: PayloadAction<{ id: string; direction: 'up' | 'down' }>) {
      const { id, direction } = action.payload;
      const idx = state.nodes.findIndex(n => n.id === id);
      if (idx < 0) return;
      const nextIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (nextIdx < 0 || nextIdx >= state.nodes.length) return;
      const copy = [...state.nodes];
      const [item] = copy.splice(idx, 1);
      copy.splice(nextIdx, 0, item);
      state.nodes = copy;
    },
    // internal use: set last emitted signature
    setLastEmittedSignature(state, action: PayloadAction<string>) {
      state.lastEmittedSignature = action.payload;
    },
    // optional: replace nodes directly (used by some flows)
    replaceNodes(state, action: PayloadAction<RuleNode[]>) {
      state.nodes = action.payload;
    },
  },
});

// Shared utilities
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

export const ruleBuilderActions = slice.actions;
export default slice.reducer;

export const selectRuleNodes = (state: any) => state.ruleBuilder.nodes as RuleNode[];
export const selectSelectedId = (state: any) => state.ruleBuilder.selectedId as string | null;
export const selectLastEmittedSignature = (state: any) => state.ruleBuilder.lastEmittedSignature as string;

// Subscription API (module-level subscribers)
const subscribers = new Set<(rules: AntdRule[]) => void>();
export const subscribeRuleBuilder = (cb: (rules: AntdRule[]) => void) => {
  subscribers.add(cb);
  return () => subscribers.delete(cb);
};

export const _emitToSubscribers = (rules: AntdRule[]) => {
  subscribers.forEach(cb => {
    try {
      cb(rules);
    } catch (e) {
      // swallow errors from subscriber
      // eslint-disable-next-line no-console
      console.error('ruleBuilder subscriber error', e);
    }
  });
};
