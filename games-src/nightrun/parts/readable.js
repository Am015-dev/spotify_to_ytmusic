/* ---------- readable.js (F5, REVIEW-2026-10-18): bullets and threats readable at a glance. Flag RET.read; ?read=0 = the old look exactly.
   1. In play only (running), the city backdrop (bg.js drawBG / drawBGP) is desaturated and dimmed to about 55% by one overlay (hook in c.js render); menus are unchanged.
      The beat pulse on the screen edges stays, a little lower (READ.PULSE, hook in fx.js FXV.edges).
   2. ONE danger hue (READ.D, hot pink) with a white core and a thin dark outline ring is reserved for enemy bullets and enemy-fire hazards (orbs, needles, shells,
      rockets, homing rings, zoo mines and aim lines, on-foot enemy shots). Real pictures keep their picture and only get the outline ring.
      Player shots are cool cyan / blue-white at about 70% alpha (READ.pc); pickups and power-ups never use the danger hue (READ.UP, READ.NOVA).
   3. A small hitbox dot (white core, dark ring, at least ~5 screen px wide) sits on the ship: Settings > Assist 'Show hitbox' (SET.hbox, default on).
   4. Telegraphs (zoo aim lines, sniper beam, bomb rings, mines, boss laser tells) are drawn on a dark halo.
   Hit sizes, bullet counts, caps and damage are untouched: only colours, outlines and alpha change. 'High-contrast bullets' (SET.hc) and 'Big bullets' still work on top:
   hc adds a white halo outside the dark ring and dims the backdrop a little more. Reduced motion: nothing here pulses. readable-test.js checks it. ---------- */
