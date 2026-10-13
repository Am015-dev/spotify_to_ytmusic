// perf-3: enter free roam the way tools/tPlay.js does (STORY -> slot .go -> wait state 'roam' -> tap cards away), hold GAS, sample window.__perf
// usage: node roam.js <port> fra|ath 0|1(LDS_ab(1)) [secs]
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const [port,city,off,secs]=process.argv.slice(2);const N=+(secs||20);
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--ignore-gpu-blocklist']});
const c=await b.newContext({viewport:{width:852,height:393},hasTouch:true,isMobile:true});const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e).slice(0,120)));
const U=`http://localhost:${port}/mainhattan-overdrive/index.html`;
await p.goto(U);await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:500,timeout:120000});
await p.evaluate(c=>{localStorage.clear();localStorage.setItem('mho_slot','1');if(c==='ath'){localStorage.setItem('mho_city@1',c);localStorage.setItem('mho_athd@1','A');localStorage.setItem('mho_roam.ath@1','{"otg":{}}');localStorage.setItem('mho_story.ath@1','{"seen":1}')}},city);
await p.reload();await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:500,timeout:120000});
const tap=async s=>{const l=p.locator(s).first();if(!(await l.isVisible().catch(()=>false)))return false;await l.tap({timeout:3000}).catch(()=>{});return true};
await tap('#hcStory');await p.waitForTimeout(300);await tap('#slotList .go');
await p.waitForFunction(()=>window.__mho&&__mho.state==='roam',null,{polling:1000,timeout:150000});
const CONT=['#storyGo','#m1Cs','#rcGo','#ogRetryB','#setDone','.m1go','#resBtn','#tutSkip','#rcNo'];
for(let i=0;i<20;i++){await p.waitForTimeout(500);let t=0;for(const s of CONT)if(await tap(s)){t=1;break}if(!t&&i>4)break}
const st=await p.evaluate(()=>({state:__mho.state,on:!!__mho.RO.on,cid:__mho.cid&&__mho.cid(),ld:!!(__mho.LD&&__mho.LD.on)}));
let ab=null;if(off==='1')ab=await p.evaluate(()=>{try{LDS_ab(1);return 'ab'}catch(e){return 'fail '+e}});
await p.keyboard.down('ArrowUp');await p.keyboard.down('KeyW');await p.waitForTimeout(10000);const R=[];
for(let s=0;s<N/2;s++){await p.waitForTimeout(2000);R.push(await p.evaluate(()=>Object.assign(window.__perf?window.__perf():{},{v:+(__mho.RO.v||0).toFixed(1),st:__mho.state})))}
const med=k=>{const v=R.map(x=>x[k]).filter(x=>x!=null).sort((a,b)=>a-b);return v[v.length>>1]};
console.log(JSON.stringify({port,city,off,ab,st,calls:med('calls'),tris:med('triangles'),geo:med('geo'),errs:errs.slice(0,2),last:R.slice(-2)}));await b.close()})().catch(e=>{console.log('ERR',port,city,off,String(e).slice(0,200));process.exit(1)});
