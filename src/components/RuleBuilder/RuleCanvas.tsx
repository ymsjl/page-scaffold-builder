import React from 'react';
import { Card, Space, Typography, Input, InputNumber, Select, Row, Col, Divider } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { getDefaultRuleMessage } from './utils/ruleMapping';
import { PATTERN_PRESETS as VALIDATE_PRESETS } from '../../utils/validate';
import type { RuleNode } from './utils/ruleMapping';
import useRuleStore from './useRuleStore';

const getNodeTitle = (node: RuleNode) => {
  switch (node.type) {
    case 'required':
      return '必填';
    case 'length':
      return '文本长度';
    case 'range':
      return '数字范围';
    case 'pattern':
      return '正则表达式';
    default:
      return node.type;
  }
};

function RuleItem({
  node,
  isSelected,
  onDelete,
  onChange,
}: {
  node: RuleNode;
  isSelected: boolean;
  onDelete: (id: string) => void;
  onChange: (node: RuleNode) => void;
}) {
  const style: React.CSSProperties = {
    background: node.enabled ? undefined : '#fafafa',
    border: isSelected ? '1px solid #1677ff' : undefined,
  };

  const UI_PATTERN_PRESETS = [
    { key: 'phoneNigeria', label: '尼日利亚手机号', value: VALIDATE_PRESETS?.phoneNigeria?.pattern?.source ?? '^0(70|80|81|90|91|98)\\d{8}$' },
    { key: 'phoneChina', label: '中国手机号', value: VALIDATE_PRESETS?.phoneChina?.pattern?.source ?? '^1[3-9]\\d{9}$' },
    { key: 'email', label: '邮箱', value: VALIDATE_PRESETS?.email?.pattern?.source ?? '^[\\w.-]+@[\\w.-]+\\.[A-Za-z]{2,}$' },
    { key: 'alpha', label: '字母', value: VALIDATE_PRESETS?.alpha?.pattern?.source ?? '^[A-Za-z]+$' },
    { key: 'numeric', label: '数字', value: VALIDATE_PRESETS?.numeric?.pattern?.source ?? '^\\d+$' },
    { key: 'custom', label: '自定义', value: '' },
  ];

  const updateParams = (next: Record<string, any>) => {
    const params = { ...(node.params || {}), ...next };
    onChange({ ...node, params, message: node.message || getDefaultRuleMessage({ ...node, params }) });
  };
  return (
    <Card size="small" style={style}
      title={
        <Typography.Text strong className=''>{getNodeTitle(node)}</Typography.Text>
      }
      extra={
        <Space wrap>
          <button
            aria-label="delete"
            onClick={e => {
              e.stopPropagation();
              onDelete(node.id);
            }}
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <DeleteOutlined />
          </button>
        </Space>}
    >
      <Space direction="vertical" style={{ width: '100%' }} size={6}>
        <div onClick={e => e.stopPropagation()}>
          <Typography.Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>
            {node.message || '未设置提示'}
          </Typography.Text>

          {node.type === 'length' ? (
            <>
              <Row gutter={8} wrap align="middle">
                <Col span={4}>
                  <Typography.Text>最短：</Typography.Text>
                </Col>
                <Col span={20}>
                  <InputNumber
                    style={{ width: '100%', marginBottom: 6 }}
                    placeholder="最小长度"
                    value={node.params?.min}
                    onChange={val => updateParams({ min: val ?? undefined })}
                  />
                </Col>
                <Col span={4}>
                  <Typography.Text>最长：</Typography.Text>
                </Col>
                <Col span={20}>
                  <InputNumber
                    style={{ width: '100%', marginBottom: 6 }}
                    placeholder="最大长度"
                    value={node.params?.max}
                    onChange={val => updateParams({ max: val ?? undefined })}
                  />
                </Col>
              </Row>
            </>
          ) : null}

          {node.type === 'range' ? (
            <>
              <Row gutter={8} wrap align="middle">
                <Col span={4}>
                  <Typography.Text>最小值：</Typography.Text>
                </Col>
                <Col span={20}>
                  <InputNumber
                    style={{ width: '100%', marginBottom: 6 }}
                    placeholder="最小值"
                  />
                </Col>
                <Col span={4}>
                  <Typography.Text>最大值：</Typography.Text>
                </Col>
                <Col span={20}>
                  <InputNumber
                    style={{ width: '100%', marginBottom: 6 }}
                    placeholder="最大值"
                  />
                </Col>
              </Row>
            </>
          ) : null}

          {node.type === 'pattern' ? (
            <>
              {(() => {
                const p = node.params?.pattern || '';
                const found = UI_PATTERN_PRESETS.find(preset => preset.value === p && preset.key !== 'custom');
                const selectedKey = found ? found.key : 'custom';
                return (
                  <Row gutter={8}>
                    <Col span={6}>
                      <Select
                        value={selectedKey}
                        onChange={key => {
                          const preset = UI_PATTERN_PRESETS.find(p => p.key === key);
                          if (!preset) return;
                          if (preset.key === 'custom') {
                            const current = node.params?.pattern || '';
                            const isPresetValue = UI_PATTERN_PRESETS.some(pp => pp.value === current && pp.key !== 'custom');
                            // preserve existing custom pattern if it is not a preset; otherwise clear
                            updateParams({ pattern: isPresetValue ? '' : current });
                          } else {
                            updateParams({ pattern: preset.value });
                          }
                        }}
                        options={UI_PATTERN_PRESETS.map(p => ({ label: p.label, value: p.key }))}
                        style={{ width: '100%', marginBottom: 6 }}
                      />

                    </Col>
                    <Col span={18}>
                      <Input
                        placeholder="自定义正则表达式"
                        value={node.params?.pattern || ''}
                        onChange={e => updateParams({ pattern: e.target.value })}
                        disabled={selectedKey !== 'custom'}
                        style={{ marginBottom: 6 }}
                      />
                    </Col>
                  </Row>
                );
              })()}
            </>
          ) : null}

        </div>
      </Space>
    </Card>
  );
}

export default function RuleCanvas() {
  const nodes = useRuleStore(state => state.nodes);
  const selectedId = useRuleStore(state => state.selectedId);
  const updateNode = useRuleStore(state => state.updateNode);
  const deleteNode = useRuleStore(state => state.deleteNode);

  return (
    <Card size="small" title="规则链" style={{ minHeight: 260 }}>
      <div style={{ borderRadius: 8, padding: 4 }}>
        <Space direction="vertical" style={{ width: '100%' }} size={8}>
          {nodes.length === 0 ? (
            <Typography.Text type="secondary">暂无规则（请从左侧添加）</Typography.Text>
          ) : (
            nodes.map((node, index) => (
              <RuleItem
                key={node.id}
                node={node}
                isSelected={node.id === selectedId}
                onDelete={deleteNode}
                onChange={updateNode}
              />
            ))
          )}
        </Space>
      </div>
    </Card>
  );
}
