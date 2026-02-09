import { PayloadAction } from "@reduxjs/toolkit";
import { WritableDraft } from "immer";
import type { ComponentNode } from "@/types/Component";
import type { ComponentTreeState } from "../componentTreeSlice";
import { getComponentPrototype } from "@/componentMetas";
import { makeNodeId } from "../componentTreeSlice";
import { adapter } from "../componentTreeSlice";

// Constants
const NODE_REF_TYPE = "nodeRef" as const;

// Helper functions
const getPropsPathTarget = (
  node: WritableDraft<ComponentNode>,
  propPath: string,
  createMissing: boolean,
): { parent: Record<string, any>; key: string } | null => {
  const pathParts = propPath.split(".");
  let current: Record<string, any> = node.props;

  for (let i = 0; i < pathParts.length - 1; i++) {
    const part = pathParts[i];
    if (!current[part] || typeof current[part] !== "object") {
      if (!createMissing) return null;
      current[part] = {};
    }
    current = current[part];
  }

  return { parent: current, key: pathParts[pathParts.length - 1] };
};

const addNodeRefToPropsPath = (
  node: WritableDraft<ComponentNode>,
  propPath: string,
  refNodeId: string,
) => {
  const target = getPropsPathTarget(node, propPath, true);
  if (!target) return;
  const { parent, key } = target;
  const nodeRef = { type: NODE_REF_TYPE, nodeId: refNodeId };

  if (Array.isArray(parent[key])) {
    const exists = parent[key].some(
      (ref: any) => ref?.type === NODE_REF_TYPE && ref?.nodeId === refNodeId,
    );
    if (!exists) {
      parent[key].push(nodeRef);
    }
  } else if (!parent[key]) {
    parent[key] = [nodeRef];
  } else {
    parent[key] = nodeRef;
  }
};

/**
 * 节点引用相关的 Reducers
 * 负责处理组件节点间的引用关系（ReactNode 类型 props）
 */
export const createNodeRefReducers = () => {
  type State = WritableDraft<ComponentTreeState>;

  return {
    /**
     * @description 新建组件节点并添加到目标 slot 中
     * @param action.payload.targetNodeId 目标节点ID
     * @param action.payload.propPath props 路径，如 "toolbar.actions"
     * @param action.payload.type 新增节点的组件类型
     */
    addNodeToSlot: (
      state: State,
      action: PayloadAction<{
        targetNodeId: string;
        propPath: string;
        type: ComponentNode["type"];
      }>,
    ) => {
      const { targetNodeId, propPath, type } = action.payload;
      const targetNode = state.components.entities[targetNodeId];
      if (!targetNode) return;

      const prototype = getComponentPrototype(type);
      if (!prototype) return;

      const newNode: ComponentNode = {
        id: makeNodeId(),
        parentId: targetNodeId,
        type,
        name: `New ${prototype?.label}`,
        isContainer: prototype?.isContainer,
        props: prototype?.defaultProps ? { ...prototype.defaultProps } : {},
        childrenIds: [],
      };

      adapter.addOne(state.components, newNode);

      if (!targetNode.childrenIds.includes(newNode.id)) {
        targetNode.childrenIds.push(newNode.id);
      }

      addNodeRefToPropsPath(targetNode, propPath, newNode.id);
    },

    /**
     * @description 将组件节点引用添加到目标节点的 ReactNode 类型 props
     * @param action.payload.targetNodeId 目标节点ID（接收引用的节点）
     * @param action.payload.propPath props 路径，如 "toolbar.actions"
     * @param action.payload.refNodeId 被引用的组件节点ID
     */
    addNodeRefToProps: (
      state: State,
      action: PayloadAction<{
        targetNodeId: string;
        propPath: string;
        refNodeId: string;
      }>,
    ) => {
      const { targetNodeId, propPath, refNodeId } = action.payload;
      const node = state.components.entities[targetNodeId];
      if (!node) return;

      addNodeRefToPropsPath(node, propPath, refNodeId);
    },

    /**
     * @description 从目标节点的 props 中移除组件引用
     * @param action.payload.targetNodeId 目标节点ID
     * @param action.payload.propPath props 路径
     * @param action.payload.refNodeId 要移除的引用节点ID
     */
    removeNodeRefFromProps: (
      state: State,
      action: PayloadAction<{
        targetNodeId: string;
        propPath: string;
        refNodeId: string;
      }>,
    ) => {
      const { targetNodeId, propPath, refNodeId } = action.payload;
      const node = state.components.entities[targetNodeId];
      if (!node) return;

      const target = getPropsPathTarget(node, propPath, false);
      if (!target) return;
      const { parent, key } = target;

      if (Array.isArray(parent[key])) {
        parent[key] = parent[key].filter(
          (ref: any) =>
            !(ref?.type === NODE_REF_TYPE && ref?.nodeId === refNodeId),
        );
      } else if (
        parent[key]?.type === NODE_REF_TYPE &&
        parent[key]?.nodeId === refNodeId
      ) {
        parent[key] = null;
      }
    },

    /**
     * @description 调整 props 中节点引用的顺序
     * @param action.payload.targetNodeId 目标节点ID
     * @param action.payload.propPath props 路径
     * @param action.payload.from 源索引
     * @param action.payload.to 目标索引
     */
    reorderNodeRefsInProps: (
      state: State,
      action: PayloadAction<{
        targetNodeId: string;
        propPath: string;
        from: number;
        to: number;
      }>,
    ) => {
      const { targetNodeId, propPath, from, to } = action.payload;
      const node = state.components.entities[targetNodeId];
      if (!node) return;

      const target = getPropsPathTarget(node, propPath, false);
      if (!target) return;
      const { parent, key } = target;

      if (!Array.isArray(parent[key])) return;
      if (from < 0 || from >= parent[key].length) return;
      if (to < 0 || to >= parent[key].length) return;

      const newArray = [...parent[key]];
      const [movedItem] = newArray.splice(from, 1);
      newArray.splice(to, 0, movedItem);
      parent[key] = newArray;
    },
  };
};
