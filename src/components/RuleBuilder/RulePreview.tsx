import React, { useMemo, useState } from 'react';
import { Input, Space, Typography } from 'antd';
import type { AntdRule } from './utils/ruleMapping';
import { DEFAULT_PHONE_PATTERN, nodesToRules } from './utils/ruleMapping';
import useRuleStore from './useRuleStore';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isRuleConfig = (rule: AntdRule): rule is Exclude<AntdRule, (form: any) => AntdRule> => {
  return typeof rule !== 'function';
};

const validateValue = (value: any, rules: AntdRule[]): string | null => {
  for (const rule of rules) {
    if (!rule) continue;
    if (!isRuleConfig(rule)) continue;
    const message = typeof rule.message === 'string' ? rule.message : '校验未通过';

    if (rule.required) {
      const empty = value === undefined || value === null || String(value).trim() === '';
      if (empty) return message;
    }

    if (rule.type === 'email') {
      if (value && !emailPattern.test(String(value))) return message;
    }

    if (rule.type === 'enum' && Array.isArray(rule.enum)) {
      if (value !== undefined && value !== null && !rule.enum.includes(value)) return message;
    }

    if (rule.pattern) {
      if (value && !rule.pattern.test(String(value))) return message;
    }

    if (rule.type === 'string' || rule.type === undefined) {
      const len = String(value ?? '').length;
      if (typeof rule.len === 'number' && len !== rule.len) return message;
      if (typeof rule.min === 'number' && len < rule.min) return message;
      if (typeof rule.max === 'number' && len > rule.max) return message;
    }

    if (rule.type === 'number') {
      const num = Number(value);
      if (Number.isNaN(num)) return message;
      if (typeof rule.min === 'number' && num < rule.min) return message;
      if (typeof rule.max === 'number' && num > rule.max) return message;
    }

    if (rule.pattern === DEFAULT_PHONE_PATTERN) {
      if (value && !DEFAULT_PHONE_PATTERN.test(String(value))) return message;
    }
  }
  return null;
};

export default function RulePreview() {
  const [value, setValue] = useState('');
  const nodes = useRuleStore(state => state.nodes);
  const rules = useMemo(() => nodesToRules(nodes), [nodes]);

  const error = useMemo(() => validateValue(value, rules), [value, rules]);

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Input placeholder="输入测试值" value={value} onChange={e => setValue(e.target.value)} />
      {error ? (
        <Typography.Text type="danger">{error}</Typography.Text>
      ) : (
        <Typography.Text type="secondary">校验通过</Typography.Text>
      )}
    </Space>
  );
}
