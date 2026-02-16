import type { ComponentPrototype } from '@/types';
import { getRegisteredComponent } from '../componentRegistry';

export const DescriptionPrototype: ComponentPrototype = {
  name: 'Description',
  label: '描述组件',
  description: '用于显示文本描述的组件',
  isContainer: false,
  get component() {
    return getRegisteredComponent('ProDescriptions');
  },
  defaultProps: {
    columns: [],
    layout: 'vertical',
  },
  propsTypes: {
    entityModelId: {
      name: 'entityModelId',
      type: 'enum',
      label: '实体模型',
      description: '描述项对应的数据实体模型',
      defaultValue: '',
      group: '列配置',
    },
    columns: {
      name: 'columns',
      type: 'array',
      label: '描述项配置',
      description: '定义描述项的配置',
      defaultValue: [],
      group: '列配置',
    },
    layout: {
      name: 'layout',
      type: 'enum',
      label: '布局方式',
      group: '布局配置',
      description: '描述组件的布局方式',
      options: [
        { label: '垂直', value: 'vertical' },
        { label: '水平', value: 'horizontal' },
      ],
      defaultValue: 'vertical',
    },
  },
};
