import React from "react";
import { Button, Tooltip } from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { useAppDispatch } from "@/store/hooks";
import { componentTreeActions } from "@/store/componentTree/componentTreeSlice";
import "./SlotItemWrapper.css";

interface SlotItemWrapperProps {
  nodeId: string;
  targetNodeId: string;
  propPath: string;
  children: React.ReactNode;
}

const SlotItemWrapper: React.FC<SlotItemWrapperProps> = ({
  nodeId,
  targetNodeId,
  propPath,
  children,
}) => {
  const dispatch = useAppDispatch();

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(componentTreeActions.selectNode(nodeId));
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(
      componentTreeActions.removeNodeRefFromProps({
        targetNodeId,
        propPath,
        refNodeId: nodeId,
      }),
    );
  };

  return (
    <div className="slot-item-wrapper" onClick={handleSelect}>
      <div className="slot-item-wrapper__content">{children}</div>
      <div className="slot-item-wrapper__actions">
        <Tooltip title="选中组件">
          <Button
            size="small"
            type="text"
            icon={<EditOutlined />}
            onClick={handleSelect}
          />
        </Tooltip>
        <Tooltip title="移除组件">
          <Button
            size="small"
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={handleRemove}
          />
        </Tooltip>
      </div>
    </div>
  );
};

export default SlotItemWrapper;
