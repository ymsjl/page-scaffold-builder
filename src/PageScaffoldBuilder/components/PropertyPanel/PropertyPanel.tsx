import React, { useMemo } from 'react';
import {
  ProForm,
  ProCard,
  ProFormText,
  ProFormSelect,
  ProFormSwitch,
  ProFormDigit,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { Space } from 'antd';
import { getPropsSchemaByComponentType, PropertySchemaConfig } from './propsSchemaGenerator';
import SchemaBuilderModal from '../SchemaBuilderModal/SchemaBuilderModal';
import { useBuilderStore, useEntityTypes, selectedNodeSelector } from '../../store/useBuilderStore';
import { SchemaList } from '../SchemaBuilderModal/SchemaList';

const PropertyPanel: React.FC = () => {
  const selectedNode = useBuilderStore(selectedNodeSelector);
  const selectedComponentType = selectedNode?.type;
  const entityTypes = useEntityTypes();
  const updateSelectedNodeProps = useBuilderStore.use.selectedNode().updateProps;

  const handleValuesChange = (changedValues: Record<string, any>) => {
    updateSelectedNodeProps(changedValues);
  };

  const schemaMode = useMemo(() => {
    const type = selectedComponentType as string;
    if (type === 'Form' || type === 'ModalForm') return 'form';
    if (type === 'Description' || type === 'ProDescription') return 'description';
    return 'table';
  }, [selectedComponentType]);

  const schemas = useMemo(() => {
    const baseSchemas = getPropsSchemaByComponentType(selectedComponentType);
    if (!entityTypes || entityTypes.length === 0) return baseSchemas;
    return baseSchemas.map(schema => {
      if (schema.key !== 'entityTypeId') return schema;
      const options = entityTypes.map(item => ({
        label: item.title || item.name,
        value: item.id,
      }));
      return {
        ...schema,
        fieldProps: {
          ...(schema.fieldProps || {}),
          options,
        },
      };
    });
  }, [selectedComponentType, entityTypes]);

  if (!selectedNode) {
    const emptyStyle: React.CSSProperties = {
      border: '1px solid #e8e8e8',
      borderRadius: '4px',
      background: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      color: '#999',
    };
    return <div style={emptyStyle}>请选择一个组件实例</div>;
  }

  if (schemas.length === 0) {
    const noConfigStyle: React.CSSProperties = {
      border: '1px solid #e8e8e8',
      borderRadius: '4px',
      background: 'white',
      padding: '24px',
      textAlign: 'center',
      color: '#999',
    };
    return <div style={noConfigStyle}>组件 {selectedNode.type} 暂无可配置属性</div>;
  }

  const hasGroups = schemas.some(schema => schema.group);

  const formStyles: React.CSSProperties = {
    height: '100%',
    overflowY: 'auto',
  };

  const contentStyles: React.CSSProperties = {
    padding: '16px',
  };

  const renderFormItem = (schema: PropertySchemaConfig) => {
    // 特殊处理 columns 属性
    if (schema.key === 'columns' && schema.valueType === 'schema') {
      return (
        <ProForm.Item key={schema.key} label={schema.title} tooltip={schema.tooltip}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <SchemaList selectedNode={selectedNode} />
          </Space>
        </ProForm.Item>
      );
    }

    const formItemConfig = {
      name: schema.dataIndex,
      label: schema.title,
      tooltip: schema.tooltip,
      rules: schema.formItemProps?.rules,
      fieldProps: schema.fieldProps,
    };

    switch (schema.valueType) {
      case 'select':
        return (
          <ProFormSelect
            key={schema.key}
            {...formItemConfig}
            options={schema.fieldProps?.options || []}
            valueEnum={schema.formItemProps?.valueEnum}
          />
        );

      case 'switch':
        return <ProFormSwitch key={schema.key}  {...formItemConfig} />;

      case 'digit':
        return <ProFormDigit key={schema.key} {...formItemConfig} />;

      case 'textarea':
        return <ProFormTextArea key={schema.key} {...formItemConfig} />;

      default:
        return <ProFormText key={schema.key} {...formItemConfig} />;
    }
  };

  if (!hasGroups) {
    return (
      <>
        <div style={formStyles}>
          <ProCard title={`配置：${selectedNode.name}`} headerBordered bodyStyle={{ padding: 0 }}>
            <div style={contentStyles}>
              <ProForm initialValues={selectedNode.props} onValuesChange={handleValuesChange} submitter={false}>
                {schemas.map(renderFormItem)}
              </ProForm>
            </div>
          </ProCard>
        </div>

        <SchemaBuilderModal key={`schema-builder-${selectedNode.id}`} title={`配置 ${selectedNode?.name} 的 Columns`} schemaMode={schemaMode} />
      </>
    );
  }

  const groupedSchemas = schemas.reduce(
    (acc, schema) => {
      const group = schema.group || '基础配置';
      if (!acc[group]) {
        acc[group] = [];
      }
      acc[group].push(schema);
      return acc;
    },
    {} as Record<string, PropertySchemaConfig[]>
  );

  return (
    <>
      <div style={formStyles}>
        {Object.entries(groupedSchemas).map(([groupName, items]) => (
          <ProCard
            key={groupName}
            title={groupName}
            headerBordered
            collapsible
            defaultCollapsed={groupName !== '基础配置'}
            style={{ marginBottom: '16px', backgroundColor: '#fafafa' }}
            bodyStyle={{ padding: '12px' }}
          >
            <ProForm initialValues={selectedNode.props} onValuesChange={handleValuesChange} submitter={false}>
              {items.map(renderFormItem)}
            </ProForm>
          </ProCard>
        ))}
      </div>

      <SchemaBuilderModal title={`配置 ${selectedNode?.name} 的 Columns`} schemaMode={schemaMode} />
    </>
  );
};

export default PropertyPanel;
