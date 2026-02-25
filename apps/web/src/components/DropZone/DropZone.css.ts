import { style } from '@vanilla-extract/css';
import { fontSizeBase } from '@/styles/tokens.css';

export const menuList = style({
  listStyle: 'none',
  margin: 0,
  padding: 0,
  overflowY: 'auto',
});

export const menuItem = style({
  padding: 0,
  margin: 0,
  listStyle: 'none',
});

export const menuButton = style({
  cursor: 'pointer',
  padding: '4px 12px',
  fontSize: fontSizeBase,
  border: 'none',
  background: 'transparent',
  textAlign: 'left',
  width: '100%',
});
