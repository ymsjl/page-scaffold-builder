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
    onCancel: {
      name: 'onCancel',
      type: 'actionFlow',
      label: '取消事件动作流',
      description: '模态框取消事件触发的动作流',
      defaultValue: null,
    },
  },
  slots: [
    {
      id: 'modal.children',
      path: 'children',
      label: '模态框内容',
      kind: 'reactNodeArray',
      acceptTypes: ['Form', 'Button', 'Description', 'Table', 'Text'],
      renderMode: 'inline',
      wrap: true,
      placeholder: '拖入 模态框内容',
    },
  ],
};
