import dayjs from "dayjs";
import {
  RelativeDatePresets,
  RuleNode,
  RuleNodeType,
  RuleParamsAbsoluteDateSchema,
  RuleParamsDate,
  RuleParamsRelativeDateSchema,
} from "../RuleParamsDateSchema";

export const normalizeType = (node: RuleNode): RuleNodeType | null => {
  const rawType = (node as any).type;
  if (typeof rawType === "number") return rawType as RuleNodeType;
  if (typeof rawType === "string") {
    if (rawType === "dateRange") return RuleNodeType.DateRange;
    if (rawType === "range") {
      const valueType = (node as any).params?.valueType;
      if (valueType === "date") return RuleNodeType.DateRange;
      return RuleNodeType.NumericRange;
    }
  }
  return null;
};

export function stringifyDateSpec(s?: RuleParamsDate) {
  if (!s) return "";
  const parsedAbsoluteData = RuleParamsAbsoluteDateSchema.safeParse(s);
  if (parsedAbsoluteData.success) return parsedAbsoluteData.data;

  const parsedRelativeData = RuleParamsRelativeDateSchema.safeParse(s);
  if (!parsedRelativeData.success) return "";
  const r = parsedRelativeData.data;
  const offsetPeffix = r.offset > 0 ? "后" : "前";
  const presetText = {
    [RelativeDatePresets.Today]: "今天",
    [RelativeDatePresets.LastDayOfMonth]: "本月最后一天",
    [RelativeDatePresets.LastDayOfYear]: "今年最后一天",
  }[r.preset];
  return r.offset
    ? `${presetText}${Math.abs(r.offset)}天${offsetPeffix}`
    : presetText;
}

export function parseValueDate(value: any) {
  if (!value) return null;
  if (dayjs.isDayjs(value))
    return value.isValid() ? value.startOf("day") : null;
  if (typeof value === "string") {
    const d = dayjs(value, "YYYY-MM-DD", true);
    return d.isValid() ? d.startOf("day") : null;
  }
  const d = dayjs(value);
  return d.isValid() ? d.startOf("day") : null;
}
