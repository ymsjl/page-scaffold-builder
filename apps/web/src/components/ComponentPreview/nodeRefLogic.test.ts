import { describe, it, expect } from 'vitest';
import type { ComponentNode } from '@/types';
import { resolveNodeFromPrototype } from './nodeRefLogic';

describe('resolveNodeFromPrototype (preview normalization)', () => {
  it('replaces children with NodeRefs derived from childrenIds', () => {
    const node = {
      id: 'node1',
      type: 'Page',
      name: 'Page',
      props: { children: 'ignore' },
      childrenIds: ['node2'],
      isContainer: true,
    } as ComponentNode;

    const prototype = { component: 'div', defaultProps: {} } as any;
    const resolved = resolveNodeFromPrototype(node, prototype);

    expect(resolved.mergedProps.children).toEqual([{ type: 'nodeRef', nodeId: 'node2' }]);
  });

  it('maps columns into renderable props', () => {
    const node = {
      id: 'node1',
      type: 'Table',
      name: 'Table',
      props: {
        columns: [{ key: 'c1', dataIndex: 'name', title: 'Name' }],
      },
      childrenIds: [],
      isContainer: false,
    } as ComponentNode;

    const prototype = { component: 'div', defaultProps: {} } as any;
    const resolved = resolveNodeFromPrototype(node, prototype);

    const column = (resolved.mergedProps.columns as any[])[0];
    expect(column.key).toBe('c1');
    expect(column.title).toBe('Name');
    expect(column.formItemProps).toEqual({});
    expect(column.fieldProps).toEqual({});
  });
});
