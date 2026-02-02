import { createSelector } from "reselect";
import type { RootState } from "../../rootReducer";
import { selectSelectedNodeEntityModelId } from "../componentTree/componentTreeSelectors";
import { entityModelAdapter } from "./entityModelSlice";

export const selectEntityModelState = (state: RootState) => state.entityModel;

export const entityModelSelectors = entityModelAdapter.getSelectors(
  selectEntityModelState
);
export const selectEditingEntityModel = createSelector(
  selectEntityModelState,
  (state) => state.editingEntityModel
);

export const selectSelectedNodeEntityFields = createSelector(
  [selectSelectedNodeEntityModelId, entityModelSelectors.selectEntities],
  (entityModelId, entities) => {
    if (!entityModelId) return [];
    return entities?.[entityModelId]?.fields || [];
  }
);
