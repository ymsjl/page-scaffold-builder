import { createEntityAdapter } from '@reduxjs/toolkit';
import type { ComponentNode } from '@/types';

export const componentTreeAdapter = createEntityAdapter<ComponentNode>();
