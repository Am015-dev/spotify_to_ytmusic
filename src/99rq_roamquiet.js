// ===== roamcard-quiet-r22e23 (Alex hates popups). Stopping next to a garage / mission / flight marker no longer opens its big card: the same small
// "TAP TO OPEN" chip as TAP TO START (row 1, 7 s, 25 s cool per marker) shows instead, and the card opens only on a tap (or Enter). Cards the player opens
// himself (map pin, prompt tap, talk, fast travel) are untouched. GO why/no-popup gets a stopped-next-to-a-marker part.
const RQ={a:null,no:new Map()};
function RQ_el(){return OG_el('rqAsk')}
function RQ_hide(cool){const a=RQ.a;RQ.a=null;RQ_el().hidden=true;if(a&&cool)RQ.no.set(a.m,performance.now()+25000)}
function RQ_offer(m){if(RQ.a||RO.card||OG.ask||(RQ.no.get(m)||0)>performance.now())return;const el=RQ_el();
 el.innerHTML=`${m.kind==='garage'?'🔧':m.kind==='flight'?'✈':'📍'} ${markTitle(m).toUpperCase()} · TAP TO OPEN`;
 el.onclick=e=>{e.stopPropagation();RQ_go()};el.ontouchstart=ev=>{ev.preventDefault();ev.stopPropagation();RQ_go()};el.hidden=false;RQ.a={m,t:7};try{OG_snd('pick')}catch(e){}}
function RQ_go(){const a=RQ.a;if(!a)return false;RQ_hide(true);if(state!=='roam'||RO.card||RO.ch||(RO.sp&&!RO.sp.done))return false;roamOpen(a.m);RO.cardPin=1;return true}
function RQ_step(dt){const a=RQ.a;if(!a)return;a.t-=dt;if(a.t<=0||RO.card||RO.ch||RO.sp||RO.mapOpen||state!=='roam'||Math.hypot(a.m.x-RO.x,a.m.z-RO.z)>40)RQ_hide(true)}
roamMarks=(f=>function(dt){const r=f.apply(this,arguments);RQ_step(dt);return r})(roamMarks);
roamPrompt=(f=>function(dt){f.apply(this,arguments);if(RQ.a){const el=$('#roamPrompt');if(el)el.hidden=true}})(roamPrompt);   // one chip, not two (Enter still works through RO.pm)
addEventListener('keydown',e=>{if(RQ.a&&e.code==='Enter'&&!RO.card&&state==='roam'){e.preventDefault();e.stopImmediatePropagation();RQ_go()}},true);
{const st=document.createElement('style');st.textContent=`#rqAsk{position:fixed;left:50%;top:calc(40px + env(safe-area-inset-top,0px));transform:translateX(-50%);z-index:41;box-sizing:border-box;min-height:44px;display:flex;align-items:center;padding:0 16px;border-radius:14px;background:#ffd12c;border:3px solid #141413;box-shadow:0 3px 0 #141413;color:#141413;font:italic 900 14px system-ui,sans-serif;white-space:nowrap;cursor:pointer;pointer-events:auto}#rqAsk[hidden]{display:none}
body:has(#rqAsk:not([hidden])) #r3Up.mini,body:has(#rqAsk:not([hidden])) #ogRes.tst{top:calc(98px + env(safe-area-inset-top,0px))}
body:has(#rqAsk:not([hidden])):has(#r3Up.mini:not([hidden])) #ogRes.tst{top:calc(152px + env(safe-area-inset-top,0px))}
@media (orientation:portrait){#rqAsk{left:140px;right:calc(12px + env(safe-area-inset-right,0px));width:auto;transform:none;top:calc(8px + env(safe-area-inset-top,0px));white-space:normal;padding:4px 12px}
 body:has(#rqAsk:not([hidden])) #r3Up.mini,body:has(#rqAsk:not([hidden])) #ogRes.tst{top:calc(66px + env(safe-area-inset-top,0px))}
 body:has(#rqAsk:not([hidden])):has(#r3Up.mini:not([hidden])) #ogRes.tst{top:calc(130px + env(safe-area-inset-top,0px))}}`;document.head.appendChild(st)}
async function RQ_go_test(){const R=[],ck=(m,b)=>R.push((b?'✓ ':'✗ ')+m),vis=e=>!!e&&!e.hidden&&e.getClientRects().length>0&&getComputedStyle(e).display!=='none';
 if(state!=='roam'||!RO.on)return'';
 const sv={x:RO.x,z:RO.z,h:RO.h,v:RO.v,ch:RO.ch,card:RO.card,sp:RO.sp,cool:RO.cool};
 try{for(const kind of['garage','mission']){const m=(RO.marks||[]).find(q=>(kind==='garage'?q.kind==='garage':q.kind!=='garage'&&q.kind!=='flight'&&q.ev)&&!markLocked(q)&&!markDone(q));if(!m){ck(kind+': no marker in this city (skipped)',true);continue}
  RO.ch=null;RO.sp=null;RO.card=null;$('#roamCard').hidden=true;RQ_hide(false);RQ.no.clear();RO.x=m.x;RO.z=m.z+6;RO.y=m.g.position.y;RO.v=0;RO.cool=0;K.ArrowUp=K.KeyW=false;camSnap=true;
  let cardAt=-1,chipAt=-1;for(let i=0;i<150;i++){roamStep(1/30);RO.v=0;if(cardAt<0&&(RO.card||vis($('#roamCard'))))cardAt=i;if(chipAt<0&&vis(RQ_el()))chipAt=i}
  ck(kind+' marker, stopped 5 s: no card (seen at '+cardAt+'), chip "'+RQ_el().textContent.trim().slice(0,32)+'" shown at '+chipAt,cardAt<0&&chipAt>=0&&vis(RQ_el())||cardAt<0&&chipAt>=0);
  const tap=RQ_go();ck(kind+': tap on the chip opens the card ('+tap+', card '+!!RO.card+', chip hidden '+!vis(RQ_el())+')',tap&&!!RO.card&&vis($('#roamCard'))&&!vis(RQ_el()));
  RO.card=null;$('#roamCard').hidden=true}}
 catch(e){R.push('✗ rq threw '+e)}
 finally{RO.x=sv.x;RO.z=sv.z;RO.h=RO.vh=sv.h;RO.v=0;RO.ch=sv.ch;RO.card=sv.card;RO.sp=sv.sp;RO.cool=sv.cool;RO.y=groundAt(RO.x,RO.z,99);camSnap=true;RQ_hide(false);RQ.no.clear();if(!sv.card)$('#roamCard').hidden=true}
 return R.join(' · ')}
{const reg=setInterval(()=>{if(!window.__chk||!__chk.GO||!__chk.GO['why/no-popup'])return;clearInterval(reg);
 __chk.GO['why/no-popup']=__chk.GO['why/no-popup'].map(g=>({...g,secs:(g.secs||90)+20,fn:async()=>{const a=await g.fn(),b=await RQ_go_test();return b?a.replace(/ → (✅ PASS|❌ FAIL)$/,'')+' · '+b+' → '+(/✗/.test(a+b)||/FAIL/.test(a)?'❌ FAIL':'✅ PASS'):a}}))},700)}
