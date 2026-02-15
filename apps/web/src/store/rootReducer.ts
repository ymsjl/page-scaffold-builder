import { combineReducers } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import componentTree from './componentTreeSlice/componentTreeSlice';
import entityModelReducers from './entityModelSlice/entityModelSlice';
import actionFlows, { actionFlowsPersistWhitelist } from './actionFlows/actionFlowsSlice';
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
  actionFlows: persistReducer(actionFlowsPersistConfig, actionFlows),
  [baseApi.reducerPath]: baseApi.reducer,
});

export type RootState = ReturnType<typeof rootReducer>;
