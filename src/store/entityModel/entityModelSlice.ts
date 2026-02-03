import { createSlice, createEntityAdapter, PayloadAction } from '@reduxjs/toolkit';
import type { EntityModel } from '@/types';
import { makeIdCreator } from '../../utils/makeIdCreator';

export const makeEntityModelId = makeIdCreator('et');

const adapter = createEntityAdapter<EntityModel>({ selectId: (e) => e.id });

const initialState = adapter.getInitialState({
  editingEntityModel: null as Partial<EntityModel> | null,
  isDrawerOpen: false,
  editingEntityModelId: null as string | null,
});

export type EntityModelState = typeof initialState;

const entityModelSlice = createSlice({
  name: 'entityModel',
  initialState,
  reducers: {
    closeDrawer(state) {
      state.isDrawerOpen = false;
    },
    startCreateNew(state) {
      state.isDrawerOpen = true;
      state.editingEntityModelId = null;
    },
    startEdit(state, action: PayloadAction<string>) {
      state.isDrawerOpen = true;
      state.editingEntityModelId = action.payload;
    },
    applyEntityModelChange: (state, action: PayloadAction<Omit<EntityModel, 'id'>>) => {
      adapter.upsertOne(state, {
        ...action.payload,
        id: state.editingEntityModelId ?? makeEntityModelId(),
      });
      state.isDrawerOpen = false;
      state.editingEntityModelId = null;
    },
    deleteEntityModel: (state, action: PayloadAction<string>) => {
      adapter.removeOne(state, action.payload);
    },
  }
});

export const entityModelActions = entityModelSlice.actions;
export const entityModelAdapter = adapter;
export default entityModelSlice.reducer;
