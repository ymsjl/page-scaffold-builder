import React, { useCallback, useEffect, useMemo } from "react";
import { ProCard, BetaSchemaForm, ProFormColumnsType } from "@ant-design/pro-components";
import { Button, Flex, Form, Typography } from "antd";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { entityModelSelectors } from "@/store/componentTree/componentTreeSelectors";
import { selectSelectedNode } from "@/store/componentTree/componentTreeSelectors";
import { componentTreeActions } from "@/store/componentTree/componentTreeSlice";
import { SchemaList } from "../SchemaBuilderModal/SchemaList";
import { getComponentPrototype } from "@/componentMetas";
import { PropAttribute } from "@/types";
import { VALUE_TYPE_ENUM_MAP } from "../SchemaBuilderModal/constants";
import { PlusOutlined } from "@ant-design/icons";
import { merge } from "lodash-es";

import "./styles.css";

// 深合并工具函数
function deepMerge(target: any, source: any): any {
  // 使用 lodash.merge 实现深合并，并保持返回新对象的语义
  return merge({}, target, source);
}

interface FlattenedPropAttribute extends Omit<PropAttribute, 'name'> {
  name: string | string[];
  isObjectChild?: boolean; // 标记是否为对象的子属性
}

function flattenPropAttributes(attrs: PropAttribute[]): FlattenedPropAttribute[] {
  const result: FlattenedPropAttribute[] = [];

  for (const attr of attrs) {
    // 如果是对象类型且有 children，则创建分组并展开子属性
    if (attr.type === 'object' && attr.children && attr.children.length > 0) {
      // 为每个子属性添加路径前缀和分组信息
      for (const child of attr.children) {
        result.push({
          ...child,
          name: [attr.name, child.name], // 使用数组路径
          group: attr.label, // 使用父属性的 label 作为分组名
          isObjectChild: true,
        });
      }
    } else {
      // 普通属性保持不变
      result.push(attr);
    }
  }

  return result;
}

const EMPTY_STATE_STYLE: React.CSSProperties = {
  border: "1px solid #e8e8e8",
  borderRadius: "4px",
  background: "white",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  height: "100%",
  color: "#999",
};

const NO_CONFIG_STYLE: React.CSSProperties = {
  border: "1px solid #e8e8e8",
  borderRadius: "4px",
  background: "white",
  padding: "24px",
  textAlign: "center",
  color: "#999",
};

const FORM_STYLES: React.CSSProperties = {
  height: "100%",
  overflowY: "auto",
};

