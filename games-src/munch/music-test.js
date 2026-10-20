// Music picker check (Playwright): opens the Music panel mid-game, picks a different Dungeon track, asserts the playing track changed,
// the choice survives a reload, chips are >= 44 px, Esc closes. Usage: PW=$(npm root -g)/playwright node music-test.js <siteDir> [outdir]
// <siteDir> holds index.html (the built game) and music/ ; it is served over http because the tracks are fetched by URL.
const {chromium}=require(process.env.PW);const http=require('http'),fs=require('fs'),path=require('path');
const dir=path.resolve(process.argv[2]),out=process.argv[3]||'playtest';
const srv=http.createServer((q,r)=>{const f=path.join(dir,decodeURIComponent(q.url.split('?')[0]).replace(/^\/$/,'/index.html'));fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end()}else{r.writeHead(200,{'content-type':f.endsWith('.mp3')?'audio/mpeg':f.endsWith('.html')?'text/html':'application/octet-stream'});r.end(d)}})});
(async()=>{await new Promise(r=>srv.listen(0,r));const url=`http://localhost:${srv.address().port}/`;
const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});let fails=0;
const ok=(c,m)=>{if(!c){fails++;console.log('FAIL',m)}else console.log('ok  ',m)};
for(const [name,W,H] of [['390x763',390,763],['1280x800',1280,800]]){
  const ctx=await b.newContext({viewport:{width:W,height:H},hasTouch:W<700});const p=await ctx.newPage();const errs=[],reqs=[];
  p.on('pageerror',e=>errs.push(e.message));p.on('request',q=>/music\//.test(q.url())&&reqs.push(q.url().split('/').pop()));
  await p.goto(url);await p.evaluate(()=>{try{localStorage.clear();localStorage.setItem('dkd_offer','1')}catch(e){}});await p.reload();await p.waitForTimeout(400);
  const playing=()=>p.evaluate(()=>GA.playing());
  await p.click('#modal [data-start="F"]');await p.waitForTimeout(2500);
  ok(await playing()==='main-b','['+name+'] game starts on default Dungeon track main-b (got '+await playing()+')');
  await p.click('.dk-menub');await p.waitForTimeout(400);await p.click('#dkMenu [data-a="music"]');await p.waitForTimeout(500);
  ok(await p.isVisible('#dkMusic.on')||await p.isVisible('#dkMusic'),'['+name+'] music panel open');
  const hs=await p.evaluate(()=>[...document.querySelectorAll('#dkMusic .mchip')].map(e=>e.getBoundingClientRect().height));
  ok(hs.length>=20&&Math.min(...hs)>=44,'['+name+'] '+hs.length+' chips, min height '+Math.min(...hs).toFixed(1));
  await p.screenshot({path:`${out}/music-panel-${name}.png`});
  await p.click('#dkMusic [data-a="mpick"][data-s="main"][data-c="a"]');await p.waitForTimeout(2500);
  ok(await playing()==='main-a','['+name+'] Dungeon switched to main-a (got '+await playing()+')');ok(reqs.includes('main-a.mp3'),'['+name+'] main-a.mp3 fetched');
  await p.screenshot({path:`${out}/music-panel-${name}-after.png`});
  // preview a non-active slot, then it returns
  await p.click('#dkMusic [data-a="mprev"][data-s="fight"]');await p.waitForTimeout(2500);ok(/^fight-/.test(await playing()),'['+name+'] preview plays fight ('+await playing()+')');
  await p.click('#dkMusic [data-a="mprevx"]');await p.waitForTimeout(2500);ok(await playing()==='main-a','['+name+'] back to main-a after preview ('+await playing()+')');
  // off
  await p.click('#dkMusic [data-a="mpick"][data-s="main"][data-c="off"]');await p.waitForTimeout(2000);ok(await playing()===null,'['+name+'] Off silences the slot');
  await p.click('#dkMusic [data-a="mpick"][data-s="main"][data-c="a"]');await p.waitForTimeout(1500);
  await p.keyboard.press('Escape');await p.waitForTimeout(500);ok(!await p.isVisible('#dkMusic'),'['+name+'] Esc closes the panel');
  await p.reload();await p.waitForTimeout(400);
  ok(await p.evaluate(()=>JSON.parse(localStorage.getItem('dkd_mpick')).main)==='a','['+name+'] choice saved');
  await p.click('#modal [data-start="F"]');await p.waitForTimeout(2500);ok(await playing()==='main-a','['+name+'] choice survives reload ('+await playing()+')');
  ok(!errs.length,'['+name+'] no page errors '+errs.join('|'));await ctx.close()}
await b.close();srv.close();console.log(fails?'FAILED '+fails:'ALL OK');process.exit(fails?1:0)})();
