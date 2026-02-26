import { style } from '@vanilla-extract/css';
import {
  colorBgBase,
  colorBgContainer,
  colorBorderSecondary,
  colorError,
  colorTextSecondary,
  radiusSmall,
  radiusLarge,
  fontSizeBase,
  space8,
} from '@/styles/tokens.css';

export const emptyState = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  color: colorTextSecondary,
  fontSize: fontSizeBase,
  backgroundColor: colorBgContainer,
  border: `4px solid ${colorBorderSecondary}`,
  borderRadius: radiusLarge,
});

export const errorState = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  color: colorError,
  fontSize: fontSizeBase,
  backgroundColor: '#fff2f0',
  border: '1px solid #ffccc7',
  borderRadius: radiusSmall,
});

export const container = style({
  padding: space8,
  height: '100%',
  overflow: 'auto',
  backgroundColor: colorBgContainer,
  border: `4px solid ${colorBorderSecondary}`,
  borderRadius: radiusLarge,
  position: 'relative',
});

export const finalContainer = style({
  height: '100%',
  overflow: 'auto',
  backgroundColor: colorBgBase,
  position: 'relative',
});

export const toolbar = style({
  position: 'fixed',
  bottom: 72,
  right: 0,
  left: 0,
  margin: '0 auto',
  width: 'max-content',
  zIndex: 20,
});

export const toolbarContainer = style({
  background: 'rgba(255, 255, 255, 0.95)',
  border: '1px solid rgba(0, 0, 0, 0.08)',
  borderRadius: 9999,
  padding: 8,
});
