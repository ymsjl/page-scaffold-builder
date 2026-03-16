import { globalStyle, style } from '@vanilla-extract/css';
import {
  colorPrimary,
  fontSizeBase,
  radiusSmall,
  space1,
  space2,
  transitionFast,
} from '@/styles/tokens.css';

export const formItemShell = style({
  position: 'relative',
  display: 'flex',
  gap: space2,
  width: '100%',
  selectors: {
    '&:hover': {
      zIndex: 1,
    },
    '&[data-alt-drag-ready="true"]': {
      cursor: 'move',
    },
  },
});

globalStyle(`${formItemShell}[data-alt-drag-ready="true"] *`, {
  cursor: 'move',
});

export const formItemDragging = style({
  opacity: 0.6,
});

export const dragHint = style({
  position: 'absolute',
  top: 6,
  left: 8,
  padding: '2px 6px',
  borderRadius: radiusSmall,
  backgroundColor: colorPrimary,
  color: '#ffffff',
  fontSize: fontSizeBase,
  lineHeight: 1.2,
  opacity: 0,
  pointerEvents: 'none',
  transition: transitionFast,
  selectors: {
    [`${formItemShell}:hover &`]: {
      opacity: 1,
    },
    [`${formItemShell}[data-alt-drag-ready="true"] &`]: {
      opacity: 1,
    },
  },
});

export const dragHintActive = style({
  backgroundColor: colorPrimary,
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
  margin: 'auto auto',
  left: 0,
  right: 0,
  width: 28,
  height: 28,
  borderRadius: '50%',
  border: '2px solid #ffffff',
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
  height: '1px',
  borderTop: `2px dashed ${colorPrimary}`,
  borderRadius: '9999px',
});

export const fieldActions = style({
  position: 'absolute',
  top: 0,
  bottom: 0,
  left: '100%',
  flex: '0 0 auto',
  marginTop: 4,
  opacity: 0,
  backgroundColor: colorPrimary,
  borderRadius: '0 6px 6px 0',
  borderLeft: '0px',
  transition: transitionFast,
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  color: '#ffffff',
  selectors: {
    [`${formItemShell}:hover &`]: {
      opacity: 1,
    },
  },
});

export const actionButton = style({
  all: 'unset',
  width: 24,
  height: 24,
  borderRadius: radiusSmall,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  padding: space1,
  transition: transitionFast,
});
