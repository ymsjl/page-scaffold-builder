import React from 'react';
import { Modal, List, Button, Space, Empty, Tag, message } from 'antd';
import { useBuilderStore } from '@/store/useBuilderStore';
import { PlusOutlined, DeleteOutlined, ArrowUpOutlined, ArrowDownOutlined, EditOutlined } from '@ant-design/icons';
import type { ComponentInstance, ProCommonColumn } from '@/types';

export function SchemaList({ selectedNode }: { selectedNode: ComponentInstance | null }) {
  const columns = selectedNode?.props?.columns ?? ([] as ProCommonColumn[]);

  const handleStartAdd = () => {
    useBuilderStore.getState().selectedNode.startAddColumn();
  };

  // 开始编辑字段
  const handleStartEdit = (field: ProCommonColumn) => {
    useBuilderStore.getState().selectedNode.startEditColumn(field);
  };

  // 删除字段
  const handleDelete = (key: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个字段吗？',
      onOk: () => {
        useBuilderStore.getState().selectedNode.deleteColumn(key);
        message.success('字段已删除');
      },
    });
  };

  // 上移
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    useBuilderStore.getState().selectedNode.moveColumn(index, index - 1);
  };

  // 下移
  const handleMoveDown = (index: number) => {
    if (index === columns.length - 1) return;
    useBuilderStore.getState().selectedNode.moveColumn(index, index + 1);
  };

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="middle">
      {/* 添加按钮 */}
      <Button type="dashed" block icon={<PlusOutlined />} onClick={handleStartAdd} size="large">
        添加新字段
      </Button>

      {/* 字段列表 */}
      {columns.length === 0 ? (
        <Empty description="暂无字段，点击上方按钮添加" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        <>
          <List<ProCommonColumn>
            dataSource={columns}
            renderItem={(field, index) => {
              const valueTypeLabel =
                [
                  { label: '文本', value: 'text' },
                  { label: '文本域', value: 'textarea' },
                  { label: '密码', value: 'password' },
                  { label: '数字', value: 'digit' },
                  { label: '日期', value: 'date' },
                  { label: '日期时间', value: 'dateTime' },
                  { label: '日期范围', value: 'dateRange' },
                  { label: '时间', value: 'time' },
                  { label: '下拉选择', value: 'select' },
                  { label: '多选', value: 'checkbox' },
                  { label: '单选', value: 'radio' },
                  { label: '开关', value: 'switch' },
                  { label: '进度条', value: 'progress' },
                  { label: '百分比', value: 'percent' },
                  { label: '金额', value: 'money' },
                ].find(opt => opt.value === field.valueType)?.label || field.valueType;

              return (
                <List.Item key={field.key}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <strong style={{ fontSize: 14 }}>{field.title}</strong>
                      <Space>
                        <Button
                          size="small"
                          icon={<ArrowUpOutlined />}
                          disabled={index === 0}
                          onClick={() => handleMoveUp(index)}
                        />
                        <Button
                          size="small"
                          icon={<ArrowDownOutlined />}
                          disabled={index === columns.length - 1}
                          onClick={() => handleMoveDown(index)}
                        />
                        <Button size="small" icon={<EditOutlined />} onClick={() => handleStartEdit(field)} />
                        <Button
                          size="small"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => handleDelete(field.key as string)}
                        />
                      </Space>
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <Tag color="blue">{valueTypeLabel}</Tag>
                      {!field.hideInSearch && <Tag color="green">可搜索</Tag>}
                    </div>
                  </div>
                </List.Item>
              );
            }}
          />
        </>
      )}
    </Space>
  );
}
