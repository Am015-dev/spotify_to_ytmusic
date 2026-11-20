#!/usr/bin/env node
// Game Night TV trailers: records ~22 s of real play of each LIVE board game (the deployed games/<slug>/index.html, never a work branch)
// at 375x667 by touch, then encodes a small VP9 webm + a poster webp into games/tv/ and rewrites games/tv/tv.json and tv.js (the shelf reads tv.js).
//   node games-src/room/tv/record-trailers.js                 # every live board game listed on the shelf (games/index.html GAMES)
//   node games-src/room/tv/record-trailers.js sunglaze tidewake   # only these slugs (the others stay in tv.json as they are)
//   env: TV_SECS=22 (clip length), TV_PAR=2 (games recorded at once), TV_KEEP=1 (keep the raw recordings in $TMPDIR/tv-raw)
// The bot: title -> start (prefers "vs computer / quick / play"), dismisses coach bubbles and tutorial offers, then each beat taps the
// game's own lightbulb and plays the ringed suggestion; with no suggestion it taps the likeliest move button (roll, end turn, next...).
// Skips video games (mainhattan-*) and deep-signal. Needs ffmpeg with libvpx-vp9 and libwebp.
const fs = require('fs'), path = require('path'), os = require('os'), { execFileSync } = require('child_process');
const { chromium } = require('playwright');
const gx = require('../../scripts/gx-serve.js');
const REPO = path.resolve(__dirname, '..', '..', '..'), GAMES = path.join(REPO, 'games'), OUT = path.join(GAMES, 'tv');
const SECS = +(process.env.TV_SECS || 22), PAR = +(process.env.TV_PAR || 2), LEAD = 2.5;   // LEAD: seconds of page load cut from the start
const RAW = path.join(os.tmpdir(), 'tv-raw');
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';

function shelfGames() {   // the GAMES list of the live shelf page
  const s = fs.readFileSync(path.join(GAMES, 'index.html'), 'utf8'), a = s.indexOf('const GAMES=['), b = s.indexOf('\n];', a);
  return (0, eval)(s.slice(a + 12, b + 3)).filter(g => g.kind !== 'video').map(g => ({ id: g.id, slug: g.src.split('/')[0], name: g.name.replace(/\s*\(preview\)\s*$/i, '') }))
    .filter(g => !/^mainhattan-/.test(g.slug) && g.slug !== 'deep-signal' && fs.existsSync(path.join(GAMES, g.slug, 'index.html')));
}

// in-page helpers: visible, uncovered, enabled tap targets with their text
const HELP = `window.__tv={list(){const o=[];for(const e of document.querySelectorAll('button,a[href],[role=button],[onclick],[data-a],[data-act],[data-action],[tabindex="0"],.btn,.card,.tile,.cell,.die,.slot')){
  const cs=getComputedStyle(e);if(cs.visibility==='hidden'||cs.pointerEvents==='none'||+cs.opacity===0)continue;const r=e.getBoundingClientRect();if(r.width<8||r.height<8)continue;
  const cx=Math.min(innerWidth-2,Math.max(1,r.left+r.width/2)),cy=Math.min(innerHeight-2,Math.max(1,r.top+r.height/2));if(cy<0||cy>innerHeight)continue;
  const t=document.elementFromPoint(cx,cy);if(!t||!(t===e||e.contains(t)||t.contains(e)))continue;if(e.disabled||e.getAttribute('aria-disabled')==='true')continue;
  o.push({cx,cy,t:((e.innerText||'')+' '+(e.getAttribute('aria-label')||'')+' '+(e.title||'')).trim().replace(/\\s+/g,' ').slice(0,50),c:String(e.className&&e.className.baseVal===undefined?e.className:'')})}return o}};`;
const DENY = /menu|setting|option|help|rules|how (to|does)|quit|exit|home|shelf|back to|leave|sound|music|mute|share|full ?screen|lab\b|online|invite|friend|story|campaign|chapter|credits|privacy|reset|delete|download|install|offline|achiev|stats|report|feedback|suggest|language|customi[sz]e|new here|learn in|tutorial|goal|show the|points add|breakdown|^you\b|score sheet|log\b|history|close|✕|×/i, DENYC = /gx-ibtn|gxh-bulb|gxh-link|gx-x\b|gxt-menu/;   // DENY: the text; DENYC: the class
const START = /^(skip|no thanks|not now|later|maybe later|just play)|^got it|quick ?(game|play|match|start)?\b|vs\.?\s*(the\s*)?(computer|cpu|ai|bot)|quick (game|play|match)|^solo|1 player|^play\b|^start|new game|^begin|^deal|^let'?s go|^continue|^got it|^ok\b|^next\b|^done/i;
const MOVE = /roll|end turn|next|done|confirm|ok\b|got it|continue|place|take|draw|buy|pass|move|attack|play|keep|accept|deal|go\b|start|ready/i;

