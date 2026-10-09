// d24lib.js: shared boot + route geometry metrics for tRoute24.js / tSteer24.js (drive24).
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
// test-driven rAF clock at FPS frames per game second (default 60); rendering skipped except for screenshots
const INIT=fps=>`(()=>{const q=[];let t=0;window.__auto=true;window.__fps=${fps};window.requestAnimationFrame=cb=>{q.push(cb);return q.length};window.cancelAnimationFrame=()=>{};
 window.__tick=n=>{for(let i=0;i<n;i++){t+=1000/window.__fps;const c=q.splice(0);for(const f of c){try{f(t)}catch(e){setTimeout(()=>{throw e})}}if(window.__mon)try{window.__mon()}catch(e){window.__monErr=String(e)}}return t};
 setInterval(()=>{if(window.__dbg&&!window.__fastR&&!window.__shooting){window.__fastR=__dbg.composer.render;__dbg.composer.render=()=>{}}if(window.__auto)window.__tick(1)},16)})();`;
async function boot(b,{city='fra',fps=60,url,phone=true}={}){
 const ctx=await b.newContext(phone?{viewport:{width:852,height:393},deviceScaleFactor:2,isMobile:true,hasTouch:true}:{viewport:{width:852,height:393},deviceScaleFactor:2});const p=await ctx.newPage();p.setDefaultTimeout(900000);
 const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,200)));p.on('console',m=>{if(m.type()==='error')errs.push('console: '+m.text().slice(0,200))});
 await p.addInitScript(INIT(fps));await p.goto(url);await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:500});
 await p.evaluate(([c])=>{localStorage.clear();localStorage.setItem('mho_slot','1');if(c==='ath'){localStorage.setItem('mho_city@1',c);localStorage.setItem('mho_athd@1','A');localStorage.setItem('mho_roam.ath@1','{"otg":{}}');localStorage.setItem('mho_story.ath@1','{"seen":1}')}},[city]);
 await p.reload();await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:500});
 await p.click('#hcStory');await p.evaluate(()=>__tick(10));await p.click('#slotList .go');
 for(let i=0;i<150;i++){try{if(await p.evaluate(()=>window.__mho&&__mho.state==='roam'))break}catch(e){}await p.waitForTimeout(2000)}await p.evaluate(()=>{window.__auto=false});
 for(let i=0;i<40;i++){await p.evaluate(()=>{__tick(10);if(window.__m1&&__m1.cs&&__m1.cs())__m1.skip&&__m1.skip();for(const s of['#storyGo','#rcGo','.m1go','#tutSkip','#m1Cs']){const e=document.querySelector(s);if(e&&!e.hidden&&e.offsetWidth)e.click()}})}
 const shot=async file=>{await p.evaluate(()=>{window.__shooting=1;if(window.__fastR){__dbg.composer.render=window.__fastR;window.__fastR=null}__tick(1)});await p.screenshot({path:file,type:'jpeg',quality:70});await p.evaluate(()=>{window.__shooting=0})};
 return{ctx,p,errs,shot}}
// ---- route geometry metrics on a polyline [[x,z],…]: resample 5 m, net heading change over a ±15 m window; a turn = a local peak of
// |change| ≥ 30°, turn angle = total heading change across the bend; sharp = > 70°; U-turn = > 150°; zig-zag = two opposite turns < 80 m apart
function resample(P,ds=5){const out=[P[0]];let acc=0;for(let i=1;i<P.length;i++){let[a,b]=[P[i-1],P[i]];let L=Math.hypot(b[0]-a[0],b[1]-a[1]);let s=ds-acc;while(s<=L){out.push([a[0]+(b[0]-a[0])*s/L,a[1]+(b[1]-a[1])*s/L]);s+=ds}acc=L-(s-ds)}return out}
const ad=a=>Math.atan2(Math.sin(a),Math.cos(a));
function turns(P0){const P=resample(P0,5);if(P.length<8)return{len:0,turns:[]};const h=[];for(let i=1;i<P.length;i++)h.push(Math.atan2(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]));
 const W=3,d=h.map((_,i)=>i<W||i>=h.length-W?0:ad(h[i+W]-h[i-W]));const T=[];let i=0;
 while(i<d.length){if(Math.abs(d[i])<.52){i++;continue}let j=i,best=i;while(j<d.length&&Math.abs(d[j])>=.3&&Math.sign(d[j])===Math.sign(d[i])){if(Math.abs(d[j])>Math.abs(d[best]))best=j;j++}
  // total heading change across the bend: heading 20 m before the bend start vs 20 m after its end
  const a0=h[Math.max(0,i-4)],a1=h[Math.min(h.length-1,j+3)];const ang=+(ad(a1-a0)*180/Math.PI).toFixed(0),q=T[T.length-1];if(q&&best*5-q.s<=15){if(Math.abs(ang)>Math.abs(q.ang))q.ang=ang}else T.push({s:best*5,ang});i=j}  // a cusp (U-turn) shows as several flips: one turn
 return{len:(P.length-1)*5,turns:T}}
function routeStats(P){const{len,turns:T}=turns(P);const gaps=[];for(let k=1;k<T.length;k++)gaps.push(T[k].s-T[k-1].s);let zig=0;for(let k=1;k<T.length;k++)if(T[k].s-T[k-1].s<80&&Math.sign(T[k].ang)!==Math.sign(T[k-1].ang))zig++;
 return{len,n:T.length,perKm:len>0?T.length/(len/1000):0,minGap:gaps.length?Math.min(...gaps):null,close80:gaps.filter(g=>g<80).length,sharp:T.filter(t=>Math.abs(t.ang)>70).length,uturn:T.filter(t=>Math.abs(t.ang)>150).length,zig}}
function agg(list){const L=list.reduce((a,r)=>a+r.len,0),n=list.reduce((a,r)=>a+r.n,0),mg=list.map(r=>r.minGap).filter(v=>v!=null);
 return{routes:list.length,km:+(L/1000).toFixed(1),turnsPerKm:+(n/(L/1000)).toFixed(2),minGap:mg.length?Math.min(...mg):null,medMinGap:mg.length?mg.sort((a,b)=>a-b)[mg.length>>1]:null,close80:list.reduce((a,r)=>a+r.close80,0),sharpPerKm:+(list.reduce((a,r)=>a+r.sharp,0)/(L/1000)).toFixed(2),uturns:list.reduce((a,r)=>a+r.uturn,0),zigzags:list.reduce((a,r)=>a+r.zig,0)}}
module.exports={chromium,INIT,boot,turns,routeStats,agg,resample};
