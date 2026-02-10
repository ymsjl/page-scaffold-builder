import {
  createSlice,
} from "@reduxjs/toolkit";
import type { NormalizedComponentTree } from "@/types/Component";
import type { ProCommonColumn } from "@/types";
import { makeIdCreator } from "@/utils/makeIdCreator";
import {
  createNodeReducers,
  createColumnReducers,
  createColumnEditingReducers,
  createRuleNodeReducers,
  createEntityModelReducers,
  createNodeRefReducers,
} from "./reducers";
import { createEmptyNormalizedTree } from "./componentTreeNormalization";
import { entityModelAdapter } from "./componentTreeSelectors";

export const makeColumnId = makeIdCreator("column");
export const makeNodeId = makeIdCreator("node");
export const makeRuleId = makeIdCreator("rule");
export const makeEntityModelId = makeIdCreator("et");

export interface ComponentTreeState {
  selectedNodeId: string | null;
  expandedKeys: string[];
  editingColumn: Partial<ProCommonColumn> | null;
  normalizedTree: NormalizedComponentTree;
  isSchemaBuilderModalOpen: boolean;
  entityModel: ReturnType<typeof entityModelAdapter.getInitialState>;
  isEntityModelModalOpen: boolean;
  editingEntityModelId: string | null;
  propertyPanelNodeIds?: string[];
}

const initialState: ComponentTreeState = {
  selectedNodeId: null,
  expandedKeys: [],
  editingColumn: null,
  normalizedTree: createEmptyNormalizedTree(),
  isSchemaBuilderModalOpen: false,
  entityModel: entityModelAdapter.getInitialState({}),
  isEntityModelModalOpen: false,
  editingEntityModelId: null,
  propertyPanelNodeIds: [],
};

export const componentTreePersistWhitelist = ["entityModel"] as const;

const slice = createSlice({
  name: "componentTree",
  initialState,
  reducers: {
    ...createNodeReducers(),
    ...createNodeRefReducers(),
    ...createColumnReducers(),
    ...createColumnEditingReducers(),
    ...createRuleNodeReducers(),
    ...createEntityModelReducers(),
  },
});

export const componentTreeActions = slice.actions;
export default slice.reducer;