if(RET.read===undefined)RET.read=!/[?&]read=0/.test(location.search);
if(SET.hbox===undefined)SET.hbox=true;
const READ=window.READ={D:'#ff2d78',CORE:'#ffffff',RING:'#07030f',SHOT:'#7fe6ff',SHOT2:'#e6f8ff',UP:'#b48cff',NOVA:'#f0b4ff',
  DIM:.45,DIMHC:.52,SAT:.6,PULSE:.7,stat:{dim:0,dot:0,eb:0,halo:0},_pc:{},_ppu:0,_pf:0,
  /* 1. the backdrop overlay: desaturate, then darken. w,h = the backdrop's own units (W,H landscape; PW_,PH_ portrait) */
  dim(w,h){if(!RET.read||!running)return;ctx.save();ctx.globalAlpha=this.SAT;ctx.globalCompositeOperation='saturation';ctx.fillStyle='#808080';ctx.fillRect(-40,-40,w+80,h+80);
    ctx.globalCompositeOperation='source-over';ctx.globalAlpha=SET.hc?this.DIMHC:this.DIM;ctx.fillStyle='#000';ctx.fillRect(-40,-40,w+80,h+80);ctx.restore();this.stat.dim++;},
  pulse(){return RET.read&&running?this.PULSE:1;},
  /* 2. a player shot's colour: cool colours stay, warm ones (and the danger hue) turn cyan; big / perfect shots blue-white */
  hue(c){let q=this._pc[c];if(q)return q;const m=/^#([0-9a-f]{6})/i.exec(c||'');if(!m)return this._pc[c]={h:0,s:0,l:1};const v=parseInt(m[1],16),r=(v>>16)/255,g=(v>>8&255)/255,b=(v&255)/255,
      mx=Math.max(r,g,b),mn=Math.min(r,g,b),d=mx-mn;let h=0;if(d){h=mx===r?((g-b)/d)%6:mx===g?(b-r)/d+2:(r-g)/d+4;h=(h*60+360)%360;}return this._pc[c]={h,s:mx?d/mx:0,l:mx};},
  pc(b,D){const c=b.col||(b.big?'#ffffff':b.pf?'#ffe14d':b.ec?'#c08aff':D.b),o=this.hue(c);if(o.s<.25&&o.l>.7)return this.SHOT2;
    return o.h>=160&&o.h<=285?c:(b.big||b.pf?this.SHOT2:this.SHOT);},
  ring(x,y,r,w){ctx.strokeStyle=this.RING;ctx.lineWidth=w||2.4;ctx.globalAlpha=.9;ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.stroke();ctx.globalAlpha=1;},
  /* every enemy bullet (replaces fx.js FXV.bullets + the ai.js kinds while RET.read is on) */
  bullets(){const L=G.eb;this.stat.eb=L.length;if(!L.length)return;const hc=SET.hc||RET.asBigOn(),bg=RET.asBigOn()?1.35:1,D=this.D,rm=SET.reduce;
    ctx.save();ctx.globalCompositeOperation='lighter';for(const b of L)G_(b.x,b.y,b.r*3*bg,D,b.k?.35:.5);ctx.globalCompositeOperation='source-over';
    const pb=ART.have('fx-bullet-enemy')&&ART.hue('fx-bullet-enemy',15,-92);          // the painted orb, turned from lime to pink (kept as a picture)
    for(const [col,k] of hc?[['#ffffff',1.75],[this.RING,1.42],[D,1],[this.CORE,.45]]:[[this.RING,1.3],[D,.95],[this.CORE,.42]]){
      ctx.fillStyle=col;ctx.beginPath();for(const b of L){if(b.k)continue;const r=b.r*k*bg;ctx.moveTo(b.x+r,b.y);ctx.arc(b.x,b.y,r,0,7);}ctx.fill();
      if(pb&&col===D){ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.55;for(const b of L){if(b.k)continue;const w=b.r*3*bg;ctx.drawImage(pb.c,b.x-w/2,b.y-w/2,w,w*pb.h/pb.w);}ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';}}
    for(const b of L){if(b.k||!(b.hm>0))continue;if(ART.have('fx-orb-homing')){const o=ART.bm['fx-orb-homing'],w=b.r*3.6;this.ring(b.x,b.y,w*.42,2);ctx.globalCompositeOperation='lighter';ctx.drawImage(o,b.x-w/2,b.y-w/2,w,w);ctx.globalCompositeOperation='source-over';continue;}
      this.ring(b.x,b.y,b.r+5.2,2.4);ctx.strokeStyle='#ffffff';ctx.lineWidth=1.6;ctx.globalAlpha=.9;ctx.beginPath();ctx.arc(b.x,b.y,b.r+3.5,0,7);ctx.stroke();ctx.globalAlpha=1;}
    for(const b of L){if(!b.k)continue;const a=Math.atan2(b.vy,b.vx),ca=Math.cos(a),sa=Math.sin(a),r=b.r*bg;
      if(b.k==='n'){if(ART.have('fx-bullet-needle')){const o=ART.sp('fx-bullet-needle',b.r*2*3.2);if(o){this.ring(b.x,b.y,r*2.2,2);ctx.save();ctx.translate(b.x,b.y);ctx.rotate(a);ctx.globalCompositeOperation='lighter';ctx.drawImage(o.c,-o.w*.85,-o.h*.28,o.w*1.7,o.h*.56);ctx.restore();continue;}}
        ctx.lineCap='round';const seg=(w,c,l0,l1)=>{ctx.strokeStyle=c;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(b.x-ca*l0,b.y-sa*l0);ctx.lineTo(b.x+ca*l1,b.y+sa*l1);ctx.stroke();};
        if(hc)seg(r*3.1,'#ffffff',10,6);seg(r*2.3,this.RING,9.5,5.5);seg(r*1.3,D,8,4);seg(r*.55,this.CORE,6,3);}
      else if(b.k==='s'){if(ART.have('fx-bullet-shell')){const o=ART.sp('fx-bullet-shell',b.r*2*1.9);if(o){this.ring(b.x,b.y,o.w*.5+1.5,2.6);ctx.save();ctx.globalCompositeOperation='lighter';ctx.drawImage(o.c,b.x-o.w/2,b.y-o.h/2,o.w,o.h);ctx.restore();continue;}}
        const pu=rm?.5:.5+.5*Math.sin(G.t*9+b.x*.05);if(hc){ctx.fillStyle='#ffffff';ctx.beginPath();ctx.arc(b.x,b.y,r+5,0,7);ctx.fill();}
        ctx.fillStyle=this.RING;ctx.beginPath();ctx.arc(b.x,b.y,r+3,0,7);ctx.fill();ctx.fillStyle=D;ctx.beginPath();ctx.arc(b.x,b.y,r,0,7);ctx.fill();
        ctx.fillStyle=this.CORE;ctx.beginPath();ctx.arc(b.x,b.y,r*(.42+.12*pu),0,7);ctx.fill();ctx.strokeStyle='#fff';ctx.globalAlpha=.75;ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(b.x,b.y,r+5.5,0,7);ctx.stroke();ctx.globalAlpha=1;}
      else if(b.k==='r'){if(ART.have('fx-bullet-rocket')){const o=ART.bm['fx-bullet-rocket'],w=b.r*5;this.ring(b.x,b.y,w*.45,2.4);ctx.save();ctx.translate(b.x,b.y);ctx.rotate(a);ctx.globalCompositeOperation='lighter';ctx.drawImage(o,-w*.7,-w*o.height/o.width/2,w,w*o.height/o.width);ctx.restore();continue;}
        ctx.save();ctx.translate(b.x,b.y);ctx.rotate(a);if(hc){ctx.fillStyle='#fff';ctx.fillRect(-14,-r-4,26,r*2+8);}ctx.fillStyle=this.RING;ctx.fillRect(-12,-r-2,22,r*2+4);ctx.fillStyle=D;ctx.fillRect(-10,-r+1,17,r*2-2);
        ctx.fillStyle=this.CORE;ctx.fillRect(-8,-r*.3,13,r*.6);ctx.beginPath();ctx.moveTo(7,-r+1);ctx.lineTo(13,0);ctx.lineTo(7,r-1);ctx.fill();
        ctx.globalCompositeOperation='lighter';G_(-14,0,7+(rm?1.5:Math.random()*3),'#ffa02d',.8);ctx.restore();}}
    ctx.restore();},
  /* 3. the hitbox dot: the real hit circle is 3 world units (b.js: dd < b.r+3); drawn at least ~5 screen px wide */
  ppu(){if(!this._ppu||++this._pf>60){this._pf=0;const PT=typeof wcv!=='undefined'&&wcv!==cv,cw=cv.clientWidth||cv.width;this._ppu=cw/(PT?PW_:W)||1;}return this._ppu;},
  dot(){if(!RET.read||!SET.hbox||!running||G.dead||!P||P.x<-50)return;const u=this.ppu(),r=Math.max(2.4,2.5/u),rr=r+Math.max(1.4,1.6/u);
    ctx.save();ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;ctx.fillStyle=this.RING;ctx.beginPath();ctx.arc(P.x,P.y,rr,0,7);ctx.fill();ctx.fillStyle=this.CORE;ctx.beginPath();ctx.arc(P.x,P.y,r,0,7);ctx.fill();ctx.restore();this.stat.dot++;},
  /* 4. a dark halo under telegraph strokes (canvas shadow: it only darkens around source-over strokes and fills; additive pictures are not touched) */
  haloOn(){if(!RET.read)return false;ctx.shadowColor='rgba(0,0,0,.95)';ctx.shadowBlur=Math.max(3,4*S);ctx.shadowOffsetX=ctx.shadowOffsetY=0;this.stat.halo++;return true;},
  haloOff(){ctx.shadowBlur=0;ctx.shadowColor='rgba(0,0,0,0)';},
  under(len,w){ctx.save();ctx.setLineDash([]);ctx.strokeStyle='rgba(0,0,0,.75)';ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(len,0);ctx.stroke();ctx.restore();},   // a dark underlay line (current transform: x along the line)
  /* on-foot enemy shots (foot.js render): the danger hue, white core, dark ring; c = the on-foot canvas context */
  footEb(c,b){c.fillStyle=this.RING;c.beginPath();c.arc(b.x,b.y,b.r*1.35,0,6.283);c.fill();c.fillStyle=this.D;c.beginPath();c.arc(b.x,b.y,b.r,0,6.283);c.fill();
    c.fillStyle=this.CORE;c.beginPath();c.arc(b.x,b.y,b.r*.45,0,6.283);c.fill();}};
{const fb=FXV.bullets;FXV.bullets=function(){if(!RET.read)return fb.call(this);READ.bullets();};}
{const dp=drawPlayer;drawPlayer=function(t){dp(t);READ.dot();};}
{const zo=ZOO.over;ZOO.over=function(t){if(!READ.haloOn())return zo.call(this,t);try{zo.call(this,t);}finally{READ.haloOff();}};}
/* real enemy-fire pictures (fxwave.js) keep their picture; a dark line or ring goes under / around them */
{const fs=FXW.sniper,fa=FXW.aim,fbm=FXW.bomb,fm=FXW.mine;
  const beam=(e,w)=>{ctx.save();ctx.translate(e.x,e.y);ctx.rotate(e.ang);READ.under(1500,w);ctx.restore();};
  FXW.sniper=(e,k,lk)=>{if(RET.read&&FXW.pic('eb-sniper-beam'))beam(e,lk?22:13);return fs(e,k,lk);};
  FXW.aim=(e,left)=>{if(RET.read&&FXW.pic('eb-aim-line'))beam(e,left<=.3?17:11);return fa(e,left);};
  FXW.bomb=b=>{const ok=fbm(b);if(ok&&RET.read)READ.ring(b.x,b.y,13.5,2.6);return ok;};
  FXW.mine=(m,t,left)=>{const ok=fm(m,t,left);if(ok&&RET.read){const a=ctx.globalAlpha;READ.ring(m.x,m.y,m.r*1.45,2.6);ctx.globalAlpha=a;}return ok;};}
/* pickups and power-ups never wear the danger hue */
if(RET.read&&PW.p2&&PW.p2.K&&PW.p2.K.nova)PW.p2.K.nova.c=READ.NOVA;
/* Settings > Assist (or Accessibility when Assist is off): 'Show hitbox' */
{const f=RET.assistSchema;RET.assistSchema=function(SC){if(f)f.call(this,SC);if(!RET.read)return;const g=SC.find(x=>x.g==='Assist')||SC.find(x=>x.g==='Accessibility');if(!g||g.rows.some(r=>r.k==='hbox'))return;
  const i=g.rows.findIndex(r=>r.k==='hc');g.rows.splice(i<0?g.rows.length:i+1,0,{k:'hbox',l:'Show hitbox',o:[[false,'Off'],[true,'On']],d:'A small white dot on the ship marks the only spot that can be hit. Never marks a run.'});};}
