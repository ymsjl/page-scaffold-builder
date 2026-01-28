import type { StateCreator } from "zustand";
import type { Mutators } from "../sliceTypes";
import type { ComponentTreeSlice, BuilderState } from "../BuilderState";
import type { ComponentType, ComponentInstance } from "@/types/Component";

export const createComponentTreeSlice: StateCreator<
  BuilderState,
  Mutators,
  [],
  ComponentTreeSlice
> = (set, get) => ({
  componentTree: {
    nodesById: {},
    rootIds: [],
    selectedNodeId: null,
  },
  addNewNode: (parentId: string | null, type: string) => {
    set((draft: any) => {
      const newNodeId = `node_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
      Object.assign(draft.componentTree.nodesById, {
        [newNodeId]: {
          id: newNodeId,
          parentId: parentId,
          name: `New ${type}`,
          type: type as ComponentType,
          isContainer: type === "Container",
          props: {},
          childrenIds: [],
        },
      });
      if (parentId) {
        const parentNode = draft.componentTree.nodesById[parentId];
        if (parentNode) {
          parentNode.childrenIds = parentNode.childrenIds || [];
          parentNode.childrenIds.push(newNodeId);
        }
      } else {
        draft.componentTree.rootIds.push(newNodeId);
      }
    });
  },

  removeNode: (id: string) => {
    set((draft: any) => {
      const nodeToRemove = draft.componentTree.nodesById[id];
      if (!nodeToRemove) return;
      const parentId = nodeToRemove.parentId;
      if (parentId) {
        const parentNode = draft.componentTree.nodesById[parentId];
        if (parentNode) {
          parentNode.childrenIds = parentNode.childrenIds?.filter(
            (childId: string) => childId !== id,
          );
        }
      } else {
        draft.componentTree.rootIds =
          draft.componentTree.rootIds.filter(
            (rootId: string) => rootId !== id,
          );
      }
      const removeRecursively = (nodeId: string) => {
        const node = draft.componentTree.nodesById[nodeId];
        if (node && node.childrenIds) {
          node.childrenIds.forEach((childId: string) =>
            removeRecursively(childId),
          );
        }
        delete draft.componentTree.nodesById[nodeId];
      };
      removeRecursively(id);
    });
  },

  updateNode: (id: string, updates: Partial<ComponentInstance>) => {
    set((draft: any) => {
      const node = draft.componentTree.nodesById[id];
      if (node) {
        Object.assign(node, updates);
      }
    });
  },

  selectNode: (id: string | null) => {
    set((draft: any) => {
      draft.componentTree.selectedNodeId = id;
    });
  },
});
