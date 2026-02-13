import type { ComponentPrototype, ComponentType } from "@/types";
import ProTableForPreview from "@/components/ComponentPreview/ProTableForPreview/ProTableForPreview";
import ProTableForPurePreview from "@/components/ComponentPreview/ProTableForPreview/ProTableForPurePreview";
import { Button, Modal } from "antd";
import { COMPONENT_TYPES } from "./types/Component";
import { ProDescriptions } from "@ant-design/pro-components";
import type { PreviewMode } from "@/components/ComponentPreview/previewMode";
import ModalForPreview from "./components/ComponentPreview/ModalForPreview/ModalForPreview";

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
    Description: {
      name: "Description",
      label: "描述组件",
      description: "用于显示文本描述的组件",
      isContainer: false,
      component: ProDescriptions,
      defaultProps: {
        columns: [],
        layout: "vertical",
      },
      propsTypes: {
        entityModelId: {
          name: "entityModelId",
          type: "enum",
          label: "实体模型",
          description: "描述项对应的数据实体模型",
          defaultValue: "",
          group: "列配置",
        },
        columns: {
          name: "columns",
          type: "array",
          label: "描述项配置",
          description: "定义描述项的配置",
          defaultValue: [],
          group: "列配置",
        },
        layout: {
          name: "layout",
          type: "enum",
          label: "布局方式",
          group: "布局配置",
          description: "描述组件的布局方式",
          options: [
            { label: "垂直", value: "vertical" },
            { label: "水平", value: "horizontal" },
          ],
          defaultValue: "vertical",
        },
      },
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
      component: ProTableForPreview,
      defaultProps: {
        headerTitle: "示例表格",
        ignoreRules: false,
        search: {
          layout: "vertical",
          defaultCollapsed: false,
        },
        form: {
          ignoreRules: false,
        },
        toolbar: {
          actions: [
            // { text: "提交", type: "primary", key: "submitButton" }
          ],
        },
      },
      propsTypes: {
        entityModelId: {
          name: "entityModelId",
          type: "enum",
          label: "实体模型",
          description: "表格对应的数据实体模型",
          defaultValue: "",
          group: "列配置",
        },
        columns: {
          name: "columns",
          type: "array",
          label: "表格列配置",
          group: "列配置",
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
            },
          ],
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
            },
          ],
        },
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
          group: "列配置",
        },
        columns: {
          name: "columns",
          type: "array",
          label: "表单列配置",
          group: "列配置",
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
        },
      },
    },
    Modal: {
      name: "Modal",
      label: "模态框组件",
      description: "基于 Ant Design Modal 的模态框组件",
      isContainer: true,
      component: ModalForPreview,
      defaultProps: {
        open: false,
      },
      propsTypes: {
        title: {
          name: "title",
          type: "string",
          label: "模态框标题",
          description: "模态框的标题文字",
          defaultValue: "模态框标题",
        },
        width: {
          name: "width",
          type: "number",
          label: "模态框宽度",
          description: "模态框的宽度，单位像素",
          defaultValue: 520,
        },
        open: {
          name: "open",
          type: "boolean",
          label: "是否打开",
          description: "控制模态框的显示与隐藏",
          defaultValue: false,
        },
        onCancel: {
          name: "onCancel",
          type: "actionFlow",
          label: "取消事件动作流",
          description: "模态框取消事件触发的动作流",
          defaultValue: null,
        },
      },
      slots: [
        {
          id: "modal.children",
          path: "children",
          label: "模态框内容",
          kind: "reactNodeArray",
          acceptTypes: ["Form", "Button", "Description", "Table", "Text"],
          renderMode: "inline",
          wrap: true,
          placeholder: "拖入 模态框内容",
        },
      ],
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
  };

export const getComponentPrototype = (
  type: ComponentType,
  options?: { previewMode?: PreviewMode },
): ComponentPrototype | undefined => {
  const base = componentPrototypeMap[type];
  if (!base) return undefined;

  const previewMode = options?.previewMode ?? "edit";
  if (type === "Table" && previewMode === "pure") {
    return {
      ...base,
      component: ProTableForPurePreview,
    };
  }

  return base;
};

export const availableComponents = COMPONENT_TYPES.filter(
  (type) => type !== "Page",
).map((type) => ({
  type,
  label: componentPrototypeMap[type]?.label ?? type,
  isContainer: componentPrototypeMap[type]?.isContainer ?? false,
}));
