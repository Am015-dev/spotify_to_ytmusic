
// ===== RF (race fun, 2026-10-09): Alex "we have functionalities but the races are boring". Reference: LEGO 2K Drive rival race
// (docs/race_ref, docs/RACE_PLAN.md). Measured before (tRace, phone): the player started on POLE and led ~75 % of the race alone,
// then a +13 % catch-up rubber band passed him in the last 20 s (final 2nd/5th/6th). 2K: start 8th behind the pack, climb to 1st,
// short fights later, a fair finish.
//  - grid: the player starts LAST in a full field (not elimination/arena/tt/zone), the best AI on pole
//  - rubber band (RF_rub, called from 30_race stepSim): leaders wait for the player early on, the catch-up from behind fades out
//    over the last 25 % so nobody steals the win at the line
//  - ▲ 4TH / ▼ 5TH pop under the position counter on every place change
//  - countdown: the camera swings from the front of the player's car to behind it (2K-style car showcase), big 3·2·1
//  - finish: a slow orbit around the player's car; results get a top-3 podium strip (+ RIVAL BEATEN! in rival races)
const RF_GRID=()=>RC&&RC.type==='race'&&ships.length>=2&&pl;
function RF_rub(s,gap,ld){const P=clamp(pl.dist/Math.max(1,(RC.laps||1)*TD.L),0,1),fadeB=P<.75?1:clamp((1-P)/.25,0,1),holdA=P<.7?1:.5;
  let r=1;if(gap>0)r+=Math.min(.09,gap/240*.09)*(.2+.8*fadeB);else r-=Math.min(.2,Math.max(0,-gap-30)/200*.2)*holdA;
  return r+Math.min(.03,Math.max(0,ld-s.dist)/400*.03)}
// corner speed ∝ √grip: grip × rubber² makes the rubber band act in corners too (it only scaled top speed, so on twisty tracks a leader 400 m ahead never waited)
function RF_lat(s){const r=s.rubber||1;return R15_on()&&RC.type!=='arena'&&!s.isPlayer?r*r:1}
setupRace=(f=>function(cfg){const r=f.apply(this,arguments);try{if(RF_GRID()){
  const ai=ships.filter(s=>s!==pl).sort((a,b)=>b.skill-a.skill),grid=[...ai,pl];
  grid.forEach((s,i)=>{const row=Math.floor(i/2),col=i%2;s.dist=-14-row*16-(col?8:0);s.x=(col?8:-8)*CR_LS;s.v=0;s.place=i+1});
  ships.forEach(s=>posShip(s,1/60,true));updateCam(1,true);RFX.place=ships.length}RFX.cd0=cdT}catch(e){console.warn('RF grid',e)}return r})(setupRace);
const RFX={place:0,popT:0,el:null,orb:0};
function RF_popEl(){if(RFX.el)return RFX.el;const e=document.createElement('div');e.id='rfPop';
  e.style.cssText='position:fixed;z-index:6;pointer-events:none;font:900 italic 22px/1 system-ui,sans-serif;letter-spacing:.02em;padding:4px 10px;border-radius:8px;background:rgba(10,14,30,.72);opacity:0;transition:opacity .15s;text-shadow:0 2px 0 #000';
  document.body.appendChild(e);return RFX.el=e}
function RF_pop(){if(!pl||!RC||!['race','elim'].includes(RC.type))return;const e=RF_popEl();
  if(state==='race'&&raceT>1.5&&RFX.place&&pl.place!==RFX.place){const up=pl.place<RFX.place;e.textContent=(up?'▲ ':'▼ ')+ord(pl.place).toUpperCase();e.style.color=up?'#7dff6a':'#ff5a6a';
    const p=hudEl.pos&&hudEl.pos.getBoundingClientRect();if(p&&p.width){const g=document.getElementById('tuG'),gr=g&&g.getClientRects().length?g.getBoundingClientRect():null,top=p.bottom+4,r=gr&&gr.width&&gr.bottom>top&&gr.top<top+30?innerWidth-gr.left+8:innerWidth-p.right;/* RF5: left of the ⚙ button, not under it */if(p.left<innerWidth/2){e.style.top=Math.round(p.top+4)+'px';e.style.left=Math.round(p.right+10)+'px';e.style.right='auto'}/* RO6: ordinal is top-left: pop beside it */else{e.style.top=Math.round(top)+'px';e.style.right=Math.round(r)+'px';e.style.left='auto'}}e.style.opacity=1;RFX.popT=performance.now()+1300;if(up&&AU.sfx)AU.sfx('pick')}
  RFX.place=pl.place;if(RFX.popT&&performance.now()>RFX.popT){e.style.opacity=0;RFX.popT=0}if(state!=='race'&&state!=='finished')e.style.opacity=0}
