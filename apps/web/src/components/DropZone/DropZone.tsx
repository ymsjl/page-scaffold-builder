import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Popover, Typography } from 'antd';
import { useAppDispatch } from '@/store/hooks';
import { componentTreeActions } from '@/store/componentTree/componentTreeSlice';
import type { ComponentType } from '@/types';
import { COMPONENT_TYPES } from '@/types/Component';
import * as dropZoneStyles from './DropZone.css';

const componentLabelMap: Record<ComponentType, string> = {
  Page: '页面组件',
  Table: '表格组件',
  Form: '表单组件',
  Description: '描述组件',
  Button: '按钮组件',
  Text: '文本组件',
  Modal: '模态框组件',
};

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
      type: 'dropZone',
      targetNodeId,
      propPath,
      acceptTypes,
    },
  });

  // 检查当前拖拽的组件是否被接受
  const dragData = active?.data?.current as { type: string; nodeType: string } | undefined;

  const isAccepted =
    dragData?.type === 'treeNode' &&
    (!acceptTypes || acceptTypes.length === 0 || acceptTypes.includes(dragData.nodeType));

  const isActive = isOver && isAccepted;
  const isInvalid = isOver && !isAccepted;
  const isDragging = Boolean(active);

  const filteredComponents = React.useMemo(
    () =>
      COMPONENT_TYPES.filter((type) => type !== 'Page')
        .map((type) => ({ type, label: componentLabelMap[type] ?? type }))
        .filter(
          (comp) => !acceptTypes || acceptTypes.length === 0 || acceptTypes.includes(comp.type),
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
        label: componentLabelMap[type],
      }),
    );
    setIsPopoverOpen(false);
  };

  const popoverContent =
    filteredComponents.length > 0 ? (
      <ul className={dropZoneStyles.menuList}>
        {filteredComponents.map((item) => (
          <li key={item.type} className={dropZoneStyles.menuItem}>
            <button
              type="button"
              className={dropZoneStyles.menuButton}
              onClick={() => handleSelectComponent(item.type)}
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    ) : (
      <Typography.Text type="secondary">暂无可添加组件</Typography.Text>
    );

  return (
    <Popover
      content={popoverContent}
      trigger="hover"
      placement="right"
      arrow={false}
      overlayInnerStyle={{
        padding: '4px 0',
      }}
      open={isPopoverOpen && !isDragging}
      onOpenChange={(open) => setIsPopoverOpen(open)}
    >
      <div
        ref={setNodeRef}
        className={`${dropZoneStyles.dropZone} ${isActive ? dropZoneStyles.dropZoneActive : ''} ${isInvalid ? dropZoneStyles.dropZoneInvalid : ''} ${active ? dropZoneStyles.dropZoneDragging : ''}`}
        title={label}
      >
        <div className={dropZoneStyles.dropZoneIcon} aria-hidden>
          +
        </div>
        {label ? <div className={dropZoneStyles.dropZoneLabel}>{label}</div> : null}
      </div>
    </Popover>
  );
};

export default DropZone;
