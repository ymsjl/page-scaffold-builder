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
     * @param action.payload 正在编辑的列属性，或null，或空对象
     */
    setEditingColumn: (
      state: State,
      action: PayloadAction<ProCommonColumn | null | {}>,
    ) => {
      state.editingColumn = action.payload;
    },

    /**
     * @description 更新正在编辑的列属性部分内容
     * @param action.payload 列属性更新内容
     */
    updateEditingColumn: (
      state: State,
      action: PayloadAction<Partial<ProCommonColumn>>,
    ) => {
      if (!state.editingColumn) return;
      Object.assign(state.editingColumn, action.payload);
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
     * @param action.payload 要编辑的列配置
     */
    startEditingColumn: (
      state: State,
      action: PayloadAction<ProCommonColumn>,
    ) => {
      state.isSchemaBuilderModalOpen = true;
      state.editingColumn = { ...action.payload };
    },

    /**
     * @description 设置 Schema Builder 弹窗开关状态
     * @param action.payload 是否打开
     */
    setIsSchemaBuilderModalOpen: (
      state: State,
      action: PayloadAction<boolean>,
    ) => {
      state.isSchemaBuilderModalOpen = action.payload;
    },
  };
};
