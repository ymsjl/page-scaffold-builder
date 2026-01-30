import React, { memo, useCallback, useMemo } from "react";
import { Card, Space, Typography } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { useAppDispatch } from "@/store/hooks";
import { ruleBuilderActions } from "@/store/slices/ruleBuilderSlice";
import type { RuleNode } from "./utils/ruleMapping";
import { getNodeTitle } from "./utils";
import LengthRuleEditor from "./ruleEditors/LengthRuleEditor";
import PatternRuleEditor from "./ruleEditors/PatternRuleEditor";
import NumericRangeEditor from "./ruleEditors/NumericRangeEditor";
import DateRangeEditor from "./ruleEditors/DateRangeEditor";

type RuleItemProps = {
  node: RuleNode;
  isSelected: boolean;
};

const RuleItem: React.FC<RuleItemProps> = memo(function RuleItem({ node, isSelected }) {
  const dispatch = useAppDispatch();
  const { id, enabled, params, type } = node;

  const style = useMemo<React.CSSProperties>(
    () => ({
      background: enabled ? undefined : "#fafafa",
      border: isSelected ? "1px solid #1677ff" : undefined,
    }),
    [enabled, isSelected],
  );

  const updateParams = useCallback(
    (next: Record<string, any>) =>
      dispatch(ruleBuilderActions.updateNodeParams({ id, params: next })),
    [id, dispatch],
  );

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      dispatch(ruleBuilderActions.deleteNode(id));
    },
    [dispatch, id],
  );

  console.log('type', type)
  const renderEditor = () => {
    switch (type) {
      case "length":
        return <LengthRuleEditor params={params} updateParams={updateParams} />;
      case "range":
        return <NumericRangeEditor params={params} updateParams={updateParams} />;
      case "pattern":
        return <PatternRuleEditor params={params} updateParams={updateParams} />;
      case "dateRange":
        return <DateRangeEditor params={params} updateParams={updateParams} />;
      default:
        return null;
    }
  };

  return (
    <Card
      size="small"
      style={style}
      title={<Typography.Text strong>{getNodeTitle(node)}</Typography.Text>}
      extra={
        <Space wrap>
          <button
            aria-label="delete"
            onClick={handleDelete}
            style={{ background: "none", border: "none", cursor: "pointer" }}
          >
            <DeleteOutlined />
          </button>
        </Space>
      }
    >
      <Space direction="vertical" style={{ width: "100%" }} size={6}>
        <div onClick={(e) => e.stopPropagation()}>
          <Typography.Text
            type="secondary"
            style={{ fontSize: 12, display: "block", marginBottom: 6 }}
          >
            {node.message || "未设置提示"}
          </Typography.Text>

          {renderEditor()}
        </div>
      </Space>
    </Card>
  );
});

export default RuleItem;
