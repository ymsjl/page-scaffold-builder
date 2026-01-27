import { create } from 'zustand';
import type { AntdRule, RuleNode } from './utils/ruleMapping';
import { rulesToNodes, nodesToRules } from './utils/ruleMapping';

type RuleStore = {
  nodes: RuleNode[];
  selectedId: string | null;
  lastEmittedSignature: string;
  onChangeCb?: (rules: AntdRule[]) => void;

  // actions
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

export const useRuleStore = create<RuleStore>((set, get) => ({
  nodes: [],
  selectedId: null,
  lastEmittedSignature: '',
  onChangeCb: undefined,

  setOnChange(cb) {
    set({ onChangeCb: cb });
  },

  setNodes(nodes, emit = false) {
    set({ nodes });
    if (emit) {
      const rules = nodesToRules(nodes);
      const sig = serializeRules(rules);
      set({ lastEmittedSignature: sig });
      const cb = get().onChangeCb;
      cb?.(rules);
    }
  },

  setSelectedId(id) {
    set({ selectedId: id });
  },

  initFromRules(rules) {
    const sig = serializeRules(rules);
    // If same as last emitted, skip to avoid echo
    if (sig && sig === get().lastEmittedSignature) return;
    const nodes = rulesToNodes(rules);
    set({ nodes, selectedId: nodes[0]?.id ?? null, lastEmittedSignature: sig });
  },

  addNode(node) {
    const next = [...get().nodes, node];
    set({ nodes: next });
    const rules = nodesToRules(next);
    const sig = serializeRules(rules);
    set({ lastEmittedSignature: sig });
    get().onChangeCb?.(rules);
  },

  updateNode(node) {
    const next = get().nodes.map(n => (n.id === node.id ? node : n));
    set({ nodes: next });
    const rules = nodesToRules(next);
    const sig = serializeRules(rules);
    set({ lastEmittedSignature: sig });
    get().onChangeCb?.(rules);
  },

  deleteNode(id) {
    const next = get().nodes.filter(n => n.id !== id);
    set({ nodes: next, selectedId: get().selectedId === id ? null : get().selectedId });
    const rules = nodesToRules(next);
    const sig = serializeRules(rules);
    set({ lastEmittedSignature: sig });
    get().onChangeCb?.(rules);
  },

  duplicateNode(id) {
    const target = get().nodes.find(n => n.id === id);
    if (!target) return;
    const clone = { ...target, id: `rule_${Date.now()}_${Math.random().toString(36).slice(2, 9)}` } as RuleNode;
    const next = [...get().nodes, clone];
    set({ nodes: next });
    const rules = nodesToRules(next);
    const sig = serializeRules(rules);
    set({ lastEmittedSignature: sig });
    get().onChangeCb?.(rules);
  },

  moveNode(id, direction) {
    const prev = get().nodes;
    const index = prev.findIndex(n => n.id === id);
    if (index < 0) return;
    const nextIndex = direction === 'up' ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= prev.length) return;
    const copy = [...prev];
    const [item] = copy.splice(index, 1);
    copy.splice(nextIndex, 0, item);
    set({ nodes: copy });
    const rules = nodesToRules(copy);
    const sig = serializeRules(rules);
    set({ lastEmittedSignature: sig });
    get().onChangeCb?.(rules);
  },
}));

export default useRuleStore;