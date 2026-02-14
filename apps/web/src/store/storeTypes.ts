import type { AnyAction, ThunkDispatch } from '@reduxjs/toolkit';
import type { RootState } from './rootReducer';

export type AppDispatch = ThunkDispatch<RootState, unknown, AnyAction>;
export type { RootState };
