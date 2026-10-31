// ---- og3 (one game S3, docs/DESIGN_one_game.md §4): ONE HUD kit for free roam, Race Mode and the builder DRIVE (flag `?og3=1`, OD_FLAG('og3'), default OFF).
// Organisation idea only (docs/wiki/learn/cuphead-structure.md: "UI/ ... one UI module shared by every level"). One #hk layer: speed pill (#hkSpd + boost #hkBoost + hull #hkHull),
// #hkPlace, #hkLap, #hkTime, minimap slot #hkMap; same font, same safe-area layout. roamHud / updHud / BX_hud keep their data work; under og3 the kit draws and the old readouts are hidden (CSS body.og3).
// Flag OFF: nothing is created, nothing changes. GAS: present in all 3 modes under og3 (thrEff in 10_core4.js returns 'pedal' on touch everywhere).
const HK={on:OG3,m:'',el:null,top:null,mc:null,v:{}};
function HK_mode(){const B=window.__bx&&window.__bx.BX;if(B&&B.on&&B.mode==='drive')return'builder';if(state==='race'||state==='countdown')return'race';if(state==='roam'&&RO&&RO.on)return'roam';return''}
function HK_data(m){const mph=SET.units==='mph',k=mph?2.237:3.6,d={u:mph?'MPH':'KM/H',pl:'',lap:'',t:'',bo:0,hu:100,v:0};
 if(m==='roam'){const s=RO.sp&&!RO.sp.done?RO.sp:null,c=RO.ch;d.v=Math.abs(RO.v)*k;d.bo=pl?pl.bm:0;d.hu=RO.hp??100;
  if(s){d.pl=ord(s.place||1)+'/'+(s.ai.length+1);d.lap='CP '+Math.min(s.gi+1,s.G.length)+'/'+s.G.length;d.t=fmt(Math.max(0,s.t||0))}
  else if(c)d.t=fmt(Math.max(0,(c.v2?c.v2.left:c.t)||0))}
 else if(m==='race'&&pl){const n=ships.filter(active).length;d.v=pl.v*k;d.bo=pl.bm;d.hu=clamp(pl.hull,0,100);
  d.pl=RC.type==='tt'?'TT':ord(pl.place)+'/'+n;d.lap=RC.type==='zone'?(pl.dist/1000).toFixed(2)+' KM':RC.type==='elim'||RC.type==='arena'||lapAttack()?'LAP '+Math.max(1,pl.lap+1):'LAP '+clamp(pl.lap+1,1,RC.laps)+'/'+RC.laps;d.t=fmt(raceT)}
 else if(m==='builder'){const h=window.__bx.BX.hkd;if(h){d.v=h.v/3.6*k;d.bo=h.bo;d.pl=h.pos?h.pos+'/'+h.n:'';d.lap='LAP '+h.lap+'/'+h.laps;d.t=fmt(h.t)}}
 return d}
