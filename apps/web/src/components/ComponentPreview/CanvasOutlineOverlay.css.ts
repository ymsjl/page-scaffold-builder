import { style, styleVariants } from '@vanilla-extract/css';
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
  pointerEvents: 'none',
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
