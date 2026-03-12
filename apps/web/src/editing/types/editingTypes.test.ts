import { describe, expect, it } from 'vitest';
import {
  buildEditableProjectionId,
  createEditableProjection,
  createNodeSlotSource,
  createSchemaItemSource,
  isSameEditableSource,
} from './index';

describe('editing type factories', () => {
  it('builds stable ids for schema-item projections', () => {
    const source = createSchemaItemSource({
      ownerNodeId: 'table-1',
      collectionKey: 'columns',
      editorKind: 'column',
      itemKey: 'name',
      itemIndex: 0,
    });

    expect(buildEditableProjectionId(source)).toBe('schema-item:table-1:columns:name');
  });

  it('builds stable ids for slot-node projections', () => {
    const source = createNodeSlotSource({
      ownerNodeId: 'card-1',
      propPath: 'body',
      nodeId: 'text-1',
    });

    expect(buildEditableProjectionId(source)).toBe('slot-node:card-1:body:text-1');
  });

  it('creates editable projections from sources', () => {
    const source = createNodeSlotSource({
      ownerNodeId: 'page-1',
      propPath: 'children',
      nodeId: 'button-1',
    });

    const projection = createEditableProjection({
      source,
      label: 'Primary Button',
      capabilities: ['selectable', 'open-panel'],
    });

    expect(projection.id).toBe('slot-node:page-1:children:button-1');
    expect(projection.kind).toBe('slot-node');
    expect(projection.label).toBe('Primary Button');
    expect(projection.capabilities).toEqual(['selectable', 'open-panel']);
  });

  it('compares editable sources by semantic identity', () => {
    const left = createSchemaItemSource({
      ownerNodeId: 'table-1',
      collectionKey: 'columns',
      editorKind: 'column',
      itemKey: 'status',
      itemIndex: 2,
    });
    const right = createSchemaItemSource({
      ownerNodeId: 'table-1',
      collectionKey: 'columns',
      editorKind: 'column',
      itemKey: 'status',
      itemIndex: 2,
    });

    expect(isSameEditableSource(left, right)).toBe(true);
  });
});
