// R8: nothing may cover a visible button or a card title, in any phase. Plays a Quick game (hints on, so the turn bars show) to the
// result and, every time the screen settles into a new state, checks every visible button and title against everything drawn over it:
// (a) the element under its centre (elementFromPoint) must be itself or inside it, and (b) the floating bars that ignore taps
// (#instr, #tbanner, #rfeed, .smore) must not overlap it by more than 4 px. Elements scrolled out of their list are skipped; the goal
// card and coach pop-ups are modal by design and are closed first.   Usage: node overlap-test.js [390x844] [days=9]   Exit 1 on failure.
const PW = (() => { try { return require('playwright'); } catch (e) { return require('/home/user/spotify_to_ytmusic/games-src/node_modules/playwright'); } })();
const [W, H] = (process.argv[2] || '390x844').split('x').map(Number); const DAYS = +process.argv[3] || 9;
const CHECK = `(() => {
  const vis = e => { const r = e.getBoundingClientRect(), cs = getComputedStyle(e); return r.width > 8 && r.height > 8 && cs.visibility !== 'hidden' && +cs.opacity > .3 && !e.closest('[hidden]') && r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth; };
  const clipped = e => { for (let p = e.parentElement; p && p !== document.body; p = p.parentElement) { const cs = getComputedStyle(p); if (/(auto|scroll|hidden)/.test(cs.overflowY + cs.overflowX)) { const a = e.getBoundingClientRect(), b = p.getBoundingClientRect(); if (a.top < b.top - 1 || a.bottom > b.bottom + 1 || a.left < b.left - 1 || a.right > b.right + 1) return true; } } return false; };
  const name = e => (e.id ? '#' + e.id : e.tagName.toLowerCase() + (e.className && e.className.baseVal === undefined ? '.' + String(e.className).trim().split(/\\s+/).slice(0, 2).join('.') : '')) + ' "' + (e.textContent || '').trim().replace(/\\s+/g, ' ').slice(0, 28) + '"';
  const floats = ['#instr', '#tbanner', '#rfeed', '.smore'].map(s => document.querySelector(s)).filter(e => e && vis(e) && !e.hidden);
  const rs = document.querySelector('#rs'), modal = rs && !rs.hidden && vis(rs) ? rs : null;
  const targets = [...document.querySelectorAll('button, .qt b, .sth b, .rbh b, #rs h2, #rs h3, .gc h3')].filter(e => vis(e) && !e.disabled && (!modal || modal.contains(e)) && !clipped(e) && !e.closest('#instr,#tbanner,#rfeed,.smore,.gx-drawer:not(.open),[aria-hidden=true]'));
  const bad = [];
  for (const t of targets) {
    const r = t.getBoundingClientRect(), cx = Math.min(innerWidth - 1, Math.max(0, r.left + r.width / 2)), cy = Math.min(innerHeight - 1, Math.max(0, r.top + r.height / 2));
    const top = document.elementFromPoint(cx, cy);
    if (top && top !== t && !t.contains(top) && !top.contains(t) && t.tagName === 'BUTTON') bad.push(name(t) + ' under ' + name(top));
    for (const f of floats) { if (f.contains(t)) continue; const q = f.getBoundingClientRect(); const ox = Math.min(r.right, q.right) - Math.max(r.left, q.left), oy = Math.min(r.bottom, q.bottom) - Math.max(r.top, q.top); if (ox > 4 && oy > 4) bad.push(name(t) + ' under ' + name(f)); }
  }
  return bad;
})()`;
(async () => {
  const b = await PW.chromium.launch(); const pg = await b.newPage({ viewport: { width: W, height: H }, hasTouch: true, isMobile: true });
  const errs = []; pg.on('pageerror', e => errs.push(e.message)); pg.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  const html = require('fs').readFileSync(__dirname + '/cauldron-fair.html');
  await pg.route('**/*', r => { const u = new URL(r.request().url()); if (u.host !== 'gns.test') return r.abort(); const f = require('path').join(__dirname, '../../games/cauldron-fair', u.pathname); if (u.pathname.length > 1 && require('fs').existsSync(f) && require('fs').statSync(f).isFile()) return r.fulfill({ path: f }); return r.fulfill({ status: 200, contentType: 'text/html', body: html }); });
  await pg.goto('https://gns.test/?phone=1'); await pg.evaluate(() => { try { localStorage.clear(); } catch (e) { } });
  await pg.waitForFunction(() => typeof newGame === 'function' && typeof G !== 'undefined');
  await pg.evaluate(() => { try { GXH.setEnabled(true); } catch (e) { } window.AIDELAY = 40; UI.pullMs = 0; newGame('vs', {}); });
  const seen = new Set(), fails = new Map(); let checks = 0, last = '', t0 = Date.now();
  while (Date.now() - t0 < 280000) {
    const st = await pg.evaluate(() => {
      document.querySelector('#goalcard')?.remove(); const ok = document.querySelector('.gxh-ok'); if (ok) ok.click();
      if (G.phase === 'over' || G.over) return 'over';
      const me = G.players[viewSeat()], rs = document.querySelector('#rs');
      return [G.phase, G.round, UI.rsOpen ? (UI.rsMode || 'rs') : '-', me.q ? me.q.h : '-', document.querySelector('.stalls') ? 'shop' : '', document.querySelector('.rbar') ? 'ruby' : '', me.st].join('/');
    });
    if (st === 'over') break;
    const kind = st.split('/').filter((x, i) => i !== 1).join('/');
    if (st !== last) { last = st; await pg.waitForTimeout(1500); await pg.evaluate(() => document.querySelector('#goalcard')?.remove());
      const bad = await pg.evaluate(CHECK); checks++; seen.add(kind);
      for (const x of bad) { if (!fails.has(x)) { fails.set(x, st); await pg.screenshot({ path: __dirname + '/playtest/overlap-fail-' + W + '-' + fails.size + '.png' }).catch(() => { }); } } }
    const r = await pg.evaluate((DAYS) => {
      const q = s => { const e = document.querySelector(s); return e && !e.disabled && e.getBoundingClientRect().width > 3 ? e : null; };
      const me = G.players[viewSeat()]; if (document.querySelector('.stalls') && G.round < 3) me.rubies = Math.max(me.rubies, 4);   // so the ruby stall shows
      const bb = q('[data-a=shopbuy]') || q('[data-a=rubygo]') || q('[data-a=rscont]') || (CF.whiteSum(me) >= 5 ? q('.stopb:not(.off)') : null) || q('.bagb:not(.off)') || q('.stopb:not(.off)') || q('#qbox .sug[data-a=mv]') || q('#qbox [data-a=mv]') || q('.sug[data-a=mv]') || q('[data-a=mv]') || q('#rs .confirm');
      if (bb) bb.click(); return G.round > DAYS ? 'stop' : '';
    }, DAYS);
    if (r === 'stop') break;
    await pg.waitForTimeout(150);
  }
  const over = await pg.evaluate(() => G.phase === 'over' || G.over);
  console.log(W + 'x' + H + ': ' + checks + ' screens checked, kinds: ' + [...seen].length + ', reached result: ' + over + ', errors: ' + errs.length);
  for (const [x, st] of fails) console.log('  COVERED: ' + x + '   at ' + st);
  errs.slice(0, 5).forEach(e => console.log('  ERROR: ' + e));
  await b.close();
  process.exit(fails.size || errs.length || (DAYS >= 9 && !over) ? 1 : 0);
})();
