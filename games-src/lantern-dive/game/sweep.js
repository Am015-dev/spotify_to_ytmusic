// Scripted sweep (no AI eyes): plays full dives through the real page with touch taps, only on things that glow, at phone sizes.
//   NODE_PATH=/opt/node-tools/node_modules node sweep.js [games=40] [file=lantern-dive.html]
// Fails on: page errors, a glowing target that does not respond, a status line over 8 words, seat badges that differ from the engine,
// anything stuck > 8 s, a hand card off screen, horizontal scroll, a seat or a button covering a trick card, the table under 55 % of a portrait screen.
const { chromium } = require('playwright');
const path = require('path');
const N = +process.argv[2] || 40, FILE = path.resolve(__dirname, process.argv[3] || 'lantern-dive.html');
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const SIZES = [[390, 763], [375, 553]];
const MISSIONS = [1, 2, 3, 5, 6, 7, 9, 10, 11, 13, 14, 17, 19, 21, 25, 26, 28, 4, 8, 12, 15, 16, 18, 20, 22, 23, 24, 27, 29, 30];
const NPS = [4, 3, 5, 2, 4, 3, 5, 4];
const sleep = ms => new Promise(r => setTimeout(r, ms));
const PAGE = `(() => {
  const vis = e => { const r = e.getBoundingClientRect(), s = getComputedStyle(e); return r.width > 3 && r.height > 3 && s.visibility !== 'hidden' && s.display !== 'none' && !e.closest('[hidden]'); };
  window.__sw = {
    sig() { return JSON.stringify([G.phase, G.tricks.length, G.trick ? G.trick.plays.length : -1, G.tasks.map(t => t.owner).join(''), G.pings.length, UI.busy ? 1 : 0, !!UI.fz, G.players.map(p => p.hand.length).join(','), UI.dlg ? 1 : 0, UI.cards.length, document.getElementById('prompt').textContent]); },
    st() { return { ph: G.phase, must: iMustAct(), busy: UI.busy, dlg: !!UI.dlg, cards: UI.cards.length, rs: !document.getElementById('rs').hidden, tr: G.tricks.length, pl: G.trick ? G.trick.plays.length : -1 }; },
    cands() {
      const out = [], add = (sel, kind) => { for (const e of document.querySelectorAll(sel)) { if (!vis(e) || e.disabled) continue; const r = e.getBoundingClientRect(); const x = r.left + r.width / 2, y = r.top + r.height / 2; if (x < 0 || y < 0 || x > innerWidth || y > innerHeight) continue; const t = document.elementFromPoint(x, y); if (t && t !== e && !e.contains(t) && !t.contains(e)) continue; out.push({ kind, x, y, t: (e.getAttribute('aria-label') || e.textContent || '').slice(0, 30) }); } };
      add('#pool .jcard.glow', 'job'); add('.pspot', 'ping'); add('#hand .hc.glow', 'card'); add('#opp .dc.glow', 'dcard'); add('.seat.glow', 'seat'); add('.me.glow', 'me'); add('#acts button', 'btn'); add('#rs button', 'rs'); add('#dlg button', 'dlg'); add('#pass button', 'pass');
      return out;
    },
    audit() {
      const bad = [], W = innerWidth, H = innerHeight, de = document.documentElement;
      if (Math.max(de.scrollWidth, document.body.scrollWidth) > W + 1) bad.push('hscroll ' + de.scrollWidth + '>' + W);
      const tb = document.getElementById('table'); const tr = tb.getBoundingClientRect();
      if (H > W) { const pct = 100 * Math.min(tr.right, W) * Math.max(0, Math.min(tr.bottom, H) - Math.max(tr.top, 0)) / (W * H); if (pct < 55) bad.push('table ' + pct.toFixed(1) + '% h=' + Math.round(tr.height) + ' mine=' + Math.round(document.getElementById('mine').getBoundingClientRect().height) + ' hand=' + Math.round(document.getElementById('handz').getBoundingClientRect().height) + ' ph=' + G.phase + ' bd=' + Math.round(document.getElementById('bd').getBoundingClientRect().height) + ' ih=' + innerHeight + ' kids=' + [...document.getElementById('bd').children].map(c => c.id + ':' + Math.round(c.getBoundingClientRect().height)).join(',')); }
      for (const e of document.querySelectorAll('#hand .hc')) { const r = e.getBoundingClientRect(); if (r.left < -1 || r.right > W + 1 || r.bottom > H + 1 || r.top < 0) bad.push('hand card off screen ' + Math.round(r.left) + ',' + Math.round(r.right) + ',' + Math.round(r.bottom)); }
      const seats = [...document.querySelectorAll('#opp .seat')].filter(vis), slots = [...document.querySelectorAll('.tslot')].filter(vis), btns = [...document.querySelectorAll('#acts button')].filter(vis);
      const ov = (a, b, m) => a.left < b.right - m && a.right > b.left + m && a.top < b.bottom - m && a.bottom > b.top + m;
      for (const s of seats) { const r = s.getBoundingClientRect(); if (r.left < -1 || r.right > W + 1 || r.top < tr.top - 1) bad.push('seat clipped ' + Math.round(r.left) + ',' + Math.round(r.right)); for (const t of slots) if (ov(r, t.getBoundingClientRect(), 4)) bad.push('seat covers a trick slot'); }
      if (!document.getElementById('pool').hidden) for (const s of seats) { const p = document.getElementById('pool').getBoundingClientRect(); const r = s.getBoundingClientRect(); for (const c of document.querySelectorAll('#pool .jcard')) if (ov(r, c.getBoundingClientRect(), 4)) bad.push('seat covers a job card'); }
      for (const b of btns) { const r = b.getBoundingClientRect(); for (const t of slots) if (ov(r, t.getBoundingClientRect(), 4)) { const q = t.getBoundingClientRect(); bad.push('button covers a trick slot btn=' + [r.left, r.top, r.right, r.bottom].map(Math.round) + ' slot=' + [q.left, q.top, q.right, q.bottom].map(Math.round) + ' ph=' + G.phase + ' ' + b.textContent); } for (const s of seats) if (ov(r, s.getBoundingClientRect(), 2)) bad.push('button covers a seat'); if (r.right > W + 1 || r.left < -1) bad.push('button off screen'); }
      const pr = document.getElementById('prompt').textContent.replace(/[^a-zA-Z0-9'’]+/g, ' ').trim().split(' ').filter(Boolean); if (pr.length > 8) bad.push('status ' + pr.length + ' words: ' + pr.join(' '));
      // badges equal the engine (not while a trick is being swept)
      if (!UI.busy && !UI.fz && !G.tasks.some((t, i) => UI.holdJobs && UI.holdJobs.has(i))) {
        const tw = new Array(G.np).fill(0); for (const k of G.tricks) tw[k.w]++;
        for (const s of document.querySelectorAll('#opp [data-seat]')) { const id = +s.dataset.seat; if (!G.players[id]) continue; const t = s.querySelector('.bdg.t b'), n = s.querySelector('.bdg.n b'); if (t && +t.textContent !== tw[id]) bad.push('tricks badge ' + t.textContent + ' != ' + tw[id]); if (n && +n.textContent !== G.players[id].hand.length) bad.push('cards badge ' + n.textContent + ' != ' + G.players[id].hand.length); }
        const me = document.querySelector('#mine .me'); if (me && G.phase !== 'over') { const id = +me.dataset.seat, t = me.querySelector('.bdg.t b'); if (t && +t.textContent !== tw[id]) bad.push('my tricks badge ' + t.textContent + ' != ' + tw[id]); }
        // job tokens agree with the engine
        document.querySelectorAll('[data-job]').forEach(e => { const i = +e.dataset.job, st = LD.jobStatus(G, i), has = e.classList.contains('ok') ? 1 : e.classList.contains('bad') ? -1 : 0; if (G.phase !== 'over' && has !== (st > 0 ? 1 : st < 0 ? -1 : 0)) bad.push('job token ' + i + ' shows ' + has + ' engine ' + st); });
      }
      // the finger points at what the engine would do (or at nothing)
      const f = document.getElementById('finger');
      if (f && !f.hidden) { const t = fingerTarget(); if (!t) bad.push('finger without a target'); else { const el = document.querySelector(t.sel); if (el) { const r = el.getBoundingClientRect(), fr = f.getBoundingClientRect(); if (Math.abs(parseFloat(f.style.left) - (r.left + r.width / 2)) > 6) bad.push('finger off its target'); } } }
      return bad;
    }
  };
})()`;

