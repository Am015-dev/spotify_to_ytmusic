// Contact sheet: one image per game showing EVERY ?scn= scenario (and optional extra URLs), phone 402x874 or pc 1366x768.
// usage: NODE_PATH=$(npm root -g) node games-src/scripts/contact-sheet.js <slug> [phone|pc] [--base http://localhost:8779] [--out dir]
// needs: games served (python3 -m http.server 8779 in games/), chromium at /opt/pw-browsers/chromium, python3 + Pillow for tiling.
// output: <out>/<slug>-<mode>/<id>.png and <out>/<slug>-<mode>-sheet.jpg (labelled grid). READ THE SHEET (Read tool), list every clipped,
// overlapping, unreadable or empty area per cell, then fix. Flags cells with text overflow automatically (listed in <slug>-<mode>-flags.txt).
// Measured flags per cell: tiny (<12px phone / <16px pc, x CSS transform scale), lowcontrast (<3:1 on a solid background), small (<13px), clipped, offscreen.
// A game with < 4 cells gets its registered ?scn= ids (read from ?scn=list) added, up to 12 cells. --strict: exit 1 if any tiny/lowcontrast/clipped/offscreen flag.
const { turbo } = require('./turbo'); const { chromium } = require('playwright'); const fs = require('fs'), path = require('path'), cp = require('child_process');
const a = process.argv.slice(2); const slug = a[0], mode = (a[1] && !a[1].startsWith('--')) ? a[1] : 'phone';
const arg = (k, d) => { const i = a.indexOf(k); return i > -1 ? a[i + 1] : d; };
const BASE = arg('--base', 'http://localhost:8779'), OUT = arg('--out', '/tmp/sheets'), mob = mode === 'phone';
const root = path.join(__dirname, '..', '..', 'games');
const scn = JSON.parse(fs.readFileSync(path.join(root, 'scenarios.json')))[slug] || [];
const ids = scn.filter(x => !x.sizes || x.sizes === 'all' || String(x.sizes).includes(mob ? 'phone' : 'pc')).map(x => x.id);
const extra = (arg('--urls', '') || '').split(',').filter(Boolean), strict = a.includes('--strict'), MINPX = mob ? 12 : 16;
// text-node audit, runs in the page: returns {tiny, low, other} line lists (full counts, first 8 lines shown per kind)
const AUDIT = function (MINPX) {
  const out = { tiny: [], low: [], other: [] }, seen = {}, lum = c => { const v = [c[0], c[1], c[2]].map(x => { x /= 255; return x <= .03928 ? x / 12.92 : Math.pow((x + .055) / 1.055, 2.4); }); return .2126 * v[0] + .7152 * v[1] + .0722 * v[2]; };
  const rgba = s => { const m = String(s).match(/[\d.]+/g); return m && m.length >= 3 ? [+m[0], +m[1], +m[2], m.length > 3 ? +m[3] : 1] : null; };
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n; (n = w.nextNode());) {
    const t = n.textContent.trim(); const e = n.parentElement; if (!t || !e || e.closest('canvas,script,style,noscript,#gxscn-tag,#gxlab-bar,[data-gx-skip]')) continue;
    const s = getComputedStyle(e); if (s.display === 'none' || s.visibility === 'hidden') continue;
    const r = document.createRange(); r.selectNodeContents(n); const b = r.getBoundingClientRect(); if (b.width < 2 || b.height < 2) continue;
    let op = 1, sc = 1, bg = null, img = false;
    for (let a = e; a && a.nodeType === 1; a = a.parentElement) { const cs = getComputedStyle(a); op *= +cs.opacity; if (cs.transform && cs.transform !== 'none') { try { const m = new DOMMatrix(cs.transform); sc *= Math.hypot(m.a, m.b) || 1; } catch (x) { } } }
    if (op < .05 || b.right < 0 || b.left > innerWidth || b.bottom < 0 || b.top > innerHeight) continue;
    const px = parseFloat(s.fontSize) * sc, key = t.slice(0, 24), q = '"' + key + '"';
    if (px < MINPX && !seen['t' + key]) { seen['t' + key] = 1; out.tiny.push('tiny ' + +px.toFixed(1) + 'px ' + q); }
    for (let a = e; a && a.nodeType === 1; a = a.parentElement) { const cs = getComputedStyle(a); if (cs.backgroundImage !== 'none') { img = true; break; } const c = rgba(cs.backgroundColor); if (c && c[3] > .98) { bg = c; break; } if (c && c[3] > 0) { img = true; break; } }
    const fg = rgba(s.color); if (bg && !img && fg && fg[3] > .5 && !seen['l' + key]) { const l1 = lum(fg), l2 = lum(bg), cr = (Math.max(l1, l2) + .05) / (Math.min(l1, l2) + .05); if (cr < 3) { seen['l' + key] = 1; out.low.push('lowcontrast ' + cr.toFixed(1) + ':1 ' + q); } }
  }
  document.querySelectorAll('body *').forEach(e => { if (!e.offsetParent || !e.childNodes.length) return; const s = getComputedStyle(e); if (s.visibility === 'hidden') return; if (![...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) return; const r = e.getBoundingClientRect(); if (r.width < 2) return; const f = parseFloat(s.fontSize), k = '"' + e.textContent.trim().slice(0, 24) + '"'; if (f < 13) out.other.push('small ' + f + 'px ' + k); if ((s.overflow !== 'visible' || s.textOverflow === 'ellipsis') && e.scrollWidth > e.clientWidth + 2) out.other.push('clipped ' + k); if (r.right > innerWidth + 2 || r.left < -2) out.other.push('offscreen ' + k); });
  return { tiny: out.tiny.length, low: out.low.length, hard: out.other.filter(x => !x.startsWith('small')).length, lines: [].concat(out.tiny.slice(0, 8), out.low.slice(0, 8), out.other.slice(0, 6)) };
};
(async () => {
  const dir = path.join(OUT, `${slug}-${mode}`); fs.mkdirSync(dir, { recursive: true });
  const b = await chromium.launch({ executablePath: fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined });
  const flags = []; let T = 0, L = 0, H = 0;
  let shots = [['start', ''], ...ids.map(i => [i, `?scn=${i}`]), ...extra.map((u, k) => ['x' + k, u])];
  if (shots.length < 4) {   // sparse sheet: add every scenario the game registers (?scn=list -> window.GXSLIST), up to 12 cells
    const c0 = await b.newContext({ viewport: mob ? { width: 402, height: 874 } : { width: 1366, height: 768 }, serviceWorkers: 'block' }); await turbo(c0); const p0 = await c0.newPage();
    await p0.goto(`${BASE}/${slug}/?scn=list`).catch(() => { }); await p0.waitForFunction(() => window.GXSLIST, null, { timeout: 8000 }).catch(() => { });
    const reg = (await p0.evaluate(() => window.GXSLIST || []).catch(() => [])).filter(x => !x.sizes || x.sizes === 'all' || String(x.sizes).includes(mob ? 'phone' : 'pc')).map(x => x.id).filter(i => i !== 'list'); await c0.close();
    for (const i of reg) if (shots.length < 12 && !shots.some(x => x[0] === i)) shots.push([i, `?scn=${i}`]);
  }
  for (const [id, q] of shots) {
    const c = await b.newContext({ viewport: mob ? { width: 402, height: 874 } : { width: 1366, height: 768 }, hasTouch: mob, isMobile: mob, serviceWorkers: 'block' }); await turbo(c);
    const p = await c.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 80)));
    await p.goto(`${BASE}/${slug}/${q}`); await p.waitForTimeout(450);
    const au = await p.evaluate(`(${AUDIT})(${MINPX})`), f = au.lines; T += au.tiny; L += au.low; H += au.hard;
    await p.screenshot({ path: path.join(dir, `${id}.png`) });
    if (f.length || errs.length) flags.push(`${id}: ${errs.join(' | ')} ${f.join(' | ')}`);
    await c.close();
  }
  await b.close(); fs.writeFileSync(path.join(OUT, `${slug}-${mode}-flags.txt`), flags.join('\n') || 'no flags');
  const py = `from PIL import Image,ImageDraw\nimport glob,os\nd=${JSON.stringify(dir)}\nfs=sorted(glob.glob(d+'/*.png'))\nW,H=(402,874) if ${mob ? 'True' : 'False'} else (1366,768)\ncols=7 if ${mob ? 'True' : 'False'} else 3;sc=.42 if ${mob ? 'True' : 'False'} else .3\ntw,th=int(W*sc),int(H*sc);rows=(len(fs)+cols-1)//cols\nS=Image.new('RGB',(cols*(tw+4)+4,rows*(th+16)+4),(20,19,17));dr=ImageDraw.Draw(S)\nfor i,f in enumerate(fs):\n x=4+(i%cols)*(tw+4);y=4+(i//cols)*(th+16);S.paste(Image.open(f).convert('RGB').resize((tw,th)),(x,y+14));dr.text((x,y+1),os.path.basename(f)[:-4][:26],fill=(236,231,223))\nS.save(${JSON.stringify(path.join(OUT, `${slug}-${mode}-sheet.jpg`))},quality=80)`;
  cp.execFileSync('python3', ['-c', py]); console.log(`${slug} ${mode}: ${shots.length} cells -> ${OUT}/${slug}-${mode}-sheet.jpg ; flags: ${flags.length} ; tiny: ${T} ; lowcontrast: ${L} ; clipped/offscreen: ${H}`);
  if (strict && (T || L || H)) process.exit(1);
})();
