import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { EntityType } from '@/types';
import type { NormalizedComponentTree, ComponentInstance } from "@/types/Component";
import { immer } from 'zustand/middleware/immer';
import { PersistOptions, devtools } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';
import { BuilderState } from './BuilderState';
import { createSelectors } from './createSelectors';

import { PersistedState } from './sliceTypes';
import { sanitizeNode } from './sliceHelpers';
import { createComponentTreeSlice } from './slices/createComponentTreeSlice';
import { createEntityTypeSlice } from './slices/createEntityTypeSlice';
import { createUISlice } from './slices/createUISlice';
import { createSelectedNodeSlice } from './slices/createSelectedNodeSlice';

const persistOptions: PersistOptions<BuilderState, PersistedState> = {
  name: 'PageScaffoldBuilder-storage',
  version: 1,
  storage: createJSONStorage(() => localStorage),
  partialize: (state) => ({
    componentTree: {
      nodesById: Object.fromEntries(
        Object.entries(state.componentTree.data.nodesById || {}).map(([id, node]) => [id, sanitizeNode(node)])
      ),
      rootIds: state.componentTree.data.rootIds,
      selectedNodeId: state.componentTree.data.selectedNodeId, // 如果想恢复选中
    },
    showAddDropdownNodeId: state.showAddDropdownNodeId,
    entityType: state.entityType,
    editingEntityType: state.editingEntityType,
    schemaEditorVisible: state.schemaEditorVisible,
  }),
  // 当从 storage 恢复时，合并数据到运行时的 componentTree，避免覆盖掉方法
  onRehydrateStorage: () => (persistedState: any) => {
    if (!persistedState?.componentTree) return;
    const ct: any = persistedState.componentTree;
    // 延迟到 store 可用时合并（onRehydrateStorage 在创建 store 后触发）
    setTimeout(() => {
      try {
        // useBuilderStoreBase 在文件后面创建，此处运行时已存在
        (useBuilderStoreBase as unknown as any).setState((state: any) => {
          const compTree = (state as any).componentTree || {};
          compTree.data = compTree.data || {};
          compTree.data.nodesById = { ...(compTree.data.nodesById || {}), ...(ct.nodesById || {}) };
          compTree.data.rootIds = ct.rootIds ?? compTree.data.rootIds;
          compTree.data.selectedNodeId = ct.selectedNodeId ?? compTree.data.selectedNodeId;
          (state as any).componentTree = compTree;
        }, false);
      } catch (e) {
        // 安全回退：如果无法合并，什么也不做以避免覆盖方法
        console.warn('Failed to merge persisted componentTree', e);
      }
    }, 0);
  },
};



import type { Mutators } from './sliceTypes';

const useBuilderStoreBase = create<BuilderState, Mutators>(
  devtools(
    persist(
      immer((...a) => ({
        ...createComponentTreeSlice(...a),
        ...createEntityTypeSlice(...a),
        ...createUISlice(...a),
        ...createSelectedNodeSlice(...a),
      })),

      persistOptions
    )
  )
);


export const useBuilderStore = createSelectors(useBuilderStoreBase);

export const selectedNodeSelector = (state: BuilderState): ComponentInstance | null =>
  state.componentTree.data.selectedNodeId ? state.componentTree.data.nodesById[state.componentTree.data.selectedNodeId] : null;

export const useEntityTypes = (): EntityType[] => useBuilderStore(useShallow(state => {
  return state.entityType.allIds.map(id => state.entityType.byId[id]);
}));
