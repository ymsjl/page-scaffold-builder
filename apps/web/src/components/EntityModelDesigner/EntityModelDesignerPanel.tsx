import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Flex, Input, message, Modal, Tag } from "antd";
import type { ProColumns } from "@ant-design/pro-components";
import {
  EditableProTable,
  ProForm,
  ProFormItemRender,
  ProFormText,
} from "@ant-design/pro-components";
import {
  EditOutlined,
  SaveOutlined,
  SettingOutlined,
  DeleteOutlined,
  CloseOutlined,
} from "@ant-design/icons";

import type { EntityModel, SchemaField } from "@/types";
import { SchemaFieldSchema } from "@/validation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { componentTreeActions } from "@/store/componentTree/componentTreeSlice";
import { mapParsedSqlToEntityModel } from "@/store/api/sqlMapping";
import { parseSqlToEntityModel } from "@/utils/sqlParser";
import {
  selectEditingEntityModel,
  selectIsEntityModelModalOpen,
} from "@/store/componentTree/componentTreeSelectors";

import "./styles.css";

export default function EntityModelDesignerPanel() {
  const isOpen = useAppSelector(selectIsEntityModelModalOpen);
  const [isSqlModalOpen, setIsSqlModalOpen] = useState(false);
  const [sqlInput, setSqlInput] = useState("");
  const [isParsingSql, setIsParsingSql] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [fieldEditableKeys, setFieldEditableKeys] = useState<React.Key[]>([]);
  const dispatch = useAppDispatch();
  const editingEntityModel = useAppSelector(selectEditingEntityModel);
  const [form] = ProForm.useForm<EntityModel>();

  const currentTableEditingKey = fieldEditableKeys?.length
    ? String(fieldEditableKeys[0])
    : null;
  const isTableEditing = Boolean(currentTableEditingKey);
  const isOpenPrevRef = React.useRef(isOpen);

  useEffect(() => {
    if (isOpen && !isOpenPrevRef.current) {
      form.setFieldsValue({ ...editingEntityModel });
    }
  }, [isOpen, editingEntityModel, form]);

  const primaryKey = ProForm.useWatch("primaryKey", form);

  useEffect(() => {
    isOpenPrevRef.current = isOpen;
  }, [isOpen]);

  const setAsPrimaryKey = useCallback(
    (key: string) => {
      const nextKey = String(key || "").trim();
      if (!nextKey) {
        message.warning("请先填写字段 key");
        return;
      }
      form.setFieldValue("primaryKey", nextKey);
      message.success(`已设置主键：${nextKey}`);
    },
    [form],
  );

  const onClose = useCallback(() => {
    dispatch(componentTreeActions.closeEntityModelModal());
  }, [dispatch]);

  const handleSaveEntity = useCallback(() => {
    if (isTableEditing) {
      message.warning("请先完成当前行编辑");
      return;
    }

    if (editingId) {
      message.warning("请先完成字段高级编辑");
      return;
    }

    dispatch(
      componentTreeActions.applyEntityModelChange(form.getFieldsValue()),
    );
    message.success("已保存");
    onClose();
  }, [editingId, onClose, isTableEditing, form]);

  const handleOpenSqlModal = useCallback(() => {
    setSqlInput("");
    setIsSqlModalOpen(true);
  }, []);

  const handleImportSql = useCallback(async () => {
    const trimmed = sqlInput.trim();
    if (!trimmed) {
      message.warning("请输入 SQL 建表语句");
      return;
    }

    try {
      setIsParsingSql(true);
      const response = await parseSqlToEntityModel(trimmed);
      const entity = mapParsedSqlToEntityModel(response.model);
      dispatch(componentTreeActions.applyEntityModelChange(entity));
      if (response.warnings?.length) {
        message.warning(response.warnings.join("\n"));
      } else {
        message.success("SQL 解析完成，已生成实体模型");
      }
      setIsSqlModalOpen(false);
    } catch (error) {
      message.error((error as Error)?.message || "SQL 解析失败");
    } finally {
      setIsParsingSql(false);
    }
  }, [dispatch, sqlInput]);

  const fieldTableColumns = useMemo<ProColumns<SchemaField>[]>(() => {
    return [
      {
        title: "字段名",
        dataIndex: "title",
        width: 200,
        ellipsis: true,
        fieldProps: { style: { width: "100%" } },
        formItemProps: {
          rules: [
            { required: true, whitespace: true, message: "请输入字段名" },
          ],
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
                    setAsPrimaryKey(item.key);
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
        valueEnum: {
          text: { text: "text" },
          number: { text: "number" },
          money: { text: "money" },
          boolean: { text: "boolean" },
          enum: { text: "enum" },
          date: { text: "date" },
          datetime: { text: "datetime" },
        },
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
    ];
  }, [
    currentTableEditingKey,
    isTableEditing,
    primaryKey,
    setEditingId,
    setFieldEditableKeys,
  ]);

  return (
    <>
      <Modal
        open={isOpen}
        onCancel={onClose}
        width="1200px"
        title="实体类型设计器"
        destroyOnClose
        afterClose={() => form.resetFields()}
        onOk={handleSaveEntity}
        okText="保存"
      >
        <Flex justify="flex-end" style={{ marginBottom: 12 }}>
          <Button onClick={handleOpenSqlModal}>从 SQL 导入</Button>
        </Flex>
        <ProForm<EntityModel>
          grid
          labelAlign="left"
          form={form}
          submitter={false}
        >
          <ProFormText
            label="title"
            name="title"
            tooltip="展示名称（用于页面/字段面板提示）"
            placeholder="例如：用户"
            colProps={{ xs: 12 }}
          />
          <ProFormText
            label="name"
            name="name"
            tooltip="程序化标识（用于生成 TS 类型名，建议英文/驼峰）"
            placeholder="例如：User"
            colProps={{ xs: 12 }}
          />
          <ProFormText label="primaryKey" name="primaryKey" hidden />
          <ProFormItemRender
            name="fields"
            label="字段列表"
            layout="vertical"
            tooltip="定义该实体类型包含的字段"
            style={{ width: "100%" }}
          >
            {(props) => (
              <EditableProTable<SchemaField>
                rowKey="id"
                size="small"
                columns={fieldTableColumns.concat([
                  {
                    title: "操作",
                    valueType: "option",
                    width: 280,
                    render: (_, item, _index, action) => {
                      const isComplex = ["object", "array"].includes(
                        String(item.valueType || ""),
                      );
                      const itemId = String(item.id);
                      const disableEditBtn =
                        isTableEditing &&
                        String(currentTableEditingKey) !== itemId;

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
                            // TODO 打开高级编辑弹窗
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
                                const next = (
                                  (props.value as SchemaField[]) || []
                                ).filter((r) => r.id !== itemId);
                                props.onChange?.(next);
                              },
                            });
                          }}
                        >
                          删除
                        </Button>,
                      ].filter(Boolean);
                    },
                  },
                ])}
                tableLayout="fixed"
                value={props.value || []}
                bordered
                onChange={(nextFields) =>
                  props.onChange && props.onChange(nextFields)
                }
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
                      record: () => {
                        const newField: SchemaField = {
                          id: `field_${Math.random().toString(36).slice(2, 9)}`,
                          key: "",
                          title: "",
                          valueType: "text",
                          isNullable: false,
                          isUnique: false,
                          isFilterable: true,
                          isAutoGenerate: false,
                          description: "",
                          defaultValue: undefined,
                          extra: {},
                        };
                        return newField;
                      },
                    }
                }
                pagination={false}
                locale={{ emptyText: "暂无字段，请点击“添加字段”" }}
                editable={{
                  type: "single",
                  editableKeys: fieldEditableKeys,
                  onChange: (keys) =>
                    setFieldEditableKeys((keys || []).slice(0, 1)),
                  actionRender: (row, _config, defaultDom) => {
                    const saveDom = React.isValidElement(defaultDom.save)
                      ? React.cloneElement(defaultDom.save as any, {
                        children: (
                          <Button
                            size="small"
                            type="primary"
                            onClick={(e) => {
                              const { error } =
                                SchemaFieldSchema.safeParse(row);
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
                      ? React.cloneElement(defaultDom.cancel as any, {
                        children: (
                          <Button
                            size="small"
                            type="default"
                            onClick={(e) => {
                              const { error } =
                                SchemaFieldSchema.safeParse(row);
                              if (error) {
                                e.preventDefault();
                                e.stopPropagation();
                                message.error(error.message);
                              }
                            }}
                          >
                            <CloseOutlined />
                            取消
                          </Button>
                        ),
                      })
                      : defaultDom.cancel;
                    return [saveDom, cancelDom];
                  },
                }}
              />
            )}
          </ProFormItemRender>
        </ProForm>
      </Modal>
      <Modal
        title="从 SQL 导入"
        open={isSqlModalOpen}
        onCancel={() => setIsSqlModalOpen(false)}
        onOk={handleImportSql}
        okText="解析并导入"
        confirmLoading={isParsingSql}
      >
        <Input.TextArea
          rows={6}
          placeholder="请输入 MySQL CREATE TABLE 语句"
          value={sqlInput}
          onChange={(event) => setSqlInput(event.target.value)}
        />
      </Modal>
    </>
  );
}
