// ===== ui-noise (Alex: "a lot of pop ups, very distracting"; docs/REVIEW_UI_NOISE.md rules 1,2,5): popup governor at the say()/npcSay() choke point.
// Roam only: at most 1 non-essential popup per 60 s, none above 40 km/h (queued, shown after 1.5 s under 40 km/h, dropped after 20 s), same text at most once per 180 s.
// Essential (race, rescue, crash, wrong way, results, story radio) always pass and do not use the budget. ?dbg=1 or ?uig=0 turns the governor off.
const UIG={T:0,last:-1e9,slow:0,q:null,seen:{},shown:0,dropped:0,off:/[?&](dbg=1|uig=0)\b/.test(location.search),RATE:60,KMH:40,HOLD:1.5,TTL:20,
 ess:/RESCUE|ROAD BUSY|WRONG|CRASH|WRECK|FINISH|RESULT|WINNER|RACE|LAP|PLACE|COUNTDOWN|FAIL|COMPLETE|LEVEL UP|^\s*(GO!?|READY|SET|[0-9])\s*$/i,
 kmh:()=>Math.abs(RO.v||0)*3.6,
 gov:()=>!UIG.off&&state==='roam'&&!(window.M1&&M1.fs),
 ok:k=>UIG.T-UIG.last>=UIG.RATE&&!(UIG.seen[k]>UIG.T-180),
 take:k=>{UIG.last=UIG.T;UIG.seen[k]=UIG.T;UIG.shown++},
 // returns true when the call may run now; otherwise queues the latest call (replaces an older one)
 gate(txt,run){if(!UIG.gov()||UIG.ess.test(txt))return true;const k=txt.replace(/<[^>]*>/g,'').slice(0,40);
  if(UIG.kmh()<=UIG.KMH&&UIG.ok(k)){UIG.take(k);return true}
  if(UIG.seen[k]>UIG.T-180){UIG.dropped++;return false}
  if(UIG.q)UIG.dropped++;UIG.q={k,run,t:UIG.T};return false},
 step(dt){UIG.T+=dt;UIG.slow=UIG.kmh()<=UIG.KMH?UIG.slow+dt:0;const q=UIG.q;if(!q)return;
  if(UIG.T-q.t>UIG.TTL||!UIG.gov()){UIG.q=null;UIG.dropped++;return}
  if(UIG.slow>=UIG.HOLD&&UIG.ok(q.k)){UIG.q=null;UIG.take(q.k);q.run()}}};
say=(f=>function(a,b,t){return UIG.gate(String(a||'')+' '+String(b||''),()=>f.call(this,a,b,t))?f.apply(this,arguments):void 0})(say);
npcSay=(f=>function(q,txt){return UIG.gate(String(txt||''),()=>f.call(this,q,txt))?f.apply(this,arguments):void 0})(npcSay);
{let t0=performance.now();setInterval(()=>{const n=performance.now();UIG.step(Math.min(1,(n-t0)/1000));t0=n},250)}
UIG.go=goSay=>{const U=UIG;
  const o={T:U.T,last:U.last,q:U.q,seen:U.seen,shown:U.shown,dropped:U.dropped,off:U.off},v0=RO.v,s0=state,out=[];let ok=true;const chk=(n,b)=>{out.push(n+' '+(b?'✅':'❌'));if(!b)ok=false};
  try{U.off=false;U.seen={};U.q=null;U.last=-1e9;U.T=1000;state='roam';RO.v=100/3.6;const sh0=U.shown;
   for(let i=0;i<20;i++){U.T+=.5;say('HINT '+i,'x');npcSay({id:'q',npc:'Hilde'},'coach '+i)}
   chk('0 shown at 100 km/h',U.shown===sh0&&!!U.q);
   say('RESCUE','road busy');chk('essential shows at once',U.shown===sh0);
   RO.v=0;let n=0;for(let i=0;i<12;i++)U.step(.25);chk('queued shows after 1.5 s stopped',U.shown===sh0+1);
   for(let i=0;i<40;i++){U.T+=.5;say('NEXT '+i,'');}chk('second within 60 s blocked',U.shown===sh0+1);
   U.T+=61;U.q=null;say('LATER','');chk('after 60 s allowed',U.shown===sh0+2);
   U.T+=61;say('LATER','');chk('same text within 180 s dropped',U.shown===sh0+2);
   const n2=U.shown;RO.v=100/3.6;U.q=null;U.T+=61;npcSay({id:'q',npc:'Hilde'},'fast again');chk('npcSay gated at speed',U.shown===n2)}
  finally{Object.assign(U,o);RO.v=v0;state=s0}
  const r='📍 ui1/governor '+(ok?'✅ PASS':'❌ FAIL')+' · '+out.join(' · ');goSay(r);return r};
window.__uig=UIG;
// the checklist is a lazy chunk: register the item and its GO as soon as it exists
{const reg=setInterval(()=>{if(!window.__chk||!__chk.GO)return;clearInterval(reg);
 __chk.items.unshift({ver:'ui1',id:'governor',area:'world',text:'Fewer popups (📍 GO): none above 40 km/h, at most 1 per 60 s, race/rescue text at once; the tutorial card is hidden when fast and moves on after 6 s.'});
 __chk.GO['ui1/governor']=['fra','ath'].map(c=>({c,n:c==='fra'?'Frankfurt':'Athens',fn:()=>UIG.go(__chk.goSay)}))},500)}