async function playGame(browser, size, gi, rep) {
  const [W, H] = size, tag = W + 'x' + H + ' g' + gi;
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: UA, serviceWorkers: 'block' });
  const page = await ctx.newPage(); const errs = [], issues = new Set(); const stats = { taps: 0, tricks: 0, kinds: {} };
  page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
  page.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 120)); });
  try {
    await page.goto('file://' + FILE); await sleep(900);
    await page.evaluate(PAGE);
    const mission = MISSIONS[gi % MISSIONS.length], np = NPS[gi % NPS.length], mode = gi % 11 === 5 ? 'guided' : 'vs';
    await page.evaluate(`AIDELAY=${160};UI.seed=${gi * 977 + 11};UI.fingerOn=${gi % 3 === 0};newGame('${mode}',{np:${np},mission:${mission},kind:'log',level:'${['easy', 'normal', 'hard'][gi % 3]}'})`);
    let last = '', lastAt = Date.now(), noCand = 0, audits = 0, overAt = 0;
    const t0 = Date.now();
    while (Date.now() - t0 < 150000) {
      const st = await page.evaluate('__sw.st()');
      if (st.ph === 'over') { if (!overAt) overAt = Date.now(); if (Date.now() - overAt > 1800) break; }
      const sig = await page.evaluate('__sw.sig()');
      if (sig !== last) { last = sig; lastAt = Date.now(); noCand = 0; } else if (Date.now() - lastAt > 8000) { issues.add('stuck 8s in ' + st.ph + ' (must ' + st.must + ', busy ' + st.busy + ')'); break; }
      if (Date.now() - t0 > 900 && audits < 400) { audits++; const bad = await page.evaluate('__sw.audit()'); for (const b of bad) issues.add(b); }
      if (st.ph === 'over') { await sleep(150); continue; }
      const cs = await page.evaluate('__sw.cands()');
      const play = cs.filter(c => !['rs', 'dlg', 'pass'].includes(c.kind)), modal = cs.filter(c => ['dlg', 'pass'].includes(c.kind));
      let pick = null;
      if (modal.length) pick = modal[0];
      else if (st.must && !st.busy && play.length) {
        // never tap a ping spot unless nothing else is on offer or by chance; prefer moves in this order: jobs, cards, seats, buttons
        const byKind = k => play.filter(c => c.kind === k);
        const pings = byKind('ping');
        if (pings.length && Math.random() < .25) pick = pings[0];
        else pick = byKind('job')[0] || byKind('card')[Math.floor(Math.random() * byKind('card').length)] || byKind('dcard')[0] || byKind('seat')[0] || byKind('me')[0] || (() => { const b = byKind('btn'); return b.length ? (Math.random() < .7 ? b[0] : b[Math.floor(Math.random() * b.length)]) : null; })() || pings[0];
      }
      if (pick) {
        const before = await page.evaluate('__sw.sig()'); stats.taps++; stats.kinds[pick.kind] = (stats.kinds[pick.kind] || 0) + 1;
        if (pick.kind === 'card' && gi % 4 === 1 && Math.random() < .4) {   // drag it onto the table
          await page.mouse.move(pick.x, pick.y); await page.mouse.down(); await page.mouse.move(pick.x, pick.y - 60, { steps: 4 }); await page.mouse.move(W / 2, H * .4, { steps: 6 }); await page.mouse.up(); stats.kinds.drag = (stats.kinds.drag || 0) + 1;
        } else await page.touchscreen.tap(pick.x, pick.y);
        let changed = false; for (let k = 0; k < 14; k++) { await sleep(110); if ((await page.evaluate('__sw.sig()')) !== before) { changed = true; break; } }
        const stt = await page.evaluate('__sw.st()'); if (!changed && pick.kind !== 'ping' && !stt.busy) issues.add('dead tap on a glowing ' + pick.kind + ' (' + pick.t + ') in ' + st.ph);
      } else {
        if (st.must && !st.busy && !st.dlg) { noCand++; if (noCand > 14) { issues.add('nothing to tap in ' + st.ph + ' although it is my turn'); break; } }
        await sleep(150);
      }
    }
    const fin = await page.evaluate('({ph:G.phase,tr:G.tricks.length,ok:G.result&&G.result.ok})'); stats.tricks = fin.tr; stats.end = fin.ph === 'over' ? (fin.ok ? 'won' : 'lost') : 'unfinished';
    if (fin.ph !== 'over') issues.add('dive did not finish in 150 s');
  } catch (e) { issues.add('crash ' + String(e.message).slice(0, 100)); }
  await ctx.close();
  return { tag, mission: MISSIONS[gi % MISSIONS.length], np: NPS[gi % NPS.length], errs, issues: [...issues], stats };
}

