// Scripted sweep (no AI eyes): plays full games of Sands of Qamar through the real page with touch taps, only on things that glow
// (or on the buttons under the table), at phone sizes, plus story chapters. Run before every deploy; a failure blocks the deploy.
//   NODE_PATH=/opt/node-tools/node_modules node sweep.js [games=24] [file=sands.html] [story=2]
// Fails on: page errors, a glowing target that does not respond (a dead tap), a status line over 8 words, a seat score that differs from
// the engine, anything stuck > 8 s, buttons off screen or covered, horizontal scroll, the table under 55 % of a portrait screen,
// a ghost finger that is not on something that glows or is a button, engine invariants broken, no result screen at the end.
const { chromium } = require('playwright');
const path = require('path');
const N = +process.argv[2] || 24, FILE = path.resolve(__dirname, process.argv[3] || 'sands.html'), STORY = process.argv[4] != null ? +process.argv[4] : 2;
const JOBS = +process.env.JOBS || 4, STEP_CAP = +process.env.STEP_CAP || 3500;
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const SIZES = [[390, 763], [375, 553]];
const MODES = [{ np: 2 }, { np: 3, ex: { thieves: 1 } }, { np: 2, ex: { artisans: 1 } }, { np: 2, ex: { promos: 1 } }, { np: 4 }, { np: 2, ex: { sultan: 1 } },
  { np: 3, ex: { artisans: 1, thieves: 1 } }, { np: 5 }, { np: 2, ex: { artisans: 1, sultan: 1, thieves: 1, promos: 1 } }, { np: 2 }];
const sleep = ms => new Promise(r => setTimeout(r, ms));
function rng(seed) { let t = seed >>> 0; return () => { t = (t + 0x6D2B79F5) >>> 0; let x = Math.imul(t ^ t >>> 15, t | 1); x ^= x + Math.imul(x ^ x >>> 7, x | 61); return ((x ^ x >>> 14) >>> 0) / 4294967296; }; }

