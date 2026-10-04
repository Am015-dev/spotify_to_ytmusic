# pSM1: seamless Athens. The four district maps A-D become ONE world built once at boot (no DRIVE TO gates, no reload at borders).
# ATHD turns into the live "current district" (updated from the car position). Content is limited to the districts + 300 m;
# the gaps between them are the lazy Attiki outskirts (streamed). Terrain = the four district DEM grids blended.
# Off switch for A/B measurements: localStorage mho_sm='0' (or ?sm=0) restores the split districts.
exec(open('P.py').read())

# --- flag + helpers (before ATHD; everything they call is resolved at call time)
R("const ATHD=(()=>{",
"""const SM_ON=CID==='ath'&&(()=>{try{return !/[?&]sm=0/.test(location.search)&&localStorage.getItem('mho_sm')!=='0'}catch(e){return true}})();
const SM={cross:0,log:[],first:1};let SM_WR=null,SM_GT=null;
function SM_inD(x,z,m){const W=SM_WR||(SM_WR=Object.values(ATH_DIST).flatMap(D=>D.r).map(r=>rfRect(r)));for(const r of W)if(inR(r,x,z,m))return true;return false}
function SM_dz(x,z){return SM_ON?(athDistAt(...RW(x,z))||ATHD):ATHD}
let ATHD=(()=>{""")
# world box = all districts
R("function athDistCfg(){const R=ATH_DIST[ATHD].r,","function athDistCfg(){const R=SM_ON?Object.values(ATH_DIST).flatMap(D=>D.r):ATH_DIST[ATHD].r,")
# "in the city" = inside a district (ground, outskirts filler, trees and the minimap follow the real district shapes)
R("const inCity=(x,z,m=0)=>x>HX0-m&&x<HX1+m&&z>HZT-m&&z<HZN+m;","const inCity=(x,z,m=0)=>x>HX0-m&&x<HX1+m&&z>HZT-m&&z<HZN+m&&(!SM_ON||SM_inD(x,z,m));")
# streets: only those that reach a district (+300 m, the old per-district margin)
R("if(!pts.some(([x,z])=>x>WX0&&x<WX1&&z>WZS&&z<WZN))continue;","if(!pts.some(([x,z])=>x>WX0&&x<WX1&&z>WZS&&z<WZN&&(!SM_ON||SM_inD(x,z,300))))continue;")
# terrain: the four district grids, blended by how deep a point is inside each grid (continuous across the borders); datum = district A
R("const TR_SET=(TR_DATA[CID==='fra'?'fra':'ath'+ATHD]||{})","const SM_TG=SM_ON?['A','B','C','D'].map(d=>TR_dec(TR_DATA['ath'+d].f)):null;const TR_SET=(TR_DATA[CID==='fra'?'fra':'ath'+(SM_ON?'A':ATHD)]||{})")
R("function TR_real(e,n){","""function SM_trReal(e,n){const D=[];let dm=-1e9;for(const G of SM_TG){const d=Math.min(e-G.e0,G.e0+(G.nx-1)*G.cs-e,n-G.n0,G.n0+(G.nz-1)*G.cs-n);D.push(d);if(d>dm)dm=d}
  let a=0,w=0;const cm=Math.min(dm,300);for(let i=0;i<D.length;i++){if(D[i]<dm-400)continue;const k=Math.exp((Math.min(D[i],300)-cm)/50);a+=TR_bil(SM_TG[i],e,n)*k;w+=k}return a/w}
function TR_real(e,n){if(SM_TG)return SM_trReal(e,n);""")
# outskirts tiles: skip only tiles that lie inside the districts
R("if(r[0]>HX0-60&&r[1]<HX1+60&&r[2]>HZS-60&&r[3]<HZN+60)continue;",
  "if(SM_ON?[[r[0],r[2]],[r[1],r[2]],[r[0],r[3]],[r[1],r[3]],[(r[0]+r[1])/2,(r[2]+r[3])/2]].every(([x,z])=>inCity(x,z,60)):r[0]>HX0-60&&r[1]<HX1+60&&r[2]>HZS-60&&r[3]<HZN+60)continue;")
