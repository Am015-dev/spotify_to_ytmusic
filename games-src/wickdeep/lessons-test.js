// Wickdeep scenario lessons test (lessons.js on the shared gx-scenario-tutor). Pattern of tidewake/game/lessons-test.js.
//   NODE_PATH=$(npm root -g) node games-src/wickdeep/lessons-test.js [sizes=402x874,1366x768]   prints PASS/FAIL + seconds, exit 1 on a problem.
// Asserts: every lesson in WDL.lessons is solved with REAL touchscreen taps (finish: engine moves via WDAI.choose), phase 'win';
// pick, shield and retal: one WRONG sequence ends in 'fail' with a message, GXST.retry() returns to 'play';
// every tap lands on its target (elementFromPoint); Rules opens mid-lesson; hint twice draws a ring; 0 JS page errors.
// Proof: games-src/wickdeep/proof/lesson-<id>-<WxH>.png (the start of each lesson).
const PW = (() => { try { return require(process.env.PW_DIR || 'playwright'); } catch (e) { return require('../node_modules/playwright'); } })();
const fs = require('fs'), path = require('path');
const html = fs.readFileSync(path.join(__dirname, 'wickdeep.html'));
const SIZES = (process.argv[2] || '402x874,1366x768').split(',').map(s => s.split('x').map(Number));
const PROOF = path.join(__dirname, 'proof'); fs.mkdirSync(PROOF, { recursive: true });
const sleep = ms => new Promise(r => setTimeout(r, ms)); const probs = []; const T0 = Date.now();

// Steps: c(name) = tap a card in the tray; h(name, re) = tap that card's half matching re; ready / play = buttons; g(sel) = a board hex glow.
const c = name => ({ sel: '#tray .cd', name }), h = (name, re) => ({ sel: '#tray .half.can', name, re }),
  ready = { sel: '#readybtn' }, play = { sel: '#playbtn' }, g = sel => ({ sel }), ENGINE = { engine: 1 };
const SOLVE = {
  pick: [c('Holdfast'), c('Candle Guard'), ready],
  halves: [c('Lantern Swing'), c('Tallow Bash'), ready, h('Lantern Swing', /m4|Move 4/), play, g('#hot .glow'), h('Tallow Bash', /a3|Attack 3/), play, g('#hot .glow.atk')],
  shield: [c('Brazier Rush'), c('Tallow Bash'), ready, h('Brazier Rush', /a4|Attack 4/), play, g('#hot .glow.atk')],
  retal: [c('Hot Wax Hurl'), c('Tallow Bash'), ready, h('Hot Wax Hurl', /a2|Attack 2/), play, g('#hot .glow.atk')],
  door: [c('Lantern Swing'), c('Wickflare'), ready, h('Lantern Swing', /m4|Move 4/), play, g('#hot .glow')],
  coin: [c('Tallow Bash'), c('Wickflare'), ready, h('Tallow Bash', /m3|Move 3/), play, g('#hot .glow')],
  finish: [c('Tallow Bash'), c('Candle Guard'), ready, ENGINE]
};
const WRONG = {
  pick: [c('Vigil'), c('Ember Oath'), ready],
  shield: [c('Tallow Bash'), c('Holdfast'), ready, h('Tallow Bash', /a3|Attack 3/), play, g('#hot .glow.atk')],
  retal: [c('Tallow Bash'), c('Lantern Swing'), ready, h('Tallow Bash', /a3|Attack 3/), play, g('#hot .glow.atk')]
};

