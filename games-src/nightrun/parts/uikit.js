// PURPOSE: painted UI kit: HUD plates and the hint bubble
// FLAG: hint (?hint=0)
// TEST: hint-test.js
/* ---------- painted UI kit (media/ui-*.webp): canvas HUD plates + the hint bubble. The DOM side (buttons, panels, rows, touch buttons) is CSS in head.html.
   Every image is decoded once (ART.load -> ImageBitmap) and drawn as a 9-slice with plain drawImage: no per-frame filters. Until it has decoded the old flat look is drawn. */
const UIK={names:['ui-hud-bars','ui-hud-mult','ui-bubble','ui-bubble-tail'],
  init(){for(const n of this.names)ART.load(n);},
  // 9-slice: cap = source corner size in px, cd = the same corner on screen
  slice(c,n,x,y,w,h,cap,cd,sx=0,sy=0,sw,sh){const b=ART.bm[n];if(!b)return false;sw=sw||b.width-sx;sh=sh||b.height-sy;cd=Math.min(cd,w/2,h/2);const mw=sw-2*cap,mh=sh-2*cap;
    const X=[sx,sx+cap,sx+sw-cap],Y=[sy,sy+cap,sy+sh-cap],SW=[cap,mw,cap],SH_=[cap,mh,cap],DX=[x,x+cd,x+w-cd],DY=[y,y+cd,y+h-cd],DW=[cd,w-2*cd,cd],DH=[cd,h-2*cd,cd];
    for(let j=0;j<3;j++)for(let i=0;i<3;i++)c.drawImage(b,X[i],Y[j],SW[i],SH_[j],DX[i],DY[j],DW[i],DH[j]);return true;},
  // (the paintings have transparent margins, so sx/sw crop to the frame itself)
  // a dark plate behind HUD text: the painted frame over a solid dark fill, so the numbers stay readable
  plate(c,n,x,y,w,h,cap,cd,sx,sw){c.save();c.fillStyle='#05030ccc';c.fillRect(x+3,y+3,w-6,h-6);const ok=this.slice(c,n,x,y,w,h,cap,cd,sx,0,sw);if(!ok){c.strokeStyle='#ffffff22';c.strokeRect(x+.5,y+.5,w-1,h-1);}c.restore();},
  // the hint line sits in the painted speech bubble (cropped to the bubble itself, 3 slices wide)
  bubble(c,x,y,w,h){const b=ART.bm['ui-bubble','ui-bubble-tail'];if(!b)return false;const sx=72,sy=40,sw=116,sh=88,cap=30,cd=Math.min(h*.7,w/3);
    c.drawImage(b,sx,sy,cap,sh,x,y,cd,h);c.drawImage(b,sx+cap,sy,sw-2*cap,sh,x+cd,y,w-2*cd,h);c.drawImage(b,sx+sw-cap,sy,cap,sh,x+w-cd,y,cd,h);
    const t=ART.bm['ui-bubble-tail'];if(t){c.save();c.translate(x+w*.62,y+h-2);c.rotate(Math.PI/2);c.drawImage(t,0,-9,22,18);c.restore();}return true;}};
// the CSS-side paintings are decoded once up front too (the touch buttons sit in a hidden element, so the browser would otherwise fetch them on the first run)
UIK.keep=['ui-btn-pink','ui-btn-cyan','ui-btn-violet','ui-button-go','ui-button-cream','ui-button-power','ui-topbar','ui-drawer-head','ui-panel','ui-row','ui-iconbtn','ui-node-open','ui-node-done','ui-node-boss','ui-node-locked','ui-touch-dash','ui-touch-emp','ui-touch-pause'].map(n=>{const im=new Image();im.decoding='async';im.src=ART.base+n+'.webp';if(im.decode)im.decode().catch(()=>{});return im;});
UIK.init();

/* ---------- animated bosses: one frame sheet per boss (media/anim-boss-<name>.webp, made by games-src/nightrun/make-boss-anim.py from the pose stills):
   row 1 = four idle frames, row 2 (when the boss has them) = wind-up, charge, fire, recover. cw/ch = frame size, kw/kh = frame size / body size of the idle frame. */
