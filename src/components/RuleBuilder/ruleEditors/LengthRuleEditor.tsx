import React, { memo } from "react";
import { Row, Col, Select, InputNumber } from "antd";
import { computeOperatorParams, RANGE_OPTIONS, getLengthDefaultOperator } from "../utils";

export default memo(function LengthRuleEditor({ params, updateParams }: { params: any; updateParams: (next: Record<string, any>) => void; }) {
  const lengthOp = getLengthDefaultOperator(params);

  return (
    <Row gutter={8} wrap align="middle">
      <Col span={6}>
        <Select
          value={params?.operator ?? lengthOp}
          onChange={(op: any) => updateParams(computeOperatorParams(op, params, 'min', 'max', 'len'))}
          options={RANGE_OPTIONS}
          style={{ width: "100%", marginBottom: 6 }}
        />
      </Col>
      <Col span={18}>
        {(params?.operator ?? lengthOp) === "eq" ? (
          <InputNumber
            style={{ width: "100%", marginBottom: 6 }}
            placeholder="长度"
            value={params?.len}
            onChange={(val) => updateParams({ len: val ?? undefined })}
          />
        ) : (
          <Row gutter={8} wrap align="middle">
            <Col span={12}>
              <InputNumber
                style={{ width: "100%", marginBottom: 6 }}
                placeholder="最小长度"
                value={params?.min}
                onChange={(val) => updateParams({ min: val ?? undefined })}
              />
            </Col>
            <Col span={12}>
              <InputNumber
                style={{ width: "100%", marginBottom: 6 }}
                placeholder="最大长度"
                value={params?.max}
                onChange={(val) => updateParams({ max: val ?? undefined })}
              />
            </Col>
          </Row>
        )}
      </Col>
    </Row>
  );
});
