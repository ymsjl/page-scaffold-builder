import type { WritableDraft } from 'immer';
import type { AnyAction, ThunkDispatch } from '@reduxjs/toolkit';
import type { RootState } from './rootReducer';

export type AppDispatch = ThunkDispatch<RootState, unknown, AnyAction>;
export type { RootState };

/**
 * 通用类型：支持普通状态和 Immer Draft 状态
 */
export type MaybeWritable<T> = T | WritableDraft<T>;