// RO6: big LEGO-style place ordinal top-left under the timer (the reference's biggest HUD element), races only
{const st=document.createElement('style');st.textContent=`body:is([data-mode=race],[data-mode=elim]) #hPos{left:max(28px,env(safe-area-inset-left));right:auto;top:calc(104px + env(safe-area-inset-top,0px));text-align:left;justify-items:start}
body:is([data-mode=race],[data-mode=elim]) #hPos .lab{display:none}body:is([data-mode=race],[data-mode=elim]) #pos{font:italic 900 78px/.9 var(--hud);color:#ffd12c;-webkit-text-stroke:3px #1b1300;paint-order:stroke fill;text-shadow:0 4px 0 #1b1300;letter-spacing:-.02em}
body:is([data-mode=race],[data-mode=elim]) #pos small{font-size:.4em;color:#fff;-webkit-text-stroke:2px #1b1300;margin-left:4px}
body.touch:is([data-mode=race],[data-mode=elim]) #hPos{left:calc(92px + env(safe-area-inset-left,0px));top:calc(40px + env(safe-area-inset-top,0px))}body.touch:is([data-mode=race],[data-mode=elim]) #pos{font-size:46px}`;document.head.appendChild(st)}
updHud=(f=>function(){f.apply(this,arguments);try{RF_pop()}catch(e){}})(updHud);
// countdown showcase + finish orbit (only the camera; the chase camera keeps running underneath so the cut back is clean)
updateCam=(f=>function(dt,snap){f.apply(this,arguments);try{if(!pl||!RC||RC.type==='tt'||CC&&CC.s)return;
  const cd=state==='countdown'&&cdT>.55,fin=state==='finished'&&RC.type!=='zone'&&pl.finished&&!pl.eliminated;if(!cd&&!fin){RFX.orb=0;return}
  const F=RFX.F||(RFX.F=mkF());frameAt(TD,pl.dist,F);const c=pl.mesh.position.clone().add(pl.mesh.userData.m.position);let a,r,h;
  if(cd){const k=clamp(1-(cdT-.55)/Math.max(.5,(RFX.cd0||4.2)-.55),0,1),e=k*k*(3-2*k);a=lerp(.35,Math.PI-.15,e);r=lerp(7.5,10.5,e);h=lerp(1.6,3.2,e)}
  else{RFX.orb+=(dt||.016)*.55;a=Math.PI*.15+RFX.orb;r=9.5;h=2.6}
  const P=c.clone().addScaledVector(F.t,Math.cos(a)*r).addScaledVector(F.r,Math.sin(a)*r).addScaledVector(F.u,h);camera.position.copy(P);camera.up.copy(F.u);camera.lookAt(c.clone().addScaledVector(F.u,.9));
  camera.fov=58;camera.updateProjectionMatrix();speedLines.mesh.material.opacity=0}catch(e){}})(updateCam);
// results: top-3 podium strip above the table (+ RIVAL BEATEN! card line in rival races)
showResults=(f=>function(){const r=f.apply(this,arguments);try{if(!pl||!['race'].includes(RC.type)||ships.length<2)return r;
  const est=s=>s.finished?s.finishTime:1e5+raceT+Math.max(0,(RC.laps*TD.L-s.dist))/Math.max(40,s.v||60),o=[...ships].sort((a,b)=>est(a)-est(b));
  let el=document.getElementById('rfPod');if(!el){el=document.createElement('div');el.id='rfPod';const t=document.getElementById('resTable');t.parentNode.insertBefore(el,t)}
  const cols=['#ffd23c','#d9e2ec','#e09a5a'],hs=[44,32,24],at=[1,0,2];
  const rv=RC.rival?ships.find(s=>s.pid===RC.rival):null,beat=rv&&o.indexOf(pl)<o.indexOf(rv);
  el.style.cssText='display:flex;align-items:flex-end;justify-content:center;gap:6px;margin:4px 0 8px';
  el.innerHTML=at.map(i=>{const s=o[i];if(!s)return'';return `<div style="text-align:center;min-width:92px"><div style="font:800 13px/1.2 system-ui;color:${s===pl?'#7dff6a':'#fff'};white-space:nowrap">${s===pl?'YOU':s.name}</div><div style="height:${hs[i]}px;background:${cols[i]};border-radius:6px 6px 0 0;color:#111;font:900 italic 18px/${hs[i]}px system-ui">${ord(i+1).toUpperCase()}</div></div>`}).join('')+
   (rv?`<div style="align-self:center;margin-left:10px;font:900 italic 16px/1.1 system-ui;color:${beat?'#7dff6a':'#ff5a6a'}">${beat?'RIVAL<br>BEATEN!':'RIVAL<br>AHEAD'}</div>`:'')}catch(e){console.warn('RF pod',e)}return r})(showResults);
