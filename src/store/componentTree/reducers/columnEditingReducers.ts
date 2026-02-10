import { PayloadAction } from "@reduxjs/toolkit";
import { WritableDraft } from "immer";
import type { ProCommonColumn } from "@/types";
import type { ComponentTreeState } from "../componentTreeSlice";

/**
 * 列编辑状态相关的 Reducers
 * 负责管理正在编辑的列的状态
 */
export const createColumnEditingReducers = () => {
  type State = WritableDraft<ComponentTreeState>;

  return {
    /**
     * @description 设置正在编辑的列属性
     * @param payload 正在编辑的列属性，或null，或空对象
     */
    setEditingColumn: (
      state: State,
      { payload }: PayloadAction<ProCommonColumn | null | {}>,
    ) => {
      state.editingColumn = payload ? { ...payload } : payload;
    },

    /**
     * @description 更新正在编辑的列属性部分内容
     * @param payload 列属性更新内容
     */
    updateEditingColumn: (
      state: State,
      { payload }: PayloadAction<Partial<ProCommonColumn>>,
    ) => {
      if (!state.editingColumn) return;
      Object.assign(state.editingColumn, payload);
    },

    /**
     * @description 开始添加新列
     */
    startAddingColumn: (state: State) => {
      state.isSchemaBuilderModalOpen = true;
      state.editingColumn = {};
    },

    /**
     * @description 开始编辑已有列
     * @param payload 要编辑的列配置
     */
    startEditingColumn: (
      state: State,
      { payload }: PayloadAction<ProCommonColumn>,
    ) => {
      state.isSchemaBuilderModalOpen = true;
      state.editingColumn = { ...payload };
    },

    /**
     * @description 设置 Schema Builder 弹窗开关状态
     * @param payload 是否打开
     */
    setIsSchemaBuilderModalOpen: (
      state: State,
      { payload }: PayloadAction<boolean>,
    ) => {
      state.isSchemaBuilderModalOpen = payload;
    },
  };
};
