import { combineReducers } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import componentTree from './componentTreeSlice/componentTreeSlice';
import entityModelReducers from './entityModelSlice/entityModelSlice';
import { columnEditorReducer } from './columnEditorSlice/columnEditorSlice';
import { propertyPanelReducer } from './propertyPanelSlice/propertyPanelSlice';
import { variablesReducer } from './variablesSlice/variablesSlice';
import actionFlows, { actionFlowsPersistWhitelist } from './actionFlows/actionFlowsSlice';
import { projectReducer } from './projectSlice/projectSlice';
import { baseApi } from './api/baseApi';

export const componentTreePersistWhitelist = ['entityModel'] as const;

const componentTreePersistConfig = {
  key: 'componentTree',
  storage,
  whitelist: [...componentTreePersistWhitelist],
};

const actionFlowsPersistConfig = {
  key: 'actionFlows',
  storage,
  whitelist: [...actionFlowsPersistWhitelist],
};

export const rootReducer = combineReducers({
  componentTree: persistReducer(componentTreePersistConfig, componentTree),
  entityModel: persistReducer(
    {
      key: 'entityModel',
      storage,
    },
    entityModelReducers,
  ),
  propertyPanel: propertyPanelReducer,
  columnEditor: columnEditorReducer,
  variables: variablesReducer,
  actionFlows: persistReducer(actionFlowsPersistConfig, actionFlows),
  project: projectReducer,
  [baseApi.reducerPath]: baseApi.reducer,
});

export type RootState = ReturnType<typeof rootReducer>;
