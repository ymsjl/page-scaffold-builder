import type {
  ProCommonColumn,
  EntityType,
  SchemaField,
  ComponentInstance,
} from "@/types";
import type { NormalizedComponentTree } from "@/types/Component";

// Pattern: domain data grouped (under `componentTree`) while action functions are exposed at top-level on the store (e.g., `addNewNode`, `removeNode`). This hybrid shape improves selector ergonomics and avoids middleware issues with nested `actions` objects.

export type ComponentTreeSlice = {
  componentTree: NormalizedComponentTree & {
    selectedNodeId: string | null;
  };
  addNewNode: (parentId: string | null, type: string) => void;
  removeNode: (id: string) => void;
  updateNode: (id: string, updates: Partial<ComponentInstance>) => void;
  selectNode: (id: string | null) => void;
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
    id?: string | null;
    name?: string;
    type?: string;
    props?: Record<string, any>;
    columns?: ProCommonColumn[];
  };
  upsertColumn: (column: ProCommonColumn) => void;
  updateProps: (props: Record<string, any>) => void;
  startEditColumn: (column: ProCommonColumn) => void;
  startAddColumn: () => void;
  moveColumn: (from: number, to: number) => void;
  deleteColumn: (key: string) => void;
  applyColumnChanges: (column: ProCommonColumn) => void;
};

export type EntityTypeSlice = {
  entityType: {
    byId: Record<string, EntityType>;
    allIds: string[];
  };
  editingEntityType: Partial<EntityType> | null;
  setFieldsOfEditingEntityType: (
    fields: SchemaField[] | readonly SchemaField[],
  ) => void;
  removeFieldsOfEditingEntityType: (id: string) => void;
  setEditingEntityType: (t: Partial<EntityType> | null) => void;
  upsertEntityType: (t: EntityType) => void;
  deleteEntityType: (id: string) => void;
};

export type BuilderState = ComponentTreeSlice &
  UISlice &
  SelectedNodeSlice &
  EntityTypeSlice;