# no DRIVE TO gates (the border crossings are kept as invisible mission waypoints, SM_gates)
R("[oe,on]=RW(o.x,o.z),to=athDistAt(oe,on);if(!to||to===ATHD)continue;","[oe,on]=RW(o.x,o.z),to=athDistAt(oe,on);if(!to||to===ATHD||SM_ON)continue;")
# build-time district picks become per-position
s=s.replace("typeof ATHD!=='undefined'&&ATHD>'B'","typeof ATHD!=='undefined'&&SM_dz(px,pz)>'B'",1)
R("typeof ATHD!=='undefined'&&ATHD>'B'","typeof ATHD!=='undefined'&&SM_dz(p.x,p.z)>'B'")
R("return A.filter(s=>athIn(ATHD,...RW(s[0],s[1])))","return SM_ON?A:A.filter(s=>athIn(ATHD,...RW(s[0],s[1])))")
R("RO.gbs=spots.slice(0,30)","RO.gbs=spots.slice(0,SM_ON?999:30)")
R("function roamCatalog(){const GL=GARAGES.filter(g=>CID==='fra'||(g.x==null?ATHD==='A':athIn(ATHD,...RW(g.x,g.z))))",
  "function roamCatalog(){const GL=GARAGES.filter(g=>CID==='fra'||SM_ON||(g.x==null?ATHD==='A':athIn(ATHD,...RW(g.x,g.z))))")
R("if(CID!=='fra')return ATHD==='A'?[...GL,FL]:GL","if(CID!=='fra')return SM_ON||ATHD==='A'?[...GL,FL]:GL")
# crossing a border: no reload, just the district banner
R("function athDistStep(){","""function SM_step(){if(CID!=='ath'||!RO.on)return;const[e,n]=RW(RO.x,RO.z),d=athDistAt(e,n);
  if(d&&d!==ATHD){const was=ATHD;ATHD=d;try{localStorage.setItem('mho_athd@'+SLOT,d)}catch(_){}if(typeof ATC!=='undefined')ATC.mk=0;
    if(!SM.first){SM.cross++;SM.log.push([was,d,Math.round(performance.now())]);const el=$('#roamDist');if(el){el.textContent='📍 '+ATH_DIST[d].name.toUpperCase();el.classList.remove('on');void el.offsetWidth;el.classList.add('on')}}}
  SM.first=0;if(d||RO.ch||RO.sp||RO.wk)return;
  RO.edgeT2=(RO.edgeT2||0)-.5;if(RO.edgeT2<=0){RO.edgeT2=3;const el=$('#roamDist');if(el){el.textContent='↩ TURN BACK · '+ATH_DIST[ATHD].name.toUpperCase();el.classList.remove('on');void el.offsetWidth;el.classList.add('on')}}}
function athDistStep(){if(SM_ON)return SM_step();""")
R("function athDistPick(d){","function athDistPick(d){if(SM_ON&&ATH_DIST[d]){toggleMap(false);const D=ATH_DIST[d],[x,z]=WP(D.st[0],D.st[1]),q=rfSnap(x,z,200);roamWarp(q[0],q[1],q[2]);return true}")
R("function PIN_away(){","function PIN_away(){if(SM_ON)return false;")
# map: every district is loaded (no dimming, no ▶ "drive to" labels)
R("{g.save();g.beginPath();g.rect(0,0,W,Hh);for(const r of ATH_DIST[ATHD].r)","{g.save();g.beginPath();g.rect(0,0,W,Hh);for(const r of(SM_ON?Object.values(ATH_DIST).flatMap(D=>D.r):ATH_DIST[ATHD].r))")
R("g.fillText(d+' · '+D.name.toUpperCase()+' ▶',tx,tz)","g.fillText(d+' · '+D.name.toUpperCase()+(SM_ON?'':' ▶'),tx,tz)")
# campaign: every mission mark is on the one map; a mission's district change happens in place
R("function ATC_mkMark(id){const D=ATC_DEF[id],a=D.d0===ATHD","function ATC_mkMark(id){const D=ATC_DEF[id],a=SM_ON||D.d0===ATHD")
R("if(ATC_DEF[id].d0===ATHD)ATC_mkMark(id)","if(SM_ON||ATC_DEF[id].d0===ATHD)ATC_mkMark(id)")
R("if(D.d0!==ATHD)return{ic:'🗺'","if(!SM_ON&&D.d0!==ATHD)return{ic:'🗺'")
R("if(D.d0!==ATHD){const L=qvPreview(m)","if(!SM_ON&&D.d0!==ATHD){const L=qvPreview(m)")
R("function ATC_gateSetup(ch,S){const G=(HUB.gates||[])","""function SM_gates(){if(SM_GT)return SM_GT;SM_GT=[];for(const S of CITY_S){if(!['arterial','main','sec','res','link'].includes(S.r.cls))continue;const P=S.pts;
  for(let i=1;i<P.length;i++){const a=athDistAt(...RW(P[i-1].x,P[i-1].z)),b=athDistAt(...RW(P[i].x,P[i].z));if(!a||!b||a===b)continue;
    for(const[q,to]of[[P[i],b],[P[i-1],a]])if(!SM_GT.some(g=>g.to===to&&Math.hypot(g.x-q.x,g.z-q.z)<70))SM_GT.push({x:q.x,z:q.z,to})}}return SM_GT}
function ATC_gateSetup(ch,S){const G=(SM_ON?SM_gates():HUB.gates||[])""")
R("function ATC_transfer(ch,S){","""function ATC_transfer(ch,S){if(SM_ON){const s=ATC_st(),V=ch.v2;s.pend={mid:ch.m.ev.mid,si:V.si+1,d:S.to,left:Math.max(V.left,60),t:+ch.t.toFixed(1),hp:Math.round(Math.max(60,M1.hp)),inv:M1.inv||null,from:ATHD};ATC_save();
  hitPop('📍 '+ATH_DIST[S.to].name.toUpperCase(),'#5dffb0');ATHD=S.to;chAbort();M1_clear();M1.cp=null;ATC.xfer=1;SM.xfer=(SM.xfer||0)+1;ATC_resume();return}""")
