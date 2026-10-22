// PURPOSE: a calm, readable playfield: one telegraph style, ship on top, bullets tinted by threat
// FLAG: polish (?polish=0)
// TEST: polish-test.js
/* ---------- polish.js: a calm, readable playfield (owner, 21 Oct 2026: "the game looks very unprofessional"). Flag RET.polish, default ON; ?polish=0 = the game as it was
   (nothing below is installed). Presentation only: no hitbox, damage, timing or spawn rule is touched; armour.js and hard.js are not read.
   1. ONE TELEGRAPH LANGUAGE (the world layer, between drawPickups and the screen-edge pulse): every big circle (radius >= 40 world units) is a "marker".
      Fills become a soft radial gradient at <= 18% alpha; outlines become a crisp ~1.3 px edge, bright for their first 0.8 s, then faint. At most POL.MAX (3)
      markers per frame get a fill; later ones keep only a faint edge. Dashed guides fade (<= 45% alpha, thin) except the dash / EMP timing guide (TIM, ABIL, CTR).
      Big soft glows fade to <= 12%, wide translucent bands (lanes, tides, danger columns) to one 10% layer. Small rings round enemies and pickups get thin.
   2. THE SHIP ON TOP: drawPlayer still runs where it always did (rules, shields and auras keep their order), but the hull sprite is replayed at the end of the
      world layer, at alpha 1, with the hit dot on it. The streak label (reward.js) moves off the ship, the streak ring is thin.
   3. BULLETS by threat, by hue only (ASSET-POLICY: no new pictures): readable.js still draws every bullet with its approved picture, dark ring and white core;
      orbs turn amber, homing orbs magenta, needles / shells / rockets keep hot pink and their own shapes. Player shots a brighter cyan.
   4. The LINE meter (holdline.js) is a thin edge strip, bright only while it drains. Test: nightrun/polish-test.js. ---------- */
if(RET.polish===undefined)RET.polish=!/[?&]polish=0/.test(location.search);
const POL=window.POL={on:!!RET.polish,MAX:3,FILL:.18,GLOW:.12,BAND:.1,AGE:.8,st:{fr:0,mk:0,cut:0,ship:0},
  gov:false,keep:0,inP:0,def:[],cl:[],old:[],t:0};
