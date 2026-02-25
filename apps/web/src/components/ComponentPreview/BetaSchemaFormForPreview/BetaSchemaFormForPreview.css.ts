import { style } from '@vanilla-extract/css';
import {
  colorBgContainer,
  colorBorder,
  colorError,
  colorPrimary,
  colorTextDisabled,
  colorTextSecondary,
  fontSizeBase,
  radiusSmall,
  space1,
  space2,
  transitionFast,
} from '@/styles/tokens.css';

export const formItemShell = style({
  position: 'relative',
  display: 'flex',
  alignItems: 'flex-start',
  gap: space2,
  width: '100%',
  selectors: {
    '&:hover': {
      zIndex: 1,
    },
  },
});

export const formItemDragging = style({
  opacity: 0.6,
});

export const dragHandle = style({
  all: 'unset',
  width: 20,
  height: 20,
  borderRadius: radiusSmall,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: colorTextSecondary,
  cursor: 'grab',
  transition: transitionFast,
  flex: '0 0 auto',
  marginTop: 6,
  selectors: {
    '&:hover': {
      background: colorBgContainer,
    },
  },
});

export const dragHandleDisabled = style({
  cursor: 'default',
  color: colorTextDisabled,
});

export const dragHandleIcon = style({
  fontSize: fontSizeBase,
});

export const itemContent = style({
  position: 'relative',
  flex: 1,
  minWidth: 0,
  paddingBottom: 16,
});

export const addFieldIndicator = style({
  flex: 1,
  height: '4px',
  marginInline: 'auto',
  borderRadius: 999,
  backgroundColor: colorPrimary,
});

export const addFieldButtonLayout = style({
  opacity: 0,
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  selectors: {
    [`${formItemShell}:hover &`]: {
      opacity: 1,
      pointerEvents: 'auto',
    },
  },
});
export const addFieldButton = style({
  position: 'absolute',
  top: 0,
  bottom: 0,
  marginBlock: 'auto',
  left: 0,
  width: 28,
  height: 28,
  borderRadius: '50%',
  border: 0,
  outline: 0,
  opacity: 0,
  cursor: 'pointer',
  color: '#ffffff',
  backgroundColor: colorPrimary,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  selectors: {
    [`${formItemShell}:hover &`]: {
      opacity: 1,
    },
  },
});

export const addFieldDivider = style({
  position: 'absolute',
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
  marginBlock: 'auto',
  height: '6px',
  borderRadius: '9999px',
  backgroundColor: colorPrimary,
});

export const fieldActions = style({
  flex: '0 0 auto',
  marginTop: 4,
  opacity: 0,
  transition: transitionFast,
  selectors: {
    [`${formItemShell}:hover &`]: {
      opacity: 1,
    },
  },
});

export const deleteFieldButton = style({
  all: 'unset',
  width: 24,
  height: 24,
  borderRadius: radiusSmall,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: colorTextSecondary,
  cursor: 'pointer',
  padding: space1,
  transition: transitionFast,
  selectors: {
    '&:hover': {
      color: colorError,
      backgroundColor: colorBgContainer,
    },
  },
});
