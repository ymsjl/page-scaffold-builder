import type { RuleNode } from "@/components/RuleBuilder/RuleParamsDateSchema";
import {
  ruleNodeContext,
  RuleDescriptor,
  AntdRule,
} from "@/components/RuleBuilder/strategies";
import { FormItemPropsZ } from "@/types/tableColumsTypes";
import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "../rootReducer";

export const selectRuleBuilder = (state: RootState) => state.ruleBuilder;

export const selectRuleNodes = createSelector(
  selectRuleBuilder,
  (ruleBuilder) => ruleBuilder.nodes,
);

export const selectCurrentColumnRules = createSelector(
  selectRuleBuilder,
  (ruleBuilder) => nodesToRuleDescriptors(ruleBuilder.nodes),
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

  const result: {
    formItemProps?: FormItemPropsZ;
    fieldProps?: Record<string, any>;
  } = { formItemProps: {}, fieldProps: {} };
  if (formItemProps.rules && formItemProps.rules.length > 0)
    result.formItemProps = formItemProps as FormItemPropsZ;
  if (Object.keys(fieldProps).length > 0) result.fieldProps = fieldProps;

  return result;
};

export const selectCurrentColumnProps = createSelector(
  selectRuleNodes,
  (nodes) => ruleNodesToColumnProps(nodes),
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
