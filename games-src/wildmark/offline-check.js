// Offline check (orchestrator addendum): builds offline.json for the staged page with scripts/offline-manifest.py's own build(), then opens the page
// with the network cut to everything except the files listed there and plays a turn: no failed or extra requests. node offline-check.js
const { chromium } = require('playwright'); const { execSync } = require('child_process'); const fs = require('fs'), path = require('path');
const EXE = fs.existsSync('/opt/pw-browsers/chromium') ? { executablePath: '/opt/pw-browsers/chromium' } : {};
const ROOT = path.join(__dirname, 'shots', 'offline'), G = path.join(ROOT, 'wildmark');
fs.mkdirSync(G, { recursive: true }); fs.copyFileSync(path.join(__dirname, 'wildmark.html'), path.join(G, 'index.html'));
const media = path.join(__dirname, '..', '..', 'games', 'wildmark'); for (const d of ['media', 'music']) if (fs.existsSync(path.join(media, d))) execSync(`cp -r "${path.join(media, d)}" "${G}/"`);
const man = JSON.parse(execSync(`python3 -c "import importlib.util,pathlib,json,sys;s=importlib.util.spec_from_file_location('om','${path.join(__dirname, '..', 'scripts', 'offline-manifest.py')}');m=importlib.util.module_from_spec(s);s.loader.exec_module(m);m.GAMES=pathlib.Path('${ROOT}');print(json.dumps(m.build('wildmark')))"`).toString());
fs.writeFileSync(path.join(G, 'offline.json'), JSON.stringify(man));
(async () => {
  const listed = new Set(man.files.map(f => f.p).concat((man.optional || []).map(f => f.p))), b = await chromium.launch(EXE), p = await b.newPage({ viewport: { width: 390, height: 763 } }), extra = [], failed = [];
  await p.route('**/*', r => { const u = r.request().url(); if (u.startsWith('data:') || u.startsWith('blob:')) return r.continue(); const i = u.lastIndexOf('/wildmark/'), rel = decodeURIComponent(i >= 0 ? u.slice(i + 10) : '').split('?')[0]; if (listed.has(rel || 'index.html')) return r.continue(); extra.push(u); return r.abort(); });
  p.on('requestfailed', q => { if (!q.url().startsWith('data:')) failed.push(q.url()); });
  await p.goto('file://' + G + '/index.html?fast=1'); await p.click('#quickB'); await p.click('#goB');
  await p.click('#mk .mt'); await p.click('#map .spot'); await p.click('#okB'); await p.waitForTimeout(300);
  if (await p.locator('#map .tgt').count()) await p.click('#map .tgt'); else await p.click('#backB');
  const turn = await p.evaluate(() => G.seats[0].done);
  console.log('offline.json files', man.files.length, 'bytes', man.total, '| extra requests', extra.length, '| failed', failed.length, '| turn played', turn === 1);
  await b.close(); const pass = !extra.length && !failed.length && turn === 1; console.log(pass ? 'PASS offline' : 'FAIL offline ' + extra.concat(failed).slice(0, 3).join(' ')); process.exit(pass ? 0 : 1);
})();
