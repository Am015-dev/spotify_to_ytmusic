// Extras check (Playwright): per-screen music, the Music picker, mute, saved choice, unlocked back/table, end art, plus screenshots.
// Usage: node music-test.js <siteDir> [outdir]   <siteDir> holds index.html (the built game), music/ and media/ (served over http).
const PW=require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');const http=require('http'),fs=require('fs'),path=require('path');
const dir=path.resolve(process.argv[2]),out=path.resolve(process.argv[3]||'../playtest');fs.mkdirSync(out,{recursive:true});
const MT={'.html':'text/html','.webp':'image/webp','.mp3':'audio/mpeg'};
const srv=http.createServer((q,r)=>{const f=path.join(dir,decodeURIComponent(q.url.split('?')[0]).replace(/^\/$/,'/index.html'));fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end()}else{r.writeHead(200,{'content-type':MT[path.extname(f)]||'application/octet-stream'});r.end(d)}})});
(async()=>{await new Promise(r=>srv.listen(0,r));const url=`http://localhost:${srv.address().port}/`;
const b=await PW.chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--autoplay-policy=no-user-gesture-required']});let fails=0;
const ok=(c,m)=>{if(!c){fails++;console.log('FAIL',m)}else console.log('ok  ',m)};
const ALL=JSON.stringify({v:1,ch:{c1:{beaten:true,stars:2},c2:{beaten:true,stars:2},c3:{beaten:true,stars:2},c4:{beaten:true,stars:2},c5:{beaten:true,stars:2},c6:{beaten:true,stars:2},c7:{beaten:true,stars:2},c8:{beaten:true,stars:2},c9:{beaten:true,stars:2},c10:{beaten:true,stars:2}},unlocked:[],last:null});
for(const [name,W,H] of [['390x763',390,763],['1280x800',1280,800]]){
  const ctx=await b.newContext({viewport:{width:W,height:H},hasTouch:W<700,isMobile:W<700});const p=await ctx.newPage();const errs=[];
  p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/net::|Failed to load|404/.test(m.text()))errs.push(m.text())});
  await p.goto(url);await p.evaluate(a=>{try{localStorage.clear();localStorage.setItem('gns-campaign-kaiten',a)}catch(e){}},ALL);await p.reload();await p.waitForTimeout(700);
  const playing=()=>p.evaluate(()=>GA.playing());
  await p.mouse.click(5,5);await p.waitForTimeout(2500);
  ok(await playing()==='tavern-a','['+name+'] title plays tavern-a (got '+await playing()+')');
  await p.screenshot({path:`${out}/title-${name}.png`});
  await p.evaluate(()=>document.querySelector('#start [data-a="musicopen"]').click());await p.waitForTimeout(500);
  ok(await p.isVisible('#musicd.on'),'['+name+'] music panel opens from the title');
  const hs=await p.evaluate(()=>[...document.querySelectorAll('#musicd .mchip')].map(e=>e.getBoundingClientRect().height));
  ok(hs.length>=25&&Math.min(...hs)>=44,'['+name+'] '+hs.length+' chips, min height '+Math.min(...hs).toFixed(1));
  await p.screenshot({path:`${out}/music-panel-${name}.png`});
  await p.click('#musicd [data-a="mpick"][data-s="tavern"][data-c="b"]');await p.waitForTimeout(2500);ok(await playing()==='tavern-b','['+name+'] Menu switched to tavern-b ('+await playing()+')');
  await p.click('#musicd [data-a="mprev"][data-s="victory"]');await p.waitForTimeout(2500);ok(await playing()==='victory-a','['+name+'] preview plays victory-a ('+await playing()+')');
  await p.click('#musicd [data-a="mprevx"]');await p.waitForTimeout(2500);ok(await playing()==='tavern-b','['+name+'] back to tavern-b after preview ('+await playing()+')');
  await p.click('#musicd [data-a="mpick"][data-s="tavern"][data-c="off"]');await p.waitForTimeout(2000);ok(await playing()===null,'['+name+'] Off silences the slot');
  await p.click('#musicd [data-a="mpick"][data-s="tavern"][data-c="a"]');await p.waitForTimeout(1500);
  await p.evaluate(()=>{const s=document.querySelector('#mvol');s.value='.2';s.dispatchEvent(new Event('input'))});ok(await p.evaluate(()=>Math.abs(GA.state().musVol-.2)<.01),'['+name+'] volume slider sets the music volume');
  await p.keyboard.press('Escape');await p.waitForTimeout(500);ok(!await p.isVisible('#musicd.on'),'['+name+'] Esc closes the panel');
  await p.evaluate(()=>{UI.seed=7;ANIM=0;AIDELAY=650;newGame('vs')});await p.waitForTimeout(3000);ok(await playing()==='main-a','['+name+'] game plays main-a ('+await playing()+')');
  ok(await p.evaluate(()=>!!(KIT.ART.back&&KIT.ART.back.indexOf('data:')===0)),'['+name+'] unlocked card back loaded');
  ok(await p.evaluate(()=>document.documentElement.dataset.timg==='1'),'['+name+'] unlocked table skin loaded');
  await p.evaluate(()=>{ANIM=1});await p.waitForTimeout(1200);await p.screenshot({path:`${out}/board-${name}.png`});
  await p.evaluate(()=>{UI.prefs.music=false;GA.setMusic(false);sndMusic()});await p.waitForTimeout(800);ok(await playing()===null,'['+name+'] mute silences the music');
  await p.evaluate(()=>{UI.prefs.music=true;GA.setMusic(true);sndMusic()});await p.waitForTimeout(2500);ok(await playing()==='main-a','['+name+'] unmute brings main-a back ('+await playing()+')');
  await p.evaluate(()=>{G.round=G.len||D.rounds;sndMusic()});await p.waitForTimeout(2500);ok(await playing()==='fight-a','['+name+'] the last round plays fight-a ('+await playing()+')');
  await p.evaluate(()=>{const e=document.querySelector('[data-gx="setd"]');e&&e.click()});await p.waitForTimeout(500);
  ok(await p.evaluate(()=>!!document.querySelector('#setd [data-a="musicopen"]')),'['+name+'] menu has the Pick the songs button');
  await p.keyboard.press('Escape');await p.waitForTimeout(300);
  // play out a whole meal fast, then check the end art, the result music and the screenshot
  for(const want of ['win','lose']){
    await p.evaluate(()=>{UI.seed=7;AIDELAY=0;ANIM=0;newGame('vs')});await p.waitForTimeout(800);
    for(let k=0;k<1500;k++){const o=await p.evaluate(()=>({over:G.phase==='over'&&UI.overShown,pk:canPick(),rs:!$('#rs').hidden}));if(o.over)break;if(o.rs){await p.evaluate(()=>{const n=document.querySelector('#rs [data-a=rsnext]');if(n)n.click()})}else if(o.pk)await p.evaluate((w)=>{ if(G.phase==='pick'){UI.sel=[w==='lose'?G.players[0].hand.length-1:0];serveSel()} },want);await p.waitForTimeout(40);}
    await p.waitForTimeout(1500);
    if(want==='win')await p.evaluate(()=>{G.winners=[0];closeRS();showFinal();sndMusic()});else await p.evaluate(()=>{G.winners=[1];closeRS();showFinal();sndMusic()});await p.waitForTimeout(2200);
    const info=await p.evaluate(()=>({won:kkWon(),art:!!document.querySelector('#rs .endart'),pl:GA.playing()}));
    ok(info.art,'['+name+'] end art shown ('+want+', won='+info.won+')');
    ok(info.pl===(info.won?'victory-a':'defeat-a'),'['+name+'] result music '+info.pl);
    await p.screenshot({path:`${out}/end-${info.won?'win':'lose'}-${name}.png`});
  }
  await p.evaluate(()=>{ANIM=1;showStart();GXC.open()});await p.waitForTimeout(900);await p.screenshot({path:`${out}/story-${name}.png`});
  await p.reload();await p.waitForTimeout(500);ok(await p.evaluate(()=>JSON.parse(localStorage.getItem('kk_mpick')).tavern)==='a','['+name+'] choice saved');
  ok(!errs.length,'['+name+'] no page errors '+errs.join('|'));await ctx.close()}
await b.close();srv.close();console.log(fails?'FAILED '+fails:'ALL OK');process.exit(fails?1:0)})();
