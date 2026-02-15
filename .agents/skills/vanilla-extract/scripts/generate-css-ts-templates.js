#!/usr/bin/env node
// Generate simple `*.css.ts` templates from `.css` files by extracting class selectors.
// Usage: node generate-css-ts-templates.js [path/to/file.css]  (default: scan all .css under apps/web/src)

const fs = require('fs');
const path = require('path');

const target = process.argv[2] || 'apps/web/src';

function camelCase(name) {
  return name.replace(/-([a-z])/g, (_, g) => g.toUpperCase()).replace(/^\./, '').replace(/[^a-zA-Z0-9_]/g, '');
}

function processCssFile(file) {
  const dir = path.dirname(file);
  const base = path.basename(file, path.extname(file));
  const outFile = path.join(dir, `${base}.css.ts`);
  if (fs.existsSync(outFile)) {
    console.log('Skipped (exists):', outFile);
    return;
  }

  const content = fs.readFileSync(file, 'utf8');
  const classNames = new Set();
  const regex = /\.([a-zA-Z0-9_\-]+)/g;
  let m;
  while ((m = regex.exec(content))) {
    classNames.add(m[1]);
  }

  if (classNames.size === 0) {
    console.log('No classes found in', file);
    return;
  }

  const imports = `import { style } from '@vanilla-extract/css';\n\n`;
  const exports = Array.from(classNames)
    .map((cn) => `export const ${camelCase(cn)} = style({ /* TODO: migrate from ${cn} in ${path.basename(file)} */ });`)
    .join('\n\n');

  fs.writeFileSync(outFile, imports + exports, 'utf8');
  console.log('Generated:', outFile);
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === 'node_modules' || e.name === '.git') continue;
      walk(full);
    } else {
      if (full.endsWith('.css') || full.endsWith('.scss') || full.endsWith('.less')) {
        processCssFile(full);
      }
    }
  }
}

if (fs.existsSync(target) && fs.statSync(target).isDirectory()) {
  walk(target);
} else if (fs.existsSync(target)) {
  processCssFile(target);
} else {
  console.error('Target not found:', target);
  process.exit(1);
}
