// PURPOSE: on-foot street look on phones: one world scale, portrait layout, 3-layer parallax, clip-safe popups, grouped HUD
// FLAG: streetlook (?streetlook=0)
// TEST: streetlook-test.js
/* ---------- STREETLOOK: the on-foot street, art-directed by numbers (owner, 21 Oct 2026, on an iPhone: the field used 65% of the screen, tiny actors, giant floating props, clipped popups).
   Flag RET.streetlook (default ON; ?streetlook=0 = the old look exactly: foot.js draws and lays out as before). Test: nightrun/streetlook-test.js (machine gate on the draw calls).
   One world scale K = 0.225 x visible field height / 64 (Kai standing): a standing character is >= 22% of the field on every screen. Gameplay boxes do not change: every actor, pickup, shot and effect
   is drawn K times bigger about its own spot, and heights above the road are drawn K times taller (compressed above D0 so flyers stay on screen), so a shot still leaves the gun and hits the chest.
   Props: <= 1.25 characters tall, bottom-centre on the road line; neon / banner signs hang on a pole drawn with them; no flying props. Breakable signs stand on a pole too.
   Portrait phones: the field fills everything above the controls (no dead band), road strip + progress bar sit right on the controls; the camera keeps Kai at 25% of a >= 330 unit wide view
   (0.75 x 330 - half bodies = 215 units = 0.83 s at 260 u/s, the fastest walker). Landscape and desktop keep their layout. Popups clamp inside the field, pickups fade out 24 units before the edge.
   Backdrop: sky with a small offset crescent moon, far skyline (x0.12), mid buildings (x0.4), near props + lamps on the road (x1); darker to lighter; a few windows twinkle.
   HUD: hearts / weapon / ammo / bombs / power-ups / fever in one panel top-left (14 px+ text), score + time left of the pause button, the hint under both. ---------- */
