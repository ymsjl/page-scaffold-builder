import { combineReducers } from '@reduxjs/toolkit';
import componentTree from './slices/componentTree/componentTreeSlice';
import entityModel from './slices/entityModel/entityModelSlice';

export const rootReducer = combineReducers({ componentTree, entityModel });

export type RootState = ReturnType<typeof rootReducer>;
