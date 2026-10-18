// scale-1 (2026-10-18): adaptive quality governor for Graphics = Auto (the default). One ladder, reusing what exists:
// render scale (DRES.s) 1 → .85 → .7, then the LK tier (high → med → low → min: shadows, AO, draw distance, density).
// Down: frame-interval p90 > 22 ms in 3 one-second buckets in a row. Up: interval p90 < 18 ms (no missed vsync) AND busy p90 < 12 ms for 10 buckets.
// (On a 60 Hz screen the rAF interval never goes below 16.7 ms, so "under 12 ms" is judged on the frame's own work time.)
// Hysteresis: 22/12 ms gap, 2 s settle after every step, and an up step that has to be undone within 20 s doubles the next up wait (10 → 20 → 40 → 80 s).
// Manual Graphics (Low/Medium/High) = no governor; the old Auto resolution switch still works there. First 5 s after boot / loading are ignored.
const GOV={on:false,s:1,d:0,top:0,ring:[],busy:[],bk:0,bad:0,good:0,hold:0,upW:10,lastUp:-1e9,clock:0,warm:0,t0:0,log:[],test:null,mid:0,last:null,upW0:10,half:null,th:{dn:22,upP:18,upB:12}};
const GOV_S=[1,.85,.7];
// touch (coordinator, 2026-10-18: "not playable even on a fast phone"): START LOW and climb only when proven smooth. Boot at render scale .7, DPR ≤ 1.5 (resize),
// the min tier (no shadows/AO, bloom and MSAA off, shortest draw distance, low-tier culling), traffic and pedestrians at half; up after 5 s of work p90 < 14 ms. PC keeps start-high + step-down.
function GOV_touchBoot(){GOV.s=.7;GOV.d=3;GOV.th.upB=14;GOV.upW0=5;if(!GOV.half){GOV.half={traf:TUNE.traf,lvPed:TUNE.lvPed};TUNE.traf=(TUNE.traf??1)*.5;TUNE.lvPed=(TUNE.lvPed??.8)*.5}}
function GOV_boot(){if(lowGfx){GOV_touchBoot();return}const g=TQ?null:store.get('mho_gov',null);GOV.s=g&&GOV_S.includes(g.s)?g.s:1;GOV.d=g&&g.d>=0&&g.d<=3?g.d|0:LK_LV.indexOf(SET_DEF.q)}
function GOV_apply(why){DRES.s=GOV.s;LK.userQ='high';LK.drop=GOV.d;LK_apply();resize();if(why&&!TQ)try{store.set('mho_gov',{s:GOV.s,d:GOV.d})}catch(e){}}
function GOV_lvl(){return{s:GOV.s,q:LK_LV[Math.min(3,GOV.d)],pr:+renderer.getPixelRatio().toFixed(2)}}
function GOV_reset(){GOV.ring.length=GOV.busy.length=0;GOV.bk=GOV.bad=GOV.good=0}
function GOV_step(dir){const n=GOV_S.indexOf(GOV.s);let ch=false;
  if(dir<0){if(n<GOV_S.length-1){GOV.s=GOV_S[n+1];ch=true}else if(GOV.d<3){GOV.d++;ch=true}
    if(ch&&GOV.clock-GOV.lastUp<20000)GOV.upW=Math.min(GOV.upW0*8,GOV.upW*2)}   // the last up step did not hold: wait longer before trying again
  else{if(GOV.d>0){GOV.d--;ch=true}else if(n>0){GOV.s=GOV_S[n-1];ch=true}if(ch)GOV.lastUp=GOV.clock}
  if(!ch)return false;GOV.log.push([dir<0?'down':'up',Math.round(GOV.clock/1000),GOV.s,LK_LV[GOV.d]]);if(GOV.log.length>40)GOV.log.shift();GOV_apply(1);GOV_reset();GOV.hold=2000;return true}
const _gp=(a,k)=>{const b=a.slice().sort((x,y)=>x-y);return b[Math.min(b.length-1,Math.floor(b.length*k))]||0};
// one frame: ms = rAF interval, busy = that frame's own work time (sim + render submit)
function GOV_feed(ms,busy){if(!GOV.on)return;GOV.clock+=ms;
  if(paused||document.hidden||LD.on||!(state==='roam'||state==='race'||state==='countdown')||ms>250||ms<=0){GOV.warm=0;GOV_reset();return}
  if((GOV.warm+=ms)<5000)return;if(GOV.hold>0){GOV.hold-=ms;return}
  GOV.ring.push(ms);GOV.busy.push(busy);if((GOV.bk+=ms)<1000)return;
  const p90=_gp(GOV.ring,.9),b90=_gp(GOV.busy,.9),med=_gp(GOV.ring,.5),p10=_gp(GOV.ring,.1);GOV.last={p90:+p90.toFixed(1),b90:+b90.toFixed(1),n:GOV.ring.length};GOV.ring.length=GOV.busy.length=0;GOV.bk=0;
  if(Math.abs(med-33.3)<3&&p90-p10<4&&b90<20){GOV.bad=GOV.good=0;return}   // a steady 30 fps with idle work is the iOS low-power cap, not the GPU
  const H=GOV.th;if(p90>H.dn){GOV.good=0;if(++GOV.bad>=3)GOV_step(-1)}
  else if(p90<H.upP&&b90<H.upB){GOV.bad=0;if(++GOV.good>=GOV.upW)GOV_step(1)}
  else{GOV.bad=0;GOV.good=0}}
function GOV_set(on){GOV.on=on;GOV.warm=0;GOV.hold=0;GOV_reset();if(on){GOV.upW=GOV.upW0;GOV_apply(0)}}
// Settings → Graphics: Auto | Low | Medium | High (SET.qm). Manual = that tier, LK auto-drop off, render scale back to 1 unless Auto resolution is on.
function GOV_pick(){if(SET.qm==='auto'){GOV_set(true);return}GOV.on=false;LK.userQ=null;LK.effQ=null;LK.drop=0;DRES.s=1;SET.q=SET.qm;applyQuality()}
{const _ds=dresStep;dresStep=ms=>{_ds(ms);GOV.mid=ms}}
{const _fr=frame;frame=function(now){const a=performance.now();GOV.mid=-1;_fr(now);if(GOV.mid>=0){const tl=GOV.test&&GOV.test.iters;if(tl){let x=0;for(let i=0;i<tl;i++)x+=Math.sqrt(i);GOV.test.x=x}GOV_feed(GOV.mid,performance.now()-a)}}}
if(TQ&&!/[?&]gov=1/.test(location.search))SET.qm=SET.q;else if(SET.qm==='auto'){GOV_boot();GOV_set(true)}else if(SET.qm&&SET.qm!==SET.q)GOV_pick();
window.__gov={GOV,lvl:GOV_lvl,set:GOV_set,step:GOV_step,feed:(ms,busy,n)=>{for(let i=0;i<(n||1);i++)GOV_feed(ms,busy)},pick:GOV_pick};
// scale-1 viewport: portrait shrinks the pedal buttons to .78 (00_page.html), so their 15 px labels read 11.7 px: 16 px keeps them ≥ 12 px; the radio line (#npcSay p) had two 11 px rules → 12 px
{const st=document.createElement('style');st.textContent='@media (orientation:portrait){html body.touch #touch :is(#tB,#tN,#tD,#tF,#tG){font-size:16px!important}}#npcSay#npcSay p{font-size:12px!important}';document.head.appendChild(st)}
