import type { ComponentPrototype } from '@/types';
import { getRegisteredComponent } from '../componentRegistry';

export const FormPrototype: ComponentPrototype = {
  name: 'Form',
  label: '表单组件',
  description: '基于 BetaSchemaForm 的表单组件',
  isContainer: false,
  get component() {
    return getRegisteredComponent('BetaSchemaForm');
  },
  defaultProps: {
    layout: 'vertical',
    ignoreRules: false,
    grid: true,
    columns: [],
  },
  propsTypes: {
    entityModelId: {
      name: 'entityModelId',
      type: 'enum',
      label: '实体模型',
      description: '表单对应的数据实体模型',
      defaultValue: '',
      group: '列配置',
    },
    columns: {
      name: 'columns',
      type: 'array',
      label: '表单列配置',
      group: '列配置',
      description: '定义表单的列信息',
      defaultValue: [],
    },
    layout: {
      name: 'layout',
      type: 'enum',
      label: '布局方式',
      group: '布局配置',
      description: '表单的布局方式',
      options: [
        { label: '垂直', value: 'vertical' },
        { label: '水平', value: 'horizontal' },
        { label: '行内', value: 'inline' },
      ],
      defaultValue: 'vertical',
    },
    onFinish: {
      name: 'onFinish',
      type: 'actionFlow',
      label: '提交成功动作流',
      description: '表单提交成功后触发的动作流',
      defaultValue: null,
    },
  },
};
