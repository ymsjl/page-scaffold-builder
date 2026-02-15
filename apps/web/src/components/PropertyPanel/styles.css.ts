import { style } from '@vanilla-extract/css';

export const emptyState = style({
  border: '1px solid #e8e8e8',
  borderRadius: 4,
  background: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  color: '#999',
});

export const noConfig = style({
  borderRadius: 4,
  background: 'white',
  padding: 24,
  textAlign: 'center',
  color: '#999',
});

export const formContainer = style({
  height: '100%',
  overflowY: 'auto',
});

export const fullWidth = style({
  width: '100%',
});

export const listItem = style({
  padding: '4px 0',
});

export const justifyStart = style({
  justifyContent: 'flex-start',
});

export const flex1 = style({
  flex: 1,
});

export const schemaListFormItem = style({
  selectors: {
    '& label': { width: '100%' },
  },
});

export const fullWidthInput = style({
  width: '100%',
});

export const cardRounded = style({
  borderRadius: 8,
});

export const cardRoundedWithMargin = style({
  borderRadius: 8,
  marginTop: 12,
});

export const smallNote = style({
  fontSize: 12,
  display: 'block',
  marginTop: 4,
});