(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const jobs = []; for (let g = 0; g < N; g++) if (!process.env.ONLY || +process.env.ONLY === g) jobs.push([SIZES[g % SIZES.length], g]);
  const results = []; let next = 0;
  const worker = async () => { while (next < jobs.length) { const [sz, g] = jobs[next++]; const r = await playGame(browser, sz, g); results.push(r); console.log((r.errs.length || r.issues.length ? 'FAIL ' : 'ok   ') + r.tag + ' dive ' + r.mission + ' ' + r.np + 'p ' + (r.stats.end || '') + ' taps ' + r.stats.taps + ' ' + JSON.stringify(r.stats.kinds) + (r.errs.length ? ' ERR ' + [...new Set(r.errs)].slice(0, 2).join(' | ') : '') + (r.issues.length ? ' ISSUES ' + r.issues.slice(0, 4).join(' | ') : '')); } };
  await Promise.all([worker(), worker(), worker()]);
  await browser.close();
  const bad = results.filter(r => r.errs.length || r.issues.length);
  console.log('SWEEP ' + (bad.length ? 'FAIL' : 'PASS') + ': ' + results.length + ' games, ' + bad.length + ' with problems; won ' + results.filter(r => r.stats.end === 'won').length + ', lost ' + results.filter(r => r.stats.end === 'lost').length);
  process.exit(bad.length ? 1 : 0);
})();
