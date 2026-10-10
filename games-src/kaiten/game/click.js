// Random clicker (jsdom): humans play ONLY through the page's buttons, plates, groups and cards.
// node click.js [from] [to] [seeds] [--anim]   -> one line per game, then TOTAL errors / hidden-hand violations / stalls
// --anim runs with ANIM=1 (the real timelines, no Web Animations in jsdom); default is ANIM=0 (instant). Both are part of the required runs.
let JSDOM, VirtualConsole;
try { ({ JSDOM, VirtualConsole } = require('../../node_modules/jsdom')); } catch (e) { ({ JSDOM, VirtualConsole } = require('jsdom')); }
const fs = require('fs'); const path = require('path');
const html = fs.readFileSync(path.join(__dirname, 'kaiten.html'), 'utf8');
const ANIMON = process.argv.includes('--anim');
const CONF = [
  { name: 'vs 2p normal', start: 'vs', np: 2 },
  { name: 'vs 3p easy', start: 'vs', np: 3, level: 'easy' },
  { name: 'vs 4p hard', start: 'vs', np: 4, level: 'hard' },
  { name: 'vs 5p normal', start: 'vs', np: 5 },
  { name: 'hot 2p', start: 'hot', np: 2 },
  { name: 'hot 4p', start: 'hot', np: 4 },
  { name: 'hot 5p', start: 'hot', np: 5 },
  { name: 'watch 3p', start: 'ai', np: 3 },
  { name: 'watch 5p hard', start: 'ai', np: 5, level: 'hard' },
  { name: 'PHONE vs 3p', start: 'vs', np: 3, phone: 1 },
  { name: 'PHONE hot 3p', start: 'hot', np: 3, phone: 1 },
  { name: 'PHONE vs 5p', start: 'vs', np: 5, phone: 1 },
  { name: 'PHONE vs 2p landscape', start: 'vs', np: 2, phone: 1, land: 1 },
  { name: 'PHONE vs 4p landscape', start: 'vs', np: 4, phone: 1, land: 1 }];
