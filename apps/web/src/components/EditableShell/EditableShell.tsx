import React from 'react';
import type { EditableProjection } from '@/editing/types';
import * as styles from './EditableShell.css';
import type { EditableShellToolbarItem } from './EditableShellToolbar';
import { EditableShellToolbar } from './EditableShellToolbar';
import { useAltPressed } from './useAltPressed';

/* eslint-disable jsx-a11y/no-static-element-interactions */

type DragActivatorProps = React.HTMLAttributes<HTMLDivElement> & React.AriaAttributes;

const EditableShellTargetContext = React.createContext<EditableProjection | null>(null);

export interface EditableShellProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onSelect' | 'placeholder'> {
  target: EditableProjection;
  selected?: boolean;
  highlighted?: boolean;
  disabled?: boolean;
  toolbar?: EditableShellToolbarItem[];
  dragActivatorProps?: DragActivatorProps;
  altDragEnabled?: boolean;
  placeholder?: React.ReactNode;
  children: React.ReactNode;
  onSelect?: (event: React.MouseEvent | React.KeyboardEvent) => void;
  onMouseEnter?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseLeave?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export const useEditableShellTarget = (): EditableProjection | null => {
  return React.useContext(EditableShellTargetContext);
};

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
    const shellClassName = className ? `${styles.shell} ${className}` : styles.shell;
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
      if (event.detail === 0) {
        onSelect?.(event);
      }
    };

    return (
      <EditableShellTargetContext.Provider value={target}>
        <EditableShellToolbar toolbar={toolbar} selected={selected}>
          <div
            className={
              dragActivatorClassName
                ? `${shellClassName} ${dragActivatorClassName}`
                : shellClassName
            }
            {...restProps}
            {...dragActivatorRestProps}
            ref={ref}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onPointerDown={mergedPointerDown}
            onClick={handleClick}
            onContextMenu={handleContextMenu}
            role={dragActivatorRole ?? 'button'}
            tabIndex={dragActivatorTabIndex ?? 0}
            onKeyDown={handleKeyDown}
            data-target-id={target.id}
            data-target-kind={target.kind}
            data-outline-variant={target.outlineVariant ?? 'default'}
            data-selected={selected}
            data-highlighted={highlighted}
            data-disabled={disabled}
            data-alt-drag-enabled={altDragEnabled}
            data-alt-drag-ready={altDragReady}
          >
            <div className={styles.content}>{children || placeholder}</div>
            {!children && placeholder ? (
              <div className={styles.placeholder}>{placeholder}</div>
            ) : null}
          </div>
        </EditableShellToolbar>
      </EditableShellTargetContext.Provider>
    );
  },
);

EditableShell.displayName = 'EditableShell';

/* eslint-enable jsx-a11y/no-static-element-interactions */
