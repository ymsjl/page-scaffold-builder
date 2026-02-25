import React from 'react';
import { ProTable } from '@ant-design/pro-components';
import type { ProColumns } from '@ant-design/pro-components';
import { isNodeRef } from '@/types';
import type { NodeRef, ProCommonColumn } from '@/types';
import { mapProCommonColumnToProps } from '@/store/mapProCommonColumnToProps';
import { generateDataSource } from './mapValueTypeToValue';
import { useRenderNodeRefs } from '../propResolvers';

type ProTableProps = React.ComponentProps<typeof ProTable>;

export type SerializableProTableProps = Omit<ProTableProps, 'columns'> & {
  columns?: ProCommonColumn[];
  rowActions?: NodeRef[];
};

const ProTableForPurePreview: React.FC<SerializableProTableProps> = (props) => {
  const { columns = [], rowActions, toolbar, ...restProps } = props;
  const renderedRowActions = useRenderNodeRefs(rowActions ?? []);
  const toolbarActionRefs = React.useMemo(() => {
    const rawActions = toolbar?.actions;
    if (Array.isArray(rawActions)) {
      return (rawActions as unknown[]).filter(isNodeRef) as NodeRef[];
    }
    if (isNodeRef(rawActions)) {
      return [rawActions];
    }
    return [] as NodeRef[];
  }, [toolbar?.actions]);
  const renderedToolbarActions = useRenderNodeRefs(toolbarActionRefs);

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

  const mergedToolbar = React.useMemo(() => {
    if (!toolbar) return undefined;
    return {
      ...toolbar,
      actions: renderedToolbarActions,
    };
  }, [renderedToolbarActions, toolbar]);

  return (
    <ProTable
      {...restProps}
      columns={mergedColumns}
      dataSource={dataSource}
      toolbar={mergedToolbar}
    />
  );
};

export default ProTableForPurePreview;
