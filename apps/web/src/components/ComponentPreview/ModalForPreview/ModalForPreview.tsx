import React from 'react';
import { Modal, type ModalProps } from 'antd';
import { AddComponentIntoPreview } from '@/components/DropZone/DropZone';
import SlotItemWrapper from '@/components/SlotItemWrapper/SlotItemWrapper';
import { usePreviewMode } from '../previewMode';
import { useRenderNodeRefs } from '../propResolvers';
import { normalizeNodeRefs } from '../nodeRefLogic';

type ModalForPreviewProps = Omit<React.ComponentProps<typeof Modal>, 'children'> & {
  previewNodeId?: string;
  children?: unknown;
};

const ModalForPreview: React.FC<ModalForPreviewProps> = React.memo((props) => {
  const { previewNodeId, children, ...restProps } = props;
  const previewMode = usePreviewMode();
  const childRefs = React.useMemo(() => normalizeNodeRefs(children), [children]);
  const renderedChildren = useRenderNodeRefs(childRefs);

  const resolvedChildren = React.useMemo(() => {
    if (previewMode === 'pure' || !previewNodeId) {
      return renderedChildren;
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
        key="modal.children:add"
        targetNodeId={previewNodeId}
        propPath="children"
        direction="vertical"
        acceptTypes={['Form', 'Button', 'Description', 'Table', 'Text']}
      />,
    );

    return wrappedChildren;
  }, [previewNodeId, childRefs, previewMode, renderedChildren]);

  const mergedProps = React.useMemo<ModalProps>(
    () => ({
      getContainer: () => document.getElementById('modal-preview-root') || document.body,
      styles: {
        mask: { position: 'absolute' },
        wrapper: { position: 'absolute' },
      },
      ...restProps,
    }),
    [restProps],
  );

  return <Modal {...mergedProps}>{resolvedChildren}</Modal>;
});

ModalForPreview.displayName = 'ModalForPreview';

export default ModalForPreview;
