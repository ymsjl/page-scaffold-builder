import { createSelector } from "reselect";
import type { RootState } from "./storeTypes";
import { componentTreeAdapter } from "./slices/componentTreeSlice";
import { entityTypesAdapter } from "./slices/entityTypesSlice";

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
export const selectSelectedNodeEntityTypeId = createSelector(
  [selectSelectedNode],
  (node) => node?.props?.entityTypeId || null,
);

export const selectSchemaEditor = (state: RootState) => state.schemaEditor;
export const selectEditingColumn = createSelector(
  selectSchemaEditor,
  (state) => state.editingColumn,
);

export const selectUI = (state: RootState) => state.ui;
export const selectSchemaEditorVisible = createSelector(
  selectSchemaEditor,
  (state) => state.schemaEditorVisible,
);

export const selectEntityTypesState = (state: RootState) => state.entityTypes;
export const entityTypesSelectors = entityTypesAdapter.getSelectors(
  selectEntityTypesState,
);

export const selectSelectedNodeEntityFields = createSelector(
  [selectSelectedNodeEntityTypeId, entityTypesSelectors.selectEntities],
  (entityTypeId, entities) => {
    if (!entityTypeId) return [];
    return entities?.[entityTypeId]?.fields || [];
  },
);
