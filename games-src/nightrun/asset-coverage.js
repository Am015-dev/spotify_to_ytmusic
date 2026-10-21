#!/usr/bin/env node
// RUNTIME asset coverage for Mainhattan Nightrun (not a grep): drives the real build headlessly at phone size in ONE browser session with a persistent log,
// records every media URL fetched and every image that really reaches a visible canvas (drawImage hook with provenance through off-screen copies,
// createImageBitmap, ART.pic/ART.anim) or is shown in the DOM (<img>, CSS background), and compares that with the shipped file list.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/asset-coverage.js      env: GAME_DIR=<dir with index.html>, OUT=<report .md>, JSON=<raw .json>, ONLY=title,lab (steps by name prefix), V=1, VP=390x763
// The Lab ASSETS tab and the Lab strip viewer list every file by design: they are never opened here and anything they draw is ignored.
const PW = require('playwright'), path = require('path'), net = require('net'), cp = require('child_process'), fs = require('fs');
const GAME = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun');
const OUT = process.env.OUT || path.join(__dirname, 'ASSET-COVERAGE-2026-10-21.md'), RAW = process.env.JSON || '';
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null, V = !!process.env.V;
const [VW, VH] = (process.env.VP || '390x763').split('x').map(Number);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const fp = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148';

/* ---- in the page: the persistent draw log ---- */
function install() {
  const C = window.__cov = { drawn: {}, shown: {}, calls: 0 }, names = new WeakMap(), norm = u => { u = String(u || ''); const i = u.indexOf('media/'); if (i < 0) return null; return u.slice(i + 6).split('?')[0].split('#')[0]; };
  C.skip = 0;   // >0 while a Lab viewer that lists every file is drawing
  const of = s => { if (!s) return null; if (s instanceof HTMLImageElement) { const n = norm(s.currentSrc || s.src); return n ? [n] : null; } return names.get(s) || null; };
  const D = CanvasRenderingContext2D.prototype.drawImage;
  CanvasRenderingContext2D.prototype.drawImage = function (s) {
    try { const ns = of(s); if (ns) { const cv = this.canvas; C.calls++;
      if (cv && cv.isConnected) { if (!C.skip) for (const n of ns) C.drawn[n] = (C.drawn[n] || 0) + 1; }
      else if (cv) { const o = names.get(cv) || []; for (const n of ns) if (!o.includes(n)) o.push(n); names.set(cv, o); } } } catch (e) { }
    return D.apply(this, arguments); };
  const cib = window.createImageBitmap;
  window.createImageBitmap = function (s) { const ns = of(s), r = cib.apply(this, arguments); if (ns) r.then(b => { names.set(b, ns); }, () => { }); return r; };
  // DOM: <img> and CSS backgrounds that are laid out and visible (the Lab ASSETS tab is excluded)
  C.scan = () => { const vis = e => { for (let x = e; x && x !== document.documentElement; x = x.parentElement) { const cs = getComputedStyle(x); if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity < .05 || x.hidden) return false; } const r = e.getBoundingClientRect(); return r.width > 2 && r.height > 2; };
    for (const e of document.querySelectorAll('*')) { if (e.closest('.la,#laGrid,#laCard')) continue; let u = null;
      if (e.tagName === 'IMG') u = [e.currentSrc || e.src]; else { const b = getComputedStyle(e).backgroundImage; if (b && b !== 'none') u = [...b.matchAll(/url\(["']?([^"')]+)/g)].map(m => m[1]); const m2 = getComputedStyle(e, '::before').backgroundImage; if (m2 && m2 !== 'none') u = (u || []).concat([...m2.matchAll(/url\(["']?([^"')]+)/g)].map(m => m[1])); }
      if (!u) continue; const ns = u.map(norm).filter(Boolean); if (!ns.length || !vis(e)) continue; for (const n of ns) C.shown[n] = (C.shown[n] || 0) + 1; } };
  setInterval(() => { try { C.scan(); } catch (e) { } }, 1500);
  try { localStorage.setItem('mnr_tipdone', 'true'); localStorage.setItem('mnr_fscard', '99'); } catch (e) { }
}

(async () => {
  const fails = [], port = await fp(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME], { stdio: 'ignore' }); await sleep(700);
  const br = await PW.chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const ctx = await br.newContext({ viewport: { width: VW, height: VH }, hasTouch: true, isMobile: true, userAgent: UA });
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  const fetched = new Set(), drawn = {}, shown = {}, stepOf = {}; let cur = '';
  p.on('request', r => { const u = r.url(), i = u.indexOf('/media/'); if (i >= 0) { const n = decodeURIComponent(u.slice(i + 7).split('?')[0]); if (!fetched.has(n)) { fetched.add(n); stepOf[n] = cur; } } });
  await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await p.addInitScript(install);
  const harvest = async () => { try { const d = await p.evaluate(() => { __cov.scan(); return { d: __cov.drawn, s: __cov.shown }; });
    for (const [k, v] of Object.entries(d.d)) { if (!drawn[k]) stepOf['d:' + k] = cur; drawn[k] = (drawn[k] || 0) + v; } for (const [k, v] of Object.entries(d.s)) { if (!shown[k]) stepOf['s:' + k] = cur; shown[k] = (shown[k] || 0) + v; }
    await p.evaluate(() => { __cov.drawn = {}; __cov.shown = {}; }); } catch (e) { } };
  const fresh = async (q, wait) => { await harvest(); await p.goto(`http://127.0.0.1:${port}/index.html?nomusic=1${q || ''}`, { waitUntil: 'domcontentloaded' });
    await p.waitForFunction(() => window.__mnr, null, { timeout: 20000 }); await p.waitForFunction(() => document.documentElement.classList.contains('rdy'), null, { timeout: 15000 }).catch(() => { }); await sleep(wait || 1200); };
  const ev = (f, a) => p.evaluate(f, a).catch(e => { if (V) console.log('  eval fail:', String(e.message).split('\n')[0].slice(0, 120)); return null; });
  const menu = async () => { await ev(() => RET.menuOpen()); await sleep(400); };
  const click = async (sel, w) => { const h = await p.$(sel); if (!h) { if (V) console.log('  no', sel); return false; } try { await h.click({ force: true, timeout: 3000 }); } catch (e) { return false; } await sleep(w || 500); return true; };
  // press every visible button inside a container once (tabs, cards, chips); stops when the container disappears; skips leave-buttons
  const crawl = async (root, max, skip) => { for (let i = 0; i < (max || 40); i++) { const ok = await ev(([r, k, sk]) => { const R = document.querySelector(r); if (!R) return 0; const bs = [...R.querySelectorAll('button,.card,.tile,[role=button]')].filter(b => b.offsetParent && b.getBoundingClientRect().height > 8 && !(sk && new RegExp(sk, 'i').test(b.textContent + ' ' + b.id))); const b = bs[k]; if (!b) return 0; b.click(); return 1; }, [root, i, skip || 'back|close|quit|title|reset|delete|erase|wipe|exit']); if (!ok) break; await sleep(160); } };

  const STEPS = [];
  const step = (name, fn) => STEPS.push([name, fn]);

  step('title', async () => { await fresh('', 3500); });
  step('title-late', async () => { await fresh('', 500); await ev(() => { RET.menuOpen(); }); await sleep(500); await ev(() => { RET.menuShut && RET.menuShut(); }); await sleep(8000); });
  for (const id of ['storyBtn', 'wkBtn', 'wpBtn', 'tutBtn', 'lsBtn', 'setBtn', 'diffBtn', 'statsBtn', 'taleBtn', 'footBtn']) step('menu-' + id, async () => {
    await fresh('', 900); await ev(() => { __mnr.sSave.all = true; }); await menu(); await click('#' + id, 900); await crawl('#story,#storyP,#sel,#wp,#wpP,#setm,#statsP,#taleP,#lsP,#tutP,#fMenu', 30); await sleep(500); });
  step('menu-checklist', async () => { await fresh('', 900); await menu(); await click('.ckB', 900); await crawl('#nrChk', 30); await sleep(400); });
  step('garage', async () => { await fresh('', 900); await ev(() => { try { __mnr.GA.bank = 99999; __mnr.GA.shards = 9999; } catch (e) { } }); await click('#gaBtn', 700);
    for (const tab of ['ships', 'crew', 'looks', 'load', 'mkt', 'forge', 'pilot']) { await click(`#garage .tabs button[data-t="${tab}"]`, 500); await crawl('#garage .body,#garage', 36, 'back|close|reset|sell|scrap|wipe|erase|launch|^$'); await sleep(300); } });

  /* ---- story stages: intro card, a few seconds of flight in god mode, then the failure screen ---- */
  step('stages', async () => { await fresh('', 900); const N = await ev(() => __mnr.STAGES.length); for (let n = 1; n <= (N || 0); n++) {
    await ev(n => { __mnr.abort(); __mnr.sSave.all = true; __mnr.god = true; __mnr.startStory(n); }, n); await sleep(2600); if (n % 8 === 0) { await ev(() => { __mnr.ST.fail && __mnr.ST.fail(); }); await sleep(900); } } await ev(() => __mnr.abort()); });
  step('endless', async () => { await fresh('', 900); await click('#startBtn', 1500); await ev(() => { __mnr.god = true; });
    const nd = await ev(() => __mnr.DIST.length) || 5; for (let i = 0; i < nd; i++) { await ev(i => __mnr.skipTo(i), i); await sleep(2200); await ev(() => __mnr.bossNow()); await sleep(5000); await ev(() => __mnr.killBoss()); await sleep(2500); }
    await ev(() => { __mnr.god = false; __mnr.hurt(99); __mnr.G.deadT = 9; }); await sleep(2500); });

  /* ---- the Lab: every registry item spawned; Lab tabs except ASSETS ---- */
  step('lab', async () => { await fresh('&lab=1', 2500); await ev(() => { __mnr.god = true; LABFULL.scan(); });
    const groups = await ev(() => [...LABFULL.R].map(([g, o]) => [g, [...o.items.keys()]])) || [];
    if (V) console.log('  lab groups', groups.map(([g, ids]) => g + ':' + ids.length).join(' '));
    for (const [g, ids] of groups) { if (/^(foot|tut|tutorial|sprite|screen|lesson)$/.test(g)) continue; for (const id of ids) {
      await ev(([g, id]) => { try { __mnr.G.en = __mnr.G.en.filter(e => e.type === 'boss'); LABFULL.do(LABFULL.R.get(g).items.get(id)); } catch (e) { } }, [g, id]); await sleep(g === 'boss' ? 1800 : g === 'phase' ? 1500 : 160); } } });
  step('lab-tabs', async () => { await fresh('&lab=1', 2200); for (const t of ['dex', 'ctrl', 'foes', 'items', 'cheats', 'boss']) { await click('#labTab_' + t, 500); await crawl('#labP .lbody', 14, 'back|close|reset|wipe|erase|clear|exit'); } });
  step('lab-screens', async () => { await fresh('&lab=1', 2200); const ids = await ev(() => [...(LABFULL.R.get('screen') ? LABFULL.R.get('screen').items.keys() : [])]) || [];
    for (const id of ids) { await ev(id => { try { LABFULL.do(LABFULL.R.get('screen').items.get(id)); } catch (e) { } }, id); await sleep(900); } });
  step('lessons', async () => { await fresh('&lab=1', 2200); const ids = await ev(() => [...(LABFULL.R.get('lesson') ? LABFULL.R.get('lesson').items.keys() : [])]) || [];
    for (const id of ids) { await ev(id => { try { LABFULL.do(LABFULL.R.get('lesson').items.get(id)); } catch (e) { } }, id); await sleep(700); } });
  step('foot', async () => { const ids = await (async () => { await fresh('&lab=1', 2200); return ev(() => [...(LABFULL.R.get('foot') ? LABFULL.R.get('foot').items.keys() : [])]); })() || [];
    for (const id of ids) { await fresh('&lab=1', 1800); await ev(id => { try { LABFULL.scan(); LABFULL.do(LABFULL.R.get('foot').items.get(id)); } catch (e) { } }, id); await sleep(3200); } });

  for (const [name, fn] of STEPS) { if (ONLY && !ONLY.some(o => name.startsWith(o))) continue; cur = name; const t0 = Date.now(); try { await fn(); } catch (e) { fails.push(name + ': ' + String(e.message).split('\n')[0]); } await harvest(); if (V) console.log(`step ${name} ${(Date.now() - t0) / 1000 | 0}s fetched=${fetched.size} drawn=${Object.keys(drawn).length} shown=${Object.keys(shown).length}`); }
  await harvest(); await br.close(); srv.kill();

  /* ---- compare with the shipped files ---- */
  const MEDIA = path.join(GAME, 'media'), files = [];
  const IMG = /\.(webp|png|jpe?g|gif|svg)$/i;
  (function walk(d, rel) { for (const f of fs.readdirSync(d, { withFileTypes: true })) { if (f.isDirectory()) walk(path.join(d, f.name), rel + f.name + '/'); else if (IMG.test(f.name)) files.push(rel + f.name); } })(MEDIA, '');
  const group = f => { if (f.startsWith('anim/')) return 'anim/'; if (f.startsWith('foot/')) return 'foot/'; return f.split(/[-_.]/)[0]; };
  const ready = new Set(JSON.parse(fs.readFileSync(path.join(MEDIA, 'ready.json'), 'utf8')));   // the files the game is allowed to draw (placeholders are never listed: ASSET-POLICY.md)
  const real = f => ready.has(f), cov = f => !!(drawn[f] || shown[f]);
  const G = {}; for (const f of files) { const g = group(f), o = G[g] || (G[g] = { n: 0, real: 0, realCov: 0, fetched: 0, drawn: 0, shown: 0, any: 0 }); o.n++; if (fetched.has(f)) o.fetched++; if (drawn[f]) o.drawn++; if (shown[f]) o.shown++; if (cov(f)) o.any++; if (real(f)) { o.real++; if (cov(f)) o.realCov++; } }
  const tot = { n: files.length, real: 0, realCov: 0, fetched: 0, drawn: 0, shown: 0, any: 0 }; for (const o of Object.values(G)) for (const k in tot) tot[k] += o[k];
  const pc = (a, b) => b ? (100 * a / b).toFixed(1) + '%' : '-';
  const gl = Object.entries(G).sort((a, b) => b[1].n - a[1].n);
  const unrefReal = files.filter(f => real(f) && !cov(f)), unrefPh = files.filter(f => !real(f) && !cov(f)), phDrawn = files.filter(f => !real(f) && cov(f));
  const result = { total: tot, groups: Object.fromEntries(gl.map(([g, o]) => [g, o])), unrefReal, unrefPlaceholder: unrefPh, drawnFiles: Object.keys(drawn).sort(), shownFiles: Object.keys(shown).sort(), fetchedFiles: [...fetched].sort(), placeholderDrawn: phDrawn, fails, errs: [...new Set(errs)].slice(0, 10) };
  if (RAW) fs.writeFileSync(RAW, JSON.stringify(result, null, 1));
  let md = `# Mainhattan Nightrun: runtime asset coverage\n\nGenerated by \`games-src/nightrun/asset-coverage.js\` (Playwright, ${VW}x${VH} phone, ONE browser session with a persistent log). Counts are images of \`games/mainhattan-nightrun/media/\` (${files.length} files: webp/png/jpg/svg; music and json are not images).\n\n`
    + `- **fetched**: the browser requested the URL. **drawn**: it reached a visible canvas through \`drawImage\` (also via off-screen copies and ImageBitmaps). **shown**: it was visible in the DOM (<img> or CSS background). **covered** = drawn or shown.\n`
    + `- **real** = listed in \`media/ready.json\` (finished art the game may draw). The other files are generated SHAPE PLACEHOLDERS (\`placeholders.json\`): by ASSET-POLICY.md and \`placeholder_guard.py\` they are never listed in ready.json and never drawn, so they cannot count as wired until the owner replaces them with art.\n- The Lab ASSETS tab and Lab strip viewer list every file by design and are not counted.\n\n`
    + `## Totals\n\n| | files | fetched | drawn | shown | covered |\n|---|---|---|---|---|---|\n| all images | ${tot.n} | ${tot.fetched} | ${tot.drawn} | ${tot.shown} | ${tot.any} (${pc(tot.any, tot.n)}) |\n| real (ready.json) | ${tot.real} | | | | ${tot.realCov} (${pc(tot.realCov, tot.real)}) |\n| placeholders | ${tot.n - tot.real} | | | | ${phDrawn.length} drawn |\n\n## Per prefix group\n\n| group | files | real | fetched | drawn | shown | covered (all) | real covered | real covered % |\n|---|---|---|---|---|---|---|---|---|\n`;
  for (const [g, o] of gl) md += `| ${g} | ${o.n} | ${o.real} | ${o.fetched} | ${o.drawn} | ${o.shown} | ${o.any} | ${o.realCov} | ${pc(o.realCov, o.real)} |\n`;
  md += `\n## Real files that never drew (${unrefReal.length})\n\n| file | fetched |\n|---|---|\n`;
  for (const f of unrefReal) md += `| ${f} | ${fetched.has(f) ? 'yes' : 'no'} |\n`;
  md += `\n## Placeholder files that never drew (${unrefPh.length}): by policy, listed by group\n\n`;
  { const by = {}; for (const f of unrefPh) (by[group(f)] = by[group(f)] || []).push(f); for (const [g, l] of Object.entries(by).sort((a, b) => b[1].length - a[1].length)) md += `- **${g}** (${l.length}): ${l.slice(0, 60).join(', ')}${l.length > 60 ? ', ...' : ''}\n`; }
  if (phDrawn.length) md += `\n## Placeholders that did draw (${phDrawn.length}, shown by the Lab preview or by a code path that ignores ready.json)\n\n${phDrawn.join(', ')}\n`;
  if (fails.length) md += `\n## Steps that threw\n\n${fails.map(f => '- ' + f).join('\n')}\n`;
  fs.writeFileSync(OUT, md);
  console.log(`covered ${tot.any}/${tot.n} (${pc(tot.any, tot.n)}), drawn ${tot.drawn}, shown ${tot.shown}, fetched ${tot.fetched}; ${unrefReal.length} real never drew, real covered ${tot.realCov}/${tot.real} (${pc(tot.realCov, tot.real)}); step errors ${fails.length}; page errors ${new Set(errs).size}`);
  process.exit(0);
})();
