import { style } from '@vanilla-extract/css';

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
