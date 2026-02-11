import React, { useEffect } from 'react';
import { Button, Space, Card, Tabs } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { FlowEditor } from '@/components/FlowEditor';
import { useActionFlow } from '@/services/actionFlows/hooks/useActionFlow';
import { useAppSelector } from '@/store/hooks';
import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '@/store/storeTypes';
import { ActionFlowExamples } from '@/services/actionFlows/examples/ActionFlowExamples';
import './FlowEditorDemo.css';

// 创建本地 selector
const selectAllFlows = createSelector(
  [(state: RootState) => state.actionFlows.flows.entities, (state: RootState) => state.actionFlows.flows.ids],
  (entities, ids) => ids.map((id: string | number) => entities[id]).filter((f: any): f is NonNullable<typeof f> => f != null)
);

/**
 * 流程编辑器演示页面
 */
export const FlowEditorDemo: React.FC = () => {
  const { createFlow } = useActionFlow();
  const flows = useAppSelector(selectAllFlows);
  const [selectedFlowId, setSelectedFlowId] = React.useState<string | null>(null);

  // 初始化：如果没有流程，创建一个默认流程
  useEffect(() => {
    if (flows.length === 0) {
      const flowId = createFlow('示例流程');
      setSelectedFlowId(flowId);
    } else if (!selectedFlowId && flows.length > 0) {
      setSelectedFlowId(flows[0].id);
    }
  }, [flows, selectedFlowId, createFlow]);

  // 创建新流程
  const handleCreateFlow = () => {
    const flowId = createFlow(`新流程 ${flows.length + 1}`);
    setSelectedFlowId(flowId);
  };

  const selectedFlow = flows.find((f) => f.id === selectedFlowId);

  return (
    <div className="flow-editor-demo">
      {/* 顶部工具栏 */}
      <div className="flow-editor-demo-header">
        <h2>Action Flow 可视化编辑器</h2>
        <Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateFlow}>
            新建流程
          </Button>
        </Space>
      </div>
      <>
        {/* 编辑器 */}
        <div className="flow-editor-demo-content">
          {selectedFlow ? (
            <FlowEditor flowId={selectedFlow.id} flow={selectedFlow} />
          ) : (
            <div className="flow-editor-demo-empty">
              <p>暂无流程</p>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateFlow}>
                创建第一个流程
              </Button>
            </div>
          )}
        </div>
      </>
    </div>
  );
};
