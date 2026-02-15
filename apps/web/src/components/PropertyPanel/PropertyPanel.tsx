import React, { useCallback, useEffect, useMemo } from 'react';
import { ProCard, BetaSchemaForm, type ProFormColumnsType } from '@ant-design/pro-components';
import { Button, Flex, Form, Input, InputNumber, List, Select, Space, Typography } from 'antd';
import { AppstoreOutlined, LeftOutlined, PlusOutlined, RightOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  componentNodesSelectors,
  selectColumnsOfSelectedNode,
  selectNodeInPropertyPanel,
} from '@/store/componentTreeSlice/componentTreeSelectors';
import { variableSelectors } from '@/store/variablesSlice/selectors';
import { entityModelSelectors } from '@/store/entityModelSlice/selectors';
import { selectShowBackInPropertyPanel } from '@/store/propertyPanelSlice/selectors';
import {
  pushNodeToPropertyPanel,
  popNodeFromPropertyPanel,
} from '@/store/propertyPanelSlice/propertyPanelSlice';
import {
  updateNodeProps,
  addNodeToSlot,
  upsertColumnOfSelectedNode,
} from '@/store/componentTreeSlice/componentTreeSlice';
import { startAddingColumn } from '@/store/columnEditorSlice/columnEditorSlice';
import { getComponentPrototype } from '@/componentMetas';
import {
  type ComponentNode,
  isNodeRef,
  isVariableRef,
  type PropAttribute,
  type PrimitiveVariableValue,
} from '@/types';
import { SchemaList } from '../SchemaBuilderModal/SchemaList';
import { VALUE_TYPE_ENUM_MAP } from '../SchemaBuilderModal/constants';
import { ActionFlowSelector } from './ActionFlowSelector';
import { getValueByPath } from '../ComponentPreview/slotPath';

import * as panelStyles from './styles.css';
import { generateDataSource } from '../ComponentPreview/ProTableForPreview/mapValueTypeToValue';

interface FlattenedPropAttribute extends Omit<PropAttribute, 'name'> {
  name: string | string[];
  isObjectChild?: boolean; // 标记是否为对象的子属性
}

function flattenPropAttributes(attrs: PropAttribute[]): FlattenedPropAttribute[] {
  return attrs.flatMap((attr) => {
    // 如果是对象类型且有 children，则创建分组并展开子属性
    if (attr.type === 'object' && attr.children && attr.children.length > 0) {
      // 为每个子属性添加路径前缀和分组信息
      return attr.children.map((child) => ({
        ...child,
        name: [attr.name, child.name], // 使用数组路径
        group: attr.label, // 使用父属性的 label 作为分组名
        isObjectChild: true,
      })) as FlattenedPropAttribute[];
    }
    // 普通属性保持不变
    return [attr] as FlattenedPropAttribute[];
  });
}

const normalizePropPath = (name: string | string[]) =>
  Array.isArray(name) ? name.join('.') : name;

const buildNestedPropValue = (name: string | string[], value: unknown) => {
  if (!Array.isArray(name)) {
    return { [name]: value };
  }
  return name
    .slice()
    .reverse()
    .reduce((acc, current) => ({ [current]: acc }), value as any);
};

const isPrimitivePropType = (type: FlattenedPropAttribute['type']) =>
  type === 'string' || type === 'number' || type === 'boolean';

const getDefaultPrimitiveValue = (type: FlattenedPropAttribute['type']): PrimitiveVariableValue => {
  if (type === 'boolean') return false;
  if (type === 'number') return 0;
  return '';
};

interface VariableBindingEditorProps {
  item: FlattenedPropAttribute;
  form: ReturnType<typeof Form.useForm>[0];
  variableNames: string[];
  onSetValue: (name: string | string[], value: unknown) => void;
}

