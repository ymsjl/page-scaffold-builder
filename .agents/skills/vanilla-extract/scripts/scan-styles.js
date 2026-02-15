#!/usr/bin/env node
// Simple scanner to find CSS / inline styles in a project and produce a migration report.
// Usage: node scan-styles.js --path <folder>

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const baseArgIndex = args.indexOf('--path');
const basePath = (baseArgIndex !== -1 && args[baseArgIndex + 1]) || 'apps/web/src';

const exts = ['.css', '.scss', '.less'];
const codeExts = ['.tsx', '.jsx', '.ts', '.js'];

function walk(dir, cb) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === 'node_modules' || e.name === '.git') continue;
      walk(full, cb);
    } else {
      cb(full);
    }
  }
}

const report = { cssFiles: [], inlineStyleFiles: [], cssImports: [] };

if (!fs.existsSync(basePath)) {
  console.error('Path not found:', basePath);
  process.exit(1);
}

walk(basePath, (file) => {
  const ext = path.extname(file).toLowerCase();
  try {
    const content = fs.readFileSync(file, 'utf8');
    if (exts.includes(ext)) {
      report.cssFiles.push(file);
    }

    if (codeExts.includes(ext)) {
      if (/style=\s*\{\s*\{/.test(content) || /style=\s*\{\s*\w+:/.test(content)) {
        report.inlineStyleFiles.push(file);
      }

      if (/import\s+['\"][^'\"]+\.(css|scss|less)['\"]/.test(content)) {
        report.cssImports.push(file);
      }
    }
  } catch (err) {
    // ignore
  }
});

const out = {
  summary: {
    cssFiles: report.cssFiles.length,
    inlineStyleFiles: report.inlineStyleFiles.length,
    cssImports: report.cssImports.length,
  },
  examples: {
    cssFiles: report.cssFiles.slice(0, 30),
    inlineStyleFiles: report.inlineStyleFiles.slice(0, 30),
    cssImports: report.cssImports.slice(0, 30),
  },
};

const outPath = path.join(process.cwd(), '.vanilla-extract-scan.json');
fs.writeFileSync(outPath, JSON.stringify(out, null, 2), 'utf8');
console.log('Scan complete — report written to', outPath);
console.table(out.summary);
console.log('Examples written to report file.');
