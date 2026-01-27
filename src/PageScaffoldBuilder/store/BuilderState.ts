import { ProCommonColumn } from '../shims/tableColumsTypes';
import type { ComponentInstance, EntityType, NormalizedComponentNode, SchemaField } from '../types';

export type BuilderState = {
  componentTree: {
    nodesById: Record<string, NormalizedComponentNode>;
    rootIds: string[];
    addNewNode: (parentId: string | null, type: string) => void;
    removeNode: (id: string) => void;
    updateNode: (id: string, updates: Partial<ComponentInstance>) => void;
    selectNode: (id: string | null) => void;
    selectedNodeId: string | null;
  };

  showAddDropdownNodeId: string | null;

  showAddDropdown: (id: string | null) => void;

  deleteEntityType: (id: string) => void;

  selectedNode: {
    upsertColumn: (column: ProCommonColumn) => void;
    updateProps: (props: Record<string, any>) => void;
    startEditColumn: (column: ProCommonColumn) => void;
    startAddColumn: () => void;
    moveColumn: (from: number, to: number) => void;
    deleteColumn: (key: string) => void;
    applyColumnChanges: (column: ProCommonColumn) => void;
  };

  entityType: {
    byId: Record<string, EntityType>;
    allIds: string[];
  };

  entityTypeDesignerPanelOpen: boolean;

  editingEntityType: EntityType | null;
  setFieldsOfEditingEntityType: (fields: SchemaField[]) => void;
  removeFieldsOfEditingEntityType: (id: string) => void;
  setEditingEntityType: (t: EntityType | null) => void;

  upsertEntityType: (t: EntityType) => void;

  setEntityTypeDesignerPanelOpen: (v: boolean) => void;

  // Schema slice
  editingColumn: ProCommonColumn | null;
  setEditingColumn: (f: ProCommonColumn | null) => void;
  schemaEditorVisible: boolean;

  closeSchemaEditor: () => void;
};
