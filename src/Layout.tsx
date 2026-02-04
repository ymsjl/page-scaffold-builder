import React, { ComponentProps, useEffect } from "react";
import { Layout, Button, Collapse, Space, Typography, Flex, Menu, Card } from "antd";
import ComponentTree from "./components/ComponentTree/ComponentTree";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import { entityModelSelectors } from "./store/componentTree/componentTreeSelectors";
import { componentTreeActions } from "./store/componentTree/componentTreeSlice";
import EntityModelDesignerPanel from "./components/EntityModelDesigner/EntityModelDesignerPanel";
import { DeleteOutlined, FileAddOutlined, PlusOutlined } from "@ant-design/icons";
import ComponentPreview from "./components/ComponentPreview/ComponentPreview";
import PropertyPanel from "./components/PropertyPanel/PropertyPanel";
import { ProCard } from "@ant-design/pro-components";

const styles: { [key: string]: React.CSSProperties } = {
  builder: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
  },
};

export function PageScaffoldBuilderLayout() {
  const dispatch = useAppDispatch();
  const entityModels = useAppSelector(entityModelSelectors.selectAll);

  return (
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
  );
}
