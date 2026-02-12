import { PayloadAction } from "@reduxjs/toolkit";
import { WritableDraft } from "immer";
import type { PrimitiveVariableValue } from "@/types";
import type { ComponentTreeState } from "../componentTreeSlice";
import { makeVariableId } from "../componentTreeSlice";
import { variableAdapter } from "../componentTreeAdapters";

type VariableChangePayload = {
  name: string;
  initialValue: PrimitiveVariableValue;
};

type SetVariableValuePayload = {
  name: string;
  value: PrimitiveVariableValue;
};

const buildVariableValuesFromDefinitions = (
  state: WritableDraft<ComponentTreeState>,
) => {
  const nextValues: Record<string, PrimitiveVariableValue> = {};
  for (const variable of Object.values(state.variables.entities)) {
    if (!variable) continue;
    nextValues[variable.name] = variable.initialValue;
  }
  state.variableValues = nextValues;
};

export const createVariablesReducers = () => {
  type State = WritableDraft<ComponentTreeState>;

  return {
    startCreateVariable: (state: State) => {
      state.isVariableModalOpen = true;
      state.editingVariableId = null;
    },

    startEditVariable: (state: State, action: PayloadAction<string>) => {
      state.isVariableModalOpen = true;
      state.editingVariableId = action.payload;
    },

    closeVariableModal: (state: State) => {
      state.isVariableModalOpen = false;
      state.editingVariableId = null;
    },

    applyVariableChange: (
      state: State,
      action: PayloadAction<VariableChangePayload>,
    ) => {
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

    deleteVariable: (state: State, action: PayloadAction<string>) => {
      const variable = state.variables.entities[action.payload];
      if (!variable) return;

      variableAdapter.removeOne(state.variables, action.payload);
      delete state.variableValues[variable.name];

      if (state.editingVariableId === action.payload) {
        state.editingVariableId = null;
      }
    },

    setVariableValue: (
      state: State,
      action: PayloadAction<SetVariableValuePayload>,
    ) => {
      const variable = Object.values(state.variables.entities).find(
        (item) => item?.name === action.payload.name,
      );
      if (!variable) return;
      state.variableValues[action.payload.name] = action.payload.value;
    },

    resetVariableValues: (state: State) => {
      buildVariableValuesFromDefinitions(state);
    },
  };
};
