import React, { useCallback } from 'react';
import { Row, Col, InputNumber } from 'antd';
import OperatorSelect from './OperatorSelect';
import { computeOperatorParams, getLengthDefaultOperator, RANGE_OPTIONS } from '../utils';

type Props = {
  params: Record<string, any>;
  updateParams: (next: Record<string, any>) => void;
};

const inputStyle = { width: '100%', marginBottom: 6 };

const LengthRuleEditor: React.FC<Props> = React.memo(({ params, updateParams }) => {
  const lengthOp = React.useMemo(() => getLengthDefaultOperator(params), [params]);
  const operator = params?.operator ?? lengthOp;

  const handleOperatorChange = useCallback(
    (op: string) => {
      if (op === 'eq') {
        const nextLen = params?.len ?? (params?.min === params?.max ? params?.min : undefined);
        updateParams({
          len: nextLen,
          min: undefined,
          max: undefined,
          operator: op,
        });
      } else {
        updateParams(computeOperatorParams(op, params, 'min', 'max'));
      }
    },
    [updateParams, params],
  );

  const inputRender = useCallback(
    ({ key, placeholder, value }: { key?: string; placeholder: string; value?: number }) => {
      const onChange = (val: number | undefined) =>
        updateParams({ ...params, [key as string]: val });
      return (
        <InputNumber
          style={inputStyle}
          value={value}
          placeholder={placeholder}
          onChange={(v) => onChange(v as number | undefined)}
        />
      );
    },
    [params, updateParams],
  );

  const lengthInputElem = React.useMemo(() => {
    switch (operator) {
      case 'eq':
        return (
          <InputNumber
            style={inputStyle}
            value={params?.len}
            placeholder="长度"
            onChange={(val) => updateParams({ ...params, len: val })}
          />
        );
      case 'gte':
        return inputRender({
          key: 'min',
          placeholder: '最小长度',
          value: params?.min,
        });
      case 'lte':
        return inputRender({
          key: 'max',
          placeholder: '最大长度',
          value: params?.max,
        });
      case 'between':
      default: {
        const paramMetas = [
          { key: 'min', placeholder: '最小长度' },
          { key: 'max', placeholder: '最大长度' },
        ] as const;
        return (
          <Row gutter={8} wrap align="middle">
            {paramMetas.map(({ key, placeholder }) => (
              <Col span={12} key={key}>
                {inputRender({ key, placeholder, value: params?.[key] })}
              </Col>
            ))}
          </Row>
        );
      }
    }
  }, [operator, params, updateParams, inputRender]);

  return (
    <Row gutter={8} wrap align="middle">
      <Col span={6}>
        <OperatorSelect value={operator} onChange={handleOperatorChange} options={RANGE_OPTIONS} />
      </Col>
      <Col span={18}>{lengthInputElem}</Col>
    </Row>
  );
});

LengthRuleEditor.displayName = 'LengthRuleEditor';

export default LengthRuleEditor;
