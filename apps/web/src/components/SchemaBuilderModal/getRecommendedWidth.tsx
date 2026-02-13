export const ColumnWidth = {
  SHORT_TEXT: 80,
  MEDIUM_TEXT: 120,
  LONG_TEXT: 240,
  QUANTITY: 100,
  DATE_ONLY: 120,
  DATE_TIME: 160,
  TIME_ONLY: 100,
  PERCENTAGE: 100,
  MEDIUM_AMOUNT: 140,
};

// 字段类型选项
export const valueTypeOptions = [
  { label: "文本", value: "text" },
  { label: "文本域", value: "textarea" },
  { label: "密码", value: "password" },
  { label: "数字", value: "digit" },
  { label: "日期", value: "date" },
  { label: "日期时间", value: "dateTime" },
  { label: "日期范围", value: "dateRange" },
  { label: "时间", value: "time" },
  { label: "下拉选择", value: "select" },
  { label: "多选", value: "checkbox" },
  { label: "单选", value: "radio" },
  { label: "开关", value: "switch" },
  { label: "进度条", value: "progress" },
  { label: "百分比", value: "percent" },
  { label: "金额", value: "money" },
];

// 根据 valueType 返回推荐宽度
export const getRecommendedWidth = (valueType: string): number => {
  const widthMap: Record<string, number> = {
    text: ColumnWidth.MEDIUM_TEXT,
    textarea: ColumnWidth.LONG_TEXT,
    password: ColumnWidth.MEDIUM_TEXT,
    digit: ColumnWidth.QUANTITY,
    date: ColumnWidth.DATE_ONLY,
    dateTime: ColumnWidth.DATE_TIME,
    dateRange: ColumnWidth.LONG_TEXT,
    time: ColumnWidth.TIME_ONLY,
    select: ColumnWidth.MEDIUM_TEXT,
    checkbox: ColumnWidth.MEDIUM_TEXT,
    radio: ColumnWidth.MEDIUM_TEXT,
    switch: ColumnWidth.SHORT_TEXT,
    progress: ColumnWidth.MEDIUM_TEXT,
    percent: ColumnWidth.PERCENTAGE,
    money: ColumnWidth.MEDIUM_AMOUNT,
  };
  return widthMap[valueType] || ColumnWidth.MEDIUM_TEXT;
};