const VariableBindingEditor: React.FC<VariableBindingEditorProps> = ({
  item,
  form,
  variableNames,
  onSetValue,
}) => {
  const currentValue = Form.useWatch(item.name as any, form);
  const isVariable = isVariableRef(currentValue);

  return (
    <Flex vertical gap={8}>
      <Select
        value={isVariable ? 'variable' : 'constant'}
        options={[
          { label: '常量', value: 'constant' },
          { label: '变量', value: 'variable' },
        ]}
        onChange={(source) => {
          if (source === 'variable') {
            const fallbackVariableName = variableNames[0];
            if (!fallbackVariableName) return;
            onSetValue(item.name, {
              type: 'variableRef',
              variableName: fallbackVariableName,
            });
            return;
          }
          onSetValue(item.name, getDefaultPrimitiveValue(item.type));
        }}
      />

      {isVariable && (
        <Select
          value={currentValue?.variableName}
          options={variableNames.map((name) => ({ label: name, value: name }))}
          onChange={(variableName) => {
            onSetValue(item.name, { type: 'variableRef', variableName });
          }}
        />
      )}

      {!isVariable && item.type === 'boolean' && (
        <Select
          value={Boolean(currentValue)}
          options={[
            { label: 'true', value: true },
            { label: 'false', value: false },
          ]}
          onChange={(nextValue) => onSetValue(item.name, nextValue)}
        />
      )}

      {!isVariable && item.type === 'number' && (
        <InputNumber
          value={typeof currentValue === 'number' ? currentValue : undefined}
          className={panelStyles.fullWidthInput}
          onChange={(nextValue) => {
            if (typeof nextValue === 'number') {
              onSetValue(item.name, nextValue);
            }
          }}
        />
      )}

      {!isVariable && item.type !== 'boolean' && item.type !== 'number' && (
        <Input
          value={typeof currentValue === 'string' ? currentValue : ''}
          onChange={(event) => onSetValue(item.name, event.target.value)}
        />
      )}
    </Flex>
  );
};

const getNodeRefIdsFromProp = (
  props: Record<string, any> | undefined,
  propPath: string,
): string[] => {
  if (!props) return [];
  const value = getValueByPath(props, propPath);
  const nodeIds: string[] = [];
  const collect = (ref: unknown) => {
    if (isNodeRef(ref)) {
      nodeIds.push(ref.nodeId);
    }
  };

  if (Array.isArray(value)) {
    value.forEach(collect);
  } else if (value) {
    collect(value);
  }

  return nodeIds;
};

