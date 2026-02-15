import type { VariableDefinition } from '@/types';
import { createEntityAdapter } from '@reduxjs/toolkit';

export const variableAdapter = createEntityAdapter<VariableDefinition>();
