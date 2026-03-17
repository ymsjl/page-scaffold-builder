import React, { type PropsWithChildren } from 'react';
import { Dropdown, Input } from 'antd';
import type { MenuProps } from 'antd';
import {
  DeleteOutlined,
  EditOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  NumberOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { EditableShell } from '@/components/EditableShell/EditableShell';
import { type ProCommonColumn, type SchemaField } from '@/types';
import {
  upsertColumnOfSelectedNode,
  deleteColumnForSelectedNode,
} from '@/store/componentTreeSlice/componentTreeSlice';
import { selectTypeOfSelectedNode } from '@/store/componentTreeSlice/componentTreeSelectors';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectActiveEditingSource } from '@/editing/store/selectors';
import { setHoverSource } from '@/editing/store/editingSlice';
import {
  createSchemaColumnProjection,
  createSchemaColumnSource,
  focusSchemaColumn,
  openSchemaColumnEditor,
} from '@/editing/bindings/schemaColumns';
import { isSameEditableSource } from '@/editing/types/EditableSource';
import { createProCommonColumnFromSchemeField } from '@/components/SchemaBuilderModal/createProCommonColumnFromSchemeField';
import * as ptStyles from './ProTableForPreview.css';

type ColumnTitleMenuProps = {
  column: ProCommonColumn;
  columnIndex: number;
  tableNodeId?: string;
  entityFields: SchemaField[];
};

