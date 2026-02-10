/**
 * ==================== 架构说明 ====================
 * 本模块负责定义 componentTree 模块的各种 Selector 函数以供外部使用
 * 这些 Selector 函数用于从 Redux Store 中获取 componentTree 相关的状态片段
 * 包括选中节点、正在编辑的列配置、实体模型等
 *
 * 定义规范：
 * - 每个 Selector 函数均以 select 开头，表示其为 Selector 函数
 * - 函数名应清晰描述其获取的状态内容，例如 selectSelectedNode 表示获取当前选中的节点
 * - 每个 Selector 的选择函数均以 get 开头，表示其为纯函数,不依赖外部状态,仅根据传入的 state 参数计算结果
 * - Selector 的选择函数应该单独定义，便于测试和复用
 * - 每个 Selector 函数均接受整个 RootState 作为参数，并返回对应的 componentTree 状态片段
 * - 对于复杂的状态派生，使用 reselect 库的 createSelector 方法创建 Memoized Selector 以提升性能
 * - 所有 Selector 函数均导出以供外部模块使用
 */

import { createSelector } from "reselect";
import type { RootState } from "../rootReducer";
import {
  type ComponentTreeState,
} from "./componentTreeSlice";

import { getComponentPrototype } from "@/componentMetas";
import type { RuleNode } from "@/components/RuleBuilder/RuleParamsDateSchema";
import type { ComponentNode, ProCommonColumn, ComponentType } from "@/types";
import type { EntityModel } from "@/validation";
import { mapProCommonColumnToProps } from "./mapProCommonColumnToProps";
import type { ComponentNodeWithColumns } from "@/types/Component";
import { WritableDraft } from "immer";
import { createEntityAdapter } from "@reduxjs/toolkit";

export const entityModelAdapter = createEntityAdapter<EntityModel>();

export const componentTreeAdapter = createEntityAdapter<ComponentNode>();

/**
 * 通用类型：支持普通状态和 Immer Draft 状态
 */
export type MaybeWritable<T> = T | WritableDraft<T>;

// ==================== Type Guards ====================
export function isComponentNodeWithColumns(
  node: MaybeWritable<ComponentNode> | undefined | null,
): node is ComponentNodeWithColumns {
  return !!node && "props" in node && typeof node.props === "object";
}

// ==================== Selectors ====================
/**
 * @description 获取 componentTree 模块的整体状态
 */
export const selectComponentTreeState = (state: RootState) =>
  state.componentTree;

/**
 * @description 获取组件树的 normalizedTree
 */
export const getNormalizedTree = (state: MaybeWritable<ComponentTreeState>) =>
  state.normalizedTree;

/**
 * @description 获取组件节点实体表
 */
export const getComponentNodesEntities = (
  state: MaybeWritable<ComponentTreeState>,
) => getNormalizedTree(state).entities.nodes;
export const selectComponentNodesEntities = createSelector(
  selectComponentTreeState,
  getComponentNodesEntities,
);
/**
 * @description 获取根节点ID列表
 */
export const getRootIds = (state: MaybeWritable<ComponentTreeState>) =>
  getNormalizedTree(state).result;
export const selectRootIds = createSelector(
  selectComponentTreeState,
  getRootIds,
);

/**
 * @description 获取当前选中的节点ID
 */
export const getSelectedNodeId = (state: MaybeWritable<ComponentTreeState>) =>
  state.selectedNodeId;
export const selectSelectedNodeId = createSelector(
  selectComponentTreeState,
  getSelectedNodeId,
);

/**
 * @description 获取正在编辑的列配置
 */
export const getEditingColumn = (state: MaybeWritable<ComponentTreeState>) =>
  state.editingColumn || null;
export const selectEditingColumn = createSelector(
  selectComponentTreeState,
  getEditingColumn,
);

/**
 * @description 获取实体模型状态
 */
export const getEntityModel = (state: MaybeWritable<ComponentTreeState>) =>
  state.entityModel;
export const selectEntityModel = createSelector(
  selectComponentTreeState,
  getEntityModel,
);

export const entityModelSelectors =
  entityModelAdapter.getSelectors(selectEntityModel);

/**
 * @description 获取是否打开实体模型弹窗
 */
export const getIsEntityModelModalOpen = (
  state: MaybeWritable<ComponentTreeState>,
) => state.isEntityModelModalOpen;
export const selectIsEntityModelModalOpen = createSelector(
  selectComponentTreeState,
  getIsEntityModelModalOpen,
);

