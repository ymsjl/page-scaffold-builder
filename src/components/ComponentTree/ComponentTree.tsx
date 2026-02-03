import React, { useMemo } from "react";
import { Tree } from "antd";
import type { TreeProps } from "antd";
import type { ComponentNode } from "@/types";
import TreeNodeItem from "./TreeNodeItem";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { componentTreeActions } from "@/store/componentTree/componentTreeSlice";
import { componentNodesSelectors, selectComponentTreeComponents } from "@/store/componentTree/componentTreeSelectors";

type TreeDataNode = NonNullable<TreeProps["treeData"]>[number];

const ComponentTree: React.FC = () => {
  const dispatch = useAppDispatch();
  const selectedNodeId = useAppSelector(
    (s) => (s.componentTree as any).selectedNodeId,
  );
  const nodesById = useAppSelector(componentNodesSelectors.selectEntities);
  const rootIds = useAppSelector((s) => s.componentTree.rootIds);
  const expandedKeys = useAppSelector(
    (s) => s.componentTree.expandedKeys ?? [],
  );
  const [showAddDropdownNodeId, setShowAddDropdownNodeId] = React.useState<
    string | null
  >(null);
  const hasInitializedExpandedKeys = React.useRef(false);

  const allNodeKeys = useMemo(() => Object.keys(nodesById || {}), [nodesById]);

  React.useEffect(() => {
    if (hasInitializedExpandedKeys.current) return;
    if (expandedKeys.length > 0) {
      hasInitializedExpandedKeys.current = true;
      return;
    }
    if (allNodeKeys.length > 0) {
      dispatch(componentTreeActions.setExpandedKeys(allNodeKeys));
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
          node.childrenIds?.map((childId) =>
            buildNode(nodesById?.[childId] as ComponentNode),
          ) || [],
      };
    };
    return (rootIds || []).map((id) =>
      buildNode(nodesById[id] as ComponentNode),
    );
  }, [nodesById, rootIds, showAddDropdownNodeId]);

  return (
    <Tree
      blockNode
      expandedKeys={expandedKeys}
      onExpand={(keys) =>
        dispatch(componentTreeActions.setExpandedKeys(keys.map(String)))
      }
      selectedKeys={selectedNodeId ? [selectedNodeId] : []}
      autoExpandParent
      treeData={treeNodes}
      onSelect={(keys) => {
        const key = keys?.[0];
        if (key) dispatch(componentTreeActions.selectNode(String(key)));
      }}
    />
  );
};

export default ComponentTree;
