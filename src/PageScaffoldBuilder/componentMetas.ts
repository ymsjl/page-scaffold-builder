import { COMPONENT_TYPES, ComponentPrototype, ComponentType } from './types';
import ProTableGenerate from './shims/ProTableGenerate';

export const componentMetas: Record<ComponentType, ComponentPrototype> = {
  Table: {
    name: 'Table',
    label: '表格组件',
    description: '基于 ProTable 的表格组件',
    isContainer: false,
    component: ProTableGenerate,
    defaultProps: {
      headerTitle: '示例表格',
      search: false,
    },
    propsTypes: {
      headerTitle: {
        name: 'headerTitle',
        type: 'string',
        label: '表格标题',
        description: '表格的标题文字',
        defaultValue: '示例表格',
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
      },
      rowKey: {
        name: 'rowKey',
        type: 'string',
        label: '行键值',
        description: '表格行 key 的取值',
        defaultValue: 'id',
      },
    },
  },

  Container: {
    name: 'Container',
    label: '容器组件',
    description: '用于包裹其他组件的容器',
    isContainer: true,
    component: 'div' as unknown as React.ComponentType<any>,
    defaultProps: {},
    propsTypes: {},
  },
};

export const getComponentMeta = (type: string): ComponentPrototype | undefined => {
  return componentMetas[type];
};

// 为了精简来源（只保留最必要的组件以便后续扩展），此处仅返回 Table 与 Form 两种可添加组件
export const getAvailableComponents = () => {
  return COMPONENT_TYPES.map(type => ({
    type,
    label: componentMetas[type]?.name ?? type,
    isContainer: componentMetas[type]?.isContainer ?? false,
  }));
};