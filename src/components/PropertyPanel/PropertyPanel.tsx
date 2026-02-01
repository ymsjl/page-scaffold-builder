import React, { useMemo } from "react";
import {
  ProForm,
  ProCard,
  ProFormText,
  ProFormSelect,
  ProFormSwitch,
  ProFormDigit,
} from "@ant-design/pro-components";
import { Space } from "antd";
import SchemaBuilderModal from "../SchemaBuilderModal/SchemaBuilderModal";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectSelectedNode, entityModelSelectors } from "@/store/selectors";
import { componentTreeActions } from "@/store/slices/componentTreeSlice";
import { SchemaList } from "../SchemaBuilderModal/SchemaList";
import { getComponentPrototype } from "@/componentMetas";
import { PropAttribute } from "@/types";

const PropertyPanel: React.FC = () => {
  const dispatch = useAppDispatch();
  const selectedNode = useAppSelector(selectSelectedNode);
  const selectedComponentType = selectedNode?.type;
  const entityModels = useAppSelector(entityModelSelectors.selectAll);
  const handleValuesChange = (changedValues: Record<string, any>) => {
    if (!selectedNode?.id) return;
    dispatch(
      componentTreeActions.updateNode({
        id: selectedNode.id,
        updates: { props: { ...selectedNode.props, ...changedValues } },
      }),
    );
  };

  const schemaMode = useMemo(() => {
    const type = selectedComponentType as string;
    if (type === "Form" || type === "ModalForm") return "form";
    if (type === "Description" || type === "ProDescription")
      return "description";
    return "table";
  }, [selectedComponentType]);

  const propAttrs = useMemo(() => {
    if (!selectedComponentType) return [] as PropAttribute[];
    return Object.values(
      getComponentPrototype(selectedComponentType)?.propsTypes ?? {},
    ).map((item) => ({
      ...item,
      ...(item.name === "entityModelId"
        ? {
            options: entityModels.map((et) => ({
              name: et.name,
              value: et.id,
              label: et.name,
            })),
          }
        : {}),
    }));
  }, [selectedComponentType, entityModels]);

  if (!selectedNode) {
    const emptyStyle: React.CSSProperties = {
      border: "1px solid #e8e8e8",
      borderRadius: "4px",
      background: "white",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: "100%",
      color: "#999",
    };
    return <div style={emptyStyle}>请选择一个组件实例</div>;
  }

  if (propAttrs.length === 0) {
    const noConfigStyle: React.CSSProperties = {
      border: "1px solid #e8e8e8",
      borderRadius: "4px",
      background: "white",
      padding: "24px",
      textAlign: "center",
      color: "#999",
    };
    return (
      <div style={noConfigStyle}>组件 {selectedNode.type} 暂无可配置属性</div>
    );
  }

  const hasGroups = propAttrs.some((propAttr) => propAttr.group);

  const formStyles: React.CSSProperties = {
    height: "100%",
    overflowY: "auto",
  };

  const contentStyles: React.CSSProperties = {
    padding: "16px",
  };

  const renderFormItem = (propAttr: PropAttribute) => {
    // 特殊处理 columns 属性
    if (propAttr.name === "columns") {
      return (
        <ProForm.Item
          key={propAttr.name}
          label={propAttr.label}
          tooltip={propAttr.description}
        >
          <Space direction="vertical" style={{ width: "100%" }}>
            <SchemaList selectedNode={selectedNode} />
          </Space>
        </ProForm.Item>
      );
    }

    const formItemConfig = {
      name: propAttr.name,
      label: propAttr.label,
      tooltip: propAttr.description,
    };

    switch (propAttr.type) {
      case "select":
        return (
          <ProFormSelect
            key={propAttr.name}
            {...formItemConfig}
            options={propAttr?.options || []}
          />
        );
      case "boolean":
        return <ProFormSwitch key={propAttr.name} {...formItemConfig} />;
      case "number":
        return <ProFormDigit key={propAttr.name} {...formItemConfig} />;
      default:
        return <ProFormText key={propAttr.name} {...formItemConfig} />;
    }
  };

  if (!hasGroups) {
    return (
      <>
        <div style={formStyles}>
          <ProCard
            title={`配置：${selectedNode.name}`}
            headerBordered
            bodyStyle={{ padding: 0 }}
          >
            <div style={contentStyles}>
              <ProForm
                initialValues={selectedNode.props}
                onValuesChange={handleValuesChange}
                submitter={false}
              >
                {propAttrs.map(renderFormItem)}
              </ProForm>
            </div>
          </ProCard>
        </div>
        <SchemaBuilderModal
          key={`schema-builder-${selectedNode.id}`}
          title={`配置 ${selectedNode?.name} 的 Columns`}
          schemaMode={schemaMode}
        />
      </>
    );
  }

  const groupedPropAttr = propAttrs.reduce(
    (acc, propAttr) => {
      const group = propAttr.group || "基础配置";
      if (!acc[group]) {
        acc[group] = [];
      }
      acc[group].push(propAttr);
      return acc;
    },
    {} as Record<string, PropAttribute[]>,
  );

  return (
    <>
      <div style={formStyles}>
        {Object.entries(groupedPropAttr).map(([groupName, items]) => (
          <ProCard
            key={groupName}
            title={groupName}
            headerBordered
            collapsible
            defaultCollapsed={groupName !== "基础配置"}
            style={{ marginBottom: "16px", backgroundColor: "#fafafa" }}
            bodyStyle={{ padding: "12px" }}
          >
            <ProForm
              initialValues={selectedNode.props}
              onValuesChange={handleValuesChange}
              submitter={false}
            >
              {items.map(renderFormItem)}
            </ProForm>
          </ProCard>
        ))}
      </div>

      <SchemaBuilderModal
        title={`配置 ${selectedNode?.name} 的 Columns`}
        schemaMode={schemaMode}
      />
    </>
  );
};

export default PropertyPanel;
