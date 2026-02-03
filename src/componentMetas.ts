import type { ComponentPrototype, ComponentType } from "@/types";
import { ProTable } from "@ant-design/pro-components";
import { COMPONENT_TYPES } from "./types/Component";

export const componentPrototypeMap: Record<ComponentType, ComponentPrototype> =
{
  Table: {
    name: "Table",
    label: "表格组件",
    description: "基于 ProTable 的表格组件",
    isContainer: false,
    component: ProTable,
    defaultProps: {
      headerTitle: "示例表格",
      ignoreRules: false,
      search: {
        layout: 'vertical',
      },
      form: {
        ignoreRules: false,
      }
    },
    propsTypes: {
      entityModelId: {
        name: "entityModelId",
        type: "enum",
        label: "实体模型",
        description: "表格对应的数据实体模型",
        defaultValue: "",
      },
      columns: {
        name: "columns",
        type: "array",
        label: "表格列配置",
        description: "定义表格的列信息",
        defaultValue: [],
      },
      headerTitle: {
        name: "headerTitle",
        type: "string",
        label: "表格标题",
        description: "表格的标题文字",
        defaultValue: "示例表格",
      },
      pagination: {
        name: "pagination",
        label: "分页配置",
        type: "object",
        description: "分页器的配置对象",
        defaultValue: {
          defaultPageSize: 10,
          showSizeChanger: true,
        },
      },
      rowKey: {
        name: "rowKey",
        type: "string",
        label: "行键值",
        description: "表格行 key 的取值",
        defaultValue: "id",
      },
    },
  },
  Form: {
    name: "Form",
    label: "表单组件",
    description: "基于 BetaSchemaForm 的表单组件",
    isContainer: false,
    component: (await import("@ant-design/pro-components")).BetaSchemaForm,
    defaultProps: {
      layout: "vertical",
      ignoreRules: false,
      columns: [],
    },
    propsTypes: {
      entityModelId: {
        name: "entityModelId",
        type: "enum",
        label: "实体模型",
        description: "表单对应的数据实体模型",
        defaultValue: "",
      },
      columns: {
        name: "columns",
        type: "array",
        label: "表单列配置",
        description: "定义表单的列信息",
        defaultValue: [],
      },
      layout: {
        name: "layout",
        type: "enum",
        label: "布局方式",
        description: "表单的布局方式",
        options: [
          { label: "垂直", value: "vertical" },
          { label: "水平", value: "horizontal" },
          { label: "行内", value: "inline" },
        ],
        defaultValue: "vertical",
      },
    },
  },
  Container: {
    name: "Container",
    label: "容器组件",
    description: "用于包裹其他组件的容器",
    isContainer: true,
    component: "div" as unknown as React.ComponentType<any>,
    defaultProps: {},
    propsTypes: {},
  },
};

export const getComponentPrototype = (
  type: ComponentType,
): ComponentPrototype | undefined => {
  return componentPrototypeMap[type];
};

// 为了精简来源（只保留最必要的组件以便后续扩展），此处仅返回 Table 与 Form 两种可添加组件
export const availableComponents = COMPONENT_TYPES.map((type) => ({
  type,
  label: componentPrototypeMap[type]?.name ?? type,
  isContainer: componentPrototypeMap[type]?.isContainer ?? false,
}));
