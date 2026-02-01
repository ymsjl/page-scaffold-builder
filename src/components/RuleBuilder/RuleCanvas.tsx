import React, { memo } from "react";
import { Card, Space, Typography } from "antd";
import RuleItem from "./RuleItem";
import { useAppSelector } from "@/store/hooks";
import { selectRuleNodes } from "@/store/slices/selectRuleBuilder";

export default memo(function RuleCanvas() {
  const nodes = useAppSelector(selectRuleNodes);
  return (
    <Card size="small" title="规则链" style={{ minHeight: 260 }}>
      <div style={{ borderRadius: 8, padding: 4 }}>
        <Space direction="vertical" style={{ width: "100%" }} size={8}>
          {nodes.length === 0 ? (
            <Typography.Text type="secondary">
              暂无规则（请从左侧添加）
            </Typography.Text>
          ) : (
            nodes.map((node) => <RuleItem key={node.id} node={node} />)
          )}
        </Space>
      </div>
    </Card>
  );
});
