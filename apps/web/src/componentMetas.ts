import type { ComponentPrototype, ComponentType } from '@/types';
import type { PreviewMode } from '@/components/ComponentPreview/previewMode';
import { COMPONENT_TYPES } from './types/Component';

import { registerComponent, getRegisteredComponent, lazyLoad } from './componentRegistry';

import {
  PagePrototype,
  ModalPrototype,
  DescriptionPrototype,
  TablePrototype,
  FormPrototype,
  TextPrototype,
  ButtonPrototype,
} from './componentPrototypes';

export { registerComponent, lazyLoad };

export const componentPrototypeMap: Record<ComponentType, ComponentPrototype> = {
  Page: PagePrototype,
  Modal: ModalPrototype,
  Description: DescriptionPrototype,
  Table: TablePrototype,
  Form: FormPrototype,
  Text: TextPrototype,
  Button: ButtonPrototype,
} as Record<ComponentType, ComponentPrototype>;

export const getComponentPrototype = (
  type: ComponentType,
  options?: { previewMode?: PreviewMode },
): ComponentPrototype | undefined => {
  const base = componentPrototypeMap[type];
  if (!base) return undefined;

  const previewMode = options?.previewMode ?? 'edit';
  if (type === 'Table' && previewMode === 'pure') {
    return {
      ...base,
      get component() {
        return getRegisteredComponent('ProTableForPurePreview');
      },
    };
  }

  return base;
};

export const availableComponents = COMPONENT_TYPES.filter((type) => type !== 'Page').map(
  (type) => ({
    type,
    label: componentPrototypeMap[type]?.label ?? type,
    isContainer: componentPrototypeMap[type]?.isContainer ?? false,
  }),
);
