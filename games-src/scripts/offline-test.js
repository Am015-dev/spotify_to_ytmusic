#!/usr/bin/env node
// Offline pack test, every shelf game: download through the shelf UI (sync.html), go offline, open the game, start it, play,
// and assert 0 failed requests, 0 error responses (incl. the service worker's offline page / 504) and no page errors.
//   node games-src/scripts/offline-test.js [slug ...]          default: every game in build-all.py GAMES + nightrun + overdrive
//   BASE=https://am015-dev.github.io/spotify_to_ytmusic/ node ...   run against the live site (no local server)
//   PLAY_MS=60000 (play time per game, default 20000)  PAR=3 (games at once)  REPORT=out.json (per-game result as json)
const {chromium}=require(process.env.PW_PATH||'playwright');
const {spawn}=require('child_process');const path=require('path');const fs=require('fs');
const ROOT=path.resolve(__dirname,'../../games'),PORT=+(process.env.PORT||8765);
const LIVE=!!process.env.BASE,BASE=process.env.BASE||'http://localhost:'+PORT+'/';
const PLAY=+(process.env.PLAY_MS||20000),PAR=+(process.env.PAR||3);
const all=()=>{const t=fs.readFileSync(path.join(__dirname,'build-all.py'),'utf8');const b=t.slice(t.indexOf('GAMES = {'),t.indexOf('}',t.indexOf('GAMES = {')));
  return [...new Set([...b.matchAll(/^\s*"([a-z0-9-]+)":/gm)].map(m=>m[1]).concat(['mainhattan-nightrun','mainhattan-overdrive']))]};
const SLUGS=process.argv.slice(2).length?process.argv.slice(2):all();
let fails=0;const results={};const ok=(slug,c,m)=>{console.log((c?'PASS ':'FAIL ')+slug+': '+m);if(!c){fails++;(results[slug].fails=results[slug].fails||[]).push(m)}};

async function play(g,ms){ // click through start screens, menus, tutorial; then tap/keys on the canvas
  const end=Date.now()+ms;let i=0;
  const re=/^(play|start|new game|new run|begin|launch|continue|next|ok|got it|skip|solo|vs\.? ?computer|easy|go|deal|roll|tap to|story|map|tutorial|how to play|menu|resume|take off|fly|drive|race|ready)/i;
  while(Date.now()<end){
    i++;
    try{
      const btns=await g.locator('button:visible,[role=button]:visible,a.btn:visible,.btn:visible').all();
      for(const b of btns.slice(0,40)){const t=((await b.innerText({timeout:300}).catch(()=>''))||'').trim();
        if(re.test(t)||(i<3&&t&&t.length<24&&Math.random()<.25)){await b.click({timeout:800,trial:false}).catch(()=>{});await g.waitForTimeout(250)}}
      const cv=g.locator('canvas:visible').first();
      if(await cv.count()){const bb=await cv.boundingBox();if(bb){for(let k=0;k<4;k++)await g.mouse.click(bb.x+bb.width*(.2+.2*k),bb.y+bb.height*(.3+.1*k)).catch(()=>{})}}
      for(const k of ['Space','ArrowRight','ArrowUp','Enter','KeyZ'])await g.keyboard.press(k).catch(()=>{});
    }catch(e){}
    await g.waitForTimeout(1200);
  }
}

