import type { EntityModel } from '@/validation';
import { createEntityAdapter } from '@reduxjs/toolkit';

export const entityModelAdapter = createEntityAdapter<EntityModel>();
