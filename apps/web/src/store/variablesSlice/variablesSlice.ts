import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { PrimitiveVariableValue } from '@/types';
import { type WritableDraft } from 'immer';
import { makeVariableId } from '@/utils/makeIdCreator';
import { variableAdapter } from './variableAdapter';

type VariableChangePayload = {
  name: string;
  initialValue: PrimitiveVariableValue;
};

type SetVariableValuePayload = {
  name: string;
  value: PrimitiveVariableValue;
};

export interface VariablesState {
  variables: ReturnType<typeof variableAdapter.getInitialState>;
  variableValues: Record<string, PrimitiveVariableValue>;
  isVariableModalOpen: boolean;
  editingVariableId: string | null;
}

export type VariablesSnapshot = Pick<VariablesState, 'variables' | 'variableValues'>;

const initialState: VariablesState = {
  variables: variableAdapter.getInitialState({}),
  variableValues: {},
  isVariableModalOpen: false,
  editingVariableId: null,
};

const buildVariableValuesFromDefinitions = (state: WritableDraft<VariablesState>) => {
  const nextValues = Object.values(state.variables.entities).reduce(
    (acc, variable) => {
      if (variable) {
        acc[variable.name] = variable.initialValue;
      }
      return acc;
    },
    {} as Record<string, PrimitiveVariableValue>,
  );
  state.variableValues = nextValues;
};

const slice = createSlice({
  name: 'variables',
  initialState,
  reducers: {
    startCreateVariable: (state) => {
      state.isVariableModalOpen = true;
      state.editingVariableId = null;
    },

    startEditVariable: (state, action: PayloadAction<string>) => {
      state.isVariableModalOpen = true;
      state.editingVariableId = action.payload;
    },

    closeVariableModal: (state) => {
      state.isVariableModalOpen = false;
      state.editingVariableId = null;
    },

    applyVariableChange: (state, action: PayloadAction<VariableChangePayload>) => {
      const editingVariable = state.editingVariableId
        ? state.variables.entities[state.editingVariableId]
        : null;

      const previousName = editingVariable?.name;
      const variableId = state.editingVariableId ?? makeVariableId();

      variableAdapter.upsertOne(state.variables, {
        id: variableId,
        name: action.payload.name,
        initialValue: action.payload.initialValue,
      });

      if (previousName && previousName !== action.payload.name) {
        delete state.variableValues[previousName];
      }

      state.variableValues[action.payload.name] = action.payload.initialValue;

      state.isVariableModalOpen = false;
      state.editingVariableId = null;
    },

    deleteVariable: (state, action: PayloadAction<string>) => {
      const variable = state.variables.entities[action.payload];
      if (!variable) return;

      variableAdapter.removeOne(state.variables, action.payload);
      delete state.variableValues[variable.name];

      if (state.editingVariableId === action.payload) {
        state.editingVariableId = null;
      }
    },

    setVariableValue: (state, action: PayloadAction<SetVariableValuePayload>) => {
      const variable = Object.values(state.variables.entities).find(
        (item) => item?.name === action.payload.name,
      );
      if (!variable) return;
      state.variableValues[action.payload.name] = action.payload.value;
    },

    resetVariableValues: (state) => {
      buildVariableValuesFromDefinitions(state);
    },

    hydrateFromSnapshot: (state, action: PayloadAction<Partial<VariablesSnapshot>>) => {
      const next = action.payload;
      if (next.variables) {
        state.variables = next.variables;
      }
      if (next.variableValues) {
        state.variableValues = next.variableValues;
      }
      state.isVariableModalOpen = false;
      state.editingVariableId = null;
    },
  },
});

export const variablesActions = slice.actions;
export const {
  startCreateVariable,
  startEditVariable,
  closeVariableModal,
  applyVariableChange,
  deleteVariable,
  setVariableValue,
  resetVariableValues,
  hydrateFromSnapshot,
} = variablesActions;
export const variablesReducer = slice.reducer;
