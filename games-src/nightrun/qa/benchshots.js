// BENCHSHOTS: the street (ON FOOT) benchmark screenshots in games-src/nightrun/benchmark/street (see its README.md): phone and PC,
// old and new camera (?cam2=0/1), after 7 s of holding RIGHT. Usage: node qa/benchshots.js <games-src/nightrun> <out dir>
const { boot, open, sleep } = require(process.argv[2]+'/qa/lib.js');
const OUT=process.argv[3];
(async()=>{const b=await boot();try{for(const [W,H,dev] of [[390,763,'phone'],[1440,860,'pc']])for(const cam of ['0','1']){
 const q=await open(b.br,b.base,W,H,'?nomusic=1&cam2='+cam,0,W<500,()=>{localStorage.setItem('mnr_tut','2');});await sleep(600);
 await q.evaluate(()=>{const f=[...document.querySelectorAll('button')].find(x=>/ON FOOT/.test(x.textContent)&&x.offsetParent);f&&f.click();});
 for(let i=0;i<10;i++){await sleep(400);await q.evaluate(()=>{const c=document.getElementById('taleCard');if(c&&!c.hidden)(document.getElementById('taleTc')||c).click();});}
 await sleep(2500);await q.keyboard.down('d');await sleep(7000);
 await q.screenshot({path:`${OUT}/street-running-${dev}-camera-${cam==='1'?'NEW':'old'}.png`});await q.keyboard.up('d');
 console.log(dev,cam,await q.evaluate(()=>{const S=FOOT.S;return 'Kai at '+Math.round(S.P.x-S.camX)+' units from the left edge';}));await q.context().close();}}finally{await b.close();}})();
