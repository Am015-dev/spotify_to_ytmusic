// PURPOSE: on-foot quality: sprites preloaded before the run starts, no old mock graphics, one fixed size per character, sharp at device pixel ratio
// FLAG: none (always on)
// TEST: footq-test.js
/* ---------- FOOTQ (owner, 21 Oct 2026: "on foot I can see the old graphics before the sprites, they change size, the quality resolution is very bad").
   Flag RET.footq (default ON; ?footq=0 = the old behaviour exactly). Causes found and fixed:
   1. Sheets load lazily, so the first seconds of a run drew the old code shapes (FA.hum / FA.mac) and the flat backdrop of footart.js. Now FOOT.hold() (called by foot.js begin) preloads every on-foot sheet
      (ART.FM acts, the five street props, the ammo pickup) behind a short LOADING cover (<= 8 s, then it starts anyway) and FA.draw / F.drawX / FA.bg never draw the old shapes: a sheet that is still decoding
      draws nothing, a character with no sheet at all draws a flat labelled box (asset id), ASSET-POLICY.md.
   2. Size: one height per entity (the first non-crouch h it is drawn with, e._qh), the same for every act and frame; Kai's crouch is that height x CR (the kneeling art is cut to fill its cell, so the
      cell is drawn 0.6875 x to keep the head the same size); the landing squash is off on foot; a crouch without its own sheet borrows crouchshoot (not a squashed idle).
   3. Sharpness: art.js drawAnim measured the pre-scaled copy with the FLY canvas scale (S), so on foot a 64 px copy was blown up 3-4x; it now reads the real canvas transform of #footC. The canvas takes the
      full device pixel ratio (up to 3, was 2) and imageSmoothingQuality is high each frame. The sheets are 256 px tall: a character is never drawn from a smaller copy than its device size. ---------- */
(function(){
if(!window.FOOT||!window.FA||typeof ART==='undefined')return;   // FA.draw, FA.bg and footstage's F.drawX call FOOT.q.draw when it exists
const F=FOOT,FQ=F.q={on:true,CR:.6875,hold:null,miss:{},held:0,calls:0,keys:[]};
F.dprMax=3;
/* ----- the sheets this stage can draw ----- */
FQ.list=()=>{const k=[];for(const w in ART.FM)for(const a of ART.FM[w]._all)k.push(w+'/'+a);
  for(const p of ['car/loop','police/loop','holo/loop','beacon/loop','steam/glow'])k.push('prop-'+p);k.push('pk-ammo/spin');return k.filter(x=>ART.ANIM.s[x]);};
FQ.state=k=>{const n='anim/'+k+'-strip';if(!ART.rd||!ART.rd.has(n+'.webp'))return 'none';if(ART.err&&ART.err[n])return 'bad';return ART.anim(k)?'ok':'wait';};   // ART.anim also starts the load
FQ.ready=()=>{if(!RET.sprites)return true;if(!ART.rd||!ART.rd.size)return false;let ok=true;for(const k of FQ.list()){const s=FQ.state(k);if(s==='wait')ok=false;}return ok;};
FQ.pending=()=>FQ.list().filter(k=>FQ.state(k)==='wait');
FQ.pct=()=>{const l=FQ.list();return l.length?Math.round(100*l.filter(k=>FQ.state(k)!=='wait').length/l.length):100;};
/* ----- loading hold: returns true when it took over the start (cb runs when the sheets are ready or after 8 s) ----- */
/* only the STREET RUN button asks for it (F.ui, foot.js): FOOT.start() from code (tests, tools) still starts at once and just draws nothing for a sheet that is not decoded yet */
F.hold=cb=>{if(FQ.ready())return false;if(FQ.hold)return true;FA.init&&FA.init();
  const d=document.createElement('div');d.id='footQ';d.setAttribute('role','status');d.style.cssText='position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:#05030c;color:#c9c3e6;font:700 16px "Share Tech Mono",monospace;letter-spacing:.12em';
  d.textContent='LOADING STREET RUN 0%';document.body.appendChild(d);FQ.hold=d;FQ.held++;const t0=performance.now();
  const tick=()=>{d.textContent='LOADING STREET RUN '+FQ.pct()+'%';if(FQ.ready()||performance.now()-t0>8000){d.remove();FQ.hold=null;FQ.waited=performance.now()-t0;cb();}else setTimeout(tick,50);};setTimeout(tick,0);return true;};
/* ----- every frame: smooth, high quality ----- */
F.pre=c=>{c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';};
/* ----- one height per entity ----- */
const fix=(who,pose,h)=>{const e=ART.fE;if(!e)return h;
  if(e._qh==null)e._qh=who==='kai'&&e===F.S.P?(e.h||h):(who==='kai'&&/^crouch/.test(pose)?h/FQ.CR:h);   // Kai: his standing height (P.h); the rest: the height they are first drawn with
  return who==='kai'&&!RET.bodyscale&&(/^crouch/.test(pose)||h<e._qh*.9)?e._qh*FQ.CR:e._qh;};   // bodyscale (art.js): the crouch cell is drawn at Kai's one scale, never shrunk
FQ.fix=fix;
/* a crouch without its own sheet borrows crouchshoot (a squashed idle changed the shape) */
ART.FB.crouch=['crouchshoot','idle'];
/* ----- placeholder: a flat labelled box, only for an id that has no sheet at all (never the old mock shapes) ----- */
const box=(ctx,who,x,y,h,flip)=>{FQ.miss[who]=(FQ.miss[who]||0)+1;if(ART.ANIM.s[who+'/idle']||(ART.FM[who]&&ART.FM[who]._all.some(a=>ART.ANIM.s[who+'/'+a])))return;   // it has sheets: still decoding, draw nothing
  const w=h*.5;ctx.save();ctx.globalAlpha*=.8;ctx.fillStyle='#3a2a52';ctx.fillRect(x-w/2,y-h,w,h);ctx.strokeStyle='#19e3ff';ctx.lineWidth=2;ctx.strokeRect(x-w/2+1,y-h+1,w-2,h-2);
  if(window.phText&&window.phText()){ctx.fillStyle='#fff';ctx.font='bold 10px monospace';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(who,x,y-h/2);}ctx.restore();};
const drawSheet=(ctx,who,pose,x,y,h,flip,t)=>{FQ.calls++;h=fix(who,pose,h);if(ART.footDraw(ctx,who,pose,x,y,h,flip,t))return true;box(ctx,who,x,y,h,flip);return false;};
FQ.draw=drawSheet;
/* the callers are the owners: footart.js FA.draw / FA.bg and footstage.js F.drawX send every on-foot character through FQ.draw (sheet, a flat box when it has no sheet, never the old shapes) */
})();
