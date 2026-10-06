// Scripted sweep (no AI eyes): plays full landings through the real page with touch taps (some drags), only on things that glow, at phone sizes, with rotations.
//   NODE_PATH=/opt/node-tools/node_modules node sweep.js [games=24] [file=final-approach.html]      (ONLY=<n> plays one game, SHOTS=<dir> saves failures)
// Fails on: page errors, a glowing target that does not respond, anything stuck > 8 s, the ghost finger missing on the first move or pointing at the wrong thing,
// a slot label / seat badge / icon / marker that overlaps another (bounding boxes, every slot, every scenario), on-screen gauges that differ from the engine
// (needle, dial, brakes, coffee, rerolls, planes, altitude, plane marker, dice in slots), a status line or any visible text over 8 words, horizontal scroll,
// the cockpit under 55 % of a portrait screen, a missing end banner, a tip / advice card.
const { chromium } = require('playwright');
const path = require('path');
const N = +process.argv[2] || 24, FILE = path.resolve(__dirname, process.argv[3] || 'final-approach.html');
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const SIZES = [[390, 763], [375, 553]];
const sleep = ms => new Promise(r => setTimeout(r, ms));
const PAGE = `(() => {
  const vis = e => { const r = e.getBoundingClientRect(), s = getComputedStyle(e); return r.width > 3 && r.height > 3 && s.visibility !== 'hidden' && s.display !== 'none' && !e.closest('[hidden]') && +s.opacity > .05; };
  const ctr = e => { const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; };
  const words = t => (t || '').replace(/[^a-zA-Z0-9'’]+/g, ' ').trim().split(' ').filter(w => /[a-z][a-z]/i.test(w));
  const hit = (a, b, m) => a.left < b.right - m && a.right > b.left + m && a.top < b.bottom - m && a.bottom > b.top + m;
  window.__sw = {
    sig() { return JSON.stringify([G.phase, G.round, Object.keys(G.slots).length, G.turn, UI.sel, UI.cof, UI.busy ? 1 : 0, G.pend && G.pend.h, G.rrHand, UI.rrAsk ? 1 : 0, UI.warnK, (UI.rrm || []).join(''), G.ready.join(''), G.say.map(s => s.length).join(''), !!G.result, G.dice.map(d => d.map(x => x.u ? 1 : 0).join('')).join('/')]); },
    st() { const v = actSeat(); return { ph: G.phase, over: !!G.result, must: typeof v === 'number' && v >= 0 && mayAct(v) && FA.pending(G).includes(v), sel: UI.sel, pend: G.pend && G.pend.h, round: G.round, placed: Object.keys(G.slots).length, rs: !document.getElementById('rs').hidden, hold: !!(UI.hold && UI.hold.until > Date.now()), ending: document.getElementById('bd').classList.contains('ending') }; },
    // the AI's choice (the same one the ghost finger and Hint use)
    all() { const st = this.st(); return { st, warn: UI.warnK, need: (() => { const v = actSeat(); try { const mi = mandInfo(v); return mi && mi.tight ? mi.need : []; } catch (e) { return []; } })(), sig: this.sig(), cs: this.cands(), m: st.must && st.ph === 'place' && !st.pend && !st.hold ? this.aim() : null, to: (() => { try { const m = st.must && st.ph === 'place' && !st.pend && !st.hold ? this.aim() : null; if (!m) return null; const e = document.querySelector('#pz .slot[data-slot="' + m.to + '"]'); return e ? ctr(e) : null; } catch (e) { return null; } })() }; },
    aim() { const v = actSeat(); try { const m = FA.AI.move(G, v, 'normal', { noMC: true }); return m && m.t === 'place' ? m : null; } catch (e) { return null; } },
    cands() {
      const out = [], add = (sel, kind) => { for (const e of document.querySelectorAll(sel)) { if (!vis(e) || e.disabled) continue; const c = ctr(e); if (c.x < 0 || c.y < 0 || c.x > innerWidth || c.y > innerHeight) continue; const t = document.elementFromPoint(c.x, c.y); if (!t || !(e === t || e.contains(t) || t.contains(e))) continue; out.push({ kind, x: c.x, y: c.y, d: e.dataset.d, s: e.dataset.s, slot: e.dataset.slot, a: e.dataset.a, t: (e.innerText || '').trim().slice(0, 30) }); } };
      add('#pz .slot.legal', 'slot'); add('#pz .die.can', 'die'); add('#pz .die.sel', 'seldie'); add('#pz .die[data-d=p]:not(.cover)', 'pdie');
      add('#acts [data-a=ready]', 'ready'); add('#acts [data-a=rrpick]', 'rrpick'); add('#acts [data-a=rr]', 'rr'); add('#acts [data-a=toss]', 'toss'); add('#acts [data-a=hint]', 'hint'); add('#acts [data-a=again]', 'again'); add('#acts .cof [data-a=cof]', 'cof');
      return out;
    },
    // every pair of things on the cockpit that must not touch
    overlaps() {
      const bad = [];
      const slots = [...document.querySelectorAll('#pz .slot')].filter(vis);
      for (const s of slots) {
        const sr = s.getBoundingClientRect(), kids = [...s.querySelectorAll('.seat,.ic,.sl,.sw,.dv')].filter(vis), nm = s.dataset.slot;
        for (let i = 0; i < kids.length; i++) {
          const a = kids[i].getBoundingClientRect();
          if (kids[i].matches('.seat,.ic,.sl') && (a.left < sr.left - 1.5 || a.right > sr.right + 1.5 || a.top < sr.top - 1.5 || a.bottom > sr.bottom + 1.5)) bad.push('slot ' + nm + ' ' + kids[i].className + ' sticks out of the slot');
          for (let j = i + 1; j < kids.length; j++) { const b = kids[j].getBoundingClientRect(); if (hit(a, b, 0.5)) bad.push('slot ' + nm + ': ' + (kids[i].className.baseVal || kids[i].className) + ' overlaps ' + (kids[j].className.baseVal || kids[j].className)); }
        }
        const r1 = s.querySelector('.r1'); if (r1) { const w = r1.scrollWidth; if (w > sr.width + 1) bad.push('slot ' + nm + ' row too wide ' + w + '>' + Math.round(sr.width)); }
        const sl = s.querySelector('.sl'); if (sl && sl.scrollWidth > sl.clientWidth + 1 && sl.clientWidth > 0 && sl.getBoundingClientRect().width > sr.width + 1) bad.push('slot ' + nm + ' label wider than slot');
      }
      for (let i = 0; i < slots.length; i++) for (let j = i + 1; j < slots.length; j++) if (hit(slots[i].getBoundingClientRect(), slots[j].getBoundingClientRect(), 1)) bad.push('slots ' + slots[i].dataset.slot + ' and ' + slots[j].dataset.slot + ' overlap');
      const others = [...document.querySelectorAll('#pz .gau .mk,#pz .badge,#pz .dial,#pz .gau,#pz .hudc,#pz .tray,#pz .chipr,#pz .tokrow,#pz .bar')].filter(vis);
      for (const o of others) for (const s of slots) { const a = o.getBoundingClientRect(), b = s.getBoundingClientRect(); if (hit(a, b, 1.5) && !(o.matches('.gau') && false)) bad.push((o.className.baseVal || o.className) + ' overlaps slot ' + s.dataset.slot); }
      for (const m of document.querySelectorAll('#pz .gau .mk')) { const a = m.getBoundingClientRect(); for (const o of document.querySelectorAll('#pz .dial,#pz .badge,#pz .hudc')) if (vis(o) && hit(a, o.getBoundingClientRect(), 1.5)) bad.push('gauge marker overlaps ' + o.className); }
      return [...new Set(bad)];
    },
    audit() {
      const bad = [], W = innerWidth, H = innerHeight, de = document.documentElement;
      if (Math.max(de.scrollWidth, document.body.scrollWidth) > W + 1) bad.push('hscroll ' + de.scrollWidth + '>' + W);
      const bd = document.querySelector('[data-board]'); if (!bd) bad.push('no [data-board]');
      else if (H > W) { const r = bd.getBoundingClientRect(), pct = 100 * Math.min(r.right, W) * Math.max(0, Math.min(r.bottom, H) - Math.max(r.top, 0)) / (W * H); if (pct < 55) bad.push('board ' + pct.toFixed(1) + '%'); }
      for (const o of this.overlaps()) bad.push(o);
      // status line and any visible text block over 8 words (tips, advice, reports)
      const pr = words(document.getElementById('prompt').textContent); if (pr.length > 8) bad.push('status ' + pr.length + ' words: ' + pr.join(' '));
      const tip = document.getElementById('pc'); if (tip && vis(tip)) bad.push('a tip card is visible');
      const toast = document.getElementById('toast'); if (toast && toast.classList.contains('on') && words(toast.textContent).length > 8) bad.push('toast over 8 words: ' + toast.textContent);
      for (const e of document.body.querySelectorAll('*')) {
        if (/^(SCRIPT|STYLE|NOSCRIPT|SVG|TEXT|TSPAN|PATH)$/i.test(e.tagName) || !vis(e) || getComputedStyle(e).display.startsWith('inline')) continue;
        if (![...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) continue;
        if (e.closest('[class*=drawer],[class*=rules],[id$=log],[aria-modal=true],#rs,#start,.gx-camp,[class*=gxc]')) continue;
        const w = words(e.innerText); if (w.length > 8) bad.push('text block ' + w.length + ' words: ' + w.slice(0, 6).join(' '));
      }
      // the panel shows what the engine says
      if (!UI.started || !G) return bad;
      if (this.pp !== G.pl.pos || this.pk !== G.seed) { this.pp = G.pl.pos; this.pk = G.seed; this.pt = Date.now(); } const hold = !!UI.hold || Date.now() - this.pt < 2500;   // the plane marker waits for the speed to be announced
      const dial = document.querySelector('#pz .dial.axd i'); if (dial) { const m = /rotate\\((-?[\\d.]+)deg/.exec(dial.style.transform || ''); if (!m || Math.abs(+m[1] - G.pl.axis * 24) > .5) bad.push('axis dial ' + (m && m[1]) + ' vs engine axis ' + G.pl.axis); }
      const gau = document.querySelector('#pz .gau'); if (gau) {
        let es = 0; for (let i = G.events.length - 1; i >= 0; i--) if (G.events[i].t === 'engine') { es = G.events[i].s; break; }
        if (+gau.dataset.s !== es) bad.push('gauge needle ' + gau.dataset.s + ' vs engine speed ' + es); if (+gau.dataset.b !== G.pl.aeroB || +gau.dataset.o !== G.pl.aeroO) bad.push('gauge markers ' + gau.dataset.b + '/' + gau.dataset.o + ' vs ' + G.pl.aeroB + '/' + G.pl.aeroO);
        const mb = gau.querySelector('.mk.b'), mo = gau.querySelector('.mk.o'); if (mb && +mb.textContent.replace(/\\D/g, '') !== G.pl.aeroB) bad.push('blue marker text'); if (mo && +mo.textContent.replace(/\\D/g, '') !== G.pl.aeroO) bad.push('orange marker text');
      }
      const bk = document.querySelector('#pz .badge.brk b'); if (bk && +bk.textContent !== FA.brakeVal(G)) bad.push('brakes ' + bk.textContent + ' vs engine ' + FA.brakeVal(G));
      const cf = document.querySelectorAll('#pz .chipr .tk:not(.off)').length; if (document.querySelector('#pz .chipr') && cf !== G.coffee) bad.push('coffee tokens ' + cf + ' vs engine ' + G.coffee);
      const rb = document.querySelector('#pz .badge.rrb b'); if (rb && rb.textContent !== '×' + G.rrHand) bad.push('rerolls ' + rb.textContent + ' vs ' + G.rrHand);
      const sps = [...document.querySelectorAll('#pz .sp')]; sps.forEach((sp, i) => { const n = sp.querySelectorAll('.pl').length; if (n !== G.planes[i]) bad.push('planes on space ' + (i + 1) + ': ' + n + ' vs engine ' + G.planes[i]); });
      const you = sps.findIndex(sp => sp.classList.contains('you')); if (!hold && you + 1 !== G.pl.pos) bad.push('plane marker on space ' + (you + 1) + ' vs engine ' + G.pl.pos);
      const an = document.querySelector('#pz .altnow b'); if (an) { const R = D.alt[G.alt][G.round + G.row0]; if (parseInt(an.textContent) !== R[0]) bad.push('altitude ' + an.textContent + ' vs ' + R[0]); }
      for (const k of Object.keys(G.slots)) { const el = document.querySelector('#pz .slot[data-slot="' + k + '"] .dv'); if (!el) bad.push('placed die missing in ' + k); else if (+el.textContent !== G.slots[k].v) bad.push('slot ' + k + ' shows ' + el.textContent + ' vs ' + G.slots[k].v); }
      // glowing spaces = the engine's legal spaces for the picked die
      if (!UI.busy && typeof UI.sel === 'number' && UI.sel >= 0 && !G.pend && mayAct(actSeat())) { const want = selectedLegal().sort().join(','), have = [...document.querySelectorAll('#pz .slot.legal')].map(e => e.dataset.slot).sort().join(','); if (want !== have) bad.push('glowing spaces ' + have + ' vs legal ' + want); }
      return bad;
    },
    // the ghost finger points at the die / space the engine's suggestion names
    finger() {
      const f = document.querySelector('#fx .gh'); if (!f) return null; const m = this.aim(), v = actSeat(); if (!m) return 'finger without a suggestion';
      const bd = document.getElementById('bd').getBoundingClientRect(), die = document.querySelector('#pz .die[data-s="' + v + '"][data-d="' + m.d + '"]'), slot = document.querySelector('#pz .slot[data-slot="' + m.to + '"]'); if (!die) return 'finger: die not found';
      const dr = die.getBoundingClientRect(), x = parseFloat(f.style.left) + bd.left, y = parseFloat(f.style.top) + bd.top;
      if (Math.abs(x - (dr.left + dr.width / 2)) > 4 || Math.abs(y - (dr.top + dr.height / 2)) > 4) return 'finger not on the suggested die';
      if (f.classList.contains('go') && slot) { const sr = slot.getBoundingClientRect(), ex = x + parseFloat(f.style.getPropertyValue('--dx')), ey = y + parseFloat(f.style.getPropertyValue('--dy')); if (Math.abs(ex - (sr.left + sr.width / 2)) > 4 || Math.abs(ey - (sr.top + sr.height / 2)) > 4) return 'finger does not end on the suggested space'; }
      return 'ok';
    }
  };
})()`;

