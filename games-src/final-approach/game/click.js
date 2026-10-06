// Random clicker (jsdom): humans play ONLY through the page's buttons, dice and spaces.
// node click.js [from] [to] [seeds] [--anim]   -> one line per game, then TOTAL errors / hidden-dice violations / stalls
// --anim runs with ANIM=1 (the real timelines, no Web Animations in jsdom); default is ANIM=0 (instant). Both are part of the required runs.
let JSDOM, VirtualConsole;
try { ({ JSDOM, VirtualConsole } = require('../../node_modules/jsdom')); } catch (e) { try { ({ JSDOM, VirtualConsole } = require('../../kaiten/node_modules/jsdom')); } catch (e2) { ({ JSDOM, VirtualConsole } = require('jsdom')); } }
const fs = require('fs'); const path = require('path');
const html = fs.readFileSync(path.join(__dirname, 'final-approach.html'), 'utf8');
const ANIMON = process.argv.includes('--anim');
const CONF = [
  { name: 'guided', start: 'guided' },
  { name: 'vs g2 normal', start: 'vs', sc: 'g2' },
  { name: 'vs y1 easy', start: 'vs', sc: 'y1', level: 'easy' },
  { name: 'vs r2 hard', start: 'vs', sc: 'r2', level: 'hard' },
  { name: 'vs kerosene (g4)', start: 'vs', sc: 'g4' },
  { name: 'vs wind (y3)', start: 'vs', sc: 'y3' },
  { name: 'vs trainee (g5)', start: 'vs', sc: 'g5' },
  { name: 'vs ice brakes (y4)', start: 'vs', sc: 'y4' },
  { name: 'vs real-time + fuel (r1)', start: 'vs', sc: 'r1' },
  { name: 'hot g3', start: 'hot', sc: 'g3' },
  { name: 'hot y2', start: 'hot', sc: 'y2' },
  { name: 'watch g4', start: 'ai', sc: 'g4' },
  { name: 'watch r1 hard', start: 'ai', sc: 'r1', level: 'hard' },
  { name: 'PHONE guided', start: 'guided', phone: 1 },
  { name: 'PHONE vs g2', start: 'vs', sc: 'g2', phone: 1 },
  { name: 'PHONE hot y3', start: 'hot', sc: 'y3', phone: 1 },
  { name: 'PHONE vs r4 landscape', start: 'vs', sc: 'r4', phone: 1, land: 1 },
  { name: 'PHONE vs b1 landscape', start: 'vs', sc: 'b1', phone: 1, land: 1 }];
