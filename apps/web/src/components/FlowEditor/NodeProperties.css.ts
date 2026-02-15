import { globalStyle, style } from '@vanilla-extract/css';
import {
  colorBgBase,
  colorBorderSecondary,
  colorTextBase,
  colorTextDisabled,
  fontSizeBase,
  fontSizeLarge,
  fontWeightSemibold,
  space4,
} from '@/styles/tokens.css';

// 节点属性面板容器
export const nodeProperties = style({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  background: colorBgBase,
  borderLeft: `1px solid ${colorBorderSecondary}`,
});

// 头部
export const nodePropertiesHeader = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: space4,
});

globalStyle(`${nodePropertiesHeader} h3`, {
  margin: 0,
  fontSize: fontSizeLarge,
  fontWeight: fontWeightSemibold,
  color: colorTextBase,
});

// 表单
export const nodePropertiesForm = style({
  flex: 1,
  overflowY: 'auto',
  padding: `0 ${space4}px`,
});

globalStyle(`${nodePropertiesForm} .ant-form-item`, {
  marginBottom: space4,
});

globalStyle(`${nodePropertiesForm} .ant-divider`, {
  margin: `${space4}px 0`,
});

// 底部
export const nodePropertiesFooter = style({
  padding: space4,
  borderTop: `1px solid ${colorBorderSecondary}`,
});

// 空状态
export const nodePropertiesEmpty = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  color: colorTextDisabled,
});

globalStyle(`${nodePropertiesEmpty} p`, {
  margin: 0,
  fontSize: fontSizeBase,
});
