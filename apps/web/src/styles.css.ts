import { globalStyle } from '@vanilla-extract/css';

globalStyle('html, body, #root', {
  height: '100%',
});

globalStyle('body', {
  margin: 0,
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
});

globalStyle('.ant-layout', {
  minHeight: '100%',
});
