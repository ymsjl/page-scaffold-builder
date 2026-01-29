import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type UIState = {
  showAddDropdownNodeId: string | null;
  entityTypeDesignerPanelOpen: boolean;
};

const initialState: UIState = {
  showAddDropdownNodeId: null,
  entityTypeDesignerPanelOpen: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setShowAddDropdownNodeId(state, action: PayloadAction<string | null>) {
      state.showAddDropdownNodeId = action.payload;
    },
    setEntityTypeDesignerPanelOpen(state, action: PayloadAction<boolean>) {
      state.entityTypeDesignerPanelOpen = action.payload;
    }
  },
});

export const uiActions = uiSlice.actions;
export default uiSlice.reducer;
