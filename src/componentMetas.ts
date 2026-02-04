import type { ComponentPrototype, ComponentType } from "@/types";
import { ProTable } from "@ant-design/pro-components";
import { COMPONENT_TYPES } from "./types/Component";

export const componentPrototypeMap: Record<ComponentType, ComponentPrototype> =
{
  Page: {
    name: "Page",
    label: "页面组件",
    description: "页面顶层容器组件",
    isContainer: true,
    component: "div" as unknown as React.ComponentType<any>,
    defaultProps: {},
    propsTypes: {
      path: {
        name: "path",
        type: "string",
        label: "页面路径",
        description: "页面的访问路径",
        defaultValue: "/",
      },
      searchParams: {
        name: "searchParams",
        type: "object",
        label: "搜索参数",
        description: "页面的默认搜索参数",
        defaultValue: {},
      },

    },
  },
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
        defaultCollapsed: false,
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
        group: '列配置',
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
        children: [
          {
            name: "defaultPageSize",
            label: "默认每页条数",
            type: "number",
            description: "每页显示的数据条数",
            defaultValue: 10,
          },
          {
            name: "showSizeChanger",
            label: "显示页码切换器",
            type: "boolean",
            description: "是否显示改变每页条数的选择器",
            defaultValue: true,
          },
        ],
      },
      rowKey: {
        name: "rowKey",
        type: "string",
        label: "行键值",
        description: "表格行 key 的取值",
        defaultValue: "id",
      },
      ghost: {
        name: "ghost",
        type: "boolean",
        label: "幽灵模式",
        description: "表格是否启用幽灵模式",
        defaultValue: false,
      },
      search: {
        name: "search",
        type: "object",
        label: "搜索配置",
        description: "搜索表单的配置",
        children: [
          {
            name: "layout",
            label: "布局方式",
            type: "enum",
            description: "搜索表单的布局方式",
            options: [
              { label: "垂直", value: "vertical" },
              { label: "水平", value: "horizontal" },
            ],
            defaultValue: "vertical",
          },
          {
            name: "defaultCollapsed",
            label: "默认折叠",
            type: "boolean",
            description: "搜索表单是否默认折叠",
            defaultValue: false,
          }
        ],
      }
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
      grid: true,
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
        group: '列配置',
        description: "定义表单的列信息",
        defaultValue: [],
      },
      layout: {
        name: "layout",
        type: "enum",
        label: "布局方式",
        group: "布局配置",
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
};

export const getComponentPrototype = (
  type: ComponentType,
): ComponentPrototype | undefined => {
  return componentPrototypeMap[type];
};

export const availableComponents = COMPONENT_TYPES
  .filter(type => type !== "Page")
  .map((type) => ({
    type,
    label: componentPrototypeMap[type]?.name ?? type,
    isContainer: componentPrototypeMap[type]?.isContainer ?? false,
  }));
