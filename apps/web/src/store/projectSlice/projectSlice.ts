import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { ProjectMeta } from '@/types/ProjectSnapshot';

export type ProjectState = {
  currentProject: ProjectMeta | null;
};

const initialState: ProjectState = {
  currentProject: null,
};

const slice = createSlice({
  name: 'project',
  initialState,
  reducers: {
    setCurrentProject: (state, action: PayloadAction<ProjectMeta | null>) => {
      state.currentProject = action.payload;
    },
    updateProjectMeta: (state, action: PayloadAction<Partial<ProjectMeta>>) => {
      if (!state.currentProject) return;
      state.currentProject = { ...state.currentProject, ...action.payload };
    },
  },
});

export const projectActions = slice.actions;
export const { setCurrentProject, updateProjectMeta } = projectActions;
export const projectReducer = slice.reducer;
