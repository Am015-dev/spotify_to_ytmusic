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
  TXT:{beat:'RINGS ON YOUR SHIP: dash when they meet = PERFECT',hull:'GREEN SQUARES = your hull. Lose them all and the run ends',
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
  box(txt,ax,ay,col,a){const rot=typeof wcv!=='undefined'&&wcv!==cv;ctx.save();ctx.globalAlpha=Math.max(0,a);
    const tf=ctx.getTransform(),u=Math.hypot(tf.a,tf.b)*(ctx.canvas.getBoundingClientRect().width/ctx.canvas.width||1),fs=Math.max(13,13/Math.max(.05,u));   // at least 13 css px on screen
    ctx.font='700 '+fs.toFixed(1)+'px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
    const maxW=Math.min((rot?H:W)-16,190/Math.max(.05,u))-fs*1.6,lines=[];let ln='';for(const wd of String(txt).split(' ')){const t=ln?ln+' '+wd:wd;if(ln&&ctx.measureText(t).width>maxW){lines.push(ln);ln=wd;}else ln=t;}if(ln)lines.push(ln);   // wrap, never squeeze
    const lh=fs*1.25,bh=lines.length*lh+fs*.7,w=Math.min((rot?H:W)-16,Math.max(...lines.map(l=>ctx.measureText(l).width))+fs*1.6);
    const m=(rot?80:104)/Math.max(.05,u),x=rot?clamp(ax+40,bh/2+m,W-bh/2-m):clamp(ax,w/2+8,W-w/2-8),y=rot?clamp(ay,w/2+m,H-w/2-m):clamp(ay-40,bh/2+m,H-bh/2-m);   // keep clear of the HUD bands on every side
    ctx.translate(x,y);if(rot)ctx.rotate(Math.PI/2);
    ctx.fillStyle='#05030ccc';ctx.strokeStyle=col;ctx.lineWidth=1.5;ctx.beginPath();if(ctx.roundRect)ctx.roundRect(-w/2,-bh/2,w,bh,Math.min(13,bh/2));else ctx.rect(-w/2,-bh/2,w,bh);ctx.fill();ctx.stroke();
    ctx.fillStyle='#fff';lines.forEach((l,i)=>ctx.fillText(l,0,(i-(lines.length-1)/2)*lh+1));ctx.restore();},
  draw(){const c=this.cap;if(!this.on||!c)return;this.box(this.TXT[c.k],c.x,c.y,c.col,Math.min(1,c.t/.5,(this.ZT-c.t)/.3+.01));}};
NR.on('runStart',()=>EXP.reset());
NR.on('tick',dt=>{try{EXP.tick(dt);}catch(e){}});
HOOK.drawPlayer(dp=>function(t){dp(t);try{EXP.draw();}catch(e){}});
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
/* ---------- review 9, fixes #2 and #5 (W134). #2: every overlay drawn in a stage has a caption id (EXP.OVL, gate overlay-test.js); the laser-fence
   beam is tinted and <= 60% alpha (fun.js). #5: one label queue near the ship (word floaters: CHAIN, PERFECT, KEEP MOVING..., one at a time, >= 0.8 s
   apart, newest of a kind wins) and captions placed in free space away from enemies, bullets and the label (EXP.spot). ---------- */
Object.assign(EXP.TXT,{fence:'RED LINES = laser fence: wait in the GREEN BOX until it has fired',hpbar:'PINK BAR BESIDE AN ENEMY = its health left',
  tough:'WHITE TICKS BESIDE AN ENEMY = a tougher one: hit it more',flank:'RED ARROW AT THE SIDE = an enemy comes in there: move away',
  still:'RED DASHED RING ON YOUR SHIP = you sat still too long: move',secret:'GOLD MARK = secret: shoot it for Neon',
  shield:'BLUE DASHED LINE = this enemy shields its leader: kill it first',bill:'RED STRIPES = falling signs: leave the red lanes',
  hail:'RED LANE MARKS = meteors fall there: leave them',rescue:'CAPSULE = rescue: shoot it open',gust:'ARROWS = wind gust: steer against it',blackout:'DARK STRIP = blackout: watch the lit rims'});
