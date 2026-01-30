import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RuleNodeParams } from "@/components/RuleBuilder/RuleParamsDateSchema";
import type { RuleNode } from "@/components/RuleBuilder/RuleParamsDateSchema";
import { buildDefaultMessage } from "@/components/RuleBuilder/utils/ruleMapping";
import { nodesToRules } from "@/components/RuleBuilder/utils/nodesToRules";
import { RootState } from "../store";
import { RuleTemplate } from "@/components/RuleBuilder/RuleParamsDateSchema";
import { makeIdCreator } from "./makeIdCreator";

export const makeRuleId = makeIdCreator("rule");

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
    addNodeFromTemplate(state, action: PayloadAction<RuleTemplate>) {
      const { type, defaultParams, name } = action.payload;
      state.nodes.push({
        id: makeRuleId(),
        name,
        type,
        enabled: true,
        params: defaultParams || {},
        message: buildDefaultMessage({ type, params: defaultParams || {} }),
      });
    },
    updateNode(state, action: PayloadAction<RuleNode>) {
      state.nodes = state.nodes.map((n) =>
        n.id === action.payload.id ? action.payload : n,
      );
    },
    updateNodeParams(
      state,
      action: PayloadAction<{ id: string; params: RuleNodeParams }>,
    ) {
      const { id, params } = action.payload;
      const targetNode = state.nodes.find((n) => n.id === id);
      if (!targetNode) return;
      Object.assign(targetNode.params, {}, params);
      targetNode.message =
        targetNode.message || buildDefaultMessage(targetNode);
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
