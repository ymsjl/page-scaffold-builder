import { combineReducers } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import componentTree, {
	componentTreePersistWhitelist,
} from './componentTree/componentTreeSlice';

const componentTreePersistConfig = {
	key: 'componentTree',
	storage,
	whitelist: [...componentTreePersistWhitelist],
};

export const rootReducer = combineReducers({
	componentTree: persistReducer(componentTreePersistConfig, componentTree),
});

export type RootState = ReturnType<typeof rootReducer>;
