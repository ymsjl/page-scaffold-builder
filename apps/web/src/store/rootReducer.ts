import { combineReducers } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import componentTree, { componentTreePersistWhitelist, } from './componentTree/componentTreeSlice';
import actionFlows, { actionFlowsPersistWhitelist } from './actionFlows/actionFlowsSlice';
import { sqlApi } from './api/sqlApi';

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
	actionFlows: persistReducer(actionFlowsPersistConfig, actionFlows),
	[sqlApi.reducerPath]: sqlApi.reducer,
});

export type RootState = ReturnType<typeof rootReducer>;
