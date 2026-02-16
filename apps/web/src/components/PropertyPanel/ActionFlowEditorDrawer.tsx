import React from 'react';
import { Drawer } from 'antd';
import { useAppSelector } from '@/store/hooks';
import { FlowEditor } from '../FlowEditor/FlowEditor';

interface ActionFlowEditorDrawerProps {
  open: boolean;
  flowId: string | null;
  onClose: () => void;
}

export const ActionFlowEditorDrawer: React.FC<ActionFlowEditorDrawerProps> = ({
  open,
  flowId,
  onClose,
}) => {
  const flow = useAppSelector((state) =>
    flowId ? state.actionFlows.flows.entities[flowId] : null,
  );

  if (!flow) return null;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width="100vw"
      height="100vh"
      placement="right"
      closable
      title={`编辑动作流: ${flow.name}`}
      destroyOnClose
      styles={{
        body: { padding: 0, height: '100%' },
      }}
    >
      <FlowEditor flowId={flowId!} flow={flow} />
    </Drawer>
  );
};
