import { globalStyle, style } from '@vanilla-extract/css';
import {
  colorBgBase,
  colorBorderSecondary,
  colorPrimary,
  colorTextBase,
  colorTextSecondary,
  colorTextDisabled,
  radiusMedium,
  shadowPrimaryLight,
  transitionFast,
  fontSizeSmall,
  fontSizeBase,
  fontSizeLarge,
  fontWeightMedium,
  fontWeightSemibold,
  space2,
  space4,
  space8,
} from '@/styles/tokens.css';

// 节点库容器
export const nodeLibrary = style({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  background: colorBgBase,
  borderRight: `1px solid ${colorBorderSecondary}`,
});

// 节点库头部
export const nodeLibraryHeader = style({
  padding: space4,
  borderBottom: `1px solid ${colorBorderSecondary}`,
});

globalStyle(`${nodeLibraryHeader} h3`, {
  margin: '0 0 12px 0',
  fontSize: fontSizeLarge,
  fontWeight: fontWeightSemibold,
  color: colorTextBase,
});

// 节点库内容
export const nodeLibraryContent = style({
  flex: 1,
  overflowY: 'auto',
  padding: space2,
});

globalStyle(`${nodeLibraryContent} .ant-collapse`, {
  border: 'none',
  background: 'transparent',
});

globalStyle(`${nodeLibraryContent} .ant-collapse-item`, {
  border: 'none',
});

globalStyle(`${nodeLibraryContent} .ant-collapse-header`, {
  padding: '8px 16px !important',
  fontWeight: fontWeightMedium,
  color: colorTextBase,
});

globalStyle(`${nodeLibraryContent} .ant-collapse-content`, {
  border: 'none',
});

globalStyle(`${nodeLibraryContent} .ant-collapse-content-box`, {
  padding: 0,
});

// 节点列表
export const nodeList = style({
  display: 'flex',
  flexDirection: 'column',
  gap: space2,
  padding: space2,
});

// 节点卡片
export const nodeCard = style({
  cursor: 'move',
  transition: transitionFast,
  borderRadius: radiusMedium,
  ':hover': {
    borderColor: colorPrimary,
    boxShadow: shadowPrimaryLight,
    transform: 'translateY(-2px)',
  },
  ':active': {
    cursor: 'grabbing',
  },
});

globalStyle(`${nodeCard} .ant-card-body`, {
  padding: 12,
});

export const nodeCardContent = style({
  display: 'flex',
  alignItems: 'flex-start',
  gap: 12,
});

export const nodeCardIcon = style({
  fontSize: 24,
  flexShrink: 0,
});

export const nodeCardInfo = style({
  flex: 1,
  minWidth: 0,
});

export const nodeCardName = style({
  fontWeight: fontWeightMedium,
  fontSize: fontSizeBase,
  color: colorTextBase,
  marginBottom: 4,
});

export const nodeCardDescription = style({
  fontSize: fontSizeSmall,
  color: colorTextSecondary,
  lineHeight: 1.4,
});

// 空状态
export const nodeLibraryEmpty = style({
  textAlign: 'center',
  padding: `${space8}px ${space4}px`,
  color: colorTextDisabled,
});

globalStyle(`${nodeLibraryEmpty} p`, {
  margin: 0,
  fontSize: fontSizeBase,
});
