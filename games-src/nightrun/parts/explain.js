// PURPOSE: every fly-stage visual is explained: first-appearance captions, max 2 rings on the ship, no symbol-only text, decorative clutter cut
// FLAG: explain (?explain=0)
// TEST: explain-test.js
/* ---------- EXP (flag RET.explain, default ON; ?explain=0 = as before). Owner, 21 Oct 2026: "so many unexplainable visuals, gamer is angry and confused".
   Rule 8 of nightrun/WORKER-RULES.md; the list of every draw site and what happens to it: nightrun/VISUAL-INVENTORY.md (explain-test.js fails on a new unlisted one).
   - captions: the zonehint.js pattern (own canvas text, so the hint diet does not hide it), one at a time, each at most once per run.
   - ship: at most 2 rings round the ship per frame (the first two drawn win: the beat cue); the graze-chain arc and its "x4 +30%" text are gone (chain shows as a worded floater).
   - cut: the beat pulse bars on the four screen edges (kept only red when the hull is at 1) and the tier tint over the whole screen.
   - words: the EMP timer reads "full in 97s" (was "x~97s"), "CHAIN x4" reads "CHAIN 4". Nothing here changes play. ---------- */
if(RET.explain===undefined)RET.explain=!/[?&]explain=0/.test(location.search);
const EXP=window.EXP={get on(){return!!RET.explain;},ZT:4,shown:{},q:[],cap:null,rn:0,RMAX:2,
  TXT:{beat:'RINGS ON YOUR SHIP meet on the beat: DASH then for a PERFECT',hull:'GREEN SQUARES = your hull. Lose them all and the run ends',
    btn:'NUMBER ON A BUTTON = charges left',chain:'CHAIN: pass close to bullets without a hit for more score',
    grade:'BIG LETTER = your grade for the last 16 bars',edge:'RED SCREEN EDGES = one hull left',
    lane:'RED BAND = laser lane: leave it before it fires',supply:'GREEN RING = supply drop: fly into it',gaterun:'YELLOW RINGS: fly through them for score',
    leak:'ENEMY GOT PAST YOU: a few are free, then each costs hull',warn:'MARK AT THE TOP EDGE = danger comes in there',tell:'PINK RING ON AN ENEMY = it attacks soon: move',counter:'RED RING ON AN ENEMY = a threat: DASH or EMP beats it'},
  reset(){this.shown={};this.q=[];this.cap=null;},
  show(k,x,y,col){if(!this.on||this.shown[k]||!this.TXT[k])return false;this.shown[k]=1;this.q.push({k,x,y,col:col||'#ffe14d',t:this.ZT});return true;},
  tick(dt){if(!this.on||!G||G.dead||G.tut||G.lab||!running)return;
    if(this.cap){this.cap.t-=dt;if(this.cap.t<=0)this.cap=null;}if(!this.cap&&this.q.length&&!(window.ZH&&ZH.cap))this.cap=this.q.shift();
    const t=G.t;if(t>1.5)this.show('beat',P.x,P.y-60,'#19e3ff');if(t>7)this.show('hull',W-90,48,'#3dffb0');if(t>12)this.show('btn',W/2,H-60,'#ffffff');
    if(G.rw&&G.rw.tier>=2)this.show('chain',P.x,P.y-70,'#7dff7a');
    if(P.hp<=1&&SET.cue!=='off')this.show('edge',W/2,H/2,'#ff3040');
    const F=typeof FUN!=='undefined'?FUN:null,e=F&&F.ev;if(e&&this.TXT[e.k])this.show(e.k,e.x!=null?e.x:W/2,e.y!=null?e.y:H/2,e.k==='lane'?'#ff3050':e.k==='supply'?'#3dffb0':'#ffe14d');
    if(typeof WARN!=='undefined'&&WARN.length)this.show('warn',WARN[0].x||W/2,80,'#ff9a3d');
    if(window.RX&&RX.on)for(const q of G.en){const r=q.rx||q._rx;if(r&&r.tl>0){this.show('tell',q.x,q.y,'#ff2d78');break;}}
    if(window.CTR&&CTR.tells&&CTR.tells.length){const s=CTR.tells[0];this.show('counter',s.x||(s.e&&s.e.x)||W/2,s.y||(s.e&&s.e.y)||H/2,'#ff3040');}},
  // world text: in portrait the world canvas is turned (world +x = screen up), so the box is turned back upright like wtxt() in a.js
  box(txt,ax,ay,col,a){const rot=typeof wcv!=='undefined'&&wcv!==cv;ctx.save();ctx.globalAlpha=Math.max(0,a);ctx.font='700 13px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
    const w=Math.min((rot?H:W)-16,ctx.measureText(txt).width+22),x=rot?clamp(ax+40,22,W-22):clamp(ax,w/2+8,W-w/2-8),y=rot?clamp(ay,w/2+8,H-w/2-8):clamp(ay-40,60,H-60);
    ctx.translate(x,y);if(rot)ctx.rotate(Math.PI/2);
    ctx.fillStyle='#05030ccc';ctx.strokeStyle=col;ctx.lineWidth=1.5;ctx.beginPath();if(ctx.roundRect)ctx.roundRect(-w/2,-13,w,26,13);else ctx.rect(-w/2,-13,w,26);ctx.fill();ctx.stroke();
    ctx.fillStyle='#fff';ctx.fillText(txt,0,1,w-12);ctx.restore();},
  draw(){const c=this.cap;if(!this.on||!c)return;this.box(this.TXT[c.k],c.x,c.y,c.col,Math.min(1,c.t/.5,(this.ZT-c.t)/.3+.01));}};
