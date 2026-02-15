import { type ProFieldValueType } from '@ant-design/pro-components';

export const VALUE_TYPE_ENUM_MAP: Record<string, ProFieldValueType> = {
  number: 'digit',
  string: 'text',
  boolean: 'switch',
  enum: 'select',
};

export const ValueTyps = [
  { label: '文本', value: 'text' },
  { label: '文本域', value: 'textarea' },
  { label: '密码', value: 'password' },
  { label: '数字', value: 'digit' },
  { label: '日期', value: 'date' },
  { label: '日期时间', value: 'dateTime' },
  { label: '日期范围', value: 'dateRange' },
  { label: '时间', value: 'time' },
  { label: '下拉选择', value: 'select' },
  { label: '多选', value: 'checkbox' },
  { label: '单选', value: 'radio' },
  { label: '开关', value: 'switch' },
  { label: '进度条', value: 'progress' },
  { label: '百分比', value: 'percent' },
  { label: '金额', value: 'money' },
];
