export type ProValueEnum = Record<string, { text: string; status?: string; color?: string }>;

export interface ProCommonColumn {
  title: string;
  dataIndex: string;
  key?: string;
  valueType?: string;
  type?: string;
  width?: number;
  hideInSearch?: boolean;
  hideInTable?: boolean;
  valueEnum?: ProValueEnum;
  // form item metadata used by SchemaBuilder
  formItemProps?: {
    name?: string;
    label?: string;
    rules?: any;
  };
}

export type ColumnSchema = ProCommonColumn;
