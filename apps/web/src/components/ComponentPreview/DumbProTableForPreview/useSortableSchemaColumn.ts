import React from 'react';
import type { MenuProps } from 'antd';
import { useSortable } from '@dnd-kit/sortable';
import {
  createSchemaColumnProjection,
  createSchemaColumnSource,
  focusSchemaColumn,
  openSchemaColumnEditor,
  type SchemaColumnSurface,
} from '@/editing/bindings/schemaColumns';
import { useAppDispatch } from '@/store/hooks';
import {
  deleteColumnForSelectedNode,
  upsertColumnOfSelectedNode,
} from '@/store/componentTreeSlice/componentTreeSlice';
import type { ProCommonColumn, SchemaField } from '@/types';
import { buildInsertedColumn } from './shared';

type InteractionSource = 'canvas' | 'context-menu';

type UseSortableSchemaColumnOptions = {
  dragId: string;
  column: ProCommonColumn;
  columnIndex: number;
  previewNodeId?: string;
  entityFields: SchemaField[];
  onFocus: () => void;
  emptyInsertLabel: string;
  surface?: SchemaColumnSurface;
};

export const useSortableSchemaColumn = ({
  dragId,
  column,
  columnIndex,
  previewNodeId,
  entityFields,
  onFocus,
  emptyInsertLabel,
  surface = 'header',
}: UseSortableSchemaColumnOptions) => {
  const dispatch = useAppDispatch();
  const canOperate = Boolean(previewNodeId);
  const sortable = useSortable({
    id: dragId,
    disabled: !canOperate,
  });

  const columnSource = React.useMemo(() => {
    if (!previewNodeId) {
      return null;
    }

    return createSchemaColumnSource({ ownerNodeId: previewNodeId, column, columnIndex, surface });
  }, [column, columnIndex, previewNodeId, surface]);

  const projection = React.useMemo(() => {
    if (!previewNodeId) {
      return null;
    }

    return createSchemaColumnProjection({
      ownerNodeId: previewNodeId,
      column,
      columnIndex,
      surface,
    });
  }, [column, columnIndex, previewNodeId, surface]);

  const insertItems = React.useMemo<MenuProps['items']>(() => {
    return [
      { key: 'insert:empty', label: emptyInsertLabel },
      { type: 'divider' },
      ...entityFields.map((field) => ({ key: `insert:${field.key}`, label: field.key })),
    ];
  }, [emptyInsertLabel, entityFields]);

  const focusColumn = React.useCallback(
    (interactionSource: InteractionSource = 'canvas') => {
      if (!previewNodeId || !columnSource) {
        return;
      }

      onFocus();
      dispatch(
        focusSchemaColumn({
          ownerNodeId: previewNodeId,
          column,
          columnIndex,
          interactionSource,
          surface,
        }),
      );
    },
    [column, columnIndex, columnSource, dispatch, onFocus, previewNodeId, surface],
  );

  const insertBehind = React.useCallback(
    (fieldKey?: string) => {
      if (!previewNodeId) {
        return;
      }

      focusColumn();
      dispatch(
        upsertColumnOfSelectedNode({
          insertPos: columnIndex + 1,
          changes: buildInsertedColumn({ componentType: 'Table', entityFields, fieldKey }),
        }),
      );
    },
    [columnIndex, dispatch, entityFields, focusColumn, previewNodeId],
  );

  const handleDelete = React.useCallback(() => {
    if (!previewNodeId || !column.key) {
      return;
    }

    focusColumn();
    dispatch(deleteColumnForSelectedNode(column.key));
  }, [column.key, dispatch, focusColumn, previewNodeId]);

  const handleEdit = React.useCallback(() => {
    if (!previewNodeId) {
      return;
    }

    onFocus();
    dispatch(
      openSchemaColumnEditor({
        ownerNodeId: previewNodeId,
        column,
        columnIndex,
        interactionSource: 'canvas',
        surface,
      }),
    );
  }, [column, columnIndex, dispatch, onFocus, previewNodeId, surface]);

  const updateColumn = React.useCallback(
    (changes: Partial<ProCommonColumn>) => {
      if (!column.key) {
        return;
      }

      dispatch(upsertColumnOfSelectedNode({ key: column.key, ...changes }));
    },
    [column.key, dispatch],
  );

  return {
    ...sortable,
    canOperate,
    columnSource,
    projection,
    insertItems,
    focusColumn,
    insertBehind,
    handleDelete,
    handleEdit,
    updateColumn,
  };
};
