import React, { useEffect } from "react";
import { Card, Col, Row, Space } from "antd";

import type { AntdRule } from "./utils/ruleMapping";
import RuleLibrary from "./RuleLibrary";
import RuleCanvas from "./RuleCanvas";
import RulePreview from "./RulePreview";
import { useAppDispatch } from '@/store/hooks';
import { ruleBuilderActions, subscribeRuleBuilder } from '@/store/slices/ruleBuilderSlice';

export type RuleBuilderProps = {
  value?: AntdRule[];
  onChange?: (rules: AntdRule[]) => void;
};

export default function RuleBuilder({
  value,
  onChange,
  fieldType,
}: RuleBuilderProps & { fieldType?: string }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!onChange) return;
    const unsub = subscribeRuleBuilder(onChange);
    return unsub;
  }, [onChange]);

  useEffect(() => {
    if (value) dispatch(ruleBuilderActions.initFromRules(value));
  }, [value, dispatch]);

  return (
    <Space direction="vertical" style={{ width: "100%" }} size="middle">
      <Row gutter={16}>
        <Col span={24}>
          <Space direction="vertical" style={{ width: "100%" }} size="middle">
            <Card size="small" title="规则预览">
              <RulePreview />
            </Card>
            <RuleLibrary fieldType={fieldType} />
            <RuleCanvas />
          </Space>
        </Col>
      </Row>
    </Space>
  );
}