const PAGE = `(() => {
  const vis = e => { const r = e.getBoundingClientRect(), s = getComputedStyle(e); return r.width > 3 && r.height > 3 && s.visibility !== 'hidden' && s.display !== 'none' && !e.closest('[hidden]'); };
  const lab = e => (e.getAttribute('aria-label') || e.innerText || e.className || '').toString().replace(/\\s+/g, ' ').trim().slice(0, 40);
  const hash = s => { let h = s.length; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return h; };
  window.__sw = {
    sig() { return [G ? G.logN : 'x', G && G.step, G && G.phase, G && G.move ? G.move.path.length + ':' + G.move.hand.length : -1, G && !!G.q, G && G.q ? G.q.title : '', UI.modal, !!UI.pendDj, !!UI.pendItem, UI.mkSel.join(), UI.sellSel.join(), UI.chz ? UI.chz.opts.length : 0, hash(document.getElementById('bd').innerHTML)].join('|'); },
    state() {
      if (!G) return { none: true, modal: UI.modal, sig: this.sig() };
      return { over: !!G.over, modal: UI.modal, me: !!me(), sig: this.sig(), step: G.step, phase: G.phase, round: G.round };
    },
    cands() {
      const out = [], seen = new Set();
      const add = (e, kind) => { if (seen.has(e) || !vis(e) || e.disabled) return; seen.add(e); const r = e.getBoundingClientRect(); const x = r.left + r.width / 2, y = r.top + r.height / 2;
        if (x < 0 || y < 0 || x > innerWidth || y > innerHeight) return; const t = document.elementFromPoint(x, y);
        const cover = t && t !== e && !e.contains(t) && !t.contains(e) ? (t.closest('#chz') ? 'chz' : t.id ? '#' + t.id : t.tagName.toLowerCase() + '.' + String(t.className).split(' ')[0]) : '';
        out.push({ x, y, kind, label: lab(e), cover, cls: String(e.className).slice(0, 60) }); };
      for (const e of document.querySelectorAll('#chz button')) add(e, 'chz');
      for (const e of document.querySelectorAll('.glow')) add(e, 'glow');
      for (const e of document.querySelectorAll('#acts button,#mine button')) add(e, e.classList.contains('ghost') ? 'ghost' : 'btn');
      return out;
    },
    audit() {
      const bad = [], W = innerWidth, H = innerHeight, de = document.documentElement;
      if (Math.max(de.scrollWidth, document.body.scrollWidth) > W + 1) bad.push('hscroll ' + de.scrollWidth + '>' + W);
      const bd = document.querySelector('[data-board]'); if (bd && H > W) { const r = bd.getBoundingClientRect(); const pct = 100 * Math.max(0, Math.min(r.right, W) - Math.max(r.left, 0)) * Math.max(0, Math.min(r.bottom, H) - Math.max(r.top, 0)) / (W * H); if (pct < 55) bad.push('board ' + pct.toFixed(1) + '% seats ' + Math.round(document.getElementById('seats').offsetHeight) + ' line ' + Math.round(document.getElementById('line').offsetHeight) + ' acts ' + Math.round(document.getElementById('acts').offsetHeight) + ' mine ' + document.getElementById('mine').offsetHeight + ' step ' + (G && G.step) + ' phase ' + (G && G.phase) + ' bar ' + Math.round(document.querySelector('.gx-bar').offsetHeight)); }
      if (!G) return bad;
      const gr = document.getElementById('grid').getBoundingClientRect(); if (gr.right > W + 1 || gr.left < -1 || gr.bottom > H + 1) bad.push('grid off screen');
      const ln = document.getElementById('line').textContent.replace(/[^a-zA-Z0-9'’]+/g, ' ').trim().split(' ').filter(w => /[a-z][a-z]/i.test(w)); if (ln.length > 8) bad.push('line ' + ln.length + ' words: ' + ln.join(' '));
      if (!UI.modal) { for (const b of document.querySelectorAll('#acts button')) { if (!vis(b)) continue; const r = b.getBoundingClientRect(); if (r.left < -1 || r.right > W + 1 || r.bottom > H + 1 || r.top < 0) bad.push('button off screen: ' + lab(b));
          const t = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); if (t && t !== b && !b.contains(t) && !t.closest('#chz')) bad.push('button covered: ' + lab(b) + ' by ' + (t.id || t.className)); } }
      G.pl.forEach((p, i) => { const e = document.querySelector('#seats [data-seat="' + i + '"] .ss'); if (!e) { bad.push('no seat chip ' + i); return; } const v = +e.textContent.replace(/[^0-9-]/g, ''); if (v !== shownTotal(p)) bad.push('score seat ' + i + ': screen ' + v + ' engine ' + shownTotal(p)); });
      const inv = checkInvariants(); if (inv.length && !G.q) bad.push('invariants: ' + inv.join('; ') + ' | last: ' + G.log.slice(0, 5).map(l => l.t).join(' / ') + ' | q=' + (G.q ? G.q.kind : '') + ' step=' + G.step);
      const f = document.getElementById('finger'); if (f && !f.hidden && !UI.modal) { const r = f.getBoundingClientRect(); const fx = parseFloat(f.style.left), fy = parseFloat(f.style.top); const t = document.elementFromPoint(fx, fy);
        const hit = t && t.closest('.glow,#acts button,.tile,.mcard,.dcard,.sp-b,.chb,.sch'); if (!hit) bad.push('finger not on a target at ' + Math.round(fx) + ',' + Math.round(fy));
        else if (!hit.classList.contains('glow') && !hit.closest('#acts')) bad.push('finger on a non-glowing ' + String(hit.className).slice(0, 30)); }
      return bad;
    }
  };
})()`;

