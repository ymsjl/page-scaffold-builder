import { style } from '@vanilla-extract/css';
import {
  colorBgBase,
  colorBorderSecondary,
  colorPrimary,
  radiusSmall,
  shadowBase,
  transitionFast,
} from '@/styles/tokens.css';

export const wrapper = style({
  all: 'unset',
  display: 'block',
  position: 'relative',
  padding: 2,
  borderRadius: radiusSmall,
  border: '1px dashed transparent',
  transition: transitionFast,
  selectors: {
    '&:hover': {
      borderColor: colorPrimary,
      backgroundColor: 'rgba(24, 144, 255, 0.06)',
    },
  },
});

export const actions = style({
  display: 'none',
  position: 'absolute',
  top: '-10px',
  right: '-10px',
  gap: 4,
  background: colorBgBase,
  border: `1px solid ${colorBorderSecondary}`,
  borderRadius: radiusSmall,
  boxShadow: shadowBase,
  selectors: {
    // show actions when wrapper is hovered
    [`${wrapper}:hover &`]: {
      display: 'inline-flex',
    },
  },
});

export const content = style({});
