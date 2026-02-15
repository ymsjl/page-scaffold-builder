import React, { useMemo } from 'react';
import { Tree } from 'antd';
import type { TreeProps } from 'antd';
import type { ComponentNode } from '@/types';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { selectNode, setExpandedKeys } from '@/store/componentTreeSlice/componentTreeSlice';
import {
  componentNodesSelectors,
  selectRootIds,
  selectSelectedNodeId,
} from '@/store/componentTreeSlice/componentTreeSelectors';
import TreeNodeItem from './TreeNodeItem';

type TreeDataNode = NonNullable<TreeProps['treeData']>[number];

const ComponentTree: React.FC = () => {
  const dispatch = useAppDispatch();
  const selectedNodeId = useAppSelector(selectSelectedNodeId);
  const nodesById = useAppSelector(componentNodesSelectors.selectEntities);
  const rootIds = useAppSelector(selectRootIds);
  const expandedKeys = useAppSelector((s) => s.componentTree.expandedKeys ?? []);
  const [showAddDropdownNodeId, setShowAddDropdownNodeId] = React.useState<string | null>(null);
  const hasInitializedExpandedKeys = React.useRef(false);

  const allNodeKeys = useMemo(() => Object.keys(nodesById || {}), [nodesById]);

  React.useEffect(() => {
    if (hasInitializedExpandedKeys.current) return;
    if (expandedKeys.length > 0) {
      hasInitializedExpandedKeys.current = true;
      return;
    }
    if (allNodeKeys.length > 0) {
      dispatch(setExpandedKeys(allNodeKeys));
      hasInitializedExpandedKeys.current = true;
    }
  }, [allNodeKeys, expandedKeys.length, dispatch]);

  const treeNodes = useMemo<TreeDataNode[]>(() => {
    const buildNode = (node: ComponentNode): TreeDataNode => {
      return {
        key: node.id,
        title: (
          <TreeNodeItem
            node={node}
            level={0}
            showAddDropdownNodeId={showAddDropdownNodeId}
            setShowAddDropdownNodeId={setShowAddDropdownNodeId}
          />
        ),
        children:
          node.childrenIds?.map((childId) => buildNode(nodesById?.[childId] as ComponentNode)) ||
          [],
      };
    };
    return (rootIds || []).map((id) => buildNode(nodesById[id] as ComponentNode));
  }, [nodesById, rootIds, showAddDropdownNodeId]);

  return (
    <Tree
      blockNode
      expandedKeys={expandedKeys}
      onExpand={(keys) => dispatch(setExpandedKeys(keys.map(String)))}
      selectedKeys={selectedNodeId ? [selectedNodeId] : []}
      autoExpandParent
      treeData={treeNodes}
      onSelect={(keys) => {
        const key = keys?.[0];
        if (key) dispatch(selectNode(String(key)));
      }}
    />
  );
};

export default ComponentTree;
