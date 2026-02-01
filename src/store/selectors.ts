import { createSelector } from "reselect";
import type { RootState } from "./storeTypes";
import { componentTreeAdapter } from "./slices/componentTreeSlice";
import { entityModelAdapter } from "./slices/entityModelSlice";

export const selectComponentTreeState = (state: RootState) =>
  state.componentTree;
export const componentNodesSelectors = componentTreeAdapter.getSelectors(
  selectComponentTreeState,
);

export const selectSelectedNodeId = (state: RootState) =>
  state.componentTree.selectedNodeId;
export const selectSelectedNode = createSelector(
  [componentNodesSelectors.selectEntities, selectSelectedNodeId],
  (entities, id) => (id ? entities?.[id] : null),
);
export const selectSelectedNodeEntityModelId = createSelector(
  [selectSelectedNode],
  (node) => node?.props?.entityModelId || null,
);

export const selectSchemaEditor = (state: RootState) => state.schemaEditor;
export const selectEditingColumn = createSelector(
  selectSchemaEditor,
  (state) => state.editingColumn,
);
export const selectSchemaEditorVisible = createSelector(
  selectSchemaEditor,
  (state) => state.schemaEditorVisible,
);

export const selectEntityModelState = (state: RootState) => state.entityModel;
export const selectEditingEntityModel = createSelector(
  selectEntityModelState,
  (state) => state.editingEntityModel,
);
export const entityModelSelectors = entityModelAdapter.getSelectors(
  selectEntityModelState,
);

export const selectSelectedNodeEntityFields = createSelector(
  [selectSelectedNodeEntityModelId, entityModelSelectors.selectEntities],
  (entityModelId, entities) => {
    if (!entityModelId) return [];
    return entities?.[entityModelId]?.fields || [];
  },
);