function HK_set(id,v){const e=document.getElementById(id);if(e&&HK.v[id]!==v){HK.v[id]=v;e.textContent=v}}
function HK_tick(){const m=HK_mode(),b=document.body;if(m!==HK.m){HK.m=m;b.dataset.hk=m;HK.el.hidden=!m}if(!m)return;const d=HK_data(m);
 HK_set('hkSpdN',String(Math.round(d.v)));HK_set('hkSpdU',d.u);HK_set('hkPlace',d.pl);HK_set('hkLap',d.lap);HK_set('hkTime',d.t);HK.top.hidden=!(d.pl||d.lap||d.t);
 {const e=document.getElementById('hkBoost'),w=Math.round(clamp(d.bo,0,100))+'%';if(HK.v.bw!==w){HK.v.bw=w;e.firstChild.style.width=w}}
 {const e=document.getElementById('hkHull'),w=Math.round(clamp(d.hu,0,100));if(HK.v.hw!==w){HK.v.hw=w;e.firstChild.style.width=w+'%';e.firstChild.style.background=w>60?'#5dffb0':w>30?'#ffd12c':'#ff2d55'}}
}
if(OG3){const st=document.createElement('style');st.textContent=`
#hk{position:fixed;inset:0;pointer-events:none;z-index:62;font:900 italic 16px var(--hud,system-ui);color:#fff;text-shadow:0 2px 0 rgba(0,0,0,.55),0 0 8px rgba(0,0,0,.4)}#hk[hidden]{display:none}
#hkTop{position:absolute;left:50%;top:calc(6px + env(safe-area-inset-top,0px));transform:translateX(-50%);display:flex;align-items:baseline;gap:10px;padding:2px 14px;border-radius:14px;background:rgba(10,14,28,.5);white-space:nowrap}
#hkPlace{font-size:26px;color:#ffd400;min-width:2ch}#hkLap{font-size:14px}#hkTime{font-size:16px;font-variant-numeric:tabular-nums}
#hkTop[hidden],#hkTop span:empty,#hkTop b:empty{display:none}
#hkSpd{position:absolute;left:50%;bottom:0;transform:translateX(-50%);display:grid;grid-template-columns:auto auto 64px;column-gap:6px;align-items:center;height:24px;box-sizing:border-box;padding:0 12px;border-radius:12px 12px 0 0;background:rgba(10,14,28,.55)}
#hkSpdN{font-size:20px;line-height:1;text-align:right;grid-row:1/3}#hkSpdU{font-size:12px;opacity:.85;grid-row:1/3}
#hkBoost,#hkHull{grid-column:3;height:5px;border-radius:3px;background:rgba(255,255,255,.22);overflow:hidden}#hkBoost{align-self:end;margin-bottom:1px}#hkHull{height:3px;align-self:start;margin-top:1px}#hkBoost i{display:block;height:100%;width:0;background:linear-gradient(90deg,#a8fbff,#16b4d6)}#hkHull i{display:block;height:100%;width:100%}
#hkMap{position:absolute;left:calc(12px + env(safe-area-inset-left,0px));top:calc(56px + env(safe-area-inset-top,0px));width:11.9vmin;height:11.9vmin;border-radius:50%;border:3px solid #ffd400;background:#141413;box-sizing:border-box;overflow:hidden}#hkMap canvas{width:100%;height:100%}
@media (orientation:portrait){#hkSpd{bottom:auto;left:auto;right:calc(12px + env(safe-area-inset-right,0px));top:calc(88px + env(safe-area-inset-top,0px));transform:none;border-radius:12px}}
body[data-hk=roam] #hkMap,body[data-hk=race] #hkMap{background:none;border:0}
@media (orientation:portrait){body[data-hk=builder] #hkMap,body[data-hk=builder] #hkSpd{top:calc(154px + env(safe-area-inset-top,0px))}}/* under the builder's own button row */
/* the old minimaps sit in the kit's slot */
html body.og3 #roamMini#roamMini#roamMini#roamMini{left:calc(12px + env(safe-area-inset-left,0px))!important;top:calc(56px + env(safe-area-inset-top,0px))!important;bottom:auto!important;width:11.9vmin!important;height:11.9vmin!important;border-width:3px!important;box-sizing:border-box!important;z-index:63}
html body.og3 #hBL#hBL#hBL#hBL{left:calc(12px + env(safe-area-inset-left,0px))!important;top:calc(56px + env(safe-area-inset-top,0px))!important;bottom:auto!important;z-index:63}html body.og3 #map#map#map#map{width:11.9vmin!important;height:11.9vmin!important;margin:0!important}
html body.og3 #raceW#raceW#raceW{top:calc(50px + env(safe-area-inset-top,0px))!important}
html body.bxOn>#hk#hk#hk{visibility:visible!important}`;document.head.appendChild(st);document.body.classList.add('og3');document.querySelectorAll('#boostCells,#hullCells,#roamGauge,#hTime,#hPos .lab,#pos,#hBR,#hBL #lap,#raceW .pos,#raceW .tm').forEach(e=>e.remove());/* the old readouts are deleted, not hidden */
 const e=document.createElement('div');e.id='hk';e.hidden=true;e.setAttribute('aria-hidden','true');e.innerHTML='<div id="hkTop"><b id="hkPlace"></b><span id="hkLap"></span><span id="hkTime"></span></div><div id="hkSpd"><b id="hkSpdN">0</b><small id="hkSpdU">KM/H</small><div id="hkBoost"><i></i></div><div id="hkHull"><i></i></div></div><div id="hkMap"><canvas width="84" height="84"></canvas></div>';
 document.body.appendChild(e);HK.el=e;HK.top=e.firstChild;HK.mc=e.querySelector('canvas');setInterval(()=>{try{HK_tick()}catch(x){HK.err=String(x)}},100)}
