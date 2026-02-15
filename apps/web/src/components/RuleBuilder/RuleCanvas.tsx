import React from 'react';
import { Card, Space, Typography } from 'antd';
import { useAppSelector } from '@/store/hooks';
import { selectRuleNodesOfEditingColumn } from '@/store/componentTreeSlice/componentTreeSelectors';
import RuleItem from './RuleItem';
import * as styles from './RuleBuilder.css';

const RuleCanvas: React.FC = React.memo(() => {
  const nodes = useAppSelector(selectRuleNodesOfEditingColumn);

  return (
    <Card size="small" title="规则链" className={styles.canvasCard}>
      <div className={styles.canvasContainer}>
        <Space direction="vertical" className={styles.fullWidth} size={8}>
          {nodes.length === 0 ? (
            <Typography.Text type="secondary">暂无规则（请从上方添加）</Typography.Text>
          ) : (
            nodes.map((node) => <RuleItem key={node.id} node={node} />)
          )}
        </Space>
      </div>
    </Card>
  );
});

RuleCanvas.displayName = 'RuleCanvas';

export default RuleCanvas;