async function one(browser,slug){
  const R=results[slug]={slug};
  const ctx=await browser.newContext({viewport:{width:390,height:800},serviceWorkers:'allow',hasTouch:true});
  const page=await ctx.newPage();page.on('dialog',d=>d.accept());
  try{
    await page.goto(BASE+'sync.html');
    await page.evaluate(()=>navigator.serviceWorker.ready);
    await page.waitForFunction(()=>!!navigator.serviceWorker.controller,null,{timeout:20000}).catch(async()=>{await page.reload()});
    const id=await page.evaluate(async s=>{const t=await (await fetch('sync.html')).text();const m=t.match(/const GAMES=(\[.*?\]);/);const g=m&&JSON.parse(m[1]).find(g=>g.src.split('/')[0]===s);return g&&g.id},slug);
    ok(slug,!!id,'listed in sync.html (can be downloaded at all)');
    if(!id){R.listed=false;return}
    const man=await page.evaluate(async s=>(await fetch(s+'/offline.json',{cache:'no-store'})).json(),slug);
    R.listed=true;R.files=man.files.length;R.mb=+(man.total/1e6).toFixed(1);
    const li=page.locator('li.g[data-id="'+id+'"]');await li.locator('.st').first().waitFor();
    const t0=Date.now();await li.locator('.sw').click();
    let sawProgress=false;const poll=setInterval(async()=>{try{if(/Downloading ·/.test(await li.locator('.st').first().textContent()))sawProgress=true}catch(e){}},500);
    await page.waitForFunction(i=>{const e=document.querySelector('li.g[data-id="'+i+'"] .st');return e&&(/Ready offline/.test(e.textContent)||/not stored|failed|Not enough|Retry|retry/.test(e.textContent))},id,{timeout:900000,polling:500});
    clearInterval(poll);
    const txt=await li.locator('.st').first().textContent();R.sync=txt;R.dlSecs=+((Date.now()-t0)/1000).toFixed(1);
    ok(slug,/Ready offline/.test(txt),'sync.html says Ready offline ('+txt+')');
    const cached=await page.evaluate(async s=>{const c=await caches.open('gns-games-v2');return (await c.keys()).filter(r=>r.url.includes('/'+s+'/')).map(r=>new URL(r.url).pathname.split('/'+s+'/')[1])},slug);
    const miss=man.files.filter(f=>!cached.includes(f.p)).map(f=>f.p);R.cached=cached.length;R.notCached=miss.slice(0,20);
    ok(slug,miss.length===0,'all '+man.files.length+' manifest files cached'+(miss.length?' (missing '+miss.length+': '+miss.slice(0,4).join(', ')+')':''));
    await page.reload();await li.locator('.st').first().waitFor();await page.waitForTimeout(2500);
    ok(slug,/Ready offline/.test(await page.locator('li.g[data-id="'+id+'"] .st').first().textContent()),'still Ready offline after reload');
    // ---- offline play
    await ctx.setOffline(true);
    const g=await ctx.newPage();const bad=[],errs=[],ext=[];
    const own=u=>u.startsWith(BASE);
    g.on('requestfailed',r=>{if(own(r.url())&&!/\/sw\.js(\?|$)/.test(r.url())&&!/ERR_ABORTED/.test((r.failure()||{}).errorText||''))bad.push('FAILED '+r.url().replace(BASE,'')+' '+(r.failure()||{}).errorText);else ext.push(r.url())});
    g.on('response',r=>{if(r.status()>=400&&own(r.url()))bad.push(r.status()+' '+r.url().replace(BASE,''))});
    g.on('pageerror',e=>errs.push(e.message));
    await g.goto(BASE+slug+'/index.html',{waitUntil:'load'});
    await g.waitForTimeout(3000);
    ok(slug,!/This game is not on this device/.test((await g.content()).slice(0,4000)),'offline page is the game, not the offline notice');
    await play(g,PLAY);
    // every manifest media/data file must come out of the cache (assets by fetch, audio with a Range request like <audio>)
    const res=await g.evaluate(async(a)=>{const miss=[];let n=0;
      const set=a.files.map(f=>f.p).filter(p=>/\.(webp|png|jpg|jpeg|svg|mp3|ogg|wav|m4a|json|glb|mp4|js|css|woff2?|ttf)$/.test(p));let i=0;
      await Promise.all(Array.from({length:6},async()=>{while(i<set.length){const p=set[i++];try{const r=await fetch(p);if(!r.ok){miss.push(p+' '+r.status);continue}await r.blob();n++}catch(e){miss.push(p+' '+e.message)}}}));
      const au=a.files.map(f=>f.p).find(p=>/\.(mp3|ogg|wav|m4a)$/.test(p));let rng='none';
      if(au){const r=await fetch(au,{headers:{range:'bytes=0-99'}});rng=r.status+' '+r.headers.get('content-range')}
      return {n,miss:miss.slice(0,8),nmiss:miss.length,rng}},man);
    R.fetched=res.n;R.rng=res.rng;
    ok(slug,res.nmiss===0,'every pack file served offline ('+res.n+' fetched)'+(res.nmiss?' missing: '+res.miss.join(', '):''));
    ok(slug,res.rng==='none'||/^206 bytes 0-99\//.test(res.rng),'audio Range request answered 206 ('+res.rng+')');
    // a request that also fails ONLINE is a probe for a file the game never shipped (not an offline problem): reported, not failed
    await ctx.setOffline(false);const uniq=[...new Set(bad)],probes=[];
    for(const b of uniq){const u=BASE+b.replace(/^(FAILED |\d+ )/,'').replace(/ net::.*$/,'');const st=await page.evaluate(async u=>{try{return (await fetch(u,{cache:'no-store'})).status}catch(e){return 0}},u);if(st>=400||st===0)probes.push(b)}
    const bad2=uniq.filter(b=>!probes.includes(b));R.probes404=probes.length;R.probeSample=probes.slice(0,6);
    if(probes.length)console.log('NOTE '+slug+': '+probes.length+' request(s) fail online too (files the game asks for but does not ship): '+probes.slice(0,3).join(' ; '));
    await ctx.setOffline(true);
    R.badRequests=bad2.slice(0,30);
    ok(slug,bad2.length===0,'0 failed/error requests while playing offline'+(bad2.length?' ('+bad2.length+'): '+bad2.slice(0,5).join(' ; '):''));
    ok(slug,errs.length===0,'no page errors'+(errs.length?': '+errs.slice(0,2).join(' ; '):''));
    const cdnBad=ext.filter(u=>/^https:\/\/(cdn\.jsdelivr\.net|unpkg\.com|cdnjs\.cloudflare\.com|code\.jquery\.com)\//.test(u));R.cdnFailed=cdnBad.slice(0,5);
    ok(slug,cdnBad.length===0,'scripts the game loads from a CDN come from the cache offline'+(cdnBad.length?' ('+cdnBad.length+' failed: '+cdnBad.slice(0,2).join(' ; ')+')':''));
    R.pageErrors=errs.slice(0,5);R.otherOrigin=[...new Set(ext.map(u=>new URL(u).host))];
    await ctx.setOffline(false);await page.bringToFront();
    await page.locator('li.g[data-id="'+id+'"] .sw').click();await page.waitForTimeout(2500);
    const left=await page.evaluate(async s=>{const c=await caches.open('gns-games-v2');return (await c.keys()).filter(r=>r.url.includes('/'+s+'/')).length},slug);
    ok(slug,left===0,'Remove deleted all its files (left '+left+')');
  }catch(e){ok(slug,false,'test error: '+String(e.message).split('\n')[0]);R.error=String(e.message).split('\n')[0]}
  finally{await ctx.close()}
}
// small static server (python's http.server dropped connections when 4 browsers downloaded 150 MB at once)
function staticServer(){const http=require('http');const T={html:'text/html; charset=utf-8',js:'text/javascript',json:'application/json',webp:'image/webp',png:'image/png',jpg:'image/jpeg',mp3:'audio/mpeg',css:'text/css',glb:'model/gltf-binary',svg:'image/svg+xml',webmanifest:'application/manifest+json'};
  const s=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p.endsWith('/'))p+='index.html';const f=path.join(ROOT,p);
    if(!f.startsWith(ROOT)){r.writeHead(403);return r.end()}
    fs.stat(f,(e,st)=>{if(e||!st.isFile()){r.writeHead(404);return r.end()}
      r.writeHead(200,{'content-type':T[f.split('.').pop()]||'application/octet-stream','content-length':st.size,'cache-control':'no-cache'});fs.createReadStream(f).pipe(r)})});
  s.listen(PORT,'127.0.0.1');return {kill:()=>s.close()}}
