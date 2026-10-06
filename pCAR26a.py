# CAR26a (input + race traffic; independent of pCAR26 physics):
#  (1) SMASH double-tap that works on phones (owner: iPhone, iOS Safari / Claude app iframe, 852x393):
#      - one detector for touch + keyboard: 2nd touchstart on the same arrow within 350 ms (event timeStamp when sane),
#        every changedTouch counted, first tap may still be held, the other arrow resets the pair;
#      - an accepted double-tap is never dropped: cooldown / air / a running lunge -> buffered 0.45 s and fired when allowed
#        (race: pressed.roll re-latched every physics step; roam: CR_lgGo retried every roamStep); modal states refuse;
#      - feedback on every accepted double-tap: the arrow flashes orange + pulses, "SMASH!" with an arrow pops beside the car
#        (clear of buttons and minimap); the centre tutorial card hides while a SMASH pop is up (also the hitPop one);
#      - first-time chip "TAP TAP = SMASH" above the arrows until 2 SMASHes (localStorage mho_smHint);
#      - html/body touch-action:manipulation, controls touch-action:none / no callout / no select, dblclick + gesturestart
#        blocked while driving (iOS double-tap zoom / pinch).
#  (2) races: no civilian traffic (rivals stay). Crash Junction (its objective is crashing into traffic) keeps 3 cars,
#      parked at the track edge (|x| = MARGIN-0.6). Event texts that promised traffic / near misses updated.
exec(open('P.py').read())
if 'CRSM_tap' in s:
    print('OK');raise SystemExit
assert 'CR_lgTap' in s, 'needs CAR25 (live v87)'
# ---- (1) input: one detector (the base BZ handler's own 260 ms check is retired; CRSM_tap below decides)
R("\n  if(e.timeStamp-TOUCH.lastTap.t<260&&TOUCH.lastTap.d===d)pressed.roll=d;TOUCH.lastTap={t:e.timeStamp,d};bzSet(d)},{passive:false});",
  "\n  TOUCH.lastTap={t:e.timeStamp,d};bzSet(d)},{passive:false});")
R("BZ.addEventListener('touchstart',e=>{if(state!=='roam'&&state!=='race')return;const t=e.changedTouches[0];if(t)CR_lgTap(bzSide(t))},{passive:true});",
  "BZ.addEventListener('touchstart',e=>{if(state!=='roam'&&state!=='race')return;const ts=CRSM_ts(e);for(const t of e.changedTouches)CRSM_tap(bzSide(t),ts)},{passive:true});")
