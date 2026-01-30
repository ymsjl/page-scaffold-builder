import React from "react";
import { Row, Col } from "antd";
import OperatorSelect from "./OperatorSelect";
import DateControl from "../DateControl";
import { DATE_RANGE_OPTIONS, getDateDefaultOperator } from "../utils";

type Props = {
  params: any;
  updateParams: (next: Record<string, any>) => void;
};

export default React.memo(function DateRangeEditor({ params, updateParams }: Props) {
  const rangeOp = React.useMemo(() => getDateDefaultOperator(params), [params]);
  const operator = params?.operator ?? rangeOp;

  const handleOperatorChange = React.useCallback(
    (op: string) => {
      if (op === "eq") {
        const v = params?.minDate ?? params?.maxDate ?? undefined;
        updateParams({ operator: "eq", minDate: v, maxDate: v, min: undefined, max: undefined });
      } else if (op === "between") {
        const minDate = params?.minDate ?? undefined;
        const maxDate = params?.maxDate ?? undefined;
        updateParams({ operator: "between", minDate, maxDate, min: undefined, max: undefined });
      } else if (op === "gte") {
        const minDate = params?.minDate ?? undefined;
        updateParams({ operator: "gte", minDate, maxDate: undefined, min: undefined, max: undefined });
      } else if (op === "lte") {
        const maxDate = params?.maxDate ?? undefined;
        updateParams({ operator: "lte", maxDate, minDate: undefined, min: undefined, max: undefined });
      }
    },
    [params, updateParams]
  );

  const setEqDate = React.useCallback((v: any) => updateParams({ minDate: v, maxDate: v }), [updateParams]);
  const setMinDate = React.useCallback((v: any) => updateParams({ minDate: v }), [updateParams]);
  const setMaxDate = React.useCallback((v: any) => updateParams({ maxDate: v }), [updateParams]);

  return (
    <Row gutter={8} wrap align="middle">
      <Col span={6}>
        <OperatorSelect value={operator} onChange={handleOperatorChange} options={DATE_RANGE_OPTIONS} />
      </Col>
      <Col span={18}>
        {operator === "eq" ? (
          <DateControl value={params?.minDate ?? params?.maxDate} onChange={(v) => setEqDate(v)} />
        ) : operator === "between" ? (
          <Row gutter={8} wrap align="middle">
            <Col span={12}>
              <DateControl placeholder="开始日期" value={params?.minDate} onChange={(v) => setMinDate(v)} />
            </Col>
            <Col span={12}>
              <DateControl placeholder="结束日期" value={params?.maxDate} onChange={(v) => setMaxDate(v)} />
            </Col>
          </Row>
        ) : operator === "gte" ? (
          <DateControl placeholder="开始日期" value={params?.minDate} onChange={(v) => setMinDate(v)} />
        ) : (
          <DateControl placeholder="结束日期" value={params?.maxDate} onChange={(v) => setMaxDate(v)} />
        )}
      </Col>
    </Row>
  );
});