/* overlay kind (traced draw site) -> caption id; 'rule' = the stage mechanic's own caption (rule:<id>). overlay-test.js fails on an overlay kind not listed here */
EXP.OVL={'fun.js:evDraw':'ev','flavor.js:drawBill':'bill','fun.js:draw':'fence','rules.js:draw':'rule','rules.js:ring':'rule','draw.js:hpBar':'hpbar','variants.js:VAR.mark':'tough',
  'counter.js:draw':'counter','react.js:RX.over':'tell','dir.js:drawWarn':'warn','anticamp.js:draw':'flank','flankers.js:draw':'flank','ai.js:anon':'still',
  'ai.js:drawEnemy':'shield','flavor.js:drawSec':'secret','fx.js:ring':'beat','fx.js:bar':'edge','zonehint.js:draw':'rule'};
EXP.gap=0;
{const sh=EXP.show;EXP.show=function(k,x,y,col){if(/^rule:/.test(k)&&!this.TXT[k]&&window.RU){const D=RU.T[k.slice(5)];if(D)this.TXT[k]=(D.n||'').toUpperCase()+': '+(D.t||'');}return sh.call(this,k,x,y,col);};
  const tk=EXP.tick;EXP.tick=function(dt){if(!this.on||!G||G.dead||G.tut||G.lab||!running)return;
    const had=!!this.cap;this.gap=Math.max(0,this.gap-dt);if(!this.cap&&this.gap>0){const q=this.q;this.q=[];tk.call(this,dt);this.q=q.concat(this.q);}else tk.call(this,dt);   // 0.8 s between two captions
    if(had&&!this.cap)this.gap=.8;if(this.cap&&this.cap!==this._lc){this._lc=this.cap;this.cap.p=null;}
    const F=typeof FUN!=='undefined'?FUN:null;if(F&&F.fence&&F.fence.rows&&F.fence.rows.length)this.show('fence',W*.5,F.fence.gy!=null?F.fence.gy:H/2,'#ff3050');
    if(window.RU&&RU.st&&RET.rules)for(const m of RU.st.list)if(m.on){this.show('rule:'+m.id,W*.5,H*.5,(RU.T[m.id]||{}).c||'#ffe14d');break;}
    for(const e of G.en){if(e.dead)continue;if(e.max>1&&e.hp<e.max&&e.hp>0&&e.x<W-20)this.show('hpbar',e.x,e.y,'#ff3dbb');if(e.vz)this.show('tough',e.x,e.y,'#ffffff');if(e.shl&&e.lk)this.show('shield',e.x,e.y,'#19e3ff');}
    if(window.AC&&AC.tells&&AC.tells.length||window.FLK&&FLK.tells&&FLK.tells.length)this.show('flank',W*.5,H*.5,'#ff3050');
    if(typeof STILL!=='undefined'&&STILL.dg)this.show('still',P.x,P.y,'#ff3050');
    if(window.FL&&FL.set&&FL.set.k==='bill')this.show('bill',W*.5,H*.5,'#ff3050');
    if(window.FL&&FL.sec)this.show('secret',FL.sec.x,FL.sec.y,'#ffd23d');
    LBQ.tick(dt);};}
/* free space: enemies, enemy bullets and the label box are obstacles; the caption takes the candidate spot with the least overlap, nearest its anchor */
EXP.obst=function(x,y,w,h,skip){let n=0;const hit=(a,b,r)=>a+r>x&&a-r<x+w&&b+r>y&&b-r<y+h;if(G){for(const e of G.en)if(!e.dead&&hit(e.x,e.y,(e.r||14)+8))n+=100;for(const b of G.eb)if(hit(b.x,b.y,(b.r||4)+4))n++;}
  if(skip!=='lbl'&&LBQ.box){const L=LBQ.box;if(L[0]<x+w&&L[0]+L[2]>x&&L[1]<y+h&&L[1]+L[3]>y)n+=100;}if(skip!=='cap'&&EXP.cbox){const L=EXP.cbox;if(L[0]<x+w&&L[0]+L[2]>x&&L[1]<y+h&&L[1]+L[3]>y)n+=100;}return n;};
