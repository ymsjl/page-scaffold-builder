import type { ProCommonColumn } from "@/types";

export const mapValueTypeToValue = (col: ProCommonColumn) => {
  switch (col.valueType) {
    case "text":
      return "示例文本";
    case "digit":
      return 123;
    case "date":
      return "2024-01-01";
    case "dateTime":
      return "2024-01-01 12:00:00";
    case "time":
      return "12:00:00";
    case "money":
      return "¥100.00";
    case "select":
      return Object.keys(col.valueEnum || {}).length > 0
        ? Object.keys(col.valueEnum || {})[0]
        : "选项1";
    default:
      return "示例值";
  }
};

export const generateDataSource = (columns: ProCommonColumn[]) => {
  return columns.reduce((acc, col) => {
    acc[col.dataIndex as string] = mapValueTypeToValue(col);
    return acc;
  }, {} as Record<string, unknown>);
}