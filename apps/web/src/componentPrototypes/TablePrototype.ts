import type { ComponentPrototype } from '@/types';
import { getRegisteredComponent } from '../componentRegistry';

export const TablePrototype: ComponentPrototype = {
  name: 'Table',
  label: '表格组件',
  description: '基于 ProTable 的表格组件',
  isContainer: false,
  get component() {
    return getRegisteredComponent('ProTableForPreview');
  },
  defaultProps: {
    headerTitle: '示例表格',
    ignoreRules: false,
    search: {
      layout: 'vertical',
      defaultCollapsed: false,
    },
    form: {
      ignoreRules: false,
    },
    toolbar: {
      actions: [],
    },
  },
  propsTypes: {
    entityModelId: {
      name: 'entityModelId',
      type: 'enum',
      label: '实体模型',
      description: '表格对应的数据实体模型',
      defaultValue: '',
      group: '列配置',
    },
    columns: {
      name: 'columns',
      type: 'array',
      label: '表格列配置',
      group: '列配置',
      description: '定义表格的列信息',
      defaultValue: [],
    },
    rowActions: {
      name: 'rowActions',
      type: 'reactNodeArray',
      label: '行操作按钮',
      description: '表格行操作按钮（可拖拽 Button 组件）',
      acceptTypes: ['Button'],
      defaultValue: [],
      group: '列配置',
    },
    headerTitle: {
      name: 'headerTitle',
      type: 'string',
      label: '表格标题',
      description: '表格的标题文字',
      defaultValue: '示例表格',
    },
    toolbar: {
      name: 'toolbar',
      type: 'object',
      label: '工具栏配置',
      group: '操作栏',
      children: [
        {
          name: 'actions',
          type: 'reactNodeArray',
          label: '操作按钮',
          description: '工具栏操作按钮（可拖拽 Button 组件）',
          acceptTypes: ['Button'],
          defaultValue: [],
        },
      ],
    },
    pagination: {
      name: 'pagination',
      label: '分页配置',
      type: 'object',
      description: '分页器的配置对象',
      defaultValue: {
        defaultPageSize: 10,
        showSizeChanger: true,
      },
      children: [
        {
          name: 'defaultPageSize',
          label: '默认每页条数',
          type: 'number',
          description: '每页显示的数据条数',
          defaultValue: 10,
        },
        {
          name: 'showSizeChanger',
          label: '显示页码切换器',
          type: 'boolean',
          description: '是否显示改变每页条数的选择器',
          defaultValue: true,
        },
      ],
    },
    rowKey: {
      name: 'rowKey',
      type: 'string',
      label: '行键值',
      description: '表格行 key 的取值',
      defaultValue: 'id',
    },
    ghost: {
      name: 'ghost',
      type: 'boolean',
      label: '幽灵模式',
      description: '表格是否启用幽灵模式',
      defaultValue: false,
    },
    search: {
      name: 'search',
      type: 'object',
      label: '搜索配置',
      description: '搜索表单的配置',
      children: [
        {
          name: 'layout',
          label: '布局方式',
          type: 'enum',
          description: '搜索表单的布局方式',
          options: [
            { label: '垂直', value: 'vertical' },
            { label: '水平', value: 'horizontal' },
          ],
          defaultValue: 'vertical',
        },
        {
          name: 'defaultCollapsed',
          label: '默认折叠',
          type: 'boolean',
          description: '搜索表单是否默认折叠',
          defaultValue: false,
        },
      ],
    },
  },
  slots: [
    {
      id: 'table.toolbar.actions',
      path: 'toolbar.actions',
      label: '表格操作按钮',
      kind: 'reactNodeArray',
      acceptTypes: ['Button'],
      renderMode: 'inline',
      wrap: true,
      placeholder: '拖入 表格操作按钮',
    },
  ],
};