EXP.spot=function(ax,ay,bw,bh,xmin,xmax,ymin,ymax,skip){let best=null;for(const dy of[0,-90,90,-180,180,-270,270])for(const dx of[0,-110,110,-220,220]){const x=clamp(ax+dx,xmin,xmax),y=clamp(ay+dy,ymin,ymax);
    const s=EXP.obst(x-bw/2,y-bh/2,bw,bh,skip)*1e4+Math.hypot(x-ax,y-ay);if(!best||s<best[2])best=[x,y,s];}return best;};
{const bx=EXP.box;EXP.box=function(txt,ax,ay,col,a){if(!RET.explain)return bx.apply(this,arguments);const c=this.cap||{};const rot=typeof wcv!=='undefined'&&wcv!==cv;
    const tf=ctx.getTransform(),u=Math.hypot(tf.a,tf.b)*(ctx.canvas.getBoundingClientRect().width/ctx.canvas.width||1),fs=Math.max(13,13/Math.max(.05,u));ctx.save();ctx.font='700 '+fs.toFixed(1)+'px sans-serif';
    const tw=Math.min(Math.min((rot?H:W)-16,190/Math.max(.05,u)),ctx.measureText(String(txt)).width+fs*1.6),nl=Math.ceil(ctx.measureText(String(txt)).width/Math.max(1,tw-fs*1.6)+.15),bh=nl*fs*1.25+fs*.7;ctx.restore();
    const bw=rot?bh:tw,bH=rot?tw:bh,m=(rot?80:104)/Math.max(.05,u);
    if(!c.p||this.obst(c.p[0]-bw/2,c.p[1]-bH/2,bw,bH,'cap')>=100){this._u=u;const s=this.spot(rot?ax+40:ax,rot?ay:ay-40,bw,bH,rot?bw/2+m:bw/2+8,rot?Math.max(bw/2+m,Math.min(W-bw/2-m,290/Math.max(.05,u))):W-bw/2-8,rot?bH/2+m:bH/2+m,rot?H-bH/2-m:H-bH/2-m,'cap');c.p=[s[0],s[1]];if(s[2]>=1e6){this.cbox=null;if(this.cap)this.cap.t=Math.min(this.ZT,this.cap.t+1/60);return;}}
    this.cbox=[c.p[0]-bw/2,c.p[1]-bH/2,bw,bH];return bx.call(this,txt,rot?c.p[0]-40:c.p[0],rot?c.p[1]:c.p[1]+40,col,a);};
  const dr=EXP.draw;EXP.draw=function(){if(!this.cap)this.cbox=null;return dr.apply(this,arguments);};}
/* label queue: word floaters (letters, not "+100" score pops) wait their turn; the live one sits near the ship in free space */
const LBQ=window.LBQ={q:[],cur:null,last:-9,box:null,GAP:.8,
  push(x,y,txt,c){if(this.q.some(o=>o.txt===txt)||this.cur&&this.cur.txt===txt&&this.cur.l>.5)return;this.q.push({txt,c,at:G.t});if(this.q.length>3)this.q.shift();},
  tick(dt){if(this.cur&&!G.fl.includes(this.cur))this.cur=null;if(this.cur)this.cur.y=this.cur.ly;else this.box=null;this.q=this.q.filter(o=>G.t-o.at<2.5);if(!this.q.length||G.t-this.last<this.GAP)return;
    if(this.cur){G.fl=G.fl.filter(f=>f!==this.cur);this.cur=null;}const o=this.q.shift();this.last=G.t;
    const rot=typeof wcv!=='undefined'&&wcv!==cv,len=o.txt.length*9+16,bw=rot?22:len,bh=rot?len:22,s=EXP.spot(rot?P.x+70:P.x,rot?P.y:P.y-70,bw,bh,bw/2+60,rot?Math.max(bw/2+60,290/(EXP._u||.57)):W-bw/2-8,bh/2+40,H-bh/2-40,'lbl');
    const n0=G.fl.length;this.fl(s[0],s[1],o.txt,o.c);this.cur=G.fl.length>n0?G.fl[G.fl.length-1]:null;if(this.cur)this.cur.ly=s[1];this.box=[s[0]-bw/2,s[1]-bh/2,bw,bh];},
  reset(){this.q=[];this.cur=null;this.last=-9;this.box=null;}};
