import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import type { ProCommonColumn } from '@/types';
import type {
  RuleNodeParams,
  RuleTemplate,
  RuleNode,
} from '@/components/RuleBuilder/RuleParamsDateSchema';
import { ruleNodeContext } from '@/components/RuleBuilder/strategies';
import { makeRuleId } from '@/utils/makeIdCreator';
import { getRuleNodesOfEditingColumn } from './selectors';

export type ColumnEditorState = {
  editingColumn: Partial<ProCommonColumn> | null;
  isSchemaBuilderModalOpen: boolean;
};

const initialState: ColumnEditorState = {
  editingColumn: null,
  isSchemaBuilderModalOpen: false,
};

const slice = createSlice({
  name: 'columnEditor',
  initialState,
  reducers: {
    /**
     * @description 设置正在编辑的列属性
     * @param payload 正在编辑的列属性，或null，或空对象
     */
    setEditingColumn: (state, { payload }: PayloadAction<ProCommonColumn | null | {}>) => {
      state.editingColumn = payload ? { ...payload } : payload;
    },

    /**
     * @description 更新正在编辑的列属性部分内容
     * @param payload 列属性更新内容
     */
    updateEditingColumn: (state, { payload }: PayloadAction<Partial<ProCommonColumn>>) => {
      if (!state.editingColumn) return;
      Object.assign(state.editingColumn, payload);
    },

    /**
     * @description 开始添加新列
     */
    startAddingColumn: (state) => {
      state.isSchemaBuilderModalOpen = true;
      state.editingColumn = {};
    },

    /**
     * @description 开始编辑已有列
     * @param payload 要编辑的列配置
     */
    startEditingColumn: (state, { payload }: PayloadAction<ProCommonColumn>) => {
      state.isSchemaBuilderModalOpen = true;
      state.editingColumn = { ...payload };
    },

    /**
     * @description 设置 Schema Builder 弹窗开关状态
     * @param payload 是否打开
     */
    setIsSchemaBuilderModalOpen: (state, { payload }: PayloadAction<boolean>) => {
      state.isSchemaBuilderModalOpen = payload;
    },

    /**
     * @description 向正在编辑的列属性中添加规则节点
     * @param action.payload 规则节点模板
     */
    addRuleNodeToEditingColumn: (state, action: PayloadAction<RuleTemplate>) => {
      if (!state.editingColumn) return;
      const ruleNodes = getRuleNodesOfEditingColumn(state);
      if (!ruleNodes) return;

      const { type, defaultParams, name } = action.payload;
      const newRuleNode = {
        id: makeRuleId(),
        name,
        enabled: true,
        type,
        params: defaultParams || {},
      } as RuleNode;
      newRuleNode.message = ruleNodeContext
        .getStrategyForNodeOrThrow({ ...newRuleNode })
        .buildDefaultMessage({ ...newRuleNode });
      ruleNodes.push(newRuleNode);
    },

    /**
     * @description 更新正在编辑的列属性中的规则节点参数
     * @param action.payload.id 规则节点ID
     * @param action.payload.params 规则节点参数更新内容
     */
    updateRuleNodeParamsOfEditingColumn: (
      state,
      action: PayloadAction<{ id: string; params: RuleNodeParams }>,
    ) => {
      const ruleNodes = getRuleNodesOfEditingColumn(state);
      if (!ruleNodes) return;
      const { id, params } = action.payload;
      const targetNode = ruleNodes.find((n) => n.id === id);
      if (!targetNode) return;
      Object.assign(targetNode.params, params);
      targetNode.message =
        targetNode.message ||
        ruleNodeContext.getStrategyForNodeOrThrow(targetNode).buildDefaultMessage(targetNode);
    },

    /**
     * @description 删除正在编辑的列属性中的规则节点
     * @param action.payload 规则节点ID
     */
    deleteRuleNodeOfEditingColumn: (state, action: PayloadAction<string>) => {
      const ruleNodes = getRuleNodesOfEditingColumn(state);
      if (!ruleNodes) return;
      const idx = ruleNodes.findIndex((n) => n.id === action.payload);
      if (idx < 0) return;
      ruleNodes.splice(idx, 1);
    },
  },
});

export const columnEditorActions = slice.actions;
export const {
  setEditingColumn,
  updateEditingColumn,
  startAddingColumn,
  startEditingColumn,
  setIsSchemaBuilderModalOpen,
  addRuleNodeToEditingColumn,
  updateRuleNodeParamsOfEditingColumn,
  deleteRuleNodeOfEditingColumn,
} = slice.actions;
export const columnEditorReducer = slice.reducer;
