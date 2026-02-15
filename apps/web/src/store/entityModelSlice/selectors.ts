import { createSelector } from '@reduxjs/toolkit';
import type { EntityModel } from '@/validation';
import { type RootState } from '../rootReducer';
import { entityModelAdapter } from './entityModelAdapter';
import { type MaybeWritable } from '../storeTypes';
import { type EntityModelState } from './entityModelSlice';

export const selectEntityModelState = (state: RootState) => state.entityModel;

export const getEntityModel = (state: MaybeWritable<EntityModelState>) => state.entityModel;
export const selectEntityModel = createSelector(
  selectEntityModelState,
  (state) => state.entityModel,
);

export const entityModelSelectors = entityModelAdapter.getSelectors(selectEntityModel);

/**
 * @description 获取正在编辑的实体模型ID
 */
export const getEditingEntityModelId = (state: MaybeWritable<EntityModelState>) =>
  state.editingEntityModelId;
export const selectEditingEntityModelId = createSelector(
  selectEntityModelState,
  getEditingEntityModelId,
);

/**
 * @description 获取正在编辑的实体模型
 * @return EntityModel | null | undefined
 */
const getEditingEntityModelResult = (
  editingEntityModelId: string | null,
  entityModelState: ReturnType<typeof entityModelAdapter.getInitialState>,
): EntityModel | null | undefined => {
  if (!editingEntityModelId) return null;
  return entityModelState.entities[editingEntityModelId] || null;
};
export const getEditingEntityModel = (state: MaybeWritable<EntityModelState>) =>
  getEditingEntityModelResult(getEditingEntityModelId(state), getEntityModel(state));

export const selectEditingEntityModel = createSelector(
  [selectEditingEntityModelId, selectEntityModel],
  getEditingEntityModelResult,
);

/**
 * @description 获取是否打开实体模型弹窗
 */
export const getIsEntityModelModalOpen = (state: MaybeWritable<EntityModelState>) =>
  state.isEntityModelModalOpen;
export const selectIsEntityModelModalOpen = createSelector(
  selectEntityModelState,
  getIsEntityModelModalOpen,
);
