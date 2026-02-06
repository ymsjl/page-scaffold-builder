import { createSelector } from "reselect";
import type { RootState } from "../rootReducer";
import { componentTreeAdapter } from "./componentTreeSlice";
import { mapProCommonColumnToProps } from "./mapProCommonColumnToProps";
import { NodeRef, ProCommonColumn } from "@/types";
import { getComponentPrototype } from "@/componentMetas";
import { entityModelAdapter } from "./componentTreeSlice";

export const selectComponentTreeState = (state: RootState) =>
  state.componentTree;

export const selectComponentTreeComponents = createSelector(
  selectComponentTreeState,
  (state) => state.components,
);

export const componentNodesSelectors = componentTreeAdapter.getSelectors(
  selectComponentTreeComponents,
);

export const selectSelectedNodeId = (state: RootState) =>
  state.componentTree.selectedNodeId;

export const selectSelectedNode = createSelector(
  [componentNodesSelectors.selectEntities, selectSelectedNodeId],
  (entities, id) => (id ? entities?.[id] : null),
);

export const selectColumnsOfSelectedNode = createSelector(
  selectSelectedNode,
  (node) => (node ? (node.props?.columns ?? []) : []) as ProCommonColumn[],
);

export const selectTypeOfSelectedNode = createSelector(
  selectSelectedNode,
  (node) => (node ? node.type : null),
);

export const selectNodeForPreview = createSelector(
  selectSelectedNode,
  (node) => {
    if (!node) return null;
    const props = { ...(node.props ?? {}) };
    const componentPrototype = getComponentPrototype(node.type);
    if (!componentPrototype) return { ...node, props };
    if (
      "columns" in (componentPrototype.propsTypes || {}) &&
      Array.isArray(props.columns)
    ) {
      props.columns = props.columns.map(mapProCommonColumnToProps);
    }
    return { ...node, props };
  },
);

export const selectFirstParentPageNode = createSelector(selectSelectedNode, componentNodesSelectors.selectEntities, (node, entities) => {
  if (!node) return null;
  let currentNode = node;
  while (currentNode.parentId) {
    const parentNode = entities[currentNode.parentId];
    if (!parentNode) break;
    parentNode.type === "Page" && (currentNode = parentNode);
    currentNode = parentNode;
  }
  return currentNode.type === "Page" ? currentNode : null;
});

export const selectSelectedNodeEntityModelId = createSelector(
  selectSelectedNode,
  (node) => node?.props?.entityModelId || null,
);

export const selectEditingColumn = createSelector(
  selectComponentTreeState,
  (state) => state.editingColumn || null,
);

export const selectRuleNodesOfEditingColumn = createSelector(
  selectEditingColumn,
  (editingColumn) => editingColumn?.ruleNodes || [],
);

export const selectEditingColumnProps = createSelector(
  selectEditingColumn,
  (editingColumn) => {
    if (!editingColumn) return {} as Omit<ProCommonColumn, "ruleNodes">;
    return mapProCommonColumnToProps(editingColumn);
  },
);

export const selectEntityModelState = createSelector(
  selectComponentTreeState,
  (componentTreeState) => componentTreeState.entityModel,
);

export const entityModelSelectors = entityModelAdapter.getSelectors(
  selectEntityModelState,
);

export const selectIsEntityModelModalOpen = createSelector(
  selectComponentTreeState,
  (componentTreeState) => componentTreeState.isEntityModelModalOpen,
);

export const selectEntityModelInUse = createSelector(
  [selectSelectedNodeEntityModelId, entityModelSelectors.selectEntities],
  (entityModelId, entities) => {
    return entityModelId ? entities[entityModelId] : null;
  },
);

export const selectEditingEntityModelId = createSelector(
  selectComponentTreeState,
  (state) => state.editingEntityModelId,
);

export const selectEditingEntityModel = createSelector(
  entityModelSelectors.selectEntities,
  selectEditingEntityModelId,
  (entities, editingEntityModelId) => {
    if (!editingEntityModelId) return null;
    return entities[editingEntityModelId] || null;
  },
);
