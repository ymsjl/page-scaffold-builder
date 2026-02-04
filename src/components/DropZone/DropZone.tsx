import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { CloseOutlined } from "@ant-design/icons";
import { Tag, Space, Typography } from "antd";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { componentTreeActions } from "@/store/componentTree/componentTreeSlice";
import type { NodeRef } from "@/types";
import { isNodeRef } from "@/types";
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
  /** 当前已有的节点引用 */
  nodeRefs?: NodeRef[];
  /** 显示标签 */
  label?: string;
  /** 占位文本 */
  placeholder?: string;
}

interface DroppedNodeTagProps {
  nodeRef: NodeRef;
  targetNodeId: string;
  propPath: string;
}

const DroppedNodeTag: React.FC<DroppedNodeTagProps> = ({
  nodeRef,
  targetNodeId,
  propPath,
}) => {
  const dispatch = useAppDispatch();
  const node = useAppSelector(
    (state) => state.componentTree.components.entities[nodeRef.nodeId]
  );

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(
      componentTreeActions.removeNodeRefFromProps({
        targetNodeId,
        propPath,
        refNodeId: nodeRef.nodeId,
      })
    );
  };

  if (!node) return null;

  return (
    <Tag
      closable
      onClose={handleRemove}
      closeIcon={<CloseOutlined />}
      color="blue"
      style={{ margin: "2px" }}
    >
      {node.name}
    </Tag>
  );
};

export const DropZone: React.FC<DropZoneProps> = ({
  id,
  targetNodeId,
  propPath,
  acceptTypes,
  nodeRefs = [],
  label,
  placeholder = "拖入组件到此处",
}) => {
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

  // 过滤出有效的 nodeRef
  const validNodeRefs = nodeRefs.filter(isNodeRef);

  return (
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
      <div className="drop-zone__content">
        {validNodeRefs.length > 0 ? (
          <Space wrap size={4}>
            {validNodeRefs.map((ref) => (
              <DroppedNodeTag
                key={ref.nodeId}
                nodeRef={ref}
                targetNodeId={targetNodeId}
                propPath={propPath}
              />
            ))}
          </Space>
        ) : (
          <Typography.Text type="secondary" className="drop-zone__placeholder">
            {placeholder}
          </Typography.Text>
        )}
      </div>
      {isActive && (
        <div className="drop-zone__indicator">
          放置以添加
        </div>
      )}
      {isInvalid && (
        <div className="drop-zone__indicator drop-zone__indicator--invalid">
          不支持此类型
        </div>
      )}
    </div>
  );
};

export default DropZone;
