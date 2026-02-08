import type { ComponentPrototype, ComponentType } from "@/types";
import { ProTable } from "@ant-design/pro-components";
import { Button, Col, Flex, Row } from "antd";
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
    slots: [
      {
        id: "page.children",
        path: "children",
        label: "页面内容",
        kind: "reactNodeArray",
        renderMode: "inline",
        wrap: true,
        placeholder: "拖入页面内容",
      },
    ],
  },
  Text: {
    name: "Text",
    label: "文本组件",
    description: "用于显示文本内容的组件",
    isContainer: false,
    component: "span" as unknown as React.ComponentType<any>,
    defaultProps: {
      children: "文本内容",
    },
    propsTypes: {
      children: {
        name: "children",
        type: "string",
        label: "文本内容",
        description: "要显示的文本内容",
        defaultValue: "文本内容",
      },
      style: {
        name: "style",
        type: "object",
        label: "文本样式",
        description: "文本的 CSS 样式对象",
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
      },
      toolbar: {
        actions: [
          // { text: "提交", type: "primary", key: "submitButton" }
        ]
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
      rowActions: {
        name: "rowActions",
        type: "reactNodeArray",
        label: "行操作按钮",
        description: "表格行操作按钮（可拖拽 Button 组件）",
        acceptTypes: ["Button"],
        defaultValue: [],
        group: "列配置",
      },
      headerTitle: {
        name: "headerTitle",
        type: "string",
        label: "表格标题",
        description: "表格的标题文字",
        defaultValue: "示例表格",
      },
      toolbar: {
        name: "toolbar",
        type: "object",
        label: "工具栏配置",
        group: "操作栏",
        children: [
          {
            name: "actions",
            type: "reactNodeArray",
            label: "操作按钮",
            description: "工具栏操作按钮（可拖拽 Button 组件）",
            acceptTypes: ["Button"],
            defaultValue: [],
          }
        ]
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
    slots: [
      {
        id: "table.toolbar.actions",
        path: "toolbar.actions",
        label: "表格操作按钮",
        kind: "reactNodeArray",
        acceptTypes: ["Button"],
        renderMode: "inline",
        wrap: true,
        placeholder: "拖入 表格操作按钮",
      },
    ],
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
      onFinish: {
        name: "onFinish",
        type: "actionFlow",
        label: "提交成功动作流",
        description: "表单提交成功后触发的动作流",
        defaultValue: null,
      }
    },
  },
  Button: {
    name: "Button",
    label: "按钮组件",
    description: "Ant Design 按钮组件",
    isContainer: false,
    component: Button,
    defaultProps: {
      type: "default",
      size: "middle",
      children: "按钮",
    },
    propsTypes: {
      children: {
        name: "children",
        type: "string",
        label: "按钮文本",
        description: "按钮显示的文本内容",
        defaultValue: "按钮",
      },
      type: {
        name: "type",
        type: "enum",
        label: "按钮类型",
        description: "按钮的样式类型",
        options: [
          { label: "默认", value: "default" },
          { label: "主要", value: "primary" },
          { label: "虚线", value: "dashed" },
          { label: "链接", value: "link" },
          { label: "文本", value: "text" },
        ],
        defaultValue: "default",
      },
      size: {
        name: "size",
        type: "enum",
        label: "按钮尺寸",
        description: "按钮的大小",
        options: [
          { label: "大", value: "large" },
          { label: "中", value: "middle" },
          { label: "小", value: "small" },
        ],
        defaultValue: "middle",
      },
      danger: {
        name: "danger",
        type: "boolean",
        label: "危险按钮",
        description: "设置危险按钮样式",
        defaultValue: false,
      },
      disabled: {
        name: "disabled",
        type: "boolean",
        label: "禁用状态",
        description: "按钮是否禁用",
        defaultValue: false,
      },
      loading: {
        name: "loading",
        type: "boolean",
        label: "加载状态",
        description: "按钮是否处于加载状态",
        defaultValue: false,
      },
      block: {
        name: "block",
        type: "boolean",
        label: "块级按钮",
        description: "将按钮宽度调整为其父宽度",
        defaultValue: false,
      },
      ghost: {
        name: "ghost",
        type: "boolean",
        label: "幽灵按钮",
        description: "幽灵属性，使按钮背景透明",
        defaultValue: false,
      },
      htmlType: {
        name: "htmlType",
        type: "enum",
        label: "HTML类型",
        description: "设置 button 原生的 type 值",
        options: [
          { label: "button", value: "button" },
          { label: "submit", value: "submit" },
          { label: "reset", value: "reset" },
        ],
        defaultValue: "button",
      },
      onClick: {
        name: "onClick",
        type: "actionFlow",
        label: "点击事件动作流",
        description: "按钮点击时触发的动作流",
        defaultValue: null,
      },
    },
    supportedEvents: [
      {
        eventName: "onClick",
        label: "点击事件",
        description: "用户点击按钮时触发",
      },
    ],
  },
  Row: {
    name: "Row",
    label: "行布局",
    description: "Ant Design 栅格 Row",
    isContainer: true,
    component: Row,
    defaultProps: {
      gutter: 16,
      align: "top",
      justify: "start",
      wrap: true,
    },
    propsTypes: {
      gutter: {
        name: "gutter",
        type: "number",
        label: "间距",
        description: "栅格列之间的间距",
        defaultValue: 16,
      },
      align: {
        name: "align",
        type: "enum",
        label: "垂直对齐",
        description: "子元素的垂直对齐方式",
        options: [
          { label: "顶部", value: "top" },
          { label: "居中", value: "middle" },
          { label: "底部", value: "bottom" },
          { label: "拉伸", value: "stretch" },
        ],
        defaultValue: "top",
      },
      justify: {
        name: "justify",
        type: "enum",
        label: "水平对齐",
        description: "子元素的水平对齐方式",
        options: [
          { label: "左对齐", value: "start" },
          { label: "右对齐", value: "end" },
          { label: "居中", value: "center" },
          { label: "两端对齐", value: "space-between" },
          { label: "等距", value: "space-around" },
          { label: "平均分布", value: "space-evenly" },
        ],
        defaultValue: "start",
      },
      wrap: {
        name: "wrap",
        type: "boolean",
        label: "自动换行",
        description: "子元素是否自动换行",
        defaultValue: true,
      },
    },
    slots: [
      {
        id: "row.children",
        path: "children",
        label: "行内容",
        kind: "reactNodeArray",
        renderMode: "inline",
        wrap: true,
        placeholder: "拖入行内容",
      },
    ],
  },
  Col: {
    name: "Col",
    label: "列布局",
    description: "Ant Design 栅格 Col",
    isContainer: true,
    component: Col,
    defaultProps: {
      span: 24,
    },
    propsTypes: {
      span: {
        name: "span",
        type: "number",
        label: "栅格占位",
        description: "当前列所占的栅格数量",
        defaultValue: 24,
      },
      offset: {
        name: "offset",
        type: "number",
        label: "左侧间隔",
        description: "栅格左侧的间隔格数",
        defaultValue: 0,
      },
      order: {
        name: "order",
        type: "number",
        label: "排序",
        description: "栅格顺序",
        defaultValue: 0,
      },
    },
    slots: [
      {
        id: "col.children",
        path: "children",
        label: "列内容",
        kind: "reactNodeArray",
        renderMode: "inline",
        wrap: true,
        placeholder: "拖入列内容",
      },
    ],
  },
  Flex: {
    name: "Flex",
    label: "Flex 布局",
    description: "Ant Design Flex 容器",
    isContainer: true,
    component: Flex,
    defaultProps: {
      gap: 8,
      align: "center",
      justify: "start",
      wrap: "wrap",
      vertical: false,
    },
    propsTypes: {
      gap: {
        name: "gap",
        type: "number",
        label: "间距",
        description: "子元素之间的间距",
        defaultValue: 8,
      },
      align: {
        name: "align",
        type: "enum",
        label: "垂直对齐",
        description: "交叉轴对齐方式",
        options: [
          { label: "起点", value: "flex-start" },
          { label: "居中", value: "center" },
          { label: "终点", value: "flex-end" },
          { label: "拉伸", value: "stretch" },
          { label: "基线", value: "baseline" },
        ],
        defaultValue: "center",
      },
      justify: {
        name: "justify",
        type: "enum",
        label: "水平对齐",
        description: "主轴对齐方式",
        options: [
          { label: "起点", value: "flex-start" },
          { label: "终点", value: "flex-end" },
          { label: "居中", value: "center" },
          { label: "两端对齐", value: "space-between" },
          { label: "等距", value: "space-around" },
          { label: "平均分布", value: "space-evenly" },
        ],
        defaultValue: "flex-start",
      },
      wrap: {
        name: "wrap",
        type: "enum",
        label: "换行",
        description: "子元素的换行方式",
        options: [
          { label: "不换行", value: "nowrap" },
          { label: "换行", value: "wrap" },
          { label: "反向换行", value: "wrap-reverse" },
        ],
        defaultValue: "wrap",
      },
      vertical: {
        name: "vertical",
        type: "boolean",
        label: "垂直排列",
        description: "是否按列方向排列",
        defaultValue: false,
      },
    },
    slots: [
      {
        id: "flex.children",
        path: "children",
        label: "Flex 内容",
        kind: "reactNodeArray",
        renderMode: "inline",
        wrap: true,
        placeholder: "拖入 Flex 内容",
      },
    ],
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
    label: componentPrototypeMap[type]?.label ?? type,
    isContainer: componentPrototypeMap[type]?.isContainer ?? false,
  }));
