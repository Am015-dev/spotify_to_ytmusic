// PURPOSE: Street feel: feet that grip the road (run frames tied to ground speed, bob, dust, lean, skid), one body scale, bullets from the gun's muzzle, a Kai sprite set per weapon
// FLAG: feel (?feel=0)
// TEST: qa/streetfeel-test.js
/* ---------- STREETFEEL. Owner, 22 Oct 2026: "the art is completely fine as a sprite; the issue is it does not look like it is running; the hero is significantly smaller
   than the rest; the taxi is like a toy; ... it shoots but bullets fly not from the gun; gun variation should select the correct sprite; running sprites look like they slide".
   ?feel=0 = the street exactly as before. Tables below are measured from the strip sheets (alpha > 60): BODY = tallest visible body / frame height, MZ = gun muzzle per
   frame in sheet px from the feet anchor (facing right), ST = foot spread at contact (one step) in sheet px. Slots for missing art: ART-SLOTS-STREET.md. ---------- */
if(RET.feel===undefined)RET.feel=!/[?&]feel=0/.test(location.search);
(function(){
if(!window.FOOT||!FOOT._in||typeof ART==='undefined'||!ART.footDraw)return;
const F=window.FOOT,IN=F._in,FL=470,abs=Math.abs,clamp=(v,a,b)=>v<a?a:v>b?b:v;
const FEEL=F.FEEL={
  BODY:{"kai/aimdiag":0.988,"kai/aimup":0.992,"kai/crouchshoot":0.992,"kai/hurt":1.0,"kai/idle":1.0,"kai/melee":0.992,"kai/run":0.996,"kai/runshoot":0.992,"kai/shoot":0.996,"kai/victory":1.0,
    "knife/idle":0.988,"knife/melee":0.984,"knife/run":0.984,"knife/shoot":0.914,"gunman/idle":0.988,"gunman/melee":0.996,"gunman/run":0.988,"gunman/shoot":0.988,
    "bruiser/idle":0.992,"bruiser/melee":0.996,"bruiser/run":0.992,"bruiser/shoot":0.996},
  MZ:{"kai/aimdiag":[[62,-223],[61,-223],[53,-254]],"kai/aimup":[[34,-224],[41,-254],[36,-234]],"kai/crouchshoot":[[116,-203],[137,-206],[115,-198]],
    "kai/runshoot":[[120,-208],[102,-207],[72,-206],[93,-206],[83,-207],[98,-206]],"kai/shoot":[[76,-211],[61,-211],[54,-211]],
    "knife/shoot":[[73,-193],[28,-90],[66,-192]],"gunman/shoot":[[75,-208],[31,-208],[74,-208]],"bruiser/shoot":[[99,-193],[82,-205],[97,-210]]},
  ST:{"kai/run":146,"knife/run":162,"gunman/run":156,"bruiser/run":173,"kai/runshoot":185},
  H:{kai:64,rusher:64,gunner:64,heavy:80,bigheavy:90},   // one body height per kind: heavy = 1.25 x Kai
  log:{dust:0,skid:0,shots:0,mzErr:[]}};
if(!RET.feel)return;
const RUNA={run:1,runshoot:1,walk:1};
const sheetOf=k=>{const i=k.indexOf('/');return [k.slice(0,i),k.slice(i+1)];};
/* weapon sets: kai-<weapon>/<act> sheets (ART-SLOTS-STREET.md) replace kai/<act> act by act the moment they are listed in ready.json */
const wset=(P)=>{const ws='kai-'+P.w;if(!ART.ANIM.s[ws+'/idle']&&!ART.ANIM.s[ws+'/shoot']&&!ART.ANIM.s[ws+'/run'])return 'kai';
  if(!ART.FM[ws]){const o=Object.assign({},ART.FM.kai);o._all=ART.FM.kai._all.filter(a=>ART.ANIM.s[ws+'/'+a]);o._w=0;ART.FM[ws]=o;}return ws;};
/* the act footDraw will pick (same rule as art.js) */
const actOf=(who,pose,e)=>{const mp=ART.FM[who];if(!mp)return '';let a=e._xa||mp[pose];if(a&&!ART.ANIM.s[who+'/'+a]&&RET.streetlook)for(const b of (ART.FB[pose]||[]))if(ART.ANIM.s[who+'/'+b]){a=b;break;}return a||'';};
/* per entity: ground distance, speed, lean, contact dust */
function track(e,x,t){const S=F.S;const now=S?S.time:t;if(e._fx==null){e._fx=x;e._ft=now;e._fd=0;e._lv=0;e._ln=0;}
  const dt=now-e._ft;if(dt>0){let dx=x-e._fx;if(abs(dx)>60)dx=0;e._fd+=abs(dx);const v=dx/dt;const acc=(v-e._lv)/Math.max(dt,1/240);e._lv=v;e._ft=now;
    const want=clamp(acc/9000,-.12,.12)*(abs(v)>20||abs(acc)>400?1:0);e._ln+=(want-e._ln)*Math.min(1,dt*10);}
  e._fx=x;}
const fd0=ART.footDraw;
ART.footDraw=function(c,who,pose,x,y,h,flip,t){const e=ART.fE,S=F.S;if(!RET.feel||!e||!S)return fd0.apply(this,arguments);
  if(who==='kai'&&e===S.P){const ws=wset(e);if(ws!=='kai'&&ART.ANIM.s[ws+'/'+actOf(ws,pose,e)])who=ws;}
  track(e,x,t);
  const act=actOf(who,pose,e),key=act&&who+'/'+act,m=key&&ART.ANIM.s[key];
  // scale: the visible body, not the frame, is h tall (standing acts)
  const base=who.indexOf('kai')===0?'kai':who,bk=FEEL.BODY[base+'/'+act],ref=FEEL.BODY[base+'/idle'];if(bk&&ref&&!/crouch|die|jump|land|dash/.test(act))h*=ref/bk;
  let tt=t,bob=0;
  if(m&&RUNA[act]&&abs(e._lv)>5){const o=ART.aS(key),n=m[0],sc=h/m[3],step=(FEEL.ST[base+'/'+act]||FEEL.ST[base+'/run']||m[2]*.8)*sc,cyc=2*step;
    const ph=(e._fd/cyc)%1,fi=Math.floor(ph*n),fr=ph*n-fi,a0=fi?o.cum[fi-1]:0;tt=a0+(o.cum[fi]-a0)*fr;   // frame = distance / stride: the planted foot moves with the road
    if(e._fa!==key){e._fa=key;}e._f0=0;bob=-abs(Math.sin(ph*2*Math.PI))*h*.025;
    const half=Math.floor(ph*2);if(e._hc!==half){e._hc=half;if(e._hc!=null&&(e===S.P?e.onGround:!e.fly)&&window.AH&&S.fx.length<200){AH.ftPush(S.fx,'fx-ft-dust',x-(flip?-1:1)*h*.12,y-3,h*.42,.28);FEEL.log.dust++;}}}
  else e._hc=null;
  const ln=e._ln||0;c.save();c.translate(x,y+bob);if(ln)c.rotate(ln);   // lean into a start, back on a stop
  const r=fd0.call(this,c,who,pose,0,0,h,flip,tt);c.restore();
  // remember where this frame's gun is (bullets and the flash come from it)
  const kk=e._fa;if(r&&kk){const[kw,ka]=sheetOf(kk),mz=FEEL.MZ[(kw.indexOf('kai')===0?'kai':kw)+'/'+ka],mm=ART.ANIM.s[kk];
    if(mz&&mm){const i=Math.min(mz.length-1,ART.aframe(kk,tt-(e._f0||0))),sc=h/mm[3];const q=rot([mz[i][0]*sc*(flip?-1:1),mz[i][1]*sc],ka,flip,e._ln);e._mzd=[q[0],q[1]+bob,kk,i,S.time];}else e._mzd=null;}
  return r;};
/* muzzle in world units: the drawn offset under streetlook's K (actors are drawn K x about their feet, bullets are placed through SL.my) */
const rot=(d,act,flip,ln)=>{const sm=ART.ANIM.sm,th=(RUNA[act]&&sm&&sm.lean?sm.lean.run_deg*Math.PI/180*(flip?-1:1):0)+(ln||0);if(!th)return d;const c=Math.cos(th),s=Math.sin(th);return [d[0]*c-d[1]*s,d[0]*s+d[1]*c];};   // art.js leans run acts about the feet; ours adds start/stop lean
const inv=(Y)=>{const L=F.look;if(!L||!L.my)return Y;let lo=-400,hi=FL;if(Y>=FL)return Y;for(let i=0;i<30;i++){const md=(lo+hi)/2;if(L.my(md)<Y)lo=md;else hi=md;}return (lo+hi)/2;};
const toWorld=(x,y,dx,dy)=>{const L=F.look,K=RET.streetlook&&L?L.k:1;const sy=L&&L.my&&RET.streetlook?L.my(y):y;return [x+dx*K,RET.streetlook&&L&&L.my?inv(sy+dy*K):y+dy];};
/* the act Kai's shot will show (kaiX / ppose rules), for the first frame of a burst before it is drawn */
function kaiShotAct(P,a){if(P.crouch)return 'crouchshoot';if(!P.onGround)return '';const el=abs(Math.sin(a||0));return el>.8?'aimup':el>.3?'aimdiag':abs(P.vx)>5?'runshoot':'shoot';}
function localMz(e,act,h,flip){const mz=FEEL.MZ[act],mm=ART.ANIM.s[act];if(!mz||!mm)return null;const a2=act.slice(act.indexOf('/')+1),base=act.slice(0,act.indexOf('/'));
  const bk=FEEL.BODY[act],ref=FEEL.BODY[base+'/idle'];if(bk&&ref&&!/crouch/.test(a2))h*=ref/bk;const sc=h/mm[3];let i=0;
  if(RUNA[a2]&&e._fd!=null){const cyc=2*(FEEL.ST[act]||FEEL.ST[base+'/run'])*sc,ph=((e._fd+abs(e.x-e._fx))/cyc)%1;i=Math.floor(ph*mm[0]);}   // the frame the next draw will show
  else if(e._fa&&e._fa.slice(e._fa.indexOf('/')+1)===a2&&e._mzd&&F.S.time-e._mzd[4]<.2)i=ART.aframe(e._fa,F.S.time-(e._f0||0));   // the act is already showing: its frame at this time
  i=Math.min(mz.length-1,i);return rot([mz[i][0]*sc*(flip?-1:1),mz[i][1]*sc],a2,flip,e._ln);}
F.mz=(P,a)=>{if(!RET.feel)return null;const act=kaiShotAct(P,a),h=P.crouch?44:P.h,fl=P.facing<0;let d=act&&localMz(P,'kai/'+act,act==='crouchshoot'?h:FEEL.H.kai,fl);
  if(!d)d=[(fl?-1:1)*h*.32,-h*.62];   // no shot sheet for this pose (in the air): hand height on the facing side
  const w=toWorld(P.x,P.y,d[0],d[1]);P._mzw=[w[0],w[1],a,F.S.time];FEEL.log.shots++;return w;};
/* the gun sits higher than the old shot line (shoulder height in the art): with no foe in the aim cone, a shot along the ground dips onto the crate or barrel ahead */
F.aimX=(P,a,a0)=>{if(!RET.feel||a!==a0||!P.onGround||P.crouch||abs(Math.sin(a))>.2)return a;const S=F.S,fc=P.facing,act=kaiShotAct(P,a);
  const d=(act&&localMz(P,'kai/'+act,FEEL.H.kai,fc<0))||[fc*P.h*.32,-P.h*.62],w=toWorld(P.x,P.y,d[0],d[1]);let best=null,bd=340;
  for(const p of S.pr){if(p.hp<=0||p.gone||p.pass)continue;const dx=(p.x-w[0])*fc;if(dx>20&&dx<bd&&p.y-p.h>w[1]-4){bd=dx;best=p;}}
  if(!best)return a;const b=Math.atan2(best.y-best.h*.55-w[1],best.x-w[0]);return abs(Math.sin(b))<.28?b:a;};   // never steep enough to switch Kai to the diagonal aim pose
F.emz=(e,a)=>{if(!RET.feel||!e||!e.ext)return null;const sh={rusher:'knife',gunner:'gunman',heavy:'bruiser',bigheavy:'bruiser'}[e.id];if(!sh)return null;
  const d=localMz(e,sh+'/shoot',e.h,e.facing<0)||[e.facing*e.h*.32,-e.h*.62];const w=toWorld(e.x,e.y,d[0],d[1]);e._mzw=[w[0],w[1],a,F.S.time];return w;};
F.mzAt=P=>RET.feel&&P._mzw&&F.S&&F.S.time-P._mzw[3]<.15?P._mzw:null;
/* skid: a hard turn at speed shows the landing crouch for a moment, with dust */
const kx0=IN.kaiX;IN.kaiX=function(P){const S=F.S,r=kx0.apply(this,arguments);if(!RET.feel||!S)return r;
  const v=P.vx||0,pv=P._pvx||0;P._pvx=v;if(P.onGround&&abs(pv)>150&&(Math.sign(v)!==Math.sign(pv)||abs(v)<20)&&!P._skT){P._skT=.14;FEEL.log.skid++;if(window.AH)AH.ftPush(S.fx,'fx-ft-dust',P.x,P.y-4,40,.3);}
  if(P._skT>0){P._skT-=1/60;if(P._skT<=0)P._skT=0;if(!r&&P.onGround&&!(P.shotT>0)&&!P.crouch&&ART.ANIM.s['kai/land'])return 'land';}return r;};
/* body heights (STREET2.md scale line): Kai = rusher = gunner, heavy 1.25 x */
const FE=window.FOOT_ENEMIES||{};for(const id of ['rusher','gunner','heavy','bigheavy'])if(FE[id]&&FEEL.H[id])FE[id].h=FEEL.H[id];
/* props at real size vs a 1.8 m Kai (64 units = 1.8 m, 35.6 units per metre): taxi 4.5 x 1.5 m, kiosk 2.4 m, barrel 0.9 m */
const PD=IN.PROPD;if(PD.car){PD.car.w=160;PD.car.h=54;}if(PD.kiosk)PD.kiosk.h=86;if(PD.barrel){PD.barrel.h=34;PD.barrel.w=24;}
if(ART.PROPS)for(const p of ART.PROPS){if(p[0]==='car')p[1]=120;else if(p[0]==='police')p[1]=124;}   // the parked cars on the far kerb (0.7 parallax): 3/4 of a near taxi
})();