function run(cf, seed) {
  return new Promise(res => {
    const errs = []; const vc = new VirtualConsole();
    vc.on('jsdomError', e => errs.push('JSDOM ' + String(e.message).slice(0, 200) + (e.detail ? String(e.detail.stack || e.detail).slice(0, 300) : '')));
    vc.on('error', e => errs.push('console.error ' + String(e).slice(0, 200)));
    const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://gns.test/' + (cf.phone ? '?phone=1' : ''), virtualConsole: vc, beforeParse(win) { if (cf.phone) { Object.defineProperty(win, 'innerWidth', { value: cf.land ? 844 : 390, configurable: true }); Object.defineProperty(win, 'innerHeight', { value: cf.land ? 390 : 844, configurable: true }); } } });
    const w = dom.window, d = w.document;
    const click = el => el.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
    let s0 = seed * 7919 + 13; const R = () => { s0 = (s0 * 16807) % 2147483647; return (s0 - 1) / 2147483646; }; const rnd = a => a[Math.floor(R() * a.length)];
    const seen = new Set(); let resumed = 0, overWait = 0, hidden = 0, clicks = 0, steps = 0, stall = 0, last = '', replayed = 0, picks = 0; const t0 = Date.now(); let iv;
    const fin = r => { clearInterval(iv); res(Object.assign({ cf, errs, seen, clicks, hidden, picks, secs: Math.round((Date.now() - t0) / 1000) }, r || {})); try { w.close(); } catch (e) { } };
    w.addEventListener('load', () => {
      try {
        w.eval(`ANIM=${ANIMON ? 1 : 0};AIDELAY=${ANIMON ? 40 : 0};UI.seed=${seed};UI.noRec=${R() < .7 ? 'true' : 'false'}`);
        // title -> setup (on phones the table options sit behind Configure)
        if (!d.querySelector('#start .ttl [data-a=play]')) errs.push('no Play button on the title');
        if (d.querySelector('#start [data-a=loadsave]')) errs.push('Resume shown without a save');
        click(d.querySelector('[data-a=play]')); seen.add('title->setup');
        const phm = w.eval('isPh()'); if (cf.phone && !phm) errs.push('phone mode off on a phone');
        if (phm) { const c = d.querySelector('[data-a=cfgopen]'); if (!c) errs.push('no Configure button on the phone setup'); else { click(c); if (d.querySelector('#cfg').hidden) errs.push('Configure did not open'); seen.add('configure'); } }
        else if (d.querySelector('#cfg').hidden) errs.push('setup options hidden on desktop');
        const o = (k, v) => { const b = d.querySelector(`[data-a=opt][data-k=${k}][data-v="${v}"]`); if (b) click(b); };
        if (cf.np) o('np', cf.np); if (cf.level) o('level', cf.level);
        if (cf.np && w.eval('UI.opt.np') !== cf.np) errs.push('table size not set: ' + w.eval('UI.opt.np'));
        if (cf.start === 'vs' && cf.np > 2) { const b = d.querySelector('[data-a=lv][data-v="hard"]'); if (b) click(b); }
        if (cf.np === 3 && R() < .5) { const inv = d.querySelector('[data-a=seatchef][aria-pressed=false]'); if (inv) { click(inv); seen.add('invite'); if (w.eval('UI.opt.np') !== 4) errs.push('invite did not add a chef'); click(d.querySelector('[data-a=opt][data-k=np][data-v="3"]')); } }
        if (phm) { click(d.querySelector('[data-a=cfgclose]')); if (!d.querySelector('#cfg').hidden) errs.push('Configure did not close'); }
        const want = w.eval('UI.opt.seats.slice()');
        click(d.querySelector(`[data-start=${cf.start}]`)); if (!w.eval('UI.started')) errs.push('start click failed');
        if (cf.start !== 'guided') { const got = w.eval('G.players.map(p => p.name)').slice(1).join(','), exp = want.map(c => w.eval('PN[' + c + ']')).join(','); if (got !== exp) errs.push('seated chefs ' + got + ' != chosen ' + exp); }
        if (cf.phone && !d.documentElement.classList.contains('ph')) errs.push('phone class missing');
        iv = setInterval(() => {
          try {
            const G = w.eval('G'); if (!G) return; steps++;
            const v = w.eval('viewSeat()'), hot = w.eval('hotSeat()'), holder = w.eval('UI.holder');
            for (const el of d.querySelectorAll('[data-owner][data-up="1"]')) { const own = +el.getAttribute('data-owner'); if (own !== v || (hot && own !== holder)) { hidden++; if (errs.length < 6) errs.push('HIDDEN hand ' + own + ' face up for viewer ' + v); } }
            if (hot && holder < 0 && d.querySelector('#belt [data-up="1"]')) { hidden++; errs.push('hand shown with no holder'); }
            const rsOpen = !d.querySelector('#rs').hidden;
            const q = s => [...d.querySelectorAll(s)].filter(b => !b.disabled && !b.closest('[hidden]'));
            if (!rsOpen || G.phase !== 'over') { const inv = w.eval('KK.checkInvariants(G)'); if (inv.length && errs.length < 5) errs.push('INV ' + inv[0]); }
            if (rsOpen) {
              const fin2 = d.querySelector('#rs [data-a=again]');
              if (G.phase === 'over' && w.eval('UI.overShown') && fin2) {
                seen.add('final');
                if (!replayed && R() < .25 && cf.start !== 'ai') { replayed = 1; click(fin2); seen.add('again'); if (w.eval('G.phase') === 'over') errs.push('again did not start'); return; }
                const ov = w.eval('G.final'); if (!ov) errs.push('over without final');
                if (w.localStorage.getItem('kk_save')) errs.push('save not cleared at the end of the meal');
                return fin({ over: w.eval('({w:G.winner,s:G.final.totals,p:G.final.pudding})'), turns: G.turn, round: G.round });
              }
              const sk = d.querySelector('#rs [data-a=rsskip]:not([hidden])'); if (sk && R() < .3) { click(sk); seen.add('rsskip'); return; }
              const nx = d.querySelector('#rs [data-a=rsnext]'); if (nx && (R() < .6 || steps % 3 === 0)) { click(nx); seen.add('rsnext'); clicks++; return; }
              return;
            }
            // autosave + resume: in round 2 the page is "left" (pagehide), sent to the title, and Resume must bring the same meal back
            if (!resumed && G.round === 2 && G.phase === 'pick' && !w.eval('UI.busy') && !w.eval('UI.cards.length')) {
              resumed = 1; w.dispatchEvent(new w.Event('pagehide'));
              let sv = null; try { sv = JSON.parse(w.localStorage.getItem('kk_save')); } catch (e) { }
              if (!sv || !sv.G || sv.G.round !== G.round || sv.G.turn !== G.turn) errs.push('autosave missing or stale: ' + (sv && sv.G ? sv.G.round + '.' + sv.G.turn : 'none') + ' vs ' + G.round + '.' + G.turn);
              const k0 = JSON.stringify([G.round, G.turn, G.players.map(p => p.hand.length + ':' + p.table.length)]);
              w.eval('showStart()'); const rb = d.querySelector('#start .ttl [data-a=loadsave]');
              if (!rb) errs.push('no Resume on the title after an autosave'); else { click(rb); seen.add('resume'); const G2 = w.eval('G'); const k1 = JSON.stringify([G2.round, G2.turn, G2.players.map(p => p.hand.length + ':' + p.table.length)]); if (!w.eval('UI.started') || !d.querySelector('#start').hidden || k1 !== k0) errs.push('Resume did not restore the meal ' + k0 + ' -> ' + k1); }
              return;
            }
            if (G.phase === 'over') { if (!w.eval('UI.busy') && ++overWait > 400) { errs.push('over but no final modal'); fin({}); } return; }
            const pcb = q('#pc [data-a=take],#pc [data-a=cont]'); if (pcb.length) { click(pcb[0]); seen.add('card:' + d.querySelector('#pc').dataset.card); clicks++; return; }
            const canPick = w.eval('canPick()');
            if (canPick) {
              const r = R();
              if (d.querySelector('#ppop:not([hidden])')) { if (r < .5) { click(d.querySelector('#ppop [data-a=popx]')); seen.add('popx'); return; } if (r < .6) { d.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); seen.add('esc'); return; } }
              if (r < .015) { const t = rnd(q('.gx-bar [data-gx]')); if (t) { click(t); seen.add('drawer:' + t.dataset.gx); const x = d.querySelector('.gx-drawer.on .gx-x'); if (x) click(x); } return; }
              if (r < .04) { const c = q('#roster .chip'); if (c.length) { click(rnd(c)); seen.add('chip'); const x = d.querySelector('.gx-drawer.on .gx-x'); if (x) click(x); } return; }
              if (r < .08) { const g = q('#tbl .grp'); if (g.length) { click(rnd(g)); seen.add('grp'); return; } }
              if (r < .11) { const g = q('#tbl .sh'); if (g.length) { click(rnd(g)); seen.add('seat'); const x = d.querySelector('.gx-drawer.on .gx-x'); if (x) click(x); return; } }
              if (r < .15) { const hb = q('#acts [data-a=hint], #labacts [data-a=hint]'); if (hb.length) { click(hb[0]); seen.add('hint'); return; } }
              if (r < .2) { const tw = q('#tbl .grp.usable'); if (tw.length) { click(tw[0]); seen.add('sticks'); return; } }
              if (r < .23) { const us = q('#acts [data-a=unsel]'); if (us.length) { click(us[0]); seen.add('unsel'); return; } }
              const cards = q('#belt .hc[data-up="1"]');
              if (!cards.length) { errs.push('canPick but no plates on the belt'); return; }
              const sv = q('#acts [data-a=serve]');
              if (sv.length && R() < .55) { click(sv[0]); seen.add('serve'); picks++; clicks++; return; }
              const c = rnd(cards); click(c); clicks++; seen.add('tap'); if (!w.eval('canPick()')) { picks++; seen.add('grab'); return; }
              if (w.eval('!UI.twin') && R() < .5) { const c2 = d.querySelector(`#belt .hc[data-i="${c.dataset.i}"]`); if (c2 && !w.eval('canPick()') === false) { click(c2); seen.add('tap2'); picks++; } }
              return;
            }
            // not my turn: look around a little
            const r = R(); if (r < .03) { const g = q('#tbl .grp'); if (g.length) click(rnd(g)); } else if (r < .04) { const x = d.querySelector('#ppop [data-a=popx]'); if (x) click(x); }
            const sig = JSON.stringify([G.round, G.turn, G.logN, G.players.map(p => p.picked), w.eval('UI.cards.length'), w.eval('UI.holder'), w.eval('UI.busy'), rsOpen]);
            if (sig === last) stall++; else { stall = 0; last = sig; }
            if (stall > (ANIMON ? 6000 : 4000) || Date.now() - t0 > (ANIMON ? 800000 : 280000)) { errs.push('STALL r' + G.round + ' t' + G.turn + ' busy=' + w.eval('UI.busy') + ' cards=' + w.eval('UI.cards.length') + ' holder=' + w.eval('UI.holder') + ' picked=' + JSON.stringify(G.players.map(p => p.picked))); fin({ over: false }); }
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
    console.log(`[${i}.${sd}] ${cf.name}${ANIMON ? ' (anim)' : ''}: ${r.over ? JSON.stringify(r.over) : 'NOT OVER'} picks ${r.picks} clicks ${r.clicks} ${r.secs}s hidden ${r.hidden} errors ${r.errs.length} ${JSON.stringify(r.errs.slice(0, 3))}`);
  }
  console.log('TOTAL games', n, 'errors', bad, 'stalls', stalls, 'not finished', notOver, 'hidden-hand violations', hid, 'time', Math.round((Date.now() - T) / 1000) + 's', ANIMON ? '(ANIM=1)' : '(ANIM=0)');
  console.log('seen:', [...all].sort().join(' | '));
  process.exit(0);
})();
