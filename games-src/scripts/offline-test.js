#!/usr/bin/env node
// Offline pack test: serve games/ (python http.server), download games through the shelf UI (sync.html), go offline,
// open each game and assert its files come from the cache (media, music with Range, no failed requests, no error responses).
//   node games-src/scripts/offline-test.js [slug ...]     default: mainhattan-nightrun crown-city-smash
const {chromium}=require(process.env.PW_PATH||'playwright');
const {spawn,execSync}=require('child_process');const path=require('path');const fs=require('fs');
const ROOT=path.resolve(__dirname,'../../games'),PORT=+(process.env.PORT||8765),BASE='http://localhost:'+PORT+'/';
const SLUGS=process.argv.slice(2).length?process.argv.slice(2):['mainhattan-nightrun','crown-city-smash'];
const ID={'mainhattan-nightrun':'mainhattan','crown-city-smash':'crown'};
let fails=0;const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)fails++};
(async()=>{
  const srv=spawn('python3',['-m','http.server',String(PORT),'--bind','127.0.0.1'],{cwd:ROOT,stdio:'ignore'});
  await new Promise(r=>setTimeout(r,800));
  const browser=await chromium.launch();
  try{for(const slug of SLUGS){
    const man=JSON.parse(fs.readFileSync(path.join(ROOT,slug,'offline.json'),'utf8'));
    const ctx=await browser.newContext({viewport:{width:390,height:800},serviceWorkers:'allow'});
    const page=await ctx.newPage();page.on('dialog',d=>d.accept());
    await page.goto(BASE+'sync.html');
    await page.evaluate(()=>navigator.serviceWorker.ready);
    await page.waitForFunction(()=>!!navigator.serviceWorker.controller,null,{timeout:20000}).catch(async()=>{await page.reload()});
    const li=page.locator('li.g[data-id="'+ID[slug]+'"]');
    await li.locator('.st').first().waitFor();
    console.log(slug+': before:',(await li.locator('.st').allTextContents()).join(' | '));
    const t0=Date.now();
    await li.locator('.sw').click();
    let sawProgress=false;
    const dl=page.waitForFunction(id=>{const e=document.querySelector('li.g[data-id="'+id+'"] .st');return e&&(/complete/.test(e.textContent)||/missing|failed|Not enough/.test(e.textContent))},ID[slug],{timeout:600000,polling:500});
    const poll=setInterval(async()=>{try{const t=await li.locator('.st').first().textContent();if(/Downloading ·/.test(t)){sawProgress=true}}catch(e){}},700);
    await dl;clearInterval(poll);
    const secs=((Date.now()-t0)/1000).toFixed(1);
    const txt=await li.locator('.st').first().textContent();
    console.log(slug+': after:',txt,'in',secs,'s; manifest',man.files.length,'files',(man.total/1e6).toFixed(1),'MB');
    ok(/complete/.test(txt),slug+' shows complete');ok(sawProgress,slug+' showed a progress line while downloading');
    const n=await page.evaluate(async()=>{const c=await caches.open('gns-games-v2');return (await c.keys()).length});
    ok(n>=man.files.length,slug+' cache holds '+n+' entries for '+man.files.length+' manifest files');
    // resumable: reload, scan must say complete without downloading
    await page.reload();await page.locator('li.g[data-id="'+ID[slug]+'"] .st').first().waitFor();await page.waitForTimeout(2500);
    ok(/complete/.test(await page.locator('li.g[data-id="'+ID[slug]+'"] .st').first().textContent()),slug+' still complete after reload (scan)');
    // offline launch
    await ctx.setOffline(true);
    const g=await ctx.newPage();const bad=[],bytes={n:0};const errs=[];
    const packSet=new Set(man.files.map(f=>BASE+slug+'/'+f.p)),inPack=u=>packSet.has(u.split(/[?#]/)[0])||u.endsWith('/'+slug+'/'),own=u=>u.startsWith(BASE),ext=[];   // probes for files the game does not ship (404 online too) are tolerated
      // other origins (web fonts) are not part of the pack: counted, not failed
    g.on('requestfailed',r=>(own(r.url())?bad:ext).push('FAILED '+r.url()));
    g.on('response',r=>{if(r.status()>=400&&own(r.url())&&inPack(r.url()))bad.push(r.status()+' '+r.url())});
    g.on('pageerror',e=>errs.push(e.message));
    await g.goto(BASE+slug+'/index.html',{waitUntil:'load'});
    await g.waitForTimeout(8000);
    ok(!/This game is not on this device/.test(await g.content().then(h=>h.slice(0,4000))),slug+' offline page is the game, not the offline notice');
    // every file of the pack must be retrievable offline (assets by fetch, music/video with a Range request like <audio>)
    const res=await g.evaluate(async(a)=>{const miss=[];let n=0,b=0;
      const names=a.files.map(f=>f.p).filter(p=>/\.(webp|png|mp3|json|glb|mp4|js)$/.test(p));
      const pick=names.length>400?names.filter((_,i)=>i%3===0).concat(names.filter(p=>/media\/anim|\.mp3$/.test(p))):names;
      const set=[...new Set(pick)];let i=0;
      await Promise.all(Array.from({length:6},async()=>{while(i<set.length){const p=set[i++];try{const r=await fetch(p);if(!r.ok){miss.push(p+' '+r.status);continue}b+=(await r.blob()).size;n++}catch(e){miss.push(p+' '+e.message)}}}));
      const mp3=a.files.map(f=>f.p).filter(p=>/\.mp3$/.test(p))[0];let rng='no mp3';
      if(mp3){const r=await fetch(mp3,{headers:{range:'bytes=0-99'}});rng=r.status+' '+r.headers.get('content-range')}
      return {n,b,miss:miss.slice(0,8),nmiss:miss.length,rng}},man);
    console.log(slug+': offline fetched',res.n,'files',(res.b/1e6).toFixed(1),'MB; range:',res.rng);
    ok(res.nmiss===0,slug+' every sampled pack file served offline'+(res.nmiss?' missing: '+res.miss.join(', '):''));
    ok(/^206 bytes 0-99\//.test(res.rng),slug+' Range request answered 206 from cache');
    const hasAnim=man.files.some(f=>/media\/anim\//.test(f.p)),hasMusic=man.files.some(f=>/music\/.*\.mp3$/.test(f.p));
    if(slug==='mainhattan-nightrun'){ok(hasAnim&&hasMusic,'nightrun manifest lists anim sheets and music');
      const tr=await g.evaluate(async()=>{const t=await (await fetch('music/tracks.json')).json();const out=[];for(const k of t.tracks){const r=await fetch('music/'+k.file);out.push(r.ok&&(await r.blob()).size>10000)}return out});
      ok(tr.length>=8&&tr.every(Boolean),'all '+tr.length+' tracks.json music files load offline (not capped at 24 files / evicted)')}
    ok(bad.length===0,slug+' no failed or error network requests while launching offline'+(bad.length?': '+bad.slice(0,6).join(' ; '):''));
    if(ext.length)console.log(slug+': note: '+ext.length+' other-origin request(s) failed offline (fonts fall back): '+[...new Set(ext.map(x=>new URL(x.slice(7)).host))].join(','));
    ok(errs.length===0,slug+' no page errors'+(errs.length?': '+errs.slice(0,3).join(' ; '):''));
    // remove deletes everything
    await ctx.setOffline(false);await page.bringToFront();
    await page.locator('li.g[data-id="'+ID[slug]+'"] .sw').click();await page.waitForTimeout(2500);
    const left=await page.evaluate(async(s)=>{const c=await caches.open('gns-games-v2');return (await c.keys()).filter(r=>r.url.includes('/'+s+'/')).length},slug);
    ok(left===0,slug+' Remove deleted all its files (left '+left+')');
    await ctx.close();
  }}finally{await browser.close();srv.kill()}
  console.log(fails?fails+' FAILED':'ALL PASS');process.exit(fails?1:0);
})().catch(e=>{console.error(e);process.exit(2)});
