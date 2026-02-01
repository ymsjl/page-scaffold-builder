import { createSlice, createEntityAdapter, PayloadAction } from '@reduxjs/toolkit';
import type { EntityModel, SchemaField } from '@/types';
import { makeIdCreator } from './makeIdCreator';

export const makeEntityModelId = makeIdCreator('et');

const adapter = createEntityAdapter<EntityModel>({ selectId: (e) => e.id });

const initialState = adapter.getInitialState({
  editingEntityModel: null as Partial<EntityModel> | null,
  isDrawerOpen: false,
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
      state.editingEntityModel = {};
    },
    startEdit(state, action: PayloadAction<string>) {
      state.isDrawerOpen = true;
      state.editingEntityModel = adapter.getSelectors().selectById(state, action.payload) || {};
    },
    setFieldsOfEditingEntityModel: (state, action: PayloadAction<ReadonlyArray<SchemaField>>) => {
      const ed = state.editingEntityModel;
      if (ed) ed.fields = action.payload as SchemaField[];
    },
    removeFieldsOfEditingEntityModel: (state, action: PayloadAction<string>) => {
      const ed = state.editingEntityModel;
      if (ed) ed.fields = (ed.fields || []).filter((f: SchemaField) => f.id !== action.payload);
    },
    finishEntityModelChange: (state, action: PayloadAction<Omit<EntityModel, 'id'>>) => {
      adapter.upsertOne(state, {
        ...state.editingEntityModel,
        ...action.payload,
        id: state.editingEntityModel?.id ?? makeEntityModelId(),
      });
      state.isDrawerOpen = false;
    },
    deleteEntityModel: (state, action: PayloadAction<string>) => {
      adapter.removeOne(state, action.payload);
    },
  }
});

export const entityModelActions = entityModelSlice.actions;
export const entityModelAdapter = adapter;
export default entityModelSlice.reducer;
