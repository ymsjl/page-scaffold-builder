import React, { memo, useCallback, useMemo } from 'react';
import { Card, Space, Typography } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useAppDispatch } from '@/store/hooks';
import {
  updateRuleNodeParamsOfEditingColumn,
  deleteRuleNodeOfEditingColumn,
} from '@/store/columnEditorSlice/columnEditorSlice';
import { type RuleNodeType, type RuleNode } from './RuleParamsDateSchema';
import { ruleNodeContext } from './strategies';
import * as styles from './RuleBuilder.css';

type RuleItemProps = {
  node: RuleNode;
};

const RuleItem: React.FC<RuleItemProps> = memo(({ node }) => {
  const dispatch = useAppDispatch();
  const { id, enabled, params, type } = node;

  const style = useMemo<React.CSSProperties>(
    () => ({
      background: enabled ? undefined : '#fafafa',
    }),
    [enabled],
  );

  const updateParams = useCallback(
    (next: Record<string, any>) =>
      dispatch(
        updateRuleNodeParamsOfEditingColumn({
          id,
          params: next,
        }),
      ),
    [id, dispatch],
  );

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      dispatch(deleteRuleNodeOfEditingColumn(id));
    },
    [dispatch, id],
  );

  const { Editor } = ruleNodeContext.getStrategyOrThrow(type as RuleNodeType);

  return (
    <Card
      size="small"
      style={style}
      title={<Typography.Text strong>{node.name}</Typography.Text>}
      extra={
        <Space wrap>
          <button
            aria-label="delete"
            type="button"
            onClick={handleDelete}
            className={styles.deleteButton}
          >
            <DeleteOutlined />
          </button>
        </Space>
      }
    >
      <Space direction="vertical" className={styles.fullWidth} size={6}>
        <button type="button" onClick={(e) => e.stopPropagation()}>
          <Typography.Text type="secondary" className={styles.ruleMessage}>
            {node.message || '未设置提示'}
          </Typography.Text>

          {Editor ? <Editor params={params} updateParams={updateParams} /> : null}
        </button>
      </Space>
    </Card>
  );
});

RuleItem.displayName = 'RuleItem';

export default RuleItem;
