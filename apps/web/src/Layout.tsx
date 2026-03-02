import React, { useEffect, useCallback } from 'react';
import { Layout, Button, Space, Typography, message } from 'antd';
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { DeleteOutlined, FileAddOutlined, PlusOutlined, HolderOutlined } from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
import ComponentTree from './components/ComponentTree/ComponentTree';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { componentNodesSelectors } from './store/componentTreeSlice/componentTreeSelectors';
import { variableSelectors } from './store/variablesSlice/selectors';
import { entityModelSelectors } from './store/entityModelSlice/selectors';
import { addNode, addNodeRefToProps } from './store/componentTreeSlice/componentTreeSlice';
import {
  startCreateEntityModel,
  startEditEntityModel,
  deleteEntityModel,
} from './store/entityModelSlice/entityModelSlice';
import {
  startCreateVariable,
  startEditVariable,
  deleteVariable,
  resetVariableValues,
} from './store/variablesSlice/variablesSlice';
import { getComponentPrototype } from './componentMetas';
import { EntityModelDesignerPanel } from './components/EntityModelDesigner/EntityModelDesignerPanel';
import ComponentPreview from './components/ComponentPreview/ComponentPreview';
import PropertyPanel from './components/PropertyPanel/PropertyPanel';
import { DragDropProvider } from './contexts/DragDropContext';
import VariableDesignerPanel from './components/VariablesDesigner/VariableDesignerPanel';
import { ProjectToolbar } from './components/ProjectToolbar/ProjectToolbar';

import * as layoutStyles from './Layout.css';

// 拖拽预览组件
const DragOverlayContent: React.FC<{ nodeId: string | null }> = ({ nodeId }) => {
  const node = useAppSelector((state) =>
    nodeId ? componentNodesSelectors.selectById(state, nodeId) : null,
  );

  if (!node) return null;

  return (
    <div className={layoutStyles.dragPreview}>
      <HolderOutlined className={layoutStyles.holderIcon} />
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
    dispatch(resetVariableValues());
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
        addNodeRefToProps({
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
        <Layout className={layoutStyles.builder}>
          <Layout.Header className={layoutStyles.header}>
            <ProjectToolbar />
          </Layout.Header>
          <Layout className={layoutStyles.main}>
            <Layout.Sider
              width={300}
              collapsedWidth={0}
              className={layoutStyles.sider}
              trigger={null}
              title="组件树"
            >
              <ProCard
                bordered
                headerBordered
                collapsible
                className={layoutStyles.card}
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
                        addNode({
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
                className={layoutStyles.card}
                size="small"
                collapsible
                title="实体类"
                extra={
                  <Button
                    icon={<PlusOutlined />}
                    size="small"
                    onClick={() => dispatch(startCreateEntityModel())}
                    type="text"
                  />
                }
              >
                <Space direction="vertical" className={layoutStyles.fullWidth}>
                  {entityModels?.map((et) => (
                    <button
                      className={layoutStyles.rowButton}
                      key={et.id}
                      type="button"
                      onClick={() => dispatch(startEditEntityModel(et.id))}
                    >
                      <Typography.Text>{et.title}</Typography.Text>
                      <Button
                        type="text"
                        size="small"
                        icon={<DeleteOutlined />}
                        danger
                        onClick={(e) => {
                          e.stopPropagation();
                          dispatch(deleteEntityModel(et.id));
                        }}
                      />
                    </button>
                  ))}
                </Space>
              </ProCard>
              <ProCard
                bordered
                headerBordered
                className={layoutStyles.card}
                size="small"
                collapsible
                title="变量管理"
                extra={
                  <Button
                    icon={<PlusOutlined />}
                    size="small"
                    onClick={() => dispatch(startCreateVariable())}
                    type="text"
                  />
                }
              >
                <Space direction="vertical" className={layoutStyles.fullWidth}>
                  {variables?.map((variable) => (
                    <button
                      type="button"
                      key={variable.id}
                      onClick={() => dispatch(startEditVariable(variable.id))}
                      className={layoutStyles.rowButton}
                    >
                      <Typography.Text>{variable.name}</Typography.Text>
                      <Button
                        type="text"
                        size="small"
                        icon={<DeleteOutlined />}
                        danger
                        onClick={(e) => {
                          e.stopPropagation();
                          dispatch(deleteVariable(variable.id));
                        }}
                      />
                    </button>
                  ))}
                </Space>
              </ProCard>
            </Layout.Sider>

            <Layout.Content className={layoutStyles.content}>
              <ComponentPreview />
            </Layout.Content>

            <Layout.Sider width={300} trigger={null} className={layoutStyles.sider}>
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
