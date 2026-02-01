import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type UIState = {
  entityTypeDesignerPanelOpen: boolean;
};

const initialState: UIState = {
  entityTypeDesignerPanelOpen: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setEntityTypeDesignerPanelOpen(state, action: PayloadAction<boolean>) {
      state.entityTypeDesignerPanelOpen = action.payload;
    }
  },
});

export const uiActions = uiSlice.actions;
export default uiSlice.reducer;
