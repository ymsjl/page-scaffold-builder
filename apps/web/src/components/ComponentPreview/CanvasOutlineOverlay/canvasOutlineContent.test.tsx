import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { EditableProjection } from '@/editing/types';
import { EditableShell } from '@/components/EditableShell/EditableShell';
import {
  CanvasOutlineContentProvider,
  RenderedInCanvasOutline,
  useCanvasOutlineRenderNodes,
} from './canvasOutlineContent';

const projection: EditableProjection = {
  id: 'schema-item:table-1:columns:column:name:header',
  kind: 'schema-item',
  source: {
    kind: 'schema-item',
    ownerNodeId: 'table-1',
    collectionKey: 'columns',
    editorKind: 'column',
    itemKey: 'name',
    surfaceKey: 'header',
  },
  capabilities: ['selectable'],
};

const OutlineProbe: React.FC<{ targetId: string }> = ({ targetId }) => {
  const nodes = useCanvasOutlineRenderNodes(targetId);

  return <div data-testid="outline-probe">{nodes}</div>;
};

describe('canvas outline content registration', () => {
  it('registers content against the nearest editable shell target', () => {
    render(
      <CanvasOutlineContentProvider>
        <OutlineProbe targetId={projection.id} />
        <EditableShell target={projection}>
          <RenderedInCanvasOutline>
            <div>this jsx should be rendered in my outline</div>
          </RenderedInCanvasOutline>
          <div>cell content</div>
        </EditableShell>
      </CanvasOutlineContentProvider>,
    );

    expect(screen.getByTestId('outline-probe')).toHaveTextContent(
      'this jsx should be rendered in my outline',
    );
  });
});
