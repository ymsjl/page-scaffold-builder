import React from 'react';
import { Button, Tooltip } from 'antd';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { useAppDispatch } from '@/store/hooks';
import { selectNode, removeNodeRefFromProps } from '@/store/componentTreeSlice/componentTreeSlice';
import * as styles from './SlotItemWrapper.css';

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
    dispatch(selectNode(nodeId));
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(
      removeNodeRefFromProps({
        targetNodeId,
        propPath,
        refNodeId: nodeId,
      }),
    );
  };

  return (
    <button type="button" className={styles.wrapper} onClick={handleSelect}>
      <div className={styles.content}>{children}</div>
      <div className={styles.actions}>
        <Tooltip title="选中组件">
          <Button size="small" type="text" icon={<EditOutlined />} onClick={handleSelect} />
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
    </button>
  );
};

export default SlotItemWrapper;
