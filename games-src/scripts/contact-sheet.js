// Contact sheet: one image per game showing EVERY ?scn= scenario (and optional extra URLs), phone 402x874 or pc 1366x768.
// usage: NODE_PATH=$(npm root -g) node games-src/scripts/contact-sheet.js <slug> [phone|pc] [--base http://localhost:8779] [--out dir]
// needs: games served (python3 -m http.server 8779 in games/), chromium at /opt/pw-browsers/chromium, python3 + Pillow for tiling.
// output: <out>/<slug>-<mode>/<id>.png and <out>/<slug>-<mode>-sheet.jpg (labelled grid). READ THE SHEET (Read tool), list every clipped,
// overlapping, unreadable or empty area per cell, then fix. Flags cells with text overflow automatically (listed in <slug>-<mode>-flags.txt).
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path'), cp = require('child_process');
const a = process.argv.slice(2); const slug = a[0], mode = (a[1] && !a[1].startsWith('--')) ? a[1] : 'phone';
const arg = (k, d) => { const i = a.indexOf(k); return i > -1 ? a[i + 1] : d; };
const BASE = arg('--base', 'http://localhost:8779'), OUT = arg('--out', '/tmp/sheets'), mob = mode === 'phone';
const root = path.join(__dirname, '..', '..', 'games');
const scn = JSON.parse(fs.readFileSync(path.join(root, 'scenarios.json')))[slug] || [];
const ids = scn.filter(x => !x.sizes || x.sizes === 'all' || String(x.sizes).includes(mob ? 'phone' : 'pc')).map(x => x.id);
const extra = (arg('--urls', '') || '').split(',').filter(Boolean);
(async () => {
  const dir = path.join(OUT, `${slug}-${mode}`); fs.mkdirSync(dir, { recursive: true });
  const b = await chromium.launch({ executablePath: fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined });
  const flags = [];
  const shots = [['start', ''], ...ids.map(i => [i, `?scn=${i}`]), ...extra.map((u, k) => ['x' + k, u])];
  for (const [id, q] of shots) {
    const c = await b.newContext({ viewport: mob ? { width: 402, height: 874 } : { width: 1366, height: 768 }, hasTouch: mob, isMobile: mob, serviceWorkers: 'block' });
    const p = await c.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 80)));
    await p.goto(`${BASE}/${slug}/${q}`); await p.waitForTimeout(2200);
    const f = await p.evaluate(() => { const bad = []; document.querySelectorAll('body *').forEach(e => { if (!e.offsetParent || !e.childNodes.length) return; const s = getComputedStyle(e); const t = [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()); if (!t) return; const r = e.getBoundingClientRect(); if (r.width < 2) return; const fs = parseFloat(s.fontSize); if (fs < 13) bad.push('small ' + fs + 'px "' + e.textContent.trim().slice(0, 24) + '"'); if ((s.overflow !== 'visible' || s.textOverflow === 'ellipsis') && e.scrollWidth > e.clientWidth + 2) bad.push('clipped "' + e.textContent.trim().slice(0, 24) + '"'); if (r.right > innerWidth + 2 || r.left < -2) bad.push('offscreen "' + e.textContent.trim().slice(0, 24) + '"'); }); return bad.slice(0, 6); });
    await p.screenshot({ path: path.join(dir, `${id}.png`) });
    if (f.length || errs.length) flags.push(`${id}: ${errs.join(' | ')} ${f.join(' | ')}`);
    await c.close();
  }
  await b.close(); fs.writeFileSync(path.join(OUT, `${slug}-${mode}-flags.txt`), flags.join('\n') || 'no flags');
  const py = `from PIL import Image,ImageDraw\nimport glob,os\nd=${JSON.stringify(dir)}\nfs=sorted(glob.glob(d+'/*.png'))\nW,H=(402,874) if ${mob ? 'True' : 'False'} else (1366,768)\ncols=7 if ${mob ? 'True' : 'False'} else 3;sc=.42 if ${mob ? 'True' : 'False'} else .3\ntw,th=int(W*sc),int(H*sc);rows=(len(fs)+cols-1)//cols\nS=Image.new('RGB',(cols*(tw+4)+4,rows*(th+16)+4),(20,19,17));dr=ImageDraw.Draw(S)\nfor i,f in enumerate(fs):\n x=4+(i%cols)*(tw+4);y=4+(i//cols)*(th+16);S.paste(Image.open(f).convert('RGB').resize((tw,th)),(x,y+14));dr.text((x,y+1),os.path.basename(f)[:-4][:26],fill=(236,231,223))\nS.save(${JSON.stringify(path.join(OUT, `${slug}-${mode}-sheet.jpg`))},quality=80)`;
  cp.execFileSync('python3', ['-c', py]); console.log(`${slug} ${mode}: ${shots.length} cells -> ${OUT}/${slug}-${mode}-sheet.jpg ; flags: ${flags.length}`);
})();