/**
 * @description 获取正在编辑的实体模型ID
 */
export const getEditingEntityModelId = (
  state: MaybeWritable<ComponentTreeState>,
) => state.editingEntityModelId;
export const selectEditingEntityModelId = createSelector(
  selectComponentTreeState,
  getEditingEntityModelId,
);

/**
 * @description 获取适配器格式的组件节点状态
 */
export const getComponentNodesStateResult = (
  entities: Record<string, ComponentNode>,
) => ({
  ids: Object.keys(entities),
  entities,
});
export const selectComponentNodesState = createSelector(
  selectComponentTreeState,
  (state) => getComponentNodesStateResult(getComponentNodesEntities(state)),
);
export const componentNodesSelectors = componentTreeAdapter.getSelectors(
  selectComponentNodesState,
);

/**
 * @description 获取预览根节点ID（查找 Page 类型）
 */
export const getPreviewRootNodeId = (
  state: MaybeWritable<ComponentTreeState>,
) => {
  const entities = getComponentNodesEntities(state);
  const rootId = getRootIds(state).find((id) => entities[id]?.type === "Page");
  return rootId ?? null;
};
export const selectPreviewRootNodeId = createSelector(
  selectComponentTreeState,
  getPreviewRootNodeId,
);

/**
 * @description 获取当前选中的节点
 */
export const getSelectedNode = (state: MaybeWritable<ComponentTreeState>) => {
  const selectedId = getSelectedNodeId(state);
  return selectedId ? getComponentNodesEntities(state)[selectedId] : null;
};
export const selectSelectedNode = createSelector(
  selectComponentTreeState,
  getSelectedNode,
);

export const getNodeIdsInPropertyPanel = (state: MaybeWritable<ComponentTreeState>) => {
  return state.propertyPanelNodeIds || [];
}
export const selectNodeIdsInPropertyPanel = createSelector(
  selectComponentTreeState,
  getNodeIdsInPropertyPanel,
)

export const selectShowBackInPropertyPanel = createSelector(
  selectNodeIdsInPropertyPanel,
  (nodeIds) => !!nodeIds && nodeIds.length > 0,
)

export const getNodeInPropertyPanelResult = (
  components: Record<string, ComponentNode>,
  selectedNode: ComponentNode | null | undefined,
  nodeIds: string[]
) => {
  if (!nodeIds || nodeIds.length === 0) {
    return selectedNode
  } else {
    return components[nodeIds[nodeIds.length - 1]] || null
  }
}
export const selectNodeInPropertyPanel = createSelector(
  selectComponentNodesEntities,
  selectSelectedNode,
  selectNodeIdsInPropertyPanel,
  getNodeInPropertyPanelResult
);

export const getSelectedNodeProps = (
  state: MaybeWritable<ComponentTreeState>,
) => {
  const node = getSelectedNode(state);
  return node ? node.props : null;
};

/**
 * @description 获取当前选中的节点（带列配置验证）
 */
export const getSelectedNodeWithColumns = (
  state: MaybeWritable<ComponentTreeState>,
) => {
  const node = getSelectedNode(state);
  return isComponentNodeWithColumns(node) ? node : null;
};

/**
 * @description 获取选中节点的属性（带列配置验证）
 */
export const getPropsOfSelectedNodeWithColumns = (
  state: MaybeWritable<ComponentTreeState>,
): { columns: ProCommonColumn[] } =>
  getSelectedNodeWithColumns(state)?.props ?? { columns: [] };

/**
 * @description 获取选中节点关联的实体模型ID
 * @return string | null
 */
export const getSelectedNodeEntityModelIdResult = (
  node: ComponentNode | null | undefined,
): string | null => node?.props?.entityModelId || null;
export const selectSelectedNodeEntityModelId = createSelector(
  selectSelectedNode,
  getSelectedNodeEntityModelIdResult,
);

/**
 * @description 获取选中节点的列配置
 */
export const getColumnsOfSelectedNodeResult = (
  node: ComponentNode | null | undefined,
): ProCommonColumn[] => (node ? (node.props?.columns ?? []) : []);
export const selectColumnsOfSelectedNode = createSelector(
  selectSelectedNode,
  getColumnsOfSelectedNodeResult,
);

/**
 * @description 获取选中节点的类型
 * @returns ComponentType | null
 */
