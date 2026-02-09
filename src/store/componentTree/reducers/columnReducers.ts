import { PayloadAction } from "@reduxjs/toolkit";
import { WritableDraft } from "immer";
import type { ProCommonColumn } from "@/types";
import type { ComponentTreeState } from "../componentTreeSlice";
import * as getters from "../componentTreeGetters";
import { ProCommonColumnSchema } from "@/types/tableColumsTypes";
import { makeColumnId } from "../componentTreeSlice";
import { createProCommonColumnFromSchemeField } from "@/components/SchemaBuilderModal/useAutoFillByDataIndex";

/**
 * 列管理相关的 Reducers
 * 负责表格列的增删改查和排序操作
 */
export const createColumnReducers = () => {
  type State = WritableDraft<ComponentTreeState>;

  return {
    /**
     * @description 从当前节点相关的实体模型字段中生成列配置
     */
    addColumnsFromEntityModelToSelectedNode: (
      state: State,
    ) => {
      getters.withSelectedNodeColumns(state, (node) => {
        const entityModelId = node.props?.entityModelId;
        if (!entityModelId) return;
        const entityModel = state.entityModel.entities[entityModelId];
        if (!entityModel || !Array.isArray(entityModel.fields)) return;

        const currentColumns = node.props.columns;
        const existingKeys = new Set(currentColumns?.map((c) => c.key) ?? []);
        const newColumns = entityModel.fields
          .filter((field) => !existingKeys.has(field.key))
          .map((field) => ({
            key: makeColumnId(),
            ...createProCommonColumnFromSchemeField(field),
          }));
        node.props.columns = [...(currentColumns || []), ...newColumns];
      });
    },

    /**
     * @description 将编辑中的列属性应用到选中节点的列配置中
     * @param action.payload 列属性更新内容
     */
    applyChangesToColumnOfSelectedNode: (
      state: State,
      action: PayloadAction<Partial<ProCommonColumn>>,
    ) => {
      const editingColumn = state.editingColumn;
      if (!editingColumn) return;

      try {
        const { key = makeColumnId() } = editingColumn;
        const nextColumn = ProCommonColumnSchema.parse({
          ...action.payload,
          ...editingColumn,
          key,
        });

        // Inline upsert logic
        getters.withSelectedNodeColumns(state, (node) => {
          const columns = node.props?.columns;
          if (!columns) {
            const validatedChanges = ProCommonColumnSchema.parse(nextColumn);
            node.props.columns = [validatedChanges];
          } else if (Array.isArray(columns)) {
            const idx = columns.findIndex((c) => c.key === nextColumn.key);
            if (idx >= 0) {
              Object.assign(columns[idx], nextColumn);
            } else {
              const validatedChanges = ProCommonColumnSchema.parse(nextColumn);
              columns.push(validatedChanges);
            }
          }
        });
      } catch (error) {
        console.error("Column validation failed:", error);
      }
    },

    /**
     * @description 直接插入或更新选中节点的列配置
     * @param action.payload 列属性完整内容
     */
    upsertColumnOfSelectedNode: (
      state: State,
      action: PayloadAction<ProCommonColumn>,
    ) => {
      getters.withSelectedNodeColumns(state, (node) => {
        const columns = node.props?.columns;
        const changes = action.payload;

        if (!columns) {
          const validatedChanges = ProCommonColumnSchema.parse(changes);
          node.props.columns = [validatedChanges];
        } else if (Array.isArray(columns)) {
          const idx = columns.findIndex((c) => c.key === changes.key);
          if (idx >= 0) {
            Object.assign(columns[idx], changes);
          } else {
            const validatedChanges = ProCommonColumnSchema.parse(changes);
            columns.push(validatedChanges);
          }
        }
      });
    },

    /**
     * @description 删除选中节点的指定列配置
     * @param action.payload 列配置的键值
     */
    deleteColumnForSelectedNode: (
      state: State,
      action: PayloadAction<string>,
    ) => {
      getters.withSelectedNodeColumns(state, (node) => {
        const targetColumnIdx = (node.props?.columns ?? []).findIndex(
          (c) => c.key === action.payload,
        );
        if (targetColumnIdx >= 0) {
          node.props.columns.splice(targetColumnIdx, 1);
        }
      });
    },

    /**
     * @description 移动选中节点的列配置顺序
     * @param action.payload.from 源索引
     * @param action.payload.to 目标索引
     */
    moveColumnForSelectedNode: (
      state: State,
      action: PayloadAction<{ from: number; to: number }>,
    ) => {
      const { from, to } = action.payload;
      getters.withSelectedNodeColumns(state, (node) => {
        const columns = node.props?.columns;
        if (!columns || !Array.isArray(columns)) return;
        if (
          from < 0 ||
          from >= columns.length ||
          to < 0 ||
          to >= columns.length
        )
          return;

        const [movedItem] = columns.splice(from, 1);
        columns.splice(to, 0, movedItem);
      });
    },
  };
};
