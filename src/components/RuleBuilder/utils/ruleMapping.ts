import {
  DateRangeParamsSchema,
  RelativeDatePresets,
  RuleNode,
  RuleNodeType,
  RuleParamsAbsoluteDateSchema,
  RuleParamsDate,
  RuleParamsOfTextLengthSchema,
  RuleParamsRelativeDateSchema,
} from "../RuleParamsDateSchema";

export const buildDefaultMessage = (
  node: Pick<RuleNode, "type" | "params">,
): string => {
  const { type, params } = node;

  const formatNumericRange = (params: Record<string, any>) => {
    const { success, data, error } =
      RuleParamsOfTextLengthSchema.safeParse(params);
    if (!success) return error.message;
    const { min, max } = data;
    if (min !== undefined && max !== undefined)
      return `该数字需在 ${min}-${max} 之间`;
    if (min !== undefined) return `该数字需不小于 ${min}`;
    if (max !== undefined) return `该数字需不大于 ${max}`;
    return `不符合要求`;
  };

  const formatLength = (params: Record<string, any>) => {
    const { success, data, error } =
      RuleParamsOfTextLengthSchema.safeParse(params);
    if (!success) return error.message;
    const { min, max, len } = data;

    if (len !== undefined) return `长度需为 ${len}`;
    if (min !== undefined && max !== undefined)
      return `长度需在 ${min}-${max} 之间`;
    if (min !== undefined) return `长度需至少 ${min}`;
    if (max !== undefined) return `长度需不超过 ${max}`;
    return "长度不符合要求";
  };

  const formatDateRange = (params?: Record<string, any>) => {
    const { success, data, error } = DateRangeParamsSchema.safeParse(params);
    if (!success) return error.message;
    const { minDate, maxDate } = data;

    if (minDate && maxDate)
      return `日期需在 ${stringifyDateSpec(minDate)} - ${stringifyDateSpec(maxDate)} 之间`;
    if (minDate) return `日期需不早于 ${stringifyDateSpec(minDate)}`;
    if (maxDate) return `日期需不晚于 ${stringifyDateSpec(maxDate)}`;
    return "日期不符合要求";
  };

  switch (type) {
    case RuleNodeType.Required:
      return "此字段为必填项";
    case RuleNodeType.TextLength:
      return formatLength(params);
    case RuleNodeType.NumericRange:
      return formatNumericRange(params);
    case RuleNodeType.TextRegexPattern:
      return "格式不正确";
    case RuleNodeType.DateRangeSpan:
      return "日期跨度不符合要求";
    case RuleNodeType.DateRange:
      return formatDateRange(params);
    default:
      return "校验未通过";
  }
};


// helper to display date spec (absolute or relative) in messages
function stringifyDateSpec(s?: RuleParamsDate) {
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