const PropertyPanel: React.FC = () => {
  const dispatch = useAppDispatch();
  const selectedNode = useAppSelector(selectNodeInPropertyPanel);
  const showBackInPropertyPanel = useAppSelector(selectShowBackInPropertyPanel);
  const selectedNodeId = selectedNode?.id;
  const selectedComponentType = selectedNode?.type;
  const entityModels = useAppSelector(entityModelSelectors.selectAll);
  const variables = useAppSelector(variableSelectors.selectAll);
  const nodesById = useAppSelector(componentNodesSelectors.selectEntities);
  const columns = useAppSelector(selectColumnsOfSelectedNode);
  const [form] = Form.useForm();

  useEffect(() => {
    form.resetFields();
  }, [selectedNodeId, form]);

  const handleValuesChange = useCallback(
    (changedValues: Record<string, any>) => {
      if (!selectedNodeId) return;
      dispatch(
        updateNodeProps({
          id: selectedNodeId,
          props: changedValues,
        }),
      );
    },
    [dispatch, selectedNodeId],
  );

  const entityModelOptions = useMemo(
    () =>
      entityModels.map((et) => ({
        name: et.name,
        value: et.id,
        label: et.name,
      })),
    [entityModels],
  );

  const entityModelValueEnum = useMemo(
    () =>
      entityModels.reduce(
        (acc, et) => {
          acc[et.id] = { text: et.name };
          return acc;
        },
        {} as Record<string, { text: string }>,
      ),
    [entityModels],
  );

  const variableNames = useMemo(() => variables.map((item) => item.name), [variables]);

  const setPropValue = useCallback(
    (name: string | string[], value: unknown) => {
      if (!selectedNodeId) return;
      form.setFieldValue(name as any, value);
      dispatch(
        updateNodeProps({
          id: selectedNodeId,
          props: buildNestedPropValue(name, value),
        }),
      );
    },
    [dispatch, form, selectedNodeId],
  );

  const componentPrototype = useMemo(
    () => (selectedComponentType ? getComponentPrototype(selectedComponentType) : undefined),
    [selectedComponentType],
  );

  const propAttrs = useMemo(() => {
    const attrs = Object.values(componentPrototype?.propsTypes ?? {}).map((item) => ({
      ...item,
      ...(item.name === 'entityModelId' ? { options: entityModelOptions } : {}),
    }));
    // 扁平化对象类型属性
    return flattenPropAttributes(attrs);
  }, [componentPrototype, entityModelOptions]);

  const handleStartAddingColumn = useCallback(() => {
    dispatch(startAddingColumn());
  }, [dispatch]);

  const renderSchemaList = useCallback(() => <SchemaList />, []);

  const renderActionFlowSelector = useCallback(() => <ActionFlowSelector />, []);

  const renderComponentPropList = useCallback(
    (item: FlattenedPropAttribute) => {
      if (!selectedNode) return null;

      const propPath = normalizePropPath(item.name);
      const nodeIds = getNodeRefIdsFromProp(selectedNode.props, propPath);
      const childIdSet = new Set(selectedNode.childrenIds ?? []);
      const items = nodeIds
        .filter((nodeId) => childIdSet.has(nodeId))
        .map((nodeId) => nodesById[nodeId])
        .filter((node): node is ComponentNode => Boolean(node));

      if (items.length === 0) {
        return <Typography.Text type="secondary">暂无组件，请拖拽添加</Typography.Text>;
      }

      return (
        <List
          size="small"
          dataSource={items}
          renderItem={(node) => (
            <List.Item key={node.id} className={panelStyles.listItem}>
              <Button
                type="text"
                size="middle"
                icon={<AppstoreOutlined />}
                onClick={() => dispatch(pushNodeToPropertyPanel(node.id))}
                block
                className={panelStyles.justifyStart}
              >
                <Typography.Text ellipsis>{node.name}</Typography.Text>
                <div className={panelStyles.flex1} />
                <RightOutlined />
              </Button>
            </List.Item>
          )}
        />
      );
    },
    [dispatch, nodesById, selectedNode],
  );

  const createColumn = useCallback(
    (item: FlattenedPropAttribute) => {
      const valueType = VALUE_TYPE_ENUM_MAP[item.type] || item.type || 'text';
      // 支持数组路径（用于嵌套对象属性）
      const nameOrPath = item.name;
      const result = {
        title: item.label,
        dataIndex: nameOrPath,
        name: nameOrPath, // ProFormColumnsType 也需要 name 字段
        valueType,
        tooltip: item.description,
        fieldProps: {
          options: item.options,
        },
      } as ProFormColumnsType<any>;

      // 检查 name 是否为 "columns"（兼容字符串和数组路径）
      const itemName = Array.isArray(item.name) ? item.name[item.name.length - 1] : item.name;

      if (itemName === 'columns') {
        result.renderFormItem = renderSchemaList;
        result.tooltip = undefined;
        result.formItemProps = {
          className: 'schema-list-form-item',
          label: (
            <Flex align="center" justify="space-between" gap={8} className={panelStyles.fullWidth}>
              <Typography.Text className={panelStyles.flex1}>{item.label}</Typography.Text>

              <Button
                size="small"
                type="text"
                title="新增列定义"
                onClick={(e) => {
                  e.stopPropagation();
                  handleStartAddingColumn();
                }}
                icon={<PlusOutlined />}
              />
            </Flex>
          ),
        };
      } else if (itemName === 'entityModelId') {
        result.valueEnum = entityModelValueEnum;
      } else if (itemName === 'rowActions') {
        result.renderFormItem = () => renderComponentPropList(item);
        result.formItemProps = {
          className: panelStyles.schemaListFormItem,
          label: (
            <Flex align="center" justify="space-between" gap={8} className={panelStyles.fullWidth}>
              <Typography.Text className={panelStyles.flex1}>{item.label}</Typography.Text>

              <Button
                size="small"
                type="text"
                title="新增行操作按钮"
                onClick={(e) => {
                  e.stopPropagation();
                  if (!columns?.some((col) => col.valueType === 'option')) {
                    dispatch(
                      upsertColumnOfSelectedNode({
                        title: '操作',
                        valueType: 'option',
                        dataIndex: '',
                        width: 240,
                      }),
                    );
                  }
                  const prototype = getComponentPrototype('Button');
                  dispatch(
                    addNodeToSlot({
                      targetNodeId: selectedNodeId!,
                      propPath: 'rowActions',
                      type: 'Button',
                      label: prototype?.label,
                      isContainer: prototype?.isContainer,
                      defaultProps: prototype?.defaultProps,
                    }),
                  );
                }}
                icon={<PlusOutlined />}
              />
            </Flex>
          ),
        };
      } else if (item.type === 'actionFlow') {
        // 动作流类型使用自定义渲染器
        result.renderFormItem = renderActionFlowSelector;
      } else if (item.type === 'reactNode' || item.type === 'reactNodeArray') {
        result.renderFormItem = () => renderComponentPropList(item);
        result.valueType = 'text';
      } else if (isPrimitivePropType(item.type) && variableNames.length > 0) {
        result.renderFormItem = () => (
          <VariableBindingEditor
            item={item}
            form={form}
            variableNames={variableNames}
            onSetValue={setPropValue}
          />
        );
      }

      return result;
    },
    [
      variableNames,
      renderSchemaList,
      handleStartAddingColumn,
      entityModelValueEnum,
      renderComponentPropList,
      columns,
      dispatch,
      selectedNodeId,
      renderActionFlowSelector,
      form,
      setPropValue,
    ],
  );

  if (!selectedNode) {
    return <ProCard className={panelStyles.emptyState}>请选择一个组件实例</ProCard>;
  }

  const cardTitleElem = (
    <Space>
      {showBackInPropertyPanel && (
        <Button
          icon={<LeftOutlined />}
          size="small"
          onClick={() => dispatch(popNodeFromPropertyPanel())}
        />
      )}
      <Typography.Text>{`属性面板：${selectedNode.name}`}</Typography.Text>
    </Space>
  );

  if (propAttrs.length === 0) {
    return (
      <ProCard bordered className={panelStyles.cardRounded} title={cardTitleElem} size="small">
        <div className={panelStyles.noConfig}>组件 {selectedNode.type} 暂无可配置属性</div>
      </ProCard>
    );
  }

  const hasGroups = propAttrs.some((propAttr) => propAttr.group);

  if (!hasGroups) {
    return (
      <ProCard
        title={cardTitleElem}
        headerBordered
        bordered
        size="small"
        className={panelStyles.cardRounded}
        bodyStyle={{ padding: '16px' }}
      >
        <BetaSchemaForm
          initialValues={selectedNode.props}
          onValuesChange={handleValuesChange}
          clearOnDestroy={false}
          form={form}
          submitter={false}
          columns={propAttrs.map((item) => createColumn(item))}
        />
      </ProCard>
    );
  }

  const groupedPropAttr = propAttrs.reduce(
    (acc, propAttr) => {
      const group = propAttr.group || '基础配置';
      if (!acc[group]) {
        acc[group] = [];
      }
      acc[group].push(propAttr);
      return acc;
    },
    {} as Record<string, FlattenedPropAttribute[]>,
  );

  return (
    <div className={panelStyles.formContainer}>
      <ProCard
        key="快捷操作"
        size="small"
        title="快捷操作"
        headerBordered
        collapsible
        defaultCollapsed={false}
        bordered
        className={panelStyles.cardRounded}
        bodyStyle={{ padding: '16px' }}
      >
        <Button
          onClick={() => {
            dispatch(
              updateNodeProps({
                id: selectedNodeId!,
                props: {
                  dataSource: generateDataSource(columns),
                },
              }),
            );
          }}
        >
          生成模拟数据
        </Button>
        {/* 这里可以放一些通用的快捷操作按钮，比如复制、删除、添加子组件等 */}
      </ProCard>
      {Object.entries(groupedPropAttr).map(([groupName, items], index) => (
        <ProCard
          key={groupName}
          size="small"
          title={groupName}
          headerBordered
          collapsible
          defaultCollapsed={index > 2}
          bordered
          className={panelStyles.cardRoundedWithMargin}
          bodyStyle={{ padding: '16px' }}
        >
          <BetaSchemaForm
            initialValues={selectedNode.props}
            onValuesChange={handleValuesChange}
            form={form}
            submitter={false}
            columns={items.map((item) => createColumn(item))}
          />
        </ProCard>
      ))}
    </div>
  );
};

export default PropertyPanel;
