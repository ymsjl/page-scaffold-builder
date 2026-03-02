import type { ComponentPrototype } from '@/types';
import { getRegisteredComponent } from '../componentRegistry';

export const CardPrototype: ComponentPrototype = {
  name: 'Card',
  label: '卡片组件',
  description: '具有标题、内容和底部区域的卡片容器组件',
  isContainer: true,
  get component() {
    return getRegisteredComponent('CardForPreview');
  },
  defaultProps: {
    title: [],
    children: [],
    footer: [],
    bordered: true,
  },
  propsTypes: {
    bordered: {
      name: 'bordered',
      type: 'boolean',
      label: '显示边框',
      description: '卡片是否显示边框',
      defaultValue: true,
    },
    bodyStyle: {
      name: 'bodyStyle',
      type: 'object',
      label: '内容区域样式',
      description: '卡片内容区域样式',
      defaultValue: {},
    },
    title: {
      name: 'title',
      type: 'reactNodeArray',
      label: '卡片标题',
      description: '卡片标题内容',
      defaultValue: [],
    },
    children: {
      name: 'children',
      type: 'reactNodeArray',
      label: '卡片内容',
      description: '卡片主体内容',
      defaultValue: [],
    },
    footer: {
      name: 'footer',
      type: 'reactNodeArray',
      label: '卡片底部',
      description: '卡片底部内容',
      defaultValue: [],
    },
  },
};
