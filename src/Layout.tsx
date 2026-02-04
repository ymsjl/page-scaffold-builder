import React, { ComponentProps, useEffect } from "react";
import { Layout, Button, Collapse, Space, Typography, Flex, Menu, Card } from "antd";
import ComponentTree from "./components/ComponentTree/ComponentTree";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import { entityModelSelectors } from "./store/componentTree/componentTreeSelectors";
import { componentTreeActions } from "./store/componentTree/componentTreeSlice";
import EntityModelDesignerPanel from "./components/EntityModelDesigner/EntityModelDesignerPanel";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import ComponentPreview from "./components/ComponentPreview/ComponentPreview";
import PropertyPanel from "./components/PropertyPanel/PropertyPanel";

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

  useEffect(() => {
    dispatch(componentTreeActions.addNode({ parentId: null, type: "Container" }));
  }, [dispatch]);

  const collapseItems: ComponentProps<typeof Collapse>["items"] = [
    {
      key: "componentTree",
      label: "组件树",
      style: { border: "none" },
      children: <ComponentTree />,
    },
    {
      key: "entityModel",
      label: "实体类",
      extra: !entityModels?.length && (
        <Button
          icon={<PlusOutlined />}
          onClick={() => {
            dispatch(componentTreeActions.startCreateEntityModel());
          }}
          type="text"
        />
      ),
      children: (
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
      ),
    },
  ];

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
          <Collapse size="small" items={collapseItems} />
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