NR.on('runStart',()=>LBQ.reset());
{const fl=floater;floater=function(x,y,txt,c){if(RET.explain&&running&&G&&!G.tut&&!G.lab&&typeof txt==='string'&&/[A-Z]{3}/.test(txt)&&!/^\+/.test(txt)){LBQ.push(x,y,txt,c||'#ffffff');return;}return fl.apply(this,arguments);};LBQ.fl=fl;}
/* ---------- review 10 (W145), fixes #3, #9, #10, #11. Flag RET.exp10 (?exp10=0 = review-9 behaviour). Nothing here changes play.
   #3  caption budget: at most 3 captions in story stage 1, then 1 per stage, >= 20 s apart; a caption already taught to this profile (localStorage
       'mnr_exptaught') is not shown again; a caption that waits > 5 s or whose thing left the field goes to the pause screen list "WHAT'S ON SCREEN".
   #9  zonehint.js captions go through this queue (ids zh_rule / zh_boss); "+N" score pop-ups that would overlap a live one merge into it.
   #10 a caption shows only while its thing is in the field and a leader line points at it; the edge-mark caption names the side the mark is on.
   #11 hint strip: whole sentences (up to 14 words, wrapped) instead of a cut after 8 words; the power-up "TAP" chip never sits over a button. ---------- */
if(RET.exp10===undefined)RET.exp10=!/[?&]exp10=0/.test(location.search);
const EX10=window.EX10={get on(){return!!(RET.explain&&RET.exp10);},GAP:20,STALE:5,n:0,gap:0,list:[],shownAt:[],tt:null,
  ENEMY:{tell:1,counter:1,hpbar:1,tough:1,shield:1},SHIP:{beat:1,hull:1,chain:1,still:1},
  budget(){return typeof ST!=='undefined'&&ST.on&&ST.n===1?3:1;},
  taught(){if(!this.tt){try{this.tt=JSON.parse(localStorage.getItem('mnr_exptaught')||'{}')||{};}catch(e){this.tt={};}}return this.tt;},
  teach(k){this.taught()[k]=1;try{localStorage.setItem('mnr_exptaught',JSON.stringify(this.tt));}catch(e){}},
  later(k){if(!this.list.includes(k))this.list.push(k);},
  reset(){this.n=0;this.gap=0;this.list=[];this.shownAt=[];},
  inF(x,y){return x!=null&&y!=null&&x>=-4&&x<=W+4&&y>=-4&&y<=H+4;},
  live(e){return!!e&&!e.dead&&!(e.hp<=0)&&G.en.includes(e)&&this.inF(e.x,e.y);},
  /* where the thing a caption names is now (world coords), or null when it is not in the field */
  tgt(c){const k=c.k;if(this.ENEMY[k]){if(c.e)return this.live(c.e)?[c.e.x,c.e.y]:null;return this.inF(c.x,c.y)?[c.x,c.y]:null;}
    if(this.SHIP[k])return[P.x,P.y];
    if(k==='edge')return P.hp<=1?[c.x,c.y]:null;
    if(k==='grade'){const e=document.getElementById('retPop');return e&&e.classList.contains('on')?[c.x,c.y]:null;}
    if(k==='warn'){const w=typeof WARN!=='undefined'&&WARN[0];return w?[w.x,w.kind==='rain'?16:w.side<0?8:H-8]:null;}
    if(k==='fence'){const F=typeof FUN!=='undefined'&&FUN.fence;return F&&F.rows&&F.rows.length?[c.x,c.y]:null;}
    if(k==='flank')return window.AC&&AC.tells&&AC.tells.length||window.FLK&&FLK.tells&&FLK.tells.length?[c.x,c.y]:null;
    if(k==='bill')return window.FL&&FL.set&&FL.set.k==='bill'?[c.x,c.y]:null;
    if(k==='secret')return window.FL&&FL.sec&&this.inF(FL.sec.x,FL.sec.y)?[FL.sec.x,FL.sec.y]:null;
    if(/^rule:/.test(k)){const id=k.slice(5);return window.RU&&RU.st&&RU.st.list.some(m=>m.id===id&&m.on)?[c.x,c.y]:null;}
    if(k==='zh_rule'){if(!(window.RU&&RU.st))return null;for(const m of RU.st.list)if(m.id==='well'&&m.on&&m.o&&m.o.w&&m.o.w.length){const w=RU.T.well.pos(m,m.o.w[0],0);return[w.x,w.y];}return null;}
    if(k==='zh_boss'){if(!(window.BMV&&BMV.hz&&G.boss))return null;for(const z of BMV.hz)if(z.s==='well')return[z.x,z.y];return null;}
    const F=typeof FUN!=='undefined'?FUN:null;if(F&&/^(lane|supply|gaterun|hail|rescue|gust|blackout)$/.test(k)){const e=F.ev;return e&&e.k===k?[e.x!=null?e.x:c.x,e.y!=null?e.y:c.y]:null;}
    return[c.x,c.y];},
  /* the screen side a world point is nearest to (portrait: the world is turned, world +x = screen up) */
  side(x,y){const rot=typeof wcv!=='undefined'&&wcv!==cv,d=rot?{TOP:W-x,BOTTOM:x,LEFT:y,RIGHT:H-y}:{TOP:y,BOTTOM:H-y,LEFT:x,RIGHT:W-x};let b='TOP';for(const s in d)if(d[s]<d[b])b=s;return b;}};