function run(cf, seed) {
  return new Promise(res => {
    const errs = []; const vc = new VirtualConsole();
    vc.on('jsdomError', e => errs.push('JSDOM ' + String(e.message).slice(0, 200) + (e.detail ? String(e.detail.stack || e.detail).slice(0, 300) : '')));
    vc.on('error', e => errs.push('console.error ' + String(e).slice(0, 200)));
    const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://gns.test/' + (cf.phone ? '?phone=1' : ''), virtualConsole: vc, beforeParse(win) { if (cf.phone) { Object.defineProperty(win, 'innerWidth', { value: cf.land ? 844 : 390, configurable: true }); Object.defineProperty(win, 'innerHeight', { value: cf.land ? 390 : 844, configurable: true }); } } });
    const w = dom.window, d = w.document;
    const click = el => el.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
    let s0 = seed * 7919 + 13; const R = () => { s0 = (s0 * 16807) % 2147483647; return (s0 - 1) / 2147483646; }; const rnd = a => a[Math.floor(R() * a.length)];
    const seen = new Set(); let overSince = 0, overWait = 0, hidden = 0, clicks = 0, steps = 0, stall = 0, last = '', replayed = 0, placed = 0; const t0 = Date.now(); let iv;
    const fin = r => { clearInterval(iv); res(Object.assign({ cf, errs, seen, clicks, hidden, placed, secs: Math.round((Date.now() - t0) / 1000) }, r || {})); try { w.close(); } catch (e) { } };
    w.addEventListener('load', () => {
      try {
        w.eval(`ANIM=${ANIMON ? 1 : 0};AIDELAY=${ANIMON ? 40 : 0};UI.seed=${seed};FA.AI.NMC={top:2,samples:1};FA.AI.HMC={top:2,samples:2}`);   // smaller Monte Carlo: this test is about the page, not the AI's strength
        if (process.env.CLICKDBG) w.eval(`var __c=closeRS; closeRS=function(){ if(G&&G.result) console.log('closeRS during result: '+new Error().stack.split('\\n').slice(2,5).join(' | ')); return __c.apply(this, arguments)}`);
        if (!d.querySelector('#start [data-a=play]')) errs.push('no Play button on the title');
        if (d.querySelector('#start [data-a=loadsave]')) errs.push('Resume shown without a save');
        click(d.querySelector('[data-a=play]')); seen.add('title->setup');
        const phm = w.eval('isPh()'); if (cf.phone && !phm) errs.push('phone mode off on a phone');
        if (phm) { const c = d.querySelector('[data-a=cfgopen]'); if (!c) errs.push('no Configure button on the phone setup'); else { click(c); if (d.querySelector('#cfg').hidden) errs.push('Configure did not open'); seen.add('configure'); } }
        if (cf.sc) { w.eval(`UI.opt = Object.assign(UI.opt || {}, { scenario: '${cf.sc}' })`); const sb = d.querySelector(`[data-a=scen][data-v="${cf.sc}"]`); if (sb) { click(sb); seen.add('pick scenario'); } }
        if (cf.level) { const lb = d.querySelector(`[data-a=level][data-v="${cf.level}"]`); if (lb) click(lb); }
        if (phm) { click(d.querySelector('[data-a=cfgclose]')); if (!d.querySelector('#cfg').hidden) errs.push('Configure did not close'); }
        click(d.querySelector(`[data-start=${cf.start}]`)); if (!w.eval('UI.started')) errs.push('start click failed');
        if (cf.sc && cf.start !== 'guided' && w.eval('G.sid') !== cf.sc) errs.push('scenario not set: ' + w.eval('G.sid'));
        if (cf.phone && !d.documentElement.classList.contains('ph')) errs.push('phone class missing');
        iv = setInterval(() => {
          try {
            const G = w.eval('G'); if (!G) return; steps++; if (!G.result) overSince = 0;
            if (process.env.CLICKDBG && steps % 400 === 0) console.log('dbg', cf.name, 'steps', steps, 'round', G.round, 'phase', G.phase, 'pend', JSON.stringify(G.pend && G.pend.h), 'turn', G.turn, 'ready', JSON.stringify(G.ready), 'clicks', clicks, 'placed', placed, 'rs', !d.querySelector('#rs').hidden, 'busy', w.eval('UI.busy'), 'mode', w.eval('UI.mode'), 'secs', Math.round((Date.now() - t0) / 1000));
            const v = w.eval('viewSeat()'), hot = w.eval("UI.mode === 'hot'"), holder = w.eval('UI.holder');
            // hidden dice: a die face with a number must belong to the viewer (or everyone is shown in watch mode)
            for (const el of d.querySelectorAll('#pz .die:not([data-d="p"])')) {   // the trainee token / cross-check die are public
              const s = +el.getAttribute('data-s'), dv = el.querySelector('.dv'); if (dv && /^[1-6]$/.test(dv.textContent) && v !== 'all' && s !== v) { hidden++; if (errs.length < 6) errs.push('HIDDEN die of seat ' + s + ' visible to ' + v); } if (dv && /^[1-6]$/.test(dv.textContent) && hot && holder < 0) { hidden++; errs.push('die shown with no holder'); } }
            const rsOpen = !d.querySelector('#rs').hidden;
            const q = s => [...d.querySelectorAll(s)].filter(b => !b.disabled && !b.closest('[hidden]'));
            if (!rsOpen || !G.result) { const inv = w.eval('FA.checkInvariants(G)'); if (inv.length && errs.length < 5) errs.push('INV ' + inv[0]); }
            if (rsOpen) {
              const fin2 = d.querySelector('#rs [data-a=again]');
              if (G.result && w.eval('UI.overShown') && fin2) {
                seen.add('final'); if (!replayed && R() < .25 && cf.start !== 'ai') { replayed = 1; click(fin2); seen.add('again'); if (w.eval('!!G.result')) errs.push('again did not start'); return; }
                return fin({ over: w.eval('({win:G.result.win,why:G.result.why,round:G.round})') });
              }
              const cl = d.querySelector('#rs [data-a=rsclose]'); if (cl && !G.result) click(cl); return;
            }
            if (G.result) {   // the ending is on the board now: a banner of at most 8 words and the Fly again button (no report panel)
              const ag = d.querySelector('#acts [data-a=again]'), bn = d.querySelector('#fx .endb');
              if (w.eval('UI.overShown') && ag && bn) { if (bn.textContent.trim().split(/\s+/).length > 8) errs.push('end banner over 8 words'); seen.add('final'); if (!replayed && R() < .25 && cf.start !== 'ai') { replayed = 1; click(ag); seen.add('again'); if (w.eval('!!G.result')) errs.push('again did not start'); return; } return fin({ over: w.eval('({win:G.result.win,why:G.result.why,round:G.round})') }); }
            }
            if (G.result) { if (!overSince) overSince = Date.now(); if (!w.eval('UI.busy') && Date.now() - overSince > 4000) { errs.push('over but no end banner or Fly again: overShown=' + w.eval('UI.overShown') + ' rsOpen=' + w.eval('UI.rsOpen') + ' rsHidden=' + d.querySelector('#rs').hidden + ' rsClass=' + d.querySelector('#rs').className + ' mode=' + w.eval('UI.mode') + ' started=' + w.eval('UI.started') + ' why=' + (G.result && G.result.why)); fin({}); } return; }
            const pass = q('#pass [data-a=take]'); if (pass.length) { click(pass[0]); seen.add('pass card'); clicks++; return; }
            const tip = q('#pc [data-a=tipok],#pc [data-a=tipoff]'); if (tip.length) { click(R() < .8 ? tip[0] : tip[tip.length - 1]); seen.add('tip'); clicks++; return; }
            const seats = w.eval('FA.pending(G).filter(s => !G.ai[s])');
            const act = w.eval('actSeat()'); const mine = seats.includes(act);   // hot-seat: the holder, or the seat deciding on the shared screen (briefing, public tokens)
            if (mine) {
              const r = R();
              if (r < .02) { const t = rnd(q('.gx-bar [data-gx]')); if (t) { click(t); seen.add('drawer:' + t.dataset.gx); const x = d.querySelector('.gx-drawer.on .gx-x'); if (x) click(x); } return; }
              if (r < .04) { const sp = q('#pz .sp'); if (sp.length) { click(rnd(sp)); seen.add('space'); return; } }
              // most of the time the computer crew logic suggests the move and it is carried out with real taps (so the game reaches the later rounds); the rest is random
              if (G.phase !== 'brief' && R() < .8) {
                const seat = act, mv = w.eval(`FA.AI.move(G, ${seat}, 'normal', { noMC: true })`), dieBtn = i => d.querySelector(`#pz .die[data-s="${seat}"][data-d="${i}"]:not([disabled])`);
                if (mv && mv.t === 'place') { const b = dieBtn(mv.d); if (b) { click(b); w.eval(`UI.cof=${mv.c || 0};render()`); const sl = d.querySelector(`#pz .slot[data-slot="${mv.to}"]`); if (sl) { click(sl); placed++; clicks++; seen.add('place (suggested)'); return; } } }
                else if (mv && mv.t === 'rr') { const b = q('#acts [data-a=rr]'); if (b.length) { click(b[0]); seen.add('reroll'); return; } }
                else if (mv && mv.t === 'rrpick') { const cur = w.eval('UI.rrm.slice()'); let did = false; mv.m.forEach((on, i) => { if (on !== !!cur[i]) { const b = dieBtn(i); if (b && !did) { click(b); did = true; } } }); if (did) return; const rp = q('#acts [data-a=rrpick]'); if (rp.length) { click(rp[0]); seen.add('reroll confirm'); return; } }
                else if (mv && ['toss', 'antic', 'adapt', 'wt', 'wt2'].includes(mv.t)) { const b = dieBtn(mv.d); if (b) { click(b); const a = q(`#acts [data-a=${mv.t}]`); if (a.length) { click(a[0]); seen.add('act:' + mv.t); return; } } }
              }
              const sel = w.eval('UI.sel'), legal = q('#pz .slot.legal');
              if (typeof sel === 'number' && sel !== -1 || sel === 'p') {
                if (r < .12) { const cf2 = q('#dock [data-a=cof]'); if (cf2.length) { click(rnd(cf2)); seen.add('coffee chip'); return; } }
                if (r < .2) { const ab = q('#acts [data-a=antic],#acts [data-a=adapt],#acts [data-a=wt],#acts [data-a=toss]'); if (ab.length) { const a = rnd(ab); click(a); seen.add('act:' + a.dataset.a); clicks++; return; } }
                if (legal.length) { click(rnd(legal)); placed++; clicks++; seen.add('place'); return; }
              }
              if (G.phase === 'brief') { if (r < .3) { const sy = q('#says [data-a=say],.say'); if (sy.length) { click(rnd(sy)); seen.add('say'); return; } } const rd = q('#acts [data-a=ready]'); if (rd.length) { click(rd[0]); seen.add('ready'); clicks++; return; } return; }
              const rp = q('#acts [data-a=rrpick]'); if (rp.length) { const dd = q('#pz .die'); if (R() < .6 && dd.length) click(rnd(dd)); else { click(rp[0]); seen.add('reroll confirm'); } clicks++; return; }
              if (r < .26) { const hb = q('#acts [data-a=hint]'); if (hb.length) { click(hb[0]); seen.add('hint'); return; } }
              if (r < .3) { const rr = q('#acts [data-a=rr]'); if (rr.length) { click(rr[0]); seen.add('reroll'); return; } }
              const dice = q('#pz .die'); if (dice.length) { click(rnd(dice)); clicks++; seen.add('die'); }
              return;
            }
            const sig = JSON.stringify([G.round, G.turn, G.logN, G.phase, G.pend && G.pend.h, w.eval('UI.holder'), w.eval('UI.busy'), rsOpen]);
            if (sig === last) stall++; else { stall = 0; last = sig; }
            if (stall > (ANIMON ? 6000 : 4000) || Date.now() - t0 > (ANIMON ? 800000 : 280000)) { errs.push('STALL r' + G.round + ' phase ' + G.phase + ' pend ' + JSON.stringify(G.pend && G.pend.h) + ' turn ' + G.turn); fin({ over: false }); }
          } catch (e) { errs.push('LOOP ' + String(e.stack || e).slice(0, 500)); fin({}); }
        }, 1);
      } catch (e) { errs.push('BOOT ' + e.stack); fin({}); }
    });
  });
}
(async () => {
  const a = +(process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : 0), b = +(process.argv[3] && !process.argv[3].startsWith('--') ? process.argv[3] : CONF.length - 1), NS = +(process.argv[4] && !process.argv[4].startsWith('--') ? process.argv[4] : 1);
  const all = new Set(); let bad = 0, n = 0, hid = 0, stalls = 0, notOver = 0; const T = Date.now();
  for (let i = a; i <= b && i < CONF.length; i++) for (let sd = 0; sd < NS; sd++) {
    const cf = CONF[i]; const r = await run(cf, 100 + i + sd * 1000); n++; r.seen.forEach(x => all.add(x)); bad += r.errs.length; hid += r.hidden || 0; stalls += r.errs.filter(e => /^STALL/.test(e)).length; if (!r.over) notOver++;
    console.log(`[${i}.${sd}] ${cf.name}${ANIMON ? ' (anim)' : ''}: ${r.over ? JSON.stringify(r.over) : 'NOT OVER'} placed ${r.placed} clicks ${r.clicks} ${r.secs}s hidden ${r.hidden} errors ${r.errs.length} ${JSON.stringify(r.errs.slice(0, 3))}`);
  }
  console.log('TOTAL games', n, 'errors', bad, 'stalls', stalls, 'not finished', notOver, 'hidden-dice violations', hid, 'time', Math.round((Date.now() - T) / 1000) + 's', ANIMON ? '(ANIM=1)' : '(ANIM=0)');
  console.log('seen:', [...all].sort().join(' | '));
  process.exitCode = (bad || notOver || hid) ? 1 : 0;
})();
