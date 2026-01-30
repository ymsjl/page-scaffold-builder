import React from "react";
import { Row, Col, Select, DatePicker, InputNumber, Tooltip, Typography } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

export function DateHelp() {
  return (
    <div style={{ marginTop: 6 }}>
      <Typography.Text type="secondary" style={{ fontSize: 12 }}>
        相对日期会以当前日期为基准动态计算；绝对日期为固定的某一天。
      </Typography.Text>
      <Tooltip title={'相对日期（如"今天"/"昨天"/"明天"）会在校验时按当前日期动态解析，也可加上天数偏移（例如 今天 - 30 天）。'}>
        <InfoCircleOutlined style={{ marginLeft: 8, color: 'rgba(0,0,0,0.45)' }} />
      </Tooltip>
    </div>
  );
}

export default function DateControl({ value, onChange, placeholder }: { value?: any; onChange: (v: any) => void; placeholder?: string }) {
  const mode = React.useMemo(() => {
    if (typeof value === 'string') {
      return 'absolute';
    } else if (value && value.type === 'relative') {
      return 'relative';
    }
    return 'absolute';
  }, [value]);

  const [m, setM] = React.useState(mode);

  React.useEffect(() => {
    setM(mode);
  }, [mode]);

  return (
    <div>
      <Row gutter={8} align="middle">
        <Col span={8}>
          <Select
            value={m}
            onChange={(val) => {
              setM(val);
              if (val === 'absolute') onChange('');
              else onChange({ type: 'relative', preset: 'today' });
            }}
            options={[{ label: '绝对日期', value: 'absolute' }, { label: '相对日期', value: 'relative' }]}
          />
        </Col>
        <Col span={16}>
          {m === 'absolute' ? (
            <DatePicker
              style={{ width: '100%' }}
              placeholder={placeholder}
              value={typeof value === 'string' && value ? dayjs(value) : undefined}
              onChange={(date) => onChange(date ? date.format('YYYY-MM-DD') : undefined)}
            />
          ) : (
            <Row gutter={8} align="middle">
              <Col span={12}>
                <Select
                  value={value?.preset ?? 'today'}
                  onChange={(preset) => onChange({ type: 'relative', preset })}
                  options={[{ label: '今天', value: 'today' }, { label: '昨天', value: 'yesterday' }, { label: '明天', value: 'tomorrow' }]}
                />
              </Col>
              <Col span={12}>
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="偏移 (天)"
                  value={value?.offset}
                  onChange={(v) => onChange({ type: 'relative', preset: value?.preset ?? 'today', offset: v ?? undefined })}
                />
              </Col>
            </Row>
          )}
        </Col>
      </Row>
      <DateHelp />
    </div>
  );
}
