import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ComponentInstance, ComponentType, EntityType } from '../types';
import { ProCommonColumn } from '../shims/tableColumsTypes';
import { immer } from 'zustand/middleware/immer';
import { PersistOptions, devtools } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';
import { BuilderState } from './BuilderState';
import { createSelectors } from './createSelectors';

// helpers for schema slice
const makeId = (prefix = 'field') => `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const persistOptions = {
  name: 'PageScaffoldBuilder-storage',
  storage: createJSONStorage(() => localStorage),
  partialize: (state: BuilderState) => ({}),
} as unknown as PersistOptions<BuilderState>;

const useBuilderStoreBase = create<BuilderState>()(
  devtools(
    immer((set, get) => ({
      componentTree: {
        nodesById: {},
        rootIds: [],
        addNewNode: (parentId: string | null, type: string) => {
          set(draft => {
            const newNodeId = `node_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
            Object.assign(draft.componentTree.nodesById, {
              [newNodeId]: {
                id: newNodeId,
                parentId: parentId,
                name: `New ${type}`,
                type: type as ComponentType,
                isContainer: type === 'Container',
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
          set(draft => {
            const nodeToRemove = draft.componentTree.nodesById[id];
            if (!nodeToRemove) return;
            // Remove from parent's childrenIds or rootIds
            const parentId = nodeToRemove.parentId;
            if (parentId) {
              const parentNode = draft.componentTree.nodesById[parentId];
              if (parentNode) {
                parentNode.childrenIds = parentNode.childrenIds?.filter(childId => childId !== id);
              }
            } else {
              draft.componentTree.rootIds = draft.componentTree.rootIds.filter(rootId => rootId !== id);
            }
            // Remove node and its descendants
            const removeRecursively = (nodeId: string) => {
              const node = draft.componentTree.nodesById[nodeId];
              if (node && node.childrenIds) {
                node.childrenIds.forEach(childId => removeRecursively(childId));
              }
              delete draft.componentTree.nodesById[nodeId];
            };
            removeRecursively(id);
          });
        },
        updateNode: (id: string, updates: Partial<ComponentInstance>) => {
          set(draft => {
            const node = draft.componentTree.nodesById[id];
            if (node) {
              Object.assign(node, updates);
            }
          });
        },
        selectNode: (id: string | null) => {
          set(draft => {
            draft.componentTree.selectedNodeId = id;
          });
        },
        selectedNodeId: null,
      },

      showAddDropdownNodeId: null,

      entityTypeDesignerPanelOpen: false,

      setEntityTypeDesignerPanelOpen: v => {
        set({ entityTypeDesignerPanelOpen: v });
      },

      entityType: {
        byId: {},
        allIds: [],
      },

      editingEntityType: null,

      setEditingEntityType: entityType => {
        set({ editingEntityType: entityType });
      },

      setFieldsOfEditingEntityType: t => {
        set(draft => {
          draft.editingEntityType = draft.editingEntityType
            ? { ...draft.editingEntityType, fields: t }
            : null;
        });
      },
      removeFieldsOfEditingEntityType: id => {
        set(draft => {
          if (!draft.editingEntityType) return;
          const index = draft.editingEntityType.fields.findIndex(f => f.id === id);
          if (index === -1) return;
          draft.editingEntityType.fields.splice(index, 1);
        });
      },

      upsertEntityType: entityType => {
        set(draft => {
          const editingEntityType = get().editingEntityType;
          if (editingEntityType) {
            Object.assign(draft.entityType.byId[editingEntityType.id], editingEntityType, entityType);
          } else {
            const newId = makeId('entityType');
            draft.entityType.byId[newId] = { ...entityType, id: newId };
          }
        });
      },

      deleteEntityType: id => {
        set(draft => {
          delete draft.entityType.byId[id];
          const index = draft.entityType.allIds.indexOf(id);
          if (index === -1) return;
          draft.entityType.allIds.splice(index, 1);
        });
      },

      schemaEditorVisible: false,

      closeSchemaEditor: () => set({ schemaEditorVisible: false }),

      editingColumn: null,
      setEditingColumn(column) { },

      showAddDropdown: id => set({ showAddDropdownNodeId: id }),

      selectedNode: {

        updateProps: values => {
          const selectedId = (get() as BuilderState).componentTree.selectedNodeId;
          if (!selectedId) return;
          set(draft => {
            const node = draft.componentTree.nodesById[selectedId];
            if (!node) return;
            node.props = { ...node.props, ...values };
          });
        },

        startAddColumn: () => {
          set({
            schemaEditorVisible: true,
            editingColumn: null,
          })
        },

        startEditColumn: (column) => {
          set({
            schemaEditorVisible: true,
            editingColumn: column,
          })
        },

        upsertColumn: column => {
          const selectedId = (get() as BuilderState).componentTree.selectedNodeId;
          if (!selectedId) return;
          set(draft => {
            const node = draft.componentTree.nodesById[selectedId];
            if (!node) return;
            const existingColumns: ProCommonColumn[] = (node.props && node.props.columns) || [];
            if (!existingColumns || !Array.isArray(existingColumns)) {
              node.props = { ...(node.props || {}), columns: [column] };
              return;
            }
            if (!column.key) {
              column.key = makeId('column');
              node.props.columns = [...existingColumns, column];
              return;
            }
            const idx = node.props.columns.findIndex((c: any) => c.key === column.key);
            if (idx === -1) {
              throw new Error(`Column with key ${column.key} not found for upsert`);
            }
            node.props.columns[idx] = { ...node.props.columns[idx], ...column };
          });
        },

        moveColumn(from, to) { },

        deleteColumn(key) { },

        applyColumnChanges(column) {
          const selectedId = (get() as BuilderState).componentTree.selectedNodeId;
          if (!selectedId) return;
          set(draft => {
            const node = draft.componentTree.nodesById[selectedId];
            if (!node) return;
            const existingColumns: ProCommonColumn[] = (node.props && node.props.columns) || [];
            if (!existingColumns || !Array.isArray(existingColumns)) return;
            const idx = node.props.columns.findIndex((c: any) => c.key === column.key);
            if (idx === -1) {
              throw new Error(`Column with key ${column.key} not found for apply changes`);
            }
            Object.assign(node.props.columns[idx], column);
          });
        },
      },
    }))
  )
);

export const useBuilderStore = createSelectors(useBuilderStoreBase);

export const selectedNodeSelector = (state: BuilderState): ComponentInstance | null =>
  state.componentTree.selectedNodeId ? state.componentTree.nodesById[state.componentTree.selectedNodeId] : null;

export const useEntityTypes = (): EntityType[] => useBuilderStore(useShallow(state => {
  return state.entityType.allIds.map(id => state.entityType.byId[id]);
}));
