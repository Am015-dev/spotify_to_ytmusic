// Wickdeep scenario lessons test (lessons.js on the shared gx-scenario-tutor). Pattern of tidewake/game/lessons-test.js.
//   NODE_PATH=$(npm root -g) node games-src/wickdeep/lessons-test.js [sizes=402x874,1366x768]   prints PASS/FAIL + seconds, exit 1 on a problem.
// Asserts: every lesson in WDL.lessons is solved with REAL touchscreen taps (finish: engine moves via WDAI.choose), phase 'win';
// pick, shield and retal: one WRONG sequence ends in 'fail' with a message, GXST.retry() returns to 'play';
// every tap lands on its target (elementFromPoint); Rules opens mid-lesson; hint twice draws a ring; 0 JS page errors.
// No screenshots unless SHOTS=<dir>: then one PNG per lesson step (play, hint ring, fail, win) plus picker and rules, for a contact sheet.
const PW = (() => { try { return require(process.env.PW_DIR || 'playwright'); } catch (e) { return require('../node_modules/playwright'); } })();
const fs = require('fs'), path = require('path');
const html = fs.readFileSync(path.join(__dirname, 'wickdeep.html'));
const SIZES = (process.argv[2] || '402x874,1366x768').split(',').map(s => s.split('x').map(Number));
const { turbo, tick, budget } = require('../scripts/turbo'); const stopBudget = budget(60000, 'wickdeep lessons');
let sleep = ms => new Promise(r => setTimeout(r, ms)); const probs = []; const T0 = Date.now();

// Steps: c(name) = tap a card in the tray; h(name, re) = tap that card's half matching re; ready / play = buttons; g(sel) = a board hex glow.
const c = name => ({ sel: '#tray .cd', name }), h = (name, re) => ({ sel: '#tray .half.can', name, re }),
  ready = { sel: '#readybtn' }, play = { sel: '#playbtn', opt: 1 }, g = (sel, pick) => ({ sel, pick }), ENGINE = { engine: 1 };
const SOLVE = {
  pick: [c('Holdfast'), c('Candle Guard'), ready],
  halves: [c('Lantern Swing'), c('Tallow Bash'), ready, h('Lantern Swing', /Move 4/), play, g('#hot .glow', 'near'), h('Tallow Bash', /Hit 3/), play, g('#hot .glow.atk')],
  shield: [c('Brazier Rush'), c('Tallow Bash'), ready, h('Brazier Rush', /Hit 4/), play, g('#hot .glow.atk')],
  retal: [c('Hot Wax Hurl'), c('Tallow Bash'), ready, h('Hot Wax Hurl', /Hit 2/), play, g('#hot .glow.atk')],
  door: [c('Lantern Swing'), c('Wickflare'), ready, h('Lantern Swing', /Move 4/), play, g('#hot .glow', 'door')],
  coin: [c('Tallow Bash'), c('Holdfast'), ready, h('Tallow Bash', /Move 3/), play, g('#hot .glow', 'coin'), h('Holdfast', /Hit back/), play],
  finish: [c('Tallow Bash'), c('Candle Guard'), ready, ENGINE]
};
const WRONG = {
  pick: [c('Vigil'), c('Ember Oath'), ready],
  shield: [c('Tallow Bash'), c('Holdfast'), ready, h('Tallow Bash', /Hit 3/), play, g('#hot .glow.atk'), ENGINE],
  retal: [c('Tallow Bash'), c('Lantern Swing'), ready, h('Lantern Swing', /Move 4/), play, g('#hot .glow', 'near'), h('Tallow Bash', /Hit 3/), play, g('#hot .glow.atk')]
};

