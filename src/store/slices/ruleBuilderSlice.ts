import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RuleNodeParams } from "@/components/RuleBuilder/RuleParamsDateSchema";
import type { RuleNode } from "@/components/RuleBuilder/RuleParamsDateSchema";
import { RuleTemplate } from "@/components/RuleBuilder/RuleParamsDateSchema";
import { makeIdCreator } from "./makeIdCreator";
import { ruleNodeContext } from "@/components/RuleBuilder/strategies";

export const makeRuleId = makeIdCreator("rule");

export type RuleBuilderState = {
  nodes: RuleNode[];
};

const initialState: RuleBuilderState = {
  nodes: [],
};

const slice = createSlice({
  name: "ruleBuilder",
  initialState,
  reducers: {
    addNodeFromTemplate(state, action: PayloadAction<RuleTemplate>) {
      const { type, defaultParams, name } = action.payload;
      state.nodes.push({
        id: makeRuleId(),
        name,
        type,
        enabled: true,
        params: defaultParams || {},
        message: ruleNodeContext
          .getStrategyForNodeOrThrow({
            type,
            params: defaultParams || {},
          } as RuleNode)
          .buildDefaultMessage({
            type,
            params: defaultParams || {},
          } as RuleNode),
      });
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
        targetNode.message ||
        ruleNodeContext
          .getStrategyForNodeOrThrow(targetNode)
          .buildDefaultMessage(targetNode);
    },
    deleteNode(state, action: PayloadAction<string>) {
      state.nodes = state.nodes.filter((n) => n.id !== action.payload);
    },
    resetState(state) {
      Object.assign(state, initialState);
    },
  },
});

export const ruleBuilderActions = slice.actions;
export default slice.reducer;
