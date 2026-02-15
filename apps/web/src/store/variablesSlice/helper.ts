import type { PrimitiveVariableValue } from '@/types';
import { type WritableDraft } from 'immer';
import { type VariablesState } from './variablesSlice';

export const buildVariableValuesFromDefinitions = (state: WritableDraft<VariablesState>) => {
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