Object.assign(EXP.TXT,{zh_rule:'PURPLE RING = gravity well: bends shots, no damage',zh_boss:'PURPLE RING = gravity well: it pulls your ship, thrust away',
  warn:'MARK AT THE %SIDE% EDGE = danger comes in there',hull:'GREEN SQUARES OVER YOUR SHIP = your hull. Lose them all and the run ends'});
NR.on('runStart',()=>EX10.reset());
/* capture the enemy a caption names, so the caption follows it and ends with it */
{const sh=EXP.show;EXP.show=function(k,x,y,col){const was=this.shown[k],r=sh.apply(this,arguments);
  if(r&&!was&&EX10.on&&EX10.ENEMY[k]&&G){const c=this.q[this.q.length-1];if(c&&c.k===k){let b=null,bd=1e9;for(const e of G.en){const d=Math.abs(e.x-x)+Math.abs(e.y-y);if(!e.dead&&d<bd){bd=d;b=e;}}if(b&&bd<4)c.e=b;}}
  return r;};}
{const tk=EXP.tick;EXP.tick=function(dt){if(!EX10.on)return tk.apply(this,arguments);if(!this.on||!G||G.dead||G.tut||G.lab||!running)return;
  EX10.gap=Math.max(0,EX10.gap-dt);const T=EX10.taught();
  this.q=this.q.filter(c=>{c.age=(c.age||0)+dt;if(T[c.k]||c.age>EX10.STALE||!EX10.tgt(c)){EX10.later(c.k);return false;}return true;});
  this.q.sort((a,b)=>(T[a.k]?1:0)-(T[b.k]?1:0));
  const shut=EX10.gap>0||EX10.n>=EX10.budget(),had=this.cap,z=window.ZH&&ZH.cap;if(z)ZH.cap=null;   // zonehint captions are in this queue now: its own box never blocks it
  try{if(shut){const q=this.q;this.q=[];tk.call(this,dt);this.q=q.concat(this.q);}else tk.call(this,dt);}finally{if(z&&window.ZH&&!ZH.cap)ZH.cap=z;}
  const c=this.cap;if(c&&c!==had&&!c._x){c._x=1;EX10.n++;EX10.gap=EX10.GAP;EX10.teach(c.k);EX10.later(c.k);EX10.shownAt.push({k:c.k,t:G.t});}
  if(c&&!EX10.tgt(c)){this.cap=null;this.cbox=null;}};}   // its thing left the field: the caption goes with it (it is in the pause list)
