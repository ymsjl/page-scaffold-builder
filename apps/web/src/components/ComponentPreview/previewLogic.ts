import type { NodeRef, SlotDefinition } from "@/types";
import { isNodeRef } from "@/types";
import { getValueByPath, setValueByPath } from "./slotPath";
import { compact } from "lodash-es";
type NodeRefMap = Record<string, NodeRef[]>;

type BuildResolvedPropsArgs<T> = {
  mergedProps: Record<string, unknown>;
  slots: SlotDefinition[];
  slotRefsMap: NodeRefMap;
  nodeIdToElement: Record<string, T>;
  createDropZone: (slot: SlotDefinition) => T;
  wrapElement: (slot: SlotDefinition, ref: NodeRef, element: T) => T | null;
};

const isPresent = <T>(value: T | null | undefined): value is T =>
  value !== null && value !== undefined;

export const getNodeRefArray = (value: unknown): NodeRef[] => {
  if (Array.isArray(value)) {
    return value.filter(isNodeRef) as NodeRef[];
  } else if (isNodeRef(value)) {
    return [value];
  } else {
    return [];
  }
};

/**
 * @description 根据组件原型中的 slot，从 props 中收集所有的 NodeRef 值，和对应的 slot 建立映射关系。
 * @param props 组件的 props 对象 
 * @param slots 组件原型的 slot 定义数组
 * @returns 一个对象，键是 slot 的 id，值是一个 NodeRef 数组，包含了所有属于该 slot 的 NodeRef 对象
 */
export const collectSlotRefs = (
  props: Record<string, unknown>,
  slots: SlotDefinition[],
) => slots.reduce((map, slot) => {
  map[slot.id] = getNodeRefArray(getValueByPath(props, slot.path));
  return map;
}, {} as NodeRefMap);

/** 
 * @description 将所有的 NodeRef 对象映射到对应的渲染结果上，返回一个以 nodeId 为键，渲染结果为值的对象
 * @param allRefs 所有的 NodeRef 对象数组
 * @param items 所有的渲染结果数组，顺序与 allRefs 中的 NodeRef 顺序一一对应
 * @returns 一个对象，键是 nodeId，值是对应的渲染结果
 *
*/
export const mapNodeRefsToItems = <T>(
  allRefs: NodeRef[],
  items: T[],
): Record<string, T> => Object.fromEntries(allRefs.map((ref, index) => [ref.nodeId, items[index]]));

export const buildResolvedProps = <T>({
  mergedProps,
  slots,
  slotRefsMap,
  nodeIdToElement,
  createDropZone,
  wrapElement,
}: BuildResolvedPropsArgs<T>): Record<string, unknown> => {
  let newProps: Record<string, unknown> = { ...mergedProps };

  for (const slot of slots) {
    const refs = slotRefsMap[slot.id] || [];
    const elements = compact(refs.map((ref) => nodeIdToElement[ref.nodeId]));

    const wrappedElements = slot.wrap
      ? compact(
        refs.map((ref) => {
          const element = nodeIdToElement[ref.nodeId];
          if (!isPresent(element)) return null;
          return wrapElement(slot, ref, element);
        }),
      )
      : elements;

    const dropZone = createDropZone(slot);

    if (slot.renderMode === "inline") {
      if (slot.kind === "reactNodeArray") {
        newProps = setValueByPath(newProps, slot.path, [...wrappedElements, dropZone]);
      } else {
        newProps = setValueByPath(
          newProps,
          slot.path,
          wrappedElements[0] ?? dropZone,
        );
      }
    } else if (slot.kind === "reactNodeArray") {
      newProps = setValueByPath(newProps, slot.path, wrappedElements);
    } else {
      newProps = setValueByPath(newProps, slot.path, wrappedElements[0]);
    }
  }

  return newProps;
};

export const isInlineRender = ({ renderMode }: SlotDefinition) => renderMode !== "inline"

