import { PayloadAction } from "@reduxjs/toolkit";
import { WritableDraft } from "immer";
import type { EntityModel } from "@/types";
import type { ComponentTreeState } from "../componentTreeSlice";
import { makeEntityModelId } from "../componentTreeSlice";
import { entityModelAdapter } from "../componentTreeSelectors";

/**
 * 实体模型相关的 Reducers
 * 负责实体模型的增删改查操作
 */
export const createEntityModelReducers = () => {
  type State = WritableDraft<ComponentTreeState>;

  return {
    /**
     * @description 关闭实体模型弹窗
     */
    closeEntityModelModal: (state: State) => {
      state.isEntityModelModalOpen = false;
    },

    /**
     * @description 开始创建新的实体模型
     */
    startCreateEntityModel: (state: State) => {
      state.isEntityModelModalOpen = true;
      state.editingEntityModelId = null;
    },

    /**
     * @description 开始编辑已有实体模型
     * @param action.payload 实体模型ID
     */
    startEditEntityModel: (
      state: State,
      action: PayloadAction<string>,
    ) => {
      state.isEntityModelModalOpen = true;
      state.editingEntityModelId = action.payload;
    },

    /**
     * @description 应用实体模型的变更（创建或更新）
     * @param action.payload 实体模型数据（不含ID）
     */
    applyEntityModelChange: (
      state: State,
      action: PayloadAction<Omit<EntityModel, "id">>,
    ) => {
      entityModelAdapter.upsertOne(state.entityModel, {
        ...action.payload,
        id: state.editingEntityModelId ?? makeEntityModelId(),
      });
      state.isEntityModelModalOpen = false;
      state.editingEntityModelId = null;
    },

    /**
     * @description 删除实体模型
     * @param action.payload 实体模型ID
     */
    deleteEntityModel: (
      state: State,
      action: PayloadAction<string>,
    ) => {
      entityModelAdapter.removeOne(state.entityModel, action.payload);
    },
  };
};
