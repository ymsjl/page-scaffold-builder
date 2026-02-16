import { RelativeDatePresets, type RuleTemplate, RuleNodeType } from './RuleParamsDateSchema';

export const RULE_LIBRARY: RuleTemplate[] = [
  {
    type: RuleNodeType.Required,
    name: '必填',
    description: '字段不能为空',
    applicableTo: ['all'],
  },
  {
    type: RuleNodeType.TextLength,
    name: '字符串长度',
    description: '限制长度范围',
    applicableTo: ['text', 'textarea', 'password'],
    defaultParams: { min: 2, max: 30, operator: 'between' },
  },
  {
    type: RuleNodeType.NumericRange,
    name: '数字范围',
    description: '限制数值范围',
    applicableTo: ['digit', 'money', 'percent'],
    defaultParams: { min: 0, max: 100, operator: 'between' },
  },
  {
    type: RuleNodeType.TextRegexPattern,
    name: '正则表达式',
    description: '正则表达式校验',
    applicableTo: ['text', 'textarea', 'password'],
    defaultParams: { pattern: '^[a-zA-Z0-9_]+$' },
  },
  {
    type: RuleNodeType.DateRange,
    name: '日期范围',
    description: '限制日期范围（开始/结束）',
    applicableTo: ['date', 'dateTime', 'dateRange'],
    defaultParams: {
      minDate: {
        preset: RelativeDatePresets.Today,
        offset: -30,
      },
      maxDate: {
        preset: RelativeDatePresets.Today,
        offset: 0,
      },
      operator: 'between',
    },
  },
  {
    type: RuleNodeType.DateRangeSpan,
    name: '日期范围跨度',
    description: '限制日期范围跨度（天数）',
    applicableTo: ['dateRange'],
    defaultParams: { minSpan: 0, maxSpan: 30, operator: 'between' },
  },
  {
    type: RuleNodeType.Decimal,
    name: '小数位数',
    description: '限制小数位数',
    applicableTo: ['digit', 'money', 'percent'],
  },
];
