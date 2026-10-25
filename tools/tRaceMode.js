// racemode-r25a: race-menu triage on the BUILT page, phone profile (iPhone UA, 852x393 touch). One page per city; every race of the race menu
// (window.__rm, src/99crm_racemode_go.js): start through the menu buttons, drive with the human-like bot to mid-race, 852x393 shot, drive to the end.
//   node tools/tRaceMode.js <built page url> <outdir> [fra|ath] [only=substring]   -> <outdir>/<city>.json + <city>_<i>.jpg; prints one line per race
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
const [,,BASE,OUT='/tmp/rm',CITY='fra',ONLY='']=process.argv,ONL=ONLY?ONLY.split('|'):[];fs.mkdirSync(OUT,{recursive:true});
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const ctx=await b.newContext({viewport:{width:852,height:393},deviceScaleFactor:1,isMobile:true,hasTouch:true,userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'});
 const p=await ctx.newPage();p.setDefaultTimeout(600000);const errs=[];p.on('pageerror',e=>errs.push(String(e).slice(0,160)));
 await p.goto(BASE+(BASE.includes('?')?'&':'?')+'test='+CITY+'&draw=0');await p.waitForFunction(()=>window.__tq&&__tq.ready&&window.__rm,null,{polling:250,timeout:400000});
 const L=await p.evaluate(()=>__rm.list()),rows=[];
 for(let i=0;i<L.length;i++){if(ONL.length&&!ONL.some(q=>L[i]===q))continue;const e0=errs.length;let R;
  try{await p.evaluate(()=>{const b=document.querySelector('#r3Up [data-r3u=ok]');if(b&&b.offsetParent)b.click()});   // a level-up card queued between races: tap CONTINUE like a player
   await p.evaluate(i=>__rm.open(i),i);await p.waitForTimeout(1500);   // city courses start after enterRoam() resolves
   await p.evaluate(()=>__rm.what());
   const d1=await p.evaluate(()=>__rm.drive(25));await p.evaluate(()=>__tq.draw()).catch(()=>{});await p.screenshot({path:`${OUT}/${CITY}_${i}.jpg`,type:'jpeg',quality:70});
   if(!d1.end)await p.evaluate(()=>__rm.drive(275));R=await p.evaluate(()=>__rm.close())}
  catch(e){R={n:L[i],threw:String(e).slice(0,160)}}
  R.pageErr=errs.slice(e0);rows.push(R);
  console.log(`${R.ok?'OK  ':'BAD '}${R.n} | picked ${R.picked?'y':'n ('+R.got+')'} | fin ${R.fin?'y':'n'} ${R.place||''} ${R.t||''}s prog ${R.prog} | stuck ${R.stuck} ${JSON.stringify(R.stuckAt||'')} | walls ${R.walls} | riv ${R.rivN} fly ${R.fly} sink ${R.sink} | cam ${R.camOk} ${R.camSay} | err ${R.pageErr.length}${R.threw?' | threw '+R.threw:''}`)}
 fs.writeFileSync(`${OUT}/${CITY}.json`,JSON.stringify(rows,null,1));await b.close()})();