if(POL.on){
  /* ---- 1. the governor: instance wrappers on the two world contexts, live only while POL.gov ---- */
  const DPR=()=>cv.width/(cv.clientWidth||cv.width)||1;
  const aOf=s=>{if(typeof s!=='string')return 1;let m=/^#([0-9a-f]{6})([0-9a-f]{2})?$/i.exec(s);if(m)return m[2]?parseInt(m[2],16)/255:1;m=/^#([0-9a-f]{3})([0-9a-f])?$/i.exec(s);if(m)return m[2]?parseInt(m[2]+m[2],16)/255:1;
    m=/a?\(([^)]*)\)/.exec(s);if(m){const v=m[1].split(/[ ,/]+/).filter(Boolean);return v.length>3?parseFloat(v[3])*(/%/.test(v[3])?.01:1):1;}return 1;};
  const rgb=s=>{let m=/^#([0-9a-f]{6})/i.exec(s);if(m){const v=parseInt(m[1],16);return [v>>16,v>>8&255,v&255];}m=/^#([0-9a-f])([0-9a-f])([0-9a-f])/i.exec(s);if(m)return [m[1],m[2],m[3]].map(h=>parseInt(h+h,16));
    m=/rgba?\(([^)]*)\)/.exec(s);if(m)return m[1].split(/[ ,/]+/).slice(0,3).map(Number);return null;};
  POL.cluster=(x,y,r)=>{   // one marker per centre (concentric rings = one); its age carries over from the last frame, so persistent rings fade
    if(P&&Math.hypot(x-P.x,y-P.y)<8)return {ship:1,i:0,age:0};
    for(const c of POL.cl)if(Math.hypot(c.x-x,c.y-y)<Math.max(14,r*.2))return c;
    let born=G.t;for(const o of POL.old)if(Math.hypot(o.x-x,o.y-y)<40){born=o.born;break;}
    const c={x,y,r,born,age:G.t-born,i:POL.cl.length+1};POL.cl.push(c);POL.st.mk++;return c;};
  const gov=c=>{if(!c||c.__pol)return;c.__pol=1;
    const ba=c.beginPath,ar=c.arc,el=c.ellipse,fi=c.fill,stk=c.stroke,di=c.drawImage,fr=c.fillRect;let A=[];
    const sc=()=>{const t=c.getTransform();return Math.hypot(t.a,t.b);};
    c.beginPath=function(){A.length=0;return ba.apply(this,arguments);};
    c.arc=function(x,y,r){if(POL.gov)A.push([x,y,r]);return ar.apply(this,arguments);};
    c.ellipse=function(x,y,rx,ry){if(POL.gov)A.push([x,y,Math.max(rx,ry)]);return el.apply(this,arguments);};
    const big=()=>{if(A.length!==1&&!(A.length>1&&A.every(a=>a[0]===A[0][0]&&a[1]===A[0][1])))return null;const k=sc()/S,a=A[0];return a[2]*k>=40?a:null;};   // one circle (bullets come as one path of many small arcs)
    c.fill=function(){if(!POL.gov||POL.keep)return fi.apply(this,arguments);const a=big();if(!a)return fi.apply(this,arguments);
      if(a[2]*sc()/S>260)return fi.apply(this,arguments);const t=c.getTransform(),k=sc()/S,m=POL.cluster(t.a*a[0]+t.c*a[1]+t.e,t.b*a[0]+t.d*a[1]+t.f,a[2]*k);if(m.ship)return fi.apply(this,arguments);
      if(m.i>POL.MAX){POL.st.cut++;return;}
      const ga=c.globalAlpha,fs=c.fillStyle,al=aOf(fs),col=typeof fs==='string'&&rgb(fs);if(col&&ga*al>=.9)return fi.apply(this,arguments);   // an opaque body is not a marker
      c.globalAlpha=Math.min(ga,POL.FILL/Math.max(.05,al));
      if(col){const g=c.createRadialGradient(a[0],a[1],a[2]*.15,a[0],a[1],a[2]);g.addColorStop(0,`rgba(${col},${(al*.25).toFixed(3)})`);g.addColorStop(1,`rgba(${col},${al.toFixed(3)})`);c.fillStyle=g;}
      try{return fi.apply(this,arguments);}finally{c.globalAlpha=ga;c.fillStyle=fs;}};
    c.stroke=function(){if(!POL.gov)return stk.apply(this,arguments);
      const lw=c.lineWidth,ga=c.globalAlpha,px=sc()/DPR(),dash=c.getLineDash().length>0;let w=lw,al=ga;
      if(POL.keep){w=Math.min(lw,2.2/px);}
      else{const a=A.length===1?A[0]:null,rw=a?a[2]*sc()/S:0;
        if(a&&rw>260){}   // screen-wide shock waves (EMP) are short events, not markers
        else if(a&&rw>=40){const t=c.getTransform(),m=POL.cluster(t.a*a[0]+t.c*a[1]+t.e,t.b*a[0]+t.d*a[1]+t.f,rw);
          if(m.ship){w=Math.min(lw,2/px);al=Math.min(ga,.75);}
          else{m.n=(m.n||0)+1;if(m.age>POL.AGE&&m.n>1&&!dash){POL.st.cut++;return;}   // a settled marker keeps ONE ring (no concentric stacks)
            w=Math.min(lw,1.3/px);al=Math.min(ga,m.i>POL.MAX?.16:m.age>POL.AGE?.28:.6);}}
        else if(a&&rw>=12){w=Math.min(lw,1.6/px);al=Math.min(ga,.7);}   // target rings round enemies / pickups: thin
        if(dash){w=Math.min(w,1.5/px);al=Math.min(al,.45);}}
      if(w===lw&&al===ga)return stk.apply(this,arguments);
      c.lineWidth=w;c.globalAlpha=al;try{return stk.apply(this,arguments);}finally{c.lineWidth=lw;c.globalAlpha=ga;}};
    c.drawImage=function(im,x,y,w,h){if(POL.gov&&!POL.keep&&arguments.length===5&&im&&im.width===64&&im.height===64&&im instanceof HTMLCanvasElement&&w*sc()/S>=80){   // the cached radial glows (a.js glow / G_)
        const ga=c.globalAlpha;if(ga>POL.GLOW){c.globalAlpha=POL.GLOW;try{return di.apply(this,arguments);}finally{c.globalAlpha=ga;}}}
      return di.apply(this,arguments);};
    c.fillRect=function(x,y,w,h){if(POL.gov&&!POL.keep){const k=sc()/S,ar=Math.abs(w*h)*k*k,ga=c.globalAlpha*aOf(c.fillStyle);
        if(ar>=W*H*.03&&ar<W*H*.9&&ga<.95&&ga>POL.BAND){const g0=c.globalAlpha;c.globalAlpha=g0*POL.BAND/ga;try{return fr.apply(this,arguments);}finally{c.globalAlpha=g0;}}}
      return fr.apply(this,arguments);};};
  gov(vctx);gov(wctx);
  /* the painted rule fields (rules.js) are markers too */
  {const pic=ART.pic;ART.pic=function(id,w,x,y,rot,al){if(POL.gov&&!POL.keep&&w>=120&&/^fx-w34-rule-/.test(id)){const m=POL.cluster(x,y,w*.35);al=Math.min(al==null?1:al,m.i>POL.MAX?.15:.4);}return pic.call(this,id,w,x,y,rot,al);};}
  /* the frame: the governor starts after the backdrop (drawPickups is the first world draw) and ends with the ship */
  {const rd=render;render=function(t,dt){gov(vctx);gov(wctx);if(POL.cl.length)POL.old=POL.cl;POL.cl=[];POL.def.length=0;POL.st.fr++;
    try{return rd.apply(this,arguments);}finally{POL.gov=false;POL.keep=0;POL.inP=0;POL.def.length=0;}};}
  DRAW.pre.push(function(t){POL.gov=!!running;});
  for(const [o,k] of [[window.TIM,'draw'],[window.ABIL,'draw'],[window.CTR,'draw']])if(o&&o[k]){const f=o[k];o[k]=function(){POL.keep++;try{return f.apply(this,arguments);}finally{POL.keep--;}};}   // the dash / EMP timing guides keep their look
  {const db=drawBoss;drawBoss=function(){POL.keep++;try{return db.apply(this,arguments);}finally{POL.keep--;}};}   // the boss body and its armour rings stay as drawn
  /* ---- 2. the ship on top: the hull sprite is recorded inside drawPlayer and drawn again, last ---- */
  HOOK.drawPlayer(dp=>function(t){if(!running)return dp.apply(this,arguments);POL.inP++;try{return dp.apply(this,arguments);}finally{POL.inP--;}});
    const put=ART.put;ART.put=function(o){if(POL.inP&&o&&o===ART.sp('spr-ship-'+shipDef().id,60)){const a=[...arguments];POL.def.push([ctx.getTransform(),()=>put.apply(ART,a)]);return true;}return put.apply(this,arguments);};
  if(typeof SPR!=='undefined'&&SPR.ship){const sp=SPR.ship;SPR.ship=function(c,id,t,bob){if(POL.inP&&c===ctx&&SPR.shipOn&&SPR.shipOn(id)){const a=[...arguments];
      POL.def.push([ctx.getTransform(),()=>{if(!sp.apply(SPR,a)){const so=ART.sp('spr-ship-'+id,60);if(so)put.call(ART,so,0,bob);}}]);return true;}return sp.apply(this,arguments);};}
  if(typeof RIG!=='undefined'&&RIG.draw){const rg=RIG.draw;RIG.draw=function(c){if(POL.inP&&c===ctx){const a=arguments;POL.def.push([ctx.getTransform(),()=>rg.apply(RIG,a)]);return;}return rg.apply(this,arguments);};}
  POL.flush=function(){POL.gov=false;if(!POL.def.length)return;const c=ctx,T=c.getTransform();c.save();c.globalAlpha=1;c.globalCompositeOperation='source-over';c.shadowBlur=0;
    if(window.__pol&&__pol.ship)__pol.ship(c.globalAlpha);if(window.__pol&&__pol.fr)__pol.fr.inShip=1;
    try{for(const [M,f] of POL.def){c.setTransform(M);f();}c.setTransform(T);
      if(RET.read&&window.READ)READ.dot();else{c.fillStyle='#07030f';c.beginPath();c.arc(P.x,P.y,4,0,7);c.fill();c.fillStyle='#fff';c.beginPath();c.arc(P.x,P.y,2.5,0,7);c.fill();}}
    finally{c.restore();if(window.__pol&&__pol.fr)__pol.fr.inShip=0;}POL.def.length=0;POL.st.ship++;};
  {const ed=FXV.edges;FXV.edges=function(t){try{return ed.apply(this,arguments);}finally{POL.flush();}};}
  /* the streak (reward.js): a thin ring, and the label ahead of the ship, small, never on it */
  if(typeof RWD!=='undefined'&&RWD.draw){const rw=RWD.draw;RWD.draw=function(t){if(!this.on||!G||G.dead)return;
    for(const p of G.pk){if(!p.rk||G.t-p.rkT>1.2)continue;const y=p.y+Math.sin(p.bob)*3;ctx.save();ctx.strokeStyle='#ffe14d';ctx.globalAlpha=.45+.25*Math.sin(t*10);ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(p.x,y,14,0,7);ctx.stroke();ctx.restore();}
    const s=G.rw;if(!s||s.n<=0)return;const age=G.t-s.t;if(age>this.WIN)return;const tr=s.tier,fr=1-age/this.WIN,col=['#19e3ff','#19e3ff','#7dff7a','#ffe14d','#ff9a3d','#ff2d78'][tr];
    ctx.save();ctx.lineWidth=1.6;ctx.strokeStyle=col;ctx.globalAlpha=.7;ctx.beginPath();ctx.arc(P.x,P.y,30,-Math.PI/2,-Math.PI/2+Math.PI*2*fr);ctx.stroke();
    if(tr>=2){ctx.globalAlpha=.9;ctx.textAlign='center';ctx.font='700 13px "Chakra Petch",sans-serif';ctx.lineWidth=3;ctx.strokeStyle='rgba(0,0,0,.8)';
      const txt='x'+tr+(s.bt>0?' +'+Math.round(s.bf*100)+'%':'');
      if(wcv===cv){ctx.strokeText(txt,P.x+70,P.y-34);ctx.fillStyle=col;ctx.fillText(txt,P.x+70,P.y-34);}
      else{ctx.translate(P.x+74,P.y);ctx.rotate(Math.PI/2);ctx.strokeText(txt,0,0);ctx.fillStyle=col;ctx.fillText(txt,0,0);}}
    ctx.restore();};}
  /* ---- 3. bullets by threat: readable.js draws them as before (its approved pictures, dark ring, white core); only the hue changes per group ---- */
  POL.EB=[[b=>!b.k&&!(b.hm>0),'#ffa526',-55],[b=>!b.k&&b.hm>0,'#ff4fd8',-140],[b=>!!b.k,'#ff2d78',-92]];   // orb amber, homing magenta, needle / shell / rocket hot pink (their own pictures)
  {const fb=FXV.bullets;FXV.bullets=function(){if(!running||!RET.read||!window.READ)return fb.apply(this,arguments);const L=G.eb,D=READ.D,hu=ART.hue,g=POL.gov;POL.gov=false;
    try{for(const [f,c,dg] of POL.EB){const S_=L.filter(f);if(!S_.length)continue;G.eb=S_;READ.D=c;ART.hue=function(k,w,d){return hu.call(this,k,w,k==='fx-bullet-enemy'?dg:d);};READ.bullets();}}
    finally{G.eb=L;READ.D=D;ART.hue=hu;POL.gov=g;READ.stat.eb=L.length;}};}
  if(window.READ){const pc=READ.pc;READ.pc=function(b,D){const c=pc.call(this,b,D);return c===this.SHOT?'#5ff6ff':c;};}
  /* ---- 5. the LINE meter: a thin strip on the edge, bright only while it drains ---- */
  if(typeof HOLD!=='undefined'&&HOLD.draw){HOLD.draw=function(){if(!this.live())return;const f=this.frac(),x=1,y0=34,h=H-68,hot=f<.35,col=f<.35?'#ff5060':f<.65?'#ffb020':'#19e3ff';
    ctx.save();ctx.globalAlpha=.4;ctx.fillStyle='#05030c';ctx.fillRect(x,y0,3,h);ctx.globalAlpha=f<.65?1:.55;ctx.fillStyle=col;ctx.fillRect(x+.5,y0+h*(1-f),2,h*f);
      if(LEAK.flashT>0||(hot&&!SET.reduce&&Math.floor(G.t*6)%2)){ctx.globalAlpha=Math.min(1,.4+LEAK.flashT);ctx.fillStyle='#ff3040';ctx.fillRect(x,y0,3,h);}
      ctx.restore();};}
}
