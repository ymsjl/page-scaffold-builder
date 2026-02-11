import React, { createContext, useContext, useState, useCallback, useMemo } from "react";
import type { ComponentType as AppComponentType } from "@/types";

export interface DragData {
  type: "treeNode";
  nodeId: string;
  nodeType: AppComponentType;
}

interface DragDropContextValue {
  /** 当前正在拖拽的节点数据 */
  activeDrag: DragData | null;
  /** 设置当前拖拽数据 */
  setActiveDrag: (data: DragData | null) => void;
  /** 当前悬停的放置区域 ID */
  activeDropZoneId: string | null;
  /** 设置当前悬停的放置区域 */
  setActiveDropZoneId: (id: string | null) => void;
}

const DragDropContext = createContext<DragDropContextValue | null>(null);

export const DragDropProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [activeDrag, setActiveDrag] = useState<DragData | null>(null);
  const [activeDropZoneId, setActiveDropZoneId] = useState<string | null>(null);

  const value = useMemo(
    () => ({
      activeDrag,
      setActiveDrag,
      activeDropZoneId,
      setActiveDropZoneId,
    }),
    [activeDrag, activeDropZoneId]
  );

  return (
    <DragDropContext.Provider value={value}>
      {children}
    </DragDropContext.Provider>
  );
};

export const useDragDropContext = (): DragDropContextValue => {
  const context = useContext(DragDropContext);
  if (!context) {
    throw new Error("useDragDropContext must be used within a DragDropProvider");
  }
  return context;
};

/**
 * 检查拖拽的组件类型是否被放置区域接受
 */
export const isDropAccepted = (
  dragData: DragData | null,
  acceptTypes?: string[]
): boolean => {
  if (!dragData) return false;
  if (!acceptTypes || acceptTypes.length === 0) return true;
  return acceptTypes.includes(dragData.nodeType);
};
