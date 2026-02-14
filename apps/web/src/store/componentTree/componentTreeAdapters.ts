import { createEntityAdapter } from '@reduxjs/toolkit';
import type { ComponentNode, VariableDefinition } from '@/types';
import type { EntityModel } from '@/validation';

export const entityModelAdapter = createEntityAdapter<EntityModel>();
export const variableAdapter = createEntityAdapter<VariableDefinition>();
export const componentTreeAdapter = createEntityAdapter<ComponentNode>();
