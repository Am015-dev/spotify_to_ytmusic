// Turns $UA_OUT/<slug>-<project>.json (ui-audit.spec.js) into the markdown table for HANDOFF.md. Usage: node scripts/ui-audit-table.js [dir]
const fs = require('fs'), path = require('path'), dir = path.resolve(process.argv[2] || process.env.UA_OUT || '.staging/ui-audit');
const by = {}; fs.readdirSync(dir).filter(f => f.endsWith('.json')).forEach(f => { const r = JSON.parse(fs.readFileSync(path.join(dir, f))); (by[r.slug] = by[r.slug] || []).push(r); });
const R = 'ABCDEF', lines = ['| game | ' + R.split('').join(' | ') + ' |', '|---|' + R.split('').map(() => '---').join('|') + '|'], det = [];
Object.keys(by).sort().forEach(slug => {
  const rs = by[slug], row = [];
  R.split('').forEach(k => {
    const all = []; rs.forEach(r => r[k].forEach(x => all.push(Object.assign({ proj: r.proj }, x))));
    const uniq = {}; all.forEach(x => { const key = x.surface + '|' + x.sel + '|' + x.msg.replace(/\d+/g, '#'); (uniq[key] = uniq[key] || { x, p: {} }).p[x.proj] = 1; });
    const u = Object.values(uniq); row.push(u.length ? 'FAIL ' + u.length : 'pass');
    if (u.length) det.push('- **' + slug + ' ' + k + '** (' + u.length + ' distinct, ' + all.length + ' hits): ' + u.slice(0, 3).map(o => '[' + o.x.surface + '/' + Object.keys(o.p).join(',') + '] ' + o.x.msg + ' `' + o.x.sel + '`').join(' ; '));
  });
  lines.push('| ' + slug + ' (' + rs.length + ' sizes) | ' + row.join(' | ') + ' |');
});
console.log(lines.join('\n') + '\n\n' + det.join('\n'));
