import React from 'react';
import { Popover } from 'antd';
import type { EditableProjection } from '@/editing/types';
import * as styles from './EditableShell.css';
import { useAltPressed } from './useAltPressed';

/* eslint-disable jsx-a11y/no-static-element-interactions */

const TOOLBAR_CLOSE_DELAY_MS = 120;

type DragActivatorProps = React.HTMLAttributes<HTMLDivElement> & React.AriaAttributes;

export interface EditableShellProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  target: EditableProjection;
  selected?: boolean;
  highlighted?: boolean;
  disabled?: boolean;
  toolbar?: React.ReactNode;
  dragActivatorProps?: DragActivatorProps;
  altDragEnabled?: boolean;
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
      dragActivatorProps,
      altDragEnabled = false,
      placeholder,
      children,
      onSelect,
      onMouseEnter,
      onMouseLeave,
      className,
      onClick,
      onKeyDown,
      onPointerDown,
      ...restProps
    },
    ref,
  ) => {
    const isInteractive = !!onSelect && !disabled;
    const shellClassName = className ? `${styles.shell} ${className}` : styles.shell;
    const [isShellHovered, setIsShellHovered] = React.useState(false);
    const [isToolbarHovered, setIsToolbarHovered] = React.useState(false);
    const hideToolbarTimeoutRef = React.useRef<number | null>(null);
    const altPressed = useAltPressed();
    const altDragReady = altDragEnabled && altPressed && !disabled;

    const {
      className: dragActivatorClassName,
      onKeyDown: dragActivatorOnKeyDown,
      onPointerDown: dragActivatorOnPointerDown,
      role: dragActivatorRole,
      tabIndex: dragActivatorTabIndex,
      ...dragActivatorRestProps
    } = dragActivatorProps ?? {};

    const mergedPointerDown = React.useCallback<React.PointerEventHandler<HTMLDivElement>>(
      (event) => {
        onPointerDown?.(event);
        if (!event.isPropagationStopped()) {
          dragActivatorOnPointerDown?.(event);
        }
      },
      [dragActivatorOnPointerDown, onPointerDown],
    );

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
      if (!event.isPropagationStopped()) {
        dragActivatorOnKeyDown?.(event);
      }
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
      ...dragActivatorRestProps,
      ref,
      className: dragActivatorClassName
        ? `${shellClassName} ${dragActivatorClassName}`
        : shellClassName,
      'data-target-id': target.id,
      'data-target-kind': target.kind,
      'data-outline-variant': target.outlineVariant ?? 'default',
      'data-selected': selected,
      'data-highlighted': highlighted,
      'data-disabled': disabled,
      'data-alt-drag-enabled': altDragEnabled,
      'data-alt-drag-ready': altDragReady,
      onMouseEnter: handleShellMouseEnter,
      onMouseLeave: handleShellMouseLeave,
      onPointerDown: mergedPointerDown,
    };

    const shellNode = isInteractive ? (
      <div
        {...shellProps}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        role={dragActivatorRole ?? 'button'}
        tabIndex={dragActivatorTabIndex ?? 0}
        onKeyDown={handleKeyDown}
      >
        <div className={styles.content}>{children || placeholder}</div>
        {!children && placeholder ? <div className={styles.placeholder}>{placeholder}</div> : null}
      </div>
    ) : (
      <div
        {...shellProps}
        role={dragActivatorRole}
        tabIndex={dragActivatorTabIndex}
        onClick={onClick}
        onKeyDown={handleKeyDown}
      >
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
