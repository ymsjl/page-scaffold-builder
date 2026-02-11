import React, { PropsWithChildren } from "react";
import { Dropdown } from "antd";
import type { MenuProps } from "antd";
import type { ProCommonColumn, SchemaField } from "@/types";
import { componentTreeActions } from "@/store/componentTree/componentTreeSlice";
import { useAppDispatch } from "@/store/hooks";
import { createProCommonColumnFromSchemeField } from "@/components/SchemaBuilderModal/useAutoFillByDataIndex";
import { DeleteOutlined, EditOutlined, EyeInvisibleOutlined, EyeOutlined, NumberOutlined, PlusOutlined } from "@ant-design/icons";

type ColumnTitleMenuProps = {
  column: ProCommonColumn;
  columnIndex: number;
  columnsLength: number;
  tableNodeId?: string;
  entityFields: SchemaField[];
};

export const ColumnTitleMenu: React.FC<PropsWithChildren<ColumnTitleMenuProps>> = ({
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
    return [
      { key: "insert:empty", label: "空列" },
      { type: "divider" },
      ...entityFields.map((field) => ({
        key: `insert:${field.key}`,
        label: field.key,
      }))];
  }, [entityFields]);

  const menuItems = React.useMemo<MenuProps["items"]>(
    () => [
      {
        key: "title",
        label: column.title || "未命名列",
        disabled: true,
      },
      {
        key: "edit",
        label: "编辑该列",
        disabled: !canOperate,
        icon: <EditOutlined />
      },
      {
        key: "delete",
        label: "删除该列",
        disabled: !canOperate,
        icon: <DeleteOutlined />
      },
      {
        key: "insert",
        label: "在后方新增一列",
        disabled: !canOperate,
        children: insertItems,
        icon: <PlusOutlined />,
      },
      {
        type: 'divider',
      },
      {
        key: "hideInSearch",
        label: column?.hideInSearch ? "显示表单项" : "隐藏表单项",
        disabled: !canOperate,
        icon: column?.hideInSearch ? <EyeOutlined /> : <EyeInvisibleOutlined />
      },
      {
        key: "hideInTable",
        label: column?.hideInTable ? "显示表格列" : "隐藏表格列",
        disabled: !canOperate,
        icon: column?.hideInTable ? <EyeOutlined /> : <EyeInvisibleOutlined />
      },
      {
        type: 'divider',
      },
      {
        key: "rules",
        label: "数据校验规则",
        disabled: !canOperate,
        icon: <NumberOutlined />
      },
    ],
    [canOperate, insertItems, column],
  );

  const handleMenuClick = React.useCallback<NonNullable<MenuProps["onClick"]>>(
    ({ key, domEvent }) => {
      domEvent.stopPropagation();
      if (!tableNodeId) return;
      if (!column.key) return;

      dispatch(componentTreeActions.selectNode(tableNodeId));

      if (key === "edit" || key === "rules") {
        dispatch(componentTreeActions.startEditingColumn(column));
      } else if (key === "delete") {
        dispatch(componentTreeActions.deleteColumnForSelectedNode(column.key));
      } else if (typeof key === "string" && key.startsWith("insert:")) {
        const fieldKey = key.replace("insert:", "");
        const field = entityFields.find((item) => item.key === fieldKey);
        const newColumn = createProCommonColumnFromSchemeField(field);
        newColumn.title = "新列";
        dispatch(componentTreeActions.upsertColumnOfSelectedNode({ insertPos: columnIndex + 1, changes: newColumn }));
      } else if (key === "hideInSearch") {
        dispatch(componentTreeActions.upsertColumnOfSelectedNode({ key: column.key, hideInSearch: !column.hideInSearch }));
      } else if (key === "hideInTable") {
        dispatch(componentTreeActions.upsertColumnOfSelectedNode({ key: column.key, hideInTable: !column.hideInTable }));
      }
    },
    [column, columnIndex, columnsLength, dispatch, entityFields, tableNodeId],
  );

  return (
    <Dropdown
      trigger={["hover"]}
      menu={{ items: menuItems, onClick: handleMenuClick }}
      overlayStyle={{ minWidth: "160px" }}
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
          border: `1px dashed ${isHovered ? "#1677ff" : "transparent"}`,
          background: isHovered ? "rgba(22, 119, 255, 0.08)" : "transparent",
          transition: "border-color 0.15s ease, background-color 0.15s ease",
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </Dropdown>
  );
};
