import dayjs from "dayjs";
import { RuleNode, RuleNodeType, DateRangeParamsSchema } from "../RuleParamsDateSchema";
import { parseDateSpec } from "../utils/dateSpec";
import DateRangeEditor from "../ruleEditors/DateRangeEditor";
import { BaseStrategy } from "./BaseStrategy";
import { stringifyDateSpec } from "./utils";
import type { AntdRule } from "./types";

export class DateRangeStrategy extends BaseStrategy {
  Editor = DateRangeEditor;

  constructor() {
    super(RuleNodeType.DateRange);
  }

  buildDefaultMessage(node: Pick<RuleNode, "type" | "params">): string {
    const { success, data, error } = DateRangeParamsSchema.safeParse(
      node.params,
    );
    if (!success) return error.message;
    const { minDate, maxDate } = data;

    if (minDate && maxDate)
      return `日期需在 ${stringifyDateSpec(minDate)} - ${stringifyDateSpec(maxDate)} 之间`;
    if (minDate) return `日期需不早于 ${stringifyDateSpec(minDate)}`;
    if (maxDate) return `日期需不晚于 ${stringifyDateSpec(maxDate)}`;
    return "日期不符合要求";
  }

  toRule(node: RuleNode, message: string): AntdRule {
    const { minDate, maxDate, operator } = DateRangeParamsSchema.parse(
      node.params,
    );
    const min = minDate && parseDateSpec(minDate);
    const max = maxDate && parseDateSpec(maxDate);

    const validator = async (_rule: any, value: any) => {
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

  applyFieldProps(node: RuleNode, fieldProps: Record<string, any>): void {
    const { minDate, maxDate } = (node.params ?? {}) as any;
    const min = parseDateSpec(minDate);
    const max = parseDateSpec(maxDate);
    if (min) fieldProps.minDate = min;
    if (max) fieldProps.maxDate = max;

    fieldProps.disabledDate = (current: any) => {
      if (!current) return false;
      const d = dayjs.isDayjs(current) ? current : dayjs(current);
      if (!d.isValid()) return false;
      if (min && d.isBefore(min, "day")) return true;
      if (max && d.isAfter(max, "day")) return true;
      return false;
    };
  }
}
