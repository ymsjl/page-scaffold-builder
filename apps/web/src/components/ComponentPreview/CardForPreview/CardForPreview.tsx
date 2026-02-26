import React from 'react';
import { Card, type CardProps } from 'antd';
import { AddComponentIntoPreview } from '@/components/DropZone/DropZone';
import { isNodeRef } from '@/types';
import type { NodeRef } from '@/types';
import { usePreviewMode } from '../previewMode';
import { useRenderNodeRefs } from '../propResolvers';
import * as styles from './CardForPreview.css';

type CardForPreviewProps = Omit<CardProps, 'title' | 'children'> & {
  previewNodeId?: string;
  title?: unknown;
  children?: unknown;
  footer?: unknown;
};

const normalizeNodeRefs = (value: unknown): NodeRef[] => {
  if (Array.isArray(value)) {
    return value.filter(isNodeRef) as NodeRef[];
  }
  if (isNodeRef(value)) {
    return [value];
  }
  return [];
};

const useSlotItems = (params: {
  previewNodeId?: string;
  previewMode: 'edit' | 'pure';
  propPath: string;
  refs: NodeRef[];
  direction: 'horizontal' | 'vertical';
}) => {
  const { previewNodeId, previewMode, propPath, refs, direction } = params;
  const rendered = useRenderNodeRefs(refs);

  if (previewMode === 'pure' || !previewNodeId) {
    return rendered;
  }

  const wrapped = refs.reduce<React.ReactNode[]>((acc, ref, index) => {
    const element = rendered[index];
    if (!element) return acc;
    acc.push(
      <div key={ref.nodeId} className={styles.slotItem}>
        {element}
      </div>,
    );
    return acc;
  }, []);

  wrapped.push(
    <AddComponentIntoPreview
      key={`${propPath}:add`}
      targetNodeId={previewNodeId}
      propPath={propPath}
      direction={direction}
    />,
  );

  return wrapped;
};

const CardForPreview: React.FC<CardForPreviewProps> = React.memo((props) => {
  const { previewNodeId, title, children, footer, ...restProps } = props;
  const previewMode = usePreviewMode();

  const bodyRefs = React.useMemo(() => normalizeNodeRefs(children), [children]);
  const footerRefs = React.useMemo(() => normalizeNodeRefs(footer), [footer]);

  const bodyContent = useSlotItems({
    previewNodeId,
    previewMode,
    propPath: 'children',
    refs: bodyRefs,
    direction: 'vertical',
  });

  const footerContent = useSlotItems({
    previewNodeId,
    previewMode,
    propPath: 'footer',
    refs: footerRefs,
    direction: 'horizontal',
  });

  return (
    <Card {...restProps} className={styles.card}>
      <div className={`${styles.section} ${styles.body}`}>{bodyContent}</div>
      <div className={`${styles.section} ${styles.footer}`}>{footerContent}</div>
    </Card>
  );
});

CardForPreview.displayName = 'CardForPreview';

export default CardForPreview;
