import React, { useMemo } from 'react';
import { Tree } from 'antd';
import type { TreeProps } from 'antd';
import type { NormalizedComponentNode } from '@/types';
import TreeNodeItem from './TreeNodeItem';
import { useBuilderStore } from '@/store/useBuilderStore';
import { availableComponents } from '@/componentMetas';

type TreeDataNode = NonNullable<TreeProps['treeData']>[number];

const ComponentTree: React.FC = () => {
  const selectedNodeId = useBuilderStore(s => s.componentTree.data.selectedNodeId);
  const selectNode = useBuilderStore(s => s.componentTree.actions.selectNode);
  const nodesById = useBuilderStore(s => s.componentTree.data.nodesById);
  const rootIds = useBuilderStore(s => s.componentTree.data.rootIds);

  const treeNodes = useMemo<TreeDataNode[]>(() => {
    const buildNode = (node: NormalizedComponentNode): TreeDataNode => {
      return {
        key: node.id,
        title: <TreeNodeItem node={node} level={0} />,
        children: node.childrenIds?.map(childId => buildNode(nodesById[childId])) || [],
      };
    };
    return rootIds.map(id => buildNode(nodesById[id]));
  }, [nodesById, rootIds]);

  return (
    <Tree
      blockNode
      defaultExpandAll
      selectedKeys={selectedNodeId ? [selectedNodeId] : []}
      treeData={treeNodes}
      onSelect={keys => {
        const key = keys?.[0];
        if (key) selectNode(String(key));
      }}
    />
  );
};

export default ComponentTree;
