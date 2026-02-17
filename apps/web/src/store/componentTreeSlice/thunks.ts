import { createProCommonColumnFromSchemeField } from '@/components/SchemaBuilderModal/createProCommonColumnFromSchemeField';
import { makeColumnId } from '@/utils/makeIdCreator';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { ProCommonColumnSchema, type ProCommonColumn } from '@/types/tableColumsTypes';
import { getSelectedNodeWithColumns, selectComponentTreeState } from './componentTreeSelectors';
import { selectEditingColumn } from '../columnEditorSlice/selectors';
import { addColumns, upsertColumnOfSelectedNode } from './componentTreeSlice';
import { setEditingColumn } from '../columnEditorSlice/columnEditorSlice';
import { selectEntityModel } from '../entityModelSlice/selectors';
import { entityModelAdapter } from '../entityModelSlice/entityModelAdapter';
import type { RootState } from '../rootReducer';

/**
 * @description 从当前节点相关的实体模型字段中生成列配置
 * 找到当前选择的节点，找到节点的 props.columns 数组，
 * 根据节点的 entityModelId 属性，从实体模型中获取字段列表，
 * 为每个字段生成对应的列配置并添加到节点的列配置中，避免重复添加相同 key 的列
 */
export const addColumnsFromEntityModelToSelectedNode = createAsyncThunk<
  void,
  void,
  { state: RootState }
>('componentTree/addColumnsFromEntityModelToSelectedNode', async (_, { getState, dispatch }) => {
  const state = getState();
  const node = getSelectedNodeWithColumns(selectComponentTreeState(state));
  if (!node) return;
  const { props } = node;
  const entityModelId = props?.entityModelId;
  if (!entityModelId) return;
  const existingKeys = new Set(props.columns?.map((c) => c.key) ?? []);
  const newColumns =
    entityModelAdapter
      .getSelectors()
      .selectById(selectEntityModel(state), entityModelId)
      ?.fields?.filter((field) => !existingKeys.has(field.key))
      ?.map((field) => ({
        key: makeColumnId(),
        ...createProCommonColumnFromSchemeField(field, node.type),
      })) ?? [];

  dispatch(addColumns(newColumns));
});

/**
 * @description 将编辑中的列属性应用到选中节点的列配置中
 * @param action.payload 列属性更新内容
 * 找到当前选择的节点，找到节点的 props.columns 数组，
 * 如果存在相同 key 的列配置则找到正在编辑的列属性，将传入的更新内容合并进去，否则插入新列配置
 */
export const applyChangesToColumnOfSelectedNode = createAsyncThunk<
  void,
  Partial<ProCommonColumn>,
  { state: RootState }
>('componentTree/applyChangesToColumnOfSelectedNode', async (payload, { getState, dispatch }) => {
  const state = getState();
  const editingColumn = selectEditingColumn(state);
  if (!editingColumn) return;
  const { key = makeColumnId() } = editingColumn;
  const nextColumn = ProCommonColumnSchema.parse({
    ...editingColumn,
    ...payload,
    key,
  });
  dispatch(upsertColumnOfSelectedNode(nextColumn));
  dispatch(setEditingColumn(null));
});
