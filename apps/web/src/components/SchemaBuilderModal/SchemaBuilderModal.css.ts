import { style } from '@vanilla-extract/css';
import { colorPrimary, radiusSmall, shadowPrimaryLight, transitionFast } from '@/styles/tokens.css';

export const fullWidth = style({
  width: '100%',
});

export const dragHandle = style({
  cursor: 'grab',
  display: 'flex',
  alignItems: 'center',
});

export const dragIcon = style({
  fontSize: 16,
  color: '#999',
});

export const fieldTitle = style({
  flex: 1,
});

export const sortableItem = style({
  borderRadius: radiusSmall,
  transition: transitionFast,
});

export const sortableItemActive = style({
  outline: `1px solid ${colorPrimary}`,
  boxShadow: shadowPrimaryLight,
  backgroundColor: 'rgba(24, 144, 255, 0.06)',
});
