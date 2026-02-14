import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { NormalizedComponentTree } from '@/types/Component';
import type { ProCommonColumn, PrimitiveVariableValue } from '@/types';
import {
  createNodeReducers,
  createColumnReducers,
  createColumnEditingReducers,
  createRuleNodeReducers,
  createEntityModelReducers,
  createNodeRefReducers,
  createVariablesReducers,
} from './reducers';
import { createEmptyNormalizedTree } from './componentTreeNormalization';
import { entityModelAdapter, variableAdapter } from './componentTreeAdapters';

export interface ComponentTreeState {
  selectedNodeId: string | null;
  expandedKeys: string[];
  editingColumn: Partial<ProCommonColumn> | null;
  normalizedTree: NormalizedComponentTree;
  isSchemaBuilderModalOpen: boolean;
  entityModel: ReturnType<typeof entityModelAdapter.getInitialState>;
  isEntityModelModalOpen: boolean;
  editingEntityModelId: string | null;
  variables: ReturnType<typeof variableAdapter.getInitialState>;
  variableValues: Record<string, PrimitiveVariableValue>;
  isVariableModalOpen: boolean;
  editingVariableId: string | null;
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
  variables: variableAdapter.getInitialState({}),
  variableValues: {},
  isVariableModalOpen: false,
  editingVariableId: null,
  propertyPanelNodeIds: [],
};

export type ComponentTreeSnapshot = Pick<
  ComponentTreeState,
  | 'selectedNodeId'
  | 'expandedKeys'
  | 'normalizedTree'
  | 'entityModel'
  | 'variables'
  | 'variableValues'
>;

const slice = createSlice({
  name: 'componentTree',
  initialState,
  reducers: {
    ...createNodeReducers(),
    ...createNodeRefReducers(),
    ...createColumnReducers(),
    ...createColumnEditingReducers(),
    ...createRuleNodeReducers(),
    ...createEntityModelReducers(),
    ...createVariablesReducers(),
    hydrateFromSnapshot: (state, action: PayloadAction<Partial<ComponentTreeSnapshot>>) => {
      const next = action.payload;

      if (typeof next.selectedNodeId !== 'undefined') {
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
      if (next.variables) {
        state.variables = next.variables;
      }
      if (next.variableValues) {
        state.variableValues = next.variableValues;
      }

      state.editingColumn = null;
      state.isSchemaBuilderModalOpen = false;
      state.isEntityModelModalOpen = false;
      state.editingEntityModelId = null;
      state.isVariableModalOpen = false;
      state.editingVariableId = null;
      state.propertyPanelNodeIds = [];
    },
  },
});

export const componentTreeActions = slice.actions;
export default slice.reducer;
