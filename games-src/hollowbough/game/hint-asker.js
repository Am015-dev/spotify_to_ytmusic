// hint-asker.js (FIXED13): a normal game (not the guided first game) played by real touch at 375x667, the way an unsure newcomer plays:
// each turn it either taps a softly glowing place/card itself, or (when "unsure", about half the turns) taps the bulb and then taps
// what the bulb rings. Checks the calm screen: no ghost finger, no coach bubble unless the bulb was asked, at most one helper at a time.
//   node hint-asker.js [games=4] [file=hollowbough.html] [seed0=11]    prints one line per game + SUMMARY; exit 1 on a stuck game or a calm-screen breach
const PW = require('/home/user/spotify_to_ytmusic/games-src/node_modules/playwright');
const path = require('path');
const N = +process.argv[2] || 4, FILE = path.resolve(process.argv[3] || path.join(__dirname, 'hollowbough.html')), SEED0 = +process.argv[4] || 11;
const VW = +(process.env.VW || 375), VH = +(process.env.VH || 667), ASK = +(process.env.ASK || 0.5);
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function game(b, gi) {
  let rs = (SEED0 + gi) * 7919; const R = () => ((rs = (rs * 16807) % 2147483647) / 2147483647);
  const probs = [], t0 = Date.now(); let asks = 0, taps = 0, breaches = 0;
  const ctx = await b.newContext({ viewport: { width: VW, height: VH }, isMobile: true, hasTouch: true });
  const p = await ctx.newPage(); p.setDefaultTimeout(6000);
  p.on('pageerror', e => probs.push('page error ' + e.message));
  await p.addInitScript(() => { try { localStorage.setItem('hb_played', '1'); localStorage.removeItem('hb_hints'); } catch (e) { } });
  await p.goto('file://' + FILE); await sleep(1500);
  await p.evaluate(s => { setSeed(s); UI.opt = { np: 2, level: 'normal', solo: 1 }; newGame('vs'); AIDELAY = 120; }, SEED0 + gi);
  await sleep(800);
  const sig = () => p.evaluate(() => JSON.stringify([G.logN, G.turn, G.q && JSON.stringify(G.q), !!UI.sel, UI.sel && UI.sel.ms.length, UI.cards.length, UI.pvTab, UI.passArm]));
  let idle = 0, over = false;
  while (Date.now() - t0 < 480000) {
    const s = await p.evaluate(() => {
      const vis = e => { if (!e) return false; const r = e.getBoundingClientRect(); return r.width > 4 && r.height > 4 && r.bottom > 0 && r.top < innerHeight && !e.closest('[hidden]') && getComputedStyle(e).visibility !== 'hidden'; };
      const hit = e => { const r = e.getBoundingClientRect(); for (const fy of [.5, .35, .65]) for (const fx of [.5, .3, .7]) { const x = r.left + r.width * fx, y = r.top + r.height * fy; if (x < 0 || y < 0 || x > innerWidth || y > innerHeight) continue; const t = document.elementFromPoint(x, y); if (t && (e === t || e.contains(t))) return { x, y }; } return null; };
      const f = document.getElementById('finger'), helpers = { finger: !!(f && !f.hidden), bub: document.querySelectorAll('.gxh-bub').length, nudge: document.querySelectorAll('.nudge').length };
      if (G && G.phase === 'over' && document.querySelector('#pc:not([hidden])')) return { kind: 'done', helpers };
      const pcs = [...document.querySelectorAll('#pc:not([hidden]) .cbtns .btn, .gxc-btn.go')].filter(vis);
      if (pcs.length) return { kind: 'btn', q: hit(pcs[0]), helpers };
      if (!G || !UI.started || UI.animBusy || G.phase === 'over' || G.players[HB.actor(G)].ai) return { kind: 'wait', helpers };
      const gl = [...document.querySelectorAll('.glow')].filter(e => vis(e) && hit(e) && !/pv-tab/.test(e.className)).map(e => hit(e));
      const tabs = [...document.querySelectorAll('[data-a="pvtab"].glow,[data-a="pvtab"].has')].filter(vis).map(e => hit(e)).filter(Boolean);
      const btns = [...document.querySelectorAll('#acts .btn:not(.undo)')].filter(e => vis(e) && hit(e) && !e.disabled).map(e => ({ q: hit(e), t: e.textContent.trim().slice(0, 20) }));
      const bulb = document.getElementById('bulbbtn'); return { kind: 'mine', gl, tabs, btns, bulb: bulb && vis(bulb) ? hit(bulb) : null, helpers };
    }).catch(e => ({ kind: 'err', e: e.message }));
    if (s.helpers && !s.helpers.asked) { const h = s.helpers; if (h.finger || h.bub || (h.finger + (h.bub > 0) + (h.nudge > 0)) > 1) { breaches++; if (breaches <= 2) probs.push('helper on screen without asking ' + JSON.stringify(h)); } }
    if (s.kind === 'done') { over = true; break; }
    if (s.kind === 'btn' && s.q) { await p.touchscreen.tap(s.q.x, s.q.y); taps++; await sleep(400); idle = 0; continue; }
    if (s.kind === 'mine') {
      const before = await sig(); let q = null;
      if ((R() < ASK || !s.gl.length) && s.bulb) {   // unsure: ask the bulb, tap what it rings
        asks++; await p.touchscreen.tap(s.bulb.x, s.bulb.y); await sleep(500);
        q = await p.evaluate(() => { const r = document.querySelector('.gxh-ring:not(.from)') || document.querySelector('.gxh-ring'); if (!r) return null; const b = r.getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2 }; });
        if (!q) { await p.evaluate(() => { try { GXH.hide(); } catch (e) { } }); }
      }
      if (!q) { const pick = s.gl.length ? s.gl : (s.tabs.length ? s.tabs : s.btns.filter(b => !/Pass/.test(b.t) || !s.gl.length).map(b => b.q)); q = pick.length ? pick[Math.floor(R() * pick.length)] : (s.btns[0] && s.btns[0].q); }
      if (!q) { idle++; await sleep(250); if (idle > 160) { probs.push('stuck: nothing to tap'); break; } continue; }
      await p.touchscreen.tap(q.x, q.y); taps++;
      let changed = false; for (let k = 0; k < 12 && !changed; k++) { await sleep(120); changed = (await sig()) !== before; }
      if (!changed) { idle++; await p.evaluate(() => { try { GXH.hide(); } catch (e) { } }); if (idle > 160) { probs.push('stuck: taps do nothing'); break; } } else idle = 0;
      continue;
    }
    idle++; await sleep(250); if (idle > 240) { probs.push('stuck ' + JSON.stringify(s).slice(0, 160)); break; }
  }
  const fin = await p.evaluate(() => ({ over: !!(G && G.phase === 'over'), sc: G && G.phase === 'over' ? [0, 1].map(i => HB.score(G, i).total) : null, mode: UI.mode }));
  if (!fin.over) probs.push('no result');
  const win = !!(fin.sc && fin.sc[0] > fin.sc[1]);
  console.log('game ' + (gi + 1) + ' mode=' + fin.mode + ' score ' + (fin.sc ? fin.sc.join('-') : '?') + ' ' + (win ? 'WIN' : 'loss') + ' ' + VW + 'x' + VH + ' taps=' + taps + ' bulbAsks=' + asks + ' ' + Math.round((Date.now() - t0) / 1000) + 's' + (probs.length ? ' PROB ' + probs.slice(0, 3).join(' | ') : ''));
  await ctx.close(); return { win, bad: probs.length };
}
(async () => { const b = await PW.chromium.launch(); let w = 0, bad = 0; for (let i = 0; i < N; i++) { const r = await game(b, i); w += r.win ? 1 : 0; bad += r.bad; } await b.close(); console.log('SUMMARY wins ' + w + '/' + N + ' problems ' + bad); process.exit(bad ? 1 : 0); })();
