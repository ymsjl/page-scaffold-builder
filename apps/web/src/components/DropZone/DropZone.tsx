import React from 'react';
import { Popover, Typography } from 'antd';
import { useAppDispatch } from '@/store/hooks';
import { addNodeToSlot } from '@/store/componentTreeSlice/componentTreeSlice';
import type { ComponentType } from '@/types';
import { COMPONENT_TYPES } from '@/types/Component';
import * as dropZoneStyles from './DropZone.css';
import * as indicatorLineStyles from './IndicatorLine.css';

const componentLabelMap: Record<ComponentType, string> = {
  Page: '页面组件',
  Card: '卡片组件',
  Table: '表格组件',
  Form: '表单组件',
  Description: '描述组件',
  Button: '按钮组件',
  Text: '文本组件',
  Modal: '模态框组件',
};

interface AddComponentIntoPreviewProps {
  /** 目标节点 ID */
  targetNodeId: string;
  /** Props 路径，如 "toolbar.actions" */
  propPath: string;
  /** 容器的排布方向 — 决定指示器的朝向（默认："vertical"） */
  direction?: 'horizontal' | 'vertical';
  /** 接受的组件类型列表 */
  acceptTypes?: string[];
  children?: (renderProps: {
    onClick?: () => void;
    defaultIndicator: React.ReactNode;
    isSingleAcceptType: boolean;
    singleAcceptType?: ComponentType;
    singleAcceptTypeLabel?: string;
  }) => React.ReactNode;
}

export const AddComponentIntoPreview: React.FC<AddComponentIntoPreviewProps> = React.memo(
  ({ targetNodeId, propPath, direction = 'vertical', acceptTypes, children }) => {
    const dispatch = useAppDispatch();
    const isContainerHorizontal = direction === 'horizontal';
    const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);

    const filteredComponents = React.useMemo(
      () =>
        COMPONENT_TYPES.filter((type) => type !== 'Page')
          .map((type) => ({ type, label: componentLabelMap[type] ?? type }))
          .filter(
            (comp) => !acceptTypes || acceptTypes.length === 0 || acceptTypes.includes(comp.type),
          ),
      [acceptTypes],
    );

    const singleAcceptType = React.useMemo(() => {
      if (!acceptTypes || acceptTypes.length !== 1) return null;
      const type = acceptTypes[0] as ComponentType;
      return { type, label: componentLabelMap[type] ?? type };
    }, [acceptTypes]);

    const handleSelectComponent = React.useCallback(
      (type: ComponentType) => {
        dispatch(
          addNodeToSlot({
            targetNodeId,
            propPath,
            type,
            label: componentLabelMap[type],
          }),
        );
        setIsPopoverOpen(false);
      },
      [dispatch, propPath, targetNodeId],
    );

    const handleSingleAcceptClick = React.useCallback(() => {
      if (!singleAcceptType) return;
      handleSelectComponent(singleAcceptType.type);
    }, [handleSelectComponent, singleAcceptType]);

    let popoverContent = null;
    if (singleAcceptType) {
      popoverContent = (
        <Typography.Text type="secondary">添加 {singleAcceptType.label} 组件</Typography.Text>
      );
    } else if (filteredComponents.length === 0) {
      popoverContent = <Typography.Text type="secondary">暂无可添加组件</Typography.Text>;
    } else {
      popoverContent = (
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
      );
    }

    const defaultIndicatorElem = React.useMemo(
      () => (
        <div className={indicatorLineStyles.indicatorLineContainer}>
          <div
            className={`${indicatorLineStyles.indicatorIconContainer} ${isContainerHorizontal ? indicatorLineStyles.indicatorIconContainerTop : indicatorLineStyles.indicatorIconContainerRight}`}
          >
            <div
              className={`${indicatorLineStyles.indicatorIcon} ${isContainerHorizontal ? indicatorLineStyles.indicatorIconTop : indicatorLineStyles.indicatorIconSide}`}
              aria-hidden="true"
            >
              +
            </div>
          </div>
        </div>
      ),
      [isContainerHorizontal],
    );

    const renderProps = React.useMemo(
      () => ({
        onClick: singleAcceptType ? handleSingleAcceptClick : undefined,
        defaultIndicator: defaultIndicatorElem,
        isSingleAcceptType: Boolean(singleAcceptType),
        singleAcceptType: singleAcceptType?.type,
        singleAcceptTypeLabel: singleAcceptType?.label,
      }),
      [defaultIndicatorElem, handleSingleAcceptClick, singleAcceptType],
    );

    return (
      <Popover
        content={popoverContent}
        trigger="hover"
        placement={isContainerHorizontal ? 'bottom' : 'left'}
        arrow={false}
        overlayInnerStyle={{
          padding: '4px 0',
        }}
        open={isPopoverOpen}
        onOpenChange={(open) => setIsPopoverOpen(open)}
      >
        {children ? children(renderProps) : defaultIndicatorElem}
      </Popover>
    );
  },
);

export default AddComponentIntoPreview;
