import React from 'react';
import type { ComponentNode } from '@/types';
import { componentNodesSelectors } from '@/store/componentTreeSlice/componentTreeSelectors';
import { useAppSelector } from '@/store/hooks';
import { getComponentPrototype } from '../../componentMetas';
import { usePreviewMode, type PreviewMode } from './previewMode';
import { RenderNodeRefProvider } from './propResolvers';
import * as previewStyles from './previewStyles.css';
import { RenderSingleNode } from './RenderSingleNode';

type RenderNodeRefProps = {
  nodeId: string;
  previewMode: PreviewMode;
};

export const RenderNodeRefComponent: React.FC<RenderNodeRefProps> = ({ nodeId, previewMode }) => {
  const node = useAppSelector((state) => componentNodesSelectors.selectById(state, nodeId)) as
    | ComponentNode
    | undefined;

  if (!node) {
    return null;
  }

  const prototype = getComponentPrototype(node.type, { previewMode });
  if (!prototype) {
    return null;
  }

  return <RenderSingleNode node={node} componentPrototype={prototype} />;
};

type ComponentPreviewInnerProps = {
  node: ComponentNode;
  componentPrototype: NonNullable<ReturnType<typeof getComponentPrototype>>;
  containerVariant?: 'builder' | 'final';
};

const ComponentPreviewInner = React.memo(
  ({ node, componentPrototype, containerVariant = 'builder' }: ComponentPreviewInnerProps) => {
    const previewMode = usePreviewMode();

    const renderNodeRef = React.useCallback(
      (nodeId: string) => (
        <RenderNodeRefComponent key={nodeId} nodeId={nodeId} previewMode={previewMode} />
      ),
      [previewMode],
    );

    const containerClass =
      containerVariant === 'final' ? previewStyles.finalContainer : previewStyles.container;

    return (
      <RenderNodeRefProvider renderNodeRef={renderNodeRef}>
        <div id="modal-preview-root" className={containerClass}>
          <RenderSingleNode node={node} componentPrototype={componentPrototype} />
        </div>
      </RenderNodeRefProvider>
    );
  },
);

export default ComponentPreviewInner;
