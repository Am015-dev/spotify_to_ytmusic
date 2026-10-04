// Random clicker (jsdom): humans play ONLY through the page's buttons, cards, jobs and chips.
// node click.js [from] [to] [seeds] [--anim]   -> one line per game, then TOTAL errors / hidden-hand violations / stalls
// --anim runs with ANIM=1 (the real timelines, no Web Animations in jsdom); default is ANIM=0 (instant). Both are part of the required runs.
let JSDOM, VirtualConsole;
try { ({ JSDOM, VirtualConsole } = require('../../node_modules/jsdom')); } catch (e) { ({ JSDOM, VirtualConsole } = require('jsdom')); }
const fs = require('fs'); const path = require('path');
const html = fs.readFileSync(path.join(__dirname, 'lantern-dive.html'), 'utf8');
const ANIMON = process.argv.includes('--anim');
const CONF = [
  { name: 'guided', start: 'guided' },
  { name: 'vs 2p dive 3 (drone)', start: 'vs', np: 2, mission: 3 },
  { name: 'vs 3p dive 7 easy', start: 'vs', np: 3, mission: 7, level: 'easy' },
  { name: 'vs 4p dive 10 (commander call) hard', start: 'vs', np: 4, mission: 10, level: 'hard' },
  { name: 'vs 5p dive 17 (open briefing)', start: 'vs', np: 5, mission: 17 },
  { name: 'hot 2p dive 5', start: 'hot', np: 2, mission: 5 },
  { name: 'hot 4p dive 6 (vote)', start: 'hot', np: 4, mission: 6 },
  { name: 'hot 5p dive 9 (murky)', start: 'hot', np: 5, mission: 9 },
  { name: 'watch 3p dive 14', start: 'ai', np: 3, mission: 14 },
  { name: 'watch 5p dive 26 hard', start: 'ai', np: 5, mission: 26, level: 'hard' },
  { name: 'vs 4p dive 11 (narcosis)', start: 'vs', np: 4, mission: 11 },
  { name: 'vs 3p dive 19 + 25 style', start: 'vs', np: 3, mission: 25 },
  { name: 'PHONE guided', start: 'guided', phone: 1 },
  { name: 'PHONE vs 3p dive 7', start: 'vs', np: 3, mission: 7, phone: 1 },
  { name: 'PHONE hot 3p dive 8', start: 'hot', np: 3, mission: 8, phone: 1 },
  { name: 'PHONE vs 5p dive 20', start: 'vs', np: 5, mission: 20, phone: 1 },
  { name: 'PHONE vs 2p landscape', start: 'vs', np: 2, mission: 4, phone: 1, land: 1 },
  { name: 'PHONE vs 4p landscape dive 12', start: 'vs', np: 4, mission: 12, phone: 1, land: 1 }];