async function run(b, W, H) {
  const tag = W + 'x' + H, phone = W < 600, note = m => probs.push(tag + ': ' + m);
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, isMobile: phone, hasTouch: true });
  await ctx.route('**/*', r => new URL(r.request().url()).host === 'gns.test' ? r.fulfill({ status: 200, contentType: 'text/html', body: html }) : r.abort());
  const p = await ctx.newPage(); p.setDefaultTimeout(15000);
  p.on('pageerror', e => note('PAGE ERROR ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/net::|Failed to load|favicon/.test(m.text())) note('console error ' + m.text().slice(0, 140)); });
  await p.goto('https://gns.test/?2d=1');
  await p.waitForFunction(() => window.GXST && GXST.state() && window.WDL, null, { timeout: 30000 });
  await p.evaluate(() => { try { window.AIDELAY = 40; UI.speed = 8; } catch (e) { } });
  const st = () => p.evaluate(() => GXST.state());
  const busy = () => p.waitForFunction(() => !UI.busy, null, { timeout: 15000 }).catch(() => { });
  const phaseIs = (want, ms) => p.waitForFunction(w => GXST.state().phase === w, want, { timeout: ms || 15000 }).then(() => true, () => false);
  const live = id => p.waitForFunction(id => { const s = GXST.state(); return s.id === id && s.phase === 'play' && s.live; }, id, { timeout: 20000 });

  // find the visible element for a step, check the point is really it, then touch it with a real tap
  const tapStep = async s => {
    await busy();
    const pt = await p.evaluate(a => {
      const vis = e => { const r = e.getBoundingClientRect(); return r.width > 8 && r.height > 8 && r.bottom > 0 && r.top < innerHeight && !e.closest('[hidden]'); };
      const re = a.re ? new RegExp(a.re) : null;
      const e = [...document.querySelectorAll(a.sel)].find(x => vis(x) && (!a.name || (x.closest('.cd') || x).textContent.includes(a.name)) && (!re || re.test(x.textContent)));
      if (!e) return null;
      const r = e.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2, u = document.elementFromPoint(x, y);
      return { x, y, ok: !!u && (u === e || e.contains(u)), by: u && (u.id || String(u.className).slice(0, 40)) };
    }, s);
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

  const res = {};
  for (const lesson of ['pick', 'halves', 'shield', 'retal', 'door', 'coin', 'finish']) {
    const t0 = Date.now(), before = probs.length;
    await p.evaluate(id => GXST.start(id), lesson);
    await live(lesson);
    await p.screenshot({ path: path.join(PROOF, 'lesson-' + lesson + '-' + tag + '.png') });

    if (WRONG[lesson]) {
      await runSteps(WRONG[lesson]);
      const failed = await phaseIs('fail', 20000);
      const s = await st();
      if (!failed) note(lesson + ': wrong sequence did not end in fail (phase ' + s.phase + ')');
      else if (!s.msg) note(lesson + ': fail has an empty message');
      await p.evaluate(() => GXST.retry());
      if (!(await p.waitForFunction(() => GXST.state().phase === 'play', null, { timeout: 15000 }).then(() => true, () => false)))
        note(lesson + ': GXST.retry() did not return to play');
      else await live(lesson);
    }

    if (lesson === 'pick') {
      // mid-lesson checks: Rules still opens, hint twice draws a ring
      await p.evaluate(() => { const b = document.querySelector('[data-gx=rulesd]'); if (b) b.click(); });
      await sleep(300);
      if (!(await p.evaluate(() => { const d = document.getElementById('rulesd'); return !!d && d.classList.contains('on'); }))) note('Rules did not open mid-lesson');
      await p.evaluate(() => { try { GX.close && GX.close(); } catch (e) { } });
      for (let k = 0; k < 2; k++) {
        await p.evaluate(() => { const hb = [...document.querySelectorAll('button')].find(x => /hint/i.test(x.textContent + ' ' + (x.getAttribute('aria-label') || ''))); if (hb) hb.click(); });
        await sleep(250);
      }
      if (!(await p.$('.gxst-ring'))) note('hint twice drew no ring');
    }

    await runSteps(SOLVE[lesson]);
    const won = await phaseIs('win', 15000);
    const s = await st();
    if (!won) note(lesson + ': not solved (phase ' + s.phase + ')');
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
  console.log('PASS all lessons in ' + secs + 's');
})().catch(e => { console.log('FAIL ' + e.message); process.exit(1); });
