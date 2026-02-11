import { PayloadAction } from "@reduxjs/toolkit";
import { WritableDraft } from "immer";
import type { RuleNodeParams, RuleTemplate } from "@/components/RuleBuilder/RuleParamsDateSchema";
import type { ComponentTreeState } from "../componentTreeSlice";
import { ruleNodeContext } from "@/components/RuleBuilder/strategies";
import { RuleNode } from "@/components/RuleBuilder/RuleParamsDateSchema";
import { makeRuleId } from "../componentTreeSlice";

/**
 * 规则节点相关的 Reducers
 * 负责管理列配置中的验证规则节点
 */
export const createRuleNodeReducers = () => {
  type State = WritableDraft<ComponentTreeState>;

  return {
    /**
     * @description 向正在编辑的列属性中添加规则节点
     * @param action.payload 规则节点模板
     */
    addRuleNodeToEditingColumn: (
      state: State,
      action: PayloadAction<RuleTemplate>,
    ) => {
      if (!state.editingColumn) return;
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
      state.editingColumn.ruleNodes = state.editingColumn.ruleNodes || [];
      state.editingColumn.ruleNodes.push(newRuleNode);
    },

    /**
     * @description 更新正在编辑的列属性中的规则节点参数
     * @param action.payload.id 规则节点ID
     * @param action.payload.params 规则节点参数更新内容
     */
    updateRuleNodeParamsOfEditingColumn: (
      state: State,
      action: PayloadAction<{ id: string; params: RuleNodeParams }>,
    ) => {
      if (!state.editingColumn?.ruleNodes) return;
      const { id, params } = action.payload;
      const targetNode = state.editingColumn?.ruleNodes.find(
        (n) => n.id === id,
      );
      if (!targetNode) return;
      Object.assign(targetNode.params, params);
      targetNode.message =
        targetNode.message ||
        ruleNodeContext
          .getStrategyForNodeOrThrow(targetNode)
          .buildDefaultMessage(targetNode);
    },

    /**
     * @description 删除正在编辑的列属性中的规则节点
     * @param action.payload 规则节点ID
     */
    deleteRuleNodeOfEditingColumn: (
      state: State,
      action: PayloadAction<string>,
    ) => {
      if (!state.editingColumn?.ruleNodes) return;
      state.editingColumn.ruleNodes = state.editingColumn.ruleNodes.filter(
        (n) => n.id !== action.payload,
      );
    },
  };
};
