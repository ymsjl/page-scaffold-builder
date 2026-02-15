import React from 'react';
import { ProTable } from '@ant-design/pro-components';
import type { ProColumns } from '@ant-design/pro-components';
import type { NodeRef, ProCommonColumn } from '@/types';
import { mapProCommonColumnToProps } from '@/store/componentTree/mapProCommonColumnToProps';
import { generateDataSource } from './mapValueTypeToValue';
import { useRenderNodeRefs } from '../ReactNodeRenderer';

type ProTableProps = React.ComponentProps<typeof ProTable>;

export type SerializableProTableProps = Omit<ProTableProps, 'columns'> & {
  columns?: ProCommonColumn[];
  rowActions?: NodeRef[];
};

const ProTableForPurePreview: React.FC<SerializableProTableProps> = (props) => {
  const { columns = [], rowActions, ...restProps } = props;
  const renderedRowActions = useRenderNodeRefs(rowActions ?? []);

  const dataSource = React.useMemo(() => {
    return [generateDataSource(columns)];
  }, [columns]);

  const mergedColumns = React.useMemo(() => {
    if (!Array.isArray(columns)) return columns as any;
    return columns.map((column) => {
      const normalizedColumn = mapProCommonColumnToProps(column) as ProColumns<Record<string, any>>;

      if (normalizedColumn.valueType === 'option') {
        normalizedColumn.render = () => (renderedRowActions.length > 0 ? renderedRowActions : null);
      }

      return normalizedColumn;
    });
  }, [columns, renderedRowActions]);

  return <ProTable {...restProps} columns={mergedColumns} dataSource={dataSource} />;
};

export default ProTableForPurePreview;
