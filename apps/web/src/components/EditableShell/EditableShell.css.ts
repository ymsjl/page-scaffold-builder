import { globalStyle, style } from '@vanilla-extract/css';
import {
  colorBgBase,
  colorBorderSecondary,
  radiusSmall,
  shadowBase,
  transitionFast,
} from '@/styles/tokens.css';

export const shell = style({
  all: 'unset',
  display: 'block',
  position: 'relative',
  transition: transitionFast,
  selectors: {
    '&[data-disabled="true"]': {
      cursor: 'default',
    },
  },
});

export const content = style({
  minWidth: 0,
});

export const toolbar = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
  padding: 2,
  background: colorBgBase,
  border: `1px solid ${colorBorderSecondary}`,
  borderRadius: radiusSmall,
  boxShadow: shadowBase,
});

export const toolbarPopoverOverlay = style({});

globalStyle(`${toolbarPopoverOverlay} .ant-popover-inner`, {
  padding: 0,
  background: 'transparent',
  boxShadow: 'none',
});

globalStyle(`${toolbarPopoverOverlay} .ant-popover-inner-content`, {
  padding: 0,
});

export const dragHandle = style({
  position: 'absolute',
  top: '-10px',
  left: '-10px',
  zIndex: 2,
});

export const placeholder = style({
  minHeight: 16,
});
