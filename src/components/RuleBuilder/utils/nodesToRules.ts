import dayjs from "dayjs";
import {
  RuleNode,
  RelativeDatePresets,
  RuleNodeType,
  RuleParamsOfTextLengthSchema,
  RuleParamsOfNumericRangeSchema,
  RuleParamsOfPatternSchema,
  DateRangeParamsSchema,
} from "../RuleParamsDateSchema";
import { buildDefaultMessage } from "./ruleMapping";
import type { FormItemProps } from "antd";

export type AntdRule = Exclude<FormItemProps["rules"], undefined>[number];

export const nodesToRules = (nodes: RuleNode[] = []): AntdRule[] => {
  const parseDateSpec = (spec: any) => {
    if (!spec) return null;
    // absolute date string
    if (typeof spec === "string") {
      const d = dayjs(spec, "YYYY-MM-DD", true);
      return d.isValid() ? d.startOf("day") : null;
    }

    // relative-like object
    if (typeof spec === "object") {
      // support both old shape { type: 'relative', preset: 'today' } and new enums
      const presetRaw = (spec.preset || spec.type || "").toString();
      const preset = presetRaw.toLowerCase();
      let base: dayjs.Dayjs = dayjs();

      if (
        preset === "today" ||
        preset === RelativeDatePresets.Today.toLowerCase?.()
      )
        base = dayjs();
      else if (preset === "yesterday") base = dayjs().add(-1, "day");
      else if (preset === "tomorrow") base = dayjs().add(1, "day");
      else if (
        preset === (RelativeDatePresets.LastDayOfMonth as any).toLowerCase?.()
      )
        base = dayjs().endOf("month");
      else if (
        preset === (RelativeDatePresets.LastDayOfYear as any).toLowerCase?.()
      )
        base = dayjs().endOf("year");

      if (typeof spec.offset === "number" && spec.offset !== 0) {
        base = base.add(spec.offset, "day");
      }

      return base.startOf("day");
    }

    return null;
  };

  const result = nodes
    .filter((node) => node.enabled)
    .map((node) => {
      try {
        const message = node.message || buildDefaultMessage(node);
        const { type, params } = node;
        // required
        if (node.type === RuleNodeType.Required) {
          return { required: true, message } as AntdRule;
        }

        // text length
        if (node.type === RuleNodeType.TextLength) {
          const { min, max, len } = RuleParamsOfTextLengthSchema.parse(params);
          const r: any = { message, type: "string" };
          if (len !== undefined) r.len = len;
          if (min !== undefined) r.min = min;
          if (max !== undefined) r.max = max;
          return r as AntdRule;
        }

        // numeric range
        if (node.type === RuleNodeType.NumericRange) {
          const { min, max } = RuleParamsOfNumericRangeSchema.parse(params);
          const r: any = { message, type: "number" };
          if (min !== undefined) r.min = min;
          if (max !== undefined) r.max = max;
          return r as AntdRule;
        }

        // regex pattern
        if (node.type === RuleNodeType.TextRegexPattern) {
          const { pattern } = RuleParamsOfPatternSchema.parse(params);
          const r: any = { message };
          if (pattern) r.pattern = new RegExp(pattern);
          return r as AntdRule;
        }

        if (node.type === RuleNodeType.DateRange) {
          const { minDate, maxDate, operator } =
            DateRangeParamsSchema.parse(params);
          const min = parseDateSpec(minDate);
          const max = parseDateSpec(maxDate);

          const validator = async (_rule: any, value: any) => {
            // empty values are validated by `required` rule
            if (value === undefined || value === null || value === "")
              return Promise.resolve();
            const v = dayjs(value, "YYYY-MM-DD", true);
            if (!v.isValid()) return Promise.reject(new Error(message));

            if (operator === "gte") {
              if (min && v.isBefore(min, "day"))
                return Promise.reject(new Error(message));
              return Promise.resolve();
            }
            if (operator === "lte") {
              if (max && v.isAfter(max, "day"))
                return Promise.reject(new Error(message));
              return Promise.resolve();
            }

            if (min && v.isBefore(min, "day"))
              return Promise.reject(new Error(message));
            if (max && v.isAfter(max, "day"))
              return Promise.reject(new Error(message));
            return Promise.resolve();
          };

          return { validator, message } as AntdRule;
        }
      } catch (error) {
        debugger;
      }
      return {} as AntdRule;
    })
    .filter((rule) => Object.keys(rule).length > 0);

  return result as AntdRule[];
};
