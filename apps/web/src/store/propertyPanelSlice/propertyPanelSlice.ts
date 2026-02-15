import { type PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

/**
 * 节点管理相关的 Reducers
 * 负责节点的增删改查、选择、展开等操作
 */

export type PropertyPanelState = {
  propertyPanelNodeIds: string[]; // 属性面板中展示的节点ID栈，最后一个是当前展示的节点
};

const initialState: PropertyPanelState = {
  propertyPanelNodeIds: [],
};

const slice = createSlice({
  name: 'propertyPanel',
  initialState,
  reducers: {
    pushNodeToPropertyPanel: (state, { payload }: PayloadAction<string>) => {
      if (!state.propertyPanelNodeIds) {
        state.propertyPanelNodeIds = [];
      }
      if (!state.propertyPanelNodeIds.includes(payload)) {
        state.propertyPanelNodeIds.push(payload);
      }
    },

    popNodeFromPropertyPanel: (state) => {
      if (!state.propertyPanelNodeIds) {
        return;
      }
      state.propertyPanelNodeIds.pop();
    },
  },
});

export const propertyPanelActions = slice.actions;
export const { pushNodeToPropertyPanel, popNodeFromPropertyPanel } = propertyPanelActions;
export const propertyPanelReducer = slice.reducer;
