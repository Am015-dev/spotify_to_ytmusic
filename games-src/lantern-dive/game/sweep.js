// Scripted sweep (no AI eyes): plays full dives through the real page with touch taps, only on things that glow, at phone sizes.
//   NODE_PATH=/opt/node-tools/node_modules node sweep.js [games=40] [file=lantern-dive.html]
// Fails on: page errors, a glowing target that does not respond, a status line over 8 words, seat badges that differ from the engine,
// help kit (gx-help): a fresh profile sees each phase's coach bubble once (short, pointing at its target, never covering it or a glowing thing, gone on a tap); the bulb's finger = the advisor's
// move, why <= 15 words, rules 2-4 cards <= 20 words with a picture; a tips-off game never shows a bubble; anything stuck > 8 s, a hand card off screen, horizontal scroll, a seat or a button covering a trick card, the table under 55 % of a portrait screen.
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
      for (const e of document.querySelectorAll('#hand .hc')) { const r = e.getBoundingClientRect(), t = document.elementFromPoint(r.left + r.width * .4, r.top + r.height * .55); const t2 = document.elementFromPoint(r.left + r.width * .5, r.top + r.height * .5); if (t2 && t2.classList && t2.classList.contains('pspot')) bad.push('a ping spot covers the middle of a card'); if (t && t.classList && t.classList.contains('pspot') && !e.contains(t)) bad.push('a ping spot covers the body of another card'); }
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
      if (window.__tipsOff && document.querySelector('.gxh-bub')) bad.push('tips are off but a bubble shows');
      return bad;
    }
  };
})()`;


const wc = t => String(t || '').replace(/[^a-zA-Z0-9'’+]+/g, ' ').trim().split(' ').filter(Boolean).length;
// ---- help kit checks (bubble per phase once, bulb finger = the advisor's move, rules cards)
async function helpFlow(page, st, ctl, tapAt, W, H) {
  const { seenPh, issues, stats, tipsOn } = ctl; const note = m => issues.add(m);
  const hs = await page.evaluate(() => ({ ph: hlpPhase(), step: !!HLP_STEPS[hlpPhase()], st: GXH.state() }));
  if (hs.st.rules) { note('rules overlay stuck open'); await page.evaluate(() => GXH.hide()); return false; }
  if (!hs.ph) return false;
  // 1) the first-time bubble of this phase
  if (tipsOn && hs.step && !seenPh.has(hs.ph)) {
    seenPh.add(hs.ph); let b = null; const t1 = Date.now();
    while (Date.now() - t1 < 2500) {
      b = await page.evaluate(ph => { const e = document.querySelector('.gxh-bub.on[data-phase]'); if (!e) return null; const te = HLP_STEPS[ph].target(); const tq = te && te.getBoundingClientRect(); const T = tq && { left: tq.left, top: tq.top, right: tq.right, bottom: tq.bottom }; const r = e.getBoundingClientRect();
        const glows = [...document.querySelectorAll('.glow,.pspot,#acts .btn')].filter(g => g.getBoundingClientRect().width > 3 && !g.closest('[hidden]')).map(g => { const q = g.getBoundingClientRect(); return { l: q.left + q.width * .25, r: q.right - q.width * .25, t: q.top + q.height * .25, b: q.bottom - q.height * .25 }; });
        return { id: e.dataset.phase, title: e.querySelector('.gxh-tt').textContent, text: e.querySelector('.gxh-tx').textContent, arrow: !!e.querySelector('.gxh-arr'), ok: !!e.querySelector('.gxh-ok'), r: [r.left, r.top, r.right, r.bottom], T, glows }; }, hs.ph).catch(() => null);
      if (b) break; await sleep(80);
      if ((await page.evaluate(() => hlpPhase()).catch(() => null)) !== hs.ph) return false;   // the moment passed
    }
    if (!b) issues.add('no coach bubble for phase ' + hs.ph);
    else {
      stats.bubbles[hs.ph] = (stats.bubbles[hs.ph] || 0) + 1;
      if (b.id !== hs.ph) note('bubble for ' + b.id + ' shown in phase ' + hs.ph);
      if (wc(b.title) > 4) note('bubble title over 4 words: ' + b.title);
      if (wc(b.text) > 20) note('bubble text over 20 words (' + wc(b.text) + '): ' + b.text);
      if (!b.arrow || !b.ok) note('bubble without arrow or Got it (' + hs.ph + ')');
      const [l, t, r, bt] = b.r;
      if (b.T && l < b.T.right && r > b.T.left && t < b.T.bottom && bt > b.T.top) note('bubble covers its target (' + hs.ph + ')');
      for (const g of b.glows) if (l < g.r && r > g.l && t < g.b && bt > g.t) { note('bubble covers a glowing thing (' + hs.ph + ')'); break; }
      if (l < -1 || r > W + 1 || t < -1 || bt > H + 1) note('bubble off screen (' + hs.ph + ')');
      await tapAt(60, 16); await sleep(150);
      if (await page.evaluate(() => !!document.querySelector('.gxh-bub'))) note('bubble did not dismiss on a tap (' + hs.ph + ')');
      return true;
    }
  }
  // 2) the lightbulb: the first time in every phase, then now and then
  if (!(ctl.bulbN < 16 && (!seenPh.has('bulb:' + hs.ph) || Math.random() < .2))) return false;
  seenPh.add('bulb:' + hs.ph); ctl.bulbN++; stats.bulbs++;
  const pre = await page.evaluate(() => { const v = viewSeat(); const c = r => { const e = r && (typeof r === 'function' ? r() : r); if (!e) return null; const q = e.getBoundingClientRect(); return { x: q.left + q.width / 2, y: q.top + q.height / 2 }; };
    let adv = null; try { adv = LD.AI.choose(G, v, 'normal'); } catch (e) { } const p = hlpPlan();
    return { sig: JSON.stringify([G.phase, G.logN, G.tricks.length, G.trick ? G.trick.plays.length : -1]), adv: adv && [adv.t, adv.c, adv.i, adv.on, adv.dir].join(','), has: !!p, mv: p && [p.m.t, p.m.c, p.m.i, p.m.on, p.m.dir].join(','), legal: p && myMoves().some(x => x.t === p.m.t && x.c === p.m.c && x.i === p.m.i), to: p && c(p.to), from: p && p.from ? c(p.from) : null, tut: UI.mode === 'guided' && tutOnly() >= 0 }; });
  const bb = await page.evaluate(() => { const e = document.querySelector('#bulbbtn'); if (!e) return null; const r = e.getBoundingClientRect(); return r.width ? [r.left + r.width / 2, r.top + r.height / 2] : null; });
  if (!bb) { note('no visible bulb button'); return false; }
  await tapAt(...bb); await sleep(380);
  const r = await page.evaluate(() => { const f = document.querySelector('.gxh-finger'), b = document.querySelector('.gxh-bub.on'), ru = document.querySelector('.gxh-rules');
    return { f: f && { ...f.dataset }, ring: document.querySelectorAll('.gxh-ring').length, why: b && b.querySelector('.gxh-tx').textContent, link: !!(b && b.querySelector('.gxh-link')), rules: !!ru, sig: JSON.stringify([G.phase, G.logN, G.tricks.length, G.trick ? G.trick.plays.length : -1]) }; });
  if (pre.has) {
    if (!pre.tut && pre.mv !== pre.adv.replace(/,$/, '') && pre.mv !== pre.adv) note('bulb suggestion ' + pre.mv + ' differs from the advisor ' + pre.adv + ' (' + hs.ph + ')');
    if (!pre.legal) note('bulb suggestion not legal (' + pre.mv + ')');
    if (!r.f) { if (!r.rules) note('bulb tapped, no finger and no rules (' + hs.ph + ')'); }
    else {
      if (pre.to && (Math.abs(+r.f.tx - pre.to.x) > 3 || Math.abs(+r.f.ty - pre.to.y) > 3)) note('bulb finger target ' + r.f.tx + ',' + r.f.ty + ' != suggestion ' + Math.round(pre.to.x) + ',' + Math.round(pre.to.y) + ' (' + hs.ph + ')');
      if (pre.from && (!r.f.fx || Math.abs(+r.f.fx - pre.from.x) > 3 || Math.abs(+r.f.fy - pre.from.y) > 3)) note('bulb finger start != the suggested card (' + hs.ph + ')');
      if (!r.ring) note('bulb: nothing glows at the suggestion (' + hs.ph + ')');
      if (!r.why || wc(r.why) > 15) note('bulb why ' + wc(r.why) + ' words: ' + r.why);
      if (!r.link) note('bulb bubble has no "How does this work?"');
      stats.bulbHints++;
    }
  } else {
    stats.bulbNull++; stats.nullPh[hs.ph] = 1;
    if (r.f) note('bulb with no suggestion still pointed a finger (' + hs.ph + ')');
    if (!r.rules) note('bulb with no suggestion did not open the rules (' + hs.ph + ')');
  }
  // the rules cards (from the bubble link, or already open)
  if (!r.rules && r.link && Math.random() < .6) { await page.evaluate(() => document.querySelector('.gxh-link').click()); await sleep(250); }
  if (await page.evaluate(() => !!document.querySelector('.gxh-rules'))) {
    stats.rules++;
    const R = await page.evaluate(() => { const e = document.querySelector('.gxh-rules'); const n = +e.dataset.count, out = [];
      for (let i = 0; i < n; i++) { out.push({ t: e.querySelector('.gxh-rt').textContent, x: e.querySelector('.gxh-rx').textContent, pic: !!e.querySelector('.gxh-pic svg') }); if (i < n - 1) e.querySelector('.gxh-next').click(); }
      const q = e.querySelector('.gxh-card').getBoundingClientRect(); return { n, cards: out, inside: q.left >= 0 && q.right <= innerWidth && q.top >= 0 && q.bottom <= innerHeight }; });
    if (R.n < 2 || R.n > 4) note('rules for ' + hs.ph + ' have ' + R.n + ' cards (want 2-4)');
    R.cards.forEach(c => { if (wc(c.x) > 20) note('rules card over 20 words (' + hs.ph + '): ' + c.x); if (!c.pic) note('rules card without a picture (' + hs.ph + '): ' + c.t); });
    if (!R.inside) note('rules card outside the screen (' + hs.ph + ')');
    await page.evaluate(() => document.querySelector('.gxh-rules .gxh-x').click()); await sleep(100);
    if (await page.evaluate(() => !!document.querySelector('.gxh-rules'))) note('rules cards did not close');
  }
  await page.evaluate(() => GXH.hide());
  if (await page.evaluate(() => !!document.querySelector('.gxh-bub,.gxh-ring,.gxh-finger,.gxh-rules'))) note('help still on screen after hide (' + hs.ph + ')');
  const a = await page.evaluate(() => JSON.stringify([G.phase, G.logN, G.tricks.length, G.trick ? G.trick.plays.length : -1]));
  if (a !== pre.sig && !pre.sig.includes('"play"')) { /* the computer may have moved meanwhile; only the human's seat matters */ }
  return true;
}

async function playGame(browser, size, gi, rep) {
  const [W, H] = size, tag = W + 'x' + H + ' g' + gi;
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: UA, serviceWorkers: 'block' });
  const page = await ctx.newPage(); const errs = [], issues = new Set(); const stats = { taps: 0, tricks: 0, kinds: {}, bubbles: {}, bulbs: 0, bulbHints: 0, bulbNull: 0, nullPh: {}, rules: 0 };
  const tipsOn = gi % 5 !== 4, ctl = { seenPh: new Set(), issues, stats, tipsOn, bulbN: 0 };
  const tapAt = (x, y) => page.touchscreen.tap(x, y);
  page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
  page.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 120)); });
  try {
    await page.goto('file://' + FILE); await sleep(900);
    await page.evaluate(PAGE);
    const mission = MISSIONS[gi % MISSIONS.length], np = NPS[gi % NPS.length], mode = 'vs';
    await page.evaluate(`AIDELAY=${160};UI.seed=${gi * 977 + 11};UI.fingerOn=${gi % 3 === 0};newGame('${mode}',{np:${np},mission:${mission},kind:'log',level:'${['easy', 'normal', 'hard'][gi % 3]}'})`);
    if (!tipsOn) await page.evaluate(() => { window.__tipsOff = true; GXH.setEnabled(false); });
    let last = '', lastAt = Date.now(), noCand = 0, audits = 0, overAt = 0;
    const t0 = Date.now();
    while (Date.now() - t0 < 150000) {
      const st = await page.evaluate('__sw.st()');
      if (st.ph === 'over') { if (!overAt) overAt = Date.now(); if (Date.now() - overAt > 1800) break; }
      const sig = await page.evaluate('__sw.sig()');
      if (sig !== last) { last = sig; lastAt = Date.now(); noCand = 0; } else if (Date.now() - lastAt > 8000) { issues.add('stuck 8s in ' + st.ph + ' (must ' + st.must + ', busy ' + st.busy + ') ' + JSON.stringify(await page.evaluate('({sel:UI.sel,ps:UI.pingSel,gs:UI.giveSel,gx:GXH.state(),hp:hlpPhase(),cands:__sw.cands().map(c=>c.kind+c.t),dlg:!!UI.dlg,pop:!!UI.pop,toast:document.getElementById("toast").textContent,top:(document.elementFromPoint(innerWidth/2,innerHeight*.8)||{}).className})').catch(e => String(e)))); break; }
      if (Date.now() - t0 > 900 && audits < 400) { audits++; const bad = await page.evaluate('__sw.audit()'); for (const b of bad) issues.add(b); }
      if (st.ph === 'over') { await sleep(150); continue; }
      if (st.must && !st.busy && !st.dlg && (await helpFlow(page, st, ctl, tapAt, W, H))) continue;
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
        if (pick.kind === 'card' && st.ph === 'play' && gi % 4 === 1 && Math.random() < .4) {   // drag it onto the table
          await page.mouse.move(pick.x, pick.y); await page.mouse.down(); await page.mouse.move(pick.x, pick.y - 60, { steps: 4 }); await page.mouse.move(W / 2, H * .4, { steps: 6 }); await page.mouse.up(); stats.kinds.drag = (stats.kinds.drag || 0) + 1;
        } else await page.touchscreen.tap(pick.x, pick.y);
        let changed = false; for (let k = 0; k < 14; k++) { await sleep(110); if ((await page.evaluate('__sw.sig()')) !== before) { changed = true; break; } }
        const stt = await page.evaluate('__sw.st()'); if (!changed && pick.kind !== 'ping' && !stt.busy) issues.add('dead tap on a glowing ' + pick.kind + ' (' + pick.t + ') in ' + st.ph + ' ' + JSON.stringify(await page.evaluate('({toast:document.getElementById("toast").textContent,busy:UI.busy,must:iMustAct(),turn:G.trick&&G.trick.turn,pl:G.trick&&G.trick.plays.length,sel:UI.sel,pop:!!UI.pop,dragging:!!document.querySelector(".hc.drag"),cl:UI.noClickUntil>Date.now()})')) + ' kind=' + pick.kind);
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
  const tb = {}, tp = {}; let bn = 0, bh = 0, bl = 0, rl = 0; for (const r of results) { for (const k in r.stats.bubbles) tb[k] = (tb[k] || 0) + r.stats.bubbles[k]; for (const k in r.stats.nullPh) tp[k] = 1; bn += r.stats.bulbs; bh += r.stats.bulbHints; bl += r.stats.bulbNull; rl += r.stats.rules; }
  console.log('HELP bubbles ' + JSON.stringify(tb) + ' | bulb taps ' + bn + ' (with finger ' + bh + ', rules only ' + bl + ' in ' + Object.keys(tp).join('/') + ') | rules cards opened ' + rl);
  console.log('SWEEP ' + (bad.length ? 'FAIL' : 'PASS') + ': ' + results.length + ' games, ' + bad.length + ' with problems; won ' + results.filter(r => r.stats.end === 'won').length + ', lost ' + results.filter(r => r.stats.end === 'lost').length);
  process.exit(bad.length ? 1 : 0);
})();
