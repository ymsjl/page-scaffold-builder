import { createSelector } from "reselect";
import type { RootState } from "../../rootReducer";
import { componentTreeAdapter } from "./componentTreeSlice";
import { mapProCommonColumnToProps } from "./mapProCommonColumnToProps";
import { ProCommonColumn } from "@/types";
import { getComponentPrototype } from "@/componentMetas";

export const selectComponentTreeState = (state: RootState) => state.componentTree;

export const componentNodesSelectors = componentTreeAdapter.getSelectors(
  selectComponentTreeState
);

export const selectSelectedNodeId = (state: RootState) => state.componentTree.selectedNodeId;

export const selectSelectedNode = createSelector(
  [componentNodesSelectors.selectEntities, selectSelectedNodeId],
  (entities, id) => (id ? entities?.[id] : null)
);

export const selectNodeForPreview = createSelector(
  selectSelectedNode,
  (node) => {
    if (!node) return null;
    const props = { ...(node.props ?? {}) };
    const componentPrototype = getComponentPrototype(node.type);
    if (!componentPrototype) return { ...node, props };
    if ('columns' in (componentPrototype.propsTypes || {}) && Array.isArray(props.columns)) {
      props.columns = props.columns.map(mapProCommonColumnToProps);
    }
    return { ...node, props };
  }
);

export const selectSelectedNodeEntityModelId = createSelector(
  selectSelectedNode,
  (node) => node?.props?.entityModelId || null
);

export const selectEditingColumn = createSelector(
  selectComponentTreeState,
  (state) => state.editingColumn || null
);

export const selectRuleNodesOfEditingColumn = createSelector(
  selectEditingColumn,
  (editingColumn) => editingColumn?.ruleNodes || []
);

export const selectEditingColumnProps = createSelector(
  selectEditingColumn,
  (editingColumn) => {
    if (!editingColumn) return {} as Omit<ProCommonColumn, 'ruleNodes'>;
    return mapProCommonColumnToProps(editingColumn)
  }
);
