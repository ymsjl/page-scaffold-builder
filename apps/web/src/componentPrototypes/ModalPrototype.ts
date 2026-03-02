import type { ComponentPrototype } from '@/types';
import { getRegisteredComponent } from '../componentRegistry';

export const ModalPrototype: ComponentPrototype = {
  name: 'Modal',
  label: '模态框组件',
  description: '基于 Ant Design Modal 的模态框组件',
  isContainer: true,
  get component() {
    return getRegisteredComponent('ModalForPreview');
  },
  defaultProps: {
    open: false,
    title: '模态框标题',
    children: [],
  },
  propsTypes: {
    title: {
      name: 'title',
      type: 'string',
      label: '模态框标题',
      description: '模态框的标题文字',
      defaultValue: '模态框标题',
    },
    width: {
      name: 'width',
      type: 'number',
      label: '模态框宽度',
      description: '模态框的宽度，单位像素',
      defaultValue: 520,
    },
    open: {
      name: 'open',
      type: 'boolean',
      label: '是否打开',
      description: '控制模态框的显示与隐藏',
      defaultValue: false,
    },
    children: {
      name: 'children',
      type: 'reactNodeArray',
      label: '模态框内容',
      description: '模态框内的子组件',
      acceptTypes: ['Form', 'Button', 'Description', 'Table', 'Text'],
      valueType: 'nodeRefList',
      defaultValue: [],
    },
  },
  supportedEvents: [
    {
      eventName: 'onCancel',
      label: '取消事件',
      description: '用户关闭模态框时触发',
    },
  ],
};
