import React, { ComponentProps, useEffect, useCallback } from "react";
import { Layout, Button, Collapse, Space, Typography, Flex, Menu, Card, message } from "antd";
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import ComponentTree from "./components/ComponentTree/ComponentTree";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import { entityModelSelectors } from "./store/componentTree/componentTreeSelectors";
import { componentTreeActions } from "./store/componentTree/componentTreeSlice";
import EntityModelDesignerPanel from "./components/EntityModelDesigner/EntityModelDesignerPanel";
import { DeleteOutlined, FileAddOutlined, PlusOutlined, HolderOutlined } from "@ant-design/icons";
import ComponentPreview from "./components/ComponentPreview/ComponentPreview";
import PropertyPanel from "./components/PropertyPanel/PropertyPanel";
import { ProCard } from "@ant-design/pro-components";
import { DragDropProvider } from "./contexts/DragDropContext";

const styles: { [key: string]: React.CSSProperties } = {
  builder: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
  },
};

// 拖拽预览组件
const DragOverlayContent: React.FC<{ nodeId: string | null }> = ({ nodeId }) => {
  const node = useAppSelector(
    (state) => nodeId ? state.componentTree.components.entities[nodeId] : null
  );

  if (!node) return null;

  return (
    <div
      style={{
        padding: "8px 12px",
        background: "#fff",
        border: "1px solid #1890ff",
        borderRadius: "4px",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
        display: "flex",
        alignItems: "center",
        gap: "8px",
      }}
    >
      <HolderOutlined style={{ color: "#1890ff" }} />
      <span>{node.name}</span>
    </div>
  );
};

export function PageScaffoldBuilderLayout() {
  const dispatch = useAppDispatch();
  const entityModels = useAppSelector(entityModelSelectors.selectAll);
  const [activeNodeId, setActiveNodeId] = React.useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    const dragData = active.data.current as { type: string; nodeId: string } | undefined;
    if (dragData?.type === "treeNode") {
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
        | { type: string; targetNodeId: string; propPath: string; acceptTypes?: string[] }
        | undefined;

      // 验证拖拽和放置数据
      if (dragData?.type !== "treeNode" || dropData?.type !== "dropZone") return;

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
        })
      );
      message.success("组件已添加");
    },
    [dispatch]
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
              style={{ background: "none", padding: "16px 8px" }}
              trigger={null}
              title="组件树"
            >
              <ProCard
                bordered
                headerBordered
                collapsible={true}
                style={{ marginTop: 16, borderRadius: 8 }}
                size="small"
                title="组件树"
                extra={
                  <Button
                    icon={<FileAddOutlined />}
                    size='small'
                    title="添加新页面"
                    onClick={() => dispatch(componentTreeActions.addNode({ parentId: null, type: "Page" }))}
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
                collapsible={true}
                title="实体类"
                extra={
                  <Button
                    icon={<PlusOutlined />}
                    size='small'
                    onClick={() => dispatch(componentTreeActions.startCreateEntityModel())}
                    type="text"
                  />
                }
              >
                <Space direction="vertical" style={{ width: "100%" }}>
                  {entityModels?.map((et) => (
                    <div
                      key={et.id}
                      onClick={() => dispatch(componentTreeActions.startEditEntityModel(et.id))}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
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
                    </div>
                  ))}
                </Space>
              </ProCard>
            </Layout.Sider>

            <Layout.Content style={{ height: "100%", overflow: "hidden", padding: "16px 12px" }}>
              <ComponentPreview />
            </Layout.Content>

            <Layout.Sider
              width={300}
              trigger={null}
              style={{ background: "none", padding: "16px 8px" }}

            >
              <PropertyPanel />
            </Layout.Sider>
          </Layout>
          <EntityModelDesignerPanel />
        </Layout>
        <DragOverlay>
          <DragOverlayContent nodeId={activeNodeId} />
        </DragOverlay>
      </DndContext>
    </DragDropProvider>
  );
}
