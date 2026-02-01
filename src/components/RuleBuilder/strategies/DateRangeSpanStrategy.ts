import { RuleNode, RuleNodeType, DateRangeSpanParamsSchema } from "../RuleParamsDateSchema";
import DateRangeSpanEditor from "../ruleEditors/DateRangeSpanEditor";
import { BaseStrategy } from "./BaseStrategy";
import { parseValueDate } from "./utils";
import type { AntdRule } from "./types";

export class DateRangeSpanStrategy extends BaseStrategy {
  Editor = DateRangeSpanEditor;

  constructor() {
    super(RuleNodeType.DateRangeSpan);
  }

  buildDefaultMessage(node: Pick<RuleNode, "type" | "params">): string {
    const { success, data, error } = DateRangeSpanParamsSchema.safeParse(
      node.params,
    );
    if (!success) return error.message;
    const { minSpan, maxSpan } = data;
    if (minSpan !== undefined && maxSpan !== undefined)
      return `日期跨度需在 ${minSpan}-${maxSpan} 天之间`;
    if (minSpan !== undefined) return `日期跨度需不少于 ${minSpan} 天`;
    if (maxSpan !== undefined) return `日期跨度需不超过 ${maxSpan} 天`;
    return "日期跨度不符合要求";
  }

  toRule(node: RuleNode, message: string): AntdRule {
    const { minSpan, maxSpan, operator } = DateRangeSpanParamsSchema.parse(
      node.params,
    );
    const validator = async (_rule: any, value: any) => {
      if (!value) return Promise.resolve();
      const [startRaw, endRaw] = Array.isArray(value) ? value : [];
      const start = parseValueDate(startRaw);
      const end = parseValueDate(endRaw);
      if (!start || !end) return Promise.reject(new Error(message));
      const span = end.diff(start, "day");
      if (span < 0) return Promise.reject(new Error(message));

      if (operator === "eq") {
        const target = minSpan ?? maxSpan;
        if (target === undefined) return Promise.resolve();
        return span === target
          ? Promise.resolve()
          : Promise.reject(new Error(message));
      }
      if (operator === "gte") {
        if (minSpan !== undefined && span < minSpan)
          return Promise.reject(new Error(message));
        return Promise.resolve();
      }
      if (operator === "lte") {
        if (maxSpan !== undefined && span > maxSpan)
          return Promise.reject(new Error(message));
        return Promise.resolve();
      }

      if (minSpan !== undefined && span < minSpan)
        return Promise.reject(new Error(message));
      if (maxSpan !== undefined && span > maxSpan)
        return Promise.reject(new Error(message));
      return Promise.resolve();
    };

    return { validator, message } as AntdRule;
  }

  applyFieldProps(_node: RuleNode, _fieldProps: Record<string, any>): void {
    return undefined;
  }
}
