import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Drawer, message, Modal, Space, Tag } from 'antd';
import type { ProColumns } from '@ant-design/pro-components';
import { EditableProTable, ProForm, ProFormText } from '@ant-design/pro-components';
import type { EntityType, SchemaField } from '@/types';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { entityTypesActions } from '@/store/slices/entityTypesSlice';

import { EditOutlined, SaveOutlined, SettingOutlined, DeleteOutlined, PlusOutlined, CloseOutlined } from '@ant-design/icons';
import { SchemaFieldSchema } from '@/validation';

export type EntityTypeDesignerPanelProps = {
  open: boolean;
};

export default function EntityTypeDesignerPanel({ open }: EntityTypeDesignerPanelProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [fieldEditableKeys, setFieldEditableKeys] = useState<React.Key[]>([]);
  const dispatch = useAppDispatch();

  const editingEntityType = useAppSelector((s) => (s.entityTypes as any).editingEntityType);

  const [form] = ProForm.useForm<EntityType>();

  const currentTableEditingKey = fieldEditableKeys?.length ? String(fieldEditableKeys[0]) : null;
  const isTableEditing = Boolean(currentTableEditingKey);
  const openPrevRef = React.useRef(open);

  useEffect(() => {
    if (open && !openPrevRef.current && editingEntityType) {
      form.setFieldsValue({
        title: editingEntityType.title,
        name: editingEntityType.name,
      })
    }
  }, [open, editingEntityType, form]);

  useEffect(() => {
    openPrevRef.current = open;
  }, [open]);

  const setPrimaryKey = useCallback(
    (key: string) => {
      const nextKey = String(key || '').trim();
      if (!nextKey) {
        message.warning('请先填写字段 key');
        return;
      }
      message.success(`已设置主键：${nextKey}`);
    },
    []
  );

  const onClose = useCallback(() => {
    dispatch(entityTypesActions.closeDrawer());
    form.resetFields();
  }, [dispatch, form]);

  const handleSaveEntity = useCallback(() => {
    if (isTableEditing) {
      message.warning('请先完成当前行编辑');
      return;
    }

    if (editingId) {
      message.warning('请先完成字段高级编辑');
      return;
    }

    dispatch(entityTypesActions.finishEntityTypeChange(form.getFieldsValue()));
    message.success('已保存');
    onClose();
  }, [editingId, onClose, isTableEditing, form]);

  const fieldTableColumns = useMemo<ProColumns<SchemaField>[]>(() => {
    return [
      {
        title: '字段名',
        dataIndex: 'title',
        width: 200,
        ellipsis: true,
        fieldProps: { style: { width: '100%' } },
        formItemProps: {
          rules: [{ required: true, whitespace: true, message: '请输入字段名' }],
        },
        render: (_, item) => `${item.title || '(未命名)'}`,
      },
      {
        title: 'key',
        dataIndex: 'key',
        width: 180,
        ellipsis: true,
        fieldProps: { style: { width: '100%' } },
        formItemProps: {
          rules: [{ required: true, whitespace: true, message: '请输入 key' }],
        },
        renderText: val => val || '-',
      },
      {
        title: 'valueType',
        dataIndex: 'valueType',
        valueType: 'select',
        width: 120,
        ellipsis: true,
        fieldProps: { style: { width: '100%' } },
        formItemProps: {
          rules: [{ required: true, whitespace: true, message: '请选择 type' }],
        },
        valueEnum: {
          text: { text: 'text' },
          number: { text: 'number' },
          money: { text: 'money' },
          boolean: { text: 'boolean' },
          enum: { text: 'enum' },
          date: { text: 'date' },
          datetime: { text: 'datetime' },
        },
        render: (_, item) => String(item.valueType || 'text'),
      },
      {
        title: '主键',
        dataIndex: '__primaryKey',
        editable: false,
        width: 88,
        render: (_, item) => {
          const itemKey = String(item.key || '').trim();
          const isPk = !!itemKey && String(editingEntityType?.primaryKey || '').trim() === itemKey;
          if (isPk) return <Tag color="green">是</Tag>;
          return (
            <Button
              type="link"
              size="small"
              disabled={!itemKey}
              onClick={e => {
                e.stopPropagation();
                setPrimaryKey(itemKey);
              }}
            >
              设为主键
            </Button>
          );
        },
      },
      {
        title: '可为 null',
        dataIndex: '__nullable',
        valueType: 'switch',
        width: 96,
        fieldProps: {
          checkedChildren: '是',
          unCheckedChildren: '否',
        },
        render: (_, item) => (item.required ? <Tag color="red">否</Tag> : <Tag>是</Tag>),
      },
      {
        title: '可筛选',
        dataIndex: 'isFilterable',
        valueType: 'switch',
        width: 96,
        fieldProps: {
          checkedChildren: '是',
          unCheckedChildren: '否',
        },
        render: (_, item) => {
          return item.isFilterable ? <Tag color="blue">是</Tag> : <Tag>否</Tag>;
        },
      },

      {
        title: '操作',
        valueType: 'option',
        width: 280,
        render: (_, item, __, action) => {
          const isComplex = ['object', 'array'].includes(String(item.valueType || ''));
          const itemId = String(item.id);
          const disableEditBtn = isTableEditing && String(currentTableEditingKey) !== itemId;

          return [
            <Button
              key="edit"
              size="small"
              disabled={disableEditBtn}
              icon={<EditOutlined />}
              onClick={e => {
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
              onClick={e => {
                e.stopPropagation();
                setEditingId(String(item.id));
              }}
            >
              高级
            </Button>,
            <Button
              key="del"
              danger
              icon={<DeleteOutlined />}
              size="small"
              onClick={e => {
                e.stopPropagation();
                Modal.confirm({
                  title: '确认删除？',
                  content: '删除后不可恢复',
                  okText: '删除',
                  okButtonProps: { danger: true },
                  cancelText: '取消',
                  onOk: () => {
                    dispatch(entityTypesActions.removeFieldsOfEditingEntityType(String(item.id)));
                    message.success('已删除');
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
    setPrimaryKey,
    editingEntityType,
    setEditingId,
    setFieldEditableKeys,
  ]);

  return (
    <>
      <Drawer
        open={open}
        onClose={onClose}
        placement="left"
        width="100vw"
        title="实体类型设计器"
        destroyOnClose
        extra={
          <Space>
            <Button type="primary" onClick={handleSaveEntity}>
              保存
            </Button>
          </Space>
        }
      >
        <Space direction="vertical" size="middle">
          <ProForm
            layout="horizontal"
            grid
            labelAlign="left"
            form={form}
            labelCol={{ xs: 5 }}
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
          </ProForm>

          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <EditableProTable<SchemaField>
              rowKey="id"
              columns={fieldTableColumns}
              tableLayout="fixed"
              value={editingEntityType?.fields}
              onChange={(nextFields) => { dispatch(entityTypesActions.setFieldsOfEditingEntityType(nextFields || [])) }}
              search={false}
              options={false}
              ghost
              controlled
              recordCreatorProps={
                isTableEditing
                  ? false
                  : {
                    position: 'bottom',
                    newRecordType: 'dataSource',
                    creatorButtonText: '添加一行数据',
                    record: () => {
                      const newField: SchemaField = {
                        id: `field_${Math.random().toString(36).slice(2, 9)}`,
                        key: '',
                        title: '',
                        valueType: 'text',
                        required: false,
                        isUnique: false,
                        isFilterable: true,
                        isAutoGenerate: false,
                        description: '',
                        defaultValue: undefined,
                        extra: {},
                      };
                      return newField;
                    },
                  }
              }
              pagination={false}
              locale={{ emptyText: '暂无字段，请点击“添加字段”' }}
              editable={{
                type: 'single',
                editableKeys: fieldEditableKeys,
                onChange: keys => setFieldEditableKeys((keys || []).slice(0, 1)),
                actionRender: (row, _config, defaultDom) => {
                  const saveDom = React.isValidElement(defaultDom.save)
                    ? React.cloneElement(defaultDom.save as any, {
                      children: (
                        <span
                          className="ant-btn ant-btn-default ant-btn-sm"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                          onClick={e => {
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
                        </span>
                      ),
                    })
                    : defaultDom.save;

                  const cancelDom = React.isValidElement(defaultDom.cancel)
                    ? React.cloneElement(defaultDom.cancel as any, {
                      children: (
                        <span
                          className="ant-btn ant-btn-default ant-btn-sm"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                          onClick={e => {
                            const { error } = SchemaFieldSchema.safeParse(row);
                            if (error) {
                              e.preventDefault();
                              e.stopPropagation();
                              message.error(error.message);
                            }
                          }}
                        >
                          <CloseOutlined />
                          取消
                        </span>
                      ),
                    })
                    : defaultDom.cancel;
                  return [saveDom, cancelDom];
                },
              }}
            />
          </Space>
        </Space>
      </Drawer>
    </>
  );
}
