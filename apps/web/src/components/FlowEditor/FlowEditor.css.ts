import { globalStyle, style } from '@vanilla-extract/css';
import {
  colorBgBase,
  colorBgContainer,
  colorBorder,
  colorTextBase,
  colorTextSecondary,
  radiusLarge,
  radiusSmall,
  shadowBase,
  fontSizeBase,
  fontSizeLarge,
  fontWeightSemibold,
  space4,
} from '@/styles/tokens.css';

// 流程编辑器布局
export const flowEditorLayout = style({
  width: '100%',
  height: '100%',
  background: colorBgContainer,
});

export const flowEditorSider = style({
  background: colorBgBase,
  height: '100%',
  overflow: 'hidden',
});

export const flowEditorContent = style({
  height: '100%',
  position: 'relative',
});

// 流程编辑器容器
export const flowEditorContainer = style({
  width: '100%',
  height: '100%',
  position: 'relative',
  background: colorBgContainer,
});

// 信息面板
export const flowInfoPanel = style({
  background: colorBgBase,
  padding: space4,
  borderRadius: radiusLarge,
  boxShadow: shadowBase,
  minWidth: 200,
});

globalStyle(`${flowInfoPanel} h3`, {
  margin: '0 0 12px 0',
  fontSize: fontSizeLarge,
  fontWeight: fontWeightSemibold,
  color: colorTextBase,
});

export const flowStats = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  fontSize: fontSizeBase,
  color: colorTextSecondary,
});

globalStyle(`${flowStats} span`, {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
});

// React Flow 样式覆盖
globalStyle('.react-flow__attribution', {
  fontSize: 10,
  opacity: 0.5,
});

globalStyle('.react-flow__controls', {
  boxShadow: shadowBase,
});

globalStyle('.react-flow__minimap', {
  border: `1px solid ${colorBorder}`,
  borderRadius: radiusSmall,
  boxShadow: shadowBase,
});

// 面板按钮组
globalStyle('.react-flow__panel', {
  margin: space4,
});

globalStyle('.react-flow__panel .ant-space-vertical', {
  gap: 8,
});

globalStyle('.react-flow__panel .ant-btn', {
  width: 100,
});
