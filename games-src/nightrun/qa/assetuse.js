#!/usr/bin/env node
// ASSETUSE (W205 audit, no game changes): which owner-made pictures are really loaded and drawn, per asset id and animation state.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/qa/assetuse.js
//   env: OUT=<json> (default: scratch dir, keep out of git)  SHOTS=<dir> (webp shots; unset = none)  ONLY=flight|street  GODT=<s of stage-1 play before the boss is called, default 45>
// Plays flight stage 1 (god mode, stepped at sim speed, boss called in, played to its defeat) and the street level (zeil, god mode, to its boss and the end).
// Hooks: HTMLImageElement.src setter (every file the page asked for), CanvasRenderingContext2D.drawImage (resolved to an asset id through ART.bm / ART.sc / ART.big; for anim sheets the frame
// index is sx / sw). Phase tags: s1 (flight before the boss), boss (stage-1 boss alive), street, sboss (street boss alive).
// Prints: OUT json + 'DONE' line. Static inventory (files, sizes, frame counts) is read from media/ and ART.ANIM.s. Exit 0 always (a measurement).
const PW = require(process.env.PW || 'playwright'), path = require('path'), cp = require('child_process'), fs = require('fs'), net = require('net'), os = require('os');
const ROOT = path.resolve(__dirname, '../../..'), GAME = path.join(ROOT, 'games/mainhattan-nightrun'), MEDIA = path.join(GAME, 'media');
const OUT = process.env.OUT || path.join(os.tmpdir(), 'assetuse.json'), SHOTS = process.env.SHOTS || '', ONLY = process.env.ONLY || '', GODT = +process.env.GODT || 45, RE = +process.env.RENDER_EVERY || 10, SEED = +process.env.SEED || 7;
// several runs: SEEDS=3 spawns one child per seed (SEED=n, shots only on the first); each writes <OUT>.<n>.json and prints its game-seconds per real second
if (+process.env.SEEDS > 1 && !process.env.SEED) { const n = +process.env.SEEDS; for (let k = 1; k <= n; k++) { const r = cp.spawnSync(process.execPath, [__filename], { env: { ...process.env, SEEDS: '', SEED: String(k), OUT: OUT.replace(/\.json$/, '') + '.' + k + '.json', SHOTS: k === 1 ? SHOTS : '' }, encoding: 'utf8' }); console.log(r.stdout.split('\n').filter(l => /^(DONE|FAIL|SPEED|phone|street)/.test(l) && !/^  /.test(l)).join('\n')); } process.exit(0); }
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const sleep = ms => new Promise(r => setTimeout(r, ms));
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';

const INIT = `(()=>{let a=${SEED}|0;Math.random=function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};
  const U=window.__au={ph:'boot',src:{},draw:{},unk:0};
  const d=Object.getOwnPropertyDescriptor(HTMLImageElement.prototype,'src');
  Object.defineProperty(HTMLImageElement.prototype,'src',{configurable:true,enumerable:d.enumerable,get:d.get,set:function(v){try{const m=/media\\/(.+)\\.webp/.exec(String(v));if(m)U.src[m[1]]=(U.src[m[1]]||0)+1;}catch(e){}return d.set.call(this,v);}});
  const pr=CanvasRenderingContext2D.prototype,di=pr.drawImage,rev=new WeakMap();
  const parse=k=>{if(k.startsWith('a|'))return 'anim/'+k.slice(2).split('@')[0]+'-strip';if(/^[sth]\\|/.test(k))k=k.slice(2);return k.split('@')[0].split('|')[0];};
  const resolve=im=>{if(rev.has(im))return rev.get(im)||null;let r=null;const M=window.__mnr,ART=M&&M.ART;
    if(im instanceof HTMLImageElement){const m=/media\\/(.+)\\.webp/.exec(im.src);if(m)r=m[1];}
    else if(ART){for(const k in ART.bm)if(ART.bm[k]===im){r=k;break;}
      if(!r)for(const k in ART.sc){const o=ART.sc[k];if(o&&o.c===im){r=parse(k);break;}}
      if(!r)for(const k in ART.big){if(ART.big[k]===im){r=parse(k);break;}}
      if(!r&&window.FA)for(const k in FA._im){const q=FA._im[k];if(q&&q.im===im){r=k.replace(/\\.webp$/,'');break;}}}
    rev.set(im,r||false);return r;};
  pr.drawImage=function(im,...a){if(im&&U.ph!=='boot'){try{const id=resolve(im);if(!id)U.unk++;else{const e=U.draw[id]||(U.draw[id]={});const p=e[U.ph]||(e[U.ph]={n:0,fr:{}});p.n++;
    if(/^anim\\//.test(id)&&a.length>=8&&a[2]>0){const f=Math.round(a[0]/a[2]);p.fr[f]=(p.fr[f]||0)+1;}}}catch(e){}}
    return di.call(this,im,...a);};})();`;

