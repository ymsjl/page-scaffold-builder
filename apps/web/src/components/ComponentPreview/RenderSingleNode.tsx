import type { ComponentNode, ComponentPrototype } from '@/types';
import React from 'react';
import type { ResolvePropsForNode } from './propResolvers';
import { usePropResolver } from './propResolvers';

type RenderSingleNodeProps = {
  node: ComponentNode;
  componentPrototype: ComponentPrototype;
  resolvePropsForNode?: ResolvePropsForNode;
  resolvedProps?: Record<string, unknown>;
};

/**
 * 渲染单个组件节点
 */
export const RenderSingleNode: React.FC<RenderSingleNodeProps> = React.memo(
  ({ node, componentPrototype }) => {
    const resolvePropsForNode = usePropResolver();
    const resolvedProps = resolvePropsForNode({ node, componentPrototype });
    const Component = componentPrototype.component;
    if (typeof Component === 'string') {
      const { children, ...restProps } = resolvedProps;
      return React.createElement(
        Component as keyof JSX.IntrinsicElements,
        { ...restProps, key: node.id },
        children as React.ReactNode,
      );
    }
    return (
      <Component {...resolvedProps} key={node.id}>
        {resolvedProps.children as React.ReactNode}
      </Component>
    );
  },
);

RenderSingleNode.displayName = 'RenderSingleNode';
