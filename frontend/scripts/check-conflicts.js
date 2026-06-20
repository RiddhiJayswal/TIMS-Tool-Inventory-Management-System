import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const root = resolve(process.cwd(), '..');
const ignoredDirs = new Set(['.git', '.pytest_cache', '__pycache__', 'node_modules', 'dist', 'vendor']);
const markerPattern = /^(<<<<<<<|=======|>>>>>>>)(?:\s|$)/m;
const matches = [];

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    if (ignoredDirs.has(entry)) continue;
    const path = join(dir, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) {
      walk(path);
      continue;
    }
    if (!/\.(js|jsx|ts|tsx|css|html|json|md|yml|yaml|py|sh|txt)$/.test(entry)) continue;
    const content = readFileSync(path, 'utf8');
    if (markerPattern.test(content)) {
      matches.push(relative(root, path));
    }
  }
}

walk(root);

if (matches.length) {
  console.error('Unresolved merge conflict markers found:');
  for (const file of matches) console.error(` - ${file}`);
  process.exit(1);
}
