import type { EditableSource } from './EditableSource';

export type EditableCapability =
  | 'selectable'
  | 'removable'
  | 'reorderable'
  | 'renameable'
  | 'open-panel'
  | 'show-context-menu';

export type EditableProjection = {
  id: string;
  kind: EditableSource['kind'];
  source: EditableSource;
  label?: string;
  description?: string;
  capabilities: EditableCapability[];
  outlineVariant?: 'default' | 'subtle';
  renderMeta?: Record<string, unknown>;
};

export const buildEditableProjectionId = (source: EditableSource): string => {
  switch (source.kind) {
    case 'component-node':
      return ['component-node', source.nodeId].join(':');
    case 'slot-node':
      return ['slot-node', source.ownerNodeId, source.propPath, source.nodeId].join(':');
    case 'schema-item':
      return [
        'schema-item',
        source.ownerNodeId,
        source.collectionKey,
        source.itemKey ?? `index-${source.itemIndex ?? -1}`,
      ].join(':');
    default:
      return 'unknown';
  }
};

type CreateEditableProjectionArgs = {
  source: EditableSource;
  label?: string;
  description?: string;
  capabilities: EditableCapability[];
  outlineVariant?: 'default' | 'subtle';
  renderMeta?: Record<string, unknown>;
};

export const createEditableProjection = ({
  source,
  label,
  description,
  capabilities,
  outlineVariant,
  renderMeta,
}: CreateEditableProjectionArgs): EditableProjection => ({
  id: buildEditableProjectionId(source),
  kind: source.kind,
  source,
  label,
  description,
  capabilities,
  outlineVariant,
  renderMeta,
});
