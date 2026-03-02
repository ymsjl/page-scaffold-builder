import { style } from '@vanilla-extract/css';
import {
  colorBgBase,
  colorBorder,
  colorPrimary,
  radiusSmall,
  radiusLarge,
  shadowHover,
  space2,
  space3,
  space4,
} from '@/styles/tokens.css';

export const builder = style({
  display: 'flex',
  flexDirection: 'column',
  height: '100vh',
});

export const header = style({
  background: colorBgBase,
  borderBottom: `1px solid ${colorBorder}`,
  padding: `0 ${space4}px`,
  display: 'flex',
  alignItems: 'center',
});

export const main = style({
  flex: 1,
  minHeight: 0,
});

export const sider = style({
  background: 'none',
  padding: `${space4}px ${space2}px`,
});

export const card = style({
  marginTop: space4,
  borderRadius: radiusLarge,
});

export const fullWidth = style({
  width: '100%',
});

export const rowButton = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  background: 'transparent',
  border: 'none',
  padding: 0,
  cursor: 'pointer',
});

export const content = style({
  height: '100%',
  overflow: 'hidden',
  padding: `${space4}px ${space3}px`,
});

export const testWrapper = style({
  marginTop: space3,
});

export const dragPreview = style({
  padding: `${space2}px ${space3}px`,
  background: colorBgBase,
  border: `1px solid ${colorPrimary}`,
  borderRadius: radiusSmall,
  boxShadow: shadowHover,
  display: 'flex',
  alignItems: 'center',
  gap: space2,
});

export const holderIcon = style({
  color: colorPrimary,
});
