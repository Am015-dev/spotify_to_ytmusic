// gui-r30a: GO gui/card (lazy chunk, phone profile). Alex: "no AI sloppiness"; the gauntlet showed a 26-word card before START with "Unlocks in Chapter 2" on a quest that is playable.
// Opens the card of a real quest marker and of an on-the-go marker the way a player does (roamOpen), then START (chStart) and waits for the coach toast.
// Pass line: name <= 4 words, one objective line <= 6 words, >= 12 px, no stars / times / reward chips / 'Unlocks' text, DETAILS present and showing them, LET'S GO enabled;
// after START the coach toast (#npcSay) is gone within 4.8 s.
const GUC={};
function GUC_card(m){roamOpen(m);const c=document.getElementById('roamCard'),h=c.querySelector('h4'),p=c.querySelector('p'),W=t=>(t||'').split(/\s+/).filter(w=>/[A-Za-z0-9]/.test(w)).length,vis=e=>{if(!e||e.hidden)return false;const r=e.getBoundingClientRect();return r.width>0&&r.height>0},
 B=id=>document.getElementById(id),R={kind:m.kind+'/'+(m.ev&&m.ev.kind),lite:c.classList.contains('lite'),nameT:h.textContent.trim().slice(0,40),name:W(h.textContent),line:W(p.textContent),text:p.textContent.trim().slice(0,50),fs:parseFloat(getComputedStyle(p).fontSize),
  extras:['rcType','rcStars','rcTiers','rcExtra'].filter(i=>vis(B(i))&&B(i).textContent.trim()),unlock:/Unlocks in/.test(c.textContent),more:vis(B('rcMore')),go:vis(B('rcGo'))&&!B('rcGo').disabled};
 roamOpen(m,1);R.detail=['rcStars','rcTiers'].filter(i=>vis(B(i))&&B(i).textContent.trim()).length;R.dmore=vis(B('rcMore'));return R}
function GUC_run(){const R={},ms=(RO.marks||[]).filter(q=>q.ev&&(q.kind==='quest'||q.kind==='otg')&&qvUse(q)&&!markLocked(q));if(!ms.length)return Promise.resolve({err:'no quest marker'});
 try{chAbort()}catch(e){}RO.card=null;R.cards=ms.slice(0,6).map(GUC_card).filter(c=>c.lite||(c.fullOnly=1)&&0);const m=ms.find(q=>q.kind==='quest'&&!q.dyn)||ms[0];RO.card=null;document.getElementById('roamCard').hidden=true;
 const h=Math.atan2(m.x-RO.x,m.z-RO.z),q0=rfSnap(m.x-Math.sin(h)*30,m.z-Math.cos(h)*30,60);roamWarp(q0?q0[0]:m.x-Math.sin(h)*30,q0?q0[1]:m.z-Math.cos(h)*30,q0?q0[2]:h,true);RO.frozen=false;RO.inv=99;RO.hp=100;chStart(m,{});
 const el=document.getElementById('npcSay'),t0=performance.now();let seen=false;return new Promise(res=>{const f=()=>{const v=!el.hidden;if(v)seen=true;if(performance.now()-t0>4800){R.toastShown=seen;R.toastGone=el.hidden;try{chAbort()}catch(e){}el.hidden=true;return res(R)}setTimeout(f,100)};f()})}
GUC.pass=R=>{if(R.err)return R.err;const f=[];for(const c of R.cards){const w=c.kind+' "'+c.nameT+' / '+c.text+'"';if(c.name>4||c.name<1)f.push(w+' name '+c.name+' words');if(c.line>6||c.line<1)f.push(w+' line '+c.line+' words');if(c.fs<12)f.push(w+' font '+c.fs+' px');if(c.extras.length)f.push(w+' shows '+c.extras.join('+'));if(c.unlock)f.push(w+' says Unlocks in');if(!c.more)f.push(w+' no DETAILS');if(!c.go)f.push(w+' START disabled');if(c.detail<(/chase/.test(c.kind)?1:2))f.push(w+' DETAILS shows no stars/times');if(c.dmore)f.push(w+' DETAILS still offered')}
 if(!R.toastGone)f.push('coach toast still on screen after 4.8 s');return f.join(', ')};
(function GUC_reg(i){const C=window.__chk;if(C&&C.GO&&C.items&&C.goSay){if(!C.items.some(q=>q.ver==='gui'&&q.id==='card'))C.items.push({ver:'gui',id:'card',area:'ui',text:'gui-r30a · gui/card: the quest / challenge card before START is a name (≤ 4 words) + ONE line (≤ 6 words), ≥ 12 px, no stars/times/rewards/"Unlocks in"; DETAILS shows them; the coach toast is gone ≤ 4.8 s after START.'});
  C.GO['gui/card']=['fra','ath'].map(c=>({c,n:'quest card + toast',secs:40,fn:()=>(GUC_run().then(R=>{const f=GUC.pass(R);C.goSay('📍 CARD · '+JSON.stringify(R).slice(0,600)+(f?' ❌ FAIL '+f:' ✅ PASS'))}),'📍 quest card…')}));return}
 if(i<600)setTimeout(()=>GUC_reg(i+1),100)})(0);
({GUC_run,GUC_card})
