import React, { useMemo } from "react";
import { Card, Space } from "antd";
import { useAppSelector } from "@/store/hooks";
import {
  ruleDescriptorsToRules,
  selectCurrentColumnProps,
} from "@/store/slices/ruleBuilderSlice";
import { BetaSchemaForm } from "@ant-design/pro-components";
import type { RuleDescriptor } from "@/components/RuleBuilder/strategies";

const RulePreview: React.FC<{
  name: string;
  label: string;
  valueType?: string;
}> = React.memo(({ name, label, valueType }) => {
  const columnProps = useAppSelector(selectCurrentColumnProps);
  const previewColumn = useMemo(() => {
    const formItemProps = columnProps.formItemProps ?? {};
    const descriptorRules = (formItemProps.rules ?? []) as RuleDescriptor[];
    const rules = ruleDescriptorsToRules(descriptorRules);
    const nextFormItemProps = rules.length
      ? { ...formItemProps, rules }
      : { ...formItemProps, rules: undefined };

    return {
      ...columnProps,
      formItemProps: nextFormItemProps,
    };
  }, [columnProps]);
  return (
    <Card size="small" title="规则预览">
      <Space direction="vertical" style={{ width: "100%" }}>
        <BetaSchemaForm
          columns={[{ ...previewColumn, name, valueType, title: label }]}
        />
      </Space>
    </Card>
  );
});

RulePreview.displayName = "RulePreview";

export default RulePreview;
