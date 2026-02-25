import { style } from '@vanilla-extract/css';
import {
  colorBorder,
  colorPrimary,
  colorError,
  colorTextTertiary,
  fontWeightSemibold,
} from '@/styles/tokens.css';

export const indicatorLineContainer = style({
  position: 'relative',
  marginBlock: '16px',
  width: '100%',
  height: '100%',
});

export const indicatorIconContainer = style({
  position: 'absolute',
  bottom: 0,
});

export const dropZoneInvalid = style({
  borderColor: colorError,
  backgroundColor: 'rgba(255, 77, 79, 0.12)',
  boxShadow: '0 6px 14px rgba(255, 77, 79, 0.3)',
});

export const indicatorIcon = style({
  position: 'absolute',
  zIndex: 99999,
  width: '28px',
  height: '28px',
  border: `3px solid ${colorBorder}`,
  borderRadius: '50% 50% 0 50%',
  backgroundColor: '#f5f7fb',
  boxShadow: '0 4px 10px rgba(15, 23, 42, 0.12)',

  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '16px',
  fontWeight: fontWeightSemibold,
  color: colorTextTertiary,
  lineHeight: 1,
  userSelect: 'none',
  transformOrigin: 'center',
});

// 额外方向/指示线样式
export const indicatorIconContainerRight = style({
  // droplet 朝右（用于：容器为 vertical，指示线为水平，水滴在左侧）
});

export const indicatorIconSide = style({
  // 水滴在侧边（用于：容器为 vertical，指示线为水平，水滴在左侧）
  top: '50%',
  transform: 'translate3d(-50%, -50%, 0) rotate(-45deg)',
});

export const indicatorIconContainerTop = style({
  // droplet 朝下（用于：容器为 horizontal，指示线为垂直，水滴在顶部）
  transform: 'translateY(-100%)',
});
export const indicatorIconTop = style({
  // 水滴在顶部（用于：容器为 horizontal，指示线为垂直，水滴在顶部）
  top: '0',
  transform: 'translate3d(-50%, -50%, 0) rotate(45deg)',
});

export const dropZoneLine = style({
  position: 'absolute',
  borderRadius: '2px',
  pointerEvents: 'none',
  transition: 'border-color 0.18s ease, transform 0.18s ease',
});

export const dropZoneLineVertical = style({
  // 垂直线：长度由 --dz-line-length 控制
  width: 0,
  height: 'var(--dz-line-length, 100%)',
  borderLeft: `2px dashed ${colorBorder}`,
  top: '0',
  left: '50%',
  transform: 'translateX(-50%)',
});

export const dropZoneLineHorizontal = style({
  // 水平线：长度由 --dz-line-length 控制
  height: 0,
  width: 'var(--dz-line-length, 100%)',
  borderBottom: `2px dashed ${colorBorder}`,
  top: '50%',
  left: '0',
  transform: 'translateY(-50%)',
});

export const dropZoneLineActive = style({
  borderLeftColor: colorPrimary,
  borderBottomColor: colorPrimary,
});

export const dropZoneLineInvalid = style({
  borderLeftColor: colorError,
  borderBottomColor: colorError,
});

export const dropZoneLineDragging = style({
  borderLeftColor: '#91caff',
  borderBottomColor: '#91caff',
});
