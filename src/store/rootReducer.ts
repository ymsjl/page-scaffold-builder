import { combineReducers } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import componentTree, { componentTreePersistWhitelist, } from './componentTree/componentTreeSlice';
import actionFlows, { actionFlowsPersistWhitelist } from './actionFlows/actionFlowsSlice';

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
});

export type RootState = ReturnType<typeof rootReducer>;
