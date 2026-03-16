export type EditingInteractionSource = 'canvas' | 'tree' | 'panel' | 'context-menu';

export type ComponentNodeSource = {
  kind: 'component-node';
  nodeId: string;
};

export type NodeSlotSource = {
  kind: 'slot-node';
  ownerNodeId: string;
  propPath: string;
  nodeId: string;
};

export type SchemaItemSource = {
  kind: 'schema-item';
  ownerNodeId: string;
  collectionKey: string;
  editorKind: string;
  itemKey: string;
  surfaceKey?: string;
  itemIndex?: number;
};

export type EditableSource = ComponentNodeSource | NodeSlotSource | SchemaItemSource;

export const createComponentNodeSource = ({
  nodeId,
}: Omit<ComponentNodeSource, 'kind'>): ComponentNodeSource => ({
  kind: 'component-node',
  nodeId,
});

export const createNodeSlotSource = ({
  ownerNodeId,
  propPath,
  nodeId,
}: Omit<NodeSlotSource, 'kind'>): NodeSlotSource => ({
  kind: 'slot-node',
  ownerNodeId,
  propPath,
  nodeId,
});

export const createSchemaItemSource = ({
  ownerNodeId,
  collectionKey,
  editorKind,
  itemKey,
  surfaceKey,
  itemIndex,
}: Omit<SchemaItemSource, 'kind'>): SchemaItemSource => ({
  kind: 'schema-item',
  ownerNodeId,
  collectionKey,
  editorKind,
  itemKey,
  surfaceKey,
  itemIndex,
});

export const isSameEditableSource = (
  left: EditableSource | null | undefined,
  right: EditableSource | null | undefined,
): boolean => {
  if (!left || !right) {
    return left === right;
  }

  if (left.kind !== right.kind) {
    return false;
  }

  switch (left.kind) {
    case 'component-node':
      return left.nodeId === (right as ComponentNodeSource).nodeId;
    case 'slot-node':
      return (
        left.ownerNodeId === (right as NodeSlotSource).ownerNodeId &&
        left.propPath === (right as NodeSlotSource).propPath &&
        left.nodeId === (right as NodeSlotSource).nodeId
      );
    case 'schema-item':
      return (
        left.ownerNodeId === (right as SchemaItemSource).ownerNodeId &&
        left.collectionKey === (right as SchemaItemSource).collectionKey &&
        left.editorKind === (right as SchemaItemSource).editorKind &&
        left.itemKey === (right as SchemaItemSource).itemKey &&
        left.surfaceKey === (right as SchemaItemSource).surfaceKey &&
        left.itemIndex === (right as SchemaItemSource).itemIndex
      );
    default:
      return false;
  }
};
