import React from 'react';
import { AddComponentIntoPreview } from '@/components/DropZone/DropZone';
import SlotItemWrapper from '@/components/SlotItemWrapper/SlotItemWrapper';
import { isNodeRef } from '@/types';
import type { NodeRef } from '@/types';
import { usePreviewMode } from '../previewMode';
import { useRenderNodeRefs } from '../propResolvers';

type PageForPreviewProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> & {
  previewNodeId?: string;
  children?: unknown;
};

const PageForPreview: React.FC<PageForPreviewProps> = React.memo(
  ({ previewNodeId, children, ...restProps }) => {
    const previewMode = usePreviewMode();
    const childRefs = React.useMemo(() => {
      if (Array.isArray(children)) {
        return children.filter(isNodeRef) as NodeRef[];
      }
      if (isNodeRef(children)) {
        return [children];
      }
      return [] as NodeRef[];
    }, [children]);

    const renderedChildren = useRenderNodeRefs(childRefs);

    if (previewMode === 'pure' || !previewNodeId) {
      return <div {...restProps}>{renderedChildren}</div>;
    }

    const wrappedChildren = childRefs.reduce<React.ReactNode[]>((acc, ref, index) => {
      const element = renderedChildren[index];
      if (!element) return acc;
      acc.push(
        <SlotItemWrapper
          key={ref.nodeId}
          nodeId={ref.nodeId}
          targetNodeId={previewNodeId}
          propPath="children"
        >
          {element}
        </SlotItemWrapper>,
      );
      return acc;
    }, []);

    wrappedChildren.push(
      <AddComponentIntoPreview
        key="page.children:add"
        targetNodeId={previewNodeId}
        propPath="children"
        direction="vertical"
      />,
    );

    return <div {...restProps}>{wrappedChildren}</div>;
  },
);

PageForPreview.displayName = 'PageForPreview';

export default PageForPreview;
