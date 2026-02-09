import {
  createSlice,
  createEntityAdapter,
} from "@reduxjs/toolkit";
import type { ComponentNode } from "@/types/Component";
import type { EntityModel, ProCommonColumn } from "@/types";
import { makeIdCreator } from "@/utils/makeIdCreator";
import {
  createNodeReducers,
  createColumnReducers,
  createColumnEditingReducers,
  createRuleNodeReducers,
  createEntityModelReducers,
  createNodeRefReducers,
} from "./reducers";

const adapter = createEntityAdapter<ComponentNode>();

export { adapter };

export const entityModelAdapter = createEntityAdapter<EntityModel>();

export const makeColumnId = makeIdCreator("column");
export const makeNodeId = makeIdCreator("node");
export const makeRuleId = makeIdCreator("rule");
export const makeEntityModelId = makeIdCreator("et");

export interface ComponentTreeState {
  rootIds: string[];
  selectedNodeId: string | null;
  expandedKeys: string[];
  editingColumn: Partial<ProCommonColumn> | null;
  components: ReturnType<typeof adapter.getInitialState>;
  isSchemaBuilderModalOpen: boolean;
  entityModel: ReturnType<typeof entityModelAdapter.getInitialState>;
  isEntityModelModalOpen: boolean;
  editingEntityModelId: string | null;
}

const initialState: ComponentTreeState = {
  rootIds: [],
  selectedNodeId: null,
  expandedKeys: [],
  editingColumn: null,
  components: adapter.getInitialState(),
  isSchemaBuilderModalOpen: false,
  entityModel: entityModelAdapter.getInitialState({}),
  isEntityModelModalOpen: false,
  editingEntityModelId: null,
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
export const componentTreeAdapter = adapter;