async function run(b, W, H) {
  const tag = W + 'x' + H, phone = W < 600, note = m => probs.push(tag + ': ' + m);
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, isMobile: phone, hasTouch: true });
  await ctx.route('**/*', r => new URL(r.request().url()).host === 'gns.test' ? r.fulfill({ status: 200, contentType: 'text/html', body: html }) : r.abort());
  await turbo(ctx);
  const p = await ctx.newPage(); p.setDefaultTimeout(15000); sleep = ms => tick(p, ms);
  p.on('pageerror', e => note('PAGE ERROR ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/net::|Failed to load|favicon/.test(m.text())) note('console error ' + m.text().slice(0, 140)); });
  await p.goto('https://gns.test/?2d=1');
  await p.waitForFunction(() => window.GXST && GXST.state() && window.WDL, null, { timeout: 30000 });
  await p.evaluate(() => { try { window.AIDELAY = 40; UI.speed = 8; } catch (e) { } });
  const lg = m => { if (process.env.DBG) console.log('   ', ((Date.now() - T0) / 1000).toFixed(1), m); };
  const st = () => p.evaluate(() => GXST.state());
  const busy = () => p.waitForFunction(() => !UI.busy, null, { timeout: 3000 }).catch(() => { });
  const phaseIs = (want, ms) => p.waitForFunction(w => GXST.state().phase === w, want, { timeout: ms || 15000 }).then(() => true, () => false);
  const live = id => p.waitForFunction(id => { const s = GXST.state(); return s.id === id && s.phase === 'play' && s.live; }, id, { timeout: 20000 });

  // find the visible element for a step, check the point is really it, then touch it with a real tap
  const tapStep = async s => {
    await busy();
    const pt = await p.evaluate(a => {
      const vis = e => { const r = e.getBoundingClientRect(); return r.width > 8 && r.height > 8 && r.bottom > 0 && r.top < innerHeight && !e.closest('[hidden]'); };
      const re = a.re ? new RegExp(a.re) : null;
      const dd = (u, v) => { const A = u.split(',').map(Number), B = v.split(',').map(Number), q = A[0] - B[0], r = A[1] - B[1]; return (Math.abs(q) + Math.abs(r) + Math.abs(q + r)) / 2; };
      let list = [...document.querySelectorAll(a.sel)];
      if (a.pick === 'door' || a.pick === 'coin') list = list.filter(x => G.hex[x.dataset.k] && (a.pick === 'door' ? G.hex[x.dataset.k].t === 'door' : G.hex[x.dataset.k].coin));
      else if (a.pick && list.length) {   // choose among move hexes: 'near' = closest to a monster, 'far' = farthest from the hero
        const hero = G.figs.find(f => f.team === 'h' && f.pos), mons = G.figs.filter(f => f.team === 'm' && f.pos);
        const score = x => a.pick === 'near' ? Math.min(...mons.map(m => dd(x.dataset.k, m.pos))) : -dd(x.dataset.k, hero.pos);
        list = [list.slice().sort((x, y) => score(x) - score(y))[0]];
      }
      const e = list.find(x => vis(x) && (!a.name || (x.closest('.cd') || x).textContent.includes(a.name)) && (!re || re.test(x.textContent)));
      if (!e) return null;
      try { e.scrollIntoView({ inline: 'center', block: 'nearest' }); } catch (x) { }
      const r = e.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2, u = document.elementFromPoint(x, y);
      return { x, y, ok: !!u && (u === e || e.contains(u)), by: u && (u.id || String(u.className).slice(0, 40)) };
    }, { ...s, re: s.re ? s.re.source : null });
    if (!pt && s.opt) return true;
    if (!pt) { note('nothing to tap: ' + JSON.stringify(s)); return false; }
    if (!pt.ok) note('something covers ' + JSON.stringify(s) + ' (' + pt.by + ')');
    await p.touchscreen.tap(pt.x, pt.y); await sleep(160); return true;
  };
  // engine moves for the finish lesson (the real taps are proven in the other lessons)
  const engineFinish = async () => {
    for (let k = 0; k < 60; k++) {
      await busy(); const s = await st(); if (s.phase !== 'play') return;
      await p.evaluate(() => { try { WD.apply(G, WDAI.choose(G)); G.ev = []; WDUI.refresh(); } catch (e) { } });
      await sleep(120);
    }
  };
  const runSteps = async steps => {
    for (const s of steps) {
      if (s.engine) { await engineFinish(); continue; }
      if (!(await tapStep(s))) return;
      if ((await st()).phase !== 'play') return;
    }
  };

  const shot = async name => { if (process.env.SHOTS) { await sleep(250); fs.mkdirSync(process.env.SHOTS, { recursive: true }); await p.screenshot({ path: path.join(process.env.SHOTS, tag + '-' + name + '.png') }); } };
  if (process.env.SHOTS) {
    await p.evaluate(() => GXST.picker()); await shot('00-picker'); await p.evaluate(() => GXST.close());
  }
  const res = {}; let n = 1;
  for (const lesson of ['pick', 'halves', 'shield', 'retal', 'door', 'coin', 'finish']) {
    const t0 = Date.now(), before = probs.length;
    if (process.env.DBG) console.log('lesson', lesson, ((Date.now() - T0) / 1000).toFixed(1));
    await p.evaluate(id => GXST.start(id), lesson);
    await live(lesson); n++; await shot(n + '-' + lesson + '-a-play');
    if (process.env.SHOTS && lesson !== 'pick') { await p.evaluate(() => { GXST.hint(); GXST.hint(); }); await shot(n + '-' + lesson + '-b-hint'); }

    if (WRONG[lesson]) {
      lg('wrong start'); await runSteps(WRONG[lesson]); lg('wrong done ' + JSON.stringify(await st()) + probs.join('|'));
      const failed = await phaseIs('fail', 3000);
      const s = await st();
      if (!failed) note(lesson + ': wrong sequence did not end in fail (phase ' + s.phase + ')');
      else if (!s.msg) note(lesson + ': fail has an empty message');
      await shot(n + '-' + lesson + '-c-fail');
      lg('failed=' + failed); await p.evaluate(() => GXST.retry());
      if (!(await p.waitForFunction(() => GXST.state().phase === 'play', null, { timeout: 15000 }).then(() => true, () => false)))
        note(lesson + ': GXST.retry() did not return to play');
      else await live(lesson);
    }

    if (lesson === 'pick') {
      // mid-lesson checks: Rules still opens, hint twice draws a ring
      await p.evaluate(() => { const b = document.querySelector('[data-gx=rulesd]'); if (b) b.click(); });
      await sleep(300);
      if (!(await p.evaluate(() => { const d = document.getElementById('rulesd'); return !!d && d.classList.contains('on'); }))) note('Rules did not open mid-lesson');
      await shot('01-rules');
      await p.evaluate(() => { try { GX.close && GX.close(); } catch (e) { } });
      for (let k = 0; k < 2; k++) {
        await p.evaluate(() => { const hb = document.querySelector('.gxst-bulb'); if (hb) hb.click(); });
        await sleep(250);
      }
      if (!(await p.$('.gxst-ring'))) note('hint twice drew no ring');
      await shot(n + '-' + lesson + '-b-hint');
    }

    lg('solve start'); await runSteps(SOLVE[lesson]); lg('G ' + await p.evaluate(() => JSON.stringify([G.phase, G.ask && G.ask.h, G.figs.map(f => f.id + ':' + f.hp + '@' + f.pos)]))); lg('solve done ' + JSON.stringify((await st()).phase) + ' ' + probs.join(' | '));
    const won = await phaseIs('win', 3000);
    const s = await st();
    if (!won) note(lesson + ': not solved (phase ' + s.phase + ')');
    await shot(n + '-' + lesson + '-d-win');
    await p.evaluate(() => GXST.picker && GXST.picker());
    await p.evaluate(() => GXST.close && GXST.close());
    res[lesson] = { ok: won && probs.length === before, sec: ((Date.now() - t0) / 1000).toFixed(1) };
  }
  await ctx.close();
  return res;
}

(async () => {
  const b = await PW.chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
  const all = {};
  for (const [W, H] of SIZES) all[W + 'x' + H] = await run(b, W, H);
  await b.close();
  for (const tag of Object.keys(all)) for (const [id, r] of Object.entries(all[tag])) console.log((r.ok ? 'PASS ' : 'FAIL ') + tag + ' ' + id + ' ' + r.sec + 's');
  const secs = ((Date.now() - T0) / 1000).toFixed(1);
  if (probs.length) { console.log('FAIL ' + probs.length + ' problem(s) in ' + secs + 's:'); probs.forEach(m => console.log('  ' + m)); process.exit(1); }
  stopBudget(); console.log('PASS all lessons in ' + secs + 's');
})().catch(e => { console.log('FAIL ' + e.message); process.exit(1); });
