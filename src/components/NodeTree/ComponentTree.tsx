import React, { useMemo } from 'react';
import { Tree } from 'antd';
import type { TreeProps } from 'antd';
import type { NormalizedComponentNode } from '@/types';
import TreeNodeItem from './TreeNodeItem';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { componentTreeActions } from '@/store/slices/componentTreeSlice';
import { availableComponents } from '@/componentMetas';

type TreeDataNode = NonNullable<TreeProps['treeData']>[number];

const ComponentTree: React.FC = () => {
  const dispatch = useAppDispatch();
  const selectedNodeId = useAppSelector((s) => (s.componentTree as any).selectedNodeId);
  const nodesById = useAppSelector((s) => (s.componentTree as any).entities);
  const rootIds = useAppSelector((s) => (s.componentTree as any).rootIds);

  const treeNodes = useMemo<TreeDataNode[]>(() => {
    const buildNode = (node: NormalizedComponentNode): TreeDataNode => {
      return {
        key: node.id,
        title: <TreeNodeItem node={node as any} level={0} />,
        children: node.childrenIds?.map(childId => buildNode(nodesById?.[childId] as NormalizedComponentNode)) || [],
      };
    };
    return (rootIds || []).map(id => buildNode((nodesById as any)[id]));
  }, [nodesById, rootIds]);

  return (
    <Tree
      blockNode
      defaultExpandAll
      selectedKeys={selectedNodeId ? [selectedNodeId] : []}
      treeData={treeNodes}
      onSelect={keys => {
        const key = keys?.[0];
        if (key) dispatch(componentTreeActions.selectNode(String(key)));
      }}
    />
  );
};

export default ComponentTree;
