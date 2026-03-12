import { style } from '@vanilla-extract/css';
import {
  colorBgBase,
  colorBorderSecondary,
  colorPrimary,
  radiusSmall,
  shadowBase,
  shadowPrimaryLight,
  transitionFast,
} from '@/styles/tokens.css';

export const shell = style({
  all: 'unset',
  display: 'block',
  position: 'relative',
  padding: 2,
  borderRadius: radiusSmall,
  border: '1px dashed transparent',
  transition: transitionFast,
  selectors: {
    '&[data-highlighted="true"]:hover': {
      borderColor: colorPrimary,
      backgroundColor: 'rgba(24, 144, 255, 0.06)',
    },
    '&[data-selected="true"]': {
      borderColor: colorPrimary,
      boxShadow: shadowPrimaryLight,
      backgroundColor: 'rgba(24, 144, 255, 0.08)',
    },
    '&[data-disabled="true"]': {
      cursor: 'default',
    },
  },
});

export const content = style({
  minWidth: 0,
});

export const toolbar = style({
  display: 'none',
  position: 'absolute',
  top: '-10px',
  right: '-10px',
  gap: 4,
  background: colorBgBase,
  border: `1px solid ${colorBorderSecondary}`,
  borderRadius: radiusSmall,
  boxShadow: shadowBase,
  zIndex: 2,
  selectors: {
    [`${shell}:hover &`]: {
      display: 'inline-flex',
    },
    [`${shell}[data-selected="true"] &`]: {
      display: 'inline-flex',
    },
  },
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
