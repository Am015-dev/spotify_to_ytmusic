#!/usr/bin/env node
// Strategy layer checks (paths.js / strategy.js): synergies and set bonuses change the numbers, the heat budget, the 6-slot limit, selling at a loss,
// the rotating stock, boss picks read from real patterns, the trade-off perks, the market, and that every label stays at 8 words or fewer.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/strategy-test.js
const PW = require(process.env.PW || 'playwright'), path = require('path'), cp = require('child_process'), net = require('net');
const GAME_DIR = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun');
const port = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
(async () => {
  const pt = await port(), srv = cp.spawn('python3', ['-m', 'http.server', String(pt), '--bind', '127.0.0.1', '--directory', GAME_DIR], { stdio: 'ignore' });
  await new Promise(r => setTimeout(r, 800));
  const browser = await PW.chromium.launch(), p = await browser.newPage({ viewport: { width: 390, height: 763 } }), errs = [];
  p.on('pageerror', e => errs.push(e.message));
  await p.goto(`http://127.0.0.1:${pt}/index.html?sim=1&all=1`);
  await p.waitForFunction(() => window.__mnr && window.__mnr.TR.list.length > 0, null, { timeout: 8000 }).catch(() => { });
  const r = await p.evaluate(() => {
    const m = Object.assign({}, window.__mnr, window.__nrs), SH = m.SH, o = {}, fails = []; const ck = (k, v, msg) => { o[k] = v; if (!v) fails.push(k + ': ' + msg); };
    m.startStory(6); m.simOn(true); SH.reset(); SH.live = true; m.GA.tune = {}; m.GA.eq = {}; SH.recalc();   // (stage 6 hands out its starting kit: start from nothing)
    const dmg0 = m.tpDmg(); SH.add('dm'); const d1 = m.tpDmg(); SH.add('fr'); const d2 = m.tpDmg();
    ck('synergy', m.SYN.act.some(s => s.id === 'oc') && d2 / d1 > 1.06, 'Overclock should add ~8% damage: ' + d1 + ' -> ' + d2);
    SH.add('sc'); SH.add('pc'); SH.recalc();
    ck('setGC', m.SYN.cnt.gc >= 4 && m.SYN.v.dmg >= .15 && m.SYN.heat() > 1.3, 'glass cannon set: ' + JSON.stringify(m.SYN.v) + ' heat ' + m.SYN.heat());
    const h1 = m.SYN.heat(); SH.add('cool'); SH.add('cool'); SH.recalc(); ck('coolant', m.SYN.heat() < h1 - .15, 'coolant should cool the budget');
    // slots: 6 different upgrades, then only the ones you own
    for (const id of ['sh', 'wd', 'hl']) SH.add(id); SH.recalc();
    const pool = SH.pool().map(u => u.id); ck('slots', SH.order.length >= SH.slots && pool.every(id => SH.n(id) > 0), 'full run offers only owned upgrades: ' + pool.join());
    // selling: 50% of the level you paid for, instant upgrades cannot be sold
    SH.active = true; SH.lock = 0; SH.neon = 10; const n0 = SH.n('fr'), pr = SH.sellPrice('fr'); SH.sell('fr'); const armed = SH.armed === 'fr'; SH.sell('fr');
    ck('sell', armed && SH.n('fr') === n0 - 1 && SH.neon === 10 + pr && pr > 0 && SH.sellPrice('sh') === 0, 'sell fr ' + pr + ' neon ' + SH.neon);
    SH.active = false;
    // deal: three distinct cards, a boss pick when the next boss has a counter, and a stock that rotates
    SH.reset(); SH.live = true; SH.recalc(); m.ST.over = true; SH.deal(); const ids = SH.cards.map(c => c.u.id);
    ck('deal', ids.length === 3 && new Set(ids).size === 3 && SH.stock.length >= 6, 'deal ' + ids.join() + ' stock ' + SH.stock.length);
    const seen1 = new Set(SH.seen); SH.deal(); ck('rotate', SH.cards.some(c => !seen1.has(c.u.id)), 'a second deal should bring a card not shown before');
    ck('foe', !!SH.foe && SH.foe.tags.length > 0 && /Bring/.test(m.foeTip(SH.foe)), 'next boss counters ' + JSON.stringify(SH.foe));
    ck('rerollPrice', SH.rerollPrice() === 8 + 3 * SH.pits && (SH.rerolls++, SH.rerollPrice() === 12 + 3 * SH.pits), 'reroll price grows'); SH.rerolls = 0;
    // trade-off perks
    m.GA.tune = { glc: 2, ldp: 1, grd: 2, bea: 2 }; m.GA.eq = { glc: 1, ldp: 1, grd: 1, bea: 1 }; SH.reset(); SH.recalc();
    const base = 1 * (1 + .14 * 2) * (1 - .06); ck('perks', Math.abs(m.SYN.dmg() - base) < .001 && Math.abs(m.SYN.off() - .7) < .001, 'glass core / lead plating / beat addict numbers ' + m.SYN.dmg() + ' ' + m.SYN.off());
    ck('perkBad', ['glc', 'grd', 'ldp', 'bea'].every(id => typeof m.TP_BY[id].bad === 'function'), 'each trade-off perk names its downside');
    // market: four offers, one per path where possible, a sale, cargo limit
    const offers = m.MK.offers(); ck('market', offers.length === 4 && new Set(offers.map(id => m.pathOf(id) || id)).size >= 3 && offers.includes(m.MK.sale()), 'offers ' + offers.join());
    // every label at most 8 words
    const words = []; for (const u of m.SH.UPG) for (let l = 1; l <= u.max; l++) { const t = m.lvText(u, l); if (t.split(/\s+/).length > 8) words.push(u.id + l + ': ' + t); }
    for (const d of m.TP_DEF) for (let l = 1; l <= d.max; l++) { for (const t of [d.t(l), d.bad ? d.bad(l) : '']) if (t.split(/\s+/).length > 8) words.push(d.id + l + ': ' + t); }
    for (const s of m.SYNS) if (s.t.split(/\s+/).length > 8) words.push(s.id);
    ck('words', !words.length, 'labels over 8 words: ' + words.join(' | '));
    // stage tips are read from patterns: a boss with lasers says dash
    const ice = m.foeOf(m.STAGES.find(s => s.name === 'ZENTRAL-ICE')), hop = m.foeOf(m.STAGES.find(s => s.name === 'HOPLITE'));
    ck('tips', ice.tags[0] === 'dodge' && /lasers/.test(m.foeTip(ice)) && hop.mini && !hop.tags.includes('dodge'), 'ZENTRAL-ICE ' + m.foeTip(ice) + ' / HOPLITE ' + m.foeTip(hop));
    m.abort(); return { o, fails };
  });
  console.log(JSON.stringify(r.o)); if (errs.length) console.log('PAGE ERRORS', errs.slice(0, 3));
  await browser.close(); srv.kill();
  if (r.fails.length || errs.length) { console.log('FAIL\n' + r.fails.join('\n')); process.exit(1); } console.log('strategy-test: all checks pass');
})().catch(e => { console.error(e); process.exit(2); });
