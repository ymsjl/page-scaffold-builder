import { PayloadAction } from "@reduxjs/toolkit";
import { current, WritableDraft } from "immer";
import type { ProCommonColumn } from "@/types";
import type { ComponentNodeWithColumns } from "@/types/Component";
import type { ComponentTreeState } from "../componentTreeSlice";
import { ProCommonColumnSchema } from "@/types/tableColumsTypes";
import { makeColumnId } from "../componentTreeSlice";
import { createProCommonColumnFromSchemeField } from "@/components/SchemaBuilderModal/createProCommonColumnFromSchemeField";
import { getSelectedNodeWithColumns } from "../componentTreeSelectors";
import { entityModelAdapter } from "../componentTreeAdapters";

const upsertColumnOnNode = (
  props: WritableDraft<ComponentNodeWithColumns["props"]>,
  changes: Partial<ProCommonColumn>,
  insertPos?: number,
) => {
  props.columns = props?.columns ?? [];
  const idx = props.columns.findIndex((c) => c.key === changes.key);
  if (idx >= 0) {
    Object.assign(props.columns[idx], changes);
  } else {
    const validatedChanges = ProCommonColumnSchema.parse({
      ...changes,
      key: changes.key ?? makeColumnId(),
    });
    if (
      typeof insertPos === "number" &&
      insertPos >= 0 &&
      insertPos <= props.columns.length
    ) {
      props.columns.splice(insertPos, 0, validatedChanges);
    } else {
      props.columns.push(validatedChanges);
    }
  }
};

/**
 * 列管理相关的 Reducers
 * 负责表格列的增删改查和排序操作
 */
export const createColumnReducers = () => {
  type State = WritableDraft<ComponentTreeState>;

  return {
    /**
     * @description 从当前节点相关的实体模型字段中生成列配置
     * 找到当前选择的节点，找到节点的 props.columns 数组，
     * 根据节点的 entityModelId 属性，从实体模型中获取字段列表，
     * 为每个字段生成对应的列配置并添加到节点的列配置中，避免重复添加相同 key 的列
     */
    addColumnsFromEntityModelToSelectedNode: (state: State) => {
      const node = getSelectedNodeWithColumns(state);
      if (!node) return;

      const props = node.props;
      const entityModelId = props?.entityModelId;
      if (!entityModelId) return;

      props.columns = props?.columns ?? [];
      const existingKeys = new Set(props.columns?.map((c) => c.key) ?? []);
      const newColumns =
        entityModelAdapter
          .getSelectors()
          .selectById(state.entityModel, entityModelId)
          ?.fields?.filter((field) => !existingKeys.has(field.key))
          ?.map((field) => ({
            key: makeColumnId(),
            ...createProCommonColumnFromSchemeField(field),
          })) ?? [];
      props.columns.push(...newColumns);
    },

    /**
     * @description 将编辑中的列属性应用到选中节点的列配置中
     * @param action.payload 列属性更新内容
     * 找到当前选择的节点，找到节点的 props.columns 数组，
     * 如果存在相同 key 的列配置则找到正在编辑的列属性，将传入的更新内容合并进去，否则插入新列配置
     */
    applyChangesToColumnOfSelectedNode: (
      state: State,
      action: PayloadAction<Partial<ProCommonColumn>>,
    ) => {
      const editingColumn = state.editingColumn;
      if (!editingColumn) return;
      const { key = makeColumnId() } = editingColumn;
      const nextColumn = ProCommonColumnSchema.parse({
        ...editingColumn,
        ...action.payload,
        key,
      });

      const node = getSelectedNodeWithColumns(state);
      if (!node) return;

      upsertColumnOnNode(node.props, nextColumn);
    },

    /**
     * @description 直接插入或更新选中节点的列配置
     * 找到当前选择的节点，找到节点的 props.columns 数组，
     * 如果存在相同 key 的列配置则更新，否则插入新列配置
     * @param action.payload 列属性完整内容
     */
    upsertColumnOfSelectedNode: (
      state: State,
      {
        payload,
      }: PayloadAction<
        | Partial<ProCommonColumn>
        | {
            insertPos?: number;
            changes: Partial<ProCommonColumn>;
          }
      >,
    ) => {
      const node = getSelectedNodeWithColumns(state);
      if (!node) return;

      const changes = "changes" in payload ? payload.changes : payload;
      const insertPos = "insertPos" in payload ? payload.insertPos : undefined;
      upsertColumnOnNode(node.props, changes, insertPos);
    },

    /**
     * @description 删除选中节点的列配置
     * @param payload 列的 key;
     */
    deleteColumnForSelectedNode: (
      state: State,
      action: PayloadAction<string>,
    ) => {
      const node = getSelectedNodeWithColumns(state);
      if (!node) return;

      const props = node.props;
      const idx = props.columns.findIndex((c) => c.key === action.payload);
      if (idx >= 0) {
        props.columns.splice(idx, 1);
      }
    },

    /**
     * @description 移动选中节点的列配置顺序
     * @param action.payload.from 源索引
     * @param action.payload.to 目标索引
     * 找到当前选择的节点，找到节点的 props.columns 数组，
     * 将源索引的列配置移动到目标索引位置
     */
    moveColumnForSelectedNode: (
      state: State,
      action: PayloadAction<{ from: number; to: number }>,
    ) => {
      const { from, to } = action.payload;
      const node = getSelectedNodeWithColumns(state);
      if (!node) return;

      const props = node.props;
      const columns = props.columns;
      if (from < 0 || from >= columns.length || to < 0 || to >= columns.length)
        return;

      const [movedItem] = columns.splice(from, 1);
      columns.splice(to, 0, movedItem);
    },
  };
};
