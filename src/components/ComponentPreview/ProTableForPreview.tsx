import React from "react";
import { Dropdown } from "antd";
import type { MenuProps } from "antd";
import { ProTable } from "@ant-design/pro-components";
import type {
  ComponentType,
  NodeRef,
  ProCommonColumn,
  SchemaField,
} from "@/types";
import { mapProCommonColumnToProps } from "@/store/componentTree/mapProCommonColumnToProps";
import {
  componentNodesSelectors,
  entityModelSelectors,
} from "@/store/componentTree/componentTreeSelectors";
import {
  componentTreeActions,
  makeColumnId,
} from "@/store/componentTree/componentTreeSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { createProCommonColumnFromSchemeField } from "@/components/SchemaBuilderModal/useAutoFillByDataIndex";
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

type ColumnTitleMenuProps = {
  title: React.ReactNode;
  column: ProCommonColumn;
  columnIndex: number;
  columnsLength: number;
  tableNodeId?: string;
  entityFields: SchemaField[];
};

type SearchFormItemMenuProps = {
  column: ProCommonColumn;
  columnIndex: number;
  columnsLength: number;
  tableNodeId?: string;
  entityFields: SchemaField[];
  children: React.ReactNode;
};

const ColumnTitleMenu: React.FC<ColumnTitleMenuProps> = ({
  title,
  column,
  columnIndex,
  columnsLength,
  tableNodeId,
  entityFields,
}) => {
  const dispatch = useAppDispatch();
  const [isHovered, setIsHovered] = React.useState(false);
  const canOperate = !!tableNodeId;

  const insertItems = React.useMemo<MenuProps["items"]>(() => {
    if (!entityFields.length) {
      return [{ key: "insert:empty", label: "暂无字段", disabled: true }];
    }

    return entityFields.map((field) => ({
      key: `insert:${field.key}`,
      label: field.key,
    }));
  }, [entityFields]);

  const menuItems = React.useMemo<MenuProps["items"]>(
    () => [
      { key: "edit", label: "编辑该列", disabled: !canOperate },
      { key: "delete", label: "删除该列", disabled: !canOperate },
      {
        key: "insert",
        label: "在后方新增一列",
        disabled: !canOperate,
        children: insertItems,
      },
    ],
    [canOperate, insertItems],
  );

  const handleMenuClick = React.useCallback<NonNullable<MenuProps["onClick"]>>(
    ({ key, domEvent }) => {
      domEvent.stopPropagation();
      if (!tableNodeId) return;
      if (!column.key) return;

      dispatch(componentTreeActions.selectNode(tableNodeId));

      if (key === "edit") {
        dispatch(componentTreeActions.startEditingColumn(column));
        return;
      }

      if (key === "delete") {
        dispatch(componentTreeActions.deleteColumnForSelectedNode(column.key));
        return;
      }

      if (typeof key === "string" && key.startsWith("insert:")) {
        const fieldKey = key.replace("insert:", "");
        const field = entityFields.find((item) => item.key === fieldKey);
        if (!field) return;

        const newColumnKey = makeColumnId();
        dispatch(
          componentTreeActions.upsertColumnOfSelectedNode({
            key: newColumnKey,
            ...createProCommonColumnFromSchemeField(field),
          }),
        );

        const fromIndex = columnsLength;
        const toIndex = Math.min(columnIndex + 1, columnsLength);
        if (fromIndex !== toIndex) {
          dispatch(
            componentTreeActions.moveColumnForSelectedNode({
              from: fromIndex,
              to: toIndex,
            }),
          );
        }
      }
    },
    [column, columnIndex, columnsLength, dispatch, entityFields, tableNodeId],
  );

  const titleNode = title ?? column.title ?? column.dataIndex ?? "列";

  return (
    <Dropdown
      trigger={["hover"]}
      placement="bottomLeft"
      menu={{ items: menuItems, onClick: handleMenuClick }}
      overlayStyle={{ minWidth: "240px" }}
    >
      <div
        style={{
          cursor: canOperate ? "context-menu" : "default",
          display: "flex",
          alignItems: "center",
          width: "100%",
          height: "100%",
          padding: "4px 6px",
          borderRadius: 4,
          border: `1px solid ${isHovered ? "#1677ff" : "transparent"}`,
          background: isHovered ? "rgba(22, 119, 255, 0.08)" : "transparent",
          transition: "border-color 0.15s ease, background-color 0.15s ease",
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={(event) => event.stopPropagation()}
      >
        {titleNode}
      </div>
    </Dropdown>
  );
};

const SearchFormItemMenu: React.FC<SearchFormItemMenuProps> = ({
  column,
  columnIndex,
  columnsLength,
  tableNodeId,
  entityFields,
  children,
}) => {
  const dispatch = useAppDispatch();
  const [isHovered, setIsHovered] = React.useState(false);
  const canOperate = !!tableNodeId;

  const insertItems = React.useMemo<MenuProps["items"]>(() => {
    if (!entityFields.length) {
      return [{ key: "insert:empty", label: "暂无字段", disabled: true }];
    }

    return entityFields.map((field) => ({
      key: `insert:${field.key}`,
      label: field.key,
    }));
  }, [entityFields]);

  const menuItems = React.useMemo<MenuProps["items"]>(
    () => [
      { key: "edit", label: "编辑列", disabled: !canOperate },
      {
        key: "insert",
        label: "在后方添加列",
        disabled: !canOperate,
        children: insertItems,
      },
      { key: "delete", label: "删除列", disabled: !canOperate },
      { key: "hide", label: "隐藏表单项", disabled: !canOperate },
      { key: "rules", label: "数据校验规则", disabled: !canOperate },
    ],
    [canOperate, insertItems],
  );

  const handleMenuClick = React.useCallback<NonNullable<MenuProps["onClick"]>>(
    ({ key, domEvent }) => {
      domEvent.stopPropagation();
      if (!tableNodeId) return;
      if (!column.key) return;

      dispatch(componentTreeActions.selectNode(tableNodeId));

      if (key === "edit" || key === "rules") {
        dispatch(componentTreeActions.startEditingColumn(column));
        return;
      }

      if (key === "delete") {
        dispatch(componentTreeActions.deleteColumnForSelectedNode(column.key));
        return;
      }

      if (key === "hide") {
        dispatch(
          componentTreeActions.upsertColumnOfSelectedNode({
            key: column.key,
            hideInSearch: true,
          }),
        );
        return;
      }

      if (typeof key === "string" && key.startsWith("insert:")) {
        const fieldKey = key.replace("insert:", "");
        const field = entityFields.find((item) => item.key === fieldKey);
        if (!field) return;

        const newColumnKey = makeColumnId();
        dispatch(
          componentTreeActions.upsertColumnOfSelectedNode({
            key: newColumnKey,
            ...createProCommonColumnFromSchemeField(field),
          }),
        );

        const fromIndex = columnsLength;
        const toIndex = Math.min(columnIndex + 1, columnsLength);
        if (fromIndex !== toIndex) {
          dispatch(
            componentTreeActions.moveColumnForSelectedNode({
              from: fromIndex,
              to: toIndex,
            }),
          );
        }
      }
    },
    [
      column,
      columnIndex,
      columnsLength,
      dispatch,
      entityFields,
      tableNodeId,
    ],
  );

  return (
    <Dropdown
      trigger={["hover"]}
      placement="bottomLeft"
      menu={{ items: menuItems, onClick: handleMenuClick }}
      overlayStyle={{ minWidth: "240px" }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "stretch",
          width: "100%",
          height: "100%",
          padding: "4px 6px",
          borderRadius: 4,
          border: `1px solid ${isHovered ? "#1677ff" : "transparent"}`,
          background: isHovered ? "rgba(22, 119, 255, 0.08)" : "transparent",
          transition: "border-color 0.15s ease, background-color 0.15s ease",
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={(event) => event.stopPropagation()}
      >
        <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
      </div>
    </Dropdown>
  );
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
      const originRenderFormItem = normalizedColumn.renderFormItem;
      if (typeof normalizedColumn.title !== "function") {
        normalizedColumn.title = (
          <ColumnTitleMenu
            title={normalizedColumn.title}
            column={column}
            columnIndex={index}
            columnsLength={columns.length}
            tableNodeId={__previewNodeId}
            entityFields={entityFields}
          />
        );
      }

      normalizedColumn.renderFormItem = (item, config, form) => {
        const content = originRenderFormItem
          ? originRenderFormItem(item, config, form)
          : typeof config?.defaultRender === "function"
            ? config.defaultRender(item)
            : null;

        return (
          <SearchFormItemMenu
            column={column}
            columnIndex={index}
            columnsLength={columns.length}
            tableNodeId={__previewNodeId}
            entityFields={entityFields}
          >
            {content}
          </SearchFormItemMenu>
        );
      };

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