window.__rf={st:()=>({place:RFX.place,draft:+(RFX.draft||0).toFixed(1),grid:ships.map(s=>[s.name,Math.round(s.dist),+s.x.toFixed(1),+s.skill.toFixed(3)]),rub:ships.map(s=>+(s.rubber||1).toFixed(3))})};
// boost refill (2K: "the meter refills over time, faster from smashing and drifting"; the frames show boost jets ~60 % of the time).
// Races only: +3/s passive, +10/s more in a rival's slipstream (4–30 m behind, within 7 m sideways): being in the pack pays.
physPlayer=(f=>function(s,c){const r=f.apply(this,arguments);try{if(state==='race'&&RC.type==='race'&&s.isPlayer&&!s.nitro&&!s.finished){let g=3;
  for(const o of ships){if(o===s||o.eliminated||o.finished)continue;const dd=tdd(o.dist,s.dist);if(dd>4&&dd<30&&Math.abs(o.x-s.x)<7){g+=10;RFX.draft=(RFX.draft||0)+H;break}}
  s.bm=Math.min(100,s.bm+g*H)}}catch(e){}return r})(physPlayer);
// RF8 respawn (2K-style, never ends the race): wrong way 3 s, stuck 3 s, or a fall/wreck → "SPAWN IN n" banner;
// tap it or press R to respawn now, on the centre line facing forward, place kept (dist is not moved back)
const RSP={el:null,t:0,why:'',n:0};
function RF_rspEl(){if(RSP.el)return RSP.el;const e=document.createElement('button');e.id='rfRsp';e.type='button';
  e.style.cssText='position:fixed;z-index:7;left:50%;top:calc(env(safe-area-inset-top,0px) + 58px);transform:translateX(-50%);min-height:44px;padding:6px 18px;border-radius:12px;border:3px solid #ffd12c;background:rgba(10,14,30,.85);color:#fff;font:900 italic 18px/1.1 system-ui,sans-serif;letter-spacing:.03em;text-shadow:0 2px 0 #000;cursor:pointer;display:none';
  for(const ev of['touchstart','pointerdown','mousedown'])e.addEventListener(ev,x=>{x.stopPropagation();x.preventDefault();RF_rspNow()},{passive:false});
  document.body.appendChild(e);return RSP.el=e}
function RF_rspNow(){const s=pl;if(!s||state!=='race')return;if(s.dead>0){s.dead=1e-3;RSP.t=0;return}if(RSP.t<=0)return;
  s.x=0;s.yaw=s.beta=s.yawRate=0;s.v=s.stats.top*.35;s.inv=2;s.wrong=0;RSP.stk=0;RSP.t=0;RSP.n++;try{AU.sfx('pick')}catch(e){}}
function RF_rsp(){const e=RF_rspEl();const s=pl;if(!s||state!=='race'||!RC||RC.type==='arena'){e.style.display='none';RSP.t=0;return}
  const now=performance.now(),H=Math.min(.1,(now-(RSP.lt||now))/1000);RSP.lt=now;RSP.stk=(s.dead<=0&&s.v<4&&raceT>3)?(RSP.stk||0)+H:0;let why='';
  if(s.dead>0)why='';else if(s.wrong>=3)why='WRONG WAY!';else if(RSP.stk>=3)why='STUCK!';
  if(s.dead>0){e.style.display='';e.textContent='RESPAWN · TAP';return}
  if(why&&RSP.t<=0)RSP.t=3;if(!why&&RSP.t>0&&s.wrong<.5&&RSP.stk<.5)RSP.t=0;
  if(RSP.t>0){RSP.t-=H;if(RSP.t<=0){RSP.t=1e-3;RF_rspNow();e.style.display='none';return}e.style.display='';e.textContent=(why||'WRONG WAY!')+' SPAWN IN '+Math.ceil(RSP.t)+' · TAP'}else e.style.display='none'}
updHud=(f=>function(){f.apply(this,arguments);try{RF_rsp()}catch(e){}})(updHud);
addEventListener('keydown',e=>{if(e.code==='KeyR'&&typeof state!=='undefined'&&state==='race'&&pl&&(pl.dead>0||RSP.t>0)){e.preventDefault();e.stopImmediatePropagation();RF_rspNow()}},true);// capture: R otherwise restarts the race (40_hud)
