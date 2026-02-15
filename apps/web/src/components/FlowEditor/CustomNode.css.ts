import { globalStyle, style } from '@vanilla-extract/css';
import {
  colorBgBase,
  colorBorder,
  colorPrimary,
  colorTextBase,
  colorTextSecondary,
  colorTextTertiary,
  colorTextDisabled,
  colorSuccess,
  radiusLarge,
  radiusMedium,
  shadowBase,
  shadowHover,
  shadowPrimary,
  transitionBase,
  transitionFast,
  fontSizeSmall,
  fontSizeBase,
  fontWeightMedium,
  handleSize,
  handleSizeHover,
  borderWidthThick,
} from '@/styles/tokens.css';

// 自定义节点样式
export const customNode = style({
  background: colorBgBase,
  border: `${borderWidthThick} solid ${colorBorder}`,
  borderRadius: radiusLarge,
  minWidth: 180,
  maxWidth: 280,
  boxShadow: shadowBase,
  transition: transitionBase,
  ':hover': {
    boxShadow: shadowHover,
  },
});

export const customNodeSelected = style({
  borderColor: colorPrimary,
  boxShadow: shadowPrimary,
});

// 节点头部
export const customNodeHeader = style({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '8px 12px',
  borderRadius: `${radiusMedium}px ${radiusMedium}px 0 0`,
  color: 'white',
  fontWeight: fontWeightMedium,
  fontSize: fontSizeSmall,
});

export const customNodeIcon = style({
  fontSize: 16,
});

export const customNodeType = style({
  textTransform: 'capitalize',
});

// 节点主体
export const customNodeBody = style({
  padding: 12,
});

export const customNodeName = style({
  fontWeight: fontWeightMedium,
  fontSize: fontSizeBase,
  color: colorTextBase,
  marginBottom: 8,
  wordWrap: 'break-word',
});

export const customNodeParams = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  fontSize: fontSizeSmall,
  color: colorTextSecondary,
});

export const customNodeParam = style({
  display: 'flex',
  gap: 4,
});

export const paramKey = style({
  fontWeight: fontWeightMedium,
  color: colorTextTertiary,
  minWidth: 60,
});

export const paramValue = style({
  color: colorTextSecondary,
  flex: 1,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

export const customNodeParamMore = style({
  color: colorTextDisabled,
  fontStyle: 'italic',
  marginTop: 4,
});

// Handle 样式
export const handle = style({
  width: handleSize,
  height: handleSize,
  border: '2px solid white',
  transition: transitionFast,
  ':hover': {
    width: handleSizeHover,
    height: handleSizeHover,
  },
});

export const handleExec = style({
  background: colorPrimary,
  borderRadius: 2,
});

export const handleData = style({
  background: colorSuccess,
  borderRadius: '50%',
});

export const handleTopLeft = style({
  left: '30%',
});

export const handleTopRight = style({
  left: '70%',
});

// React Flow 连线样式覆盖
globalStyle('.react-flow__edge-path', {
  strokeWidth: 2,
});

globalStyle('.react-flow__edge.selected .react-flow__edge-path', {
  stroke: colorPrimary,
  strokeWidth: 3,
});

globalStyle('.react-flow__edge-text', {
  fontSize: 12,
});
