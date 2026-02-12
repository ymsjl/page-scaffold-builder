import {
  createSlice,
} from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
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

export type ComponentTreeSnapshot = Pick<
  ComponentTreeState,
  "selectedNodeId" | "expandedKeys" | "normalizedTree" | "entityModel"
>;

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
    hydrateFromSnapshot: (
      state,
      action: PayloadAction<Partial<ComponentTreeSnapshot>>,
    ) => {
      const next = action.payload;

      if (typeof next.selectedNodeId !== "undefined") {
        state.selectedNodeId = next.selectedNodeId;
      }
      if (Array.isArray(next.expandedKeys)) {
        state.expandedKeys = next.expandedKeys;
      }
      if (next.normalizedTree) {
        state.normalizedTree = next.normalizedTree;
      }
      if (next.entityModel) {
        state.entityModel = next.entityModel;
      }

      state.editingColumn = null;
      state.isSchemaBuilderModalOpen = false;
      state.isEntityModelModalOpen = false;
      state.editingEntityModelId = null;
      state.propertyPanelNodeIds = [];
    },
  },
});

export const componentTreeActions = slice.actions;
export default slice.reducer;

