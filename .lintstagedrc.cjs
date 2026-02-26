const path = require('path');

const toWebRelative = (filePath) => path.relative('apps/web', filePath);
const toArgs = (files) =>
  files
    .map(toWebRelative)
    .map((file) => file.replace(/\\/g, '/'))
    .map((file) => `"${file}"`)
    .join(' ');

module.exports = {
  'apps/web/**/*.{ts,tsx,js,jsx}': (files) => {
    const joined = toArgs(files);
    return [`pnpm -C apps/web exec eslint --fix -- ${joined}`];
  },
  'apps/web/**/*.{ts,tsx,js,jsx,json,md}': (files) => {
    const joined = toArgs(files);
    return [`pnpm -C apps/web exec prettier --write -- ${joined}`];
  },
};