NR.on('runStart',()=>EXP.reset());
NR.on('tick',dt=>{try{EXP.tick(dt);}catch(e){}});
{const dp=drawPlayer;drawPlayer=function(t){dp(t);try{EXP.draw();}catch(e){}};}
/* ship ring cap: arcs centred on the ship, radius > 18 (the hit dot and bullets are smaller), counted from the backdrop of each frame */
{const db=drawBGP;drawBGP=function(){EXP.rn=0;return db.apply(this,arguments);};
  const CP=CanvasRenderingContext2D.prototype,a0=CP.arc;CP.arc=function(x,y,r){if(RET.explain&&running&&P&&r>18&&Math.abs(x-P.x)<2&&Math.abs(y-P.y)<2&&++EXP.rn>EXP.RMAX){this.moveTo(x+r,y);return;}return a0.apply(this,arguments);};}
/* edges: only the red low-hull warning stays; tier tint off */
{const ed=FXV.edges;FXV.edges=function(t){if(!RET.explain||P.hp<=1)return ed.apply(this,arguments);if(window.POL)POL.flush();};}
NR.on('runStart',()=>{if(typeof tierGlow==='function'&&!tierGlow._x){const tg=tierGlow;tierGlow=function(c){if(!RET.explain)return tg(c);};tierGlow._x=1;}});
/* graze chain: keep the pickup highlight rings, drop the ship arc + "x4 +30%" */
if(window.RWD&&RWD.draw){const rw=RWD.draw;RWD.draw=function(t){if(!RET.explain)return rw.apply(this,arguments);if(!this.on||!G||G.dead)return;
  for(const p of G.pk){if(!p.rk||G.t-p.rkT>1.2)continue;const y=p.y+Math.sin(p.bob)*3;ctx.save();ctx.strokeStyle='#ffe14d';ctx.globalAlpha=.45+.25*Math.sin(t*10);ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(p.x,y,14,0,7);ctx.stroke();ctx.restore();}};}
{const fl=floater;floater=function(x,y,txt,c){if(RET.explain&&typeof txt==='string')txt=txt.replace(/^CHAIN x(\d)/,'CHAIN $1').replace(/^x(\d+)$/,'TIMES $1').replace(/^LEAK (\d+)\/(\d+)$/,'PAST $1 of $2').replace(/^LEAK$/,'GOT PAST');return fl(x,y,txt,c);};}
/* zonehint.js caption drawn by the same upright box */
if(window.ZH){const zd=ZH.draw;ZH.draw=function(){const c=this.cap;if(!RET.explain||!c)return zd.apply(this,arguments);if(!this.on)return;EXP.box(this.TXT[c.k],c.x,c.y-Math.min(c.r,150)+22,c.col,Math.min(1,c.t/.5,(this.ZT-c.t)/.3+.01));};}
/* leak: worded floater + caption; READY (one bar before the next wave) reads NEXT WAVE */
if(window.LEAK){const lk=LEAK.leak;LEAK.leak=function(w,e){const r=lk.apply(this,arguments);try{EXP.show('leak',40,e?e.y:H/2,'#ff6a7a');}catch(x){}return r;};
  const rm=LEAK.rdyMk;LEAK.rdyMk=function(){const e=rm.apply(this,arguments);if(RET.explain&&e){e.textContent='NEXT WAVE';e.style.letterSpacing='.08em';}return e;};}
/* grade letter: caption the first one */
if(RET.pop){const rp=RET.pop;RET.pop=function(L){rp.apply(this,arguments);try{EXP.show('grade',W/2,170,'#19e3ff');}catch(e){}};}
/* EMP timer in words */
{const st=document.createElement('style');st.textContent='html.exp #touch button#bEmp[data-t]::before{content:attr(data-t)!important;font:700 10px sans-serif!important;white-space:nowrap}';document.head.appendChild(st);
  if(RET.explain)document.documentElement.classList.add('exp');
  if(window.ABIL&&ABIL.rings){const ar=ABIL.rings;ABIL.rings=function(){const r=ar.apply(this,arguments);if(RET.explain){const e=$('bEmp'),v=e&&e.getAttribute('data-t');if(v&&/~/.test(v))e.setAttribute('data-t',v.replace(/^x?~?(\d+)s$/,'full in $1s'));}return r;};}}
