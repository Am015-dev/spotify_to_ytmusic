#!/usr/bin/env node
// GARAGEFIX (parts/garagefix.js, flag RET.garagefix, ?garagefix=0 = old behaviour): buying never moves the scroll, each tab keeps its own scroll,
// tap targets >= 44 px, text >= 12 px, no overlap. Real touch events through CDP. Headless, no screenshots (SHOTS=dir saves phone shots for a human).
//   NODE_PATH=$(npm root -g) node games-src/nightrun/garagefix-test.js     env: GAME_DIR=..., SHOTS=dir, OLD=1 (only report the ?garagefix=0 numbers)
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process');
const GAME_DIR = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun');
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const sleep = ms => new Promise(r => setTimeout(r, ms));
const res = [], ok = (n, p, i) => { res.push(p); console.log((p ? 'PASS ' : 'FAIL ') + n + (p || i == null ? '' : ' :: ' + i)); };
const SIZES = [[390, 763], [375, 553]];
const TABS = ['ships', 'weapons', 'forge', 'pilot', 'tune', 'abil', 'crew', 'looks', 'load', 'mkt'];
(async () => {
  const port = await freePort(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME_DIR], { stdio: 'ignore' });
  await sleep(800);
  const br = await PW.chromium.launch(), errs = [];
  const open = async (w, h, q) => { const ctx = await br.newContext({ viewport: { width: w, height: h }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
    const p = await ctx.newPage(); p.on('pageerror', e => errs.push(w + 'x' + h + ' ' + e.message));
    await p.addInitScript(() => { try { if (!sessionStorage.getItem('__ini')) { sessionStorage.setItem('__ini', '1'); localStorage.setItem('mnr_tut', '1'); } } catch (e) { } });
    await p.goto(`http://127.0.0.1:${port}/index.html${q}`); await p.waitForFunction(() => window.__mnr && window.__hub && document.documentElement.classList.contains('rdy'), null, { timeout: 9000 }); await sleep(300);
    p.cdp = await ctx.newCDPSession(p); return p; };
  const touch = async (p, x, y) => { for (const [t, pts] of [['touchStart', [{ x, y }]], ['touchEnd', []]]) await p.cdp.send('Input.dispatchTouchEvent', { type: t, touchPoints: pts }); await sleep(120); };
  const tapEl = async (p, sel) => { const b = await p.evaluate(s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; }, sel); if (!b) throw new Error('no ' + sel); await touch(p, b.x, b.y); };
  const tab = async (p, t) => { await p.evaluate(t => { const b = document.querySelector(`#garage .tabs [data-t=${t}]`); if (b) b.scrollIntoView({ inline: 'center', block: 'nearest' }); }, t); await sleep(120); await tapEl(p, `#garage .tabs [data-t=${t}]`); await sleep(150); };
  
  const box = p => p.evaluate(() => { const b = document.getElementById('gaCards'); return b.scrollTop; });
  for (const [w, h] of SIZES) for (const q of ['?garagefix=0', '']) {
    const on = q === '', tag = ` ${w}x${h}${on ? '' : ' (?garagefix=0)'}`; if (process.env.OLD && on) continue;
    const p = await open(w, h, q);
    await p.evaluate(() => { __mnr.GA.bank = 100000; __hub.hangar(); });
    await sleep(300);
    // ---- 1. buy the 8th TUNE card by touch: scroll must not move, the card shows the new level ----
    await tab(p, 'tune');
    const geo = await p.evaluate(() => { const b = document.getElementById('gaCards'), cs = [...b.querySelectorAll('.card[data-kind=tune]')]; return { n: cs.length, sh: b.scrollHeight, ch: b.clientHeight }; });
    ok('tune tab has cards and scrolls' + tag, geo.n >= 9 && geo.sh > geo.ch, JSON.stringify(geo));
    const sel = '#gaCards .card[data-kind=tune]:nth-of-type(8)';
    await p.evaluate(s => { const b = document.getElementById('gaCards'), c = document.querySelectorAll('#gaCards .card[data-kind=tune]')[7]; b.scrollTop += c.getBoundingClientRect().top - b.getBoundingClientRect().top - 80; }, sel);
    await sleep(200);
    const before = await p.evaluate(() => { const b = document.getElementById('gaCards'), c = document.querySelectorAll('#gaCards .card[data-kind=tune]')[7], r = c.getBoundingClientRect(); return { st: b.scrollTop, id: c.dataset.id, lvl: +c.dataset.lvl, top: Math.round(r.top), bank: __mnr.GA.bank }; });
    await p.evaluate(() => { document.querySelectorAll('#gaCards .card[data-kind=tune]').forEach((c, i) => { c.__mark = i; }); });
    const bt = await p.evaluate(() => { const c = document.querySelectorAll('#gaCards .card[data-kind=tune]')[7], r = (c.querySelector('.buy,.pr') || c).getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; });
    await touch(p, bt.x, bt.y); await sleep(300);
    const after = await p.evaluate(id => { const b = document.getElementById('gaCards'), c = document.querySelector(`#gaCards [data-id="${id}"]`), r = c && c.getBoundingClientRect(); return { st: b.scrollTop, lvl: c ? +c.dataset.lvl : -1, top: r ? Math.round(r.top) : -999, bank: __mnr.GA.bank, shown: document.getElementById('gaBankN') && +document.getElementById('gaBankN').textContent }; }, before.id);
    const moved = Math.abs(after.st - before.st), shift = Math.abs(after.top - before.top);
    console.log(`  scroll before ${before.st} after ${after.st} (moved ${moved}px), card top ${before.top} -> ${after.top}, level ${before.lvl} -> ${after.lvl}, bank ${before.bank} -> ${after.bank}`);
    if (!on) { ok('?garagefix=0 is the old Garage (no layer, no bar)' + tag, await p.evaluate(() => !GF.on && !document.getElementById('garage').classList.contains('gfx') && !document.querySelector('.gfBar,.gfRec,.gfSec')), '');
    }
    if (on) { const kept = await p.evaluate(() => { const cs = [...document.querySelectorAll('#gaCards .card[data-kind=tune]')]; return { kept: cs.filter(c => c.__mark !== undefined).length, n: cs.length }; });
      ok('buy by touch: only the changed cards were rebuilt (in place)' + tag, kept.kept >= kept.n - 12 && kept.kept < kept.n, JSON.stringify(kept));
      ok('buy by touch: bought' + tag, after.lvl === before.lvl + 1 && after.bank < before.bank && after.shown === after.bank, JSON.stringify([before, after]));
      ok('buy by touch: scrollTop unchanged +-2px' + tag, moved <= 2, moved + 'px'); ok('buy by touch: same card stays in view' + tag, shift <= 2 && after.top > 0 && after.top < h, shift + 'px'); }
    // ---- 2. every tab keeps its own scroll, also when leaving the Garage ----
    if (on) {
      const pos = {};
      for (const t of ['tune', 'crew', 'weapons', 'load']) { await tab(p, t); const mx = await p.evaluate(() => { const b = document.getElementById('gaCards'); b.scrollTop = Math.min(b.scrollHeight - b.clientHeight, 140 + Math.floor(Math.random() * 100)); return b.scrollTop; }); await sleep(120); pos[t] = await box(p); }
      let bad = []; if (process.env.DBG) console.log('  pos', JSON.stringify(pos), 'mem', JSON.stringify(await p.evaluate(() => GF.mem)));
      for (const t of ['tune', 'crew', 'weapons', 'load']) { await tab(p, t); await sleep(150); const s = await box(p); if (process.env.DBG) console.log('  back', t, s, JSON.stringify(await p.evaluate(() => [GF.mem, __mnr.GA.tab, GF.busy, GF.last]))); if (Math.abs(s - pos[t]) > 2 && pos[t] > 0) bad.push(t + ' ' + pos[t] + '->' + s); }
      ok('tabs keep their own scroll' + tag, !bad.length, bad.join(' '));
      await tab(p, 'tune'); await sleep(100); const t0 = await box(p);
      await p.evaluate(() => { document.getElementById('gaBack').click(); }); await sleep(200);
      await p.evaluate(() => __hub.hangar()); await sleep(300);
      const back = await p.evaluate(() => ({ tab: document.querySelector('#garage .tabs button.on').dataset.t, st: document.getElementById('gaCards').scrollTop }));
      ok('returning from another screen restores the scroll' + tag, back.tab === 'tune' && Math.abs(back.st - t0) <= 2, JSON.stringify([t0, back]));
      // ---- 3. every tab: tap targets, text, overlap ----
      for (const t of TABS) { await tab(p, t); await sleep(150);
        const a = await p.evaluate(() => { const R = document.getElementById('garage'), out = { small: [], tiny: [], ovl: [], n: 0 }, vis = e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
          const bx = document.getElementById('gaCards').getBoundingClientRect();
          for (const b of R.querySelectorAll('button')) { if (!vis(b) || b.hidden) continue; const r = b.getBoundingClientRect(), inBox = b.closest('#gaCards'); if (inBox && (r.bottom < bx.top || r.top > bx.bottom)) continue; out.n++; if (r.height < 43.5 || r.width < 43.5) out.small.push((b.textContent || b.className).trim().slice(0, 16) + ' ' + Math.round(r.width) + 'x' + Math.round(r.height)); }
          for (const e of R.querySelectorAll('*')) { if (!vis(e) || e.closest('svg,canvas')) continue; const own = [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()); if (!own) continue; const r = e.getBoundingClientRect(); if (r.bottom < bx.top && e.closest('#gaCards') || r.top > bx.bottom && e.closest('#gaCards')) continue; const fs = parseFloat(getComputedStyle(e).fontSize); if (fs < 11.95) out.tiny.push(e.textContent.trim().slice(0, 14) + ' ' + fs); }
          const cs = [...document.querySelectorAll('#gaCards>.card')].filter(vis).map(c => c.getBoundingClientRect());
          for (let i = 0; i < cs.length; i++) for (let j = i + 1; j < cs.length; j++) { const A = cs[i], B = cs[j]; if (A.left < B.right - 1 && B.left < A.right - 1 && A.top < B.bottom - 1 && B.top < A.bottom - 1) out.ovl.push(i + '/' + j); }
          return out; });
        ok(`tab ${t}: tap targets >= 44px` + tag, !a.small.length, a.small.slice(0, 4).join('; '));
        ok(`tab ${t}: no text < 12px` + tag, !a.tiny.length, a.tiny.slice(0, 4).join('; '));
        ok(`tab ${t}: cards do not overlap` + tag, !a.ovl.length, a.ovl.slice(0, 4).join(' '));
        if (process.env.SHOTS) await p.screenshot({ path: path.join(process.env.SHOTS, `garage-${t}-${w}x${h}.png`) }); }
    } else if (process.env.SHOTS) for (const t of TABS) { await tab(p, t); await sleep(150); await p.screenshot({ path: path.join(process.env.SHOTS, `old-garage-${t}-${w}x${h}.png`) }); }
    await p.context().close();
  }
  ok('no page errors', !errs.length, errs.slice(0, 3).join(' | '));
  await br.close(); srv.kill();
  const f = res.filter(x => !x).length; console.log(f ? `FAIL ${f}/${res.length}` : `ALL PASS ${res.length}`); process.exit(f ? 1 : 0);
})().catch(e => { console.log('FAIL crash: ' + e.message); process.exit(1); });
