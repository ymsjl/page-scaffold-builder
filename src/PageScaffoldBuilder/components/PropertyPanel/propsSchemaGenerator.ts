import type { ComponentType } from '../../types';
import type { PropertySchemaConfig } from './PropertyPanel';

export function getPropsSchemaByComponentType(type?: ComponentType): PropertySchemaConfig[] {
  if (!type) return [];

  if (type === 'Table') {
    return [
      { key: 'columns', title: 'Columns', dataIndex: 'columns', valueType: 'schema' },
      { key: 'rowKey', title: 'Row Key', dataIndex: 'rowKey', valueType: 'text' },
    ];
  }

  if (type === 'Container') {
    return [
      { key: 'children', title: 'Children', dataIndex: 'children', valueType: 'text' },
    ];
  }

  return [];
}
