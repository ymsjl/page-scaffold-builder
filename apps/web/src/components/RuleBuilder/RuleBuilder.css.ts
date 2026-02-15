import { style } from '@vanilla-extract/css';

export const fullWidth = style({
  width: '100%',
});

export const canvasCard = style({
  minHeight: 260,
});

export const canvasContainer = style({
  borderRadius: 8,
  padding: 4,
});

export const deleteButton = style({
  background: 'none',
  border: 'none',
  cursor: 'pointer',
});

export const ruleMessage = style({
  fontSize: 12,
  display: 'block',
  marginBottom: 6,
});