async function playGame(browser, size, gi) {
  let [W, H] = size; const tag = W + 'x' + H + ' g' + gi;
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, isMobile: true, hasTouch: true, userAgent: UA, serviceWorkers: 'block' });
  await ctx.addInitScript(() => { try { localStorage.setItem('fa_prefs', JSON.stringify({ prefs: { gfx: 'low' } })); } catch (e) { } });
  const page = await ctx.newPage(); const errs = [], issues = new Set(); const stats = { taps: 0, drags: 0, rr: 0, hints: 0, audits: 0, end: '?' };
  page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
  page.on('console', m => { if (m.type() === 'error' && !/net::|Failed to load|favicon/.test(m.text())) errs.push('console: ' + m.text().slice(0, 120)); });
  const shot = async why => { if (process.env.SHOTS) await page.screenshot({ path: path.join(process.env.SHOTS, tag.replace(/\W+/g, '_') + '_' + why.replace(/\W+/g, '_').slice(0, 30) + '.png') }).catch(() => { }); };
  try {
    await page.goto('file://' + FILE); await sleep(900);
    await page.evaluate(PAGE);
    const scs = await page.evaluate('D.scenarios.map(s=>s.id)'); const sc = scs[gi % scs.length];
    const camp = gi % 12 === 7, mode = gi % 6 === 5 ? 'guided' : 'vs', role = gi % 2, level = ['easy', 'normal', 'hard'][gi % 3];
    const drag = gi % 3 === 1, rot = gi % 4 === 2;
    await page.evaluate(`AIDELAY=160;UI.seed=${gi * 977 + 13};` + (camp ? `campStart(window.CAMPAIGN.chapters[${gi % 10}])` : `newGame('${mode}',{scenario:'${mode === 'guided' ? 'g1' : sc}',role:${mode === 'guided' ? 0 : role},level:'${level}'})`));
    await sleep(500);
    let last = '', lastAt = Date.now(), audits = 0, overAt = 0, ghostChecked = false, rotated = false, tries = {}, rrTaps = 0;
    const t0 = Date.now(), firstMoveWanted = !camp;
    while (Date.now() - t0 < 170000) {
      const all = await page.evaluate('__sw.all()'), st = all.st;
      if (st.over) { if (!overAt) overAt = Date.now(); if (Date.now() - overAt > 4200) break; }
      const sig = all.sig;
      if (sig !== last) { last = sig; lastAt = Date.now(); } else if (Date.now() - lastAt > 8000) { issues.add('stuck 8s: ' + JSON.stringify(st)); await shot('stuck'); break; }
      if (Date.now() - t0 > 700 && audits < 700 && !st.ending && (audits % 1 === 0)) { audits++; const bad = await page.evaluate('__sw.audit()'); for (const b of bad) { if (!issues.has(b)) await shot(b); issues.add(b); } }
      if (rot && !rotated && st.round >= 2 && st.ph === 'place') { rotated = true; await page.setViewportSize({ width: H, height: W }); await page.evaluate(() => { dispatchEvent(new Event('resize')); dispatchEvent(new Event('orientationchange')); }); await sleep(900); const bad = await page.evaluate('__sw.audit()'); for (const b of bad) issues.add('landscape: ' + b); await page.setViewportSize({ width: W, height: H }); await page.evaluate(() => { dispatchEvent(new Event('resize')); dispatchEvent(new Event('orientationchange')); }); await sleep(900); }
      if (st.over) { await sleep(200); continue; }
      if (st.must && st.ph === 'place' && !ghostChecked && firstMoveWanted && st.round === 0 && st.placed < 2 && st.sel === -1) {
        // the ghost finger must show the first move, and point at the right die
        let g = null; for (let k = 0; k < 12 && !g; k++) { g = await page.evaluate('__sw.finger()'); if (!g) await sleep(200); }
        ghostChecked = true; if (!g) issues.add('no ghost finger on the first move'); else if (g !== 'ok') issues.add(g);
      }
      const cs = all.cs;
      let pick = null; const by = k => cs.filter(c => c.kind === k);
      if (st.must && !st.hold) {
        if (st.ph === 'brief') pick = by('ready')[0];
        else if (st.pend === 'rr') { const m = by('die'); if (m.length && rrTaps < 2 && Math.random() < .6) { pick = m[Math.floor(Math.random() * m.length)]; rrTaps++; } else pick = by('rrpick')[0]; if (pick && pick.kind === 'rrpick') rrTaps = 0; }
        else if (st.pend === 'intern' || st.pend === 'sync') pick = st.sel === 'p' ? (by('slot')[0] ? by('slot')[Math.floor(Math.random() * by('slot').length)] : by('pdie')[0]) : (by('pdie')[0] || by('slot')[0]);
        else if (st.pend) pick = by('die')[0] || by('slot')[0];
        else if (st.sel === -1 || st.sel == null) {
          const dice = by('die');
          if (dice.length && gi % 5 === 3 && Math.random() < .08 && by('rr').length && stats.rr < 3) { stats.rr++; pick = by('rr')[0]; }
          else if (dice.length && Math.random() < .05 && by('hint').length && stats.hints < 4) { stats.hints++; pick = by('hint')[0]; }
          else if (dice.length && drag && all.m && !all.m.c && all.to && Math.random() < .7) { const dd = dice.find(d => +d.d === all.m.d); if (dd) { pick = { kind: 'dragdie', x: dd.x, y: dd.y, tx: all.to.x, ty: all.to.y, t: 'die ' + dd.d }; } }
          if (!pick && dice.length) { const m = all.m; const pd = m && Math.random() < .96 ? dice.find(d => +d.d === m.d) : null; pick = pd || dice[Math.floor(Math.random() * dice.length)]; }
        } else {
          const slots = by('slot'), m = all.m;
          const key = st.round + ':' + st.placed + ':' + st.sel; tries[key] = (tries[key] || 0) + 1;
          if (slots.length && tries[key] < 6) pick = slots.find(x => x.slot === all.warn) || (all.need.length ? slots.find(x => all.need.includes(x.slot)) : null) || (m && +st.sel === m.d && Math.random() < .96 ? slots.find(s => s.slot === m.to) : null) || slots[Math.floor(Math.random() * slots.length)];
          else if (by('toss')[0] && tries[key] >= 2) pick = by('toss')[0];
          else if (tries[key] >= 2 && by('seldie')[0]) pick = by('seldie')[0];   // nothing fits: put the die back and try another
          else if (by('cof').length && tries[key] === 1 && Math.random() < .5) pick = by('cof')[Math.floor(Math.random() * by('cof').length)];
        }
      } else if (st.over && by('again').length) pick = null;
      if (pick) {
        const before = sig; stats.taps++;
        if (pick.kind === 'dragdie') { await page.mouse.move(pick.x, pick.y); await page.mouse.down(); await page.mouse.move(pick.x, pick.y - 24, { steps: 3 }); await page.mouse.move(pick.tx, pick.ty, { steps: 8 }); await page.mouse.up(); stats.drags++; }
        else if (pick.kind === 'slot' && drag) {   // drag the picked die onto the space
          const sd = (await page.evaluate('__sw.cands()')).find(c => c.kind === 'seldie');
          if (sd) { await page.mouse.move(sd.x, sd.y); await page.mouse.down(); await page.mouse.move(sd.x, sd.y - 30, { steps: 3 }); await page.mouse.move(pick.x, pick.y, { steps: 6 }); await page.mouse.up(); stats.drags++; } else await page.touchscreen.tap(pick.x, pick.y);
        } else await page.touchscreen.tap(pick.x, pick.y);
        let changed = false; for (let k = 0; k < 16; k++) { await sleep(110); if ((await page.evaluate('__sw.sig()')) !== before) { changed = true; break; } }
        if (pick.kind === 'dragdie') { let ok = false; for (let k = 0; k < 14 && !ok; k++) { await sleep(120); ok = await page.evaluate('Object.keys(G.slots).length > ' + st.placed + ' || !!UI.warnK || !!G.pend || G.round !== ' + st.round); } if (!ok) { issues.add('dragging a die onto its glowing space did not place it'); await shot('drag'); } }
        if (!changed && pick.kind !== 'hint' && pick.kind !== 'dragdie') { const a2 = await page.evaluate('__sw.all()'); const same = a2.cs.find(c => c.kind === pick.kind && Math.abs(c.x - pick.x) < 3 && Math.abs(c.y - pick.y) < 3); if (a2.sig === before && same) { await page.touchscreen.tap(same.x, same.y); for (let k = 0; k < 14 && !changed; k++) { await sleep(110); if ((await page.evaluate('__sw.sig()')) !== before) changed = true; } } else changed = true; }   // the panel redraws under a finger now and then: one retry, then it is a dead tap
        if (!changed && pick.kind !== 'hint' && pick.kind !== 'dragdie') { const s2 = await page.evaluate('__sw.st()'); issues.add('dead tap on a glowing ' + pick.kind + ' (' + pick.t + ') ' + JSON.stringify(s2)); await shot('dead-tap'); }
      } else await sleep(140);
    }
    const fin = await page.evaluate('({over:!!G.result,win:G.result&&G.result.win,why:G.result&&G.result.why,round:G.round})');
    stats.end = fin.over ? (fin.win ? 'won' : 'lost:' + fin.why) : 'unfinished';
    if (!fin.over) issues.add('landing did not finish in 170 s: ' + JSON.stringify(await page.evaluate('({r:G.round,ph:G.phase,sel:UI.sel,cof:UI.cof,pend:G.pend&&G.pend.h,turn:G.turn,coffee:G.coffee,rr:G.rrHand,dice:G.dice.map(d=>d.map(x=>x.u?"-":x.v).join("")).join("/"),legal:selectedLegal(),moves:FA.validMoves(G,actSeat()).map(m=>m.t).filter((x,i,a)=>a.indexOf(x)===i)})')));
    else if (!camp) {
      const e = await page.evaluate(`(() => { const b = document.querySelector('#fx .endb'); const r = document.getElementById('rs'); return { banner: b ? b.innerText.trim() : null, again: !!document.querySelector('#acts [data-a=again]'), modal: !r.hidden }; })()`);
      if (!e.banner) { issues.add('no end banner on the board'); await shot('no-banner'); } else if (e.banner.split(/\s+/).length > 8) issues.add('end banner over 8 words: ' + e.banner);
      if (!e.again) issues.add('no Fly again button at the end'); if (e.modal) issues.add('a report panel opened at the end');
    }
  } catch (e) { issues.add('crash ' + String(e.message).slice(0, 120)); }
  try { await ctx.close(); } catch (e) { }
  return { tag, errs, issues: [...issues], stats, mode: gi % 6 === 5 ? 'guided' : gi % 12 === 7 ? 'story' : 'vs' };
}

