// hr-boot-mstart: GO hr/mstart (lazy chunk, phone profile). docs/HITRUN_GAP.md gap 4 (Alex: "very sloppy", Hit & Run shows 3 words at a mission start).
// Starts a REAL quest (chStart on a world marker, the way a player does), at 60 km/h with gas held. Measures through the old 3.2 s countdown (stepped roamStep, 1/60):
// the lowest speed vs the start speed, and the objective card the player sees: its words, computed font size, size vs the screen and overlap with the touch controls.
// Pass line: objective <= 6 words, font >= 12 px, card < 30 % of the screen, no overlap with a touch button, speed never below 90 % of the start speed.
const HRM={};
function HRM_card(){const el=document.getElementById('npcSay'),p=el&&el.querySelector('p');if(!el||el.hidden||!p)return null;const r=el.getBoundingClientRect(),W=innerWidth,H=innerHeight,words=p.textContent.trim().split(/\s+/).filter(Boolean).length,
 fs=parseFloat(getComputedStyle(p).fontSize),over=[...document.querySelectorAll('#touch button,#touch .tbtn,#touch [id^=t]')].filter(b=>{const q=b.getBoundingClientRect();return q.width>8&&q.height>8&&getComputedStyle(b).visibility!=='hidden'&&q.left<r.right&&q.right>r.left&&q.top<r.bottom&&q.bottom>r.top}).length;
 return{text:p.textContent.trim().slice(0,60),words,fs,area:+(r.width*r.height/(W*H)).toFixed(3),over,more:!!el.dataset.more}}
function HRM_run(){const R={},T=o=>{TOUCH.on=true;TOUCH.used=true;TOUCH.dir=0;TOUCH.gas=true;TOUCH.brake=false;TOUCH.hb=false};
 const m=(RO.marks||[]).find(q=>!q.dyn&&q.ev&&qvUse(q));if(!m)return Promise.resolve({err:'no quest marker'});
 try{chAbort()}catch(e){}const h=Math.atan2(m.x-RO.x,m.z-RO.z),q0=rfSnap(m.x-Math.sin(h)*30,m.z-Math.cos(h)*30,60);roamWarp(q0?q0[0]:m.x-Math.sin(h)*30,q0?q0[1]:m.z-Math.cos(h)*30,q0?q0[2]:h,true);
 RO.frozen=false;RO.card=null;RO.inv=99;RO.hp=100;RO.v=60/3.6;RO.vh=RO.h;camSnap=true;T();roamStep(1/60);RO.v=60/3.6;RO.vh=RO.h;
 const v0=Math.abs(RO.v);chStart(m,{});R.kind=m.ev.kind;
 return new Promise(res=>setTimeout(()=>{R.card=HRM_card();let vmin=1e9,n=0;for(;n<300;n++){T();roamStep(1/60);vmin=Math.min(vmin,Math.abs(RO.v));if(RO.ch&&RO.ch.cd<=0&&n>240)break}
  R.keep=+(vmin/v0).toFixed(2);R.cd=RO.ch?+(RO.ch.cd||0).toFixed(2):null;try{chAbort()}catch(e){}TOUCH.gas=false;TOUCH.used=false;RO.v=0;const el=document.getElementById('npcSay');if(el)el.hidden=true;res(R)},700))}
HRM.pass=R=>{if(R.err)return R.err;const c=R.card,f=[];if(!c)f.push('no objective card');else{if(c.words>6)f.push(c.words+' words "'+c.text+'"');if(c.fs<12)f.push('font '+c.fs+' px');if(c.area>=.3)f.push('card '+Math.round(c.area*100)+' % of the screen');if(c.over)f.push('over '+c.over+' touch button(s)');if(!c.more)f.push('no tap-for-more')}
 if(R.keep<.9)f.push('speed kept '+Math.round(R.keep*100)+' % through the countdown');return f.join(', ')};
(function HRM_reg(i){const C=window.__chk;if(C&&C.GO&&C.items&&C.goSay){if(!C.items.some(q=>q.ver==='hr'&&q.id==='mstart'))C.items.push({ver:'hr',id:'mstart',area:'drive',text:'hr-boot-mstart · hr/mstart: a real quest start at 60 km/h with gas: objective card ≤ 6 words, ≥ 12 px, < 30 % of the screen, not over the touch buttons, long text one tap away; the car keeps ≥ 90 % of its speed through the old countdown.'});
  C.GO['hr/mstart']=['fra','ath'].map(c=>({c,n:'mission start',secs:40,fn:()=>(HRM_run().then(R=>{const f=HRM.pass(R);C.goSay('📍 MISSION START · '+JSON.stringify(R)+(f?' ❌ FAIL '+f:' ✅ PASS'))}),'📍 mission start…')}));return}
 if(i<600)setTimeout(()=>HRM_reg(i+1),100)})(0);
({HRM_run,HRM_card})
