import React, { useEffect, useCallback } from 'react';
import { Layout, Button, Space, Typography, message } from 'antd';
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { DeleteOutlined, FileAddOutlined, PlusOutlined, HolderOutlined } from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
import ComponentTree from './components/ComponentTree/ComponentTree';
import { useAppDispatch, useAppSelector } from './store/hooks';
import {
  entityModelSelectors,
  componentNodesSelectors,
  variableSelectors,
} from './store/componentTree/componentTreeSelectors';
import { componentTreeActions } from './store/componentTree/componentTreeSlice';
import { getComponentPrototype } from './componentMetas';
import EntityModelDesignerPanel from './components/EntityModelDesigner/EntityModelDesignerPanel';
import ComponentPreview from './components/ComponentPreview/ComponentPreview';
import PropertyPanel from './components/PropertyPanel/PropertyPanel';
import { DragDropProvider } from './contexts/DragDropContext';
import VariableDesignerPanel from './components/VariablesDesigner/VariableDesignerPanel';

const styles: { [key: string]: React.CSSProperties } = {
  builder: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
  },
};

// 拖拽预览组件
const DragOverlayContent: React.FC<{ nodeId: string | null }> = ({ nodeId }) => {
  const node = useAppSelector((state) =>
    nodeId ? componentNodesSelectors.selectById(state, nodeId) : null,
  );

  if (!node) return null;

  return (
    <div
      style={{
        padding: '8px 12px',
        background: '#fff',
        border: '1px solid #1890ff',
        borderRadius: '4px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}
    >
      <HolderOutlined style={{ color: '#1890ff' }} />
      <span>{node.name}</span>
    </div>
  );
};

export const PageScaffoldBuilderLayout = () => {
  const dispatch = useAppDispatch();
  const entityModels = useAppSelector(entityModelSelectors.selectAll);
  const variables = useAppSelector(variableSelectors.selectAll);
  const [activeNodeId, setActiveNodeId] = React.useState<string | null>(null);

  useEffect(() => {
    dispatch(componentTreeActions.resetVariableValues());
  }, [dispatch]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    const dragData = active.data.current as { type: string; nodeId: string } | undefined;
    if (dragData?.type === 'treeNode') {
      setActiveNodeId(dragData.nodeId);
    }
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveNodeId(null);

      if (!over) return;

      const dragData = active.data.current as
        | { type: string; nodeId: string; nodeType: string }
        | undefined;
      const dropData = over.data.current as
        | {
            type: string;
            targetNodeId: string;
            propPath: string;
            acceptTypes?: string[];
          }
        | undefined;

      // 验证拖拽和放置数据
      if (dragData?.type !== 'treeNode' || dropData?.type !== 'dropZone') return;

      // 检查组件类型是否被接受
      if (
        dropData.acceptTypes &&
        dropData.acceptTypes.length > 0 &&
        !dropData.acceptTypes.includes(dragData.nodeType)
      ) {
        message.warning(`此区域不接受 ${dragData.nodeType} 类型的组件`);
        return;
      }

      // 添加节点引用到 props
      dispatch(
        componentTreeActions.addNodeRefToProps({
          targetNodeId: dropData.targetNodeId,
          propPath: dropData.propPath,
          refNodeId: dragData.nodeId,
        }),
      );
      message.success('组件已添加');
    },
    [dispatch],
  );

  const handleDragCancel = useCallback(() => {
    setActiveNodeId(null);
  }, []);

  return (
    <DragDropProvider>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <Layout style={styles.builder}>
          <Layout>
            <Layout.Sider
              width={300}
              collapsedWidth={0}
              style={{ background: 'none', padding: '16px 8px' }}
              trigger={null}
              title="组件树"
            >
              <ProCard
                bordered
                headerBordered
                collapsible
                style={{ marginTop: 16, borderRadius: 8 }}
                size="small"
                title="组件树"
                extra={
                  <Button
                    icon={<FileAddOutlined />}
                    size="small"
                    title="添加新页面"
                    onClick={() => {
                      const prototype = getComponentPrototype('Page');
                      dispatch(
                        componentTreeActions.addNode({
                          parentId: null,
                          type: 'Page',
                          label: prototype?.label,
                          isContainer: prototype?.isContainer,
                          defaultProps: prototype?.defaultProps,
                        }),
                      );
                    }}
                    type="text"
                  />
                }
              >
                <ComponentTree />
              </ProCard>
              <ProCard
                bordered
                headerBordered
                style={{ marginTop: 16, borderRadius: 8 }}
                size="small"
                collapsible
                title="实体类"
                extra={
                  <Button
                    icon={<PlusOutlined />}
                    size="small"
                    onClick={() => dispatch(componentTreeActions.startCreateEntityModel())}
                    type="text"
                  />
                }
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  {entityModels?.map((et) => (
                    <button
                      key={et.id}
                      type="button"
                      onClick={() => dispatch(componentTreeActions.startEditEntityModel(et.id))}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Typography.Text>{et.title}</Typography.Text>
                      <Button
                        type="text"
                        size="small"
                        icon={<DeleteOutlined />}
                        danger
                        onClick={(e) => {
                          e.stopPropagation();
                          dispatch(componentTreeActions.deleteEntityModel(et.id));
                        }}
                      />
                    </button>
                  ))}
                </Space>
              </ProCard>
              <ProCard
                bordered
                headerBordered
                style={{ marginTop: 16, borderRadius: 8 }}
                size="small"
                collapsible
                title="变量管理"
                extra={
                  <Button
                    icon={<PlusOutlined />}
                    size="small"
                    onClick={() => dispatch(componentTreeActions.startCreateVariable())}
                    type="text"
                  />
                }
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  {variables?.map((variable) => (
                    <button
                      type="button"
                      key={variable.id}
                      onClick={() => dispatch(componentTreeActions.startEditVariable(variable.id))}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Typography.Text>{variable.name}</Typography.Text>
                      <Button
                        type="text"
                        size="small"
                        icon={<DeleteOutlined />}
                        danger
                        onClick={(e) => {
                          e.stopPropagation();
                          dispatch(componentTreeActions.deleteVariable(variable.id));
                        }}
                      />
                    </button>
                  ))}
                </Space>
              </ProCard>
            </Layout.Sider>

            <Layout.Content
              style={{
                height: '100%',
                overflow: 'hidden',
                padding: '16px 12px',
              }}
            >
              <ComponentPreview />
            </Layout.Content>

            <Layout.Sider
              width={300}
              trigger={null}
              style={{ background: 'none', padding: '16px 8px' }}
            >
              <PropertyPanel />
            </Layout.Sider>
          </Layout>
          <EntityModelDesignerPanel />
          <VariableDesignerPanel />
        </Layout>
        <DragOverlay>
          <DragOverlayContent nodeId={activeNodeId} />
        </DragOverlay>
      </DndContext>
    </DragDropProvider>
  );
};
