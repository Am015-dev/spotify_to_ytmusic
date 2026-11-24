// Lessons test: node lessons-test.js [sizes=402x874,1366x768]. Every lesson solved by real taps following the show-me target (rival/grad by the AI line),
// a wrong move fails with a message + Retry, nothing of the card covers a tap, Lessons button visible, ?lessons=1 / ?lesson=id deep links, 0 JS errors.
// Contact sheets (lesson start + win/fail) -> ../proof/lessons-<size>-sheet.jpg
const PW = (() => { try { return require('playwright'); } catch (e) { return require('../../../node_modules/playwright'); } })();
const fs = require('fs'), path = require('path');
const html = fs.readFileSync(path.join(__dirname, 'ochre-horizon.html'));
const SIZES = (process.argv[2] || '402x874,1366x768').split(',').map(s => s.split('x').map(Number));
const PROOF = path.join(__dirname, '..', 'proof', 'tutorial2'); fs.mkdirSync(PROOF, { recursive: true });
const { turbo } = require('../../scripts/turbo.js');
const sleep = ms => new Promise(r => setTimeout(r, ms)); const probs = []; const T0 = Date.now();
const IDS = ['tiles', 'stock', 'sell', 'global', 'gens', 'ocean', 'adj', 'req', 'route', 'score', 'mile', 'award', 'act', 'rival', 'grad'];
async function run(b, W, H) {
  const tag = W + 'x' + H, phone = W < 600, note = m => { probs.push(tag + ': ' + m); console.log('NOTE', tag, m); }, shots = []; const t0 = Date.now();
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, isMobile: phone, hasTouch: true });
  await turbo(ctx);
  await ctx.route('**/*', r => new URL(r.request().url()).host === 'gns.test' ? r.fulfill({ status: 200, contentType: 'text/html', body: html }) : r.abort());
  const p = await ctx.newPage(); p.setDefaultTimeout(15000);
  p.on('pageerror', e => note('PAGE ERROR ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/net::|Failed to load|favicon/.test(m.text())) note('console error ' + m.text().slice(0, 140)); });
  await p.goto('https://gns.test/?lessons=1&fast=1');
  await p.waitForFunction(() => window.GXST && GXST.state() && GXST.state().open, null, { timeout: 20000 });
  await p.evaluate(() => { UI.AIDELAY = 40; });
  const st = () => p.evaluate(() => GXST.state());
  const tapPt = async pt => { await p.touchscreen.tap(pt.x, pt.y); await sleep(160); };
  const ptOf = (what) => p.evaluate(sel => { const e = typeof sel === 'string' ? document.querySelector(sel) : null; if (!e) return null; if (e.closest('.gxst-list,#ohRules ol')) e.scrollIntoView({ block: 'center', behavior: 'instant' }); const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }, what);
  const tapSel = async sel => { const pt = await ptOf(sel); if (!pt) { note('nothing to tap ' + sel); return false; } await tapPt(pt); return true; };
  const phase = (w, ms) => p.waitForFunction(w => GXST.state().phase === w, w, { timeout: ms || 12000 }).then(() => true, () => false);
  const live = id => (process.env.DBG ? st().then(x => console.log('live?', id, JSON.stringify({ph:x.phase,id:x.id,live:x.live}), Date.now() - T0)) : Promise.resolve()).then(() => 0) && p.waitForFunction(id => { const s = GXST.state(); return s.id === id && s.phase === 'play' && s.live; }, id, { timeout: 15000 }).catch(async () => { note('lesson ' + id + ' never went live: ' + JSON.stringify(await st())); });
  const sheet = async name => { shots.push(await p.screenshot({ type: 'jpeg', quality: 70 })); };
  // target of the show-me ring -> tap it with a real finger, checking that nothing covers it
  const followTarget = async id => {
    for (let n = 0; n < 40; n++) {
      let s = await st(); if (s.phase !== 'play') return;
      const pt = await p.evaluate(() => { const t = GXST.state().target; if (!t) return null; const cx = t.left + t.width / 2, cy = t.top + t.height / 2; const u = document.elementFromPoint(cx, cy); return { x: cx, y: cy, ok: !!u && !u.closest('.gxst-card') }; });
      if (!pt) { await sleep(250); continue; }
      if (!pt.ok) note(id + ': card covers the target'); await sheet(); await tapPt(pt); await sleep(250);
    }
  };
  const aiLine = async id => { // rival / grad: play the strong AI line through the real doMove
    await p.evaluate(() => { window.__go = true; });
    for (let n = 0; n < 400; n++) {
      const s = await st(); if (s.phase !== 'play') return;
      await p.evaluate(() => { if (!UI.busy && OH.sideToAct() === 0 && !(SCN.S && SCN.S.ended)) { const m = OHAI.decide('normal'); if (m) doMove(m); } });
      await sleep(70);
    }
  };
  // 1) picker, Lessons button, Learn-to-play shell untouched
  let s = await st(); const n = await p.evaluate(() => document.querySelectorAll('.gxst-pick').length);
  if (s.phase !== 'picker' || n !== IDS.length) note('picker shows ' + n + ' lessons');
  const q = await p.evaluate(() => { const e = document.querySelector('.gxst-q'); if (!e) return null; const r = e.getBoundingClientRect(); return r.width > 20 && r.height > 20 && r.left >= 0 && r.top >= 0 && r.right <= innerWidth && r.bottom <= innerHeight; });
  if (!q) note('Lessons button missing or off screen');
  await sheet();
  // chapters + Rules window: every rule row links to a lesson that exists; tapping one starts it
  { const ch = await p.evaluate(() => [...document.querySelectorAll('.gxst-ch')].map(e => e.textContent).join(','));
    if (ch !== 'Basics,Building,Scoring,Advanced') note('chapters: ' + ch);
    if (!(await tapSel('.gxst-rules'))) note('no Rules button'); await sleep(200);
    const r = await p.evaluate(() => { const w = document.getElementById('ohRules'); if (!w) return null; const b = w.querySelector('.rw').getBoundingClientRect(); return { rows: w.querySelectorAll('li').length, links: w.querySelectorAll('[data-rl]').length, fit: b.left >= 0 && b.right <= innerWidth && b.top >= 0 && b.bottom <= innerHeight }; });
    if (!r || r.rows < 20 || r.links !== r.rows || !r.fit) note('Rules window ' + JSON.stringify(r)); await sheet();
    if (await tapSel('#ohRules [data-rl="award"]')) { await live('award'); await p.evaluate(() => GXST.picker()); await phase('picker'); } }
  for (const id of IDS) {
    if (id === 'grad') await p.evaluate(() => GXST.start('grad')); else { await sleep(400); await tapSel('.gxst-pick[data-id="' + id + '"]'); } await live(id); await sleep(300);
    // a visible card with the goal and the board not covered by it
    const cov = await p.evaluate(() => { const c = document.querySelector('.gxst-card'); if (!c) return 'no card'; const r = c.getBoundingClientRect(); const hit = ['#res', '#bPass', '#bCards'].filter(s => { const e = document.querySelector(s); if (!e) return false; const b = e.getBoundingClientRect(); return b.width > 2 && !(b.right < r.left || b.left > r.right || b.bottom < r.top || b.top > r.bottom); }); return hit.join(','); });
    if (cov) note(id + ': card covers ' + cov);
    await sheet();
    if (id === 'tiles') { // wrong move: pass -> acts used? the scenario fails or not; use stock for a clean wrong move below
    }
    await p.evaluate(() => { GXST.hint(); GXST.hint(); }); await sleep(150);
    { const g = await p.evaluate(() => { const e = document.querySelector('.gxst-goal'); return e ? e.textContent : ''; }); if (!/^Your goal: /.test(g)) note(id + ': goal does not start with Your goal: ' + g); }
    const tA = Date.now(); if (id === 'rival' || id === 'grad') await aiLine(id); else await followTarget(id); if (process.env.DBG) console.log(id, 'solve', Date.now() - tA);
    if (!(await phase('win', 20000))) { const x = await st(); note(id + ': not solved (phase ' + x.phase + ' ' + (x.msg || '') + ')'); }
    else { await sleep(200); await sheet(); }
    if (id === 'grad') {
  { const x = await st(); if (x.id !== 'grad' || x.phase !== 'win') note('grad win card not showing at the end'); await p.evaluate(() => GXST.close()); await sleep(600);
    const real = await p.evaluate(() => ({ start: getComputedStyle(document.getElementById('start')).display, phase: OH.G && OH.G.phase, scen: UI.scen }));
    if (real.start !== 'none' || real.phase !== 'setup' || real.scen) note('last lesson did not end in a real game ' + JSON.stringify(real)); else await sheet(); }
      break; }
    console.log(tag, id, 'ok', Math.round((Date.now() - t0) / 1000) + 's');
    await p.evaluate(() => GXST.picker()); await phase('picker');
  }
  // wrong move + Retry on 'stock' (spend the titanium on the wrong card)
  await p.evaluate(() => GXST.start('stock')); await live('stock');
  await p.evaluate(() => doMove({ t: 'play', id: 'p031' }));
  if (!(await phase('fail', 8000))) note('wrong move did not fail'); else {
    s = await st(); if (!/\w{6}/.test(s.msg || '')) note('fail has no message'); await sheet();
    await tapSel('.gxst-ft .pri'); await live('stock');
  }
  // a non-lesson tap works while a lesson runs: open Cards
  if (await tapSel('#bCards')) { await sleep(300); const open = await p.evaluate(() => !!document.querySelector('#shB [data-card]')); if (!open) note('Cards did not open during a lesson'); }
  await p.evaluate(() => { try { closeSheet(); } catch (e) { } });
  // progress saved
  const best = (await st()).best; if (Object.keys(best).length < IDS.length) note('progress saved for ' + Object.keys(best).length + ' lessons');
  // close -> Lessons reopens the picker
  await p.evaluate(() => GXST.close()); await p.evaluate(() => document.querySelector('.gxst-q').click()); await sleep(200);
  if ((await st()).phase !== 'picker') note('Lessons button did not reopen the picker');
  // deep link ?lesson=<id>
  const p2 = await ctx.newPage(); p2.on('pageerror', e => note('PAGE ERROR p2 ' + e.message));
  await p2.goto('https://gns.test/?lesson=adj&fast=1'); await p2.waitForFunction(() => window.GXST && GXST.state() && GXST.state().id === 'adj', null, { timeout: 15000 }).catch(() => note('?lesson=adj did not open'));
  await p2.close();
  // contact sheet
  const pg = await ctx.newPage(); const per = 12, cols = phone ? 6 : 4, cw = phone ? 300 : 480, ch = Math.round(cw * H / W);
  for (const f of fs.readdirSync(PROOF)) if (f.startsWith('lessons-' + tag)) fs.unlinkSync(path.join(PROOF, f));
  for (let k = 0; k * per < shots.length; k++) { const part = shots.slice(k * per, k * per + per), rows = Math.ceil(part.length / cols);
    await pg.setViewportSize({ width: cols * cw, height: rows * ch });
    await pg.setContent('<body style="margin:0;background:#111;display:grid;grid-template-columns:repeat(' + cols + ',' + cw + 'px)">' + part.map(x => '<img style="width:' + cw + 'px;height:' + ch + 'px;object-fit:cover" src="data:image/jpeg;base64,' + x.toString('base64') + '">').join('') + '</body>');
    await pg.screenshot({ path: path.join(PROOF, 'lessons-' + tag + '-' + String(k + 1).padStart(2, '0') + '.jpg'), type: 'jpeg', quality: 78 }); }
  console.log(tag, 'done in', Math.round((Date.now() - t0) / 1000) + 's', shots.length, 'cells'); await ctx.close();
}
(async () => { const b = await PW.chromium.launch({executablePath:'/opt/pw-browsers/chromium'}); for (const [W, H] of SIZES) await run(b, W, H); await b.close();
  console.log(probs.length ? 'FAIL\n' + probs.join('\n') : 'PASS', Math.round((Date.now() - T0) / 1000) + 's'); process.exit(probs.length ? 1 : 0); })();
