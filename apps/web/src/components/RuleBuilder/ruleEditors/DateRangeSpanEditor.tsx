import React from "react";
import { Row, Col, InputNumber } from "antd";
import OperatorSelect from "./OperatorSelect";
import { computeOperatorParams, RANGE_OPTIONS } from "../utils";

type Props = {
  params: Record<string, any>;
  updateParams: (next: Record<string, any>) => void;
};

const inputStyle = { width: "100%", marginBottom: 6 };

const DateRangeSpanEditor: React.FC<Props> = React.memo(({ params, updateParams }) => {
  const rangeOp = React.useMemo(() => {
    if (params?.operator) return params.operator;
    if (params?.minSpan !== undefined && params?.maxSpan !== undefined) {
      return params.minSpan === params.maxSpan ? "eq" : "between";
    }
    if (params?.minSpan !== undefined) return "gte";
    if (params?.maxSpan !== undefined) return "lte";
    return "between";
  }, [params]);

  const operator = params?.operator ?? rangeOp;

  const handleOperatorChange = React.useCallback(
    (op: string) => updateParams(computeOperatorParams(op, params, "minSpan", "maxSpan")),
    [updateParams, params]
  );

  const inputRender = React.useCallback(
    ({ key, placeholder, value, onChange }: {
      key?: "minSpan" | "maxSpan";
      placeholder: string;
      value?: number;
      onChange?: (val: number | undefined) => void;
    }) => {
      const fallbackValue = key ? params[key] : undefined;
      const fallbackOnChange = key
        ? (val: number | undefined) => updateParams({ [key]: val ?? undefined })
        : undefined;
      return (
        <InputNumber
          min={0}
          style={inputStyle}
          placeholder={placeholder}
          value={value ?? fallbackValue}
          onChange={onChange ?? fallbackOnChange}
        />
      );
    },
    [params, updateParams]
  );

  const rangeInputElem = React.useMemo(() => {
    switch (operator) {
      case "eq": {
        const value = params?.minSpan ?? params?.maxSpan;
        const onChange = (val: number | undefined) =>
          updateParams({ minSpan: val ?? undefined, maxSpan: val ?? undefined });
        return inputRender({ value, placeholder: "天数", onChange });
      }
      case "gte":
        return inputRender({ key: "minSpan", placeholder: "最小天数" });
      case "lte":
        return inputRender({ key: "maxSpan", placeholder: "最大天数" });
      case "between":
      default: {
        const paramMetas = [
          { key: "minSpan", placeholder: "最小天数" },
          { key: "maxSpan", placeholder: "最大天数" },
        ] as const;
        return (
          <Row gutter={8} wrap align="middle">
            {paramMetas.map(({ key, placeholder }) => (
              <Col span={12} key={key}>
                {inputRender({ key, placeholder })}
              </Col>
            ))}
          </Row>
        );
      }
    }
  }, [operator, params?.minSpan, params?.maxSpan, updateParams, inputRender]);

  return (
    <Row gutter={8} wrap align="middle">
      <Col span={6}>
        <OperatorSelect value={operator} onChange={handleOperatorChange} options={RANGE_OPTIONS} />
      </Col>
      <Col span={18}>{rangeInputElem}</Col>
    </Row>
  );
});

DateRangeSpanEditor.displayName = "DateRangeSpanEditor";

export default DateRangeSpanEditor;
