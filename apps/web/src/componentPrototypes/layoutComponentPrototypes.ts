import type { ComponentPrototype, ComponentType } from '@/types';

import { PagePrototype } from './PagePrototype';
import { ModalPrototype } from './ModalPrototype';

export const layoutComponentPrototypes: Partial<Record<ComponentType, ComponentPrototype>> = {
  Page: PagePrototype,
  Modal: ModalPrototype,
};
