import { globalStyle, style } from '@vanilla-extract/css';

export const setAsPkButton = style({
  position: 'absolute',
  right: 4,
  top: 'auto',
  bottom: 'auto',
  visibility: 'hidden',
});

// Ant Design table cell hover behavior
globalStyle(`.ant-table-cell:hover .${setAsPkButton}`, {
  visibility: 'visible',
});

export const actionsRow = style({
  marginBottom: 12,
});

export const fullWidth = style({
  width: '100%',
});
