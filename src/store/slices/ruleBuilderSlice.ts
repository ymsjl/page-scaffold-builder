import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RuleNodeParams } from "@/components/RuleBuilder/RuleParamsDateSchema";
import type { RuleNode } from "@/components/RuleBuilder/RuleParamsDateSchema";
import type { RootState } from "../storeTypes";
import { RuleTemplate } from "@/components/RuleBuilder/RuleParamsDateSchema";
import { makeIdCreator } from "./makeIdCreator";
import { FormItemPropsZ } from "@/types/tableColumsTypes";
import {
  AntdRule,
  RuleDescriptor,
  ruleNodeContext,
} from "@/components/RuleBuilder/strategies";

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
        targetNode.message ||
        ruleNodeContext
          .getStrategyForNodeOrThrow(targetNode)
          .buildDefaultMessage(targetNode);
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
    resetState(state) {
      Object.assign(state, initialState);
    }
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
  (ruleBuilder) => nodesToRuleDescriptors(ruleBuilder.nodes),
);

export const selectSelectedRuleItemId = createSelector(
  selectRuleBuilder,
  (ruleBuilder) => ruleBuilder.selectedId,
);

export const ruleNodesToColumnProps = (
  nodes: RuleNode[],
): { formItemProps?: FormItemPropsZ; fieldProps?: Record<string, any> } => {
  if (!nodes || nodes.length === 0) return {};

  const enabled = nodes.filter((n) => n.enabled);

  const formItemProps: Partial<FormItemPropsZ> = {};
  const rules = nodesToRuleDescriptors(nodes);
  if (rules && rules.length) formItemProps.rules = rules as any;

  const fieldProps: Record<string, any> = {};

  for (const node of enabled) {
    ruleNodeContext.applyFieldProps(node, fieldProps);
  }

  const result: { formItemProps?: FormItemPropsZ; fieldProps?: Record<string, any> } = { formItemProps: {}, fieldProps: {} };
  if (formItemProps.rules && formItemProps.rules.length > 0) result.formItemProps = formItemProps as FormItemPropsZ;
  if (Object.keys(fieldProps).length > 0) result.fieldProps = fieldProps;

  return result;
};

export const selectCurrentColumnProps = createSelector(selectRuleNodes, (nodes) =>
  ruleNodesToColumnProps(nodes),
);

export const nodesToRuleDescriptors = (
  nodes: RuleNode[] = [],
): RuleDescriptor[] =>
  nodes
    .filter((node) => node.enabled)
    .map((node) => ({
      type: node.type,
      params: node.params ?? {},
      message: node.message,
    }));

export const ruleDescriptorsToRules = (
  descriptors: RuleDescriptor[] = [],
): AntdRule[] =>
  descriptors
    .map((descriptor) => {
      try {
        return (
          ruleNodeContext.toRuleFromDescriptor(descriptor) ?? ({} as AntdRule)
        );
      } catch (error) {}
      return {} as AntdRule;
    })
    .filter((rule) => Object.keys(rule).length > 0) as AntdRule[];
