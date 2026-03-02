import { type PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import type { EntityModel } from '@/types';
import { makeEntityModelId } from '@/utils/makeIdCreator';
import { entityModelAdapter } from './entityModelAdapter';

type UpdateFieldExtraPayload = {
  entityModelId: string;
  fieldId: string;
  extra: Record<string, any> | undefined;
};

export type EntityModelState = {
  entityModel: ReturnType<typeof entityModelAdapter.getInitialState>;
  isEntityModelModalOpen: boolean;
  editingEntityModelId: string | null;
};

export type EntityModelSnapshot = Pick<EntityModelState, 'entityModel'>;

const initialState: EntityModelState = {
  entityModel: entityModelAdapter.getInitialState({}),
  isEntityModelModalOpen: false,
  editingEntityModelId: null,
};

const slice = createSlice({
  name: 'entityModel',
  initialState,
  reducers: {
    /**
     * @description 关闭实体模型弹窗
     */
    closeEntityModelModal: (state) => {
      state.isEntityModelModalOpen = false;
    },

    /**
     * @description 开始创建新的实体模型
     */
    startCreateEntityModel: (state) => {
      state.isEntityModelModalOpen = true;
      state.editingEntityModelId = null;
    },

    /**
     * @description 开始编辑已有实体模型
     * @param action.payload 实体模型ID
     */
    startEditEntityModel: (state, action: PayloadAction<string>) => {
      state.isEntityModelModalOpen = true;
      state.editingEntityModelId = action.payload;
    },

    /**
     * @description 应用实体模型的变更（创建或更新）
     * @param action.payload 实体模型数据（不含ID）
     */
    applyEntityModelChange: (state, action: PayloadAction<Omit<EntityModel, 'id'>>) => {
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
    deleteEntityModel: (state, action: PayloadAction<string>) => {
      entityModelAdapter.removeOne(state.entityModel, action.payload);
    },

    /**
     * @description 更新实体模型字段的 extra 配置
     * @param action.payload.entityModelId 实体模型ID
     * @param action.payload.fieldId 字段ID
     * @param action.payload.extra 字段扩展配置
     */
    updateEntityFieldExtra: (state, action: PayloadAction<UpdateFieldExtraPayload>) => {
      const { entityModelId, fieldId, extra } = action.payload;
      const entity = state.entityModel.entities[entityModelId];
      if (!entity || !entity.fields) {
        return;
      }
      entityModelAdapter.updateOne(state.entityModel, {
        id: entityModelId,
        changes: {
          fields: entity.fields.map((field) =>
            field.id === fieldId
              ? {
                  ...field,
                  extra,
                }
              : field,
          ),
        },
      });
    },

    hydrateFromSnapshot: (state, action: PayloadAction<Partial<EntityModelSnapshot>>) => {
      const next = action.payload;
      if (next.entityModel) {
        state.entityModel = next.entityModel;
      }
      state.isEntityModelModalOpen = false;
      state.editingEntityModelId = null;
    },
  },
});

export const entityModelActions = slice.actions;
export const {
  closeEntityModelModal,
  startCreateEntityModel,
  startEditEntityModel,
  applyEntityModelChange,
  deleteEntityModel,
  updateEntityFieldExtra,
  hydrateFromSnapshot,
} = slice.actions;
export default slice.reducer;
