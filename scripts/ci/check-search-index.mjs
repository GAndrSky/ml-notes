// Compare two shared-search-index.js files as data (ignores BOM / JSON escaping differences
// between Windows PowerShell 5.1 and pwsh 7). Exit 1 if the committed index is stale.
// usage: node check-search-index.mjs <committed.js> <rebuilt.js>
import { readFileSync } from 'node:fs';

const load = (file) => {
  const text = readFileSync(file, 'utf8').replace(/^﻿/, '');
  const json = text.slice(text.indexOf('=') + 1).trim().replace(/;$/, '');
  return JSON.parse(json);
};

const [committed, rebuilt] = process.argv.slice(2).map(load);
const key = (r) => r.path;
const byPath = new Map(rebuilt.map((r) => [key(r), JSON.stringify(r)]));
const stale = [];
for (const r of committed) {
  if (byPath.get(key(r)) !== JSON.stringify(r)) stale.push(r.path);
  byPath.delete(key(r));
}
stale.push(...byPath.keys());
if (stale.length) {
  console.error(`Search index is stale for ${stale.length} page(s):\n  ${stale.slice(0, 20).join('\n  ')}`);
  console.error('Run scripts/build-search-index.ps1 and commit shared-search-index.js.');
  process.exit(1);
}
console.log(`Search index up to date (${committed.length} pages).`);
