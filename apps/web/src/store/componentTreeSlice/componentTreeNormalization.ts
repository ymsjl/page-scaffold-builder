import { normalize, schema } from 'normalizr';
import type {
  ComponentInstance,
  ComponentNode,
  ComponentId,
  NormalizedComponentTree,
} from '@/types/Component';

const componentNodeSchema = new schema.Entity(
  'nodes',
  {},
  {
    idAttribute: 'id',
    processStrategy: (value: ComponentInstance) => {
      const { children, ...rest } = value as ComponentInstance;
      const childrenIds = Array.isArray(children) ? children.map((child) => child.id) : [];

      return {
        ...rest,
        childrenIds,
      } as ComponentNode;
    },
  },
);

componentNodeSchema.define({
  children: [componentNodeSchema],
});

export const normalizeComponentTree = (
  input: ComponentInstance | ComponentInstance[],
): NormalizedComponentTree => {
  const roots = Array.isArray(input) ? input : [input];
  const normalized = normalize(roots, [componentNodeSchema]);

  return {
    entities: {
      nodes: (normalized.entities.nodes || {}) as Record<ComponentId, ComponentNode>,
    },
    result: (normalized.result || []) as ComponentId[],
  };
};

export const createEmptyNormalizedTree = (): NormalizedComponentTree => ({
  entities: { nodes: {} },
  result: [],
});
