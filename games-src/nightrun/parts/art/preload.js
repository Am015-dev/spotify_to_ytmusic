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
/* W242: while the stage veil is up, pictures the first seconds cannot show (boss sheets, weapon mounts and fusions, the other pictures read by the hangar) are not asked for: on HTTP/1.1 they queue in front of the ship sheets
   that the veil waits for. They are not marked as loading, so the next read of them (the first frame after the veil) starts them as before. */
{const ld=ART.load,LATE=/boss|wpmount|^wp-|fuse|-armed|^foot\/|nv-ev|^char-/;ART.load=function(n,q){if(PL.veil&&!q&&LATE.test(n))return;return ld.apply(this,arguments);};}
PL.needs=n=>{const d=STAGES[n-1],o=[];if(!d)return o;
  if(RET.sprites)o.push({w:2,ok:()=>!!(ART.rdOk||ART.rdFail)});   // the art list itself (render/shapes.js): without it every picture below would count as 'nothing to load'
  if(ART.rd&&RET.sprites){
    const id=shipDef().id;o.push({w:2,ok:()=>animOk('ship-'+id+'/flame')&&picOk('spr-ship-'+id)});
    /* W242 (owner 25 Oct 2026: "unplayable", 6 MB budget before the first frame): the ship, its shots and the backdrop are waited for; the enemy sheets (the first wave comes after ~3 s) and the death sheet are only STARTED here and join as they arrive */
    animOk('ship-'+id+'/death');
    const kinds=new Set(['drone']);for(const w of (d.waves||[]).slice(0,3))if(KIND[w])kinds.add(KIND[w]);
    for(const k of kinds){const m=window.ENEMY_ART&&ENEMY_ART[k],s='ship-'+((m&&m.s)||'e'+k);animOk(s+'/flame');animOk(s+'/volley');animOk(s+'/death');}
    o.push({w:2,ok:()=>['fx-shot-std','fx-muzzle','fx-hit-spark'].map(picOk).every(Boolean)});
    const nm=ART.dn[d.di];if(nm){const nr=DISTRICTS[d.di].near,port=wcv!==cv;
      o.push({w:3,ok:()=>{ART.warm(d.di);return ['bg-'+nm,'ly-far-'+nm,'ly-mid-'+nm,'ly-near-'+nr].concat(port?['bg-'+nm+'-phone','ly-phone-'+nm]:[]).map(picOk).every(Boolean);}});}}
  return o;};   // W242: the stage song is not waited for: it is asked for on the tap (startStory below) and joins on a bar line when it has arrived (the beat grid runs silently until then)
PL.pct=L=>{let t=0,g=0;for(const x of L){t+=x.w;if(x.done)g+=x.w;}return t?Math.round(100*g/t):100;};
PL.ready=L=>{let ok=true;for(const x of L){if(!x.done)x.done=!!x.ok();if(!x.done)ok=false;}return ok;};
{const ss=startStory;startStory=function(n){
  if(running||!PL.on||STAGES[n-1]==null)return ss.apply(this,arguments);
  if(PL.veil)return;                                                  // a second tap while the veil is up
  const a=arguments,self=this;AU.unlock();const L=PL.needs(n);if(!NOMUSIC&&AU.a&&TR.by[STAGES[n-1].song])setTimeout(()=>loadTrack(STAGES[n-1].song),0);
  const song=STAGES[n-1].song,inf=TR.by[song];if(inf&&NR.lag){(NR.lag.hold||(NR.lag.hold=new Set())).add(inf.file);}   // keep the song buffered until the stage has taken it
  const go=()=>{if(!running)ss.apply(self,a);};
  if(PL.ready(L)){PL.last={n,wait:0,pct:100};return go();}
  const d=document.createElement('div');d.id='stageQ';d.setAttribute('role','status');d.style.cssText='position:fixed;inset:0;z-index:9999;display:flex;flex-direction:column;gap:12px;align-items:center;justify-content:center;background:#05030c;color:#c9c3e6;font:700 16px "Share Tech Mono",monospace;letter-spacing:.12em';
  const tx=document.createElement('span'),br=document.createElement('i');br.style.cssText='display:block;width:min(60vw,260px);height:4px;border-radius:2px;background:#ffffff1c;overflow:hidden;background-image:linear-gradient(#19e3ff,#19e3ff);background-repeat:no-repeat;background-size:0% 100%';d.append(tx,br);   // W242: slim progress bar under the word
  const put=()=>{tx.textContent='LOADING STAGE '+n+' '+PL.pct(L)+'%';br.style.backgroundSize=PL.pct(L)+'% 100%';};tx.textContent='LOADING STAGE '+n+' 0%';document.body.appendChild(d);PL.veil=d;PL.held++;const t0=performance.now();
  const tick=()=>{const r=PL.ready(L),w=performance.now()-t0;put();
    if(r||w>PL.limit){d.remove();PL.veil=null;PL.waited=w;PL.last={n,wait:w,pct:PL.pct(L),timeout:!r};go();}else setTimeout(tick,50);};
  setTimeout(tick,0);};}
