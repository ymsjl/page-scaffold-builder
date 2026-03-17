import { globalStyle, style, styleVariants } from '@vanilla-extract/css';
import { colorPrimary, radiusSmall } from '@/styles/tokens.css';

export const overlayRoot = style({
  position: 'fixed',
  inset: 0,
  pointerEvents: 'none',
  zIndex: 1000,
});

export const outline = style({
  position: 'fixed',
  boxSizing: 'border-box',
  borderRadius: radiusSmall,
  transition: 'top 0.12s ease, left 0.12s ease, width 0.12s ease, height 0.12s ease',
});

export const outlineVariant = styleVariants({
  hoverDefault: {
    border: `1px solid rgba(24, 144, 255, 0.7)`,
    boxShadow: '0 0 0 1px rgba(24, 144, 255, 0.14)',
  },
  hoverSubtle: {
    border: '1px solid rgba(24, 144, 255, 0.45)',
    boxShadow: '0 0 0 1px rgba(24, 144, 255, 0.08)',
  },
  selectedDefault: {
    border: `2px solid ${colorPrimary}`,
    boxShadow: '0 0 0 1px rgba(24, 144, 255, 0.18)',
  },
  selectedSubtle: {
    border: `1px solid ${colorPrimary}`,
    boxShadow: '0 0 0 1px rgba(24, 144, 255, 0.14)',
  },
});

export const addBtn = style({
  all: 'unset',
  position: 'absolute',
  borderRadius: '9999px',
  backgroundColor: colorPrimary,
  transform: 'translateY(-50%)',
  color: '#fff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 12,
  cursor: 'pointer',
  zIndex: 9999,
  pointerEvents: 'auto',
});

export const addBtnVariant = styleVariants({
  horizontal: {
    left: '50%',
    right: 'auto',
    transform: 'translateX(-50%)',
    bottom: -10,
    width: '50%',
    height: 20,
    maxWidth: '80px',
  },
  vertical: {
    right: -10,
    top: '50%',
    bottom: 'auto',
    transform: 'translateY(-50%)',
    width: 20,
    height: '50%',
    maxHeight: '80px',
  },
});

export const addOverlay = style({});

globalStyle(`${addOverlay} .ant-dropdown-menu`, {
  border: `2px solid ${colorPrimary}`,
});

globalStyle(`${addOverlay} .ant-dropdown-menu .ant-dropdown-menu-submenu-title`, {
  color: '#ffffff',
});
