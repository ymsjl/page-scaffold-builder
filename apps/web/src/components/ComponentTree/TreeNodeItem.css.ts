import { style } from '@vanilla-extract/css';
import { colorTextSecondary, fontSizeSmall } from '@/styles/tokens.css';

export const root = style({
  padding: 4,
});

export const row = style({
  display: 'flex',
  alignItems: 'center',
  cursor: 'pointer',
});

export const handle = style({
  cursor: 'grab',
  paddingInline: 4,
  display: 'flex',
  alignItems: 'center',
});

export const handleGrabbing = style({
  cursor: 'grabbing',
});

export const handleIcon = style({
  color: colorTextSecondary,
  fontSize: fontSizeSmall,
});

export const nameContainer = style({
  flex: 1,
});

export const actionsSpace = style({
  display: 'flex',
  gap: 4,
});