function run(cf, seed) {
  return new Promise(res => {
    const errs = []; const vc = new VirtualConsole();
    vc.on('jsdomError', e => errs.push('JSDOM ' + String(e.message).slice(0, 200) + (e.detail ? String(e.detail.stack || e.detail).slice(0, 300) : '')));
    vc.on('error', e => errs.push('console.error ' + String(e).slice(0, 200)));
    const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://gns.test/' + (cf.phone ? '?phone=1' : ''), virtualConsole: vc, beforeParse(win) { if (cf.phone) { Object.defineProperty(win, 'innerWidth', { value: cf.land ? 844 : 390, configurable: true }); Object.defineProperty(win, 'innerHeight', { value: cf.land ? 390 : 844, configurable: true }); } } });
    const w = dom.window, d = w.document;
    const click = el => el.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
    let s0 = seed * 7919 + 13; const R = () => { s0 = (s0 * 16807) % 2147483647; return (s0 - 1) / 2147483646; }; const rnd = a => a[Math.floor(R() * a.length)];
    const seen = new Set(); let hidden = 0, clicks = 0, steps = 0, stall = 0, last = '', attempts = 0, plays = 0; const t0 = Date.now(); let iv;
    const fin = r => { clearInterval(iv); res(Object.assign({ cf, errs, seen, clicks, hidden, plays, secs: Math.round((Date.now() - t0) / 1000) }, r || {})); try { w.close(); } catch (e) { } };
    w.addEventListener('load', () => {
      try {
        w.eval(`ANIM=${ANIMON ? 1 : 0};AIDELAY=${ANIMON ? 40 : 0};UI.seed=${seed}`);
        if (!d.querySelector('#start .ttl [data-a=play]')) errs.push('no Play button on the title');
        if (d.querySelector('#start [data-a=loadsave]')) errs.push('Resume shown without a save');
        click(d.querySelector('[data-a=play]')); seen.add('title->setup');
        const phm = w.eval('isPh()'); if (cf.phone && !phm) errs.push('phone mode off on a phone');
        if (phm) { const c = d.querySelector('[data-a=cfgopen]'); if (!c) errs.push('no Configure button on the phone setup'); else { click(c); if (d.querySelector('#cfg').hidden) errs.push('Configure did not open'); seen.add('configure'); } }
        else if (d.querySelector('#cfg').hidden) errs.push('setup options hidden on desktop');
        const o = (k, v) => { const b = d.querySelector(`[data-a=opt][data-k=${k}][data-v="${v}"]`); if (b) click(b); };
        if (cf.np) o('np', cf.np); if (cf.np && w.eval('UI.opt.np') !== cf.np) errs.push('crew size not set: ' + w.eval('UI.opt.np'));
        if (cf.mission) { const b = d.querySelector(`[data-a=pickdive][data-v="${cf.mission}"]`); if (!b) errs.push('no dive cell ' + cf.mission); else { click(b); seen.add('pickdive'); } if (w.eval('UI.opt.mission') !== cf.mission) errs.push('dive not set'); }
        if (cf.level) w.eval(`UI.opt.level='${cf.level}';UI.opt.lv=['${cf.level}','${cf.level}','${cf.level}','${cf.level}']`);
        if (cf.np === 3 && R() < .5) { const inv = d.querySelector('[data-a=seatchef][aria-pressed=false]'); if (inv) { click(inv); seen.add('invite'); if (w.eval('UI.opt.np') !== 4) errs.push('invite did not add a diver'); click(d.querySelector('[data-a=opt][data-k=np][data-v="3"]')); } }
        if (phm) { click(d.querySelector('[data-a=cfgclose]')); if (!d.querySelector('#cfg').hidden) errs.push('Configure did not close'); }
        const want = w.eval('UI.opt.seats.slice()');
        click(d.querySelector(`[data-start=${cf.start}]`)); if (!w.eval('UI.started')) errs.push('start click failed');
        if (cf.start === 'vs' || cf.start === 'ai') { const got = w.eval('G.players.filter(p => !p.helper).map(p => p.name)').slice(1).join(','), exp = want.map(c => w.eval('D.names[' + c + ']')).join(','); if (got !== exp) errs.push('seated divers ' + got + ' != chosen ' + exp); }
        if (cf.phone && !d.documentElement.classList.contains('ph')) errs.push('phone class missing');
        iv = setInterval(() => {
          try {
            const G = w.eval('G'); if (!G) return; steps++;
            const v = w.eval('viewSeat()'), hot = w.eval('hotSeat()'), holder = w.eval('UI.holder');
            // hidden hands: the hand strip only ever holds the viewer's own cards; the pass screen hides everything
            const mine = v >= 0 ? G.players[v].hand : [];
            for (const el of d.querySelectorAll('#hand .hc')) { const id = +el.dataset.id; if (!mine.includes(id)) { hidden++; if (errs.length < 6) errs.push('HIDDEN: card ' + id + ' in the hand strip of viewer ' + v); } }
            if (hot && holder < 0 && d.querySelector('#hand .hc')) { hidden++; errs.push('hand shown with no holder'); }
            if (hot && !d.querySelector('#pass').hidden && d.querySelector('#hand .hc')) { hidden++; errs.push('hand visible behind the pass screen'); }
            const dr = G.players.find(p => p.helper); if (dr) for (const el of d.querySelectorAll('#opp .dc')) { const id = +el.dataset.id; if (!dr.stacks.some(s => s[0] === id)) { hidden++; errs.push('drone card ' + id + ' not face up'); } }
            const rsOpen = !d.querySelector('#rs').hidden;
            const q = s => [...d.querySelectorAll(s)].filter(b => !b.disabled && !b.closest('[hidden]'));
            const inv = w.eval('LD.checkInvariants(G)'); if (inv.length && errs.length < 5) errs.push('INV ' + inv[0]);
            const pcb = q('#pass [data-a=take]'); if (pcb.length) { click(pcb[0]); seen.add('pass-screen'); clicks++; return; }
            if (rsOpen) {
              if (G.phase !== 'over') return;
              attempts = attempts || 0;
              const ok = G.result.ok; seen.add('result:' + (ok ? 'won' : 'lost'));
              if (!ok && attempts < 2 && cf.start !== 'ai') { attempts++; const b = d.querySelector('#rs [data-a=' + (R() < .5 ? 'retrysame' : 'retrynew') + ']'); if (!b) { errs.push('no retry button'); return fin({}); } click(b); seen.add('retry'); if (w.eval('G.phase') === 'over') errs.push('retry did not start a new attempt'); return; }
              if (ok && !attempts && R() < .3 && cf.start !== 'ai' && !cf.phone) { attempts = 9; const b = d.querySelector('#rs [data-a=nextdive]'); if (b) { click(b); seen.add('nextdive'); if (w.eval('G.phase') === 'over') errs.push('next dive did not start'); return; } }
              return fin({ over: { ok, att: G.att, why: G.result.why.slice(0, 40) } });
            }
            if (G.phase === 'over') { if (!w.eval('UI.busy') && ++stall > 400) { errs.push('over but no result card'); fin({}); } return; }
            const tip = q('#tip [data-a=tipok]'); if (tip.length) { click(tip[0]); seen.add('tip'); clicks++; return; }
            const must = w.eval('iMustAct() && canAct()');
            if (must) {
              const r = R(); const ph = G.phase;
              if (d.querySelector('#ppop:not([hidden])')) { if (r < .5) { click(d.querySelector('#ppop [data-a=popx]')); seen.add('popx'); return; } if (r < .6) { d.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); seen.add('esc'); return; } }
              if (r < .015) { const t = rnd(q('.gx-bar [data-gx]')); if (t) { click(t); seen.add('drawer:' + t.dataset.gx); const x = d.querySelector('.gx-drawer.on .gx-x'); if (x) click(x); } return; }
              if (r < .04) { const c = q('.jc'); if (c.length) { click(rnd(c)); seen.add('jobchip'); return; } }
              if (r < .07) { const c = q('.op[data-seat]'); if (c.length) { click(rnd(c)); seen.add('seat'); return; } }
              if (r < .09) { const c = q('[data-a=last]'); if (c.length) { click(c[0]); seen.add('last'); return; } }
              if (r < .12) { const hb = q('#acts [data-a=hint]'); if (hb.length) { click(hb[0]); seen.add('hint'); return; } }
              const acts = q('#acts [data-a]'); const A = a => acts.filter(b => b.dataset.a === a);
              if (ph === 'assign') {
                const pool = q('#pool .jcard'); const tk = A('take');
                if (pool.length && tk.length && w.eval('UI.job') < 0) { click(rnd(pool)); seen.add('pool'); clicks++; return; }
                if (pool.length && w.eval('UI.job') >= 0 && A('take').length && !A('take')[0].disabled && R() < .9) { click(A('take')[0]); seen.add('take'); clicks++; return; }
                const opts = acts.filter(b => ['pass', 'done', 'keep', 'offer', 'accept', 'decline', 'yes', 'no', 'vote'].includes(b.dataset.a)); if (opts.length) { const b = rnd(opts); click(b); seen.add('assign:' + b.dataset.a); clicks++; return; }
                if (pool.length) { click(rnd(pool)); return; }
              } else if (ph === 'distress') { const b = rnd(acts); if (b) { click(b); seen.add('distress:' + (b.dataset.on) + (b.dataset.dir || '')); clicks++; } return; }
              else if (ph === 'pass') { if (w.eval('UI.giveSel') < 0) { const cs = q('#hand .hc:not(.dim)'); if (cs.length) { click(rnd(cs)); seen.add('give-select'); } return; } const g = A('give'); if (g.length && !g[0].disabled) { click(g[0]); seen.add('give'); clicks++; } return; }
              else if (ph === 'predict') { const b = rnd(A('predict')); if (b) { click(b); seen.add('predict'); clicks++; } return; }
              else if (ph === 'signal') { if (w.eval('UI.pingSel')) { const sel = w.eval('UI.sel'); if (sel < 0) { const cs = q('#hand .hc.pk'); if (cs.length) { click(rnd(cs)); return; } click(A('noping')[0]); return; } const dp = A('doping'); if (dp.length) { click(dp[0]); seen.add('ping'); clicks++; return; } return; } if (R() < .5 && A('signal').length) { click(A('signal')[0]); seen.add('signal-open'); return; } const ns = A('nosig'); if (ns.length) { click(ns[0]); seen.add('nosig'); clicks++; } return; }
              else if (ph === 'play') {
                if (w.eval('UI.pingSel')) { const sel = w.eval('UI.sel'); if (sel < 0) { const cs = q('#hand .hc.pk'); if (cs.length) { click(rnd(cs)); return; } click(A('noping')[0]); return; } const dp = A('doping'); if (dp.length) { click(dp[0]); seen.add('ping-mid'); clicks++; return; } return; }
                if (R() < .05 && A('signal').length) { click(A('signal')[0]); seen.add('signal-open'); return; }
                const turn = G.trick.turn, helper = G.players[turn].helper;
                const cards = helper ? q('#opp .dc.can') : q('#hand .hc:not(.dim)');
                if (!cards.length) { errs.push('my turn but no playable card'); return; }
                const pb = A('playcard'); const sel = w.eval('UI.sel');
                if (sel >= 0 && pb.length && !pb[0].disabled && R() < .5) { click(pb[0]); seen.add('playcard'); plays++; clicks++; return; }
                const c = rnd(cards); click(c); clicks++; seen.add('tap'); if (R() < .5) { const sel2 = w.eval('UI.sel'); if (sel2 >= 0) { const c2 = d.querySelector(helper ? `#opp .dc[data-id="${sel2}"]` : `#hand .hc[data-id="${sel2}"]`); if (c2) { click(c2); seen.add('tap2'); plays++; } } } return;
              }
              return;
            }
            // not my turn: look around a little
            const r = R(); if (r < .03) { const g = q('.op[data-seat]'); if (g.length) click(rnd(g)); } else if (r < .04) { const x = d.querySelector('#ppop [data-a=popx]'); if (x) click(x); }
            const sig = JSON.stringify([G.att, G.phase, G.logN, G.tricks.length, G.trick && G.trick.plays.length, w.eval('UI.cards.length'), w.eval('UI.holder'), w.eval('UI.busy'), rsOpen, w.eval('UI.job'), w.eval('UI.sel')]);
            if (sig === last) stall++; else { stall = 0; last = sig; }
            if (stall > (ANIMON ? 6000 : 4000) || Date.now() - t0 > (ANIMON ? 800000 : 280000)) { errs.push('STALL ' + G.phase + ' busy=' + w.eval('UI.busy') + ' cards=' + w.eval('UI.cards.length') + ' holder=' + w.eval('UI.holder') + ' pend=' + JSON.stringify(w.eval('LD.pending(G)'))); fin({ over: false }); }
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
    console.log(`[${i}.${sd}] ${cf.name}${ANIMON ? ' (anim)' : ''}: ${r.over ? JSON.stringify(r.over) : 'NOT OVER'} plays ${r.plays} clicks ${r.clicks} ${r.secs}s hidden ${r.hidden} errors ${r.errs.length} ${JSON.stringify(r.errs.slice(0, 3))}`);
  }
  console.log('TOTAL games', n, 'errors', bad, 'stalls', stalls, 'not finished', notOver, 'hidden-hand violations', hid, 'time', Math.round((Date.now() - T) / 1000) + 's', ANIMON ? '(ANIM=1)' : '(ANIM=0)');
  console.log('seen:', [...all].sort().join(' | '));
  process.exit(0);
})();
