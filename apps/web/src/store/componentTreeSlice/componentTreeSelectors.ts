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

import type { WritableDraft } from 'immer';
import { createSelector } from 'reselect';

import type { ComponentNodeWithColumns } from '@/types/Component';
import type { ComponentNode, ProCommonColumn, ComponentType } from '@/types';
import type { EntityModel } from '@/validation';

import type { RootState } from '../rootReducer';
import type { ComponentTreeState } from './componentTreeSlice';
import { componentTreeAdapter } from './componentTreeAdapters';
import { type entityModelAdapter } from '../entityModelSlice/entityModelAdapter';
import { selectEntityModel } from '../entityModelSlice/selectors';
import { selectNodeIdsInPropertyPanel } from '../propertyPanelSlice/selectors';

/**
 * 通用类型：支持普通状态和 Immer Draft 状态
 */
export type MaybeWritable<T> = T | WritableDraft<T>;

// ==================== Type Guards ====================
export function isComponentNodeWithColumns(
  node: MaybeWritable<ComponentNode> | undefined | null,
): node is ComponentNodeWithColumns {
  return !!node && 'props' in node && typeof node.props === 'object';
}

// ==================== Selectors ====================
/**
 * @description 获取 componentTree 模块的整体状态
 */
export const selectComponentTreeState = (state: RootState) => state.componentTree;

/**
 * @description 获取组件树的 normalizedTree
 */
export const getNormalizedTree = (state: MaybeWritable<ComponentTreeState>) => state.normalizedTree;
export const selectNormalizedTree = createSelector(selectComponentTreeState, getNormalizedTree);

/**
 * @description 获取组件节点实体表
 */
const getComponentNodesEntitiesResult = (
  normalizedTree: MaybeWritable<ReturnType<typeof getNormalizedTree>>,
) => normalizedTree.entities.nodes;

const getComponentNodesEntities = (state: MaybeWritable<ComponentTreeState>) =>
  getComponentNodesEntitiesResult(getNormalizedTree(state));

export const selectComponentNodesEntities = createSelector(
  selectNormalizedTree,
  getComponentNodesEntitiesResult,
);
/**
 * @description 获取根节点ID列表
 */
const getRootIds = (state: MaybeWritable<ComponentTreeState>) => getNormalizedTree(state).result;
export const selectRootIds = createSelector(selectComponentTreeState, getRootIds);

/**
 * @description 获取当前选中的节点ID
 */
const getSelectedNodeId = (state: MaybeWritable<ComponentTreeState>) => state.selectedNodeId;
export const selectSelectedNodeId = createSelector(selectComponentTreeState, getSelectedNodeId);

/**
 * @description 获取适配器格式的组件节点状态
 */
const getComponentNodesStateResult = (entities: Record<string, ComponentNode>) => ({
  ids: Object.keys(entities),
  entities,
});
const selectComponentNodesState = createSelector(
  selectComponentNodesEntities,
  getComponentNodesStateResult,
);
export const componentNodesSelectors = componentTreeAdapter.getSelectors(selectComponentNodesState);

/**
 * @description 获取当前选中的节点
 */
const getSelectedNode = (state: MaybeWritable<ComponentTreeState>) => {
  const selectedId = getSelectedNodeId(state);
  return selectedId ? getComponentNodesEntities(state)[selectedId] : null;
};
const getSelectedNodeResult = (nodeId: string | null, entities: Record<string, ComponentNode>) => {
  return nodeId ? entities[nodeId] : null;
};
const selectSelectedNode = createSelector(
  selectSelectedNodeId,
  selectComponentNodesEntities,
  getSelectedNodeResult,
);

const getNodeInPropertyPanelResult = (
  components: Record<string, ComponentNode>,
  selectedNode: ComponentNode | null | undefined,
  nodeIds: string[],
) => {
  if (!nodeIds || nodeIds.length === 0) {
    return selectedNode;
  }
  const [lastNodeId] = nodeIds.slice(-1);
  return lastNodeId ? components[lastNodeId] || null : null;
};
export const selectNodeInPropertyPanel = createSelector(
  selectComponentNodesEntities,
  selectSelectedNode,
  selectNodeIdsInPropertyPanel,
  getNodeInPropertyPanelResult,
);

/**
 * @description 获取当前选中的节点（带列配置验证）
 */
export const getSelectedNodeWithColumns = (state: MaybeWritable<ComponentTreeState>) => {
  const node = getSelectedNode(state);
  return isComponentNodeWithColumns(node) ? node : null;
};

/**
 * @description 获取选中节点关联的实体模型ID
 * @return string | null
 */
const getSelectedNodeEntityModelIdResult = (
  node: ComponentNode | null | undefined,
): string | null => node?.props?.entityModelId || null;
export const selectSelectedNodeEntityModelId = createSelector(
  selectSelectedNode,
  getSelectedNodeEntityModelIdResult,
);

/**
 * @description 获取选中节点的列配置
 */
const getColumnsOfSelectedNodeResult = (
  node: ComponentNode | null | undefined,
): ProCommonColumn[] => (node ? (node.props?.columns ?? []) : []);
export const getColumnsOfSelectedNode = (state: MaybeWritable<ComponentTreeState>) => {
  const node = getSelectedNodeWithColumns(state);
  if (!node) return null;
  if (node.props.columns === undefined) {
    node.props.columns = [];
  }
  return node.props.columns;
};
export const selectColumnsOfSelectedNode = createSelector(
  selectSelectedNode,
  getColumnsOfSelectedNodeResult,
);

/**
 * @description 获取选中节点的类型
 * @returns ComponentType | null
 */
const getTypeOfSelectedNodeResult = (
  node: ComponentNode | null | undefined,
): ComponentType | null => (node ? node.type : null);
export const selectTypeOfSelectedNode = createSelector(
  selectSelectedNode,
  getTypeOfSelectedNodeResult,
);

/**
 * @description 获取选中节点的第一个父级 Page 节点
 * @returns ComponentNode | null
 */
const getFirstParentPageNodeResult = (
  node: ComponentNode | null | undefined,
  components: ReturnType<typeof componentTreeAdapter.getInitialState>,
): ComponentNode | null => {
  if (!node) return null;

  const { entities } = components;
  let currentNode = node;

  while (currentNode.parentId) {
    const parentNode = entities[currentNode.parentId];
    if (!parentNode) break;
    if (parentNode.type === 'Page') {
      currentNode = parentNode;
    }
    currentNode = parentNode;
  }

  return currentNode.type === 'Page' ? currentNode : null;
};
export const selectFirstParentPageNode = createSelector(
  [selectSelectedNode, selectComponentNodesState],
  getFirstParentPageNodeResult,
);

/**
 * @description 获取正在使用的实体模型
 * @return EntityModel | null | undefined
 */
const getEntityModelInUseResult = (
  entityModelId: string | null,
  entityModelState: ReturnType<typeof entityModelAdapter.getInitialState>,
): EntityModel | null | undefined => {
  return entityModelId ? entityModelState.entities[entityModelId] : null;
};
export const selectEntityModelInUse = createSelector(
  [selectSelectedNodeEntityModelId, selectEntityModel],
  getEntityModelInUseResult,
);

const getFieldsOfEntityModelInUseResult = (entityModel: EntityModel | null | undefined) =>
  entityModel?.fields ?? [];
export const selectFieldsOfEntityModelInUse = createSelector(
  selectEntityModelInUse,
  getFieldsOfEntityModelInUseResult,
);