// in the page: one flight tick of n steps (god mode, ship sweeps toward the nearest foe, fire held)
const FLY = `(()=>{const m=window.__mnr,U=window.__au;let i=0;window.__fly={st:()=>({t:m.G.t,en:m.G.en.length,eb:m.G.eb.length,pb:m.G.pb.length,boss:!!m.G.boss,bossDone:!!m.G.bossDone,dead:!!m.G.dead,over:!!m.ST.over,
  bh:m.G.boss?m.G.boss.hp:0,ph:U.ph}),
  tick(n){for(let k=0;k<n;k++){const P=m.P,G=m.G;if(P.hp<P.max)P.hp=P.max;P.inv=Math.max(P.inv,.5);let tx=300,ty=480/2;
    let b=null,bd=1e9;for(const e of G.en){if(e.x<960&&e.x>P.x){const d=Math.hypot(e.x-P.x,(e.y-P.y)*.3)+Math.abs(e.x-P.x)*.2;if(d<bd){bd=d;b=e;}}}
    if(G.boss)b=G.boss; if(b){tx=Math.min(520,Math.max(120,b.x-260));ty=b.y;}else{tx=200+Math.sin(G.t*.6)*90;ty=270+Math.sin(G.t*.9)*190;}
    m.touchTo(tx,ty);m.step(1/60);if(i%${RE}===0)try{m.render(m.G.t,1/60);}catch(e){}i++;
    if(G.boss&&U.ph==='s1')U.ph='boss';}}};})()`;

