// Music check (Playwright): per-screen tracks, the picker (pick, preview, off, volume), saved choice, chips >= 44 px, Esc closes.
// Usage: node music-test.js <siteDir> [outdir]   <siteDir> holds index.html (the built game) and music/ (served over http: tracks are fetched by URL).
const PW=require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');const http=require('http'),fs=require('fs'),path=require('path');
const dir=path.resolve(process.argv[2]),out=process.argv[3]||'../playtest';
const srv=http.createServer((q,r)=>{const f=path.join(dir,decodeURIComponent(q.url.split('?')[0]).replace(/^\/$/,'/index.html'));fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end()}else{r.writeHead(200,{'content-type':f.endsWith('.mp3')?'audio/mpeg':f.endsWith('.html')?'text/html':f.endsWith('.webp')?'image/webp':'application/octet-stream'});r.end(d)}})});
(async()=>{await new Promise(r=>srv.listen(0,r));const url=`http://localhost:${srv.address().port}/`;
const b=await PW.chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});let fails=0;
const ok=(c,m)=>{if(!c){fails++;console.log('FAIL',m)}else console.log('ok  ',m)};
for(const [name,W,H] of [['390x763',390,763],['1280x800',1280,800]]){
  const ctx=await b.newContext({viewport:{width:W,height:H},hasTouch:W<700,isMobile:W<700});const p=await ctx.newPage();const errs=[];
  p.on('pageerror',e=>errs.push(e.message));
  await p.goto(url);await p.evaluate(()=>{try{localStorage.clear()}catch(e){}});await p.reload();await p.waitForTimeout(500);
  const playing=()=>p.evaluate(()=>GA.playing());
  await p.mouse.click(5,5);await p.waitForTimeout(2500);
  ok(await playing()==='tavern-a','['+name+'] title plays tavern-a (got '+await playing()+')');
  await p.evaluate(()=>document.querySelector('#start [data-a="musicopen"]').click());await p.waitForTimeout(500);
  ok(await p.isVisible('#musicd.on'),'['+name+'] music panel opens from the start screen');
  const hs=await p.evaluate(()=>[...document.querySelectorAll('#musicd .mchip')].map(e=>e.getBoundingClientRect().height));
  ok(hs.length>=25&&Math.min(...hs)>=44,'['+name+'] '+hs.length+' chips, min height '+Math.min(...hs).toFixed(1));
  await p.click('#musicd [data-a="mpick"][data-s="tavern"][data-c="b"]');await p.waitForTimeout(2500);ok(await playing()==='tavern-b','['+name+'] Menu switched to tavern-b ('+await playing()+')');
  await p.click('#musicd [data-a="mprev"][data-s="victory"]');await p.waitForTimeout(2500);ok(await playing()==='victory-a','['+name+'] preview plays victory-a ('+await playing()+')');
  await p.click('#musicd [data-a="mprevx"]');await p.waitForTimeout(2500);ok(await playing()==='tavern-b','['+name+'] back to tavern-b after preview ('+await playing()+')');
  await p.click('#musicd [data-a="mpick"][data-s="tavern"][data-c="off"]');await p.waitForTimeout(2000);ok(await playing()===null,'['+name+'] Off silences the slot');
  await p.click('#musicd [data-a="mpick"][data-s="tavern"][data-c="a"]');await p.waitForTimeout(1500);
  await p.evaluate(()=>{const s=document.querySelector('#mvol');s.value='.2';s.dispatchEvent(new Event('input'))});ok(await p.evaluate(()=>Math.abs(GA.state().musVol-.2)<.01),'['+name+'] volume slider sets the music volume');
  await p.keyboard.press('Escape');await p.waitForTimeout(500);ok(!await p.isVisible('#musicd.on'),'['+name+'] Esc closes the panel');
  await p.evaluate(()=>{ANIM=0;newGame('vs')});await p.waitForTimeout(3000);ok(await playing()==='main-a','['+name+'] game plays main-a ('+await playing()+')');
  await p.evaluate(()=>{UI.sound=false;GA.setMusic(false);sndMusic()});await p.waitForTimeout(800);ok(await playing()===null,'['+name+'] mute silences the music');
  await p.evaluate(()=>{UI.sound=true;GA.setMusic(true);sndMusic()});await p.waitForTimeout(2500);ok(await playing()==='main-a','['+name+'] unmute brings main-a back ('+await playing()+')');
  await p.evaluate(()=>{G.players[0].season=3;G.players[1].season=3;sndMusic()});await p.waitForTimeout(2500);ok(await playing()==='fight-a','['+name+'] the last season plays fight-a ('+await playing()+')');
  await p.evaluate(()=>{const e=document.querySelector('[data-gx="setd"]');e&&e.click()});await p.waitForTimeout(500);
  ok(await p.evaluate(()=>!!document.querySelector('#setd [data-a="musicopen"]')),'['+name+'] settings panel has the Pick the songs button');
  await p.screenshot({path:`${out}/music-settings-${name}.png`});
  await p.reload();await p.waitForTimeout(500);ok(await p.evaluate(()=>JSON.parse(localStorage.getItem('hb_mpick')).tavern)==='a','['+name+'] choice saved');
  ok(!errs.length,'['+name+'] no page errors '+errs.join('|'));await ctx.close()}
await b.close();srv.close();console.log(fails?'FAILED '+fails:'ALL OK');process.exit(fails?1:0)})();
