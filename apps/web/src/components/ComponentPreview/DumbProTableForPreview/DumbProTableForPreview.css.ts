import { style } from '@vanilla-extract/css';
import {
  colorBgBase,
  colorBgContainer,
  colorBorder,
  colorBorderSecondary,
  colorPrimary,
  colorTextBase,
  colorTextDisabled,
  colorTextSecondary,
  fontSizeBase,
  fontSizeHeading,
  fontSizeSmall,
  fontWeightMedium,
  fontWeightSemibold,
  radiusLarge,
  radiusMedium,
  radiusSmall,
  shadowBase,
  shadowPrimaryLight,
  space1,
  space2,
  space3,
  space4,
  transitionFast,
} from '@/styles/tokens.css';

export const root = style({
  display: 'grid',
  gap: space4,
  color: colorTextBase,
});

export const shellStretch = style({
  width: '100%',
});

export const surface = style({
  background: colorBgBase,
  border: `1px solid ${colorBorderSecondary}`,
  borderRadius: radiusLarge,
  boxShadow: shadowBase,
  overflow: 'hidden',
});

export const header = style({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: space4,
  padding: `${space4}px ${space4}px ${space3}px`,
  borderBottom: `1px solid ${colorBorderSecondary}`,
  background: 'linear-gradient(180deg, rgba(24, 144, 255, 0.08) 0%, rgba(24, 144, 255, 0.02) 100%)',
});

export const titleBlock = style({
  minWidth: 0,
});

export const heading = style({
  margin: 0,
  fontSize: fontSizeHeading,
  fontWeight: fontWeightSemibold,
  lineHeight: 1.3,
});

export const caption = style({
  marginTop: space1,
  color: colorTextSecondary,
  fontSize: fontSizeSmall,
});

export const toolbarActions = style({
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'flex-end',
  gap: space2,
  minHeight: 32,
});

export const toolbarPlaceholder = style({
  display: 'inline-flex',
  alignItems: 'center',
  paddingInline: space3,
  minHeight: 32,
  border: `1px dashed ${colorBorder}`,
  borderRadius: 999,
  color: colorTextDisabled,
  fontSize: fontSizeSmall,
  background: colorBgContainer,
});

export const section = style({
  padding: space4,
});

export const sectionHeader = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: space3,
});

export const sectionTitle = style({
  fontSize: fontSizeBase,
  fontWeight: fontWeightMedium,
});

export const sectionHint = style({
  color: colorTextSecondary,
  fontSize: fontSizeSmall,
});

export const searchGrid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: space3,
});

export const fieldShell = style({
  minHeight: 112,
});

export const fieldContent = style({
  display: 'grid',
  gap: space2,
});

export const fieldLabelRow = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: space2,
  minWidth: 0,
});

export const labelButton = style({
  all: 'unset',
  display: 'inline-flex',
  alignItems: 'center',
  minWidth: 0,
  maxWidth: '100%',
  fontWeight: fontWeightMedium,
  color: colorTextBase,
  cursor: 'text',
  selectors: {
    '&:focus-visible': {
      outline: `2px solid ${colorPrimary}`,
      outlineOffset: 2,
      borderRadius: radiusSmall,
    },
  },
});

export const labelText = style({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

export const fieldMeta = style({
  display: 'inline-flex',
  alignItems: 'center',
  padding: `0 ${space2}px`,
  height: 22,
  borderRadius: 999,
  background: 'rgba(24, 144, 255, 0.08)',
  color: colorPrimary,
  fontSize: fontSizeSmall,
});

export const fieldControl = style({
  display: 'grid',
  gap: space2,
});

export const controlNote = style({
  color: colorTextSecondary,
  fontSize: fontSizeSmall,
});

export const tableWrap = style({
  overflowX: 'auto',
  border: `1px solid ${colorBorderSecondary}`,
  borderRadius: radiusMedium,
  background: colorBgBase,
});

export const columnsRow = style({
  display: 'flex',
  alignItems: 'stretch',
  minWidth: 'max-content',
  background: colorBgBase,
});

export const columnWrap = style({
  flex: '0 0 220px',
  minWidth: 220,
  borderRight: `1px solid ${colorBorderSecondary}`,
  selectors: {
    '&:last-child': {
      borderRight: 'none',
    },
  },
});

export const columnShell = style({
  height: '100%',
});

export const columnLane = style({
  position: 'relative',
  height: '100%',
  transition: transitionFast,
});

export const columnLaneActive = style({
  background: 'rgba(24, 144, 255, 0.04)',
});

export const bodyCell = style({
  padding: `${space3}px ${space2}px`,
  minHeight: 88,
  borderBottom: `1px solid ${colorBorderSecondary}`,
  transition: transitionFast,
  background: colorBgBase,
});

export const columnContent = style({
  display: 'grid',
  gridTemplateRows: 'auto 1fr',
  minHeight: 100,
});

export const headerShell = style({
  minHeight: 72,
  padding: space2,
  background: '#fafcff',
  borderBottom: `1px solid ${colorBorderSecondary}`,
});

export const headerContent = style({
  display: 'grid',
  gap: space2,
  minWidth: 0,
});

export const headerTitleButton = style({
  all: 'unset',
  display: 'block',
  minWidth: 0,
  cursor: 'text',
  selectors: {
    '&:focus-visible': {
      outline: `2px solid ${colorPrimary}`,
      outlineOffset: 2,
      borderRadius: radiusSmall,
    },
  },
});

export const headerTitleText = style({
  display: 'block',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  fontWeight: fontWeightMedium,
});

export const headerSubtext = style({
  color: colorTextSecondary,
  fontSize: fontSizeSmall,
});

export const valueText = style({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

export const slotContent = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: space2,
});

export const pagination = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: space2,
  padding: `${space3}px ${space4}px`,
  borderTop: `1px solid ${colorBorderSecondary}`,
  background: '#fcfcfc',
  color: colorTextSecondary,
  fontSize: fontSizeSmall,
});

export const pageBadge = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: 28,
  height: 28,
  paddingInline: space2,
  borderRadius: radiusMedium,
  border: `1px solid ${colorBorder}`,
  background: colorBgBase,
  color: colorTextBase,
});

export const pagerGroup = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: space2,
});

export const controlButton = style({
  width: 24,
  height: 24,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: radiusSmall,
  border: 'none',
  boxShadow: shadowPrimaryLight,
});

export const dragButton = style({
  cursor: 'grab',
});

export const dragButtonDragging = style({
  cursor: 'grabbing',
});

export const draggingShell = style({
  boxShadow: shadowPrimaryLight,
});

export const emptyState = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 120,
  border: `1px dashed ${colorBorder}`,
  borderRadius: radiusMedium,
  background: colorBgContainer,
  color: colorTextSecondary,
  fontSize: fontSizeSmall,
});

export const countText = style({
  color: colorTextSecondary,
  fontSize: fontSizeSmall,
});

export const inlineInput = style({
  width: '100%',
});

export const compactToolbar = style({
  display: 'inline-flex',
  gap: space1,
});

export const columnWidthHint = style({
  color: colorTextDisabled,
  fontSize: fontSizeSmall,
});

export const searchPanel = style({
  background: '#fcfdff',
});

export const dataPanel = style({
  background: colorBgBase,
});

export const headerPanel = style({
  background: colorBgBase,
});

export const selectedSummary = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: space2,
  color: colorTextSecondary,
  fontSize: fontSizeSmall,
});