# first boot of a district without a saved position: start at that district's garage (the per-district maps did the same)
R("fm||RO.marks.find(m=>m.kind==='garage')","fm||(SM_ON&&RO.marks.find(m=>m.kind==='garage'&&SM_dz(m.x,m.z)===ATHD))||RO.marks.find(m=>m.kind==='garage')")
# test hooks (athGates: the invisible border crossings in seamless mode)
R("athGates:()=>HUB.gates||[]","athGates:()=>SM_ON?SM_gates():HUB.gates||[]")
R("window.__mho={","window.__sm={get on(){return SM_ON},get st(){return SM},get athd(){return ATHD},gates:()=>SM_ON?SM_gates():[],inD:(x,z,m)=>SM_inD(x,z,m||0),lz:()=>LAZY.map(L=>({id:L.id,done:L.done,qd:L.qd,r:L.rect})),\n atcAt:(id,si)=>{const m=ATC_mark(id)||ATC_mkMark(id);M1.hp=100;M1.restoring={mid:id,si,x:RO.x,z:RO.z,h:RO.h,left:200,t:0,hp:100,ph:null,vanAt:null,rv:null};chStart(m,{O:{x:m.x,z:m.z}});M1.restoring=null;const ch=RO.ch;return ch&&ch.v2?{si:ch.v2.si,t:ch.v2.L.st[ch.v2.si].t}:null},\n atcSt:()=>{const ch=RO.ch;if(!ch||!ch.v2)return null;const S=ch.v2.L.st[ch.v2.si];return{mid:ch.m.ev.mid,si:ch.v2.si,t:S.t,to:S.to||null,x:S.x,z:S.z,dd:S.dd}}};\nwindow.__mho={")
save()