(async () => {
  const t0 = Date.now(), el = () => ((Date.now() - t0) / 1000).toFixed(0) + 's';
  const port = await freePort(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME], { stdio: 'ignore' });
  for (let i = 0; i < 60; i++) { try { if ((await fetch(`http://127.0.0.1:${port}/index.html`)).ok) break; } catch (e) { } await sleep(100); }
  const br = await PW.chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const base = `http://127.0.0.1:${port}/index.html?sim=1&nomusic=1`;
  const open = async (W, H, touch) => {
    const ctx = await br.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, hasTouch: touch, isMobile: touch, userAgent: touch ? UA : undefined });
    const p = await ctx.newPage(); p.errs = []; p.on('pageerror', e => p.errs.push(String(e.message).slice(0, 160)));
    await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
    await p.addInitScript(() => { try { localStorage.setItem('mnr_tipdone', 'true'); localStorage.setItem('mnr_fscard', '99'); } catch (e) { } });
    await p.addInitScript(INIT);
    await p.goto(base, { waitUntil: 'domcontentloaded' });
    await p.waitForFunction(() => window.__mnr, null, { timeout: 20000 });
    await p.waitForFunction(() => document.documentElement.classList.contains('rdy'), null, { timeout: 20000 }).catch(() => { });
    await sleep(800); return p;
  };
  const shot = async (p, name) => { if (!SHOTS) return; fs.mkdirSync(SHOTS, { recursive: true }); const png = path.join(os.tmpdir(), name + '.png'); await p.screenshot({ path: png });
    cp.execFileSync('python3', ['-c', 'import sys;from PIL import Image;Image.open(sys.argv[1]).convert("RGB").save(sys.argv[2],"WEBP",quality=82)', png, path.join(SHOTS, name + '.webp')]); fs.unlinkSync(png); };
  const out = { when: new Date().toISOString(), inv: null, flight: {}, street: {}, log: [] };

  // ---- static inventory + flight on the phone viewport
  const run = async (W, H, tag, wantStats) => {
    const p = await open(W, H, tag === 'phone');
    if (wantStats) out.inv = await p.evaluate(() => { const A = __mnr.ART; return { anim: A.ANIM.s, calib: Object.keys(A.ANIM.c || {}), ready: [...A.rd] }; });
    if (ONLY === 'street') return p;
    await p.evaluate(`(()=>{const m=window.__mnr;m.SET.diff='normal';try{m.applySet()}catch(e){};m.startStory(1);m.simOn(true);})()`);
    await sleep(2500);   // startStory holds back until the first sheets decode (preload.js)
    await p.evaluate(FLY); await p.evaluate(() => { window.__au.ph = 's1'; });
    let st = await p.evaluate(() => window.__fly.st()), shotS1 = false, shotB = false, guard = 0, bossCalled = false, tBoss = 0;
    while (guard++ < 400) { if (guard % 10 === 0) console.log(`  ${tag} t=${st.t.toFixed(0)} en=${st.en} eb=${st.eb} boss=${st.boss} ${el()}`);
      await p.evaluate(() => window.__fly.tick(120)); st = await p.evaluate(() => window.__fly.st());
      if (!shotS1 && st.t > 20 && st.en + st.eb >= 14) { shotS1 = true; await shot(p, `s1-busy-${tag}`); out.log.push(`${tag} s1 shot t=${st.t.toFixed(1)} en=${st.en} eb=${st.eb} pb=${st.pb}`); }
      if (st.t >= GODT && !st.boss && !st.bossDone) { if (!shotS1) { shotS1 = true; await shot(p, `s1-busy-${tag}`); out.log.push(`${tag} s1 shot(late) t=${st.t.toFixed(1)} en=${st.en} eb=${st.eb}`); } if (!bossCalled) { bossCalled = true; out.log.push(`${tag} boss called t=${st.t.toFixed(1)}`); } await p.evaluate(() => __mnr.bossNow()); }   // repeated: bossNow only works between waves
      if (st.boss && !tBoss) tBoss = st.t;
      if (st.boss && !shotB && st.t - tBoss > 8) { shotB = true; await shot(p, `s1-boss-${tag}`); out.log.push(`${tag} boss shot t=${st.t.toFixed(1)} bossHp=${st.bh}`); }
      if (tBoss && st.t - tBoss > 70 && st.boss) { await p.evaluate(() => __mnr.killBoss()); tBoss = 1e9; out.log.push(`${tag} boss killed by hook after 70 s`); }   // everything it can do is shown by then
      if (st.bossDone || st.dead || st.over) { out.log.push(`${tag} stage ${st.bossDone ? 'boss down' : st.dead ? 'dead' : 'over'} t=${st.t.toFixed(1)}`); break; }
    }
    out.flyT = (out.flyT || 0) + st.t;
    if (st.bossDone) { await p.evaluate(() => window.__fly.tick(240)); }   // let the defeat clip + explosions play out
    return p;
  };
  const ph = await run(390, 763, 'phone', true);
  if (ONLY !== 'street') { out.flight = await ph.evaluate(() => ({ draw: JSON.parse(JSON.stringify(window.__au.draw)), src: window.__au.src, unk: window.__au.unk })); }
  // ---- street on the same page (the draw table keeps adding under street / sboss)
  if (ONLY !== 'flight') {
    await ph.evaluate(() => { window.__au.ph = 'street'; });
    const r = await ph.evaluate(async (RE) => { const M = __mnr, F = FOOT, ART = M.ART, U = window.__au; M.RET.tale = false; try { M.abort(); } catch (e) { } F.start('zeil');
      for (let i = 0; i < 150 && !ART.anim('kai/run'); i++) await new Promise(r => setTimeout(r, 100));
      for (let i = 0; i < 100 && !(F.q && F.q.picsReady()); i++) await new Promise(r => setTimeout(r, 100));
      F.on = false; await new Promise(r => setTimeout(r, 50)); const S = F.S, P = S.P, c = F._in.L().ctx; let tb = 0, t0 = -1, ended = null, bossSeen = false; const log = [];
      F.ctl = (S_, I) => { I.l = I.u = I.d = 0; I.r = 1; I.fire = 1; I.jump = (Math.floor(S_.time * 2) % 5 === 0) ? 1 : 0; };
      for (let i = 0; i < 60 * 600; i++) { if (P.hp < P.max) P.hp = P.max; F.sim(1 / 60, 1 / 60); try { if (i % RE === 0) F.look.draw(c); } catch (e) { log.push('draw ' + e.message); break; }
        if (S.boss && !bossSeen) { bossSeen = true; U.ph = 'sboss'; t0 = S.time; log.push('street boss seen at ' + S.time.toFixed(1)); }
        if (bossSeen && S.time - t0 > 60 && S.boss && !S.boss.dead) { try { S.boss.hp = 0; } catch (e) { } t0 = 1e9; log.push('boss hp zeroed after 60 s'); }
        if (S.end) { ended = { cleared: !!S.end.cleared, t: +S.time.toFixed(1) }; for (let k = 0; k < 90; k++) { F.sim(1 / 60, 1 / 60); if (k % RE === 0) F.look.draw(c); } break; } }
      return { ended, bossSeen, t: +S.time.toFixed(1), log, hp: P.hp }; }, RE);
    out.street = r; out.log.push('street ' + JSON.stringify(r));
    out.all = await ph.evaluate(() => ({ draw: JSON.parse(JSON.stringify(window.__au.draw)), src: window.__au.src, unk: window.__au.unk }));
  } else out.all = out.flight;
  out.errs = ph.errs;
  // ---- the PC pair (flight only; same seed, so the same moments)
  if (SHOTS && ONLY !== 'street') { const pc = await run(1440, 860, 'pc', false); out.errs = out.errs.concat(pc.errs); }
  // ---- file sizes
  const files = {}; const walk = d => { for (const f of fs.readdirSync(d, { withFileTypes: true })) { const q = path.join(d, f.name); if (f.isDirectory()) walk(q); else if (/\.webp$/.test(f.name)) files[path.relative(MEDIA, q).replace(/\.webp$/, '')] = fs.statSync(q).size; } };
  walk(MEDIA); out.files = files;
  fs.writeFileSync(OUT, JSON.stringify(out));
  console.log(out.log.join('\n')); console.log(`SPEED seed ${SEED}: ${((out.flyT + (out.street.t || 0)) / ((Date.now() - t0) / 1000)).toFixed(1)}x real time (game s / wall s, render every ${RE} steps; flight ${(out.flyT || 0).toFixed(0)} s + street ${out.street.t || 0} s)`);
  console.log(`DONE assetuse ${el()} ${Object.keys(files).length} files, ${Object.keys(out.all.draw).length} ids drawn, errs=${out.errs.length} -> ${OUT}`);
  await br.close(); srv.kill(); process.exit(0);
})().catch(e => { console.log('FAIL assetuse crashed: ' + e.stack); process.exit(2); });
