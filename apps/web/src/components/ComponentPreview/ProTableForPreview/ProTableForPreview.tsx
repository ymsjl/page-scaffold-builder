import React from "react";
import { ProTable } from "@ant-design/pro-components";
import type { NodeRef, ProCommonColumn } from "@/types";
import { mapProCommonColumnToProps } from "@/store/componentTree/mapProCommonColumnToProps";
import { componentNodesSelectors, entityModelSelectors } from "@/store/componentTree/componentTreeSelectors";
import { useAppSelector } from "@/store/hooks";
import { ColumnTitleMenu } from "./ColumnTitleMenu";
import { ColumnCellSlot } from "./ColumnCellSlot";

type ProTableProps = React.ComponentProps<typeof ProTable>;

type PreviewExtras = {
  __previewNodeId?: string;
};

export type SerializableProTableProps = Omit<ProTableProps, "columns"> &
  PreviewExtras & {
    columns?: ProCommonColumn[];
    rowActions?: NodeRef[];
  };

const ProTableForPreview: React.FC<SerializableProTableProps> = (props) => {
  const { __previewNodeId, columns = [], rowActions, ...restProps } = props;
  const tableNode = useAppSelector((state) =>
    __previewNodeId
      ? (componentNodesSelectors.selectById(state, __previewNodeId) as
        | { props?: { entityModelId?: string } }
        | undefined)
      : undefined,
  );
  const entityModel = useAppSelector((state) => {
    const entityModelId = tableNode?.props?.entityModelId;
    return entityModelId
      ? entityModelSelectors.selectById(state, entityModelId)
      : null;
  });
  const entityFields = entityModel?.fields ?? [];
  // 根据组件的 columns 属性，自动生成自动生成 dataSource 属性
  const dataSource = [
    columns.reduce(
      (acc, col) => {
        acc[col.dataIndex as string] = mapValueTypeToValue(col);
        return acc;
      },
      {} as Record<string, unknown>,
    ),
  ];

  const mergedColumns = React.useMemo(() => {
    if (!Array.isArray(columns)) return columns;
    return columns.map((column, index) => {
      const normalizedColumn = mapProCommonColumnToProps(column);
      if (typeof normalizedColumn.title !== "function") {
        normalizedColumn.title = (
          <ColumnTitleMenu
            column={column}
            columnIndex={index}
            columnsLength={columns.length}
            tableNodeId={__previewNodeId}
            entityFields={entityFields}
          >
            {normalizedColumn.title}
          </ColumnTitleMenu>
        );
      }

      if (typeof normalizedColumn.formItemProps !== "function") {
        normalizedColumn.formItemProps = {
          ...normalizedColumn.formItemProps,
          label:
            <ColumnTitleMenu
              column={column}
              columnIndex={index}
              columnsLength={columns.length}
              tableNodeId={__previewNodeId}
              entityFields={entityFields}
            >
              {normalizedColumn?.formItemProps?.label ?? column.title}
            </ColumnTitleMenu>
        };
      }

      if (__previewNodeId && normalizedColumn.valueType === "option") {
        normalizedColumn.render = () => (
          <ColumnCellSlot
            targetNodeId={__previewNodeId}
            acceptTypes={["Button"]}
            nodeRefs={rowActions || []}
            propPath="rowActions"
          />
        );
      }

      return normalizedColumn;
    });
  }, [columns, __previewNodeId, entityFields, rowActions]);

  return (
    <ProTable {...restProps} columns={mergedColumns} dataSource={dataSource} />
  );
};

export default ProTableForPreview;

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
};

