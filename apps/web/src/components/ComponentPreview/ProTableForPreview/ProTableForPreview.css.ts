import { style } from '@vanilla-extract/css';
import {
  colorPrimary,
  colorTextSecondary,
  colorTextDisabled,
  radiusSmall,
  transitionFast,
  fontSizeBase,
  space2,
} from '@/styles/tokens.css';

export const tableCell = style({
  transition: transitionFast,
});

export const tableCellActive = style({
  opacity: 0.5,
});

export const tableCellPlaceholder = style({
  opacity: 0.4,
  borderInline: `1px solid ${colorPrimary}`,
  backgroundColor: 'rgba(22, 119, 255, 0.06)',
});

export const tableHeader = style({
  selectors: {
    '&[data-dragging]': { position: 'relative', zIndex: 9999, userSelect: 'none' },
  },
});

export const headerContent = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  width: '100%',
});

export const handle = style({
  all: 'unset',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 20,
  height: 20,
  borderRadius: radiusSmall,
  color: colorTextSecondary,
  background: 'transparent',
  transition: transitionFast,
  cursor: 'grab',
  flex: '0 0 auto',
});

export const handleDisabled = style({
  color: colorTextDisabled,
  cursor: 'default',
});

export const handleDragging = style({
  background: 'rgba(22, 119, 255, 0.15)',
  cursor: 'grabbing',
});

export const handleIcon = style({
  fontSize: fontSizeBase,
});

export const headerTitle = style({
  flex: 1,
  minWidth: 0,
});

export const slotWrapper = style({
  display: 'flex',
  gap: space2,
  flexWrap: 'wrap',
});

export const dropdownOverlay = style({
  minWidth: 160,
});

export const titleContainer = style({
  all: 'unset',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  height: '100%',
  padding: '4px 6px',
  borderRadius: radiusSmall,
  transition: transitionFast,
});

export const inputAutoWidth = style({
  width: 'auto',
});

// DragOverlay 样式
export const dragOverlay = style({
  zIndex: 9999,
});

export const dragPreview = style({
  backgroundColor: '#f0f5ff',
  padding: 12,
  fontWeight: 'bold',
  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
  border: '1px solid rgba(22, 119, 255, 0.35)',
  cursor: 'grabbing',
  position: 'relative',
});

export const dragHint = style({
  position: 'absolute',
  top: '-12px',
  left: '50%',
  transform: 'translate3d(-50%, -100%, 0)',
  fontSize: 12,
  borderRadius: '10px',
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  padding: '4px 8px',
  whiteSpace: 'nowrap',
  border: '1px solid rgba(22, 119, 255, 0.15)',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
});

export const dragContent = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  opacity: 0.85,
});

export const dragIcon = style({
  fontSize: 14,
  color: '#1677ff',
});