async function play(browser, job) {
  const { idx, size, mode, seed, story } = job; const rnd = rng(seed * 7919 + idx);
  const ctx = await browser.newContext({ viewport: { width: size[0], height: size[1] }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: UA, serviceWorkers: 'block' });
  const page = await ctx.newPage(); const res = { idx, size: size.join('x'), mode: JSON.stringify(mode), seed, taps: 0, issues: new Set(), errors: [], rounds: 0, over: false, won: null, story: story || null };
  page.on('pageerror', e => res.errors.push(String(e.message || e).split('\n')[0].slice(0, 140)));
  page.on('console', m => { if (m.type() === 'error') res.errors.push('console: ' + m.text().slice(0, 140)); });
  const issue = s => { if (res.issues.size < 12) res.issues.add(s); };
  const t0 = Date.now();
  try {
    if (story) { const n = +story.slice(1); const ch = {}; for (let k = 1; k < n; k++) ch['c' + k] = { beaten: true, stars: 1, best: null, tries: 1, losses: 0, easy: false }; await ctx.addInitScript(p => { try { localStorage.setItem('gns-campaign-sands', JSON.stringify({ v: 1, ch: p, unlocked: [], last: null })); } catch (e) { } }, ch); }
    await page.goto('file://' + FILE, { waitUntil: 'load', timeout: 30000 }); await sleep(500); await page.evaluate(PAGE);
    if (story) {
      await page.evaluate(id => { setSeed(1000 + (+id.slice(1))); GXC.play(id); }, story); await sleep(400);
      for (let k = 0; k < 14; k++) { // intro, boss card, goal: tap the kit's own buttons until the game starts
        if (await page.evaluate(() => !!G && !!UI.camp)) break;
        const b = await page.evaluate(() => { const bs = [...document.querySelectorAll('.gxc button')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 3 && !e.closest('[hidden]'); });
          const pick = bs.find(e => /^(skip|start|play|go|begin|let|fight|face|enter|ok|got|next|continue)/i.test(e.innerText.trim())) || bs.find(e => /skip|play|start|next|go|face|begin/i.test(e.innerText)) || null;
          if (!pick) return null; const r = pick.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, t: pick.innerText.trim() }; });
        if (!b) { await sleep(300); continue; } await page.touchscreen.tap(b.x, b.y); await sleep(350);
      }
      if (!(await page.evaluate(() => !!G && !!UI.camp))) { issue('story chapter did not start'); return res; }
    } else {
      await page.evaluate(m => { setSeed(m.seed); UI.setup.np = m.mode.np; UI.setup.seats = ['human', 'ai', 'ai', 'ai', 'ai']; UI.setup.lv = ['normal', m.hard ? 'hard' : 'normal', 'easy', 'normal', 'hard']; UI.setup.ex = Object.assign({ artisans: false, sultan: false, thieves: false, promos: false }, m.mode.ex ? Object.fromEntries(Object.keys(m.mode.ex).map(k => [k, true])) : {}); }, { mode, seed, hard: idx % 3 === 1 });
      if (mode.np === 2 && !mode.ex) { await page.tap('text=Play vs computer'); }
      else { await page.evaluate(() => { document.querySelector('#modal details').open = true; }); await sleep(100); const b = await page.evaluate(() => { const e = [...document.querySelectorAll('#modal button')].find(x => /Begin/.test(x.innerText)); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
        if (b) { await page.evaluate(() => { const e = [...document.querySelectorAll('#modal button')].find(x => /Begin/.test(x.innerText)); e.scrollIntoView({ block: 'center' }); }); await sleep(50); const b2 = await page.evaluate(() => { const e = [...document.querySelectorAll('#modal button')].find(x => /Begin/.test(x.innerText)); const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }); await page.touchscreen.tap(b2.x, b2.y); } else issue('no Begin button'); }
      await sleep(300);
    }
    await page.evaluate(() => { UI.speed = 14; });
    let lastSig = '', lastChange = Date.now(), dead = {}, deadN = 0, auditN = 0;
    for (let step = 0; step < STEP_CAP; step++) {
      const st = await page.evaluate('window.__sw.state()');
      if (st.sig !== lastSig) { lastSig = st.sig; lastChange = Date.now(); }
      if (Date.now() - lastChange > 8000) { issue('stuck >8 s in ' + st.phase + '/' + st.step + ' modal=' + st.modal); break; }
      if (st.over && (st.modal === 'over' || story)) { res.over = true; break; }
      if (st.modal && st.modal !== 'over' && !story) { await sleep(100); continue; }
      if (step % 3 === 0 || st.me) { const a = await page.evaluate('window.__sw.audit()'); for (const x of a) issue(x); auditN++; }
      if (!st.me) { await sleep(40); continue; }
      let cands = (await page.evaluate('window.__sw.cands()')).filter(c => !c.cover && !(dead[c.label + '|' + c.kind + '|' + st.sig] >= 1));
      if (!cands.length) { await sleep(60); continue; }
      const glow = cands.filter(c => c.kind === 'glow' || c.kind === 'chz'), btn = cands.filter(c => c.kind === 'btn'), ghost = cands.filter(c => c.kind === 'ghost');
      let pool = glow.length && (rnd() < .8 || !btn.length) ? glow : btn.length ? btn : glow.length ? glow : (rnd() < .03 ? ghost : []);
      if (!pool.length) { await sleep(60); continue; }
      const c = pool[Math.floor(rnd() * pool.length)];
      await page.touchscreen.tap(c.x, c.y); res.taps++;
      let changed = false; for (let k = 0; k < 40; k++) { await sleep(25); const s2 = await page.evaluate('window.__sw.sig()'); if (s2 !== st.sig) { changed = true; break; } }
      if (!changed) { const dd = await page.evaluate(() => JSON.stringify({ ph: G.phase, st: G.step, act: G.act && G.act.color, q: G.q && G.q.kind, pick: UI.pick, pd: UI.pendDj, pi: UI.pendItem, vm: validMoves(me() ? me().i : 0).slice(0, 5) })).catch(() => ''); if (process.env.DBG) { console.log('DEAD', c.label, dd); const r2 = await page.evaluate(() => { const e = document.querySelector('#acts [data-pw]'); const a = window.__sw.sig(); const pd0 = JSON.stringify(UI.pendDj); if (e) e.click(); return [pd0, JSON.stringify(UI.pendDj), a === window.__sw.sig(), e ? e.dataset.pw : null, document.querySelectorAll('#acts [data-pw]').length]; }); console.log('RETRY', JSON.stringify(r2)); } dead[c.label + '|' + c.kind + '|' + st.sig] = 1; if (++deadN > 3) { issue('dead taps: ' + c.kind + ' "' + c.label + '" (' + c.cls + ')'); break; } else issue('dead tap: ' + c.kind + ' "' + c.label + '" (' + c.cls + ')'); }
    }
    const fin = await page.evaluate(() => ({ over: !!(G && G.over), round: G && G.round, win: G && G.over && G.over.win, scores: G && G.over && G.over.scores.map(s => s.s.total), inv: G ? checkInvariants() : [] }));
    res.rounds = fin.round; res.won = fin.win ? fin.win.includes(0) : null; res.scores = fin.scores;
    if (!fin.over) issue('game did not finish within ' + STEP_CAP + ' steps / 8 s'); if (fin.inv.length) issue('final invariants: ' + fin.inv.join('; '));
    if (fin.over && !story) { const m = await page.evaluate(() => { const e = document.querySelector('#modal .mbox.over'); return e ? e.innerText.length : 0; }); if (!m) issue('no result screen'); }
    if (story) { await sleep(2500); const r = await page.evaluate(() => ({ res: !!document.querySelector('.gxc-res-on'), p: JSON.stringify(GXC.progress().ch) })); res.story = story + ' result screen ' + (r.res ? 'shown' : 'missing') + ' progress ' + r.p; if (!r.res && !/beaten/.test(r.p)) issue('story: no result screen'); }
  } catch (e) { issue('crash: ' + String(e.message).slice(0, 120)); }
  res.ms = Date.now() - t0; await ctx.close().catch(() => { }); return res;
}

