import { style } from '@vanilla-extract/css';
import {
  colorBorder,
  colorBorderSecondary,
  radiusMedium,
  space2,
  space3,
  transitionFast,
} from '@/styles/tokens.css';

export const card = style({
  width: '100%',
});

export const section = style({
  minHeight: 32,
});

export const title = style({
  display: 'flex',
  alignItems: 'center',
  gap: space2,
  flexWrap: 'wrap',
  minHeight: 24,
});

export const body = style({
  display: 'flex',
  flexDirection: 'column',
  gap: space2,
});

export const footer = style({
  marginTop: space3,
  paddingTop: space3,
  borderTop: `1px solid ${colorBorderSecondary}`,
  display: 'flex',
  alignItems: 'center',
  gap: space2,
  flexWrap: 'wrap',
});

export const slotItem = style({
  borderRadius: radiusMedium,
  transition: transitionFast,
  selectors: {
    '&:hover': {
      outline: `1px dashed ${colorBorder}`,
    },
  },
});
