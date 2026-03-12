import React from 'react';
import type { EditableProjection } from '@/editing/types';
import * as styles from './EditableShell.css';

/* eslint-disable jsx-a11y/no-static-element-interactions */

export interface EditableShellProps extends React.HTMLAttributes<HTMLDivElement> {
  target: EditableProjection;
  selected?: boolean;
  highlighted?: boolean;
  disabled?: boolean;
  toolbar?: React.ReactNode;
  dragHandle?: React.ReactNode;
  placeholder?: React.ReactNode;
  children: React.ReactNode;
  onSelect?: (event: React.MouseEvent | React.KeyboardEvent) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
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

    if (!isInteractive) {
      return (
        <div
          {...restProps}
          ref={ref}
          className={shellClassName}
          data-target-id={target.id}
          data-target-kind={target.kind}
          data-selected={selected}
          data-highlighted={highlighted}
          data-disabled={disabled}
          onClick={onClick}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          onKeyDown={onKeyDown}
        >
          {dragHandle ? <div className={styles.dragHandle}>{dragHandle}</div> : null}
          <div className={styles.content}>{children || placeholder}</div>
          {toolbar ? <div className={styles.toolbar}>{toolbar}</div> : null}
          {!children && placeholder ? (
            <div className={styles.placeholder}>{placeholder}</div>
          ) : null}
        </div>
      );
    }

    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    return (
      <div
        {...restProps}
        ref={ref}
        className={shellClassName}
        data-target-id={target.id}
        data-target-kind={target.kind}
        data-selected={selected}
        data-highlighted={highlighted}
        data-disabled={disabled}
        onClick={handleClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        role="button"
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        {dragHandle ? <div className={styles.dragHandle}>{dragHandle}</div> : null}
        <div className={styles.content}>{children || placeholder}</div>
        {toolbar ? <div className={styles.toolbar}>{toolbar}</div> : null}
        {!children && placeholder ? <div className={styles.placeholder}>{placeholder}</div> : null}
      </div>
    );
  },
);

EditableShell.displayName = 'EditableShell';

/* eslint-enable jsx-a11y/no-static-element-interactions */
