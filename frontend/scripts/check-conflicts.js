import { existsSync, lstatSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const cwd = resolve(process.cwd());
const parent = resolve(cwd, '..');
const root = existsSync(join(parent, 'frontend')) && existsSync(join(parent, 'backend')) ? parent : cwd;
const ignoredDirs = new Set(['.git', '.pytest_cache', '__pycache__', 'node_modules', 'dist', 'vendor']);
const ignoredFiles = new Set(['fix.md', 'PROJECT_FEATURE_WORKFLOW_REPORT.md']);
const markerPattern = new RegExp(['<'.repeat(7), '='.repeat(7), '>'.repeat(7)].join('|'));
const matches = [];

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    if (ignoredDirs.has(entry)) continue;
    const path = join(dir, entry);
    let stat;
    try {
      stat = lstatSync(path);
    } catch {
      continue;
    }
    if (stat.isSymbolicLink()) continue;
    if (stat.isFile() && ignoredFiles.has(relative(root, path))) continue;
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
