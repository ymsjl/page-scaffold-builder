import { createSlice, createEntityAdapter, PayloadAction } from '@reduxjs/toolkit';
import type { EntityType, SchemaField } from '@/types';
import { uiActions } from './uiSlice';
import { makeIdCreator } from './makeIdCreator';

export const makeEntityTypeId = makeIdCreator('et');

const adapter = createEntityAdapter<EntityType>({ selectId: (e) => e.id });

const initialState = adapter.getInitialState({
  editingEntityType: null as Partial<EntityType> | null,
  isDrawerOpen: false,
});

export type EntityTypeState = typeof initialState;

const slice = createSlice({
  name: 'entityTypes',
  initialState,
  reducers: {
    closeDrawer(state) {
      state.isDrawerOpen = false;
    },
    startCreateNew(state) {
      state.isDrawerOpen = true;
      state.editingEntityType = {};
    },
    startEdit(state, action: PayloadAction<string>) {
      state.isDrawerOpen = true;
      state.editingEntityType = adapter.getSelectors().selectById(state, action.payload) || {};
    },
    setFieldsOfEditingEntityType: (state, action: PayloadAction<ReadonlyArray<SchemaField>>) => {
      const ed = state.editingEntityType;
      if (ed) ed.fields = action.payload as SchemaField[];
    },
    removeFieldsOfEditingEntityType: (state, action: PayloadAction<string>) => {
      const ed = state.editingEntityType;
      if (ed) ed.fields = (ed.fields || []).filter((f: SchemaField) => f.id !== action.payload);
    },
    finishEntityTypeChange: (state, action: PayloadAction<Omit<EntityType, 'id'>>) => {
      adapter.upsertOne(state, {
        ...state.editingEntityType,
        ...action.payload,
        id: state.editingEntityType?.id ?? makeEntityTypeId(),
      });
      state.isDrawerOpen = false;
    },
    deleteEntityType: (state, action: PayloadAction<string>) => {
      adapter.removeOne(state, action.payload);
    },
  },
  extraReducers: builder => {
    builder.addCase(uiActions.setEntityTypeDesignerPanelOpen, (state, action) => {
      if (!action.payload) {
        state.editingEntityType = null;
      }
    });
  }
});

export const entityTypesActions = slice.actions;
export const entityTypesAdapter = adapter;
export default slice.reducer;
