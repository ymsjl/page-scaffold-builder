import { createSelector } from '@reduxjs/toolkit';
import type { MaybeWritable, RootState } from '@/store/storeTypes';
import type { EditableSource, SchemaItemSource } from '../types/EditableSource';
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
      case 'component-node':
        return activeSource.nodeId === target.nodeId;
      case 'slot-node':
        return (
          activeSource.ownerNodeId === target.ownerNodeId &&
          activeSource.propPath === target.propPath &&
          activeSource.nodeId === target.nodeId
        );
      case 'schema-item':
        return (
          activeSource.ownerNodeId === target.ownerNodeId &&
          activeSource.collectionKey === target.collectionKey &&
          activeSource.editorKind === target.editorKind &&
          activeSource.itemKey === target.itemKey &&
          activeSource.itemIndex === target.itemIndex
        );
      default:
        return false;
    }
  });
