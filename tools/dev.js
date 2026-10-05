// dev.js — persistent phone browser (852x393 touch) with an HTTP control port, so a patch can be tried without re-booting.
// node tools/dev.js <url> [city] [port]   then: curl -s localhost:9333/eval --data 'js expr' ; /shot?n=name ; /hold?k=gas|L|R|B|N|D&on=1 ; /tick?n=60 ; /tap?s=#sel
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const http=require('http');const fs=require('fs');
const URL=process.argv[2],city=process.argv[3]||'fra',PORT=+(process.argv[4]||9333);fs.mkdirSync('v85shots',{recursive:true});
const INIT=`(()=>{const q=[];let t=performance.now();window.__auto=true;window.requestAnimationFrame=cb=>{q.push(cb);return q.length};window.cancelAnimationFrame=()=>{};
 window.__tick=n=>{for(let i=0;i<n;i++){t+=1000/60;const c=q.splice(0);for(const f of c){try{f(t)}catch(e){setTimeout(()=>{throw e})}}}return t};
 setInterval(()=>{if(window.__auto)window.__tick(1)},16)})();`;
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const ctx=await b.newContext({viewport:{width:+(process.env.VW||852),height:+(process.env.VH||393)},deviceScaleFactor:+(process.env.DSF||1),isMobile:true,hasTouch:true});const p=await ctx.newPage();p.setDefaultTimeout(600000);
const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,200)));p.on('console',m=>{if(m.type()==='error')errs.push('console: '+m.text().slice(0,200))});
await p.addInitScript(INIT);const cdp=await ctx.newCDPSession(p);
const tick=n=>p.evaluate(n=>__tick(n),n);
const F={};const pts=()=>Object.values(F).map(f=>({x:f.x,y:f.y,id:f.id,radiusX:6,radiusY:6,force:1}));
const SEL={gas:'#tG',L:'#tL',R:'#tR',B:'#tB',N:'#tN',D:'#tD'};
const center=sel=>p.evaluate(s=>{const e=document.querySelector(s);if(!e)return null;const r=e.getBoundingClientRect();const cs=getComputedStyle(e);if(r.width<4||cs.display==='none'||cs.visibility==='hidden')return null;for(let a=e;a;a=a.parentElement)if(a.hidden)return null;return[r.left+r.width/2,r.top+r.height/2]},sel);
const down=async(n,xy)=>{if(!xy)return;if(F[n])await up(n);let id=0;while(Object.values(F).some(o=>o.id===id))id++;F[n]={x:xy[0],y:xy[1],id};await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:pts()})};
const up=async n=>{if(!F[n])return;delete F[n];const P=pts();await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});if(P.length)await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:P})};
const tap=async s=>{const xy=await center(s);if(!xy)return false;await down('tap',xy);await tick(4);await up('tap');await tick(4);return true};
const boot=async()=>{await p.goto(URL);await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:500});
await p.evaluate(([c])=>{localStorage.clear();localStorage.setItem('mho_slot','1');if(c==='ath'){localStorage.setItem('mho_city@1',c);localStorage.setItem('mho_athd@1','A');localStorage.setItem('mho_roam.ath@1','{"otg":{}}');localStorage.setItem('mho_story.ath@1','{"seen":1}')}},[city]);
await p.reload();await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:500});
await tap('#hcStory');await tick(10);await tap('#slotList .go');
for(let i=0;i<120;i++){try{if(await p.evaluate(()=>window.__mho&&__mho.state==='roam'))break;await p.waitForTimeout(2000)}catch(e){await p.waitForTimeout(2000)}}
await p.evaluate(()=>{window.__auto=false});
const CONT=['#storyGo','#m1Cs','#rcGo','#ogRetryB','#resBtn','#tutSkip'];
for(let i=0;i<30;i++){await tick(30);let t=false;for(const s of CONT)if(await tap(s)){t=true;break}if(!t)break}await tick(30);console.log('BOOTED')};
http.createServer(async(req,res)=>{const u=new globalThis.URL(req.url,'http://x');let body='';for await(const c of req)body+=c;let out='ok';
try{const q=u.searchParams;
 if(u.pathname==='/eval')out=JSON.stringify(await p.evaluate(body)); 
 else if(u.pathname==='/shot'){await p.screenshot({path:`v85shots/${q.get('n')}.png`});out='v85shots/'+q.get('n')+'.png'}
 else if(u.pathname==='/hold'){const k=q.get('k');if(q.get('on')==='0')await up(k);else await down(k,await center(SEL[k]))}
 else if(u.pathname==='/tick')await tick(+q.get('n')||60);
 else if(u.pathname==='/tap')out=String(await tap(q.get('s')));
 else if(u.pathname==='/vp'){await p.setViewportSize({width:+q.get('w'),height:+q.get('h')});await tick(5)}
 else if(u.pathname==='/errs')out=JSON.stringify(errs);
 else if(u.pathname==='/boot'){await boot()}
}catch(e){out='ERR '+e.message.slice(0,300)}res.end(out)}).listen(PORT);
await boot();})();
