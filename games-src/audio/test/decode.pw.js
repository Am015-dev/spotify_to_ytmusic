// PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node audio/test/decode.pw.js
// Decodes every sample of every game bundle in real Chromium through gameaudio.js and reports durations.
const path = require('path'), fs = require('fs'), { execSync } = require('child_process');
const PW = process.env.PW || path.join(execSync('npm root -g').toString().trim(), 'playwright');
const { chromium } = require(PW);
const A = path.join(__dirname, '..');
const GAMES = ['sands', 'crown', 'nebula', 'shipwreck', 'doorkick', 'sunglaze', 'rampart'];

(async () => {
  const b = await chromium.launch();
  let totalFail = 0, totalN = 0; const summary = {};
  for (const g of GAMES) {
    const p = await b.newPage();
    const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    await p.setContent('<!doctype html><body style="height:300px"><button id=b style="width:200px;height:100px">go</button></body>');
    await p.addScriptTag({ path: path.join(A, 'gameaudio.js') });
    await p.addScriptTag({ path: path.join(A, g, 'audio-data.js') });
    await p.evaluate(() => { window.__d = GA_DATA; GA.init({ sfx: GA_DATA.sfx, music: GA_DATA.music, key: 'pw' }); });
    await p.click('#b'); // real user gesture -> unlock + lazy decode
    await p.waitForFunction(() => { const s = GA.state(); return s.decoded + s.failed.length >= s.total; }, null, { timeout: 60000 });
    const r = await p.evaluate(async () => {
      const s = GA.state(), out = { state: s, sfx: {}, music: {} };
      for (const n of Object.keys(__d.sfx)) out.sfx[n] = +GA.duration(n).toFixed(3);
      for (const n of Object.keys(__d.music)) out.music[n] = +GA.duration(n).toFixed(2);
      // exercise the real playback paths
      const m0 = Object.keys(__d.music)[0];
      out.play = GA.play('click'); out.playWin = GA.play('win', { vol: .8, pan: .3 });
      out.cool = GA.play('click'); // inside cooldown -> false
      out.music = Object.assign(out.music, {}); out.musicOn = GA.music(m0); out.playing = GA.playing();
      const loopName = ['rain', 'engine_loop'].find(n => GA.has(n)); out.loop = loopName ? GA.loop(loopName) : 'n/a';
      await new Promise(r => setTimeout(r, 300));
      if (loopName) GA.stopLoop(loopName);
      out.off = GA.setMusic(false); out.on = GA.setMusic(true);
      out.ctx = GA.state().ctxState;
      return out;
    });
    const fails = r.state.failed; totalFail += fails.length; totalN += r.state.total;
    summary[g] = { total: r.state.total, decoded: r.state.decoded, failed: fails, sfx: r.sfx, music: r.music,
      checks: { play: r.play, playWin: r.playWin, cooldownBlocked: r.cool === false, musicOn: r.musicOn, playing: r.playing, loop: r.loop, ctx: r.ctx }, errors: errs };
    console.log(`\n== ${g}: ${r.state.decoded}/${r.state.total} decoded, ${fails.length} failed ${fails.join(' ')} | ctx ${r.ctx} | errors ${errs.length}`);
    console.log('  sfx   ' + Object.entries(r.sfx).map(([k, v]) => `${k} ${v}s`).join(', '));
    console.log('  music ' + Object.entries(r.music).map(([k, v]) => `${k} ${v}s`).join(', '));
    console.log('  checks ' + JSON.stringify(summary[g].checks));
    await p.close();
  }
  await b.close();
  fs.writeFileSync(path.join(A, 'test', 'decode-report.json'), JSON.stringify(summary, null, 1));
  console.log(`\nTOTAL ${totalN} samples, ${totalFail} decode failures`);
  process.exit(totalFail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
