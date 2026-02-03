import React, { useMemo } from "react";
import {
  ProCard,
  BetaSchemaForm,
  ProFormColumnsType
} from "@ant-design/pro-components";
import { Button, Flex, Form, Typography } from "antd";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { entityModelSelectors } from "@/store/slices/entityModel/entityModelSelectors";
import { selectSelectedNode } from "@/store/slices/componentTree/componentTreeSelectors";
import { componentTreeActions } from "@/store/slices/componentTree/componentTreeSlice";
import { SchemaList } from "../SchemaBuilderModal/SchemaList";
import { getComponentPrototype } from "@/componentMetas";
import { PropAttribute } from "@/types";
import { VALUE_TYPE_ENUM_MAP } from "../SchemaBuilderModal/constants";
import { NodeExpandOutlined, PlusOutlined } from "@ant-design/icons";
import "./styles.css";
import { createProCommonColumnFromSchemeField } from "../SchemaBuilderModal/useAutoFillByDataIndex";

const PropertyPanel: React.FC = () => {
  const dispatch = useAppDispatch();
  const selectedNode = useAppSelector(selectSelectedNode);
  const selectedComponentType = selectedNode?.type;
  const entityModels = useAppSelector(entityModelSelectors.selectAll);
  const [form] = Form.useForm();
  const selectedEntityModelId = Form.useWatch('entityModelId', form);

  const handleValuesChange = (changedValues: Record<string, any>) => {
    if (!selectedNode?.id) return;
    dispatch(
      componentTreeActions.updateNode({
        id: selectedNode.id,
        updates: { props: { ...selectedNode.props, ...changedValues } },
      }),
    );
  };

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

  const generateColumnsFromEntityModel = (entityModelId: string) => {
    const entityModel = entityModels.find((et) => et.id === entityModelId);
    if (!entityModel) return [];
    return entityModel.fields.map(createProCommonColumnFromSchemeField);
  }

  if (!hasGroups) {
    return (
      <>
        <div style={formStyles}>
          <ProCard
            title={`配置：${selectedNode.name}`}
            headerBordered
          >
            <BetaSchemaForm
              initialValues={selectedNode.props}
              onValuesChange={handleValuesChange}
              form={form}
              submitter={false}
              columns={propAttrs.map((attir) => {
                const valueType = VALUE_TYPE_ENUM_MAP[attir.type] || attir.type || "text";
                const result = ({
                  title: attir.label,
                  dataIndex: attir.name,
                  valueType,
                  tooltip: attir.description,
                  fieldProps: {
                    options: attir.options,
                  }
                }) as ProFormColumnsType<any>;
                if (attir.name === 'columns') {
                  result.tooltip = undefined
                  result.formItemProps = {
                    className: 'schema-list-form-item',
                    label: (
                      <Flex align="center" justify="space-between" gap={8} style={{ width: '100%' }}>
                        <Typography.Text style={{ flex: 1 }}>
                          {attir.label}
                        </Typography.Text>
                        <Button
                          hidden={!selectedEntityModelId}
                          size='small'
                          type='text'
                          title="从实体模型添加列定义"
                          onClick={(e) => {
                            e.stopPropagation();
                            dispatch(componentTreeActions.updateNode({
                              id: selectedNode.id,
                              updates: {
                                props: {
                                  ...selectedNode.props,
                                  columns: generateColumnsFromEntityModel(selectedEntityModelId)
                                }
                              }
                            }))
                          }}
                          icon={<NodeExpandOutlined />}
                        />
                        <Button
                          size='small'
                          type='text'
                          title="新增列定义"
                          onClick={(e) => {
                            e.stopPropagation();
                            dispatch(componentTreeActions.startAddingColumn())
                          }}
                          icon={<PlusOutlined />}
                        />
                      </Flex>
                    ),
                  };
                  result.renderFormItem = (...args) => {
                    return (<SchemaList selectedNode={selectedNode} />)
                  };
                } else if (attir.name === 'entityModelId') {
                  result.valueEnum = entityModels.reduce((acc, et) => {
                    acc[et.id] = { text: et.name };
                    return acc;
                  }, {} as Record<string, { text: string }>);
                }
                return result;
              })}
            />
          </ProCard>
        </div>
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
          <BetaSchemaForm
            initialValues={selectedNode.props}
            onValuesChange={handleValuesChange}
            submitter={false}
            columns={items.map((item) => {
              const valueType = VALUE_TYPE_ENUM_MAP[item.type] || item.type || "text";
              const result = ({
                title: item.label,
                dataIndex: item.name,
                valueType,
                tooltip: item.description,
                fieldProps: {
                  options: item.options,
                }
              }) as ProFormColumnsType<any>;
              if (item.name === 'columns') {
                result.renderFormItem = () => (
                  <SchemaList selectedNode={selectedNode} />
                );
              } if (item.name === 'entityModelId') {
                result.valueEnum = entityModels.reduce((acc, et) => {
                  acc[et.id] = { text: et.name };
                  return acc;
                }, {} as Record<string, { text: string }>);
              }
              return result;
            })}
          />
        </ProCard>
      ))}
    </div>
  );
};

export default PropertyPanel;