UIK.boss=__BOSSANIM__;
UIK.bossDraw=(e,nm,wd,by,tl,fl)=>{const A=UIK.boss[nm],sh=A&&ART.bm['anim-boss-'+nm];if(!sh){if(A)ART.load('anim-boss-'+nm);return false;}
  e._at=(e._at||0)+FD;if(e.fireT>0)e.fireT=Math.max(0,e.fireT-FD);
  let col,row=0;const T=e._at;
  if(A.atk&&e.ph!==undefined&&(e.arm||e.fireT>0)){row=1;col=e.fireT>0?(e.fireT>.22?2:3):(PHF<.5?0:1);}      // wind-up on the beat before it fires, then the shot, then the recovery
  else col=[0,1,2,3,2,1][Math.floor(T*(A.atk?5:3.2))%6];
  if(e.labPose&&A.atk>=0){row=e.labPose[0];col=e.labPose[1];if(!A.atk)row=0;}                // LAB: a pose picked by hand
  let dw=wd*A.kw,dh=dw*A.ch/A.cw;if(ART.artK(e)===6){dh=e.r*3.6*A.kh;dw=dh*A.cw/A.ch;}e._dh=dh;e._dw=dw;
  const ctx_=ctx;ctx_.save();ctx_.translate(0,by);if(tl)ctx_.rotate(tl);ctx_.drawImage(sh,col*A.cw,row*A.ch,A.cw,A.ch,-dw/2,-dh/2,dw,dh);
  if(fl){ctx_.globalCompositeOperation='lighter';ctx_.globalAlpha=.4;ctx_.drawImage(sh,col*A.cw,row*A.ch,A.cw,A.ch,-dw/2,-dh/2,dw,dh);}
  ctx_.restore();return true;};
// the sheet of a district's boss is fetched a few seconds after the district starts (never at the moment the boss arrives, never all ten at once)
NR.on('tick',()=>{if(!G.live||G.di===UIK._di)return;UIK._di=G.di;const nm=ART.bossN[DISTRICTS[G.di].boss];if(nm)setTimeout(()=>ART.load('anim-boss-'+nm),3000);});

/* ---------- boss movement by body: media/anim-boss.json "move" = ground (legs, wheels, tracks: walks / rolls on the road line, shadow under it, hops when it fires),
   water (rides the water surface, ripples), air (flies, the old bob). Portrait is a view from above: there the sideways patrol stays, only the hover bob goes. ---------- */
UIK.moveOf=e=>{const A=UIK.boss[ART.bossN[ART.artK(e)]];return A&&A.move||'air';};
UIK.groundY=()=>{let y=H-70;if(G&&G.lab&&!rotMode&&labEl&&!labEl.hidden&&!LAB.min){const f=frame.getBoundingClientRect(),p=labEl.getBoundingClientRect();if(f.height>0&&p.height>0)y=Math.min(y,(p.top-f.top)/f.height*H-6);}return y;};   // the LAB panel covers the road: stand above it
UIK.bossMove=(e,dt,mv)=>{const dh=e._dh||130;
  if(e.x>bossX()){e.x-=110*dt;e.y=UIK.groundY()-dh/2;return;}
  e.x=bossX()-34-34*Math.sin(e.t*(mv==='water'?.35:.5));                                   // patrols a short stretch, always left of its stop line
  const sk=mv==='ground'&&e.fireT>0&&!e.labPose?Math.sin(e.t*90)*1.5:0;                     // wheels and legs never leave the road: a small shake on the shot, no hop
  e.x+=sk;e.y=UIK.groundY()-dh/2+(mv==='water'?Math.sin(e.t*1.3)*3:0);e.my=-dh*.12;};
/* portrait is a view from above: there is no road line, so a ground boss would float. Each one has a flyer of the same stage tier that takes its place (same HP, same patterns, new name and art). */
UIK.SUB={'tresor-wart':{ak:2,nm:'ZENTRAL-ICE',lbl:'Z'},'bruecken-waechter':{ak:9,nm:'MESSE-WÄCHTER',lbl:'M'},'hoplite':{ak:2,nm:'ZENTRAL-ICE',lbl:'Z'},'talos':{ak:3,nm:'KRONOS',lbl:'K'}};
UIK.subOf=e=>{if(!rotMode||(G&&G.lab))return null;const nm=ART.bossN[ART.artK(e)],A=UIK.boss[nm];return A&&A.move==='ground'&&UIK.SUB[nm]||null;};
UIK.portraitSwap=e=>{const s=UIK.subOf(e);if(!s)return false;e.ak=s.ak;e.nm=s.nm;e.lbl=s.lbl;e.sub=1;return true;};
UIK.pname=(nm,k)=>{if(!rotMode||(G&&G.lab))return nm;const o=UIK.SUB[ART.bossN[ART.artK({k,nm})]];return o&&UIK.boss[ART.bossN[ART.artK({k,nm})]].move==='ground'?o.nm:nm;};
// shadow: one soft ellipse on the road line right under the boss (a cached radial-gradient sprite, no per-frame filter); flyers throw a smaller, fainter one the higher they are
UIK._sh=null;
UIK.bossShadow=(e,mv,wd)=>{const dh=e._dh||130,dw=(e._dw||wd)*.8,gy=UIK.groundY(),h=Math.max(0,gy-(e.y+dh/2)),y=gy-e.y+1;ctx.save();
  if(mv==='water'){ctx.strokeStyle='#19e3ff';ctx.lineWidth=1.5;for(let i=0;i<3;i++){const k=((e.t*.6+i/3)%1);ctx.globalAlpha=.5*(1-k);ctx.beginPath();ctx.ellipse(0,y-4,dw*(.45+.35*k),4+7*k,0,0,7);ctx.stroke();}}
  else{const f=mv==='ground'?1:Math.max(0,1-h/420);if(f>.04){if(!UIK._sh){const c=document.createElement('canvas');c.width=64;c.height=16;const g=c.getContext('2d'),r=g.createRadialGradient(32,8,0,32,8,32);r.addColorStop(0,'rgba(0,0,0,.85)');r.addColorStop(.6,'rgba(0,0,0,.4)');r.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=r;g.translate(0,8);g.scale(1,.25);g.translate(0,-8*4);g.fillRect(0,0,64,64);UIK._sh=c;}
    const sw=dw*(.6+.4*f);ctx.globalAlpha=.55*f;ctx.drawImage(UIK._sh,-sw*.6,y-sw*.075,sw*1.2,sw*.15);}}   // width ~0.8 x the boss, flat, centred on the boss x
  ctx.restore();};

