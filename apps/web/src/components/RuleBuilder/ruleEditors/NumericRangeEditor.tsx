import React, { useCallback } from "react";
import { Row, Col, InputNumber } from "antd";
import OperatorSelect from "./OperatorSelect";
import {
  computeOperatorParams,
  RANGE_OPTIONS,
  getRangeDefaultOperator,
} from "../utils";
import { RuleNodeParams } from "../RuleParamsDateSchema";

type Props = {
  params: Record<string, any>;
  updateParams: (next: Record<string, any>) => void;
};

const inputStyle = { width: "100%", marginBottom: 6 };

const NumericRangeEditor: React.FC<Props> = React.memo(
  ({ params, updateParams }) => {
    const rangeOp = React.useMemo(
      () => getRangeDefaultOperator(params),
      [params],
    );
    const operator = params?.operator ?? rangeOp;

    const handleOperatorChange = React.useCallback(
      (op: string) =>
        updateParams(computeOperatorParams(op, params, "min", "max")),
      [updateParams, params],
    );

    const inputRender = useCallback(
      ({
        key,
        placeholder,
        value,
        onChange,
      }: {
        key?: keyof RuleNodeParams;
        placeholder: string;
        value?: number;
        onChange?: (val: number | undefined) => void;
      }) => {
        const fallbackValue = key ? params[key] : undefined;
        const fallbackOnChange = key
          ? (val: number | undefined) =>
              updateParams({ [key]: val ?? undefined })
          : undefined;
        return (
          <InputNumber
            style={inputStyle}
            placeholder={placeholder}
            value={value ?? fallbackValue}
            onChange={onChange ?? fallbackOnChange}
          />
        );
      },
      [params, updateParams],
    );

    const rangeInputElem = React.useMemo(() => {
      switch (operator) {
        case "eq":
          const value = params?.min ?? params?.max;
          const onChange = (val: number | undefined) =>
            updateParams({ min: val ?? undefined, max: val ?? undefined });
          return inputRender({ value, placeholder: "值", onChange });
        case "gte":
          return inputRender({ key: "min", placeholder: "最小值" });
        case "lte":
          return inputRender({ key: "max", placeholder: "最大值" });
        case "between":
          const paramMetas = [
            { key: "min", placeholder: "最小值" },
            { key: "max", placeholder: "最大值" },
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
        default:
          return null;
      }
    }, [operator, params?.min, params?.max, updateParams, inputRender]);

    return (
      <Row gutter={8} wrap align="middle">
        <Col span={6}>
          <OperatorSelect
            value={operator}
            onChange={handleOperatorChange}
            options={RANGE_OPTIONS}
          />
        </Col>
        <Col span={18}>{rangeInputElem}</Col>
      </Row>
    );
  },
);

NumericRangeEditor.displayName = "NumericRangeEditor";

export default NumericRangeEditor;
