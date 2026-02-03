import { createSelector } from "reselect";
import type { RootState } from "../../rootReducer";
import { entityModelAdapter } from "./entityModelSlice";

export const selectEntityModelState = (state: RootState) => state.entityModel;

export const entityModelSelectors = entityModelAdapter.getSelectors(
  selectEntityModelState
);

export const selectEditingEntityModelId = createSelector(
  selectEntityModelState,
  (state) => state.editingEntityModelId
);