async function tap(p, x, y, why) { if (process.env.TV_LOG) console.log('  tap', Math.round(x), Math.round(y), why || ''); try { await p.touchscreen.tap(Math.round(x), Math.round(y)); } catch (e) { } }
async function list(p) { try { return await p.evaluate(() => window.__tv ? window.__tv.list() : []); } catch (e) { return []; } }

async function bot(p, until) {
  let started = 0, beat = 0, quiet = 0, miss = 0; const seen = new Set(), scrolled = new Set();   // seen: start buttons already tapped (a toggle such as "Quick game ▾" is tapped once)   // quiet: beats to wait after the bulb had no suggestion (it opened the rules card)
  while (Date.now() < until) {
    beat++;
    const L = (await list(p)).filter(b => !DENY.test(b.t) && !DENYC.test(b.c));
    // coach bubble or tutorial card: answer it
    const coach = L.find(b => /gxh-|gxt-/.test(b.c) && /got it|next|ok|skip/i.test(b.t));
    if (coach) { await tap(p, coach.cx, coach.cy, 'coach ' + coach.t); await p.waitForTimeout(500); continue; }
    if (started < 5) {   // title screens: tutorial offers, mode pickers, start buttons
      const key = b => b.t.replace(/[▾▴▸▼▲›»]/g, '').trim(), s = L.find(b => START.test(b.t) && !seen.has(key(b)));
      if (s) seen.add(key(s));
      if (s) { await tap(p, s.cx, s.cy, 'start ' + s.t); started++; await p.waitForTimeout(1100); continue; }
      const off = await p.evaluate(([src, done]) => { const re = new RegExp(src, 'i');   // a start button below the fold: scroll to it
        for (const e of document.querySelectorAll('button,[role=button],a[href]')) { const t = (e.innerText || '').trim().replace(/\s+/g, ' '); const r = e.getBoundingClientRect();
          if (t && re.test(t) && !done.includes(t.replace(/[▾▴▸▼▲›»]/g, '').trim()) && r.width > 8 && (r.top > innerHeight - 4 || r.bottom < 4) && !e.disabled) { e.scrollIntoView({ block: 'center' }); return t; } } return null; }, [START.source, [...seen]]).catch(() => null);
      if (off && !scrolled.has(off)) { scrolled.add(off); await p.waitForTimeout(400); continue; }
      started = 5;
    }
    // the game's own hint: the lightbulb rings the suggested move
    const bulb = await p.$('.gxh-bulb');
    if (bulb && await bulb.isVisible().catch(() => false) && beat % 2 === 1 && beat > quiet && miss < 2) {
      const bb = await bulb.boundingBox(); if (bb) await tap(p, bb.x + bb.width / 2, bb.y + bb.height / 2);
      await p.waitForTimeout(700);
      const ring = await p.$('.gxh-ring');
      const rb = ring && await ring.boundingBox().catch(() => null);
      if (rb) { await p.waitForTimeout(500); await tap(p, rb.x + rb.width / 2, rb.y + rb.height / 2); await p.waitForTimeout(900); continue; }
      miss++; quiet = beat + 6; await p.keyboard.press('Escape').catch(() => { }); await p.waitForTimeout(300);   // a rules card instead of a move: close it, and after two misses stop asking
      const shut = (await list(p)).find(b => /^(got it|close|ok|done|✕|×)$/i.test(b.t)); if (shut) { await tap(p, shut.cx, shut.cy, 'close card'); await p.waitForTimeout(400); }   // a rules card instead of a move
    }
    const m = L.find(b => MOVE.test(b.t)) || L.filter(b => b.cy > 90)[(beat * 7) % Math.max(1, L.filter(b => b.cy > 90).length)];
    if (m) await tap(p, m.cx, m.cy, 'move ' + m.t + ' ' + m.c.slice(0, 30)); else { await p.keyboard.press('Escape').catch(() => { }); await tap(p, 187, 420); }   // nothing to tap: a viewer is open, Escape closes most
    await p.waitForTimeout(1000);
  }
}

