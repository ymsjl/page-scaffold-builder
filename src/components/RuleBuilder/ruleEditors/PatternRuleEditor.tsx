import React, { memo, useMemo } from "react";
import { Row, Col, Select, Input } from "antd";
import { UI_PATTERN_PRESETS } from "../utils";

export default memo(function PatternRuleEditor({ params, updateParams }: { params: any; updateParams: (next: Record<string, any>) => void; }) {
  const patternSelectedKey = useMemo(() => {
    const p = params?.pattern || "";
    const found = UI_PATTERN_PRESETS.find(
      (preset) => preset.value === p && preset.key !== "custom",
    );
    return found ? found.key : "custom";
  }, [params?.pattern]);

  return (
    <Row gutter={8}>
      <Col span={6}>
        <Select
          value={patternSelectedKey}
          onChange={(key) => {
            const preset = UI_PATTERN_PRESETS.find((p) => p.key === key);
            if (!preset) return;
            if (preset.key === "custom") {
              const current = params?.pattern || "";
              const isPresetValue = UI_PATTERN_PRESETS.some(
                (pp) => pp.value === current && pp.key !== "custom",
              );
              updateParams({ pattern: isPresetValue ? "" : current });
            } else {
              updateParams({ pattern: preset.value });
            }
          }}
          options={UI_PATTERN_PRESETS.map((p) => ({
            label: p.label,
            value: p.key,
          }))}
          style={{ width: "100%", marginBottom: 6 }}
        />
      </Col>
      <Col span={18}>
        <Input
          placeholder="自定义正则表达式"
          value={params?.pattern || ""}
          onChange={(e) => updateParams({ pattern: e.target.value })}
          disabled={patternSelectedKey !== "custom"}
          style={{ marginBottom: 6 }}
        />
      </Col>
    </Row>
  );
});
