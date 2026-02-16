import React from 'react';
import { Row, Col, Select, DatePicker, InputNumber, Tooltip, Typography } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import {
  RelativeDatePresets,
  RuleParamsAbsoluteDateSchema,
  type RuleParamsDate,
  RuleParamsRelativeDateSchema,
} from '../RuleParamsDateSchema';

export const DateHelp = () => {
  return (
    <div style={{ marginTop: 6 }}>
      <Typography.Text type="secondary" style={{ fontSize: 12 }}>
        相对日期会以当前日期为基准动态计算；绝对日期为固定的某一天。
      </Typography.Text>
      <Tooltip title='相对日期（如"今天"/"昨天"/"明天"）会在校验时按当前日期动态解析，也可加上天数偏移（例如 今天 - 30 天）。'>
        <InfoCircleOutlined style={{ marginLeft: 8, color: 'rgba(0,0,0,0.45)' }} />
      </Tooltip>
    </div>
  );
};

const DateControl: React.FC<{
  value?: RuleParamsDate;
  onChange?: (v?: RuleParamsDate) => void;
  placeholder?: string;
}> = ({ value, onChange, placeholder }) => {
  const mode = RuleParamsAbsoluteDateSchema.safeParse(value).success ? 'absolute' : 'relative';

  const renderParamsInput = () => {
    const absoluteDate = RuleParamsAbsoluteDateSchema.safeParse(value);
    if (absoluteDate.success) {
      const formValue = dayjs(absoluteDate.data);
      return (
        <DatePicker
          style={{ width: '100%' }}
          placeholder={placeholder}
          value={formValue}
          onChange={(date) => {
            if (typeof onChange !== 'function') return;
            onChange(date ? date.format('YYYY-MM-DD') : undefined);
          }}
        />
      );
    }

    const relativeDate = RuleParamsRelativeDateSchema.safeParse(value);
    if (relativeDate.success) {
      return (
        <Row gutter={8} align="middle">
          <Col span={12}>
            <Select
              style={{ width: '100%' }}
              value={relativeDate.data.preset ?? RelativeDatePresets.Today}
              onChange={(preset) => onChange && onChange({ ...relativeDate.data, preset })}
              options={
                [
                  { label: '今天', value: RelativeDatePresets.Today },
                  {
                    label: '本月最后一天',
                    value: RelativeDatePresets.LastDayOfMonth,
                  },
                  {
                    label: '今年最后一天',
                    value: RelativeDatePresets.LastDayOfYear,
                  },
                ] as const
              }
            />
          </Col>
          <Col span={12}>
            <InputNumber
              style={{ width: '100%' }}
              placeholder="偏移 (天)"
              value={relativeDate.data.offset}
              onChange={(v) => onChange && onChange({ ...relativeDate.data, offset: v ?? 0 })}
            />
          </Col>
        </Row>
      );
    }
    return null;
  };
  return (
    <Row gutter={8} align="middle">
      <Col span={8}>
        <Select
          style={{ width: '100%' }}
          value={mode}
          onChange={(val) => {
            if (typeof onChange !== 'function') return;
            onChange(val === 'absolute' ? '' : { preset: RelativeDatePresets.Today, offset: 0 });
          }}
          options={
            [
              { label: '绝对日期', value: 'absolute' },
              { label: '相对日期', value: 'relative' },
            ] as const
          }
        />
      </Col>
      <Col span={16}>{renderParamsInput()}</Col>
    </Row>
  );
};

export default DateControl;
