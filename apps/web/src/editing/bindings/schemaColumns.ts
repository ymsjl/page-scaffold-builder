import type { ProCommonColumn } from '@/types';
import { startEditingColumn } from '@/store/columnEditorSlice/columnEditorSlice';
import { selectNode } from '@/store/componentTreeSlice/componentTreeSlice';
import type { AppDispatch } from '@/store/storeTypes';
import { setActiveSource } from '../store/editingSlice';
import {
  createEditableProjection,
  createSchemaItemSource,
  type EditingInteractionSource,
  type SchemaItemSource,
} from '../types';

export type SchemaColumnSurface = 'header' | 'search-field';

export type SchemaColumnBindingArgs = {
  ownerNodeId: string;
  column: ProCommonColumn;
  columnIndex?: number;
  surface?: SchemaColumnSurface;
};

export const createSchemaColumnSource = ({
  ownerNodeId,
  column,
  columnIndex,
  surface = 'header',
}: SchemaColumnBindingArgs): SchemaItemSource => {
  return createSchemaItemSource({
    ownerNodeId,
    collectionKey: 'columns',
    editorKind: 'column',
    itemKey: column.key,
    surfaceKey: surface,
    itemIndex: columnIndex,
  });
};

export const createSchemaColumnProjection = ({
  ownerNodeId,
  column,
  columnIndex,
}: SchemaColumnBindingArgs) => {
  const source = createSchemaColumnSource({
    ownerNodeId,
    column,
    columnIndex,
  });

  return createEditableProjection({
    source,
    label: typeof column.title === 'string' ? column.title : undefined,
    capabilities: ['selectable', 'removable', 'renameable', 'open-panel', 'show-context-menu'],
  });
};

type FocusSchemaColumnArgs = SchemaColumnBindingArgs & {
  interactionSource: EditingInteractionSource;
};

export const focusSchemaColumn = ({
  ownerNodeId,
  column,
  columnIndex,
  interactionSource,
}: FocusSchemaColumnArgs) => {
  return (dispatch: AppDispatch) => {
    dispatch(selectNode(ownerNodeId));
    dispatch(
      setActiveSource({
        source: createSchemaColumnSource({
          ownerNodeId,
          column,
          columnIndex,
        }),
        interactionSource,
      }),
    );
  };
};

export const openSchemaColumnEditor = ({
  ownerNodeId,
  column,
  columnIndex,
  interactionSource,
}: FocusSchemaColumnArgs) => {
  return (dispatch: AppDispatch) => {
    dispatch(
      focusSchemaColumn({
        ownerNodeId,
        column,
        columnIndex,
        interactionSource,
      }),
    );
    dispatch(startEditingColumn(column));
  };
};