if(RET.streetlook===undefined)RET.streetlook=!/[?&]streetlook=0/.test(location.search);
(function(){
if(!RET.streetlook||!window.FOOT||!FOOT._in)return;
const F=FOOT,IN=F._in,VH=540,FL=470,CH=64,DTOP=260,clamp=(v,a,b)=>v<a?a:v>b?b:v;
const SL=F.look={k:1,s:1,d0:150,t0:0,VV:VH,tag:'',port:false,road:0,speeds:{far:.12,mid:.4,near:1}};
const hs=n=>{n=Math.imul((n|0)^61,0x45d9f3b);n^=n>>>16;n=Math.imul(n,0x45d9f3b);return((n^(n>>>16))>>>0)/4294967296;};   // stable hash per cell

/* ----- portrait layout: controls packed into the smallest band that holds them (<= 4% margins), the field takes the rest ----- */
SL.layout=(L,W,H,dpr,T)=>{SL.port=false;F.camK=undefined;if(!(T&&H>W*1.05))return false;
  SL.port=true;F.camK=.25;const auto=F.autoOn(),big=auto?'jump':'fire';
  let Z=Math.max(184,H-Math.round(W*1.5));const f=clamp(Math.round(Z*.42),92,124),s=clamp(Math.round(Z*.27),60,80),stack=f+s+8;
  let mg=Math.max(10,Math.floor((Z-stack)/2));if(mg>H*.045){mg=Math.round(H*.04);Z=stack+2*mg;}
  const hf=H-Z;let sc=W/330;if(hf/sc>600)sc=hf/600;
  L.sc=sc;L.vw=W/sc;L.mode='port';L.box={x:0,y:0,w:W,h:hf};L.ox=0;L.oy=0;L.exl=0;L.exr=0;L.dpr=dpr;SL.VV=hf/sc;
  const cv=L.cv;cv.style.left='0px';cv.style.top='0px';cv.style.width=W+'px';cv.style.height=hf+'px';cv.width=Math.round(W*dpr);cv.height=Math.round(hf*dpr);
  const set=(el,x,y,z)=>{el.hidden=false;el.style.display='';el.style.left=Math.round(x)+'px';el.style.top=Math.round(y)+'px';if(z)el.style.width=el.style.height=Math.round(z)+'px';};
  const rows=auto?[['dash','jump'],['bomb','melee']]:[['dash','fire'],['bomb','melee','jump']],sz=k=>k===big?f:s,rh=rows.map(r=>Math.max(...r.map(sz)));
  let y=H-mg,minX=W;rows.forEach((r,i)=>{y-=rh[i];let x=W-14;for(let j=r.length-1;j>=0;j--){const z=sz(r[j]);x-=z;set(L.btn[r[j]],x,y+(rh[i]-z)/2,z);x-=8;}minX=Math.min(minX,x+8);y-=8;});
  const fb=L.btn.fire;if(auto){fb.hidden=true;fb.style.display='none';}
  const sk=clamp(Math.min(Z-2*mg,W*.38,minX-16-12),96,160);set(L.stick,16,hf+(Z-sk)/2,sk);
  const pb=L.root.querySelector('#fPause');pb.style.left=(W-52)+'px';pb.style.top='8px';return true;};

/* ----- the scale for this frame and the height map (world y -> drawn y; the road line and everything under it stay put) ----- */
function slFrame(L){const VV=SL.port?SL.VV:L.box.h/L.sc,K=Math.max(1,.225*VV/CH),t0=VH-VV,room=FL-t0-14-62*K;   // room: drawn height above the road a 58-unit flyer's feet may use
  SL.VV=VV;SL.k=K;SL.t0=t0;SL.d0=Math.min(150,room*.8/K);SL.s=clamp((room-K*SL.d0)/(DTOP-SL.d0),.25,K);}
const my=y=>{const d=FL-y;if(d<=0)return y;const K=SL.k,d0=SL.d0;return FL-(d<=d0?d*K:d0*K+(d-d0)*SL.s);};
SL.my=my;
const at=(c,x,y,k)=>{c.save();c.translate(x,my(y));c.scale(k,k);c.translate(-x,-y);};   // run the old drawing code for a body at (x,y): mapped and K times bigger about that spot

/* ----- backdrop tiles (built once per size): far skyline and mid buildings, drawn in world units, blitted with parallax ----- */
let tiles={};
function slTile(kind,Hh,res){const key=kind+'|'+Math.round(Hh)+'|'+res.toFixed(2);let o=tiles[key];if(o)return o;if(Object.keys(tiles).length>5)tiles={};
  const far=kind==='far',TW=far?960:1280,cv=document.createElement('canvas');cv.width=Math.ceil(TW*res);cv.height=Math.ceil(Hh*res);const g=cv.getContext('2d');g.scale(res,res);const win=[];
  let x=0,i=0;while(x<TW-30){const r=hs(i*7+(far?3:11)),r2=hs(i*13+(far?5:17)),bw=Math.min(TW-x,far?44+64*r:118+92*r),bh=Hh*(far?.34+.44*r2:.24+.36*r2),top=Hh-bh;
    if(far){g.fillStyle='#120b27';g.fillRect(x,top,bw-3,bh);g.fillStyle='#1b1238';g.fillRect(x,top,bw-3,2);
      if(r>.6){g.fillStyle='#120b27';g.fillRect(x+bw*.45,top-22,2,22);g.fillStyle='#ff2a4a';g.fillRect(x+bw*.45-1,top-24,4,3);}
      for(let wy=top+10;wy<Hh-14;wy+=14)for(let wx=x+6;wx<x+bw-10;wx+=10)if(hs(wx*3+wy*7)>.93){g.fillStyle='rgba(255,190,120,.32)';g.fillRect(wx,wy,3,4);}}
    else{g.fillStyle='#21153f';g.fillRect(x,top,bw,bh);g.fillStyle='#34245e';g.fillRect(x,top,3,bh);g.fillStyle='#2c1e52';g.fillRect(x-2,top-4,bw+4,5);
      for(let wy=top+14,rr=0;wy<Hh-22;wy+=17,rr++)for(let wx=x+10,cc=0;wx<x+bw-14;wx+=15,cc++){const q=hs(i*131+rr*17+cc*5);
        if(q>.74){const warm=hs(i*7+rr)>.45;g.fillStyle=warm?'rgba(255,205,125,.78)':'rgba(125,225,255,.72)';g.fillRect(wx,wy,7,8);win.push([wx,wy,warm]);}else{g.fillStyle='rgba(8,5,20,.55)';g.fillRect(wx,wy,7,8);}}
      if(r2>.5){const c=['#ff2d95','#19e3ff','#ffb020','#3dff8a'][Math.floor(hs(i*9)*4)],sw=bw*.42,sy=top+bh*.18,sx=x+bw*.3;   // a neon sign bolted to the facade (two brackets)
        g.fillStyle='#14102a';g.fillRect(sx+6,sy-6,3,6);g.fillRect(sx+sw-9,sy-6,3,6);g.globalAlpha=.25;g.fillStyle=c;g.fillRect(sx-5,sy-5,sw+10,28);g.globalAlpha=1;g.fillStyle=c;g.fillRect(sx,sy,sw,18);g.fillStyle='rgba(10,5,25,.8)';g.fillRect(sx+3,sy+3,sw-6,12);}}
    x+=bw+(far?2:8+20*hs(i*29));i++;}
  return tiles[key]={cv,TW,Hh,win};}
function slBlit(c,kind,k,cam,x0,w,t0,res,t){const o=slTile(kind,FL+2-t0,res),off=cam*k,TW=o.TW;let x=x0-((off%TW)+TW)%TW;SL.tag='L-'+kind;
  for(;x<x0+w;x+=TW){c.drawImage(o.cv,x,t0,TW,o.Hh);
    if(kind==='mid'&&o.win.length){const n=o.win.length,q=Math.floor(t*.9);for(let j=0;j<4;j++){const wv=o.win[Math.floor(hs(q*17+j*131)*n)],a=.5+.5*Math.sin(t*5+j*2);   // a few windows flick off and on
        c.fillStyle=a>.5?(wv[2]?'#ffe2a8':'#bff3ff'):'rgba(8,5,20,.9)';c.fillRect(x+wv[0],t0+wv[1],7,8);}}}
  SL.tag='';}

/* ----- near layer (x1, on the road): lamps and the prop sheets, every one <= 1.25 characters tall ----- */
const PROPS=[['car',.62,0],['police',.72,0],['holo',1.15,0],['beacon',.95,0],['steam',.9,0],['neon',.5,1],['banner',.55,1]];   // [sheet, height in characters, 1 = a sign on a pole]
function slNear(c,cam,x0,w,t){const C=CH*SL.k,cell=520,i0=Math.floor((cam+x0)/cell)-1,i1=Math.ceil((cam+x0+w)/cell)+1;
  for(let i=i0;i<=i1;i++){const r=hs(i*41+7),px=i*cell-cam+cell*(.2+.6*hs(i*5+1));
    if(hs(i*3+2)<.45){const lx=i*cell-cam+cell*.05,ph=1.25*C;c.fillStyle='#1a1530';c.fillRect(lx-2.5*SL.k,FL-ph,5*SL.k,ph);c.fillRect(lx-2.5*SL.k,FL-ph,18*SL.k,4*SL.k);   // street lamp
      c.fillStyle='rgba(255,226,150,.16)';c.beginPath();c.ellipse(lx+16*SL.k,FL-ph+18*SL.k,20*SL.k,26*SL.k,0,0,6.283);c.fill();c.fillStyle='#fff1b8';c.fillRect(lx+12*SL.k,FL-ph+3*SL.k,8*SL.k,4*SL.k);}
  }
  if(typeof ART!=='undefined'&&ART.footProps)ART.footProps(c,cam,w,FL,t);}
/* the prop sheets, through ART.footProps (same hook as the old street; this part owns it while the flag is on). x from SL.x0 (the screen's left edge in view units) */
if(typeof ART!=='undefined')ART.footProps=(c,cam,w,fl,t)=>{if(!RET.sprites||!ART.drawAnim)return;const C=CH*SL.k,x0=SL.x0||0,cell=400,i0=Math.floor((cam+x0)/cell)-1,i1=Math.ceil((cam+x0+w)/cell)+1;
  for(let i=i0;i<=i1;i++){const r=hs(i*41+7),px=i*cell-cam+cell*(.2+.6*hs(i*5+1));
    if(r>.58)continue;
    const q=PROPS[Math.floor(hs(i*97+3)*PROPS.length)],k='prop-'+q[0]+'/'+(q[0]==='steam'?'glow':'loop'),m=ART.ANIM.s[k];if(!m||!ART.anim(k))continue;
    const h=q[1]*C,sc=h/m[3];
    if(q[2]){const top=fl-1.25*C;c.fillStyle='#1d1834';c.fillRect(px-3*SL.k,top+h*.6,6*SL.k,fl-top-h*.6);c.fillRect(px-12*SL.k,fl-4*SL.k,24*SL.k,4*SL.k);   // the pole the sign hangs on
      SL.tag='prop-m';ART.drawAnim(c,k,t+i*.37,px,top+h/2,sc,false,.95);}
    else{SL.tag='prop';ART.drawAnim(c,k,t+i*.37,px,fl-h/2,sc,false,.95);}   // prop sheets are centre-anchored (build.py): centre = road - h/2 puts the bottom row on the road
    SL.tag='';}};

function slBackdrop(c,S,vw,exl,exr,t0,res){const x0=-exl,w=vw+exl+exr,cam=S.camX,t=S.time,fh=FL-t0;
  const g=c.createLinearGradient(0,t0,0,FL);g.addColorStop(0,'#06041a');g.addColorStop(.55,'#1c0b37');g.addColorStop(1,'#3b1553');c.fillStyle=g;c.fillRect(x0,t0-4,w,fh+8);
  c.fillStyle='rgba(255,255,255,.55)';for(let i=0;i<34;i++){const sx=x0+((hs(i*3)*w*1.4-cam*.02)%w+w)%w;c.fillRect(sx,t0+hs(i*7+1)*fh*.5,1.4,1.4);}
  const mr=Math.max(7,fh*.03),mx=x0+w*.84,mY=t0+fh*.13;c.fillStyle='rgba(240,220,255,.12)';c.beginPath();c.arc(mx,mY,mr*2.6,0,6.283);c.fill();   // small crescent, high right, off the action
  c.fillStyle='#efe2ff';c.beginPath();c.arc(mx,mY,mr,0,6.283);c.fill();c.fillStyle='#0b061f';c.beginPath();c.arc(mx+mr*.45,mY-mr*.2,mr*.9,0,6.283);c.fill();
  slBlit(c,'far',SL.speeds.far,cam,x0,w,t0,res,t);
  c.fillStyle='rgba(30,12,60,.35)';c.fillRect(x0,FL-fh*.45,w,fh*.45+2);   // haze between the layers
  slBlit(c,'mid',SL.speeds.mid,cam,x0,w,t0,res,t);
  const rg=c.createLinearGradient(0,FL,0,VH);rg.addColorStop(0,'#251c40');rg.addColorStop(1,'#09070f');c.fillStyle=rg;c.fillRect(x0,FL,w,VH-FL+2);   // the road
  c.fillStyle='#5a4590';c.fillRect(x0,FL,w,3);c.fillStyle='rgba(255,210,120,.32)';const so=((cam%120)+120)%120;for(let x=x0-so;x<x0+w;x+=120)c.fillRect(x,FL+36,48,3);
  SL.x0=x0;slNear(c,cam,x0,w,t);}

/* ----- the frame ----- */
SL.draw=c=>{const L=IN.L(),S=F.S;if(!L||!S)return false;slFrame(L);
  const K=SL.k,t0=SL.t0,dpr=L.dpr||1,sc=L.sc*dpr,vw=L.vw,exl=L.exl||0,exr=L.exr||0,P=S.P,u=1/L.sc;
  c.setTransform(1,0,0,1,0,0);c.fillStyle='#05030c';c.fillRect(0,0,L.cv.width,L.cv.height);
  c.setTransform(sc,0,0,sc,(L.box.x-L.ox)*dpr,(L.box.y-L.oy)*dpr-t0*sc);
  const sh=S.shake?IN.ftRnd(-S.shake,S.shake)*.5:0;SL.road=L.box.y+(FL+sh*.5-t0)*L.sc;SL.cam=S.camX;
  c.save();c.translate(sh,sh*.5);slBackdrop(c,S,vw,exl,exr,t0,Math.min(2,sc));
  c.translate(-S.camX,0);const lo=S.camX-exl,hi=S.camX+vw+exr;
  for(const [px,py,pw] of S.st.plats){const y=my(py);c.fillStyle='#3a2a52';c.fillRect(px,y,pw,10);c.fillStyle='#19e3ff';c.fillRect(px,y,pw,2);}
  if(S.cp==null&&S.st.cp){c.fillStyle='#19e3ff55';c.fillRect(S.st.cp-2,FL-1.2*CH*K,4,1.2*CH*K);c.fillStyle='#19e3ff';c.fillRect(S.st.cp-2,FL-1.2*CH*K,22,12);}
  for(const p of S.pr){if(p.hp<=0&&!p.fl)continue;const hd=Math.min(p.h,1.25*CH),up=p.y<FL-1;
    if(up){const y=my(p.y);c.fillStyle='#1d1834';c.fillRect(p.x-3*K,y,6*K,FL-y);c.fillRect(p.x-12*K,FL-4*K,24*K,4*K);}   // a sign stands on its pole
    at(c,p.x,p.y,K);SL.tag='bprop';c.fillStyle=p.fl>0?'#fff':p.c;c.fillRect(p.x-p.w/2,p.y-hd,p.w,hd);SL.tag='';c.strokeStyle='#ffffff55';c.lineWidth=2;c.strokeRect(p.x-p.w/2+2,p.y-hd+2,p.w-4,hd-4);c.restore();}
  const PK=F.PICKUPS;
  for(const p of S.pk){const d=PK[p.k];if(!d)continue;const bob=Math.sin(p.t*5)*3,r=17*K,sx=p.x,edge=Math.min(sx-r-lo,hi-sx-r),fa=clamp((edge-6)/24,0,1);if(fa<=0)continue;
    const y=p.y+bob,Y=Math.max(my(y),t0+4+r);   // never above the top edge
    const ga=(p.t>13?.5+.5*Math.sin(p.t*20):1)*fa;c.save();c.translate(p.x,Y);c.scale(K,K);c.translate(-p.x,-y);c.globalAlpha=ga;SL.tag='pk';
    if(p.k==='ammo'&&RET.sprites&&typeof ART!=='undefined'&&ART.ANIM.c['pk-ammo/spin']&&ART.anim('pk-ammo/spin'))ART.drawAnim(c,'pk-ammo/spin',p.t,p.x,y,32/ART.ANIM.c['pk-ammo/spin'].bw,false);
    else{c.fillStyle=d.c;c.beginPath();c.arc(p.x,y,15,0,6.283);c.fill();c.fillStyle='#05030c';c.font='bold 15px monospace';c.textAlign='center';c.textBaseline='middle';c.fillText(d.ic,p.x,y+1);}
    SL.tag='';c.globalAlpha=1;c.restore();}
  for(const e of S.E){if(e.dead&&!(e.ext&&!e.remove))continue;const ex=e.h*K*.7;if(e.x-ex>hi||e.x+ex<lo)continue;   // fully off screen: nothing to draw (a shape fallback's label would hang past the edge)
    const pose=e.dead?'die':(()=>{try{return e.def.pose?e.def.pose(e):'idle';}catch(x){return'idle';}})(),ey=e.ext&&e.fly?e.y+e.h/2:e.y;
    at(c,e.x,ey,K);
    if(e.tele>0){c.fillStyle='#ff304a';c.globalAlpha=.35+.35*Math.sin(S.time*30);c.beginPath();c.arc(e.x+e.facing*e.w*.4,e.y-e.h*.62,10+e.w*.1,0,6.283);c.fill();c.globalAlpha=1;}
    if(e.wind>0){c.strokeStyle='#ff304a';c.lineWidth=3;c.strokeRect(e.x-e.w/2-4,e.y-e.h-4,e.w+8,e.h+8);}
    c.globalAlpha=e.grace>0?.65:1;ART.fE=e;SL.tag='actor';IN.drawWho(c,e.id,pose,e.x,ey,e.h,e.facing<0,e.dead?e.dt_||0:e.t,e.flash>0?'#ffffff':(e.def.c||'#d04'));ART.fE=null;SL.tag='';c.globalAlpha=1;
    if(e.def.front&&e.def.fb){c.fillStyle='#a0c0ff';c.fillRect(e.x+e.facing*e.w*.5-3,e.y-e.h*.9,6,e.h*.8);}c.restore();}
  if(S.st.hook&&S.st.hook.draw){const sw=[];for(const e of S.E)if(e.lane&&!e.dead){const y0=e.lane.y;sw.push([e.lane,y0]);e.lane.y=FL-(FL-my(y0+30))/K-30;}   // lanes: drawn under a plain K stretch, so pre-map their height
    const ft=c.fillText;c.fillText=function(s_,x,y,mw){c.save();c.translate(x,y);c.scale(1,1/K);ft.call(c,s_,0,0,mw);c.restore();};   // no stretched letters
    c.save();c.translate(0,FL);c.scale(1,K);c.translate(0,-FL);try{S.st.hook.draw(c,S);}catch(x){}c.restore();delete c.fillText;for(const [l,y0] of sw)l.y=y0;}
  const blink=P.inv>0&&Math.floor(S.time*16)%2;if(!blink||P.hp<=0){at(c,P.x,P.y,K);
    if(P.pw.shield){c.strokeStyle='#5ad1ff';c.lineWidth=2+P.pw.shield.lv;c.beginPath();c.arc(P.x,P.y-34,44,0,6.283);c.stroke();}
    if(P.dashIF>0){c.fillStyle='#19e3ff33';c.fillRect(P.x-24-P.facing*20,P.y-60,48,58);}
    P._xa=IN.kaiX(P);ART.fE=P;IN.drawWho(c,'kai',IN.ppose(P),P.x,P.y,P.crouch?44:P.h,P.facing<0,S.time,S.feverT>0?'#ffd23a':'#19e3ff',P.crouch);ART.fE=null;
    if(P.shotT>0){const a=P.aim,mx=P.x+Math.cos(a)*28,mY=P.y-(P.crouch?26:44)+Math.sin(a)*20;if(!(window.AH&&AH.ftMuz(c,P.w,mx,mY,a))&&F.WEAPONS[P.w].kind!=='arc'){c.fillStyle='#fff';c.beginPath();c.arc(mx,mY,5,0,6.283);c.fill();}}c.restore();}
  for(const b of S.pb){at(c,b.x,b.y,K);if(window.AH&&AH.ftBul(c,b)){c.restore();continue;}c.fillStyle=b.c;if(b.kind==='fire'){c.globalAlpha=Math.max(0,b.life*2);c.beginPath();c.arc(b.x,b.y,b.r,0,6.283);c.fill();c.globalAlpha=1;}else if(b.kind==='rkt'){c.fillRect(b.x-8,b.y-3,16,6);}else{c.fillRect(b.x-6,b.y-2,12,4);}c.restore();}
  for(const g of S.bombsL){at(c,g.x,g.y,K);if(window.AH&&AH.ftDraw(c,'fx-ft-grenade',g.x,g.y,22,S.time*7)){c.restore();continue;}c.fillStyle='#ffb020';c.beginPath();c.arc(g.x,g.y,7,0,6.283);c.fill();c.restore();}
  for(const b of S.eb){at(c,b.x,b.y,K);if(RET.read&&window.READ)READ.footEb(c,b);else{c.fillStyle=b.c;c.beginPath();c.arc(b.x,b.y,b.r,0,6.283);c.fill();c.fillStyle='#fff';c.beginPath();c.arc(b.x,b.y,b.r*.45,0,6.283);c.fill();}c.restore();}
  for(const f of S.fx){c.globalAlpha=Math.min(1,f.l*3);
    if(f.pic&&window.AH){at(c,f.x,f.y,K);AH.ftFx(c,f);c.restore();continue;}
    if(f.arc&&window.AH&&AH.ftArc(c,Object.assign({},f,{arc:f.arc.map(([x,y])=>[x,my(y)])}))){}else if(f.arc){c.strokeStyle=f.c;c.lineWidth=3*K;c.beginPath();f.arc.forEach(([x,y],i)=>{const j=i?IN.ftRnd(-6,6):0;i?c.lineTo(x+j,my(y)+j):c.moveTo(x,my(y));});c.stroke();}
    else{at(c,f.x,f.y,K);if(f.slash){c.strokeStyle=f.c;c.lineWidth=4;c.beginPath();c.arc(f.x,f.y,f.w*.5,-1.2,1.2);c.stroke();}
      else if(f.ring){c.strokeStyle=f.c;c.lineWidth=4;c.beginPath();c.arc(f.x,f.y,f.r*(1-f.l/f.m*.6),0,6.283);c.stroke();}
      else{c.fillStyle=f.c;c.fillRect(f.x-f.r/2,f.y-f.r/2,f.r,f.r);}c.restore();}}c.globalAlpha=1;
  const fs=n=>Math.max(14,n)*u,ptop=t0+(SL.hudB||100*u)+4*u;c.textAlign='center';c.textBaseline='alphabetic';SL.tag='pop';
  for(const p of S.pop){c.font='bold '+fs(p.big?17:15)+'px monospace';const tw=c.measureText(p.t).width,fh=fs(p.big?17:15),pl=S.camX+tw/2+8*u,pr=S.camX+vw-tw/2-8*u;   // inside the field, under the HUD
    c.globalAlpha=Math.min(1,p.l/p.m*2.5);c.fillStyle=p.c;c.fillText(p.t,pl>pr?S.camX+vw/2:clamp(p.x,pl,pr),Math.max(ptop+fh,Math.min(VH-8*u,my(p.y))));}c.globalAlpha=1;SL.tag='';
  c.restore();slHud(c,L,S,vw,u,fs);return true;};

/* ----- HUD: one panel top-left; score + time left of the pause button; hint below both; boss bar above the progress bar ----- */
function slRR(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();}
function slHud(c,L,S,vw,u,fs){const P=S.P,t0=SL.t0,hb=[],box=(x,y,w,h)=>hb.push({x,y:y-t0,w,h}),m=10*u,pd=8*u,W=F.WEAPONS[P.w],PK=F.PICKUPS;SL.tag='hud';
  c.textBaseline='top';c.textAlign='left';c.font='bold '+fs(14)+'px monospace';
  const wt=W.n+(P.w==='pistol'?'':' LV'+P.lv+' · '+P.ammo),pw=[];for(const k of IN.PW_KEYS){const p=P.pw[k];if(p)pw.push([PK[k].c,PK[k].ic+(PK[k].max>1?p.lv:'')]);}
  const bt='●×'+P.bombs,r3=c.measureText(bt).width+pw.length*36*u;
  const iw=Math.max(P.max*20*u,c.measureText(wt).width,r3,110*u),pw_=iw+2*pd,ph=pd+16*u+6*u+16*u+6*u+16*u+8*u+5*u+pd,x=m,y=t0+m;
  c.fillStyle='rgba(5,3,12,.62)';slRR(c,x,y,pw_,ph,8*u);c.fill();c.strokeStyle='rgba(255,255,255,.12)';c.lineWidth=u;c.stroke();
  for(let i=0;i<P.max;i++){c.fillStyle=i<P.hp?'#ff4060':'#ffffff26';c.beginPath();c.arc(x+pd+8*u+i*20*u,y+pd+8*u,7.5*u,0,6.283);c.fill();}
  let ry=y+pd+22*u;c.fillStyle=W.c;c.fillText(wt,x+pd,ry);ry+=22*u;
  c.fillStyle='#ffb020';c.fillText(bt,x+pd,ry);let px=x+pd+c.measureText(bt).width+14*u;for(const [col,t] of pw){c.fillStyle=col;c.fillText(t,px,ry);px+=36*u;}ry+=24*u;
  c.fillStyle='#ffffff1c';c.fillRect(x+pd,ry,iw,5*u);c.fillStyle=S.feverT>0?'#ffd23a':'#ff2d95';c.fillRect(x+pd,ry,iw*clamp(S.feverT>0?S.feverT/8:S.fever/100,0,1),5*u);
  box(x,y,pw_,ph);
  c.textAlign='right';c.font='bold '+fs(16)+'px monospace';const st=String(S.score),tt=IN.fmtT(S.time),sw=Math.max(c.measureText(st).width,c.measureText(tt).width);
  let sr=vw-60*u,sy=t0+m+2*u;if(x+pw_+10*u>sr-sw){sr=vw-10*u;sy=t0+60*u;}   // narrow screen: under the pause button
  c.fillStyle='#fff';c.fillText(st,sr,sy);c.font='bold '+fs(14)+'px monospace';c.fillStyle='#c9c3e6';c.fillText(tt,sr,sy+20*u);box(sr-sw,sy,sw,38*u);
  const hudB=Math.max(y+ph,sy+38*u)-t0;SL.hudB=hudB+8*u;
  if(S.boss&&!S.boss.dead){const bw=vw*.7,bx=vw*.15,by=VH-48*u;c.fillStyle='#ffffff22';c.fillRect(bx,by,bw,10*u);c.fillStyle='#ff2050';c.fillRect(bx,by,bw*Math.max(0,S.boss.hp/S.boss.max),10*u);
    c.textAlign='center';c.fillStyle='#fff';c.textBaseline='bottom';c.font='bold '+fs(14)+'px monospace';c.fillText('WARDEN',vw/2,by-2*u);box(bx,by-18*u,bw,28*u);}
  c.textAlign='center';c.textBaseline='top';let hint=null;const line=S.note.t>0?S.note.txt:IN.hintOn()?IN.hintText():'';
  if(line){c.font='bold '+fs(16)+'px monospace';const tw=Math.min(c.measureText(line).width,vw-40*u),hy=t0+hudB+8*u;c.fillStyle='#000b';c.fillRect(vw/2-tw/2-8*u,hy,tw+16*u,26*u);c.fillStyle='#fff';c.fillText(line,vw/2,hy+4*u,vw-40*u);hint={x:vw/2-tw/2-8*u,y:hy-t0,w:tw+16*u,h:26*u};SL.hudB=hudB+42*u;}
  SL.tag='';if(S.st.hook&&S.st.hook.hud)try{S.st.hook.hud(c,vw,u,box,fs,S);}catch(x){}
  L.hud={hud:hb,hint,vw};IN.ghost();}
})();
