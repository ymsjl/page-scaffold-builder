import type { ComponentPrototype, ComponentType } from '@/types';

import { TextPrototype } from './TextPrototype';
import { ButtonPrototype } from './ButtonPrototype';

export const basicComponentPrototypes: Partial<Record<ComponentType, ComponentPrototype>> = {
  Text: TextPrototype,
  Button: ButtonPrototype,
};
