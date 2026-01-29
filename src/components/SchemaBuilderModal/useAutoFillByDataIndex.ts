import { useMemo, useRef, useEffect } from 'react';
import { ProFieldValueType } from '@ant-design/pro-components';
import { Form, FormInstance } from 'antd';
import { getRecommendedWidth } from './getRecommendedWidth';
import type { ProValueEnum } from '../ColumnSchemaEditorProps';
import type { SchemaField, ProCommonColumn } from '@/types';

const createProCommonColumnFromSchemeField = (field?: SchemaField): Omit<ProCommonColumn, 'key'> => {
  const result: Omit<ProCommonColumn, 'key'> & { dataIndex?: string } = {
    title: field?.title ?? '',
    dataIndex: field?.key ?? '',
    valueType: (field?.valueType || 'text') as ProFieldValueType,
    width: getRecommendedWidth(field?.valueType || 'text'),
    hideInSearch: field ? field?.isFilterable : false,
  };

  if (!field) return result;

  if (field.valueType === 'enum') {
    result.valueType = 'select';
    if (field.extra?.options && Array.isArray(field.extra?.options)) {
      result.valueEnum = field.extra.options.reduce((acc: ProValueEnum, option: any) => {
        const key = String(option.value ?? option.id);
        acc[key] = {
          text: option.label ?? String(option.value ?? option.id),
          status: option.status,
          color: option.color,
        };
        return acc;
      }, {} as ProValueEnum);
    }
  }

  return result;
};

export const useAutoFillByDataIndex = (
  form: FormInstance<Pick<ProCommonColumn, 'title' | 'dataIndex' | 'valueType' | 'width' | 'hideInSearch'>>,
  entityFields: SchemaField[]
) => {
  const prevDataIndexRef = useRef<string>();
  const dataIndexValue = Form.useWatch('dataIndex', form);

  const entityFieldMap = useMemo(() => {
    const arr = (entityFields || []).map(f => [f.key, f] as [string, SchemaField]);
    return new Map<string, SchemaField>(arr);
  }, [entityFields]);

  useEffect(() => {
    if (dataIndexValue !== prevDataIndexRef.current) {
      prevDataIndexRef.current = dataIndexValue;
      const matchedField = entityFieldMap.get(dataIndexValue);
      if (dataIndexValue !== '' && !matchedField) return;
      form.setFieldsValue(createProCommonColumnFromSchemeField(matchedField));
    }
  }, [dataIndexValue, entityFieldMap, form]);
}