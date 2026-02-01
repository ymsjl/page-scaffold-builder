import { combineReducers } from '@reduxjs/toolkit';
import componentTreeReducer from './slices/componentTreeSlice';
import uiReducer from './slices/uiSlice';
import schemaEditorReducer from './slices/schemaEditorSlice';
import entityTypesReducer from './slices/entityTypesSlice';
import ruleBuilderReducer from './slices/ruleBuilderSlice';

export const rootReducer = combineReducers({
  componentTree: componentTreeReducer,
  ui: uiReducer,
  schemaEditor: schemaEditorReducer,
  entityTypes: entityTypesReducer,
  ruleBuilder: ruleBuilderReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