// failure UX: one file refuses to download -> must NOT say Ready offline, shows Retry; after the server recovers Retry completes it
async function retryTest(browser,slug){
  const ctx=await browser.newContext({viewport:{width:390,height:800},serviceWorkers:'block'});const page=await ctx.newPage();   // no worker: page.route then sees the downloads
  try{await page.goto(BASE+'sync.html');
    const id=await page.evaluate(async s=>{const t=await (await fetch('sync.html')).text();const m=t.match(/const GAMES=(\[.*?\]);/);return JSON.parse(m[1]).find(g=>g.src.split('/')[0]===s).id},slug);
    const man=await page.evaluate(async s=>(await fetch(s+'/offline.json',{cache:'no-store'})).json(),slug);
    const victim=man.files.map(f=>f.p).find(p=>/\.(webp|png|mp3)$/.test(p));let broken=true,hits=0;
    await page.route('**/'+slug+'/'+victim,r=>{hits++;if(broken&&hits<=2)return r.fulfill({status:500,body:'x'});if(broken&&hits<=99)return r.abort();return r.continue()});
    const st=page.locator('li.g[data-id="'+id+'"] .st').first();await st.waitFor();
    await page.locator('li.g[data-id="'+id+'"] .sw').click();
    await page.waitForFunction(i=>{const e=document.querySelector('li.g[data-id="'+i+'"] .st');return e&&/Ready offline|not stored|failed|Not enough/.test(e.textContent)},id,{timeout:300000,polling:500});
    const txt=await st.textContent();R2(slug,!/Ready offline/.test(txt)&&/not stored/.test(txt),'a file that fails is reported, not "Ready offline" ('+txt+')');
    R2(slug,await page.locator('li.g[data-id="'+id+'"] .rt').count()===1,'a Retry button is shown');
    broken=false;await page.locator('li.g[data-id="'+id+'"] .rt').click();
    await page.waitForFunction(i=>/Ready offline/.test((document.querySelector('li.g[data-id="'+i+'"] .st')||{}).textContent||''),id,{timeout:120000,polling:500});
    R2(slug,true,'Retry completes the download once the file is reachable')}
  catch(e){R2(slug,false,'retry test error: '+String(e.message).split('\n')[0])}finally{await ctx.close()}
}
const R2=(slug,c,m)=>{results[slug]=results[slug]||{slug};ok(slug,c,m)};
(async()=>{
  const srv=LIVE?null:staticServer();
  await new Promise(r=>setTimeout(r,800));
  if(!LIVE){results._manifest={};const r=require('child_process').spawnSync('python3',[path.join(__dirname,'offline-manifest.py'),'--check'],{encoding:'utf-8'});   // a stale offline.json = files the game loads are not downloaded
    ok('_manifest',r.status===0,'every offline.json matches the files on disk ('+r.stdout.trim()+')'+(r.status?'; fix: python3 games-src/scripts/offline-manifest.py':''))}
  const browser=await chromium.launch(process.env.CHROME?{executablePath:process.env.CHROME}:{});
  try{if(!process.argv.slice(2).length||process.env.RETRY_TEST)await retryTest(browser,process.env.RETRY_TEST||'sunglaze');const q=SLUGS.slice();await Promise.all(Array.from({length:PAR},async()=>{while(q.length)await one(browser,q.shift())}))}
  finally{await browser.close();if(srv)srv.kill()}
  if(process.env.REPORT)fs.writeFileSync(process.env.REPORT,JSON.stringify(results,null,1));
  console.log(fails?fails+' FAILED':'ALL PASS');process.exit(fails?1:0);
})().catch(e=>{console.error(e);process.exit(2)});
