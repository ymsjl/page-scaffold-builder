import React, { memo } from "react";
import { Row, Col, Select, DatePicker } from "antd";
import dayjs from "dayjs";
import { computeOperatorParams } from "../utils";

export default memo(function DateRangeRuleEditor({ params, updateParams }: { params: any; updateParams: (next: Record<string, any>) => void; }) {
  const dateOp = (() => {
    if (params?.operator) return params.operator;
    if (params?.minDate && params?.maxDate)
      return params.minDate === params.maxDate ? "eq" : "between";
    if (params?.minDate) return "gte";
    if (params?.maxDate) return "lte";
    return "between";
  })();

  return (
    <Row gutter={8} wrap align="middle">
      <Col span={6}>
        <Select
          value={params?.operator ?? dateOp}
          onChange={(op: any) => updateParams(computeOperatorParams(op, params, 'minDate', 'maxDate'))}
          options={[{ label: '介于', value: 'between' }, { label: '等于', value: 'eq' }, { label: '晚于或等于', value: 'gte' }, { label: '早于或等于', value: 'lte' }]}
          style={{ width: "100%", marginBottom: 6 }}
        />
      </Col>
      <Col span={18}>
        {(params?.operator ?? dateOp) === "eq" ? (
          <DatePicker
            style={{ width: "100%", marginBottom: 6 }}
            value={
              params?.minDate && typeof params.minDate === 'string'
                ? dayjs(params.minDate)
                : undefined
            }
            onChange={(date) =>
              updateParams({
                minDate: date ? date.format("YYYY-MM-DD") : undefined,
                maxDate: date ? date.format("YYYY-MM-DD") : undefined,
              })
            }
          />
        ) : (params?.operator ?? dateOp) === "between" ? (
          <Row gutter={8} wrap align="middle">
            <Col span={12}>
              <DatePicker
                style={{ width: "100%", marginBottom: 6 }}
                placeholder="开始日期"
                value={
                  params?.minDate && typeof params.minDate === 'string'
                    ? dayjs(params.minDate)
                    : undefined
                }
                onChange={(date) =>
                  updateParams({
                    minDate: date ? date.format("YYYY-MM-DD") : undefined,
                  })
                }
              />
            </Col>
            <Col span={12}>
              <DatePicker
                style={{ width: "100%", marginBottom: 6 }}
                placeholder="结束日期"
                value={
                  params?.maxDate && typeof params.maxDate === 'string'
                    ? dayjs(params.maxDate)
                    : undefined
                }
                onChange={(date) =>
                  updateParams({
                    maxDate: date ? date.format("YYYY-MM-DD") : undefined,
                  })
                }
              />
            </Col>
          </Row>
        ) : (params?.operator ?? dateOp) === "gte" ? (
          <DatePicker
            style={{ width: "100%", marginBottom: 6 }}
            placeholder="开始日期"
            value={
              params?.minDate && typeof params.minDate === 'string'
                ? dayjs(params.minDate)
                : undefined
            }
            onChange={(date) =>
              updateParams({
                minDate: date ? date.format("YYYY-MM-DD") : undefined,
              })
            }
          />
        ) : (
          <DatePicker
            style={{ width: "100%", marginBottom: 6 }}
            placeholder="结束日期"
            value={
              params?.maxDate && typeof params.maxDate === 'string'
                ? dayjs(params.maxDate)
                : undefined
            }
            onChange={(date) =>
              updateParams({
                maxDate: date ? date.format("YYYY-MM-DD") : undefined,
              })
            }
          />
        )}
      </Col>
    </Row>
  );
});