(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const jobs = []; for (let i = 0; i < N; i++) jobs.push({ idx: i, size: SIZES[i % 2], mode: MODES[i % MODES.length], seed: 100 + i });
  for (let k = 0; k < STORY; k++) jobs.push({ idx: N + k, size: SIZES[k % 2], mode: { np: 2 }, seed: 500 + k, story: ['c1', 'c4', 'c10', 'c5'][k % 4] });
  const out = [], q = (process.env.ONLY ? jobs.filter(j => process.env.ONLY.split(',').includes(String(j.idx))) : jobs).slice(); let fail = 0;
  await Promise.all(Array.from({ length: Math.min(JOBS, jobs.length) }, async () => { while (q.length) { const j = q.shift(); const r = await play(browser, j); out.push(r);
    const bad = r.issues.size || r.errors.length; if (bad) fail++;
    console.log(`${bad ? 'FAIL' : 'ok  '} #${r.idx} ${r.size} ${r.story ? 'story ' + j.story : r.mode} seed ${r.seed}: ${r.taps} taps, round ${r.rounds}, ${r.over ? 'finished' : 'NOT finished'}, ${(r.ms / 1000).toFixed(0)}s${r.scores ? ' scores ' + r.scores.join('/') : ''}${r.story && j.story ? ' ' + r.story : ''}`);
    for (const i of r.issues) console.log('     - ' + i); for (const e of [...new Set(r.errors)].slice(0, 4)) console.log('     ! ' + e); } }));
  await browser.close();
  const win = out.filter(r => !r.story && r.won != null), w = win.filter(r => r.won).length;
  console.log(`\n${out.length - fail}/${out.length} runs clean; ${out.filter(r => r.over).length} finished; random-tap player won ${w}/${win.length}`);
  process.exit(fail ? 1 : 0);
})();
