// rv3C (docs/REVIEW_2K_3.md #4 #5 #7): GOs rv2k3/racepop, rv2k3/finish, rv2k3/pos. Own module: 99c_checklist.js is at its 200 KB cap. State asserts only (no real-time play).
function RV3C_vis(e){const r=e&&e.getBoundingClientRect();return r&&r.width>0&&r.height>0&&e.getClientRects().length>0&&getComputedStyle(e).visibility!=='hidden'&&+getComputedStyle(e).opacity>.05?r:null}
function RV3C_start(){if(RO.sp)try{sprintEnd()}catch(e){}const m=tkMarkOf(RIVAL_EV.find(e=>e.p===TK_C.p));tkStart(m,TK_C);const sp=RO.sp;sp.cd=0;return{sp,bot:tkBot(tkGeoOf(TK_C).pA,{lag:.15})}}
function RV3C_stop(sp){try{$('#spRes').hidden=true}catch(e){}RO.fin=false;if(RO.sp===sp)try{sprintEnd()}catch(e){}K.ArrowUp=K.KeyW=K.ArrowLeft=K.ArrowRight=K.ArrowDown=false}
function RV3C_go(kind,say){const ok=b=>b?' ✅':' ❌',P=innerHeight>innerWidth?'portrait':'landscape';
 if(kind==='racepop'){const p0=prof(),xp0=p0.xp,{sp,bot}=RV3C_start();R3U.q.length=0;try{$('#r3Up').hidden=true}catch(e){}
  for(let i=0;i<150;i++){bot(sp);roamStep(1/30)}
  addXP(6000,'rv3C test');const mk=(RO.marks||[]).find(m=>m&&m.x!=null&&/quest|story|side/.test(m.kind||''));if(mk)try{roamOpen(mk)}catch(e){}
  for(let i=0;i<60;i++){bot(sp);roamStep(1/30)}try{R3_upPump()}catch(e){}
  const W=innerWidth,H=innerHeight,C={left:W*.2,right:W*.8,top:H*.2,bottom:H*.8},ids=['r3Up','roamCard','roamPlate','roamPop','npcSay','roamPrompt','journal','roamMap','story','m1Next','odNew','hitPop','juPop'],hit=[];let px=0;
  for(const id of ids){const r=RV3C_vis(document.getElementById(id));if(!r)continue;const o=Math.max(0,Math.min(r.right,C.right)-Math.max(r.left,C.left))*Math.max(0,Math.min(r.bottom,C.bottom)-Math.max(r.top,C.top));if(o>0){px+=o;hit.push(id)}}
  const q=R3U.q.length,v=Math.round(RO.v*3.6),racing=!!RO.sp&&!RO.sp.done;
  RV3C_stop(sp);for(let i=0;i<30;i++)roamStep(1/30);try{R3_upPump()}catch(e){}const shown=!!RV3C_vis($('#r3Up'));
  try{$('#r3Up').hidden=true}catch(e){}R3U.q.length=0;const p=prof();p.xp=xp0;store.set('mho_prof',p);
  return say('📍 POP-UPS IN A RACE ('+P+', Westend Split, '+v+' km/h, race active '+racing+') · level-up forced (+6000 XP) and a quest card requested · cards/toasts over the centre 60 % of the screen: '+Math.round(px)+' px² '+hit.join(' ')+' (0) · level-up queued during the race: '+q+' (≥ 1) · shown after the race: '+(shown?'yes':'no')+ok(racing&&!px&&q>=1&&shown))}
 if(kind==='finish'){const{sp,bot}=RV3C_start();let i=0;for(;i<9000&&RO.sp===sp&&!sp.done;i++){bot(sp);roamStep(1/30)}
  const r=TK.last,v0=Math.round(RO.v*3.6),panel=!$('#spRes').hidden;K.KeyW=K.ArrowUp=true;let vm=0;for(let j=0;j<60;j++){roamStep(1/30);if(j===59)vm=Math.round(Math.abs(RO.v)*3.6)}
  RV3C_stop(sp);return say('📍 FINISH · human-like bot, Westend Split: '+(r?(r.dnf?'DNF':ord(r.place)+' in '+r.t+' s'):'no result')+' · result panel shown '+(panel?'yes':'no')+' · speed at the line '+v0+' km/h → 2 s later, gas still held: '+vm+' km/h (≤ 10)'+ok(r&&panel&&vm<=10))}
 if(kind==='pos'){const{sp,bot}=RV3C_start(),el=document.getElementById('raceW'),C=['tL','tR','tG','tB','tN'].map(i=>RV3C_vis(document.getElementById(i))).filter(Boolean),seen=[];let bad=[],ovl=0;
  for(let i=0;i<600;i++){bot(sp);roamStep(1/30);if(i%120!==119)continue;const pe=el.querySelector('.pos'),ge=el.querySelector('.gap'),pr=RV3C_vis(pe),gr=RV3C_vis(ge),pt=pr?pe.textContent.replace(/\s/g,''):'',gt=gr?ge.querySelector('b').textContent:'';
   seen.push(pt+' '+gt+' '+(gr?ge.querySelector('small').textContent:''));if(!/^\d(ST|ND|RD|TH)\/\d$/.test(pt))bad.push('place');if(!/^[+-]\d+(\.\d)? (s|m)$/.test(gt))bad.push('gap');
   for(const e of[...(pr?pe.querySelectorAll('*'):[]),...(gr?ge.querySelectorAll('*'):[]),pe,ge])if(RV3C_vis(e)&&e.children.length===0&&parseFloat(getComputedStyle(e).fontSize)<12&&e.className!=='')bad.push('font<12 '+e.tagName);
   for(const r of[pr,gr])if(r)for(const c of C)ovl+=RV14_ovl(r,c)}
  RV3C_stop(sp);return say('📍 RACE HUD PLACE + GAP ('+P+', Westend Split) · samples every 4 s: '+seen.join(' | ')+' · missing/bad: '+(bad.length?bad.slice(0,4).join(','):'none')+' · over the touch controls: '+Math.round(ovl)+' px² (0) · place and gap ≥ 12 px'+ok(seen.length>=4&&!bad.length&&!ovl))}
 return say('📍 unknown rv3C kind '+kind+' ❌')}
