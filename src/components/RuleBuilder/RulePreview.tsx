import React from "react";
import { Card, Space } from "antd";
import { useAppSelector } from "@/store/hooks";
import { selectCurrentColumnProps } from "@/store/slices/ruleBuilderSlice";
import { BetaSchemaForm } from "@ant-design/pro-components";

const RulePreview: React.FC<{
  name: string;
  label: string;
  valueType?: string;
}> = React.memo(({ name, label, valueType }) => {
  const columnProps = useAppSelector(selectCurrentColumnProps);
  return (
    <Card size="small" title="规则预览">
      <Space direction="vertical" style={{ width: "100%" }}>
        <BetaSchemaForm
          columns={[{ ...columnProps, name, valueType, title: label }]}
        />
      </Space>
    </Card>
  );
});

RulePreview.displayName = "RulePreview";

export default RulePreview;