async function record(browser, g) {
  const dir = path.join(RAW, g.slug); fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
  const ctx = await browser.newContext({ viewport: { width: 375, height: 667 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1, userAgent: UA,
    recordVideo: { dir, size: { width: 375, height: 667 } } });
  await ctx.addInitScript(HELP + `try{localStorage.setItem('gx_music','off')}catch(e){}`);
  const p = await ctx.newPage(); let err = 0; p.on('pageerror', () => err++);
  const t0 = Date.now();
  await p.goto(await gx.url(g.slug), { waitUntil: 'load', timeout: 60000 }).catch(() => { });
  await p.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => { });   // slow pages: the trailer must not open on a blank loading screen
  await p.waitForTimeout(Math.max(600, LEAD * 1000 - (Date.now() - t0)));
  const lead = (Date.now() - t0) / 1000;
  await bot(p, Date.now() + SECS * 1000 + 600);
  const v = p.video(); await ctx.close(); const raw = await v.path();
  return { raw, lead, err };
}

function encode(g, r) {
  const webm = path.join(OUT, g.slug + '.webm'), poster = path.join(OUT, g.slug + '.webp');
  const ss = String(Math.max(0, r.lead - 0.3));
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-ss', ss, '-i', r.raw, '-t', String(SECS), '-an', '-vf', 'fps=24,scale=376:668:flags=lanczos,crop=376:668',
    '-c:v', 'libvpx-vp9', '-b:v', '380k', '-maxrate', '520k', '-bufsize', '900k', '-crf', '38', '-deadline', 'good', '-cpu-used', '2', '-row-mt', '1', '-g', '96', '-pix_fmt', 'yuv420p', webm]);
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-ss', String(Math.min(SECS - 1, 9)), '-i', webm, '-frames:v', '1', '-c:v', 'libwebp', '-quality', '62', poster]);
  const dur = +execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', webm]).toString().trim();
  if (!process.env.TV_KEEP) fs.rmSync(path.dirname(r.raw), { recursive: true, force: true });
  return { slug: g.slug, id: g.id, name: g.name, file: g.slug + '.webm', poster: g.slug + '.webp', duration: Math.round(dur * 10) / 10, kb: Math.round(fs.statSync(webm).size / 1024) };
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const all = shelfGames(), want = process.argv.slice(2), todo = want.length ? all.filter(g => want.includes(g.slug)) : all;
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required', '--mute-audio'] });
  const res = {}; let i = 0;
  await Promise.all(Array.from({ length: PAR }, async () => {
    while (i < todo.length) { const g = todo[i++];
      try { const r = await record(browser, g); res[g.slug] = encode(g, r); console.log(`ok   ${g.slug} ${res[g.slug].kb} KB ${res[g.slug].duration}s errors ${r.err}`); }
      catch (e) { console.log(`FAIL ${g.slug} ${e.message.split('\n')[0]}`); } }
  }));
  await browser.close();
  const mf = path.join(OUT, 'tv.json'); let old = []; try { old = JSON.parse(fs.readFileSync(mf, 'utf8')).trailers || []; } catch (e) { }
  const trailers = all.map(g => res[g.slug] || old.find(t => t.slug === g.slug)).filter(Boolean).map(({ kb, ...t }) => t);
  const data = { channel: 'Game Night TV', recorded: new Date().toISOString().slice(0, 10), trailers };
  fs.writeFileSync(mf, JSON.stringify(data, null, 1) + '\n');
  fs.writeFileSync(path.join(OUT, 'tv.js'), '/* Game Night TV trailer list (same as tv.json; a script so the shelf also reads it from file://). Written by games-src/room/tv/record-trailers.js */\nwindow.GNS_TV=' + JSON.stringify(data) + ';\n');
  const mb = fs.readdirSync(OUT).reduce((a, f) => a + fs.statSync(path.join(OUT, f)).size, 0) / 1048576;
  console.log(`${trailers.length} trailers in games/tv/tv.json, folder ${mb.toFixed(1)} MB`);
  process.exit(0);
})();
