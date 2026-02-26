import { style } from '@vanilla-extract/css';
import {
  colorPrimary,
  colorTextDisabled,
  radiusSmall,
  transitionFast,
  fontSizeBase,
  space1,
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
  position: 'absolute',
  bottom: '100%',
  left: 0,
  right: 0,
  background: colorPrimary,
  color: '#ffffff',
  opacity: 0,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: 28,
  borderRadius: `6px 6px 0 0`,
  transition: transitionFast,
  cursor: 'grab',
  flex: '0 0 auto',
  selectors: {
    [`${tableHeader}:hover &`]: {
      opacity: 1,
    },
  },
});

export const handleDisabled = style({
  color: colorTextDisabled,
  cursor: 'default',
});

export const handleDragging = style({
  cursor: 'grabbing',
  zIndex: 9999,
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

// DragOverlay 样式
export const dragOverlay = style({
  zIndex: 9999,
});

export const dragPreview = style({
  backgroundColor: colorPrimary,
  padding: 12,
  fontWeight: 'bold',
  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
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
  backgroundColor: colorPrimary,
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

export const addColumnIndicatorLayout = style({
  position: 'absolute',
  top: 0,
  bottom: 0,
  width: '10px',
  zIndex: 999,
  right: 0,
  cursor: 'pointer',
  transform: 'translateX(50%)',
});

export const addColumnIndicator = style({
  width: '1px',
  height: '100%',
  marginInline: 'auto',

  borderLeft: `2px dashed ${colorPrimary}`,
  cursor: 'pointer',
  opacity: 0,

  selectors: {
    [`${tableHeader}:hover &`]: {
      opacity: 1,
    },
  },
});

export const addColumnButtonWrapper = style({
  position: 'absolute',
  zIndex: 999,
  top: 0,
  bottom: 0,
  height: '28px',
  marginBlock: 'auto',
  right: 0,
  transform: 'translateX(50%)',
});

export const addColumnButton = style({
  width: '28px',
  height: '28px',
  opacity: 0,
  cursor: 'pointer',
  outline: 'none',
  border: '2px solid currentColor',

  background: colorPrimary,
  color: '#ffffff',
  zIndex: 999,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',

  selectors: {
    [`${tableHeader}:hover &`]: {
      opacity: 1,
    },
  },
});

export const fieldActions = style({
  position: 'absolute',
  top: '100%',
  left: 0,
  right: 0,
  opacity: 0,
  zIndex: 999,
  backgroundColor: colorPrimary,
  borderRadius: '0 0 6px 6px',
  borderLeft: '0px',
  transition: transitionFast,
  display: 'flex',
  gap: 4,
  color: '#ffffff',
  selectors: {
    [`${tableHeader}:hover &`]: {
      opacity: 1,
    },
  },
});

export const actionButton = style({
  all: 'unset',
  width: 24,
  height: 24,
  borderRadius: radiusSmall,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  padding: space1,
  transition: transitionFast,
});
