import type { ComponentPrototype, ComponentType } from '@/types';

import { FormPrototype } from './FormPrototype';

export const formComponentPrototypes: Partial<Record<ComponentType, ComponentPrototype>> = {
  Form: FormPrototype,
};
