import { combineReducers } from '@reduxjs/toolkit';
import componentTreeReducer from './slices/componentTreeSlice';
import schemaEditorReducer from './slices/schemaEditorSlice';
import entityModel from './slices/entityModelSlice';
import ruleBuilderReducer from './slices/ruleBuilderSlice';

export const rootReducer = combineReducers({
  componentTree: componentTreeReducer,
  schemaEditor: schemaEditorReducer,
  entityModel,
  ruleBuilder: ruleBuilderReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