JS = r"""
// ---- CAR26a: SMASH double-tap for phones: detector, buffer, feedback, first-time hint ----------------------------------------
(()=>{const st=document.createElement('style');st.id='crsm26a';st.textContent=`html,body{touch-action:manipulation}#touch,#touch *,.tbtn{touch-action:none;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none;-webkit-tap-highlight-color:transparent}
html body #tL.crSmF,html body #tR.crSmF{animation:crSmF .35s ease-out;background:radial-gradient(circle at 50% 40%,#fff3a0,#ff9a1f 72%)!important;border-color:#ffd12c!important;color:#3a1600!important;box-shadow:0 0 18px rgba(255,170,30,.85)}
@keyframes crSmF{0%{transform:scale(1)}35%{transform:scale(1.2)}100%{transform:scale(1)}}
#crSmPop{position:fixed;left:-999px;top:0;z-index:8;pointer-events:none;font:italic 900 34px/1 system-ui,sans-serif;color:#ffd12c;-webkit-text-stroke:2px #141413;text-shadow:0 3px 0 #141413,0 0 16px rgba(255,150,0,.6);white-space:nowrap;opacity:0;letter-spacing:.02em}
#crSmPop.on{animation:crSmP .5s cubic-bezier(.2,1.5,.4,1) forwards}#crSmPop.hit{color:#ff8a1a}
@keyframes crSmP{0%{opacity:0;transform:scale(.4)}20%{opacity:1;transform:scale(1.18)}35%{transform:scale(1)}80%{opacity:1}100%{opacity:0;transform:scale(1.04)}}
@media (max-height:520px){#crSmPop{font-size:30px}}
body.crSmOn #roamTut{visibility:hidden!important}
#crSmHint{position:fixed;left:-999px;top:0;z-index:7;pointer-events:none;font:900 13px/1 system-ui,sans-serif;letter-spacing:.06em;color:#241400;background:#ffd12c;border:2px solid #141413;border-radius:999px;padding:5px 10px;white-space:nowrap;box-shadow:0 3px 0 rgba(0,0,0,.35);display:none}
#crSmHint.on{display:block;animation:crSmH 1.6s ease-in-out infinite}@keyframes crSmH{50%{transform:translateY(-3px)}}body.cine #crSmHint,body.cine #crSmPop{display:none}`;document.head.appendChild(st)})();
for(const ev of['dblclick','gesturestart','gesturechange'])document.addEventListener(ev,e=>{if(state==='roam'||state==='race'||state==='countdown')e.preventDefault()},{passive:false});
const CRSM={d:0,t:-1e9,b:null,n:0,hn:0,pt:0,pd:0,acc:0};try{CRSM.hn=+(localStorage.getItem('mho_smHint')||0)||0}catch(e){}
function CRSM_ts(e){const n=performance.now(),t=e&&e.timeStamp;return typeof t==='number'&&t>0&&Math.abs(n-t)<2000?t:n}
function CRSM_tap(d,ts){if(!d)return;const g=ts-CRSM.t;if(CRSM.d===d&&g>=0&&g<=350){CRSM.t=-1e9;CRSM_go(d)}else{CRSM.d=d;CRSM.t=ts}}
CR_lgTap=function(d){CRSM_tap(d,performance.now())};
function CRSM_modal(){if(paused||!pl)return true;if(state==='race')return !!(pl.finished||pl.dead>0);if(state==='roam')return !!(RO.wk||RO.frozen||RO.card||RO.mapOpen||RO.story);return true}
function CRSM_go(d){if(CRSM_modal())return;CRSM.acc++;CRSM.b={d,age:0,t0:performance.now()};try{CRSM_fx(d)}catch(e){}CRSM_try()}
function CRSM_try(){const b=CRSM.b;if(!b)return;if(b.age>.45||performance.now()-b.t0>1500||CRSM_modal()){CRSM.b=null;return}
 if(state==='race'){if(!pressed.roll)pressed.roll=b.d;return}
 const n0=RO.crLgN||0;CR_lgGo(b.d);if((RO.crLgN||0)>n0){CRSM.b=null;CRSM_fired()}}
function CRSM_fired(){CRSM.n++;CRSM.hn++;try{localStorage.setItem('mho_smHint',String(CRSM.hn))}catch(e){}}
// race: the buffered request is re-latched every physics step until the lunge starts (cooldown / air / running lunge)
physPlayer=(f=>function(s,c){let live=false,rt0=0,cd0=0;if(state==='race'&&s===pl&&CRSM.b){CRSM.b.age+=H;CRSM_try();live=!!CRSM.b;rt0=s.rollT;cd0=s.rollCd}
 f(s,c);if(live&&CRSM.b&&s.rollT>0&&(rt0<=0||s.rollCd>cd0)){CRSM.b=null;CRSM_fired()}})(physPlayer);
// roam: retry every frame until CR_lgGo accepts it
roamStep=(f=>function(dt){try{if(state==='roam'&&CRSM.b){CRSM.b.age+=dt;CRSM_try()}}catch(e){}return f(dt)})(roamStep);
// feedback: arrow flash + "SMASH!" beside the car (never over buttons / minimap; the tutorial card hides meanwhile)
function CRSM_car(){try{const m=pl&&pl.mesh;if(!m)return null;const v=m.getWorldPosition(new THREE.Vector3()).project(camera);if(v.z>1||Math.abs(v.x)>1.1||Math.abs(v.y)>1.1)return null;return[(v.x+1)/2*innerWidth,(1-v.y)/2*innerHeight]}catch(e){return null}}
function CRSM_rects(){const L=[];for(const e of document.querySelectorAll('button,.tbtn,#roamMini,#map,#hBL,#hBR,#crSmHint.on')){if(e.id==='btnZone')continue;const r=e.getBoundingClientRect();if(r.width>2&&r.height>2&&r.bottom>0&&r.right>0&&r.top<innerHeight&&r.left<innerWidth&&e.getClientRects().length&&getComputedStyle(e).visibility!=='hidden')L.push(r)}return L}
function CRSM_pos(d,w,h){const W=innerWidth,Hh=innerHeight,c=CRSM_car()||[W/2,Hh*.62],R=CRSM_rects(),ok=(x,y)=>!R.some(r=>x<r.right+6&&x+w>r.left-6&&y<r.bottom+6&&y+h>r.top-6);
 const xs=[d<0?c[0]-40-w:c[0]+40,d<0?c[0]-110-w:c[0]+110,d<0?W*.3-w/2:W*.7-w/2],ys=[c[1]-h-34,c[1]-h/2-60,Hh*.3,Hh*.22,Hh*.38,Hh*.14];
 for(const y of ys)for(const x of xs){const X=Math.round(Math.max(6,Math.min(W-w-6,x))),Y=Math.round(Math.max(6,Math.min(Hh-h-6,y)));if(ok(X,Y))return[X,Y]}
 return[Math.round(Math.max(6,Math.min(W-w-6,d<0?W*.3-w/2:W*.7-w/2))),Math.round(Hh*.26)]}
function CRSM_show(d,hit){let p=document.getElementById('crSmPop');if(!p){p=document.createElement('div');p.id='crSmPop';document.body.appendChild(p)}
 p.textContent=hit?(d<0?'◀◀ 💥 SMASH!':'💥 SMASH! ▶▶'):(d<0?'◀◀ SMASH!':'SMASH! ▶▶');p.classList.remove('on');p.classList.toggle('hit',!!hit);p.style.left='-999px';p.style.top='0px';
 const w=p.offsetWidth,h=p.offsetHeight,[x,y]=CRSM_pos(d,w,h);p.style.left=x+'px';p.style.top=y+'px';void p.offsetWidth;p.classList.add('on');
 document.body.classList.add('crSmOn');CRSM.pt=performance.now();CRSM.pd=d;clearTimeout(CRSM_show.t);CRSM_show.t=setTimeout(()=>{p.classList.remove('on','hit');document.body.classList.remove('crSmOn')},hit?560:520)}
function CRSM_fx(d){const a=document.getElementById(d<0?'tL':'tR');if(a){a.classList.remove('crSmF');void a.offsetWidth;a.classList.add('crSmF');clearTimeout(a._crT);a._crT=setTimeout(()=>a.classList.remove('crSmF'),380)}CRSM_show(d,false)}
// a SMASH / TAKEDOWN hit soon after the tap upgrades the side pop instead of a centre pop; any other centre pop that would
// cover the tutorial card hides the card while it shows
function CRSM_tutHide(ms){document.body.classList.add('crSmOn');clearTimeout(CRSM_show.t);CRSM_show.t=setTimeout(()=>document.body.classList.remove('crSmOn'),ms)}
hitPop=(f=>function(t,col){try{if(/SMASH|TAKEDOWN/.test(String(t))&&performance.now()-CRSM.pt<900&&(state==='roam'||state==='race')){CRSM_show(CRSM.pd,true);return}}catch(e){}
 const r=f(t,col);try{const e=document.getElementById('hitPop'),u=document.getElementById('roamTut');if(e&&u&&!u.hidden&&u.getClientRects().length){const a=e.getBoundingClientRect(),b=u.getBoundingClientRect(),cx=(a.left+a.right)/2,cy=(a.top+a.bottom)/2,w=e.offsetWidth*1.2/2+6,h=e.offsetHeight*1.2/2+6;
  if(cx-w<b.right&&cx+w>b.left&&cy-h<b.bottom&&cy+h>b.top)CRSM_tutHide(1150)}}catch(e){}return r})(hitPop);
// first-time hint above the arrows until 2 SMASHes
function CRSM_hint(){let h=document.getElementById('crSmHint');if(!h){h=document.createElement('div');h.id='crSmHint';h.textContent='TAP TAP = SMASH';document.body.appendChild(h)}
 const tl=document.getElementById('tL'),tr=document.getElementById('tR'),T=document.getElementById('touch');
 const on=CRSM.hn<2&&(state==='roam'||state==='race')&&!paused&&!!T&&!T.hidden&&!!tl&&tl.getClientRects().length>0&&!(state==='roam'&&(RO.card||RO.mapOpen||RO.story||RO.wk));
 if(!on){h.classList.remove('on');return}h.classList.add('on');const a=tl.getBoundingClientRect(),b=tr.getBoundingClientRect(),w=h.offsetWidth,hh=h.offsetHeight;
 h.style.left=Math.round(Math.max(6,Math.min(innerWidth-w-6,(a.left+b.right)/2-w/2)))+'px';h.style.top=Math.round(Math.max(6,Math.min(a.top,b.top)-hh-8))+'px'}
setInterval(()=>{try{CRSM_hint()}catch(e){}},250);
window.__crsm={get S(){return CRSM},hint:()=>CRSM_hint()};
// ---- CAR26a: races have no civilian traffic; Crash Junction keeps its (max 3) cars parked at the track edge
placeTraffic=(f=>function(c,a,b){f(c,a,b);try{if(RC&&RC.type==='junction'){c.x=c.tx=(c.i%2?1:-1)*Math.max(0,MARGIN-.6);c.v=0;c.laneT=1e9;c.crPk=1}}catch(e){}})(placeTraffic);
"""
R("window.__cr25={get cars()", JS.strip('\n')+"\nwindow.__cr25={get cars()")
# ---- (2) race traffic
R("setupTraffic(Math.min(TMAX,Math.round((cfg.traffic||0)*(TRK.traf||1))));", "setupTraffic(cfg.type==='junction'?Math.min(3,cfg.traffic||0):0);")
R("sub:'Rookie · 3 laps · light traffic'", "sub:'Rookie · 3 laps'")
R("Weave past commuters for <b>near misses</b> to fill the boost bar, then hold <b>Shift</b>.", "Boost refills as you drive (drifts and air fill it faster), then hold <b>Shift</b>.")
R("sub:'Pro · 2 laps · heavy traffic'", "sub:'Pro · 2 laps · no weapons'")
R("goal:'The skyway is packed and there are no weapons. Boost comes only from <b>near misses</b>, drifts and air. Boosting smashes traffic out of the way.'",
  "goal:'No weapons on this run. Boost refills as you drive; drifts and air fill it faster. SMASH rivals into the walls.'")
R("${c.traffic?`<span>Traffic ${c.traffic}</span>`:''}", "")
save()
print('OK')
