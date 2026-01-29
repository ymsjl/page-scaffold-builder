import { configureStore, combineReducers } from '@reduxjs/toolkit';
import componentTreeReducer from './slices/componentTreeSlice';
import uiReducer from './slices/uiSlice';
import schemaEditorReducer from './slices/schemaEditorSlice';
import entityTypesReducer from './slices/entityTypesSlice';
import ruleBuilderReducer from './slices/ruleBuilderSlice';

import storage from 'redux-persist/lib/storage';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';

const rootReducer = combineReducers({
  componentTree: componentTreeReducer,
  ui: uiReducer,
  schemaEditor: schemaEditorReducer,
  entityTypes: entityTypesReducer,
  ruleBuilder: ruleBuilderReducer,
});

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['entityTypes', 'schemaEditor', 'ui'], // 根据需要调整要持久化的 slice
  // whitelist: ['componentTree', 'entityTypes', 'schemaEditor', 'ui'], // 根据需要调整要持久化的 slice
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // 忽略 redux-persist 的 action types，参考 RTK 文档/最佳实践
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
