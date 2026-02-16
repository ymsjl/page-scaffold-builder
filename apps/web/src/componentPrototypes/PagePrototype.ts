import type { ComponentPrototype } from '@/types';

export const PagePrototype: ComponentPrototype = {
  name: 'Page',
  label: '页面组件',
  description: '页面顶层容器组件',
  isContainer: true,
  component: 'div' as unknown as React.ComponentType<any>,
  defaultProps: {},
  propsTypes: {
    path: {
      name: 'path',
      type: 'string',
      label: '页面路径',
      description: '页面的访问路径',
      defaultValue: '/',
    },
    searchParams: {
      name: 'searchParams',
      type: 'object',
      label: '搜索参数',
      description: '页面的默认搜索参数',
      defaultValue: {},
    },
  },
  slots: [
    {
      id: 'page.children',
      path: 'children',
      label: '页面内容',
      kind: 'reactNodeArray',
      renderMode: 'inline',
      wrap: true,
      placeholder: '拖入页面内容',
    },
  ],
};
