import type { VariableDefinition, PrimitiveVariableValue } from '@/types';
import { createSelector } from 'reselect';
import { variableAdapter } from './variableAdapter';
import { type MaybeWritable } from '../storeTypes';
import type { RootState } from '../rootReducer';
import type { VariablesState } from './variablesSlice';

export const selectVariablesState = (state: RootState) => state.variables;

export const getVariables = (state: MaybeWritable<VariablesState>) => state.variables;
export const selectVariables = createSelector(selectVariablesState, getVariables);

export const variableSelectors = variableAdapter.getSelectors(selectVariables);

export const getIsVariableModalOpen = (state: MaybeWritable<VariablesState>) =>
  state.isVariableModalOpen;
export const selectIsVariableModalOpen = createSelector(
  selectVariablesState,
  getIsVariableModalOpen,
);

export const getEditingVariableId = (state: MaybeWritable<VariablesState>) =>
  state.editingVariableId;
export const selectEditingVariableId = createSelector(selectVariablesState, getEditingVariableId);

const getEditingVariableResult = (
  editingVariableId: string | null,
  variablesState: ReturnType<typeof variableAdapter.getInitialState>,
): VariableDefinition | null => {
  if (!editingVariableId) return null;
  return variablesState.entities[editingVariableId] || null;
};
export const getEditingVariable = (state: MaybeWritable<VariablesState>) =>
  getEditingVariableResult(getEditingVariableId(state), getVariables(state));
export const selectEditingVariable = createSelector(
  [selectEditingVariableId, selectVariables],
  getEditingVariableResult,
);

export const getVariableValues = (state: MaybeWritable<VariablesState>) => state.variableValues;
export const selectVariableValues = createSelector(selectVariablesState, getVariableValues);

export const selectVariableValueByName = (name: string) =>
  createSelector(selectVariableValues, (values): PrimitiveVariableValue | undefined => {
    return values[name];
  });
