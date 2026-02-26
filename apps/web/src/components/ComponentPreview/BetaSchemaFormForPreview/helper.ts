import type { ProCommonColumn } from '@/types';
import { type NormalizedFormColumn } from './BetaSchemaFormForPreview';

export const getColumnDragId = (column: ProCommonColumn, index: number) => {
  const dataIndex = Array.isArray(column.dataIndex) ? column.dataIndex.join('.') : column.dataIndex;
  return String(column.key ?? dataIndex ?? `form-item-${index}`);
};

export const getFormItemPropsObject = (column: NormalizedFormColumn) => {
  const { formItemProps } = column;
  if (!formItemProps || typeof formItemProps === 'function') {
    return {} as Record<string, any>;
  }

  return formItemProps as Record<string, any>;
};

export const getFieldName = (column: NormalizedFormColumn, index: number) => {
  const formItemProps = getFormItemPropsObject(column);
  const formItemName = formItemProps.name;
  if (Array.isArray(formItemName)) return formItemName;
  if (typeof formItemName === 'string' && formItemName.length > 0) return formItemName;

  const { dataIndex } = column;
  if (Array.isArray(dataIndex)) return dataIndex;
  if (typeof dataIndex === 'string' && dataIndex.length > 0) return dataIndex;

  return String(column.key ?? `form-item-${index}`);
};

export const getFieldLabel = (column: NormalizedFormColumn, fallbackName: string | string[]) => {
  const formItemProps = getFormItemPropsObject(column);
  const fallbackText = Array.isArray(fallbackName) ? fallbackName.join('.') : fallbackName;
  return formItemProps.label ?? column.title ?? fallbackText;
};

export const getSelectOptions = (column: NormalizedFormColumn) => {
  const fieldProps = (column.fieldProps ?? {}) as Record<string, unknown>;
  if (Array.isArray(fieldProps.options)) {
    return fieldProps.options;
  }

  if (!column.valueEnum || typeof column.valueEnum !== 'object') {
    return undefined;
  }

  return Object.entries(column.valueEnum).map(([value, option]) => {
    const optionObject = option as { text?: string };
    return {
      value,
      label: optionObject.text ?? value,
    };
  });
};
