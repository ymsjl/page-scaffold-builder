import type { ComponentPrototype } from '@/types';
import { getRegisteredComponent } from '../componentRegistry';

export const ButtonPrototype: ComponentPrototype = {
  name: 'Button',
  label: '按钮组件',
  description: 'Ant Design 按钮组件',
  isContainer: false,
  get component() {
    return getRegisteredComponent('Button');
  },
  defaultProps: {
    type: 'default',
    size: 'middle',
    children: '按钮',
  },
  propsTypes: {
    children: {
      name: 'children',
      type: 'string',
      label: '按钮文本',
      description: '按钮显示的文本内容',
      defaultValue: '按钮',
    },
    type: {
      name: 'type',
      type: 'enum',
      label: '按钮类型',
      description: '按钮的样式类型',
      options: [
        { label: '默认', value: 'default' },
        { label: '主要', value: 'primary' },
        { label: '虚线', value: 'dashed' },
        { label: '链接', value: 'link' },
        { label: '文本', value: 'text' },
      ],
      defaultValue: 'default',
    },
    size: {
      name: 'size',
      type: 'enum',
      label: '按钮尺寸',
      description: '按钮的大小',
      options: [
        { label: '大', value: 'large' },
        { label: '中', value: 'middle' },
        { label: '小', value: 'small' },
      ],
      defaultValue: 'middle',
    },
    danger: {
      name: 'danger',
      type: 'boolean',
      label: '危险按钮',
      description: '设置危险按钮样式',
      defaultValue: false,
    },
    disabled: {
      name: 'disabled',
      type: 'boolean',
      label: '禁用状态',
      description: '按钮是否禁用',
      defaultValue: false,
    },
    loading: {
      name: 'loading',
      type: 'boolean',
      label: '加载状态',
      description: '按钮是否处于加载状态',
      defaultValue: false,
    },
    block: {
      name: 'block',
      type: 'boolean',
      label: '块级按钮',
      description: '将按钮宽度调整为其父宽度',
      defaultValue: false,
    },
    ghost: {
      name: 'ghost',
      type: 'boolean',
      label: '幽灵按钮',
      description: '幽灵属性，使按钮背景透明',
      defaultValue: false,
    },
    htmlType: {
      name: 'htmlType',
      type: 'enum',
      label: 'HTML类型',
      description: '设置 button 原生的 type 值',
      options: [
        { label: 'button', value: 'button' },
        { label: 'submit', value: 'submit' },
        { label: 'reset', value: 'reset' },
      ],
      defaultValue: 'button',
    },
    onClick: {
      name: 'onClick',
      type: 'actionFlow',
      label: '点击事件动作流',
      description: '按钮点击时触发的动作流',
      defaultValue: null,
    },
  },
  supportedEvents: [
    {
      eventName: 'onClick',
      label: '点击事件',
      description: '用户点击按钮时触发',
    },
  ],
};
