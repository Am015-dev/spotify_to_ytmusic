// PURPOSE: a flight stage does not start until its ship sheets, backdrop and song are ready (one short loading veil, 8 s at most)
// FLAG: preload (?preload=0 = the old behaviour: the stage starts at once and pictures and the song arrive while you fly)
// TEST: qa/preload-test.js
/* ---------- PRELOAD (owner, 23 Oct 2026: "stages play without loading assets, game music is not playing, some assets are not shown").
   startStory(n) is held back until what the first ~20 s need is decoded: the player's ship sheets, the enemy sheets of the stage's first waves, the district backdrop layers (bg / ly-*),
   the shot / explosion pictures and the stage song (TR.bufs). The loads start on the tap. One veil in the look of the street's (footq.js F.hold) shows a percentage. The stage starts
   (and its song from the top, AU.startStage) when everything is ready or after 8 s at most; it then keeps loading as before. A file that failed its 3 tries (ART.err, TR.tries) does not block.
   Not used in ?sim=1 (no pictures, no audio) or with ?nomusic=1 for the song. Bosses are not waited for: they arrive late in a stage and SPR.warmBoss starts them when the district begins. ---------- */
if(RET.preload===undefined)RET.preload=!/[?&]preload=0/.test(location.search);
const PL=window.PRELOAD={on:RET.preload&&!SIM,held:0,waited:0,veil:null,last:null,limit:8000};
const picOk=n=>{if(!ART.rd||!ART.rd.has(n+'.webp')||ART.err[n])return true;return !!ART.bm[n];};         // reading ART.bm starts the load (lazyart Proxy)
const animOk=k=>{const n='anim/'+k+'-strip';if(!ART.rd||!ART.rd.has(n+'.webp')||ART.err[n])return true;return !!ART.anim(k);};
const KIND={droneLine:'drone',droneV:'drone',droneSine:'drone',chargers:'charger',turret:'turret',gate:'gate',gunship:'gunship'};
PL.needs=n=>{const d=STAGES[n-1],o=[];if(!d)return o;
  if(RET.sprites)o.push({w:2,ok:()=>!!(ART.rdOk||ART.rdFail)});   // the art list itself (render/shapes.js): without it every picture below would count as 'nothing to load'
  if(ART.rd&&RET.sprites){
    const id=shipDef().id;o.push({w:2,ok:()=>animOk('ship-'+id+'/flame')&&animOk('ship-'+id+'/death')&&picOk('spr-ship-'+id)});
    const kinds=new Set(['drone']);for(const w of (d.waves||[]).slice(0,3))if(KIND[w])kinds.add(KIND[w]);
    for(const k of kinds){const m=window.ENEMY_ART&&ENEMY_ART[k],s='ship-'+((m&&m.s)||'e'+k);o.push({w:1,ok:()=>animOk(s+'/flame')&&animOk(s+'/volley')&&animOk(s+'/death')});}
    o.push({w:2,ok:()=>['fx-shot-std','fx-muzzle','fx-hit-spark','fx-explosion-small','fx-bullet-enemy'].map(picOk).every(Boolean)});
    const nm=ART.dn[d.di];if(nm){const nr=DISTRICTS[d.di].near,port=wcv!==cv;
      o.push({w:3,ok:()=>{ART.warm(d.di);return ['bg-'+nm,'ly-far-'+nm,'ly-mid-'+nm,'ly-near-'+nr].concat(port?['bg-'+nm+'-phone','ly-phone-'+nm]:[]).map(picOk).every(Boolean);}});}}
  const info=TR.by[d.song];
  if(info&&!NOMUSIC)o.push({w:3,ok:()=>{if(TR.bufs[info.file])return true;if(TR.bad[info.file]&&(TR.tries&&TR.tries[info.file]||0)>3)return true;if(AU.a)loadTrack(d.song);return false;}});
  return o;};
PL.pct=L=>{let t=0,g=0;for(const x of L){t+=x.w;if(x.done)g+=x.w;}return t?Math.round(100*g/t):100;};
PL.ready=L=>{let ok=true;for(const x of L){if(!x.done)x.done=!!x.ok();if(!x.done)ok=false;}return ok;};
{const ss=startStory;startStory=function(n){
  if(running||!PL.on||STAGES[n-1]==null)return ss.apply(this,arguments);
  if(PL.veil)return;                                                  // a second tap while the veil is up
  const a=arguments,self=this;AU.unlock();const L=PL.needs(n);
  const song=STAGES[n-1].song,inf=TR.by[song];if(inf&&NR.lag){(NR.lag.hold||(NR.lag.hold=new Set())).add(inf.file);}   // keep the song buffered until the stage has taken it
  const go=()=>{if(!running)ss.apply(self,a);};
  if(PL.ready(L)){PL.last={n,wait:0,pct:100};return go();}
  const d=document.createElement('div');d.id='stageQ';d.setAttribute('role','status');d.style.cssText='position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:#05030c;color:#c9c3e6;font:700 16px "Share Tech Mono",monospace;letter-spacing:.12em';
  const tx=document.createElement('div'),br=document.createElement('div'),fl=document.createElement('i');br.style.cssText='width:min(320px,70vw);height:8px;margin-top:14px;border:1px solid #c9c3e6;border-radius:5px;overflow:hidden';fl.style.cssText='display:block;height:100%;width:0;background:#19e3ff;transition:width .15s';br.appendChild(fl);d.style.flexDirection='column';d.append(tx,br);
  tx.textContent='LOADING STAGE '+n+' 0%';document.body.appendChild(d);PL.veil=d;PL.held++;const t0=performance.now();
  const tick=()=>{const r=PL.ready(L),w=performance.now()-t0;tx.textContent='LOADING STAGE '+n+' '+PL.pct(L)+'%';fl.style.width=PL.pct(L)+'%';
    if(r||w>PL.limit){d.remove();PL.veil=null;PL.waited=w;PL.last={n,wait:w,pct:PL.pct(L),timeout:!r};go();}else setTimeout(tick,50);};
  setTimeout(tick,0);};}

/* W199 (owner, 24 Oct 2026: "if you are loading assets you should say so"): a small line at the bottom of the title and menus: "Loading art 34/120", then "Ready" (fades after 3 s). It counts the pictures asked for so far
   (ART.nOn) that have settled (ART.nDone); it is hidden while a stage is running. The stage veil above carries a bar. */
{const el=document.getElementById('ldLine');
  if(el){let rdy=0,hide=0;const upd=()=>{const t=ART.nOn,d=ART.nDone,busy=!ART.rdOk&&!ART.rdFail||ART.pend>0||ART.wait.length>0;
    if(running){el.classList.add('off');return;}
    if(busy){rdy=0;el.className='';el.textContent=t?'Loading art '+d+'/'+t:'Loading art';}
    else{if(!rdy)rdy=performance.now();el.textContent='Ready';el.className='ok'+(performance.now()-rdy>3000?' off':'');}};
    setInterval(upd,120);upd();}}
