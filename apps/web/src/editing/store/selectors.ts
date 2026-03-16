import { createSelector } from '@reduxjs/toolkit';
import type { MaybeWritable, RootState } from '@/store/storeTypes';
import type {
  ComponentNodeSource,
  EditableSource,
  NodeSlotSource,
  SchemaItemSource,
} from '../types/EditableSource';
import type { EditingState } from './editingSlice';

export const selectEditingState = (state: RootState) => state.editing;

const getActiveSource = (state: MaybeWritable<EditingState>) => state.activeSource;
const getHoverSource = (state: MaybeWritable<EditingState>) => state.hoverSource;
const getInteractionSource = (state: MaybeWritable<EditingState>) => state.interactionSource;

export const selectActiveEditingSource = createSelector(selectEditingState, getActiveSource);

export const selectHoverEditingSource = createSelector(selectEditingState, getHoverSource);

export const selectEditingInteractionSource = createSelector(
  selectEditingState,
  getInteractionSource,
);

const getActiveSchemaItemSource = (
  activeSource: EditableSource | null,
): SchemaItemSource | null => {
  if (!activeSource || activeSource.kind !== 'schema-item') {
    return null;
  }

  return activeSource;
};

export const selectActiveSchemaItemSource = createSelector(
  selectActiveEditingSource,
  getActiveSchemaItemSource,
);

export const makeSelectIsEditingSourceActive = (target: EditableSource) =>
  createSelector(selectActiveEditingSource, (activeSource) => {
    if (!activeSource) {
      return false;
    }

    if (activeSource.kind !== target.kind) {
      return false;
    }

    switch (target.kind) {
      case 'component-node': {
        const componentTarget = target as ComponentNodeSource;
        const componentActiveSource = activeSource as ComponentNodeSource;

        return componentActiveSource.nodeId === componentTarget.nodeId;
      }
      case 'slot-node': {
        const slotTarget = target as NodeSlotSource;
        const slotActiveSource = activeSource as NodeSlotSource;

        return (
          slotActiveSource.ownerNodeId === slotTarget.ownerNodeId &&
          slotActiveSource.propPath === slotTarget.propPath &&
          slotActiveSource.nodeId === slotTarget.nodeId
        );
      }
      case 'schema-item': {
        const schemaTarget = target as SchemaItemSource;
        const schemaActiveSource = activeSource as SchemaItemSource;

        return (
          schemaActiveSource.ownerNodeId === schemaTarget.ownerNodeId &&
          schemaActiveSource.collectionKey === schemaTarget.collectionKey &&
          schemaActiveSource.editorKind === schemaTarget.editorKind &&
          schemaActiveSource.itemKey === schemaTarget.itemKey &&
          schemaActiveSource.surfaceKey === schemaTarget.surfaceKey &&
          schemaActiveSource.itemIndex === schemaTarget.itemIndex
        );
      }
      default:
        return false;
    }
  });
