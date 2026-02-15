import React, { useEffect, useState } from 'react';
import { Form, Input, Select, InputNumber, Button, Space, Divider } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import type { ActionNode } from '@/types/actions';
import { useActionFlow } from '@/services/actionFlows/hooks/useActionFlow';
import { useAppSelector } from '@/store/hooks';
import { variableSelectors } from '@/store/variablesSlice/selectors';
import * as styles from './NodeProperties.css';

const { TextArea } = Input;
const { Option } = Select;

interface NodePropertiesProps {
  flowId: string;
  node: ActionNode | null;
  onClose: () => void;
}

/**
 * 节点属性编辑面板
 */
export const NodeProperties: React.FC<NodePropertiesProps> = ({ flowId, node, onClose }) => {
  const { updateNode, deleteNodes } = useActionFlow();
  const variables = useAppSelector(variableSelectors.selectAll);
  const [form] = Form.useForm();
  const [, setLocalParams] = useState<Record<string, any>>({});

  // 当节点变化时，更新表单
  useEffect(() => {
    if (node) {
      form.setFieldsValue({
        label: node.label,
        ...node.params,
      });
      setLocalParams(node.params || {});
    }
  }, [node, form]);

  if (!node) {
    return (
      <div className={styles.nodePropertiesEmpty}>
        <p>请选择一个节点</p>
      </div>
    );
  }

  // 保存节点属性
  const handleSave = () => {
    const values = form.getFieldsValue();
    const { label, ...params } = values;

    updateNode(flowId, node.id, {
      label,
      params,
    });
  };

  // 删除节点
  const handleDelete = () => {
    deleteNodes(flowId, [node.id]);
    onClose();
  };

  // 渲染参数字段
  const renderParamFields = () => {
    const nodeType = node.type;

    // 根据节点类型渲染不同的表单字段
    switch (nodeType) {
      case 'action.httpRequest':
        return (
          <>
            <Form.Item label="URL" name="url" rules={[{ required: true }]}>
              <Input placeholder="https://api.example.com/data" />
            </Form.Item>
            <Form.Item label="请求方法" name="method">
              <Select defaultValue="GET">
                <Option value="GET">GET</Option>
                <Option value="POST">POST</Option>
                <Option value="PUT">PUT</Option>
                <Option value="DELETE">DELETE</Option>
                <Option value="PATCH">PATCH</Option>
              </Select>
            </Form.Item>
            <Form.Item label="请求头" name="headers">
              <TextArea rows={3} placeholder='{"Content-Type": "application/json"}' />
            </Form.Item>
            <Form.Item label="请求体" name="body">
              <TextArea rows={4} placeholder='{"key": "value"}' />
            </Form.Item>
          </>
        );

      case 'action.navigate':
        return (
          <>
            <Form.Item label="目标路径" name="path" rules={[{ required: true }]}>
              <Input placeholder="/dashboard" />
            </Form.Item>
            <Form.Item label="在新标签页打开" name="newTab">
              <Select defaultValue={false}>
                <Option value={false}>否</Option>
                <Option value>是</Option>
              </Select>
            </Form.Item>
          </>
        );

      case 'action.setVariable':
        return (
          <>
            <Form.Item
              label="变量"
              name="variableName"
              rules={[{ required: true, message: '请选择变量' }]}
            >
              <Select
                placeholder="选择变量"
                options={variables.map((item) => ({
                  label: item.name,
                  value: item.name,
                }))}
              />
            </Form.Item>
            <Form.Item
              label="设置值"
              name="value"
              rules={[{ required: true, message: '请输入设置值' }]}
            >
              <Input placeholder="支持 boolean/string/number，例如 false" />
            </Form.Item>
          </>
        );

      case 'action.showMessage':
        return (
          <>
            <Form.Item label="消息内容" name="content" rules={[{ required: true }]}>
              <TextArea rows={3} placeholder="操作成功" />
            </Form.Item>
            <Form.Item label="消息类型" name="type">
              <Select defaultValue="info">
                <Option value="success">成功</Option>
                <Option value="error">错误</Option>
                <Option value="warning">警告</Option>
                <Option value="info">信息</Option>
              </Select>
            </Form.Item>
            <Form.Item label="持续时间(秒)" name="duration">
              <InputNumber min={1} max={30} defaultValue={3} />
            </Form.Item>
          </>
        );

      case 'control.delay':
        return (
          <Form.Item label="延迟时间(毫秒)" name="duration" rules={[{ required: true }]}>
            <InputNumber min={0} defaultValue={1000} style={{ width: '100%' }} />
          </Form.Item>
        );

      case 'control.condition':
        return (
          <>
            <Form.Item label="条件表达式" name="condition" rules={[{ required: true }]}>
              <TextArea rows={3} placeholder="input.value > 100" />
            </Form.Item>
            <Form.Item label="条件说明" name="description">
              <TextArea rows={2} placeholder="描述这个条件的用途" />
            </Form.Item>
          </>
        );

      case 'control.loop':
        return (
          <>
            <Form.Item label="循环类型" name="loopType">
              <Select defaultValue="count">
                <Option value="count">固定次数</Option>
                <Option value="while">条件循环</Option>
                <Option value="forEach">遍历数组</Option>
              </Select>
            </Form.Item>
            <Form.Item label="循环次数/条件" name="loopValue">
              <Input placeholder="10 或 input.hasMore" />
            </Form.Item>
          </>
        );

      case 'data.transform':
        return (
          <Form.Item label="转换函数" name="transformer">
            <TextArea rows={5} placeholder="(input) => ({ ...input, transformed: true })" />
          </Form.Item>
        );

      case 'component.table.refresh':
        return (
          <Form.Item label="表格组件ID" name="componentId">
            <Input placeholder="table_1" />
          </Form.Item>
        );

      case 'component.form.submit':
        return (
          <Form.Item label="表单组件ID" name="componentId">
            <Input placeholder="form_1" />
          </Form.Item>
        );

      default:
        return (
          <Form.Item label="参数 (JSON)" name="params">
            <TextArea rows={6} placeholder='{"key": "value"}' />
          </Form.Item>
        );
    }
  };

  return (
    <div className={styles.nodeProperties}>
      <div className={styles.nodePropertiesHeader}>
        <h3>节点属性</h3>
        <Button type="text" danger icon={<DeleteOutlined />} onClick={handleDelete}>
          删除
        </Button>
      </div>

      <Divider />

      <Form
        form={form}
        layout="vertical"
        onValuesChange={handleSave}
        className={styles.nodePropertiesForm}
      >
        <Form.Item label="节点名称" name="label" rules={[{ required: true }]}>
          <Input placeholder="输入节点名称" />
        </Form.Item>

        <Form.Item label="节点类型">
          <Input value={node.type} disabled />
        </Form.Item>

        <Divider orientation="left">参数配置</Divider>

        {renderParamFields()}
      </Form>

      <div className={styles.nodePropertiesFooter}>
        <Space>
          <Button onClick={onClose}>关闭</Button>
        </Space>
      </div>
    </div>
  );
};
