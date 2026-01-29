import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { ProCommonColumn } from '@/types';

type SchemaEditorState = {
  editingColumn: ProCommonColumn | null;
  schemaEditorVisible: boolean;
};

const schemaEditorSlice = createSlice({
  name: 'schemaEditor',
  initialState: {
    editingColumn: null,
    schemaEditorVisible: false,
  } as SchemaEditorState,
  reducers: {
    startAddColumn(state) {
      state.editingColumn = null;
      state.schemaEditorVisible = true;
    },
    startEditColumn(state, action: PayloadAction<ProCommonColumn>) {
      state.editingColumn = action.payload;
      state.schemaEditorVisible = true;
    },
    finishSchemaChanges(state, action: PayloadAction<Partial<ProCommonColumn> | null>) {
      state.editingColumn = null;
      state.schemaEditorVisible = false;
    },
    closeSchemaEditor(state) {
      state.schemaEditorVisible = false;
      state.editingColumn = null;
    },
  },
});

export const schemaEditorActions = schemaEditorSlice.actions;
export default schemaEditorSlice.reducer;
