import React, { useCallback, useState } from 'react';
import { Button, Select, Space, Typography, message } from 'antd';
import { EditOutlined, PlusOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { actionFlowsActions } from '@/store/actionFlows/actionFlowsSlice';
import { ActionFlowEditorDrawer } from './ActionFlowEditorDrawer';

interface ActionFlowSelectorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
}

export const ActionFlowSelector: React.FC<ActionFlowSelectorProps> = ({
  value,
  onChange,
  placeholder = '选择动作流',
}) => {
  const dispatch = useAppDispatch();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingFlowId, setEditingFlowId] = useState<string | null>(null);

  const flows = useAppSelector((state) =>
    Object.values(state.actionFlows.flows.entities).filter(Boolean)
  );

  const selectedFlow = useAppSelector((state) =>
    value ? state.actionFlows.flows.entities[value] : null
  );

  const handleEdit = useCallback(() => {
    if (value) {
      setEditingFlowId(value);
      setDrawerOpen(true);
    }
  }, [value]);

  const handleCreate = useCallback(() => {
    // 创建新的动作流
    const newFlowId = `flow_${Date.now()}`;
    dispatch(
      actionFlowsActions.createFlow({
        id: newFlowId,
        name: '新动作流',
        description: '',

      })
    );

    // 设置为当前值
    onChange?.(newFlowId);

    // 打开编辑器
    setEditingFlowId(newFlowId);
    setDrawerOpen(true);

    message.success('已创建新动作流');
  }, [dispatch, onChange]);

  const handleDrawerClose = useCallback(() => {
    setDrawerOpen(false);
    setEditingFlowId(null);
  }, []);

  const options = flows.map((flow) => ({
    label: flow.name,
    value: flow.id,
  }));

  return (
    <>
      <Space.Compact style={{ width: '100%' }}>
        <Select
          style={{ flex: 1 }}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          options={options}
          allowClear
        />

        {value ? (
          <Button
            icon={<EditOutlined />}
            onClick={handleEdit}
            title="编辑动作流"
          />
        ) : (
          <Button
            icon={<PlusOutlined />}
            onClick={handleCreate}
            title="创建新动作流"
          />
        )}
      </Space.Compact>

      {selectedFlow && (
        <Typography.Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 4 }}>
          {selectedFlow.description || '暂无描述'}
        </Typography.Text>
      )}

      <ActionFlowEditorDrawer
        open={drawerOpen}
        flowId={editingFlowId}
        onClose={handleDrawerClose}
      />
    </>
  );
};
