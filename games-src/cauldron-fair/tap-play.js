// Plays a Quick game and Story chapter 1 to the result using ONLY real taps on visible, uncovered UI (touchscreen.tap at the element's centre,
// after elementFromPoint says the element is what is under the finger). It reads G only to decide Draw vs Stop. Usage: node tap-play.js [WxH=390x763] [quick|story|both]
// Needs a static server for the page or the built file; here: the built html through a route. Exit 1 on failure.
const PW = (() => { try { return require('playwright'); } catch (e) { return require('/home/user/spotify_to_ytmusic/games-src/node_modules/playwright'); } })();
const fs = require('fs');
const html = fs.readFileSync(__dirname + '/cauldron-fair.html');
const [W, H] = (process.argv[2] || '390x763').split('x').map(Number); const which = process.argv[3] || 'both';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const errs = [], covered = new Set(); let taps = 0;
const PICK = `(() => {
  const vis = e => { const r = e.getBoundingClientRect(); return r.width > 8 && r.height > 8 && getComputedStyle(e).visibility !== 'hidden' && !e.disabled && !e.closest('[hidden]') && r.bottom > 0 && r.top < innerHeight; };
  const all = s => [...document.querySelectorAll(s)].filter(vis);
  const mode = window.__tapmode;
  const first = (...sels) => { for (const s of sels) { const e = all(s)[0]; if (e) return e; } return null; };
  const byText = (sel, re) => all(sel).find(e => re.test(e.textContent.trim()));
  let e = null, why = '';
  const rs = document.querySelector('#rs'), rsOpen = rs && !rs.hidden;
  const start = document.querySelector('#start'), startOpen = start && !start.hidden;
  const skip = all('[data-gxt-skip]')[0];
  // the tutorial prologue (Story, first time): leave it with Skip (a real button)
  if (skip && mode === 'story') { e = skip; why = 'skip tutorial'; }
  const endb = all('[data-gxt-end]')[0]; if (!e && endb) { e = endb; why = 'tutorial end'; }
  if (!e && G && G.phase === 'over' && rsOpen && document.querySelector('#rs .win') && (mode !== 'story' || UI.camp)) return { done: 'over' };
  if (!e && rsOpen) {
    const act = first('#rs [data-a=take]', '#rs [data-a=hotgo]'); if (act) { e = act; why = 'take'; }
    if (!e) { const c = first('#rs [data-a=rscont]:not(.off)'); if (c) { e = c; why = 'continue report'; } }
    if (!e) { const b = first('#rs [data-a=shopbuy]'); if (b) { const s = all('#rs [data-a=shopsel]')[0]; if (s && !(UI.shopSel && UI.shopSel.length)) { e = s; why = 'pick chip'; } else { e = b; why = 'confirm shop'; } } }
    if (!e) { e = first('#rs .dec [data-a=mv]', '#rs [data-a=mv]'); why = 'report choice'; }
  }
  const gxc = document.querySelector('.gxc-ov:not([hidden]), #gxc:not([hidden]), [class*=gxc-ov]:not([hidden])');
  if (!e && !rsOpen && !startOpen) {
    const tip = first('#pc [data-a=tipok]', '#pc [data-a=take]', '.gxh-ok'); if (tip) { e = tip; why = 'tip'; }
    if (!e) {
      const acts = all('#acts [data-a=mv],#qbox [data-a=mv]');
      if (acts.length) {
        const d = acts.find(b => /Draw/.test(b.textContent)), s = acts.find(b => /^\\s*Stop/.test(b.textContent));
        const me = G.players[0]; const ws = CF.whiteSum(me);
        if (d && s) { e = (me.pot.length >= 3 || ws >= 5) ? s : d; why = e === s ? 'stop' : 'draw'; } else { e = acts[0]; why = 'choice'; }
      }
    }
  }
  // story overlays and the start screen
  if (!e) { const o = all('.gxc-btn.go,.gxc-btn,.gxc-scene button,.gxc-sheet button,[class*=gxc] button').filter(b => !b.closest('.gxc-nodes')).filter(b => /^(Next|Continue|Play|Start|Begin|Let|Go|Brew|Ready|Close|OK|Got it|Again|Back to)/i.test(b.textContent.trim()) && !/Back$/.test(b.textContent.trim()))[0]; if (o) { e = o; why = 'story: ' + o.textContent.trim().slice(0, 18); } }
  if (!e) { const n = all('.gxc-node.a')[0]; if (n && mode === 'story') { e = n; why = 'chapter node'; } }
  if (!e && startOpen) { const s = mode === 'story' ? first('#start [data-a=story]') : (byText('#start button', /Start the fair/) || first('#start [data-a=start]')); if (s) { e = s; why = 'start'; } }
  if (!e) { const bk = all('button').find(b => /^\s*Back to your cauldron/i.test(b.textContent)); if (bk) { e = bk; why = 'back to my cauldron'; } }
  if (!e) return { wait: 1 };
  const r = e.getBoundingClientRect(); const cx = Math.round(r.left + r.width / 2), cy = Math.round(Math.min(Math.max(r.top + r.height / 2, 2), innerHeight - 2));
  const top = document.elementFromPoint(cx, cy);
  return { cx, cy, why, ok: !!top && (top === e || e.contains(top) || top.contains(e)), under: top ? (top.id || top.className || top.tagName).toString().slice(0, 40) : 'none', txt: e.textContent.trim().slice(0, 24) };
})()`;
async function play(browser, name, mode) {
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, isMobile: W < 600, hasTouch: true });
  await ctx.route('**/*', r => { const u = new URL(r.request().url()); if (u.host !== 'gns.test') return r.abort(); const f = require('path').join(__dirname, '../../games/cauldron-fair', u.pathname); if (u.pathname.length > 1 && require('fs').existsSync(f) && require('fs').statSync(f).isFile()) return r.fulfill({ path: f }); return r.fulfill({ status: 200, contentType: 'text/html', body: html }); });
  const p = await ctx.newPage(); p.setDefaultTimeout(15000);
  p.on('pageerror', e => errs.push(name + ' pageerror ' + e.message)); p.on('console', m => { if (m.type() === 'error' && !/net::|Failed to load/.test(m.text())) errs.push(name + ' console ' + m.text().slice(0, 160)); });
  await p.goto('https://gns.test/?phone=1'); await sleep(900); await p.evaluate(m => { try { localStorage.clear(); } catch (e) { } window.__tapmode = m; }, mode);
  // title screen: tap Play (quick) or Story (story)
  const first = mode === 'story' ? 'text=Story' : '[data-a=play]';
  const box = await p.locator(first).first().boundingBox(); await p.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2); await sleep(700);
  let over = false, idle = 0, log = [];
  const t0 = Date.now();
  for (let i = 0; i < 900 && Date.now() - t0 < 420000; i++) {
    const r = await p.evaluate(PICK).catch(e => ({ wait: 1, err: e.message }));
    if (r.done) { over = true; break; }
    if (r.wait) { idle++; if (idle > 80) { log.push('STUCK'); await p.screenshot({ path: (process.env.SHOT || '/tmp') + '/stuck-' + name + '.png' }).catch(() => { }); console.log('btns', await p.evaluate(() => [...document.querySelectorAll('button')].filter(b => b.getBoundingClientRect().width).map(b => (b.className + '|' + b.textContent.trim().slice(0, 14))).slice(0, 24).join(' ; ')).catch(() => ''));
 console.log('state', await p.evaluate(() => JSON.stringify({ G: !!G, ph: G && G.phase, r: G && G.round, rs: !document.querySelector('#rs').hidden, q: G && G.players[0].q, st: G && G.players[0].st, txt: document.body.innerText.slice(0, 200) })).catch(e => String(e))); break; } await sleep(250); continue; }
    idle = 0;
    if (!r.ok) { covered.add(name + ':' + r.why + ' under ' + r.under); await sleep(300); if (++idle > 60) break; continue; }
    if (process.env.GSHOTS && name === 'quick') { const k = await p.evaluate(() => G && G.phase === 'brew' && !UI.rsOpen ? (G.round === 1 && G.players[0].pot.length === 1 ? 'first-turn' : G.round === 5 && G.players[0].pot.length === 3 ? 'mid-game' : '') : ''); if (k && !(play.sh = play.sh || {})[k]) { play.sh[k] = 1; await sleep(500); await p.screenshot({ path: process.env.GSHOTS + '/' + k + '.png' }); } }
    await p.touchscreen.tap(r.cx, r.cy); taps++; if (log.length < 400) log.push(r.why); await sleep(r.why === 'draw' ? 700 : r.why === 'got it' ? 600 : 450);
  }
  const mode0 = mode;
  const res = await p.evaluate(mode0 => G ? { phase: G.phase, over: mode0 === 'coach' && !!document.querySelector('#coachend'), round: G.round, vp: G.players.map(x => x.vp), camp: !!UI.camp, winText: G.winText } : null, mode).catch(() => null);
  if (process.env.GSHOTS && name === 'quick' && over) { await sleep(1200); await p.screenshot({ path: process.env.GSHOTS + '/result.png' }); }
  console.log(name, over ? 'REACHED RESULT' : 'NOT REACHED', JSON.stringify(res), 'taps', taps); console.log('  last steps:', log.slice(-12).join(' > '));
  await ctx.close(); return over && res && (res.phase === 'over' || res.over) && (name !== 'story' || res.camp);
}
(async () => {
  const b = await PW.chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  let ok = true;
  if (which !== 'story') ok = (await play(b, 'quick', 'quick')) && ok;
  if (which !== 'quick') ok = (await play(b, 'story', 'story')) && ok;
  console.log('covered taps:', JSON.stringify([...covered].slice(0, 10))); console.log('errors:', JSON.stringify(errs.slice(0, 6)));
  console.log(ok && !errs.length && !covered.size ? 'TAP-PLAY PASS' : 'TAP-PLAY FAIL'); await b.close(); process.exit(ok && !errs.length ? 0 : 1);
})();
