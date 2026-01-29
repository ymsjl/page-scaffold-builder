import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import type {
  AntdRule,
  RuleNode,
} from "@/components/RuleBuilder/utils/ruleMapping";
import { nodesToRules, rulesToNodes } from "@/components/RuleBuilder/utils/ruleMapping";
import { RootState } from "../store";

export type RuleBuilderState = {
  nodes: RuleNode[];
  selectedId: string | null;
};

const initialState: RuleBuilderState = {
  nodes: [],
  selectedId: null,
};

const slice = createSlice({
  name: "ruleBuilder",
  initialState,
  reducers: {
    setNodes(state, action: PayloadAction<RuleNode[]>) {
      state.nodes = action.payload;
    },
    setSelectedRuleItemId(state, action: PayloadAction<string | null>) {
      state.selectedId = action.payload;
    },
    initFromRules(state, action: PayloadAction<AntdRule[]>) {
      const rules = action.payload;
      const nodes = rulesToNodes(rules);
      state.nodes = nodes;
      state.selectedId = nodes[0]?.id ?? null;
    },
    addNode(state, action: PayloadAction<RuleNode>) {
      state.nodes.push(action.payload);
    },
    updateNode(state, action: PayloadAction<RuleNode>) {
      state.nodes = state.nodes.map((n) =>
        n.id === action.payload.id ? action.payload : n,
      );
    },
    deleteNode(state, action: PayloadAction<string>) {
      state.nodes = state.nodes.filter((n) => n.id !== action.payload);
      if (state.selectedId === action.payload) state.selectedId = null;
    },
    duplicateNode(state, action: PayloadAction<string>) {
      const target = state.nodes.find((n) => n.id === action.payload);
      if (!target) return;
      const clone = {
        ...target,
        id: `rule_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      } as RuleNode;
      state.nodes.push(clone);
    },
    moveNode(
      state,
      action: PayloadAction<{ id: string; direction: "up" | "down" }>,
    ) {
      const { id, direction } = action.payload;
      const idx = state.nodes.findIndex((n) => n.id === id);
      if (idx < 0) return;
      const nextIdx = direction === "up" ? idx - 1 : idx + 1;
      if (nextIdx < 0 || nextIdx >= state.nodes.length) return;
      const copy = [...state.nodes];
      const [item] = copy.splice(idx, 1);
      copy.splice(nextIdx, 0, item);
      state.nodes = copy;
    },
    // optional: replace nodes directly (used by some flows)
    replaceNodes(state, action: PayloadAction<RuleNode[]>) {
      state.nodes = action.payload;
    },
  },
});

// Shared utilities
const serializeRules = (rules: AntdRule[] = []) => {
  const normalized = rules.map((rule) => {
    if (typeof rule === "function") return { __fn: true } as any;
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

export const selectRuleBuilder = (state: RootState) => state.ruleBuilder;

export const selectRuleNodes = createSelector(
  selectRuleBuilder,
  (ruleBuilder) => ruleBuilder.nodes,
);

export const selectCurrentColumnRules = createSelector(
  selectRuleBuilder,
  (ruleBuilder) => nodesToRules(ruleBuilder.nodes),
);

export const selectSelectedRuleItemId = createSelector(
  selectRuleBuilder,
  (ruleBuilder) => ruleBuilder.selectedId,
);