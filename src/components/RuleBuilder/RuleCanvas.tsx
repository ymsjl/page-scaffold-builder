import React from "react";
import { Card, Space, Typography } from "antd";
import RuleItem from "./RuleItem";
import { useAppSelector } from "@/store/hooks";
import { selectRuleNodesOfEditingColumn } from "@/store/slices/componentTree/componentTreeSelectors";

const RuleCanvas: React.FC = React.memo(() => {
  const nodes = useAppSelector(selectRuleNodesOfEditingColumn);

  return (
    <Card size="small" title="规则链" style={{ minHeight: 260 }}>
      <div style={{ borderRadius: 8, padding: 4 }}>
        <Space direction="vertical" style={{ width: "100%" }} size={8}>
          {nodes.length === 0 ? (
            <Typography.Text type="secondary">
              暂无规则（请从上方添加）
            </Typography.Text>
          ) : (
            nodes.map((node) => <RuleItem key={node.id} node={node} />)
          )}
        </Space>
      </div>
    </Card>
  );
});

RuleCanvas.displayName = "RuleCanvas";

export default RuleCanvas;