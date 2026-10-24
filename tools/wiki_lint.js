// wiki lint: every page <= 4 KB, every relative link resolves, every page is listed in index.md.
// Usage: node tools/wiki_lint.js   (exit 1 on any problem). Rules: docs/wiki/SCHEMA.md
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', 'docs', 'wiki'), MAX = 4096;
const pages = [];
(function walk(d) { for (const f of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, f.name); f.isDirectory() ? walk(p) : f.name.endsWith('.md') && pages.push(p); } })(ROOT);
const bad = [], idx = fs.readFileSync(path.join(ROOT, 'index.md'), 'utf8');
for (const p of pages) {
  const rel = path.relative(ROOT, p), txt = fs.readFileSync(p, 'utf8'), size = Buffer.byteLength(txt);
  if (size > MAX) bad.push(`${rel}: ${size} B > ${MAX}`);
  if (!['index.md', 'log.md', 'SCHEMA.md'].includes(rel) && !idx.includes(`(${rel})`)) bad.push(`${rel}: not in index.md`);
  for (const m of txt.matchAll(/\[[^\]]*\]\(([^)\s]+)\)/g)) {
    const t = m[1].split('#')[0]; if (!t || /^[a-z]+:/i.test(t)) continue;
    if (!fs.existsSync(path.resolve(path.dirname(p), t))) bad.push(`${rel}: broken link ${m[1]}`);
  }
}
bad.forEach(b => console.log('FAIL ' + b));
console.log(`${bad.length ? 'FAIL' : 'PASS'} wiki_lint: ${pages.length} pages, ${bad.length} problems`);
process.exit(bad.length ? 1 : 0);
