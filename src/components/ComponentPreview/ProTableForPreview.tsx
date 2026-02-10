import React from "react";
import { ProTable } from "@ant-design/pro-components";
import type { ComponentType, NodeRef, ProCommonColumn } from "@/types";
import { mapProCommonColumnToProps } from "@/store/componentTree/mapProCommonColumnToProps";
import { DropZone } from "@/components/DropZone/DropZone";
import SlotItemWrapper from "@/components/SlotItemWrapper/SlotItemWrapper";
import { useRenderNodeRefs } from "./ReactNodeRenderer";

type ProTableProps = React.ComponentProps<typeof ProTable>;

type PreviewExtras = {
  __previewNodeId?: string;
};

export type SerializableProTableProps = Omit<ProTableProps, "columns"> &
  PreviewExtras & {
    columns?: ProCommonColumn[];
    rowActions?: NodeRef[];
  };

const ColumnCellSlot: React.FC<{
  targetNodeId: string | undefined;
  acceptTypes?: ComponentType[];
  nodeRefs: NodeRef[];
  propPath: string;
}> = ({ targetNodeId, acceptTypes, nodeRefs, propPath }) => {
  const elements = useRenderNodeRefs(nodeRefs);

  if (!targetNodeId) {
    return <>{elements}</>;
  }

  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {nodeRefs.map((ref, index) => {
        const element = elements[index];
        if (!element) return null;
        return (
          <SlotItemWrapper
            key={ref.nodeId}
            nodeId={ref.nodeId}
            targetNodeId={targetNodeId}
            propPath={propPath}
          >
            {element}
          </SlotItemWrapper>
        );
      })}
      <DropZone
        id={`rowActions:${propPath}`}
        targetNodeId={targetNodeId}
        propPath={propPath}
        acceptTypes={acceptTypes}
        label="列渲染内容"
      />
    </div>
  );
};

const ProTableForPreview: React.FC<SerializableProTableProps> = (props) => {
  const {
    __previewNodeId,
    columns = [],
    rowActions,
    ...restProps
  } = props;
  // 根据组件的 columns 属性，自动生成自动生成 dataSource 属性
  const mapValueTypeToValue = (col: ProCommonColumn) => {
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
  }
  const dataSource = [
    columns.reduce((acc, col) => {
      acc[col.dataIndex as string] = mapValueTypeToValue(col);
      return acc;
    }, {} as Record<string, unknown>)
  ];

  const mergedColumns = React.useMemo(
    () => {
      if (!Array.isArray(columns)) return columns;
      return columns.map((column) => {
        const normalizedColumn = mapProCommonColumnToProps(column);
        if (!__previewNodeId || normalizedColumn.valueType !== "option") {
          return normalizedColumn;
        }

        return {
          ...normalizedColumn,
          render: () => (
            <ColumnCellSlot
              targetNodeId={__previewNodeId}
              acceptTypes={['Button']}
              nodeRefs={rowActions || []}
              propPath="rowActions"
            />
          ),
        };
      });
    },
    [columns, __previewNodeId, rowActions],
  );

  return <ProTable {...restProps} columns={mergedColumns} dataSource={dataSource} />;
};

export default ProTableForPreview;
