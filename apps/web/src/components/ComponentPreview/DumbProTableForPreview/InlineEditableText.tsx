import React from 'react';
import { Input } from 'antd';

type InlineEditableTextProps = {
  isEditing: boolean;
  draftValue: string;
  displayText: string;
  onDraftChange: (nextValue: string) => void;
  onApplyDraft: () => void;
  onCancelDraft: () => void;
  onActivate: () => void;
  onStartEditing: () => void;
  buttonClassName: string;
  textClassName?: string;
  wrapperClassName?: string;
};

export const InlineEditableText: React.FC<InlineEditableTextProps> = ({
  isEditing,
  draftValue,
  displayText,
  onDraftChange,
  onApplyDraft,
  onCancelDraft,
  onActivate,
  onStartEditing,
  buttonClassName,
  textClassName,
  wrapperClassName,
}) => {
  if (isEditing) {
    return (
      <Input
        size="small"
        autoFocus
        variant="borderless"
        value={draftValue}
        onChange={(event) => onDraftChange(event.target.value)}
        onBlur={onApplyDraft}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.currentTarget.blur();
          }

          if (event.key === 'Escape') {
            onCancelDraft();
          }
        }}
        style={{
          height: 'auto',
        }}
        onClick={(event) => event.stopPropagation()}
      />
    );
  }

  const buttonNode = (
    <button
      type="button"
      className={buttonClassName}
      onClick={(event) => {
        event.stopPropagation();
        onActivate();
      }}
      onDoubleClick={(event) => {
        event.stopPropagation();
        onActivate();
        onStartEditing();
      }}
    >
      <span className={textClassName}>{displayText}</span>
    </button>
  );

  if (wrapperClassName) {
    return <div className={wrapperClassName}>{buttonNode}</div>;
  }

  return buttonNode;
};