(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const jobs = []; for (let g = 0; g < N; g++) if (!process.env.ONLY || +process.env.ONLY === g) jobs.push([SIZES[g % SIZES.length], g]);
  const results = []; let next = 0;
  const worker = async () => { while (next < jobs.length) { const [sz, g] = jobs[next++]; const r = await playGame(browser, sz, g); results.push(r); console.log((r.errs.length || r.issues.length ? 'FAIL ' : 'ok   ') + r.tag + ' ' + r.mode + ' ' + r.stats.end + ' taps ' + r.stats.taps + ' drags ' + r.stats.drags + (r.errs.length ? ' ERR ' + r.errs.join(' | ') : '') + (r.issues.length ? ' ISSUES ' + r.issues.slice(0, 6).join(' | ') : '')); } };
  await Promise.all([worker(), worker(), worker()]);
  await browser.close();
  const bad = results.filter(r => r.errs.length || r.issues.length);
  console.log('SWEEP ' + (bad.length ? 'FAIL' : 'PASS') + ': ' + results.length + ' landings, ' + bad.length + ' with problems; won ' + results.filter(r => r.stats.end === 'won').length + ', lost ' + results.filter(r => /^lost/.test(r.stats.end)).length);
  process.exit(bad.length ? 1 : 0);
})();