export const getTypeOfSelectedNodeResult = (
  node: ComponentNode | null | undefined,
): ComponentType | null => (node ? node.type : null);
export const selectTypeOfSelectedNode = createSelector(
  selectSelectedNode,
  getTypeOfSelectedNodeResult,
);

/**
 * @description 获取用于预览的节点
 */
export const getNodeForPreviewResult = (
  node: ComponentNode | null | undefined,
): ComponentNode | null => {
  if (!node) return null;

  const props = { ...(node.props ?? {}) };
  const componentPrototype = getComponentPrototype(node.type);
  if (!componentPrototype) return { ...node, props };

  if (
    "columns" in (componentPrototype.propsTypes || {}) &&
    Array.isArray(props.columns)
  ) {
    props.columns = props.columns.map(mapProCommonColumnToProps);
  }

  return { ...node, props };
};
export const selectNodeForPreview = createSelector(
  selectSelectedNode,
  getNodeForPreviewResult,
);

/**
 * @description 获取选中节点的第一个父级 Page 节点
 * @returns ComponentNode | null
 */
export const getFirstParentPageNodeResult = (
  node: ComponentNode | null | undefined,
  components: ReturnType<typeof componentTreeAdapter.getInitialState>,
): ComponentNode | null => {
  if (!node) return null;

  const entities = components.entities;
  let currentNode = node;

  while (currentNode.parentId) {
    const parentNode = entities[currentNode.parentId];
    if (!parentNode) break;
    if (parentNode.type === "Page") {
      currentNode = parentNode;
    }
    currentNode = parentNode;
  }

  return currentNode.type === "Page" ? currentNode : null;
};
export const selectFirstParentPageNode = createSelector(
  [selectSelectedNode, selectComponentNodesState],
  getFirstParentPageNodeResult,
);

/**
 * @description 获取用于预览的根节点
 * @return ComponentNode | null | undefined
 */
export const getPreviewRootNodeResult = (
  rootNodeId: string | null,
  components: ReturnType<typeof componentTreeAdapter.getInitialState>,
): ComponentNode | null | undefined => {
  return rootNodeId ? (components.entities[rootNodeId] ?? null) : null;
};
export const selectPreviewRootNode = createSelector(
  [selectPreviewRootNodeId, selectComponentNodesState],
  getPreviewRootNodeResult,
);

/**
 * @description 获取正在使用的实体模型
 * @return EntityModel | null | undefined
 */
export const getEntityModelInUseResult = (
  entityModelId: string | null,
  entityModelState: ReturnType<typeof entityModelAdapter.getInitialState>,
): EntityModel | null | undefined => {
  return entityModelId ? entityModelState.entities[entityModelId] : null;
};
export const selectEntityModelInUse = createSelector(
  [selectSelectedNodeEntityModelId, selectEntityModel],
  getEntityModelInUseResult,
);

/**
 * @description 获取正在编辑的列配置的属性
 * @return Omit<ProCommonColumn, "ruleNodes">
 */
export const getEditingColumnPropsResult = (
  editingColumn: Partial<ProCommonColumn> | null,
): Omit<ProCommonColumn, "ruleNodes"> => {
  if (!editingColumn) return {} as Omit<ProCommonColumn, "ruleNodes">;
  return mapProCommonColumnToProps(editingColumn);
};
export const selectEditingColumnProps = createSelector(
  selectEditingColumn,
  getEditingColumnPropsResult,
);

/**
 * @description 获取正在编辑的列配置的规则节点列表
 * @return RuleNode[]
 */
export const getRuleNodesOfEditingColumnResult = (
  editingColumn: Partial<ProCommonColumn> | null,
): RuleNode[] => editingColumn?.ruleNodes || [];
export const selectRuleNodesOfEditingColumn = createSelector(
  selectEditingColumn,
  getRuleNodesOfEditingColumnResult,
);

/**
 * @description 获取正在编辑的实体模型
 * @return EntityModel | null | undefined
 */
export const getEditingEntityModelResult = (
  editingEntityModelId: string | null,
  entityModelState: ReturnType<typeof entityModelAdapter.getInitialState>,
): EntityModel | null | undefined => {
  if (!editingEntityModelId) return null;
  return entityModelState.entities[editingEntityModelId] || null;
};
export const selectEditingEntityModel = createSelector(
  [selectEditingEntityModelId, selectEntityModel],
  getEditingEntityModelResult,
);