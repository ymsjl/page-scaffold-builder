import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { List, Popover, Typography } from "antd";
import { useAppDispatch } from "@/store/hooks";
import { componentTreeActions } from "@/store/componentTree/componentTreeSlice";
import { availableComponents } from "@/componentMetas";
import type { ComponentType } from "@/types";
import "./DropZone.css";

interface DropZoneProps {
  /** 放置区域的唯一标识符，格式: targetNodeId:propPath */
  id: string;
  /** 目标节点 ID */
  targetNodeId: string;
  /** Props 路径，如 "toolbar.actions" */
  propPath: string;
  /** 接受的组件类型列表 */
  acceptTypes?: string[];
  /** 显示标签 */
  label?: string;
}

export const DropZone: React.FC<DropZoneProps> = ({
  id,
  targetNodeId,
  propPath,
  acceptTypes,
  label,
}) => {
  const dispatch = useAppDispatch();
  const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);
  const { isOver, setNodeRef, active } = useDroppable({
    id,
    data: {
      type: "dropZone",
      targetNodeId,
      propPath,
      acceptTypes,
    },
  });

  // 检查当前拖拽的组件是否被接受
  const dragData = active?.data?.current as
    | { type: string; nodeType: string }
    | undefined;

  const isAccepted =
    dragData?.type === "treeNode" &&
    (!acceptTypes ||
      acceptTypes.length === 0 ||
      acceptTypes.includes(dragData.nodeType));

  const isActive = isOver && isAccepted;
  const isInvalid = isOver && !isAccepted;
  const isDragging = Boolean(active);

  const filteredComponents = React.useMemo(
    () =>
      availableComponents.filter(
        (comp) =>
          !acceptTypes ||
          acceptTypes.length === 0 ||
          acceptTypes.includes(comp.type),
      ),
    [acceptTypes],
  );

  React.useEffect(() => {
    if (isDragging && isPopoverOpen) {
      setIsPopoverOpen(false);
    }
  }, [isDragging, isPopoverOpen]);

  const handleSelectComponent = (type: ComponentType) => {
    dispatch(
      componentTreeActions.addNodeToSlot({
        targetNodeId,
        propPath,
        type,
      }),
    );
    setIsPopoverOpen(false);
  };

  const popoverContent = filteredComponents.length > 0 ? (
    <List
      size="small"
      dataSource={filteredComponents}
      renderItem={(item) => (
        <List.Item
          style={{ cursor: "pointer" }}
          onClick={() => handleSelectComponent(item.type)}
        >
          {item.label}
        </List.Item>
      )}
    />
  ) : (
    <Typography.Text type="secondary">暂无可添加组件</Typography.Text>
  );


  return (
    <Popover
      content={popoverContent}
      trigger="hover"
      open={isPopoverOpen && !isDragging}
      onOpenChange={(open) => setIsPopoverOpen(open)}
    >
      <div
        ref={setNodeRef}
        className={`drop-zone ${isActive ? "drop-zone--active" : ""} ${isInvalid ? "drop-zone--invalid" : ""
          } ${active ? "drop-zone--dragging" : ""}`}
      >
        {label && (
          <Typography.Text type="secondary" className="drop-zone__label">
            {label}
          </Typography.Text>
        )}
        {isActive && <div className="drop-zone__indicator">放置以添加</div>}
        {isInvalid && (
          <div className="drop-zone__indicator drop-zone__indicator--invalid">
            不支持此类型
          </div>
        )}
      </div>
    </Popover>
  );
};

export default DropZone;
