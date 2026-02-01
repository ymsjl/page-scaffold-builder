import React, { memo, useCallback, useMemo } from "react";
import { Card, Space, Typography } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { useAppDispatch } from "@/store/hooks";
import { ruleBuilderActions } from "@/store/slices/ruleBuilderSlice";
import { RuleNodeType } from "./RuleParamsDateSchema";
import { type RuleNode } from "./RuleParamsDateSchema";
import { ruleNodeContext } from "./strategies";

type RuleItemProps = {
  node: RuleNode;
};

const RuleItem: React.FC<RuleItemProps> = memo(function RuleItem({ node }) {
  const dispatch = useAppDispatch();
  const { id, enabled, params, type } = node;

  const style = useMemo<React.CSSProperties>(
    () => ({
      background: enabled ? undefined : "#fafafa",
    }),
    [enabled],
  );

  const updateParams = useCallback(
    (next: Record<string, any>) =>
      dispatch(ruleBuilderActions.updateRuleNodeParams({ id, params: next })),
    [id, dispatch],
  );

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      dispatch(ruleBuilderActions.deleteRuleNode(id));
    },
    [dispatch, id],
  );

  const Editor = ruleNodeContext.getStrategyOrThrow(
    type as RuleNodeType,
  ).Editor;

  return (
    <Card
      size="small"
      style={style}
      title={<Typography.Text strong>{node.name}</Typography.Text>}
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

          {Editor ? (
            <Editor params={params} updateParams={updateParams} />
          ) : null}
        </div>
      </Space>
    </Card>
  );
});

export default RuleItem;
