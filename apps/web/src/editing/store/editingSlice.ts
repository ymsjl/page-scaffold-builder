import { type PayloadAction, createSlice } from '@reduxjs/toolkit';
import type { EditableSource, EditingInteractionSource } from '../types/EditableSource';

export type EditingState = {
  activeSource: EditableSource | null;
  hoverSource: EditableSource | null;
  interactionSource: EditingInteractionSource | null;
};

const initialState: EditingState = {
  activeSource: null,
  hoverSource: null,
  interactionSource: null,
};

const slice = createSlice({
  name: 'editing',
  initialState,
  reducers: {
    setActiveSource: (
      state,
      {
        payload,
      }: PayloadAction<{
        source: EditableSource | null;
        interactionSource?: EditingInteractionSource;
      }>,
    ) => ({
      ...state,
      activeSource: payload.source,
      interactionSource: payload.interactionSource || null,
    }),
    clearActiveSource: (state) => ({
      ...state,
      activeSource: null,
      interactionSource: null,
    }),
    setHoverSource: (state, { payload }: PayloadAction<EditableSource | null>) => ({
      ...state,
      hoverSource: payload,
    }),
    clearHoverSource: (state) => ({
      ...state,
      hoverSource: null,
    }),
  },
});

export const editingActions = slice.actions;
export const { setActiveSource, clearActiveSource, setHoverSource, clearHoverSource } =
  editingActions;
export const editingReducer = slice.reducer;