/* ---------- ONE hint style (F6, flag RET.hint, ?hint=0 = the old speech bubble at the bottom). Every in-stage hint goes through HINT.show(text, {t, col}):
   bold white text >= 14 px on a dark rounded pill (alpha .78, thin accent border), at most 8 words (the caller writes it short; short() only cuts a leftover),
   in the top third under the HUD, never within 120 px of the ship (it slides sideways, or waits), one on screen at a time with at least 1.2 s between two. ---------- */
if(RET.hint===undefined)RET.hint=!/[?&]hint=0/.test(location.search);
const HINT=window.HINT={cur:null,q:[],gap:0,seen:[],box:null,MAXW:8,GAP:1.2,SAFE:120,
  on(){return RET.hint!==false;},
  reset(){this.cur=null;this.q.length=0;this.gap=0;this.box=null;},
  words(s){return String(s).trim().split(/\s+/).filter(Boolean).length;},
  short(s){const w=String(s==null?'':s).trim().split(/\s+/).filter(Boolean);return w.length>this.MAXW?w.slice(0,this.MAXW).join(' ').replace(/[,;:·+\-]+$/,''):w.join(' ');},
  show(txt,o){o=o||{};txt=this.short(txt);if(!txt)return false;
    if(!this.on()){G.hint={t:o.t||3,txt};return true;}                      // flag off: the old bubble
    const T=o.t||3,dup=this.cur&&this.cur.txt===txt?this.cur:this.q.find(h=>h.txt===txt);
    if(dup){if(T>dup.t){dup.t=T;if(dup===this.cur&&G.hint)G.hint.t=T;}return false;}   // callers may ask again every frame (a longer first-time ask keeps the longer time)
    if(!this.diet(txt))return false;
    if(this.cur&&this.cur.el<.2&&T>this.cur.t){this.cur={txt,t:T,col:o.col||null,ic:o.ic||null,age:0,el:0,bw:0};if(G.hint){G.hint.t=T;G.hint.txt=txt;}return true;}   // the same moment, a longer first-time text: it replaces the short one
    this.q.push({txt,t:o.t||3,col:o.col||null,ic:o.ic||null,age:0,el:0,bw:0});while(this.q.length>3)this.q.shift();this.next();return true;},
  /* V2 hint diet (flag RET.hintdiet, ?hintdiet=0 = every ask shows): a hint text shows at most twice per profile (counts in localStorage 'mnr_hintseen') and never twice within 3 minutes of play.
     Not in the tutorial or the Lab (the tutorial teaches by hints). A refused ask returns false like a repeat ask, so callers that retry every frame cost nothing. */
  clk:0,hs:null,
  diet(txt){if(G.tut||G.lab)return true;
    if(!this.hs){try{this.hs=JSON.parse(localStorage.getItem('mnr_hintseen')||'{}')||{};}catch(e){this.hs={};}this.hl={};}
    const n=this.hs[txt]|0;if(n>=2)return false;if(n>0&&this.clk-(this.hl[txt]==null?-1e9:this.hl[txt])<180)return false;
    this.hs[txt]=n+1;this.hl[txt]=this.clk;try{localStorage.setItem('mnr_hintseen',JSON.stringify(this.hs));}catch(e){}return true;},
  next(){if(this.cur||this.gap>0||!this.q.length||(G.banner&&G.banner.t>0))return;this.cur=this.q.shift();this.seen.push(this.cur.txt);if(this.seen.length>60)this.seen.shift();if(G.hint){G.hint.t=this.cur.t;G.hint.txt=this.cur.txt;}},   // nothing up and no gap to wait out: starts at once
  tick(dt){this.clk+=dt;if(!this.on()){this.cur=null;this.q.length=0;this.box=null;return;}
    if(this.gap>0)this.gap-=dt;for(const h of this.q)h.age+=dt;this.q=this.q.filter(h=>h.age<8);       // a hint nobody saw in 8 s is stale
    const c=this.cur;
    if(c){if(G.banner&&G.banner.t>0){}else if(c.blk){c.bw+=dt;if(c.bw>3)c.t=0;}else{c.t-=dt;c.el+=dt;}   // paused under a banner; dropped after 3 s of no free spot
      if(c.t<=0){this.cur=null;this.box=null;this.gap=this.GAP;}}
    this.next();
    if(G.hint){const c2=this.cur;G.hint.t=c2?Math.max(.01,c2.t):0;if(c2)G.hint.txt=c2.txt;}},       // mirror: callers that ask "is a hint up?" keep working
  // g = {W,H: drawing area (units), cpu: CSS px per unit, top: y of the first free row, x0,x1: free x range, ship:{x,y}, acc: border colour}
  draw(c,g){const h=this.cur;if(!h||!this.on()||(G.banner&&G.banner.t>0)){this.box=null;return;}
    const fs=Math.max(15.5,16/g.cpu),pad=fs*.75,lh=fs*1.22,font=`700 ${fs}px "Chakra Petch",sans-serif`;c.save();c.font=font;
    const ic=h.ic&&ART.img(h.ic)?h.ic:null,icW=ic?fs*1.9:0;   // a rule card carries its badge on the left (art only)
    const maxW=Math.max(120,g.x1-g.x0-2*pad-8-icW),ws=h.txt.split(' ');let lines=[],cur='';
    for(const w of ws){const t=cur?cur+' '+w:w;if(cur&&c.measureText(t).width>maxW){lines.push(cur);cur=w;}else cur=t;}if(cur)lines.push(cur);
    if(lines.length===2&&ws.length>3){let best=null;for(let i=1;i<ws.length;i++){const a=ws.slice(0,i).join(' '),b=ws.slice(i).join(' '),m=Math.max(c.measureText(a).width,c.measureText(b).width);if(m<=maxW&&(!best||m<best.m))best={a,b,m};}if(best)lines=[best.a,best.b];}
    let tw=0;for(const l of lines)tw=Math.max(tw,c.measureText(l).width);tw=Math.min(tw,maxW);
    const bw=tw+2*pad+icW,bh=lines.length*lh+fs*.7,safe=this.SAFE/g.cpu,sh=g.ship;
    const dist=(x)=>{if(!sh)return 1e9;const dx=Math.max(x-sh.x,0,sh.x-(x+bw)),dy=Math.max(g.top-sh.y,0,sh.y-(g.top+bh));return Math.hypot(dx,dy);};
    const mid=(g.x0+g.x1)/2-bw/2,cand=[mid,g.x0+4,g.x1-4-bw,(g.x0+mid)/2,(g.x1-bw+mid)/2];let x=null;
    for(const cx of cand){if(cx>=g.x0-1&&cx+bw<=g.x1+1&&dist(cx)>=safe){x=cx;break;}}
    h.blk=x==null;if(h.blk){this.box=null;c.restore();return;}
    const y=g.top,a=Math.min(1,h.t*3,h.el*6+.001),r=Math.min(bh/2,fs*.7);
    c.globalAlpha=Math.max(0,a);c.beginPath();c.moveTo(x+r,y);c.arcTo(x+bw,y,x+bw,y+bh,r);c.arcTo(x+bw,y+bh,x,y+bh,r);c.arcTo(x,y+bh,x,y,r);c.arcTo(x,y,x+bw,y,r);c.closePath();
    c.fillStyle='rgba(5,3,12,.78)';c.fill();c.lineWidth=1.5/g.cpu;c.strokeStyle=h.col||g.acc||'#19e3ff';c.stroke();
    c.fillStyle='#fff';c.textAlign='center';c.textBaseline='alphabetic';c.font=font;lines.forEach((l,i)=>c.fillText(l,x+icW+(bw-icW)/2,y+fs*.35+(i+.82)*lh));if(ic)ART.pic(ic,Math.min(bh-4,icW),x+pad*.4+icW/2,y+bh/2);
    c.restore();this.box={x,y,w:bw,h:bh,fs,cpu:g.cpu,ship:sh?{x:sh.x,y:sh.y}:null,areaH:g.H,areaW:g.W,txt:h.txt,lines:lines.length,mode:g.mode,hudBottom:g.top};}};
NR.on('runStart',()=>HINT.reset());