const PropertyPanel: React.FC = () => {
  const dispatch = useAppDispatch();
  const selectedNode = useAppSelector(selectSelectedNode);
  const selectedComponentType = selectedNode?.type;
  const entityModels = useAppSelector(entityModelSelectors.selectAll);
  const [form] = Form.useForm();

  useEffect(() => {
    form.resetFields();
  }, [selectedNode?.id, form])

  const handleValuesChange = useCallback(
    (changedValues: Record<string, any>) => {
      if (!selectedNode?.id) return;
      // 使用深合并避免覆盖嵌套对象的其他属性
      const mergedProps = deepMerge(selectedNode.props, changedValues);
      dispatch(
        componentTreeActions.updateNode({
          id: selectedNode.id,
          updates: { props: mergedProps },
        }),
      );
    },
    [dispatch, selectedNode],
  );

  const entityModelOptions = useMemo(
    () =>
      entityModels.map((et) => ({
        name: et.name,
        value: et.id,
        label: et.name,
      })),
    [entityModels],
  );

  const entityModelValueEnum = useMemo(
    () =>
      entityModels.reduce((acc, et) => {
        acc[et.id] = { text: et.name };
        return acc;
      }, {} as Record<string, { text: string }>),
    [entityModels],
  );

  const propAttrs = useMemo(() => {
    if (!selectedComponentType) return [] as FlattenedPropAttribute[];
    const attrs = Object.values(
      getComponentPrototype(selectedComponentType)?.propsTypes ?? {},
    ).map((item) => ({
      ...item,
      ...(item.name === "entityModelId" ? { options: entityModelOptions } : {}),
    }));
    // 扁平化对象类型属性
    return flattenPropAttributes(attrs);
  }, [selectedComponentType, entityModelOptions]);

  const handleStartAddingColumn = useCallback(() => {
    dispatch(componentTreeActions.startAddingColumn());
  }, [dispatch]);

  const renderSchemaList = useCallback(
    () => <SchemaList />,
    [],
  );

  const createColumn = useCallback(
    (item: FlattenedPropAttribute) => {
      const valueType = VALUE_TYPE_ENUM_MAP[item.type] || item.type || "text";
      // 支持数组路径（用于嵌套对象属性）
      const nameOrPath = item.name;
      const result = {
        title: item.label,
        dataIndex: nameOrPath,
        name: nameOrPath, // ProFormColumnsType 也需要 name 字段
        valueType,
        tooltip: item.description,
        fieldProps: {
          options: item.options,
        },
      } as ProFormColumnsType<any>;

      // 检查 name 是否为 "columns"（兼容字符串和数组路径）
      const itemName = Array.isArray(item.name) ? item.name[item.name.length - 1] : item.name;

      if (itemName === "columns") {
        result.renderFormItem = renderSchemaList;
        result.tooltip = undefined;
        result.formItemProps = {
          className: "schema-list-form-item",
          label: (
            <Flex align="center" justify="space-between" gap={8} style={{ width: "100%" }}>
              <Typography.Text style={{ flex: 1 }}>
                {item.label}
              </Typography.Text>

              <Button
                size="small"
                type="text"
                title="新增列定义"
                onClick={(e) => {
                  e.stopPropagation();
                  handleStartAddingColumn();
                }}
                icon={<PlusOutlined />}
              />
            </Flex>
          ),
        };
      } else if (itemName === "entityModelId") {
        result.valueEnum = entityModelValueEnum;
      }

      return result;
    },
    [
      entityModelValueEnum,
      handleStartAddingColumn,
      renderSchemaList,
    ],
  );

  if (!selectedNode) {
    return <div style={EMPTY_STATE_STYLE}>请选择一个组件实例</div>;
  }

  if (propAttrs.length === 0) {
    return (
      <div style={NO_CONFIG_STYLE}>组件 {selectedNode.type} 暂无可配置属性</div>
    );
  }

  const hasGroups = propAttrs.some((propAttr) => propAttr.group);

  if (!hasGroups) {
    return (
      <ProCard
        title={`属性面板：${selectedNode.name}`}
        headerBordered
        bordered
        size="small"
        style={{ borderRadius: "8px" }}
        bodyStyle={{ padding: "16px" }}
      >
        <BetaSchemaForm
          initialValues={selectedNode.props}
          onValuesChange={handleValuesChange}
          clearOnDestroy={false}
          form={form}
          submitter={false}
          columns={propAttrs.map((item) => createColumn(item))}
        />
      </ProCard>
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
    {} as Record<string, FlattenedPropAttribute[]>,
  );

  return (
    <div style={FORM_STYLES}>
      {
        Object.entries(groupedPropAttr).map(([groupName, items]) => (
          <ProCard
            key={groupName}
            size="small"
            title={groupName}
            headerBordered
            collapsible
            defaultCollapsed={false}
            bordered
            style={{ borderRadius: "8px" }}
            bodyStyle={{ padding: "16px" }}
          >
            <BetaSchemaForm
              initialValues={selectedNode.props}
              onValuesChange={handleValuesChange}
              form={form}
              submitter={false}
              columns={items.map((item) => createColumn(item))}
              defaultCollapsed={groupName !== "基础配置"}
            />
          </ProCard>
        ))
      }
    </div >
  );
};

export default PropertyPanel;
