import { createSelector } from 'reselect';
import type { RootState } from '../rootReducer';
import type { ProjectState } from './projectSlice';
import { type MaybeWritable } from '../storeTypes';

export const selectProjectState = (state: RootState) => state.project;

export const getCurrentProject = (state: MaybeWritable<ProjectState>) => state.currentProject;
export const selectCurrentProject = createSelector(selectProjectState, getCurrentProject);
