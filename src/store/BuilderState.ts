import type { ProCommonColumn, EntityType, SchemaField, ComponentInstance } from '@/types';
import type { NormalizedComponentTree } from '@/types/Component';

export type ComponentTreeSlice = {
  componentTree: {
    data: NormalizedComponentTree & { selectedNodeId: string | null };
    actions: {
      addNewNode: (parentId: string | null, type: string) => void;
      removeNode: (id: string) => void;
      updateNode: (id: string, updates: Partial<ComponentInstance>) => void;
      selectNode: (id: string | null) => void;
    };
  };
};

export type UISlice = {
  showAddDropdownNodeId: string | null;
  showAddDropdown: (id: string | null) => void;
  entityTypeDesignerPanelOpen: boolean;
  setEntityTypeDesignerPanelOpen: (v: boolean) => void;
  schemaEditorVisible: boolean;
  closeSchemaEditor: () => void;
  editingColumn: ProCommonColumn | null;
  setEditingColumn: (f: ProCommonColumn | null) => void;
};

export type SelectedNodeSlice = {
  selectedNode: {
    upsertColumn: (column: ProCommonColumn) => void;
    updateProps: (props: Record<string, any>) => void;
    startEditColumn: (column: ProCommonColumn) => void;
    startAddColumn: () => void;
    moveColumn: (from: number, to: number) => void;
    deleteColumn: (key: string) => void;
    applyColumnChanges: (column: ProCommonColumn) => void;
  };
};

export type EntityTypeSlice = {
  entityType: {
    byId: Record<string, EntityType>;
    allIds: string[];
  };
  editingEntityType: Partial<EntityType> | null;
  setFieldsOfEditingEntityType: (fields: SchemaField[] | readonly SchemaField[]) => void;
  removeFieldsOfEditingEntityType: (id: string) => void;
  setEditingEntityType: (t: Partial<EntityType> | null) => void;
  upsertEntityType: (t: EntityType) => void;
  deleteEntityType: (id: string) => void;
};

export type BuilderState = ComponentTreeSlice & UISlice & SelectedNodeSlice & EntityTypeSlice;
