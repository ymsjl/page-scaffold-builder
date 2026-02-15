import type { RuleNode } from '@/components/RuleBuilder/RuleParamsDateSchema';
import type { ProCommonColumn } from '@/types';
import type { ProSchema } from '@ant-design/pro-components';
import { createSelector } from 'reselect';
import { mapProCommonColumnToProps } from '../mapProCommonColumnToProps';

import type { ColumnEditorState } from './columnEditorSlice';
import type { RootState, MaybeWritable } from '../storeTypes';

export const selectColumnEditorState = (state: RootState) => state.columnEditor;

/**
 * @description 获取正在编辑的列配置
 */
export const getEditingColumn = (state: MaybeWritable<ColumnEditorState>) =>
  state.editingColumn || null;
export const selectEditingColumn = createSelector(selectColumnEditorState, getEditingColumn);

/**
 * @description 获取正在编辑的列配置的属性
 * @return Omit<ProCommonColumn, "ruleNodes">
 */
const getEditingColumnPropsResult = (
  editingColumn: Partial<ProCommonColumn> | null,
): ProSchema<Record<string, any>> => {
  if (!editingColumn) return {};
  return mapProCommonColumnToProps(editingColumn);
};
export const getEditingColumnProps = (state: MaybeWritable<ColumnEditorState>) =>
  getEditingColumnPropsResult(getEditingColumn(state));
export const selectEditingColumnProps = createSelector(
  selectEditingColumn,
  getEditingColumnPropsResult,
);

/**
 * @description 获取正在编辑的列配置的规则节点列表
 * @return RuleNode[]
 */
const getRuleNodesOfEditingColumnResult = (
  editingColumn: Partial<ProCommonColumn> | null,
): RuleNode[] => editingColumn?.ruleNodes || [];
export const getRuleNodesOfEditingColumn = (state: MaybeWritable<ColumnEditorState>) => {
  const editingColumn = getEditingColumn(state);
  if (!editingColumn) return null;
  editingColumn.ruleNodes = editingColumn.ruleNodes || [];
  return editingColumn.ruleNodes;
};
export const selectRuleNodesOfEditingColumn = createSelector(
  selectEditingColumn,
  getRuleNodesOfEditingColumnResult,
);

export const getIsSchemaBuilderModalOpen = (state: MaybeWritable<ColumnEditorState>) =>
  state.isSchemaBuilderModalOpen;
export const selectIsSchemaBuilderModalOpen = createSelector(
  selectColumnEditorState,
  getIsSchemaBuilderModalOpen,
);
