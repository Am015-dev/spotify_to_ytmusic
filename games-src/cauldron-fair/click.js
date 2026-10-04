// Random clicker (jsdom): humans play ONLY through the page's buttons (Draw, Stop, Flask, question options, shop books, report, pass card, tips).
// node click.js [from] [to] [seeds] [--anim]   -> one line per game, then TOTAL errors / hidden-info violations / stalls
// --anim runs with ANIM=1 and the computer pacing on (AIDELAY=40); default is instant (AIDELAY=0). Both are part of the required runs.
let JSDOM, VirtualConsole;
try { ({ JSDOM, VirtualConsole } = require('../node_modules/jsdom')); } catch (e) { ({ JSDOM, VirtualConsole } = require('jsdom')); }
const fs = require('fs'); const path = require('path');
const html = fs.readFileSync(path.join(__dirname, 'cauldron-fair.html'), 'utf8');
const ANIMON = process.argv.includes('--anim');
const CONF = [
  { name: 'guided', start: 'guided' },
  { name: 'vs 2p set1', start: 'vs', np: 2 },
  { name: 'vs 3p set2', start: 'vs', np: 3, sets: 2 },
  { name: 'vs 4p set3 hard', start: 'vs', np: 4, sets: 3, level: 'hard' },
  { name: 'vs 3p set4 easy', start: 'vs', np: 3, sets: 4, level: 'easy' },
  { name: 'vs 4p random books', start: 'vs', np: 4, sets: 'random' },
  { name: 'hot 2p', start: 'hot', np: 2 },
  { name: 'hot 3p set2', start: 'hot', np: 3, sets: 2 },
  { name: 'hot 4p random', start: 'hot', np: 4, sets: 'random' },
  { name: 'watch 3p', start: 'ai', np: 3 },
  { name: 'watch 4p hard', start: 'ai', np: 4, level: 'hard' },
  { name: 'PHONE guided', start: 'guided', phone: 1 },
  { name: 'PHONE vs 3p', start: 'vs', np: 3, phone: 1 },
  { name: 'PHONE hot 3p', start: 'hot', np: 3, phone: 1 },
  { name: 'PHONE vs 4p set4', start: 'vs', np: 4, sets: 4, phone: 1 },
  { name: 'PHONE vs 2p landscape', start: 'vs', np: 2, phone: 1, land: 1 },
  { name: 'PHONE vs 4p landscape random', start: 'vs', np: 4, sets: 'random', phone: 1, land: 1 }];
