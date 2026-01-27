import React, { useEffect } from 'react';
import { Card, Col, Row, Space } from 'antd';

import type { AntdRule, } from './utils/ruleMapping';
import RuleLibrary from './RuleLibrary';
import RuleCanvas from './RuleCanvas';
import RulePreview from './RulePreview';
import useRuleStore from './useRuleStore';


export type RuleBuilderProps = {
  value?: AntdRule[];
  onChange?: (rules: AntdRule[]) => void;
};


export default function RuleBuilder({ value, onChange, fieldType }: RuleBuilderProps & { fieldType?: string }) {
  const initFromRules = useRuleStore(state => state.initFromRules);
  const setOnChange = useRuleStore(state => state.setOnChange);

  useEffect(() => {
    setOnChange(onChange);
  }, [onChange, setOnChange]);

  useEffect(() => {
    if (value) initFromRules(value);
  }, [value, initFromRules]);

  return (
    <Row gutter={16}>
      <Col span={6}>
        <RuleLibrary fieldType={fieldType} />
      </Col>
      <Col span={18}>
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Card size="small" title="规则预览">
            <RulePreview />
          </Card>
          <RuleCanvas />
        </Space>
      </Col>
    </Row>
  );
}
