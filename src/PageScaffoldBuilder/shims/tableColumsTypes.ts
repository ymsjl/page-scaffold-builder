export type ProValueEnum = Record<string, { text: string; status?: string; color?: string }>; 

export interface ProCommonColumn {
  title: string;
  dataIndex: string;
  key?: string;
  valueType?: string;
  width?: number;
  hideInSearch?: boolean;
  hideInTable?: boolean;
  valueEnum?: ProValueEnum;
}

export type ColumnSchema = ProCommonColumn;
