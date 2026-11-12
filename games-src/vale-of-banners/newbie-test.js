// Whole Quick games on DEFAULTS by real touch taps (page.touchscreen.tap only), default rival speed.
// MODE=newbie: a newcomer who reads the screen (previews, glows) and ignores the star (tools/newbie-policy.js decides, taps execute).
// MODE=star: taps whatever carries the star every time. W/H = viewport. Prints result, scores, dead taps, errors.
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
const MODE = process.env.MODE || 'newbie', W = +process.env.W || 390, H = +process.env.H || 844, SEED = process.env.SEED;
const URL = 'file://' + path.join(__dirname, 'vale-of-banners.html') + (SEED ? '?seed=' + SEED : '');
const POLICY = fs.readFileSync(path.join(__dirname, 'tools', 'newbie-policy.js'), 'utf8');
(async () => {
  const b = await chromium.launch(), ctx = await b.newContext({ viewport: { width: W, height: H }, hasTouch: true, isMobile: true, deviceScaleFactor: 1 }), page = await ctx.newPage(), errs = [];
  page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push(m.text()); });
  await page.goto(URL); await page.evaluate(() => { localStorage.clear(); GXT.markDone('vale-of-banners'); }); await page.reload(); await page.waitForTimeout(500);
  await page.addScriptTag({ content: POLICY });
  const cov = {}; let dead = 0, covered = 0, decisions = 0, starSeen = 0, noStar = 0; const t0 = Date.now();
  const tapEl = async sel => {
    let r = await page.evaluate(s => { const e = document.querySelector(s); if (!e) return null; let b = e.getBoundingClientRect(); if (!b.width) return null; if (b.top < 0 || b.bottom > innerHeight || b.left < 0 || b.right > innerWidth) { e.scrollIntoView({ block: 'center', inline: 'center' }); b = e.getBoundingClientRect(); } const x = b.left + b.width / 2, y = b.top + b.height / 2, hit = document.elementFromPoint(x, y); return { x, y, ok: !!hit && (hit === e || e.contains(hit)), hit: hit ? (hit.id || String(hit.className).slice(0, 30)) : 'none' }; }, sel);
    if (!r) return false; if (!r.ok) { covered++; cov[sel.replace(/[0-9-]+$/, '') + ' by ' + r.hit] = (cov[sel.replace(/[0-9-]+$/, '') + ' by ' + r.hit] || 0) + 1; } await page.touchscreen.tap(r.x, r.y); await page.waitForTimeout(260); return true;
  };
  const tvBtn = async () => { await page.waitForTimeout(150); if (await page.evaluate(() => !document.getElementById('tv').hidden)) { if (!(await tapEl('#tv .acts .btn:not(.alt)'))) await tapEl('#tvClose'); } };
  const tab = async t => { if (await page.$('#tab-' + t)) await tapEl('#tab-' + t); };
  await tapEl('#quickB'); await tapEl('#goB'); await page.waitForTimeout(600);
  const ai = await page.evaluate(() => G.seats[1].ai + ' / hints ' + (UI.hintsOn ? 'on' : 'off'));
  let guard = 0;
  while (guard++ < 4000) {
    const st = await page.evaluate(() => ({ over: G.over && !!document.querySelector('#rs:not([hidden]), .rs, #result') || (G.over && UI.over), gover: G.over, mine: !!myTurn(), tv: !document.getElementById('tv').hidden, seq: G.seq, star: (() => { const l = [].slice.call(document.querySelectorAll('.bestx,.bestt,.cell.best')).map(e => e.id).filter(x => x && !/^tab-/.test(x)); return l[0] || null; })(), endB: !!document.getElementById('endB'), skip: !!document.getElementById('skipB') }));
    if (st.gover) break;
    if (st.tv) { await tvBtn(); if (await page.$('#goalB')) await tapEl('#goalB'); continue; }
    if (!st.mine) { await page.waitForTimeout(120); continue; }
    decisions++;
    if (MODE === 'star') {
      if (st.star) { starSeen++; const sid = st.star; if (/^(mt-|bl-|gs-)/.test(sid)) await tab('market'); await tapEl('#' + sid); await tvBtn(); }
      else { noStar++; if (st.endB) await tapEl('#endB'); else if (st.skip) await tapEl('#skipB'); else await page.waitForTimeout(150); }
    } else {
      const m = await page.evaluate(() => NEWBIE.pick(VB, G)); if (!m) { await page.waitForTimeout(150); continue; }
      const p = await page.evaluate(() => ({ die: UI.die, dice: G.P[VB.actor(G)].dice, pend: !!pend() }));
      const selDie = async () => { if (typeof m.die === 'number' && !p.pend && p.die !== m.die) await tapEl('#die-' + m.die); };
      if (m.k === 'end') await tapEl('#endB');
      else if (m.k === 'skip') await tapEl('#skipB');
      else if (m.k === 'workers') { if (m.die === 'x') await tapEl('#wkxB'); else if (!(await tapEl('#wk' + m.die))) await tapEl('#wk' + (1 - m.die)); }
      else if (m.k === 'take' || m.k === 'grab') { await selDie(); await tab('market'); await tapEl('#mt-' + m.v + '-' + m.slot); await tvBtn(); }
      else if (m.k === 'buy') { await tab('market'); await tapEl('#bl-' + m.slot); await tvBtn(); }
      else if (m.k === 'place') { await selDie(); await tapEl('#st-' + m.s); await tapEl('#ec-' + m.cell); }
      else if (m.k === 'sell') { await selDie(); await tapEl('#gd-' + m.v); await tvBtn(); }
      else if (m.k === 'ship') { await tab('market'); await tapEl('#gs-' + m.v); }
      else if (m.k === 'discard') { await tapEl('#st-' + m.s); await tvBtn(); }
    }
    await page.waitForTimeout(200);
    const after = await page.evaluate(() => G.seq);
    if (after === st.seq) { dead++; if (dead > 60) { console.log('STUCK', JSON.stringify(await page.evaluate(() => ({ vm: VB.validMoves(G).slice(0, 6), hm: hardMove(), tv: !document.getElementById('tv').hidden, pend: pend(), die: UI.die, sel: UI.sel, dice: G.P[VB.actor(G)].dice, used: G.P[VB.actor(G)].used })))); break; } }
  }
  await page.waitForTimeout(1500);
  const res = await page.evaluate(() => ({ over: G.over, me: G.P[0].vp, rival: G.P[1].vp, won: G.winner === 0 }));
  const shot = path.join(__dirname, 'playable-shots', 'gameplay', `fix4-${MODE}-${W}.png`); fs.mkdirSync(path.dirname(shot), { recursive: true }); await page.screenshot({ path: shot });
  console.log(`${MODE} ${W}x${H} rival ${ai}: ${res.over ? (res.won ? 'WON' : 'LOST') : 'NOT OVER'} ${res.me}-${res.rival}, ${decisions} decisions, star seen ${starSeen}, no star ${noStar}, no-progress taps ${dead}, covered ${covered}, ${((Date.now() - t0) / 60000).toFixed(1)} min, covers ${JSON.stringify(cov)}, errors ${errs.length}${errs.length ? ': ' + errs.slice(0, 2).join(' | ') : ''}`);
  await b.close(); process.exit(res.over && !errs.length ? 0 : 1);
})();
