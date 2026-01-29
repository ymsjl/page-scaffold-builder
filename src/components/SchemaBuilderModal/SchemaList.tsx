import React from 'react';
import { Modal, List, Button, Space, Empty, Tag, message, Flex } from 'antd';
import { useAppDispatch } from '@/store/hooks';
import { schemaEditorActions } from '@/store/slices/schemaEditorSlice';
import { componentTreeActions } from '@/store/slices/componentTreeSlice';
import { PlusOutlined, DeleteOutlined, ArrowUpOutlined, ArrowDownOutlined, EditOutlined } from '@ant-design/icons';
import type { ComponentInstance, ProCommonColumn } from '@/types';

export function SchemaList({ selectedNode }: { selectedNode: ComponentInstance | null }) {
  const columns = selectedNode?.props?.columns ?? ([] as ProCommonColumn[]);

  const dispatch = useAppDispatch();

  const handleStartAdd = () => dispatch(schemaEditorActions.startAddColumn());

  const handleStartEdit = (field: ProCommonColumn) => dispatch(schemaEditorActions.startEditColumn(field));

  // 删除字段
  const handleDelete = (key: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个字段吗？',
      onOk: () => {
        dispatch(componentTreeActions.deleteColumnForSelectedNode(key));
        message.success('字段已删除');
      },
    });
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
                  <Flex gap={8} style={{ width: '100%' }}>
                    <strong style={{ fontSize: 14, flex: '1' }}>{field.title}</strong>
                    <Flex gap={8} wrap='wrap'>
                      <Tag color="blue">{valueTypeLabel}</Tag>
                    </Flex>
                    <Space size='small'>
                      <Button size="small" icon={<EditOutlined />} onClick={() => handleStartEdit(field)} />
                      <Button
                        size="small"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(field.key as string)}
                      />
                    </Space>
                  </Flex>
                </List.Item>
              );
            }}
          />
        </>
      )}
    </Space>
  );
}