/* draw: the side word, then a leader line from the box to the thing */
{const dr=EXP.draw;EXP.draw=function(){const c=this.cap;if(!EX10.on||!c)return dr.apply(this,arguments);const p=EX10.tgt(c);if(!p)return;
  const t0=this.TXT[c.k];if(/%SIDE%/.test(t0))this.TXT[c.k]=t0.replace('%SIDE%',EX10.side(p[0],p[1]));
  try{dr.apply(this,arguments);}finally{this.TXT[c.k]=t0;}
  const b=this.cbox;if(!b)return;const qx=clamp(p[0],b[0],b[0]+b[2]),qy=clamp(p[1],b[1],b[1]+b[3]),d=Math.hypot(p[0]-qx,p[1]-qy);if(d<14)return;
  const a=Math.max(0,Math.min(1,c.t/.5,(this.ZT-c.t)/.3+.01)),ux=(p[0]-qx)/d,uy=(p[1]-qy)/d,ex=p[0]-ux*10,ey=p[1]-uy*10;
  ctx.save();ctx.globalAlpha=a*.9;ctx.strokeStyle=c.col;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(qx,qy);ctx.lineTo(ex,ey);ctx.stroke();ctx.fillStyle=c.col;ctx.fillRect(ex-2.5,ey-2.5,5,5);ctx.restore();};}
EXP.leader=1;
/* #9 zonehint: the first well of a stage asks this queue; ZH keeps its state (done / cap) for its own test, its own box is not drawn */
if(window.ZH){const zs=ZH.start;ZH.start=function(k,x,y,r,col){const d=this.done[k];zs.apply(this,arguments);if(EX10.on&&!d)EXP.show('zh_'+k,x,y,col);};
  const zd=ZH.draw;ZH.draw=function(){if(EX10.on)return;return zd.apply(this,arguments);};}
/* #9 score pop-ups: a "+N" that would sit on a live "+M" (same 0.3 s or still overlapping) adds into it */
{const fl=floater;floater=function(x,y,txt,c){if(!EX10.on||!running||!G||typeof txt!=='string'||!/^\+\d+$/.test(txt))return fl.apply(this,arguments);
  for(const f of G.fl)if(f._sp&&f.l>.25&&(G.t-f._sp<.3&&Math.hypot(f.x-x,f.y-y)<90||Math.abs(f.x-x)<(f.txt.length+txt.length)*5+8&&Math.abs(f.y-y)<22)){f.txt='+'+((+f.txt.slice(1)||0)+(+txt.slice(1)||0));f.l=Math.max(f.l,.8);return;}
  const n=G.fl.length;fl.apply(this,arguments);if(G.fl.length>n)G.fl[G.fl.length-1]._sp=G.t;};}
if(RET.nolist===undefined)RET.nolist=!/[?&]nolist=0/.test(location.search);   // owner 22 Oct: pause-screen text list removed (unreadable wall of text)
/* pause screen: WHAT'S ON SCREEN, every caption of this run (shown or waiting) in plain words */
{const pm=document.getElementById('pausem');if(pm){const put=()=>{if(pm.hidden)return;let d=document.getElementById('expList');const L=EX10.on?EX10.list.filter(k=>EXP.TXT[k]):[];
    if(!L.length||RET.nolist!==false){if(d)d.hidden=true;return;}const inn=pm.querySelector('.in')||pm;
    if(!d){d=document.createElement('div');d.id='expList';d.style.cssText='max-width:min(92vw,420px);margin:8px auto;text-align:left;font:600 13px/1.35 sans-serif;color:#e9e6ff;background:#05030cf2;border:1px solid #19e3ff66;border-radius:10px;padding:8px 12px;max-height:38vh;overflow:auto;overflow-wrap:anywhere';inn.appendChild(d);}
    d.hidden=false;d.innerHTML='';const h=document.createElement('div');h.textContent="WHAT'S ON SCREEN";h.style.cssText='font-weight:800;letter-spacing:.06em;color:#19e3ff;margin-bottom:4px';d.appendChild(h);
    for(const k of L){const r=document.createElement('div');r.textContent=EXP.TXT[k].replace('%SIDE%','SIDE');r.style.margin='3px 0';d.appendChild(r);}};
  new MutationObserver(put).observe(pm,{attributes:true,attributeFilter:['hidden']});EX10.pauseList=put;}}
