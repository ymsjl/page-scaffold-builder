import React, { type PropsWithChildren } from 'react';
import { Button, Popover, Tooltip } from 'antd';
import * as styles from './EditableShell.css';

const TOOLBAR_CLOSE_DELAY_MS = 120;

export interface EditableShellToolbarItem {
  title: string;
  icon?: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLElement>;
  disabled?: boolean;
}

export interface EditableShellToolbarProps {
  toolbar?: EditableShellToolbarItem[];
  selected?: boolean;
}

type HoverableChildProps = {
  onMouseEnter?: React.MouseEventHandler;
  onMouseLeave?: React.MouseEventHandler;
};

export const EditableShellToolbar: React.FC<PropsWithChildren<EditableShellToolbarProps>> = ({
  toolbar,
  selected = false,
  children,
}) => {
  const [isTargetHovered, setIsTargetHovered] = React.useState(false);
  const [isToolbarHovered, setIsToolbarHovered] = React.useState(false);
  const hideToolbarTimeoutRef = React.useRef<number | null>(null);

  const hasToolbar = toolbar && toolbar.length > 0;

  const clearHideToolbarTimeout = React.useCallback(() => {
    if (hideToolbarTimeoutRef.current !== null) {
      window.clearTimeout(hideToolbarTimeoutRef.current);
      hideToolbarTimeoutRef.current = null;
    }
  }, []);

  const scheduleTargetHoverClear = React.useCallback(() => {
    clearHideToolbarTimeout();
    hideToolbarTimeoutRef.current = window.setTimeout(() => {
      setIsTargetHovered(false);
    }, TOOLBAR_CLOSE_DELAY_MS);
  }, [clearHideToolbarTimeout]);

  React.useEffect(() => {
    return () => {
      clearHideToolbarTimeout();
    };
  }, [clearHideToolbarTimeout]);

  const childNode = React.useMemo<React.ReactElement>(() => {
    if (React.isValidElement(children)) {
      const element = children as React.ReactElement<HoverableChildProps>;

      return React.cloneElement(element, {
        onMouseEnter: (event) => {
          clearHideToolbarTimeout();
          setIsTargetHovered(true);
          element.props.onMouseEnter?.(event);
        },
        onMouseLeave: (event) => {
          scheduleTargetHoverClear();
          element.props.onMouseLeave?.(event);
        },
      });
    }

    return <span>{children}</span>;
  }, [children, clearHideToolbarTimeout, scheduleTargetHoverClear]);

  const toolbarVisible = hasToolbar && (selected || isTargetHovered || isToolbarHovered);

  if (!hasToolbar || !selected) {
    return childNode;
  }

  return (
    <Popover
      trigger={['hover']}
      open={toolbarVisible}
      placement="topRight"
      arrow={false}
      overlayClassName={styles.toolbarPopoverOverlay}
      content={
        <div
          className={styles.toolbar}
          onMouseEnter={() => {
            clearHideToolbarTimeout();
            setIsToolbarHovered(true);
          }}
          onMouseLeave={() => {
            setIsToolbarHovered(false);
            scheduleTargetHoverClear();
          }}
        >
          {toolbar.map(({ title, icon, onClick, disabled }) => (
            <Tooltip key={title} title={title}>
              <Button
                size="small"
                type="text"
                icon={icon}
                className={styles.toolbarButton}
                onClick={onClick}
                disabled={disabled}
              />
            </Tooltip>
          ))}
        </div>
      }
    >
      {childNode}
    </Popover>
  );
};
