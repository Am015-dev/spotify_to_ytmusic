// Glow-follow newcomer games by real touch (Playwright touchscreen.tap) at 390x844, the way a reviewer plays the default game:
// fresh browser, Play > Play now > Start (Guided), then each turn tap only what the game lights up (the ghost-finger target,
// else the best badge, else the first glowing thing), dialog buttons when a card is up. Counts first-tap misses on lit targets.
// node glow-touch.js [games=4] [url=http://localhost:8765/] [seed0]   prints one line per game + a summary; exit 1 on a miss or page error.
const PW = require('/home/user/spotify_to_ytmusic/games-src/node_modules/playwright');
const N = +process.argv[2] || 4, URL0 = process.argv[3] || 'http://localhost:8765/', SEED0 = +process.argv[4] || 0;
const VW = +(process.env.VW || 390), VH = +(process.env.VH || 844), NOWAIT = !!process.env.NOWAIT, SECOND = !!process.env.SECOND;
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function game(b, gi) {
  const probs = [], misses = [], t0 = Date.now();
  const ctx = await b.newContext({ viewport: { width: VW, height: VH }, isMobile: true, hasTouch: true });
  const p = await ctx.newPage(); p.setDefaultTimeout(6000);
  if (process.env.EVLOG) await p.addInitScript(() => { window.__ev = []; const T = ['pointerdown','pointerup','touchstart','touchend','click','mousedown','mouseup'];
    for (const k of ['stopPropagation','stopImmediatePropagation','preventDefault']) { const o = Event.prototype[k]; Event.prototype[k] = function () { if (T.includes(this.type)) window.__ev.push(this.type + ' ' + k + ' @ ' + (new Error().stack.split('\n').slice(2,5).join(' < ').replace(/https?:[^)]*\//g,''))); return o.apply(this, arguments); }; }
    for (const t of T) document.addEventListener(t, e => window.__ev.push(t + ' tgt=' + (e.target.className||e.target.tagName).toString().slice(0,30) + ' trusted=' + e.isTrusted), true); });
  p.on('pageerror', e => probs.push('page error ' + e.message));
  await p.goto(URL0); await sleep(1500);
  if (NOWAIT) await p.evaluate(() => { window.__NOBEST = 1; });
  if (process.env.NOFINGER) await p.evaluate(() => { window.__NOFINGER = 1; });
  if (SECOND) await p.evaluate(() => { try { localStorage.setItem('hb_played', '1'); } catch (e) { } });
  if (SEED0) await p.evaluate(s => { try { setSeed(s); } catch (e) { } }, SEED0 + gi);
  const tapText = async re => {
    const q = await p.evaluate(src => { const re = new RegExp(src); const e = [...document.querySelectorAll('button,.chipb,.sbtn,[role=button]')].find(x => { const r = x.getBoundingClientRect(); return r.width > 4 && !x.closest('[hidden]') && re.test(x.textContent.trim()); }); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }, re.source);
    if (!q) return false; await p.touchscreen.tap(q.x, q.y); await sleep(700); return true;
  };
  await tapText(/^▶?\s*Play$/) || await tapText(/^Play/); await tapText(/Play now/); await sleep(400);
  if (SEED0) await p.evaluate(s => { try { setSeed(s); } catch (e) { } }, SEED0 + gi);
  await tapText(/^Start/); await sleep(600);
  await p.evaluate(() => { try { AIDELAY = 150; } catch (e) { } });
  if (process.env.EVLOG) await p.evaluate(() => { const o = window.onTarget; window.onTarget = function (tg, el) { const mm = myMoves(); window.__ev.push('onTarget ' + tg + ' cards=' + UI.cards.length + ' anim=' + UI.animBusy + ' lp=' + UI.lp + ' zoomAt=' + (UI.zoomAt ? Date.now() - UI.zoomAt : '-') + ' moves=' + mm.length + ' match=' + mm.filter(m => tgOf(m) === tg).length + ' actor=' + HB.actor(G)); return o.apply(this, arguments); };
    for (const fn of ['render','renderActs','renderBoard','seePreview','closePop']) { const o2 = window[fn]; if (typeof o2 === 'function') window[fn] = function () { window.__ev.push('  call ' + fn); return o2.apply(this, arguments); }; }
    document.addEventListener('click', e => window.__ev.push('click(bubble) lp=' + UI.lp + ' zoomHidden=' + ($('#zoom') ? $('#zoom').hidden : '-') + ' zoomAt=' + (UI.zoomAt ? Date.now() - UI.zoomAt : '-')), true); });
  let taps = 0, idle = 0, over = false, wf = 0;
  const sig = () => p.evaluate(() => JSON.stringify([G && G.logN, G && G.turn, G && G.q && G.q.kind, G && G.q && G.q.opts.length, G && JSON.stringify(G.q), G && JSON.stringify(G.players.map(x => [x.res, x.hand.length, x.city.length, x.pts])), !!UI.sel, UI.sel && UI.sel.ms.length, UI.cards.length, UI.cards[0] && UI.cards[0].kind, UI.pvTab, UI.passArm, document.querySelectorAll('.picked,.sel,.on.glow').length]));
  while (Date.now() - t0 < 420000) {
    const s = await p.evaluate(() => {
      const vis = e => { if (!e) return false; const r = e.getBoundingClientRect(); return r.width > 4 && r.height > 4 && r.bottom > 0 && r.top < innerHeight && !e.closest('[hidden]') && getComputedStyle(e).visibility !== 'hidden'; };
      const hit = e => { const r = e.getBoundingClientRect(); for (const fy of [.5, .35, .65]) for (const fx of [.5, .3, .7]) { const x = r.left + r.width * fx, y = r.top + r.height * fy; if (x < 0 || y < 0 || x > innerWidth || y > innerHeight) continue; const t = document.elementFromPoint(x, y); if (t && (e === t || e.contains(t))) return { x, y }; } return null; };
      const desc = e => (e.getAttribute('data-t') || e.className || e.tagName).toString().slice(0, 40) + ' "' + e.textContent.trim().slice(0, 24) + '"';
      if (G && G.phase === 'over' && document.querySelector('#pc:not([hidden])')) return { kind: 'done' };
      const pcs = [...document.querySelectorAll('#pc:not([hidden]) .cbtns .btn, .gxc-btn.go, .gxh-bubble button, .gxh-x')].filter(vis);
      if (pcs.length) { const e = pcs[0], q = hit(e); return { kind: 'btn', q, d: desc(e) }; }
      if (!G || !UI.started || UI.animBusy || G.phase === 'over') return { kind: 'wait' };
      if (G.players[HB.actor(G)].ai) return { kind: 'wait' };
      // what is lit: the ghost finger's target first
      let el = null, src = 'finger';
      const f = document.getElementById('finger');
      if (f && !f.hidden && !window.__NOFINGER) { const r = f.getBoundingClientRect(); const x = r.left + 19, y = r.top + 4; f.style.pointerEvents = 'none'; const t = document.elementFromPoint(x, y); el = t && t.closest('[data-t],button'); }
      if ((!el || !vis(el)) && !window.__NOBEST) { src = 'best'; el = [...document.querySelectorAll('.hbbest')].find(vis) || null; } else if (!el || !vis(el)) el = null;
      if (!el) { src = 'glow'; el = [...document.querySelectorAll('.glow')].find(e => vis(e) && hit(e)) || null; }
      if (!el) { const tab = [...document.querySelectorAll('[data-a="pvtab"].glow,[data-a="pvtab"].has')].find(vis); if (tab) el = tab; }
      if (!G.q && !UI.sel) { window.__gl = window.__gl || []; window.__gl.push(document.querySelectorAll('#bd [data-t^="w:"].glow,#bd [data-t^="p:"].glow,#bd [data-t^="d:"].glow').length); }
      if (!el) { const b = [...document.querySelectorAll('#acts .btn:not(.undo)')].find(e => vis(e) && hit(e) && !e.disabled); if (b) { el = b; src = 'button'; } }
      if (!el) return { kind: 'nolit', d: JSON.stringify({ q: G.q && G.q.kind, sel: !!UI.sel, acts: [...document.querySelectorAll('#acts button')].map(b => b.className + ':' + b.textContent.trim().slice(0, 15)) }) };
      const q = hit(el); if (!q) return { kind: 'covered', d: desc(el) };
      let rec = ''; try { computeRec(true); rec = UI.rec && UI.rec.m ? tgOf(UI.rec.m) : ''; } catch (e) { } let why = ''; try { const re = UI.tgEls[rec]; why = 'want=' + fingerWanted() + ' anim=' + UI.animBusy + ' el=' + (re ? (re.isConnected ? (re.getBoundingClientRect().width|0) + 'x' + (re.getBoundingClientRect().top|0) : 'detached') : 'none') + ' tab=' + UI.pvTab + ' finger@' + (f ? (f.style.left + ',' + f.style.top) : '-'); } catch (e) { why = e.message; } return { kind: 'lit', q, d: desc(el), src, rec, f: !!(f && !f.hidden), why };
    }).catch(e => ({ kind: 'err', e: e.message }));
    if (s.kind === 'done') { over = true; break; }
    if (!NOWAIT && s.kind === 'lit' && s.src !== 'finger' && s.src !== 'button' && (wf = (wf || 0) + 1) < 7) { await sleep(250); continue; }
    wf = 0;
    if ((s.kind === 'btn' || s.kind === 'lit') && s.q) {
      if (s.d === global.__lastD) { global.__rep = (global.__rep || 0) + 1; if (global.__rep === 15) { console.log('REPEAT ' + s.kind + ' ' + s.src + ' ' + s.d + ' ' + (await p.evaluate(() => JSON.stringify({ q: G.q, sel: UI.sel && UI.sel.ms.length, cards: UI.cards.map(c => c.kind), phase: G.phase, acts: [...document.querySelectorAll('#acts button')].map(b => b.className + ':' + b.textContent.trim().slice(0, 15)) })).catch(e => e.message)).slice(0, 900)); await p.screenshot({ path: '/tmp/hbrep.png' }); } } else { global.__lastD = s.d; global.__rep = 0; }
      idle = 0; if (s.kind === 'lit' && process.env.SRCLOG) console.log('  tap', s.src, s.d, 'rec=' + s.rec, 'finger=' + s.f, s.src !== 'finger' ? s.why : ''); const before = await sig();
      if (process.env.EVLOG) await p.evaluate(() => { window.__ev = []; }); await p.touchscreen.tap(s.q.x, s.q.y); taps++;
      let changed = false; for (let k = 0; k < 10 && !changed; k++) { await sleep(120); changed = (await sig()) !== before; }
      if (!changed && s.kind === 'lit') { misses.push(s.d); if (process.env.EVLOG) console.log('MISS ' + s.d + '\n  ' + (await p.evaluate(() => window.__ev.join('\n  ') + '\n  state ' + JSON.stringify({anim: UI.animBusy, cards: UI.cards.length, q: G.q && G.q.kind, sel: !!UI.sel, drag: UI.pvDragEnd && Date.now() - UI.pvDragEnd})))); await p.screenshot({ path: '/tmp/hbmiss-' + gi + '-' + misses.length + '.png' }); }
      continue;
    }
    idle++; await sleep(250);
    if (idle > 120) { probs.push('stuck ' + JSON.stringify(s).slice(0, 140)); break; }
  }
  const fin = await p.evaluate(() => ({ glowAvg: (window.__gl || []).length ? ((window.__gl.reduce((a, b) => a + b, 0) / window.__gl.length).toFixed(1) + ' max ' + Math.max(...window.__gl)) : '-', over: !!(G && G.phase === 'over'), sc: G && G.phase === 'over' ? [0, 1].map(i => HB.score(G, i).total) : null, mode: UI.mode, city: G ? HB.cityCount(G, 0) : 0 }));
  await p.screenshot({ path: '/tmp/hbglow-end-' + gi + '.png' });
  if (!fin.over) probs.push('no result');
  console.log('game ' + (gi + 1) + ' mode=' + fin.mode + ' score ' + (fin.sc ? fin.sc.join('-') : '?') + ' city ' + fin.city + ' ' + (fin.sc && fin.sc[0] > fin.sc[1] ? 'WIN' : 'loss') + ' ' + VW + 'x' + VH + ' taps=' + taps + ' glowsPerTurn=' + fin.glowAvg + ' firstTapMisses=' + misses.length + ' ' + Math.round((Date.now() - t0) / 1000) + 's' + (misses.length ? ' MISS ' + misses.join(' | ') : '') + (probs.length ? ' PROB ' + probs.slice(0, 3).join(' | ') : ''));
  await ctx.close(); return { win: fin.sc && fin.sc[0] > fin.sc[1], miss: misses.length, bad: probs.length };
}
(async () => { const b = await PW.chromium.launch(); let w = 0, m = 0, bad = 0; for (let i = 0; i < N; i++) { const r = await game(b, i); w += r.win ? 1 : 0; m += r.miss; bad += r.bad; } await b.close(); console.log('SUMMARY wins ' + w + '/' + N + ' firstTapMisses ' + m + ' problems ' + bad); process.exit(m || bad ? 1 : 0); })();