/* #11 hint strip: keep the whole sentence (HINT.draw wraps it); only a text over 14 words is cut, at its last ':' or '.' */
if(window.HINT){const so=HINT.short;HINT.short=function(s){if(!EX10.on)return so.apply(this,arguments);const w=String(s==null?'':s).trim().split(/\s+/).filter(Boolean);if(w.length<=14)return w.join(' ');
  const t=w.slice(0,14).join(' '),i=Math.max(t.lastIndexOf(': '),t.lastIndexOf('. '));return i>8?t.slice(0,i):so.apply(this,arguments);};}
if(window.ABIL&&ABIL.tip){const tp=ABIL.tip,SH={'EMP spends all charges: hold 3 for the big burst':'EMP uses every charge: wait for 3 = big burst','Crowded screen: EMP x3 now':'Crowded screen: use EMP now (3 charges)'};
  ABIL.tip=function(t){return tp.call(this,EX10.on&&SH[t]||t);};}
/* #11 the power-up chip ("TAP: use SLOW now") moves to the first spot that covers no button and stays on screen */
EX10.chip=function(){const b=document.getElementById('bPwr'),cp=b&&b.querySelector('.cp');if(!cp||!b.classList.contains('cap'))return;
  const bs=[...document.querySelectorAll('#touch button')].filter(x=>x!==b&&x.offsetParent).map(x=>x.getBoundingClientRect()).filter(r=>r.width&&r.height);
  const S=[['calc(100% + 20px)','0','auto','auto'],['calc(100% + 20px)','auto','auto','0'],['auto','calc(100% + 8px)','0','auto'],['auto','auto','0','calc(100% + 8px)'],['auto','0','calc(100% + 8px)','auto'],['calc(100% + 64px)','0','auto','auto']];
  const fit=()=>{const r=cp.getBoundingClientRect();if(r.left<2||r.top<2||r.right>innerWidth-2||r.bottom>innerHeight-2)return false;return!bs.some(q=>q.left<r.right&&q.right>r.left&&q.top<r.bottom&&q.bottom>r.top);};
  if(cp._s!=null){const s=S[cp._s];cp.style.bottom=s[0];cp.style.right=s[1];cp.style.top=s[2];cp.style.left=s[3];if(fit())return;}
  for(let i=0;i<S.length;i++){const s=S[i];cp.style.bottom=s[0];cp.style.right=s[1];cp.style.top=s[2];cp.style.left=s[3];if(fit()){cp._s=i;return;}}cp._s=null;};
NR.on('tick',()=>{try{if(EX10.on)EX10.chip();}catch(e){}});
EX10.probe={dims:()=>({W,H,rot:typeof wcv!=='undefined'&&wcv!==cv}),pop:(x,y,t)=>floater(x,y,t),fl:()=>G.fl};   // for explain-test.js
/* review 10: a word label that an enemy flies into moves to the next free spot (it was placed once and stayed under a flanker) */
{const lt=LBQ.tick;LBQ.tick=function(dt){lt.apply(this,arguments);if(!EX10.on||!this.cur||!this.box)return;const b=this.box;if(EXP.obst(b[0],b[1],b[2],b[3],'lbl')<100)return;
  const rot=typeof wcv!=='undefined'&&wcv!==cv,bw=b[2],bh=b[3],s=EXP.spot(this.cur.x,this.cur.ly,bw,bh,bw/2+60,rot?Math.max(bw/2+60,290/(EXP._u||.57)):W-bw/2-8,bh/2+40,H-bh/2-40,'lbl');
  if(s[2]>=1e6){G.fl=G.fl.filter(f=>f!==this.cur);this.cur=null;this.box=null;return;}this.cur.x=s[0];this.cur.ly=this.cur.y=s[1];this.box=[s[0]-bw/2,s[1]-bh/2,bw,bh];};}
