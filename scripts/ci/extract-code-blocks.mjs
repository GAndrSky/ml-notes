// Extract Python code blocks from lesson pages.
// usage: node extract-code-blocks.mjs <repo-root> <out-dir>
// Writes <out-dir>/<lesson>__NN.py and <out-dir>/index.json ({name, file, line}).
import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'parse5';

const [repo = '.', out = 'code-blocks'] = process.argv.slice(2);
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });

const attr = (n, k) => (n.attrs || []).find((a) => a.name === k)?.value || '';
const text = (n) => (n.nodeName === '#text' ? n.value : n.nodeName === 'br' ? '\n' : (n.childNodes || []).map(text).join(''));
const index = [];

for (const dir of fs.readdirSync(repo).filter((d) => /^(\d\d_|job_prep$)/.test(d)).sort()) {
  for (const file of fs.readdirSync(path.join(repo, dir)).filter((f) => f.endsWith('.html')).sort()) {
    const rel = `${dir}/${file}`;
    const doc = parse(fs.readFileSync(path.join(repo, rel), 'utf8'), { sourceCodeLocationInfo: true });
    let k = 0;
    (function walk(n) {
      const cls = attr(n, 'class').split(/\s+/);
      if (n.tagName === 'pre' || cls.includes('code-block') || cls.includes('code') || cls.includes('cb')) {
        const code = text(n).replace(/ /g, ' ').replace(/^\n+|\s+$/g, '');
        const inner = (n.childNodes || []).find((c) => c.tagName === 'code');
        const lang = (attr(inner || n, 'class').match(/language-(\w+)/) || [])[1] || attr(n, 'data-lang');
        const looksPy = /(^|\n)\s*(import |from \w+ import|def |class \w+|print\()/.test(code);
        const notPy = /^(FROM |RUN |docker |pip |\$ |curl |git |#!\/bin|apiVersion|\{)/m.test(code.slice(0, 40))
          || (lang && lang !== 'python' && lang !== 'py');
        if (looksPy && !notPy) {
          const name = `${rel.replace(/\//g, '__').replace('.html', '')}__${String(++k).padStart(2, '0')}.py`;
          fs.writeFileSync(path.join(out, name), code + '\n');
          index.push({ name, file: rel, line: n.sourceCodeLocation.startLine });
        }
        return;
      }
      (n.childNodes || []).forEach(walk);
    })(doc);
  }
}
fs.writeFileSync(path.join(out, 'index.json'), JSON.stringify(index, null, 1));
console.log(`Extracted ${index.length} Python blocks.`);
