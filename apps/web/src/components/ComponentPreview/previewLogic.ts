import type { NodeRef, SlotDefinition } from '@/types';
import { isNodeRef } from '@/types';
import { compact } from 'lodash-es';
import { getValueByPath, setValueByPath } from './slotPath';

type NodeRefMap = Record<string, NodeRef[]>;

export type BuildResolvedPropsArgs<T> = {
  mergedProps: Record<string, unknown>;
  slots: SlotDefinition[];
  slotRefsMap: NodeRefMap;
  nodeIdToElement: Record<string, T>;
  renderNodeRef?: (ref: NodeRef) => T;
  wrapElement: (
    slot: SlotDefinition,
    ref: NodeRef | null,
    element: T | null,
    addBtnPosition?: 'start' | 'end' | undefined,
  ) => T | null;
};

const isPresent = <T>(value: T | null | undefined): value is T =>
  value !== null && value !== undefined;

export const getNodeRefArray = (value: unknown): NodeRef[] => {
  if (Array.isArray(value)) {
    return value.filter(isNodeRef) as NodeRef[];
  }
  if (isNodeRef(value)) {
    return [value];
  }
  return [];
};

/**
 * @description 根据组件原型中的 slot，从 props 中收集所有的 NodeRef 值，和对应的 slot 建立映射关系。
 * @param props 组件的 props 对象
 * @param slots 组件原型的 slot 定义数组
 * @returns 一个对象，键是 slot 的 id，值是一个 NodeRef 数组，包含了所有属于该 slot 的 NodeRef 对象
 */
export const collectSlotRefs = (props: Record<string, unknown>, slots: SlotDefinition[]) =>
  slots.reduce((acc, slot) => {
    acc[slot.id] = getNodeRefArray(getValueByPath(props, slot.path));
    return acc;
  }, {} as NodeRefMap);

/**
 * @description 将所有的 NodeRef 对象映射到对应的渲染结果上，返回一个以 nodeId 为键，渲染结果为值的对象
 * @param allRefs 所有的 NodeRef 对象数组
 * @param items 所有的渲染结果数组，顺序与 allRefs 中的 NodeRef 顺序一一对应
 * @returns 一个对象，键是 nodeId，值是对应的渲染结果
 *
 */
export const mapNodeRefsToItems = <T>(allRefs: NodeRef[], items: T[]): Record<string, T> =>
  Object.fromEntries(allRefs.map((ref, index) => [ref.nodeId, items[index]]));

/**
 * Get the position of the "add" button relative to a list item.
 * Rules:
 * - If there is only one element, show the button at the end.
 * - If there are multiple elements, show the button before the first element and after the last element.
 * - If the list is in reverse order, show the button before the first element; otherwise, show it after the last element.
 * @param isFirst Whether this item is the first element in the list.
 * @param isLast Whether this item is the last element in the list.
 * @param isReverse Whether the list is rendered in reverse order.
 * @returns 'start' | 'end' | undefined — show before the first element, after the last element, or not at all.
 */
const getAddBtnPosition = (isFirst: boolean, isLast: boolean, isReverse: boolean) => {
  if (!isFirst && !isLast) return undefined;
  if (isReverse && isFirst) return 'start';
  if (isLast) return 'end';
  return undefined;
};

export const getWrappedElements = <T>({
  slot,
  refs,
  renderNodeRef,
  nodeIdToElement,
  isReverse,
  wrapElement,
}: {
  slot: SlotDefinition;
  refs: NodeRef[];
  renderNodeRef?: (ref: NodeRef) => T;
  nodeIdToElement: Record<string, T>;
  isReverse: boolean;
  wrapElement: (
    targetSlot: SlotDefinition,
    ref: NodeRef | null,
    element: T | null,
    addBtnPosition?: 'start' | 'end' | undefined,
  ) => T | null;
}): Array<T | null> => {
  const elements = renderNodeRef
    ? refs.map(renderNodeRef)
    : compact(refs.map((ref) => nodeIdToElement[ref.nodeId]));

  if (!slot.wrap) return elements;
  if (elements.length === 0) {
    return [wrapElement(slot, null, null, 'end')];
  }

  return refs
    .filter((_, index) => isPresent(elements[index]))
    .map((ref, index, array) =>
      wrapElement(
        slot,
        ref,
        elements[index],
        getAddBtnPosition(index === 0, index === array.length - 1, isReverse),
      ),
    );
};

export const buildResolvedProps = <T>({
  mergedProps,
  slots,
  slotRefsMap,
  nodeIdToElement,
  renderNodeRef,
  wrapElement,
}: BuildResolvedPropsArgs<T>): Record<string, unknown> => {
  let newProps: Record<string, unknown> = { ...mergedProps };

  slots.forEach((slot) => {
    const refs = slotRefsMap[slot.id] || [];

    const isReverse = false;
    const wrappedElements = getWrappedElements({
      slot,
      refs,
      nodeIdToElement,
      renderNodeRef,
      isReverse,
      wrapElement,
    });
    newProps = setValueByPath(newProps, slot.path, wrappedElements);
  });

  return newProps;
};