export const ColumnTitleMenu: React.FC<PropsWithChildren<ColumnTitleMenuProps>> = ({
  column,
  columnIndex,
  tableNodeId,
  entityFields,
  children,
}) => {
  const dispatch = useAppDispatch();
  const componentType = useAppSelector(selectTypeOfSelectedNode);
  const activeSource = useAppSelector(selectActiveEditingSource);
  const [isRenaming, setIsRenaming] = React.useState(false);
  const [draftTitle, setDraftTitle] = React.useState('');
  const canOperate = !!tableNodeId;

  const columnSource = React.useMemo(() => {
    if (!tableNodeId) {
      return null;
    }

    return createSchemaColumnSource({
      ownerNodeId: tableNodeId,
      column,
      columnIndex,
    });
  }, [column, columnIndex, tableNodeId]);

  const columnProjection = React.useMemo(() => {
    if (!tableNodeId) {
      return null;
    }

    return createSchemaColumnProjection({
      ownerNodeId: tableNodeId,
      column,
      columnIndex,
    });
  }, [column, columnIndex, tableNodeId]);

  const isSelected = isSameEditableSource(activeSource, columnSource);

  const getCursorStyle = React.useCallback((): React.CSSProperties['cursor'] => {
    if (isRenaming) return 'text';
    if (canOperate) return 'context-menu';
    return 'default';
  }, [isRenaming, canOperate]);

  const getTitleText = React.useCallback(() => {
    if (typeof column.title === 'string') return column.title;
    if (typeof children === 'string' || typeof children === 'number') {
      return String(children);
    }
    return '';
  }, [column.title, children]);

  const cancelRename = React.useCallback(() => {
    setIsRenaming(false);
    setDraftTitle(getTitleText());
  }, [getTitleText]);

  const applyRename = React.useCallback(() => {
    const nextTitle = draftTitle.trim();
    if (!nextTitle) {
      cancelRename();
      return;
    }

    if (!tableNodeId || !column.key) {
      setIsRenaming(false);
      return;
    }

    const currentTitle = getTitleText();
    if (nextTitle !== currentTitle) {
      dispatch(
        focusSchemaColumn({
          ownerNodeId: tableNodeId,
          column,
          columnIndex,
          interactionSource: 'canvas',
        }),
      );
      dispatch(
        upsertColumnOfSelectedNode({
          key: column.key,
          title: nextTitle,
        }),
      );
    }

    setIsRenaming(false);
  }, [cancelRename, column, columnIndex, dispatch, draftTitle, getTitleText, tableNodeId]);

  const focusColumn = React.useCallback(() => {
    if (!tableNodeId || !columnSource) {
      return;
    }

    dispatch(
      focusSchemaColumn({
        ownerNodeId: tableNodeId,
        column,
        columnIndex,
        interactionSource: 'canvas',
      }),
    );
  }, [column, columnIndex, columnSource, dispatch, tableNodeId]);

  const handleDoubleClick = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      if (!canOperate) return;
      event.stopPropagation();
      focusColumn();
      setDraftTitle(getTitleText());
      setIsRenaming(true);
    },
    [canOperate, focusColumn, getTitleText],
  );

  const handleEdit = React.useCallback(
    (event?: React.MouseEvent | React.KeyboardEvent) => {
      event?.stopPropagation();
      if (!tableNodeId) return;
      dispatch(
        openSchemaColumnEditor({
          ownerNodeId: tableNodeId,
          column,
          columnIndex,
          interactionSource: 'canvas',
        }),
      );
    },
    [column, columnIndex, dispatch, tableNodeId],
  );

  const handleDelete = React.useCallback(
    (event?: React.MouseEvent | React.KeyboardEvent) => {
      event?.stopPropagation();
      if (!tableNodeId || !column.key) return;
      focusColumn();
      dispatch(deleteColumnForSelectedNode(column.key));
    },
    [column.key, dispatch, focusColumn, tableNodeId],
  );

  const insertItems = React.useMemo<MenuProps['items']>(() => {
    return [
      { key: 'insert:empty', label: '空列' },
      { type: 'divider' },
      ...entityFields.map((field) => ({
        key: `insert:${field.key}`,
        label: field.key,
      })),
    ];
  }, [entityFields]);

  const menuItems = React.useMemo<MenuProps['items']>(
    () => [
      {
        key: 'title',
        label: column.title || '未命名列',
        disabled: true,
      },
      {
        key: 'edit',
        label: '编辑该列',
        disabled: !canOperate,
        icon: <EditOutlined />,
      },
      {
        key: 'delete',
        label: '删除该列',
        disabled: !canOperate,
        icon: <DeleteOutlined />,
      },
      {
        key: 'insert',
        label: '在后方新增一列',
        disabled: !canOperate,
        children: insertItems,
        icon: <PlusOutlined />,
      },
      {
        type: 'divider',
      },
      {
        key: 'hideInSearch',
        label: column?.hideInSearch ? '显示表单项' : '隐藏表单项',
        disabled: !canOperate,
        icon: column?.hideInSearch ? <EyeOutlined /> : <EyeInvisibleOutlined />,
      },
      {
        key: 'hideInTable',
        label: column?.hideInTable ? '显示表格列' : '隐藏表格列',
        disabled: !canOperate,
        icon: column?.hideInTable ? <EyeOutlined /> : <EyeInvisibleOutlined />,
      },
      {
        type: 'divider',
      },
      {
        key: 'rules',
        label: '数据校验规则',
        disabled: !canOperate,
        icon: <NumberOutlined />,
      },
    ],
    [canOperate, insertItems, column],
  );

  const handleMenuClick = React.useCallback<NonNullable<MenuProps['onClick']>>(
    ({ key, domEvent }) => {
      domEvent.stopPropagation();
      if (!tableNodeId) return;
      if (!column.key) return;

      focusColumn();

      if (key === 'edit' || key === 'rules') {
        dispatch(
          openSchemaColumnEditor({
            ownerNodeId: tableNodeId,
            column,
            columnIndex,
            interactionSource: 'context-menu',
          }),
        );
      } else if (key === 'delete') {
        dispatch(deleteColumnForSelectedNode(column.key));
      } else if (typeof key === 'string' && key.startsWith('insert:')) {
        const fieldKey = key.replace('insert:', '');
        const field = entityFields.find((item) => item.key === fieldKey);
        const newColumn = createProCommonColumnFromSchemeField(field, componentType);
        newColumn.title = '新列';
        dispatch(
          upsertColumnOfSelectedNode({
            insertPos: columnIndex + 1,
            changes: newColumn,
          }),
        );
      } else if (key === 'hideInSearch') {
        dispatch(
          upsertColumnOfSelectedNode({
            key: column.key,
            hideInSearch: !column.hideInSearch,
          }),
        );
      } else if (key === 'hideInTable') {
        dispatch(
          upsertColumnOfSelectedNode({
            key: column.key,
            hideInTable: !column.hideInTable,
          }),
        );
      }
    },
    [column, columnIndex, dispatch, entityFields, tableNodeId, componentType, focusColumn],
  );

  if (!columnProjection || !columnSource) {
    return children;
  }

  return (
    <Dropdown
      trigger={isRenaming ? [] : ['contextMenu']}
      menu={{ items: menuItems, onClick: handleMenuClick }}
      overlayClassName={ptStyles.dropdownOverlay}
    >
      {isRenaming ? (
        <Input
          size="small"
          value={draftTitle}
          autoFocus
          onChange={(event) => setDraftTitle(event.target.value)}
          onBlur={applyRename}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.currentTarget.blur();
            }
            if (event.key === 'Escape') {
              cancelRename();
            }
          }}
          onClick={(event) => event.stopPropagation()}
        />
      ) : (
        <EditableShell
          target={columnProjection}
          selected={isSelected}
          onSelect={(event) => {
            event.stopPropagation();
            focusColumn();
          }}
          onMouseEnter={() => dispatch(setHoverSource(columnSource))}
          onMouseLeave={() => dispatch(setHoverSource(null))}
          toolbar={[
            {
              title: '编辑列',
              icon: <EditOutlined />,
              onClick: handleEdit,
              disabled: !canOperate,
            },
            {
              title: '删除列',
              icon: <DeleteOutlined />,
              onClick: handleDelete,
              disabled: !canOperate,
            },
          ]}
        >
          <button
            type="button"
            className={ptStyles.titleContainer}
            style={{ cursor: getCursorStyle() }}
            onClick={(event) => {
              event.stopPropagation();
              focusColumn();
            }}
            onDoubleClick={handleDoubleClick}
          >
            {children}
          </button>
        </EditableShell>
      )}
    </Dropdown>
  );
};
