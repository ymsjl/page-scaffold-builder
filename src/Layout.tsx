import React, { ComponentProps, useEffect } from "react";
import { Layout, Button, Collapse, Space, Typography } from "antd";
import ComponentTree from "./components/ComponentTree/ComponentTree";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import { entityModelSelectors } from "./store/slices/entityModel/entityModelSelectors";
import { componentTreeActions } from "./store/slices/componentTree/componentTreeSlice";
import { entityModelActions } from "./store/slices/entityModel/entityModelSlice";
import EntityModelDesignerPanel from "./components/EntityModelDesigner/EntityModelDesignerPanel";
import { PageScaffoldBuilderPreview } from "./Preview";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";

const styles: { [key: string]: React.CSSProperties } = {
  builder: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
  },
  layout: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
  },
  header: {
    padding: "16px 24px",
    borderBottom: "1px solid #e8e8e8",
    background: "white",
  },
  headerTitle: {
    margin: 0,
    fontSize: "20px",
    fontWeight: 500,
  },
  contentLayout: {
    flex: 1,
    display: "flex",
    overflow: "hidden",
  },
  content: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  contentInner: {
    flex: 1,
    overflow: "hidden",
  },
  section: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    height: "100%",
  },
  sectionTitle: {
    margin: 0,
    fontSize: "16px",
    fontWeight: 500,
  },
};
export function PageScaffoldBuilderLayout() {
  const dispatch = useAppDispatch();
  const entityModels = useAppSelector(entityModelSelectors.selectAll);

  useEffect(() => {
    dispatch(componentTreeActions.addNode({ parentId: null, type: "Container" }),);
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
            dispatch(entityModelActions.startCreateNew());
          }}
          type="text"
        />
      ),
      children: (
        <Space direction="vertical" style={{ width: "100%" }}>
          {entityModels?.map((et) => (
            <div
              key={et.id}
              onClick={() => dispatch(entityModelActions.startEdit(et.id))}
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
                  dispatch(entityModelActions.deleteEntityModel(et.id));
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
          style={{ background: "none", paddingBlockStart: "16px" }}
          trigger={null}
          title="组件树"
        >
          <Collapse size="small" items={collapseItems} />
        </Layout.Sider>

        <PageScaffoldBuilderPreview />
      </Layout>
      <EntityModelDesignerPanel />
    </Layout>
  );
}
