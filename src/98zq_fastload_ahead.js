// ---- FST read-ahead (fastload-r24g; core in src/10zf_fastload.js + the page head). A lazy chunk (src/LAZY): evaluated after drivable. Once roam is idle (+4 s, never during the reveal)
// the equipped garage car + the next 3 owned cars (their chunks, found with LD_load stubbed so nothing is loaded) and the menu/city music go into the store, one file per requestIdleCallback.
function FST_plan(){
 const urls=[];try{
  const L=G9C_list('car').A.filter(e=>e.own).map(e=>e.S),cur=GAR_set(G9C_eq('car')),i=L.findIndex(S=>S.id===cur.id);let nx=0;
  const add=S=>{const c=FST_carChunks(S).filter(id=>LDL.X.c[id]&&!LDL.got.has(id));for(const id of c)urls.push(LDL.X.c[id].f);return c.length};
  add(cur);for(let k=i+1;k<L.length&&nx<3;k++)if(add(L[k]))nx++}catch(e){FST_err(e)}   // the equipped car + the next 3 garage cars that have a chunk (procedural cars have none)
 const sv=navigator.connection&&navigator.connection.saveData;
 if(!sv)for(const n of['menu','city_'+CID])urls.push('music/'+n+'.mp3');
 return[...new Set(urls)]}
function FST_aheadRun(){
 if(FST.ahead||!FST_use())return FST.ahead;
 const urls=FST_plan(),ric=window.requestIdleCallback||(f=>setTimeout(f,200)),done=[];
 FST.ahead={urls,done,t0:performance.now(),fin:false};
 return new Promise(res=>{let i=0;const step=()=>{if(i>=urls.length){FST.ahead.fin=true;FST_warmMus(['menu','city_'+CID]).then(()=>res(FST.ahead));return}
  const u=urls[i++];FST_prefetch(u).then(ok=>{done.push([u,ok]);ric(step,{timeout:4000})})};ric(step,{timeout:4000})})}
// kick: when the world is drivable and idle (same test as the lazy chunks in 10z_lazy.js) + 4 s, never during the reveal
function FST_aheadArm(){
 if(!FST_use()||typeof TQ!=='undefined'&&TQ&&!/[?&]fcahead=1/.test(location.search))return;
 const iv=setInterval(()=>{try{if(state!=='roam'||LD.on||LD.busy||!XC.done)return}catch(e){return}clearInterval(iv);setTimeout(()=>{FST_aheadRun()},4000)},500)}
Object.assign(window.__fc,{plan:FST_plan,ahead:FST_aheadRun});FST_aheadArm();
