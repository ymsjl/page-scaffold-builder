import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RuleNodeParams } from "@/components/RuleBuilder/RuleParamsDateSchema";
import type { RuleNode } from "@/components/RuleBuilder/RuleParamsDateSchema";
import { buildDefaultMessage } from "@/components/RuleBuilder/utils/ruleMapping";
import { nodesToRules } from "@/components/RuleBuilder/utils/nodesToRules";
import { RootState } from "../store";
import { RuleTemplate } from "@/components/RuleBuilder/RuleParamsDateSchema";
import { makeIdCreator } from "./makeIdCreator";
import { FormItemProps } from "antd";
import { FormItemPropsZ } from "@/types/tableColumsTypes";
import dayjs from "dayjs";
import { RuleNodeType, RelativeDatePresets } from "@/components/RuleBuilder/RuleParamsDateSchema";

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

export const ruleNodesToColumnProps = (
  nodes: RuleNode[],
): { formItemProps?: FormItemPropsZ; fieldProps?: Record<string, any> } => {
  if (!nodes || nodes.length === 0) return {};

  const enabled = nodes.filter((n) => n.enabled);

  const formItemProps: Partial<FormItemProps> = {};
  const rules = nodesToRules(nodes);
  if (rules && rules.length) formItemProps.rules = rules as any;

  const fieldProps: Record<string, any> = {};

  const parseDateSpec = (spec: any) => {
    if (!spec) return null;
    if (typeof spec === "string") {
      const d = dayjs(spec, "YYYY-MM-DD", true);
      return d.isValid() ? d.startOf("day") : null;
    }
    if (typeof spec === "object") {
      const presetRaw = (spec.preset || spec.type || "").toString();
      const preset = presetRaw.toLowerCase();
      let base: dayjs.Dayjs = dayjs();

      if (preset === "today" || preset === RelativeDatePresets.Today.toLowerCase?.()) base = dayjs();
      else if (preset === "yesterday") base = dayjs().add(-1, "day");
      else if (preset === "tomorrow") base = dayjs().add(1, "day");
      else if (preset === (RelativeDatePresets.LastDayOfMonth as any).toLowerCase?.()) base = dayjs().endOf("month");
      else if (preset === (RelativeDatePresets.LastDayOfYear as any).toLowerCase?.()) base = dayjs().endOf("year");

      if (typeof spec.offset === "number" && spec.offset !== 0) base = base.add(spec.offset, "day");

      return base.startOf("day");
    }

    return null;
  };

  for (const node of enabled) {
    const { type, params = {} } = node;

    if (type === RuleNodeType.TextLength) {
      const { len, min, max } = params as any;
      if (typeof len === "number") fieldProps.maxLength = len;
      if (typeof max === "number") fieldProps.maxLength = Math.max(fieldProps.maxLength ?? -Infinity, max);
      if (typeof min === "number") fieldProps.minLength = Math.min(fieldProps.minLength ?? min, min);
    }

    if (type === RuleNodeType.NumericRange) {
      const { min, max } = params as any;
      if (typeof min === "number") fieldProps.min = min;
      if (typeof max === "number") fieldProps.max = max;
    }

    // if (type === RuleNodeType.Decimal) {
    //   const prec = (params && (params.precision ?? params.decimals ?? params.scale)) as number | undefined;
    //   if (typeof prec === "number" && prec >= 0) {
    //     fieldProps.precision = prec;
    //     fieldProps.step = Number((1 / Math.pow(10, prec)).toFixed(prec));
    //   }
    // }

    if (type === RuleNodeType.TextRegexPattern) {
      const { pattern } = params as any;
      if (pattern) fieldProps.pattern = pattern;
    }

    if (type === RuleNodeType.DateRange) {
      const { minDate, maxDate } = params as any;
      const min = parseDateSpec(minDate);
      const max = parseDateSpec(maxDate);
      if (min) fieldProps.minDate = min.format("YYYY-MM-DD");
      if (max) fieldProps.maxDate = max.format("YYYY-MM-DD");

      fieldProps.disabledDate = (current: any) => {
        if (!current) return false;
        const d = dayjs(current);
        if (!d.isValid()) return false;
        if (min && d.isBefore(min, "day")) return true;
        if (max && d.isAfter(max, "day")) return true;
        return false;
      };
    }
  }

  const result: { formItemProps?: FormItemPropsZ; fieldProps?: Record<string, any> } = {};
  if (formItemProps.rules && formItemProps.rules.length > 0) result.formItemProps = formItemProps as any;
  if (Object.keys(fieldProps).length > 0) result.fieldProps = fieldProps;

  return result;
};

export const selectCurrentColumnProps = createSelector(selectRuleNodes, (nodes) =>
  ruleNodesToColumnProps(nodes),
);