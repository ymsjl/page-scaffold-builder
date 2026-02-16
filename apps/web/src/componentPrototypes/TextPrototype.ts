import type { ComponentPrototype } from '@/types';

export const TextPrototype: ComponentPrototype = {
  name: 'Text',
  label: '文本组件',
  description: '用于显示文本内容的组件',
  isContainer: false,
  component: 'span' as unknown as React.ComponentType<any>,
  defaultProps: {
    children: '文本内容',
  },
  propsTypes: {
    children: {
      name: 'children',
      type: 'string',
      label: '文本内容',
      description: '要显示的文本内容',
      defaultValue: '文本内容',
    },
    style: {
      name: 'style',
      type: 'object',
      label: '文本样式',
      description: '文本的 CSS 样式对象',
      defaultValue: {},
    },
  },
};
