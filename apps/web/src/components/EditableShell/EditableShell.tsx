import React from 'react';
import { Popover } from 'antd';
import type { EditableProjection } from '@/editing/types';
import * as styles from './EditableShell.css';

/* eslint-disable jsx-a11y/no-static-element-interactions */

const TOOLBAR_CLOSE_DELAY_MS = 120;

export interface EditableShellProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  target: EditableProjection;
  selected?: boolean;
  highlighted?: boolean;
  disabled?: boolean;
  toolbar?: React.ReactNode;
  dragHandle?: React.ReactNode;
  placeholder?: React.ReactNode;
  children: React.ReactNode;
  onSelect?: (event: React.MouseEvent | React.KeyboardEvent) => void;
  onMouseEnter?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseLeave?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export const EditableShell = React.forwardRef<HTMLDivElement, EditableShellProps>(
  (
    {
      target,
      selected = false,
      highlighted = true,
      disabled = false,
      toolbar,
      dragHandle,
      placeholder,
      children,
      onSelect,
      onMouseEnter,
      onMouseLeave,
      className,
      onClick,
      onKeyDown,
      ...restProps
    },
    ref,
  ) => {
    const isInteractive = !!onSelect && !disabled;
    const shellClassName = className ? `${styles.shell} ${className}` : styles.shell;
    const [isShellHovered, setIsShellHovered] = React.useState(false);
    const [isToolbarHovered, setIsToolbarHovered] = React.useState(false);
    const hideToolbarTimeoutRef = React.useRef<number | null>(null);

    const clearHideToolbarTimeout = React.useCallback(() => {
      if (hideToolbarTimeoutRef.current !== null) {
        window.clearTimeout(hideToolbarTimeoutRef.current);
        hideToolbarTimeoutRef.current = null;
      }
    }, []);

    const scheduleShellHoverClear = React.useCallback(() => {
      clearHideToolbarTimeout();
      hideToolbarTimeoutRef.current = window.setTimeout(() => {
        setIsShellHovered(false);
      }, TOOLBAR_CLOSE_DELAY_MS);
    }, [clearHideToolbarTimeout]);

    React.useEffect(() => {
      return () => {
        clearHideToolbarTimeout();
      };
    }, [clearHideToolbarTimeout]);

    const handleShellMouseEnter: React.MouseEventHandler<HTMLDivElement> = React.useCallback(
      (event) => {
        clearHideToolbarTimeout();
        setIsShellHovered(true);
        onMouseEnter?.(event);
      },
      [clearHideToolbarTimeout, onMouseEnter],
    );

    const handleShellMouseLeave: React.MouseEventHandler<HTMLDivElement> = React.useCallback(
      (event) => {
        scheduleShellHoverClear();
        onMouseLeave?.(event);
      },
      [onMouseLeave, scheduleShellHoverClear],
    );

    const toolbarVisible = Boolean(toolbar) && (selected || isShellHovered || isToolbarHovered);

    const toolbarNode = toolbar ? (
      <div
        className={styles.toolbar}
        onMouseEnter={() => {
          clearHideToolbarTimeout();
          setIsToolbarHovered(true);
        }}
        onMouseLeave={() => {
          setIsToolbarHovered(false);
          scheduleShellHoverClear();
        }}
      >
        {toolbar}
      </div>
    ) : null;

    const handleClick: React.MouseEventHandler<HTMLDivElement> = (event) => {
      onClick?.(event);
      if (!event.isPropagationStopped()) {
        onSelect?.(event);
      }
    };

    const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (event) => {
      onKeyDown?.(event);
      if (!event.isPropagationStopped() && (event.key === 'Enter' || event.key === ' ')) {
        onSelect?.(event);
      }
    };

    const handleContextMenu: React.MouseEventHandler<HTMLDivElement> = (event) => {
      event?.stopPropagation();

      // Only treat keyboard-invoked context menus as direct selection here.
      // Mouse right-click selection is handled by outer context-menu triggers.
      if (event.detail === 0) {
        onSelect?.(event);
      }
    };

    const shellProps = {
      ...restProps,
      ref,
      className: shellClassName,
      'data-target-id': target.id,
      'data-target-kind': target.kind,
      'data-outline-variant': target.outlineVariant ?? 'default',
      'data-selected': selected,
      'data-highlighted': highlighted,
      'data-disabled': disabled,
      onMouseEnter: handleShellMouseEnter,
      onMouseLeave: handleShellMouseLeave,
    };

    const shellNode = isInteractive ? (
      <div
        {...shellProps}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        role="button"
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        {dragHandle ? <div className={styles.dragHandle}>{dragHandle}</div> : null}
        <div className={styles.content}>{children || placeholder}</div>
        {!children && placeholder ? <div className={styles.placeholder}>{placeholder}</div> : null}
      </div>
    ) : (
      <div {...shellProps} onClick={onClick} onKeyDown={onKeyDown}>
        {dragHandle ? <div className={styles.dragHandle}>{dragHandle}</div> : null}
        <div className={styles.content}>{children || placeholder}</div>
        {!children && placeholder ? <div className={styles.placeholder}>{placeholder}</div> : null}
      </div>
    );

    if (!toolbarNode) {
      return shellNode;
    }

    return (
      <Popover
        trigger={['hover']}
        open={toolbarVisible}
        placement="topRight"
        arrow={false}
        overlayClassName={styles.toolbarPopoverOverlay}
        content={toolbarNode}
      >
        {shellNode}
      </Popover>
    );
  },
);

EditableShell.displayName = 'EditableShell';

/* eslint-enable jsx-a11y/no-static-element-interactions */