function run(cf, seed) {
  return new Promise(res => {
    const errs = []; const vc = new VirtualConsole();
    vc.on('jsdomError', e => errs.push('JSDOM ' + String(e.message).slice(0, 200) + (e.detail ? String(e.detail.stack || e.detail).slice(0, 300) : '')));
    vc.on('error', e => errs.push('console.error ' + String(e).slice(0, 200)));
    const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://gns.test/' + (cf.phone ? '?phone=1' : ''), virtualConsole: vc,
      beforeParse(win) { if (cf.phone) { Object.defineProperty(win, 'innerWidth', { value: cf.land ? 844 : 390 }); Object.defineProperty(win, 'innerHeight', { value: cf.land ? 390 : 763 }); } win.__cfErr = errs; } });
    const w = dom.window, d = w.document;
    const click = el => el.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
    let s0 = seed * 7919 + 13; const R = () => { s0 = (s0 * 16807) % 2147483647; return (s0 - 1) / 2147483646; }; const rnd = a => a[Math.floor(R() * a.length)];
    const seen = new Set(); let hidden = 0, clicks = 0, steps = 0, stall = 0, last = '', replayed = 0, draws = 0, stops = 0; const t0 = Date.now(); let iv;
    const fin = r => { clearInterval(iv); res(Object.assign({ cf, errs, seen, clicks, hidden, draws, stops, secs: Math.round((Date.now() - t0) / 1000) }, r || {})); try { w.close(); } catch (e) { } };
    w.addEventListener('load', () => {
      try {
        w.eval(`ANIM=${ANIMON ? 1 : 0};AIDELAY=${ANIMON ? 40 : 0};UI.seed=${seed}`);
        if (!d.querySelector('#start .ttl [data-a=play]')) errs.push('no Play button on the title');
        if (d.querySelector('#start [data-a=loadsave]')) errs.push('Resume shown without a save');
        click(d.querySelector('[data-a=play]')); seen.add('title->setup');
        const phm = w.eval('isPh()'); if (cf.phone && !phm) errs.push('phone mode off on a phone');
        if (phm) { const c = d.querySelector('[data-a=cfgopen]'); if (!c) errs.push('no Configure button on the phone setup'); else { click(c); if (d.querySelector('#cfg').hidden) errs.push('Configure did not open'); seen.add('configure'); } }
        else if (d.querySelector('#cfg').hidden) errs.push('setup options hidden on desktop');
        const o = (k, v) => { const b = d.querySelector(`[data-a=opt][data-k=${k}][data-v="${v}"]`); if (b) click(b); else errs.push('no option button ' + k + '=' + v); };
        if (cf.np) o('np', cf.np); if (cf.sets) o('sets', cf.sets);
        if (cf.np && w.eval('UI.opt.np') !== cf.np) errs.push('table size not set: ' + w.eval('UI.opt.np'));
        if (cf.level) for (const b of d.querySelectorAll('[data-a=lv][data-v="' + cf.level + '"]')) click(b);
        if (cf.np === 3 && R() < .5) { const inv = d.querySelector('[data-a=seatchar][aria-pressed=false]'); if (inv) { click(inv); seen.add('invite'); } }
        if (R() < .3) { const b = d.querySelector('[data-a=setme]'); if (b) { click(b); seen.add('beMe'); } }
        if (phm) { click(d.querySelector('[data-a=cfgclose]')); if (!d.querySelector('#cfg').hidden) errs.push('Configure did not close'); }
        const want = w.eval('UI.opt.seats.slice()'), me = w.eval('UI.opt.me');
        click(d.querySelector(`[data-start=${cf.start}]`)); if (!w.eval('UI.started')) errs.push('start click failed');
        if (cf.start !== 'guided') { const got = w.eval('G.players.map(p => p.name)').join(','), exp = [me].concat(want).map(c => w.eval('PN[' + c + ']')).join(','); if (got !== exp.split(',').slice(0, got.split(',').length).join(',')) errs.push('seated ' + got + ' != chosen ' + exp); }
        if (cf.sets !== undefined && cf.start !== 'guided' && cf.sets !== 'random') { const s = w.eval('Object.values(G.sets).join("")'); if (s !== String(cf.sets).repeat(5)) errs.push('book set ' + s); }
        if (cf.phone && !d.documentElement.classList.contains('ph')) errs.push('phone class missing');
        iv = setInterval(() => {
          try {
            const G = w.eval('G'); if (!G) return; steps++;
            const v = w.eval('viewSeat()'), hot = w.eval('hotSeat()'), holder = w.eval('UI.holder');
            // hidden information: private boxes (bag contents, chips held aside) belong to the viewer, and to the holder in hot-seat
            for (const el of d.querySelectorAll('[data-priv]')) { const own = +el.getAttribute('data-priv'); if (own !== v || (hot && own !== holder)) { hidden++; if (errs.length < 6) errs.push('HIDDEN info of seat ' + own + ' shown for viewer ' + v + ' holder ' + holder); } }
            if (hot && holder < 0 && d.querySelector('[data-priv]')) { hidden++; errs.push('private info shown with no holder'); }
            const rsOpen = !d.querySelector('#rs').hidden;
            const q = s => [...d.querySelectorAll(s)].filter(b => !b.disabled && !b.closest('[hidden]'));
            { const inv = w.eval('CF.checkInvariants(G)'); if (inv.length && errs.length < 5) errs.push('INV ' + inv[0]); }
            if (rsOpen) {
              const again = d.querySelector('#rs [data-a=again]');
              if (G.phase === 'over' && again) {
                seen.add('final');
                if (!replayed && R() < .25 && cf.start !== 'ai') { replayed = 1; click(again); seen.add('again'); if (w.eval('G.phase') === 'over') errs.push('again did not start'); return; }
                return fin({ over: w.eval('({w:G.winners,s:G.players.map(p=>p.vp)})'), round: G.round });
              }
              const take = d.querySelector('#rs [data-a=take]'); if (take) { click(take); seen.add('pass->take'); clicks++; return; }
              const hg = d.querySelector('#rs [data-a=hotgo]'); if (hg) { click(hg); seen.add('hot shared report'); clicks++; return; }
              const cont = d.querySelector('#rs [data-a=rscont]:not([disabled])'); if (cont && R() < .8) { seen.add('report'); click(cont); clicks++; return; }
              // decisions inside the report
              const shopB = q('#rs [data-a=shopsel]'); if (shopB.length) { const k = Math.floor(R() * 3); for (let i = 0; i < k; i++) { const b = rnd(q('#rs [data-a=shopsel]')); if (b) click(b); } if (R() < .1) { const cl = d.querySelector('#rs [data-a=shopclear]'); if (cl) click(cl); } const buy = d.querySelector('#rs [data-a=shopbuy]'); if (buy) { click(buy); seen.add('shop'); clicks++; } return; }
              const opts = q('#rs .dec [data-a=mv]'); if (opts.length) { click(rnd(opts)); seen.add('decision:' + (G.players[v] && G.players[v].q ? G.players[v].q.h : '?')); clicks++; return; }
              return;
            }
            if (G.phase === 'over') { if (++stall > 400) { errs.push('over but no final modal'); fin({}); } return; }
            const tipb = q('#pc [data-a=tipok]'); if (tipb.length) { click(tipb[0]); seen.add('tip'); clicks++; return; }
            const takeb = q('#rs [data-a=take]'); if (takeb.length) { click(takeb[0]); return; }
            // my turn?
            const r = R();
            if (r < .02) { const t = rnd(q('.gx-bar [data-gx]')); if (t) { click(t); seen.add('drawer:' + t.dataset.gx); const x = d.querySelector('.gx-drawer.on .gx-x'); if (x) click(x); } return; }
            if (r < .04) { const c = q('#others .th,#roster .rc'); if (c.length) { click(rnd(c)); seen.add('focus'); } return; }
            const acts = q('#acts [data-a=mv],#qbox [data-a=mv]');
            if (acts.length) {
              const draw = acts.find(b => /Draw/.test(b.textContent)), stop = acts.find(b => /^Stop/.test(b.textContent.trim()));
              let pick;
              if (draw && stop) pick = R() < .72 ? draw : stop; else pick = rnd(acts);
              if (R() < .12) pick = rnd(acts);
              if (pick === draw) draws++; else if (pick === stop) stops++;
              seen.add('act:' + (pick.textContent.trim().slice(0, 14)));
              click(pick); clicks++; return;
            }
            const sig = JSON.stringify([G.round, G.logN, G.players.map(p => p.st + (p.q ? p.q.h : '')), G.phase, w.eval('UI.holder'), rsOpen]);
            if (sig === last) stall++; else { stall = 0; last = sig; }
            if (stall > (ANIMON ? 6000 : 4000) || Date.now() - t0 > (ANIMON ? 800000 : 280000)) { errs.push('STALL r' + G.round + ' ph=' + G.phase + ' st=' + G.players.map(p => p.st + (p.q ? ':' + p.q.h : '')).join(',') + ' holder=' + w.eval('UI.holder') + ' rs=' + w.eval('UI.rsMode')); fin({}); }
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
    console.log(`[${i}.${sd}] ${cf.name}${ANIMON ? ' (anim)' : ''}: ${r.over ? JSON.stringify(r.over) : 'NOT OVER'} draws ${r.draws} stops ${r.stops} clicks ${r.clicks} ${r.secs}s hidden ${r.hidden} errors ${r.errs.length} ${JSON.stringify(r.errs.slice(0, 3))}`);
  }
  console.log('TOTAL games', n, 'errors', bad, 'stalls', stalls, 'not finished', notOver, 'hidden-info violations', hid, 'time', Math.round((Date.now() - T) / 1000) + 's', ANIMON ? '(ANIM=1)' : '(ANIM=0)');
  console.log('seen:', [...all].sort().join(' | '));
  process.exit(0);
})();
