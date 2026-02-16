import type { ComponentPrototype, ComponentType } from '@/types';

import { DescriptionPrototype } from './DescriptionPrototype';
import { TablePrototype } from './TablePrototype';

export const dataComponentPrototypes: Partial<Record<ComponentType, ComponentPrototype>> = {
  Description: DescriptionPrototype,
  Table: TablePrototype,
};
