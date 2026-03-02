import React from 'react';
import { AddComponentIntoPreview } from '@/components/DropZone/DropZone';
import SlotItemWrapper from '@/components/SlotItemWrapper/SlotItemWrapper';
import { usePreviewMode } from '../previewMode';
import { useRenderNodeRefs } from '../propResolvers';
import { normalizeNodeRefs } from '../nodeRefLogic';

type PageForPreviewProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> & {
  previewNodeId?: string;
  children?: unknown;
};

const PageForPreview: React.FC<PageForPreviewProps> = React.memo(
  ({ previewNodeId, children, ...restProps }) => {
    const previewMode = usePreviewMode();
    const childRefs = React.useMemo(() => normalizeNodeRefs(children), [children]);

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
