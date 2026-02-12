import React, { useMemo } from "react";
import { Button, Flex, message, Modal, Tag } from "antd";
import type { ProColumns } from "@ant-design/pro-components";
import { EditableProTable } from "@ant-design/pro-components";
import {
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  SaveOutlined,
  SettingOutlined,
} from "@ant-design/icons";

import type { SchemaField } from "@/types";
import { SchemaFieldSchema } from "@/validation";

import {
  createNewFieldDraft,
  FIELD_VALUE_TYPE_ENUM,
} from "./entityModelDesignerUtils";

export function EntityModelFieldsTable(props: {
  value: SchemaField[];
  onChange?: (next: SchemaField[]) => void;

  primaryKey?: string;
  onSetPrimaryKey: (key: string) => void;

  isTableEditing: boolean;
  currentTableEditingKey: string | null;
  fieldEditableKeys: React.Key[];
  setFieldEditableKeys: (keys: React.Key[]) => void;

  onOpenEnumAdvanced: (field: SchemaField) => void;
}) {
  const {
    value,
    onChange,
    primaryKey,
    onSetPrimaryKey,
    isTableEditing,
    currentTableEditingKey,
    fieldEditableKeys,
    setFieldEditableKeys,
    onOpenEnumAdvanced,
  } = props;

  const columns = useMemo<ProColumns<SchemaField>[]>(() => {
    return [
      {
        title: "字段名",
        dataIndex: "title",
        width: 200,
        ellipsis: true,
        fieldProps: { style: { width: "100%" } },
        formItemProps: {
          rules: [{ required: true, whitespace: true, message: "请输入字段名" }],
        },
        render: (_, item) => `${item.title || "(未命名)"}`,
      },
      {
        title: "key",
        dataIndex: "key",
        width: 180,
        ellipsis: true,
        fieldProps: { style: { width: "100%" } },
        formItemProps: {
          rules: [{ required: true, whitespace: true, message: "请输入 key" }],
        },
        renderText: (val) => val || "-",
        render: (node, item) => {
          return (
            <Flex style={{ width: "100%" }}>
              {node}
              {primaryKey !== item.key ? (
                <Button
                  className="set-as-pk-button"
                  size="small"
                  type="link"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSetPrimaryKey(item.key);
                  }}
                >
                  设为主键
                </Button>
              ) : (
                <Tag color="yellow">PK</Tag>
              )}
            </Flex>
          );
        },
      },
      {
        title: "valueType",
        dataIndex: "valueType",
        valueType: "select",
        width: 120,
        ellipsis: true,
        fieldProps: { style: { width: "100%" } },
        formItemProps: {
          rules: [{ required: true, whitespace: true, message: "请选择 type" }],
        },
        valueEnum: FIELD_VALUE_TYPE_ENUM,
        render: (_, item) => String(item.valueType || "text"),
      },
      {
        title: "可为 null",
        dataIndex: "isNullable",
        valueType: "switch",
        width: 72,
        align: "center",
        fieldProps: {
          checkedChildren: "是",
          unCheckedChildren: "否",
        },
      },
      {
        title: "可筛选",
        dataIndex: "isFilterable",
        valueType: "switch",
        width: 72,
        align: "center",
        fieldProps: {
          checkedChildren: "是",
          unCheckedChildren: "否",
        },
      },
      {
        title: "操作",
        valueType: "option",
        width: 280,
        render: (_, item, _index, action) => {
          const itemId = String(item.id);
          const disableEditBtn =
            isTableEditing && String(currentTableEditingKey) !== itemId;

          return [
            <Button
              key="edit"
              size="small"
              disabled={disableEditBtn}
              icon={<EditOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                const ok = action?.startEditable?.(item.id);
                if (ok === false) return;
                setFieldEditableKeys([item.id]);
              }}
            >
              编辑
            </Button>,
            <Button
              key="advEdit"
              size="small"
              icon={<SettingOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                onOpenEnumAdvanced(item);
              }}
            >
              高级
            </Button>,
            <Button
              key="del"
              danger
              icon={<DeleteOutlined />}
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                Modal.confirm({
                  title: "确认删除？",
                  content: "删除后不可恢复",
                  okText: "删除",
                  okButtonProps: { danger: true },
                  cancelText: "取消",
                  onOk: () => {
                    const next = (value || []).filter((r) => r.id !== itemId);
                    onChange?.(next);
                  },
                });
              }}
            >
              删除
            </Button>,
          ].filter(Boolean);
        },
      },
    ];
  }, [
    currentTableEditingKey,
    isTableEditing,
    onChange,
    onOpenEnumAdvanced,
    onSetPrimaryKey,
    primaryKey,
    setFieldEditableKeys,
    value,
  ]);

  return (
    <EditableProTable<SchemaField>
      rowKey="id"
      size="small"
      columns={columns}
      tableLayout="fixed"
      value={value}
      bordered
      onChange={(nextFields) => onChange?.([...(nextFields || [])])}
      search={false}
      options={false}
      ghost
      controlled
      recordCreatorProps={
        isTableEditing
          ? false
          : {
            position: "bottom",
            newRecordType: "dataSource",
            creatorButtonText: "添加一行数据",
            record: () => createNewFieldDraft(),
          }
      }
      pagination={false}
      locale={{ emptyText: "暂无字段，请点击“添加字段”" }}
      editable={{
        type: "single",
        editableKeys: fieldEditableKeys,
        onChange: (keys) => setFieldEditableKeys((keys || []).slice(0, 1)),
        actionRender: (row, _config, defaultDom) => {
          const saveDom = React.isValidElement(defaultDom.save)
            ? React.cloneElement(defaultDom.save as any, {
              children: (
                <Button
                  size="small"
                  type="primary"
                  onClick={(e) => {
                    const { error } = SchemaFieldSchema.safeParse(row);
                    if (error) {
                      e.preventDefault();
                      e.stopPropagation();
                      message.error(error.message);
                    }
                  }}
                >
                  <SaveOutlined />
                  保存
                </Button>
              ),
            })
            : defaultDom.save;

          const cancelDom = React.isValidElement(defaultDom.cancel)
            ? (() => {
              const originalCancel = defaultDom.cancel as React.ReactElement<any>;
              const originalOnClick = originalCancel.props?.onClick;
              return React.cloneElement(originalCancel, {
                children: (
                  <Button
                    size="small"
                    type="default"
                    onClick={(e) => {
                      if (typeof originalOnClick === "function") {
                        originalOnClick(e);
                      }
                    }}
                  >
                    <CloseOutlined />
                    取消
                  </Button>
                ),
              });
            })()
            : defaultDom.cancel;

          return [saveDom, cancelDom];
        },
      }}
    />
  );
}
