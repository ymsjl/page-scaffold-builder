import { style } from '@vanilla-extract/css';
import {
  colorBorder,
  colorPrimary,
  colorError,
  colorTextTertiary,
  fontSizeSmall,
  fontSizeBase,
  fontWeightSemibold,
} from '@/styles/tokens.css';

export const dropZone = style({
  position: 'absolute',
  width: '28px',
  height: '28px',
  top: 0,
  border: `1.5px solid ${colorBorder}`,
  borderRadius: '50% 50% 50% 0',
  backgroundColor: '#f5f7fb',
  boxShadow: '0 4px 10px rgba(15, 23, 42, 0.12)',
  transform: 'rotate(-45deg)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition:
    'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease, background-color 0.2s ease',
});

export const dropZoneDragging = style({
  borderColor: '#91caff',
  backgroundColor: '#e6f4ff',
  transform: 'rotate(-45deg) scale(1.05)',
});

export const dropZoneActive = style({
  borderColor: colorPrimary,
  backgroundColor: 'rgba(22, 119, 255, 0.15)',
  boxShadow: '0 6px 14px rgba(22, 119, 255, 0.35)',
});

export const dropZoneInvalid = style({
  borderColor: colorError,
  backgroundColor: 'rgba(255, 77, 79, 0.12)',
  boxShadow: '0 6px 14px rgba(255, 77, 79, 0.3)',
});

export const dropZoneLabel = style({
  position: 'absolute',
  top: 'calc(100% + 6px)',
  left: '50%',
  transform: 'translateX(-50%) rotate(45deg)',
  fontSize: fontSizeSmall,
  whiteSpace: 'nowrap',
});

export const dropZoneIcon = style({
  transform: 'rotate(45deg)',
  fontSize: '16px',
  fontWeight: fontWeightSemibold,
  color: colorTextTertiary,
  lineHeight: 1,
  userSelect: 'none',
});

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
