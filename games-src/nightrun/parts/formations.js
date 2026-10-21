// PURPOSE: formation library (VARIETY A)
// FLAG: vary (?vary=0), vary2 (?vary2=0)
// TEST: vary-test.js
/* ---------- formations.js: the formation library (VARIETY A, owner 18 Oct 2026: "Game is extremely repetitive"). Flag RET.vary; ?vary=0 = the old waves exactly.
   A formation is a SPATIAL idea, not a recolour of one row: pincers from top and bottom, an X that converges, a snake on a path, a spiral, a wall whose gap moves...
   Every entry declares
     tags   what it feels like (ranks, flank, swarm, hazard, elite, rush, breath)          t     the first story stage it may appear on
     cost   enemy-equivalents per piece (the director's budget unit)                        gap   the smallest free gap it leaves ACROSS the screen, px (0 = it never spans it)
     tele   how it is announced: edge = the red ring where it enters (en), warn = a marker on the top/bottom edge one beat before,
            line = a lane / wall flash one beat before                                     kinds the enemy kinds it uses;  role = the job a kind does in it
   The director (stagescripts.js) asks for one PIECE at a time, on its own beats and budget: the formation evolves over its moment (the gap walks, the snake grows,
   the pincer closes again from the other side). Caps, entry grace, aimed-shot rules and the spawn radius stay the engine's (en, eb, DIR.safe, DMG).
   Units with a path (e.fp) are moved here (FM.mv, called first in the b.js enemy loop). Every path ends flying left, so a unit that survives still leaks (leak.js).
   A zoo kind that is not available (?zoo=0, or not unlocked on this stage) is replaced by an old kind (FM.SUB). ---------- */
if(RET.vary===undefined)RET.vary=!/[?&]vary=0/.test(location.search);
const FM=window.FM={GAP:130,L:{},TEL:[],cur:null,
  SUB:{shielder:'turret',kamikaze:'charger',splitter:'drone',bomber:'gunship',sniper:'turret',healer:'drone',carrier:'gunship',minelayer:'mine'},
  stat:{pieces:0,units:0,minGap:1e9,kinds:{},byF:{}},
  reset(){this.TEL.length=0;this.cur=null;this.stat={pieces:0,units:0,minGap:1e9,kinds:{},byF:{}};},
  def(id,o){this.L[id]=Object.assign({id,tags:[],t:1,cost:3,tele:'edge',gap:0,kinds:['drone'],role:''},o);},
  /* a zoo kind is usable when the zoo is on and the stage has unlocked it (ZOO.T[k].st) */
  ok(k){const Z=window.ZOO;if(!Z||!Z.T[k]||k==='zdrn')return true;if(!RET.zoo)return false;if(G.lab)return true;return ST.on?ST.n>=Z.T[k].st&&!(ST.def&&ST.def.ch):G.t>=Z.T[k].tt;},
  k(k){return this.ok(k)?k:this.SUB[k]||'drone';},
  tk(){return (120+15*diff())/150;},                      // path speed follows the old drone speed (120 + 15 per difficulty step)
  py(){return P?clamp(P.y,90,H-90):H/2;},                 // the ship's lane when a piece starts (pieces aim at a lane, never at a point)
  /* ---- instances: one per moment; piece k is the k-th call of the director ---- */
  make(id,o){const d=this.L[id];if(!d)return null;return Object.assign({id,def:d,k:0,r:0,mir:false,el:0,tk:1,s:{}},o||{});},
  piece(I){if(!I)return;const c=this.cur;this.cur=I;try{I.def.f(I,I.k);}finally{this.cur=c;}I.k++;this.stat.pieces++;this.stat.byF[I.id]=(this.stat.byF[I.id]|0)+1;},
  later(I,beats,fn){DIR.later(beats,()=>{if(G.dead||ST.over)return;const c=this.cur;this.cur=I;try{fn();}finally{this.cur=c;}});},
  /* ---- one unit. pf(t,e) = its position at path time t (seconds); x/y are taken from the path when there is one ---- */
  u(kind,x,y,pf,o){const I=this.cur||{},Z=window.ZOO;let k=this.k(kind);o=o||{};
    if(I.r&&k==='drone'&&!o.keep)k='flank';                  // a remix: the drones come back as arrowheads, a little faster
    const mir=!!I.mir,fy=v=>mir?H-v:v,pt0=o.pt||0;let f=null;
    if(pf){f=mir?(t,q)=>{const p=pf(t,q);return [p[0],H-p[1]];}:pf;const p=f(Math.max(0,pt0),null);x=p[0];y=p[1];}else y=fy(y);
    const opt=Object.assign({x,y,amp:0},o);delete opt.pt;delete opt.keep;
    if(k!==kind&&kind!=='drone'){delete opt.r;delete opt.hp;}
    const zk=!!(Z&&RET.zoo&&Z.T[k]&&k!=='zdrn');let e;if(window.VAR)VAR.st.fm++;try{e=zk?Z.mk(k,opt):en(k,opt);}finally{if(window.VAR)VAR.st.fm--;}
    e.fid=I.id||'';if(k==='gate'||k==='turret'||k==='gunship'||k==='charger'||k==='carrier'||k==='bomber'||k==='minelayer'||k==='sniper'||k==='kamikaze')f=null;   // these keep their own AI
    if(I.el&&!e.el&&(k==='drone'||k==='flank')){e.el=1;e.hp=Math.round(e.hp*2);e.max=e.hp;e.r=Math.round(e.r*1.25);e.score*=2;}
    if(f){e.pth=f;e.fp=1;e.pt=pt0;e.tk=(I.tk||1)*(I.r?1.12:1)*this.tk();const p=f(Math.max(0,pt0),e);e.ox=e.x-p[0];
      if(zk&&(k==='shielder'||k==='splitter'||k==='healer'))e.zst=1;}            // they fire / heal while they fly (zoo.js beat)
    this.stat.units++;this.stat.kinds[k]=(this.stat.kinds[k]|0)+1;NR.emit('fmUnit',{e,I});return e;},
  /* ---- movement of a path unit (true = done here) ---- */
  mv(e,dt,d){if(!e.fp||!RET.vary)return false;e.pt+=dt*(e.tk||1);
    const p=e.pth(Math.max(0,e.pt),e);let x=p[0]+e.ox,y=p[1];
    if(e.drp){const s=clamp((G.t-e.drp.t0)/e.drp.T,0,1),q=s*s*(3-2*s);y=e.drp.y0+(y-e.drp.y0)*q;if(s>=1)e.drp=null;}
    e.vx=(x-e.x)/Math.max(dt,1e-4);e.x=x;e.y=y;e.by=y;
    if(e.type==='shielder'){const fa=Math.atan2(P.y-e.y,P.x-e.x);e.fa=e.fa==null?fa:e.fa+angD(fa,e.fa)*Math.min(1,dt*1.6);}
    if(e.y>H+60||e.y<-140){e.dead=1;}                        // fell or rose out of the screen (meteors): gone, no leak
    if(e.pt>45)e.x=-300;                                     // a lost unit counts as a leak and is removed
    return true;},
  /* ---- telegraphs: lane flash, wall column with its gap, top/bottom edge markers (DIR's WARN) ---- */
  tel(o){o.b=G.bc;o.t0=G.t;this.TEL.push(o);return o;},
  untel(o){const i=this.TEL.indexOf(o);if(i>=0)this.TEL.splice(i,1);},
  warn(x,side){const w={x,y:side<0?10:H-10,b:G.bc,kind:'flank',side};WARN.push(w);return w;},
  unwarn(w){const i=WARN.indexOf(w);if(i>=0)WARN.splice(i,1);},
  edge(e,side){const r=G.rings[G.rings.length-1];if(r&&r.x===W-14){r.x=clamp(e.x,30,W-30);r.y=side<0?14:H-14;}},   // move en()'s entry ring to the edge it really comes in from
  draw(t){if(!RET.vary||!this.TEL.length)return;ctx.save();
    for(const o of this.TEL){const k=clamp((G.t-o.t0)/Math.max(.2,o.T||.5),0,1),bl=SET.reduce?1:(BK(t,12)?.65:1);ctx.globalAlpha=(.35+.5*k)*bl;ctx.strokeStyle=o.c||'#ff7080';ctx.lineWidth=2;ctx.setLineDash([10,8]);
      if(o.k==='lane'){ctx.beginPath();ctx.moveTo(W*.35,o.y);ctx.lineTo(W-6,o.y);ctx.stroke();}
      else if(o.k==='col'){ctx.beginPath();ctx.moveTo(o.x,8);ctx.lineTo(o.x,o.gc-o.g/2);ctx.moveTo(o.x,o.gc+o.g/2);ctx.lineTo(o.x,H-8);ctx.stroke();
        ctx.setLineDash([]);ctx.strokeStyle='#3dffb0';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(o.x-8,o.gc-o.g/2);ctx.lineTo(o.x+8,o.gc-o.g/2);ctx.moveTo(o.x-8,o.gc+o.g/2);ctx.lineTo(o.x+8,o.gc+o.g/2);ctx.stroke();}
      else if(o.k==='dot'){ctx.setLineDash([]);ctx.beginPath();ctx.arc(o.x,o.y,10+14*(1-k),0,7);ctx.stroke();}}
    ctx.setLineDash([]);ctx.restore();},
  tickTel(){for(let i=this.TEL.length-1;i>=0;i--)if(G.bc-this.TEL[i].b>=(this.TEL[i].nb||1)+1)this.TEL.splice(i,1);}
};
/* ---- path builders (absolute screen coordinates; t in seconds at speed factor 1) ---- */
const fmSeg=(pts,v)=>{const L=[0];for(let i=1;i<pts.length;i++)L.push(L[i-1]+Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]));
  const n=pts.length-1,a=pts[n-1],b=pts[n],ll=Math.max(1,L[n]-L[n-1]),ux=(b[0]-a[0])/ll,uy=(b[1]-a[1])/ll;
  return t=>{const s=t*v;if(s>=L[n]){const q=s-L[n];return [b[0]+ux*q,b[1]+uy*q];}let i=1;while(L[i]<s)i++;const f=(s-L[i-1])/Math.max(1e-6,L[i]-L[i-1]);
    return [pts[i-1][0]+(pts[i][0]-pts[i-1][0])*f,pts[i-1][1]+(pts[i][1]-pts[i-1][1])*f];};};
const fmCy=y=>clamp(y,40,H-40);
const fmBs=()=>Math.max(.3,BT.spb||.5);                     // seconds per beat
const fmSide=(I,k)=>((k+(I.s.sd||0))&1)?1:-1;
/* =========================== THE LIBRARY =========================== */
/* 1 pincer: two arms come in from the top and bottom edges and fold into two lanes 164 px apart around your lane */
FM.def('pincer',{tags:['flank'],t:3,cost:3,tele:'warn',gap:130,f(I,k){const py=FM.py(),x0=gr(640,820);
  for(const s of[-1,1]){const w=FM.warn(x0,s);FM.later(I,1,()=>{FM.unwarn(w);const ly=fmCy(py+s*82);
    for(let i=0;i<(k%2?2:1);i++){const e=FM.u('drone',0,0,fmSeg([[x0+i*50,s<0?-24:H+24],[x0+i*50-90,ly],[x0+i*50-260,ly],[-200,ly]],150),{pt:-i*.3});FM.edge(e,s);}});}}});
/* 2 crossX: two diagonal lines that cross into an X in the middle of the screen */
FM.def('crossX',{tags:['ranks'],t:1,cost:4,f(I,k){const s=fmSide(I,k),y0=s<0?70:H-70,vy=-s*58;
  for(let i=0;i<4;i++){const yy=y0-s*i*44;FM.u('drone',0,0,t=>[W+30+i*40-150*t,fmCy(yy+vy*t)],{});}}});
/* 3 snake: one long body on an S-shaped path; every piece adds four more links to the same path */
FM.def('snake',{tags:['ranks','flank'],t:1,cost:4,f(I,k){if(!I.s.p){const a=gr(120,180),y=gr(H*.35,H*.65),pts=[];for(let x=W+40;x>=-200;x-=40)pts.push([x,fmCy(y+a*Math.sin((W+40-x)/170))]);I.s.p=fmSeg(pts,150);}
  for(let i=0;i<4;i++)FM.u('drone',0,0,I.s.p,{pt:-i*.34});}});
/* 4 spiral: five swarmers ride in on a ring that winds inwards, then the knot flies left */
FM.def('spiral',{tags:['swarm'],t:5,cost:3,f(I,k){const cy=gr(150,H-150),dir=fmSide(I,k);
  for(let i=0;i<5;i++){const a0=i*1.2566;FM.u('swarm',0,0,t=>{const cx=t<1.6?W+170-(W+170-W*.7)*t/1.6:W*.7-130*(t-1.6),r=Math.max(26,150-50*t),a=a0+dir*1.7*t;return [cx+Math.cos(a)*r,cy+Math.sin(a)*r*.8];},{by:cy});}}});
/* 5 bloom: a tight ring that bursts open into a wide circle and drifts on */
FM.def('bloom',{tags:['swarm'],t:4,cost:3,f(I,k){const cy=gr(170,H-170);
  for(let i=0;i<7;i++){const a=i*0.8976;FM.u('swarm',0,0,t=>{const cx=W+60-170*t,r=t<2.4?18:18+Math.min(150,(t-2.4)*110);return [cx+Math.cos(a)*r,cy+Math.sin(a)*r];},{by:cy});}}});
/* 6 noose: half rings that close on the lane you were in; the free side is behind you */
FM.def('noose',{tags:['flank','elite'],t:9,cost:3,f(I,k){const py=FM.py(),s=fmSide(I,k);
  for(let i=0;i<3;i++){const a0=s*(0.6+i*0.55);FM.u('drone',0,0,t=>{const r=Math.max(70,210-55*t),cx=W+120-150*t;return [cx+Math.cos(Math.PI-a0)*r*.6,fmCy(py-Math.sin(a0)*r)];},{});}}});
/* 7 stairs: a staircase that drops (or climbs) one step on every beat */
FM.def('stairs',{tags:['ranks','rush'],t:3,cost:4,f(I,k){const s=fmSide(I,k),y0=s<0?gr(80,140):gr(H-140,H-80),bs=fmBs();
  for(let i=0;i<4;i++)FM.u('drone',0,0,t=>[W+30+i*48-140*t,fmCy(y0-s*Math.min(6,Math.floor(t/bs))*42)],{});}});
/* 8 zigzag: a column of three that zigzags up and down as it comes */
FM.def('zigzag',{tags:['ranks'],t:1,cost:3,f(I,k){const yc=gr(170,H-170),ph=GR()*2;
  for(let i=0;i<3;i++)FM.u('drone',0,0,t=>{const q=((t*.6+ph)%2+2)%2,tri=q<1?q:2-q;return [W+30-140*t,fmCy(yc-110+tri*220+(i-1)*58)];},{});}});
/* 9 orbit: pairs that circle each other while they drift in on a slow wave */
FM.def('orbit',{tags:['ranks','elite'],t:4,cost:2,f(I,k){const yc=gr(140,H-140),ph=GR()*6;
  for(const s of[0,Math.PI])FM.u('drone',0,0,t=>{const cx=W+50-130*t,cy=yc+40*Math.sin(t*.9+ph);return [cx+Math.cos(t*3.2+s)*46,fmCy(cy+Math.sin(t*3.2+s)*46)];},{});}});
/* 10 wall: a full-height column with one gap (>= 150 px) that moves a step every column; the column is flashed one beat before */
FM.def('wall',{tags:['hazard'],t:17,cost:4,tele:'line',gap:150,kinds:['swarm'],f(I,k){const g=150;I.s.gc=I.s.gc==null?FM.py():clamp(I.s.gc+(GR()<.5?-1:1)*gr(50,80),g/2+40,H-g/2-40);const gc=I.s.gc;
  const tl=FM.tel({k:'col',x:W-10,gc,g,nb:1,T:fmBs()});FM.later(I,1,()=>{FM.untel(tl);for(let y=34;y<=H-34;y+=46){if(Math.abs(y-gc)<g/2+9)continue;FM.u('swarm',0,0,t=>[W+20-165*t,y],{by:y});}});}});
/* 11 echo: a short line that comes back on the next two beats, a lane lower each time (a wave of waves) */
FM.def('echo',{tags:['ranks','rush'],t:1,cost:3,f(I,k){const s=fmSide(I,k),y0=gr(110,H-110);
  for(let b=0;b<3;b++)FM.later(I,b,()=>{const y=fmCy(y0+s*b*62);for(let i=0;i<2;i++)FM.u('drone',0,0,t=>[W+30+i*46-175*t,y],{});});}});
/* 12 carrier: a carrier with two escorts orbiting it (gunship + escorts before the carrier is unlocked) */
FM.def('carrier',{tags:['elite'],t:19,cost:5,kinds:['carrier','drone'],role:'carrier + escorts',f(I,k){const y=gr(170,H-200),c=FM.u('carrier',W+80,y);
  for(const s of[0,Math.PI])FM.u('drone',0,0,(t,e)=>{if(e){if(c.hp>0&&!c.dead){e.hx=c.x;e.hy=c.y;}else e.hx=(e.hx==null?W:e.hx)-4;}return [(e&&e.hx!=null?e.hx:W+80)+Math.cos(t*2.2+s)*70,fmCy((e&&e.hy!=null?e.hy:y)+Math.sin(t*2.2+s)*70)];},{});}});
/* 13 mirror: top and bottom pairs that move as mirror images of each other */
FM.def('mirror',{tags:['ranks','flank'],t:3,cost:4,f(I,k){const a=gr(40,90),yo=gr(60,170),ph=GR()*6;
  for(let i=0;i<2;i++)for(const s of[-1,1])FM.u('drone',0,0,t=>[W+30+i*56-140*t,fmCy(H/2+s*(yo+a*Math.sin(t*2+ph)))],{keep:1});}});
/* 14 meteors: mines fall from the top across the lanes; the column you are in is never used and every drop is marked one beat before */
FM.def('meteors',{tags:['hazard'],t:7,cost:3,tele:'warn',gap:120,kinds:['mine'],f(I,k){const xs=[];for(let n=0;n<3;n++){let x=gr(W*.3,W-60),tr=0;while((Math.abs(x-P.x)<110||xs.some(q=>Math.abs(q-x)<120))&&tr++<20)x=gr(W*.3,W-60);xs.push(x);}
  for(const x of xs){const w={x,y:12,b:G.bc,kind:'rain'};WARN.push(w);FM.later(I,1,()=>{FM.unwarn(w);FM.u('mine',0,0,t=>[x-55*t,-26+150*t],{by:-26});});}}});
/* 15 shadow: two drones that hold at the right and mirror your height (they sit where you are not), then peel away */
FM.def('shadow',{tags:['elite'],t:8,cost:2,f(I,k){const s=fmSide(I,k);
  for(let i=0;i<2;i++){const xs=W*(.74+.1*i);FM.u('drone',0,0,(t,e)=>{if(!e)return [W+40,H/2];if(t<1.3)return [W+40-(W+40-xs)*t/1.3,e.my==null?(e.my=H/2):e.my];
    if(t<6){const tg=clamp(H-P.y+s*(i?60:-60),60,H-60);e.my=(e.my==null?tg:e.my)+clamp(tg-e.my,-110*.033,110*.033);return [xs,e.my];}return [xs-180*(t-6),e.my];},{});}}});
/* 16 bait: a plain line that peels apart, half up and half down, when it reaches the middle */
FM.def('bait',{tags:['ranks','rush'],t:5,cost:5,f(I,k){const y=gr(150,H-150);
  for(let i=0;i<5;i++){const s=i%2?1:-1;FM.u('drone',0,0,t=>{const x=W+30+i*50-150*t,d=x<W*.62?Math.min(1,(W*.62-x)/140):0;return [x,fmCy(y+s*d*d*(110+20*i))];},{});}}});
/* 17 cross: two horizontal lines, one sliding down and one sliding up, that pass through each other */
FM.def('cross',{tags:['ranks','flank'],t:4,cost:4,f(I,k){for(const s of[-1,1]){const y0=s<0?H*.22:H*.78;
  for(let i=0;i<2;i++)FM.u('drone',0,0,t=>[W+30+i*52-150*t,fmCy(y0-s*Math.min(H*.56,40*t))],{});}}});
/* 18 sandwich: flankers drop in from both edges while a line pushes through the middle */
FM.def('sandwich',{tags:['flank'],t:4,cost:4,kinds:['flank','drone'],role:'flankers as the bread',f(I,k){DIR.flank(2,true);const y=H/2+gr(-40,40);for(let i=0;i<2;i++)FM.u('drone',0,0,t=>[W+30+i*52-150*t,y],{});}});
/* 19 shieldwall: shielders as a slow moving wall (gaps between them), drones shooting from behind it */
FM.def('shieldwall',{tags:['elite','ranks'],t:4,cost:5,kinds:['shielder','drone'],role:'shielder as a moving wall',gap:130,f(I,k){const off=(k%2)*40;
  for(let i=0;i<2;i++){const y=fmCy(H*.3+i*H*.4+off-20);FM.u('shielder',0,0,t=>[W+40-70*t,y],{});}
  FM.later(I,2,()=>{for(let i=0;i<2;i++){const y=H/2+(i?55:-55);FM.u('drone',0,0,t=>[W+30-90*t,y],{});}});}});
/* 20 healerpack: a healer in the middle of a ring of drones (shoot it first) */
FM.def('healerpack',{tags:['elite'],t:16,cost:5,kinds:['healer','drone'],role:'healer in a pack',f(I,k){const yc=gr(150,H-150);FM.u('healer',0,0,t=>[W+50-110*t,yc],{});
  for(let i=0;i<4;i++){const a=i*1.5708;FM.u('drone',0,0,t=>[W+50-110*t+Math.cos(a+t*1.4)*64,fmCy(yc+Math.sin(a+t*1.4)*64)],{});}}});
/* 21 sniperlanes: snipers on the top and bottom lanes; a short line in between */
FM.def('sniperlanes',{tags:['elite','hazard'],t:14,cost:4,kinds:['sniper','drone'],role:'sniper lanes',f(I,k){const s=fmSide(I,k);FM.u('sniper',W+40,s<0?70:H-70);
  FM.later(I,2,()=>{const y=H/2+gr(-60,60);for(let i=0;i<3;i++)FM.u('drone',0,0,t=>[W+30+i*48-150*t,y],{});});}});
/* 22 kamikaze: a wave of divers, one per beat, each lane further from the last */
FM.def('kamikaze',{tags:['rush'],t:6,cost:3,kinds:['kamikaze'],role:'kamikaze wave',f(I,k){const s=fmSide(I,k);
  for(let b=0;b<2;b++)FM.later(I,b*2,()=>FM.u('kamikaze',W+40,fmCy(H/2+s*(b-1)*150)));}});
/* 23 bomberrun: bombers along the top lane, then the bottom lane */
FM.def('bomberrun',{tags:['hazard'],t:11,cost:3,kinds:['bomber'],role:'bomber run',f(I,k){const s=fmSide(I,k);FM.u('bomber',W+40,s<0?90:H-120);
  FM.later(I,4,()=>FM.u('drone',0,0,t=>[W+30-160*t,s<0?H-110:110],{}));}});
/* 24 splitterv: splitters in a V that burst into drones */
FM.def('splitterv',{tags:['elite'],t:9,cost:4,kinds:['splitter'],role:'splitter cascade',f(I,k){const y=gr(150,H-150);
  for(let i=-1;i<=1;i++)FM.u('splitter',0,0,t=>[W+40+Math.abs(i)*70-115*t,fmCy(y+i*90)],{});}});
/* 25 minefield: a minelayer crossing the middle while old mines drift in from the right */
FM.def('minefield',{tags:['hazard'],t:22,cost:4,kinds:['minelayer','mine'],role:'minelayer field',f(I,k){FM.u('minelayer',W+40,gr(140,H-140));
  for(let i=0;i<2;i++){const y=gr(60,H-60);FM.u('mine',0,0,t=>[W+40+i*120-62*t,y+14*Math.sin(t*.9+i)],{by:y});}}});
/* 26 nest: a pair of turrets with drones circling the nest */
FM.def('nest',{tags:['turrets'],t:25,cost:5,kinds:['turret','drone'],role:'turret nest',f(I,k){const x=gr(740,820),y=gr(150,H-150);
  FM.u('turret',W+60,y-70,null,{stop:x});FM.u('turret',W+60,y+70,null,{stop:x+20});
  for(let i=0;i<2;i++){const a=i*Math.PI;FM.u('drone',0,0,t=>{const cx=t<2.4?W+80-(W+80-x)*t/2.4:t<7?x:x-150*(t-7);return [cx+Math.cos(a+t*1.8)*120,fmCy(y+Math.sin(a+t*1.8)*120)];},{});}}});
/* 27 escort: a gunship inside a diamond of four drones that keep station on it */
FM.def('escort',{tags:['elite'],t:26,cost:5,kinds:['gunship','drone'],role:'gunship escort',f(I,k){const y=gr(170,H-200),g=FM.u('gunship',W+90,y);
  [[-70,0],[0,-80],[0,80],[70,0]].forEach(([dx,dy],i)=>FM.u('drone',0,0,(t,e)=>{const h=g.hp>0&&!g.dead;if(e){if(h){e.hx=g.x;e.hy=g.y;}else{e.hx=(e.hx==null?W:e.hx)-4;}}return [(e&&e.hx!=null?e.hx:W+90)+dx,fmCy((e&&e.hy!=null?e.hy:y)+dy)];},{}));}});
/* 28 stampede: chargers on consecutive beats, top lane, middle, bottom */
FM.def('stampede',{tags:['rush'],t:3,cost:3,kinds:['charger'],role:'charger stampede',f(I,k){const s=fmSide(I,k);
  for(let b=0;b<3;b++)FM.later(I,b,()=>FM.u('charger',W+30,fmCy(H/2+s*(b-1)*(H*.3))));}});
/* 29 fork: three chargers abreast, then two through the gaps */
FM.def('fork',{tags:['rush','elite'],t:7,cost:4,kinds:['charger'],f(I,k){for(const f of[.2,.5,.8])FM.u('charger',W+30,H*f);FM.later(I,2,()=>{for(const f of[.35,.65])FM.u('charger',W+30,H*f);});}});
/* 30 river: a stream of swarmers on a winding river; every piece is another stretch of the same river */
FM.def('river',{tags:['swarm'],t:9,cost:3,f(I,k){if(!I.s.p){const y=gr(H*.35,H*.65),pts=[];for(let x=W+30;x>=-200;x-=30)pts.push([x,fmCy(y+120*Math.sin((W-x)/120))]);I.s.p=fmSeg(pts,175);}
  for(let i=0;i<6;i++)FM.u('swarm',0,0,I.s.p,{pt:-i*.2});}});
/* 31 helix: two strands with opposite waves, a double helix */
FM.def('helix',{tags:['ranks'],t:1,cost:4,f(I,k){const yc=gr(170,H-170);
  for(let i=0;i<2;i++)for(const s of[0,Math.PI])FM.u('drone',0,0,t=>[W+30+i*60-140*t,fmCy(yc+80*Math.sin(t*2.2+s+i*.6))],{});}});
/* 32 box: four drones at the corners of a turning square */
FM.def('box',{tags:['ranks','elite'],t:5,cost:4,f(I,k){const yc=gr(150,H-150),dir=fmSide(I,k);
  for(let i=0;i<4;i++){const a=i*1.5708+.785;FM.u('drone',0,0,t=>[W+60-135*t+Math.cos(a+dir*t*1.5)*60,fmCy(yc+Math.sin(a+dir*t*1.5)*60)],{});}}});
/* 33 arrow: an arrowhead flies fast down the lane you were in; the lane flashes one beat first */
FM.def('arrow',{tags:['rush'],t:6,cost:5,tele:'line',f(I,k){const y=FM.py(),tl=FM.tel({k:'lane',y,nb:1,T:fmBs()});
  FM.later(I,1,()=>{FM.untel(tl);[[0,0],[40,-36],[40,36],[80,-72],[80,72]].forEach(([dx,dy])=>FM.u('drone',0,0,t=>[W+30+dx-215*t,fmCy(y+dy)],{}));});}});
/* 34 bounce: drones on diagonals that bounce off the top and bottom of the screen */
FM.def('bounce',{tags:['ranks','breath'],t:1,cost:3,f(I,k){const s=fmSide(I,k);
  for(let i=0;i<3;i++){const y0=gr(80,H-80);FM.u('drone',0,0,t=>{const span=H-120,q=((y0-60+s*95*t)%(2*span)+2*span)%(2*span);return [W+30+i*60-130*t,60+(q<span?q:2*span-q)];},{});}}});
/* 35 loop: a line that flies a full loop in the middle of the screen, then carries on */
FM.def('loop',{tags:['ranks','flank'],t:9,cost:4,f(I,k){const y=gr(150,H-150),s=fmSide(I,k),R=85;
  const pf=t=>{const v=150,x0=W+40,xl=W*.62,tl=(x0-xl)/v,tc=2*Math.PI*R/v;if(t<tl)return [x0-v*t,y];if(t<tl+tc){const a=(t-tl)*v/R;return [xl-Math.sin(a)*R,fmCy(y+s*(R-Math.cos(a)*R))];}return [xl-v*(t-tl-tc),y];};
  for(let i=0;i<4;i++)FM.u('drone',0,0,pf,{pt:-i*.32});}});
/* 36 sweep: an arc of five that swings from one edge across the screen to the other */
FM.def('sweep',{tags:['flank'],t:5,cost:5,f(I,k){const s=fmSide(I,k),cx=W*.15,cy=s<0?-H*.35:H*1.35,R=Math.hypot(W+40-cx,cy-H/2);
  for(let i=0;i<5;i++)FM.u('drone',0,0,t=>{const a0=Math.atan2((s<0?60:H-60)-cy,W+40-cx),a=a0+s*(.42*t-i*.07);const x=cx+Math.cos(a)*R,y=cy+Math.sin(a)*R;return [x,fmCy(y)];},{});}});
/* 37 pulse: a ring that breathes with the beat (wide on the beat, tight between) */
FM.def('pulse',{tags:['swarm','elite'],t:25,cost:4,f(I,k){const yc=gr(170,H-170);
  for(let i=0;i<6;i++){const a=i*1.0472;FM.u('drone',0,0,t=>{const b=G.bp%1,r=45+40*Math.pow(1-b,2);return [W+60-135*t+Math.cos(a+t)*r,fmCy(yc+Math.sin(a+t)*r)];},{});}}});
/* 38 slalom: laser gates in a row with gaps high, low, high */
FM.def('slalom',{tags:['hazard'],t:9,cost:3,gap:130,kinds:['gate'],role:'gate slalom',f(I,k){const s=fmSide(I,k);
  for(let i=0;i<2;i++)FM.u('gate',W+30+i*300,0,null,{gy:H/2+(i%2?-s:s)*H*.22,gap:130});}});
/* 39 curtain: a row that lowers from the top like a curtain, then drifts away */
FM.def('curtain',{tags:['flank','hazard'],t:17,cost:4,tele:'warn',f(I,k){const s=fmSide(I,k),xs=[.5,.62,.74,.86].map(f=>W*f+gr(-14,14)),ws=xs.map(x=>FM.warn(x,s));
  FM.later(I,1,()=>{ws.forEach(w=>FM.unwarn(w));xs.forEach((x,i)=>{const yt=s<0?H*.28:H*.72;const e=FM.u('drone',0,0,t=>t<1.4?[x,(s<0?-24:H+24)+(yt-(s<0?-24:H+24))*t/1.4]:t<3.4?[x,yt]:[x-150*(t-3.4),yt],{});FM.edge(e,s);});});}});
/* 40 geyser: a column bursts up from the bottom (or down from the top) and bends left */
FM.def('geyser',{tags:['flank'],t:8,cost:3,tele:'warn',f(I,k){const s=fmSide(I,k),x=gr(W*.55,W*.85),w=FM.warn(x,-s);
  FM.later(I,1,()=>{FM.unwarn(w);for(let i=0;i<3;i++){const e=FM.u('drone',0,0,fmSeg([[x,s<0?H+30:-30],[x,s<0?H*.45:H*.55],[x-120,s<0?H*.3:H*.7],[-200,s<0?H*.3:H*.7]],170),{pt:-i*.28});FM.edge(e,-s);}});}});
/* 41 burst: a tight knot that explodes into six directions, then everything drifts left */
FM.def('burst',{tags:['swarm'],t:6,cost:3,f(I,k){const yc=gr(170,H-170);
  for(let i=0;i<6;i++){const a=i*1.0472;FM.u('swarm',0,0,t=>{const x=W+40-160*Math.min(t,2.2),r=t<2.2?6:Math.min(150,(t-2.2)*120);return [x+Math.cos(a)*r-140*Math.max(0,t-2.2),fmCy(yc+Math.sin(a)*r)];},{by:yc});}}});
/* 42 comet: an elite head on a wave with a tail of swarmers in its wake */
FM.def('comet',{tags:['elite','swarm'],t:7,cost:4,f(I,k){const y=gr(150,H-150),a=gr(70,120),pf=t=>[W+40-160*t,fmCy(y+a*Math.sin(t*1.4))];
  const h=FM.u('drone',0,0,pf,{keep:1});if(!h.el){h.el=1;h.hp=Math.round(h.hp*2);h.max=h.hp;h.r=Math.round(h.r*1.25);h.score*=2;}for(let i=1;i<=5;i++)FM.u('swarm',0,0,pf,{pt:-i*.16});}});
/* 43 scissors: two lines close on the middle, stop 164 px apart, and open again */
FM.def('scissors',{tags:['flank','rush'],t:5,cost:4,gap:130,f(I,k){for(const s of[-1,1])for(let i=0;i<2;i++)FM.u('drone',0,0,t=>{const c=Math.sin(Math.min(Math.PI,t*.75));return [W+30+i*52-150*t,fmCy(H/2+s*(H*.42-(H*.42-82)*c))];},{});}});
/* 44 swoop: three dive from high to low and level out along the floor */
FM.def('swoop',{tags:['flank','rush'],t:4,cost:3,f(I,k){const s=fmSide(I,k),y0=s<0?60:H-60,y1=s<0?H-90:90;
  for(let i=0;i<3;i++)FM.u('drone',0,0,fmSeg([[W+30,y0],[W*.72,y0],[W*.55,y1],[-200,y1]],175),{pt:-i*.3});}});
/* 45 braid: three strands that weave through each other */
FM.def('braid',{tags:['ranks'],t:6,cost:3,f(I,k){const yc=gr(170,H-170);
  for(let i=0;i<3;i++)FM.u('drone',0,0,t=>[W+30+i*40-140*t,fmCy(yc+70*Math.sin(t*1.8+i*2.094))],{});}});
/* 46 stutter: a line that only moves on the beat (a hop forward, then a stop) */
FM.def('stutter',{tags:['ranks','breath'],t:1,cost:4,f(I,k){const y=gr(100,H-100),bs=fmBs();
  for(let i=0;i<4;i++)FM.u('drone',0,0,t=>{const n=Math.floor(t/bs),f=Math.min(1,(t/bs-n)*3);return [W+30+i*50-(n+f)*bs*170,y];},{});}});
/* 47 lattice: a 2 x 3 grid whose rows slide against each other */
FM.def('lattice',{tags:['ranks','elite'],t:25,cost:6,f(I,k){const yc=gr(170,H-170);
  for(let c=0;c<3;c++)for(const r of[-1,1])FM.u('drone',0,0,t=>[W+30+c*60-135*t,fmCy(yc+r*(52+30*Math.sin(t*1.6+c)))],{});}});
/* 48 fan: five leave from one point on the right and spread out into five lanes */
FM.def('fan',{tags:['ranks','flank'],t:2,cost:5,f(I,k){const y=gr(200,H-200);
  for(let i=-2;i<=2;i++)FM.u('drone',0,0,t=>{const x=W+40-150*t,sp=Math.min(1,Math.max(0,(W*.8-x)/180));return [x,fmCy(y+i*sp*78)];},{});}});
/* 49 hold: drones that take stations and hover (the zoo's station-and-hover) */
FM.def('hold',{tags:['ranks','breath'],t:1,cost:3,f(I,k){const y=gr(100,H-100);for(let i=0;i<3;i++)FM.u('drone',W+30+i*55,y+(i-1)*30,null,{});}});
/* 50 tide: two waves of swarmers, one high one low, pass in opposite sine phase */
FM.def('tide',{tags:['swarm'],t:6,cost:4,f(I,k){for(const s of[-1,1]){const y=H/2+s*H*.24;for(let i=0;i<4;i++)FM.u('swarm',0,0,t=>[W+30+i*36-185*t,fmCy(y+60*Math.sin(t*2.6+(s>0?Math.PI:0)))],{by:y});}}});
/* 51 line: the classic straight line of five (kept so the first stage reads simply) */
FM.def('line',{tags:['ranks','breath'],t:1,cost:5,f(I,k){const y=gr(80,H-150);for(let i=0;i<5;i++)FM.u('drone',0,0,t=>[W+30+i*55-140*t,y],{});}});
/* 52 vee: the classic V of five */
FM.def('vee',{tags:['ranks'],t:1,cost:5,f(I,k){const y=gr(150,H-190);for(let i=-2;i<=2;i++)FM.u('drone',0,0,t=>[W+30+Math.abs(i)*50-140*t,y+i*46],{});}});
/* 53 wave: the classic sine line of six */
FM.def('wave',{tags:['ranks','breath'],t:1,cost:5,f(I,k){const y=gr(130,H-170);for(let i=0;i<6;i++)FM.u('drone',0,0,t=>[W+30+i*46-140*t,fmCy(y+70*Math.sin(t*2.4+i*.6))],{});}});
/* 54 turrets: a column of turrets that dig in at the right */
FM.def('turrets',{tags:['turrets'],t:2,cost:3,kinds:['turret'],f(I,k){const x=gr(760,860),n=k%2?2:3;for(let i=0;i<n;i++)FM.u('turret',W+60+i*110,H*(n===3?.2+.3*i:.3+.4*i)+gr(-20,20),null,{stop:x+i*14,bf:fireIn(1+i)});}});
/* 55 gunship: a lone gunship */
FM.def('gunship',{tags:['elite'],t:4,cost:5,kinds:['gunship'],f(I,k){FM.u('gunship',W+90,gr(160,H-220));}});
/* 56 gates: one laser gate (gap 130) */
FM.def('gates',{tags:['hazard'],t:1,cost:2,gap:130,kinds:['gate'],f(I,k){FM.u('gate',W+30,0,null,{gy:gr(150,H-200),gap:130});}});
/* 57 phalanx: a block of drones (Athens) */
FM.def('phalanx',{tags:['ranks','elite'],t:33,cost:6,f(I,k){const y=gr(150,H-210);for(let c=0;c<2;c++)for(let r=-1;r<=1;r++)FM.u('drone',0,0,t=>[W+30+c*70-120*t,y+r*54],{});}});
/* 58 pillars: two narrow gates one behind the other (Athens) */
FM.def('pillars',{tags:['hazard'],t:33,cost:3,gap:124,kinds:['gate'],f(I,k){FM.u('gate',W+30,0,null,{gy:gr(150,H-200),gap:124});FM.u('gate',W+420,0,null,{gy:gr(150,H-200),gap:124});}});
/* 59 chargers: three chargers on random lanes (the old rush) */
FM.def('chargers',{tags:['rush'],t:1,cost:3,kinds:['charger'],f(I,k){for(let i=0;i<3;i++)FM.u('charger',W+30+i*110,gr(60,H-110));}});
/* 61 testudo: shielders in front, a healer and two drones behind them, all moving as one block (Athens) */
FM.def('testudo',{tags:['elite','ranks'],t:33,cost:6,kinds:['shielder','healer','drone'],role:'shielded testudo',f(I,k){const yc=gr(170,H-170);
  for(const dy of[-110,0,110])FM.u('shielder',0,0,t=>[W+40-75*t,fmCy(yc+dy)],{});FM.u('healer',0,0,t=>[W+130-75*t,yc],{});
  for(const dy of[-60,60])FM.u('drone',0,0,t=>[W+110-75*t,fmCy(yc+dy)],{});}});
/* 62 ambush: snipers on the top and bottom lanes cover two divers from the middle (Athens) */
FM.def('ambush',{tags:['elite','rush'],t:34,cost:5,kinds:['sniper','kamikaze'],role:'ambush (snipers + divers)',f(I,k){FM.u('sniper',W+40,70);FM.u('sniper',W+40,H-70);
  for(let b=0;b<2;b++)FM.later(I,2+b,()=>FM.u('kamikaze',W+40,fmCy(H/2+(b?70:-70))));}});
/* 60 flankers: flankers curl in from both edges */
FM.def('flankers',{tags:['flank'],t:4,cost:2,kinds:['flank'],f(I,k){DIR.flank(2,true);}});

/* ---- VARY2 micro-events (owner 19 Oct 2026: "boring, extremely repetitive"): small encounters of their own, each with a different job. stagescripts.js swaps them in for
   a formation piece (same director call, same caps), tracks them as set pieces and rotates a window of them per stage. Flag RET.vary2; ?vary2=0 = the VARY A table. ---- */
if(RET.vary2===undefined)RET.vary2=RET.vary&&!/[?&]vary2=0/.test(location.search);
const fmEv=(id,o)=>FM.def(id,Object.assign({tags:['event'],ev:1,cost:3},o));
const fmGnd=()=>!!(window.LEAK&&ST.on&&ST.def&&(ST.def.pos|0)>=2);          // ground units only where the ground waves are allowed (leak.js)
const fmGu=(ty,x,alt)=>{if(!fmGnd()||G.en.filter(e=>e.gnd&&e.hp>0).length>=3)return (alt||'drone')==='drone'?fmD(W+60,gr(70,H-70)):FM.u(alt,W+60,gr(70,H-70));return LEAK.mk(ty,x);};
const fmH=(k,x,y)=>FM.u(G.en.filter(e=>e.zt&&e.hp>0&&e.zst!==2).length>=2?'drone':k,x,y);   // at most two zoo hover stations alive at once: they never crowd each other
const fmD=(x,y)=>FM.u('drone',0,0,t=>[x-120*t,y],{});   // a plain drone on a straight path (a path unit never hovers: zoo.js would park a free drone)
const fmHover=(a,k)=>{const ks=a.filter(q=>FM.ok(q));return ks.length?ks[k%ks.length]:'shielder';};
fmEv('evsway',{t:1,name:'SWAY LINE',f(I,k){const y=gr(160,H-200),a=k%2?-1:1;for(let i=0;i<5;i++)FM.u('drone',0,0,t=>[W+30+i*54-120*t,fmCy(y+a*Math.sin(t*1.5-i*.6)*50)],{});}});
fmEv('evdoor',{t:1,name:'DOUBLE DOOR',cost:2,f(I,k){let g=gr(160,H-160);for(let b=0;b<2;b++){const y=g;FM.later(I,b*3,()=>{for(const s of[-1,1])for(let q=0;q<2;q++)fmD(W+30+q*46,fmCy(y+s*(95+q*44)));});g=fmCy(g+(g>H/2?-80:80));}}});
fmEv('evlanterns',{t:1,name:'LANTERNS',f(I,k){const y=gr(150,H-190);for(let i=0;i<4;i++)FM.u('drone',0,0,t=>[W+30+i*70-70*t,fmCy(y+Math.sin(t*1.6+i*1.2)*50)],{});}});
fmEv('evbracket',{t:2,name:'BRACKET',f(I,k){for(let b=0;b<2;b++)FM.later(I,b*2,()=>{fmD(W+40,60);fmD(W+40,H-60);});}});
fmEv('evgrid',{t:2,name:'PATROL GRID',f(I,k){const x=gr(740,820);FM.u('turret',W+60,70,null,{stop:x,bf:fireIn(.3)});FM.u('turret',W+60,H-70,null,{stop:x+30,bf:fireIn(.6)});fmD(W+90,H/2);}});
fmEv('evtline',{t:3,name:'ROAD GUNS',kinds:['gturret'],f(I,k){for(let i=0;i<2;i++)fmGu('gturret',W+40+i*210,'drone');}});
fmEv('evwindow',{t:3,name:'WINDOW DISPLAY',f(I,k){const y=gr(110,H-210),x0=gr(700,790);for(let i=0;i<5;i++)FM.u('drone',0,0,t=>{const x=t<1.5?W+30-(W+30-x0)*t/1.5:t<3.5?x0:x0-170*(t-3.5);return [x+i*20,y+i*44];},{});}});
fmEv('evstation',{t:4,name:'STATION',kinds:['sniper','shielder'],f(I,k){fmH(fmHover(['sniper','shielder'],k),W+50,gr(90,H/2-30));fmH(fmHover(['shielder','sniper'],k+1),W+90,gr(H/2+30,H-90));}});
fmEv('evguard',{t:4,name:'GUARD CHANGE',cost:4,kinds:['shielder','turret'],f(I,k){fmH('shielder',W+60,gr(150,H-150));fmD(W+60,k%2?70:H-70);fmD(W+110,k%2?H-70:70);}});
fmEv('evshieldv',{t:4,name:'SHIELD VEE',cost:4,kinds:['shielder'],f(I,k){const y=gr(170,H-170);for(let i=-1;i<=1;i++)fmH('shielder',W+50+Math.abs(i)*40,fmCy(y+i*110));}});
fmEv('evfunnel',{t:5,name:'FUNNEL',cost:4,f(I,k){const g=gr(190,H-190);for(let i=0;i<6;i++)for(const s of[-1,1])FM.u('drone',0,0,t=>{const w=Math.max(60,230-i*30-t*38);return [W+30+i*38-130*t,fmCy(g+s*w)];},{});}});
fmEv('evmines',{t:6,name:'DRIFT MINES',kinds:['mine'],f(I,k){const y0=gr(70,H-250),d=k%2?-1:1;for(let i=0;i<4;i++){const y=fmCy(y0+i*d*58+(d<0?190:0));FM.u('mine',0,0,t=>[W+40+i*90-62*t,y+14*Math.sin(t*.9+i)],{by:y});}}});
fmEv('evdive',{t:6,name:'DIVE LINE',kinds:['charger'],f(I,k){for(let b=0;b<2;b++)FM.later(I,b*2,()=>{for(let q=0;q<2;q++)FM.u('charger',W+40+q*70,b%2?H-70:70);});}});
fmEv('evtank',{t:6,name:'TANK RUN',kinds:['gtank'],f(I,k){fmGu('gtank',W+40,'charger');fmGu('gtank',W+190,'charger');}});
fmEv('evram',{t:7,name:'RAM & SHIELD',cost:4,kinds:['charger','shielder'],f(I,k){fmH('shielder',W+50,gr(120,H-120));for(let i=0;i<2;i++)FM.u('charger',W+30+i*110,gr(60,H-110));}});
fmEv('evwalker',{t:8,name:'WALKER',cost:4,kinds:['gwalker','gturret'],f(I,k){fmGu('gwalker',W+40,'gunship');fmGu('gturret',W+260,'drone');}});
fmEv('evsplit',{t:9,name:'SPLIT PAIR',kinds:['splitter'],f(I,k){fmH('splitter',W+50,gr(90,H/2-30));fmH('splitter',W+90,gr(H/2+30,H-90));}});
fmEv('evconvoy',{t:10,name:'CONVOY',cost:5,kinds:['gtank','gturret','gwalker'],f(I,k){fmGu('gtank',W+40,'charger');fmGu('gturret',W+200,'drone');fmGu('gwalker',W+360,'gunship');}});
fmEv('evbombers',{t:11,name:'GUNSHIP & SNIPE',kinds:['gunship','sniper'],f(I,k){FM.u('gunship',W+90,k%2?150:H-170);fmH('sniper',W+90,k%2?H-70:70);}});
fmEv('evsnipe',{t:14,name:'LANE SNIPERS',cost:4,kinds:['sniper','gate'],f(I,k){fmH('sniper',W+40,70);fmH('sniper',W+80,H-70);FM.u('gate',W+30,0,null,{gy:gr(150,H-200),gap:130});}});
fmEv('evheal',{t:16,name:'MEDIC SQUAD',cost:5,kinds:['healer','shielder','gunship'],f(I,k){const y=gr(150,H-150);fmH('healer',W+50,y);fmH('shielder',W+90,fmCy(y>H/2?y-110:y+110));FM.u('gunship',W+130,fmCy(y>H/2?y+10:y-110));}});
fmEv('evrelay',{t:17,name:'RELAY',cost:4,kinds:['sniper','charger'],f(I,k){fmD(W+50,gr(120,H-120));fmH('sniper',W+80,k%2?70:H-70);FM.later(I,3,()=>FM.u('charger',W+40,H/2));}});
fmEv('evcargo',{t:19,name:'CARGO',cost:5,kinds:['carrier','shielder'],f(I,k){FM.u('carrier',W+80,gr(170,H-200));fmD(W+60,k%2?90:H-90);}});
fmEv('evlayer',{t:22,name:'MINE BELT',cost:5,kinds:['minelayer','mine','gate'],f(I,k){FM.u('minelayer',W+40,gr(140,H-140));FM.u('gate',W+30,0,null,{gy:gr(150,H-200),gap:130});for(let i=0;i<2;i++){const y=gr(60,H-60);FM.u('mine',0,0,t=>[W+40+i*120-62*t,y+14*Math.sin(t*.9+i)],{by:y});}}});
NR.on('runStart',()=>{FM.reset();});
/* economy: a formation's swarmers are cheap one-hit targets (walls, rivers, tides) and the old story stages had almost none, so each pays FM.swN of a kill's Neon (econ-test) */
FM.swN=.3;
{const aw=SH.award;SH.award=function(e,keep){if(!RET.vary||!e||!e.fid||e.type!=='swarm')return aw.call(this,e,keep);const k=this.nx;this.nx=k*FM.swN;try{return aw.call(this,e,keep);}finally{this.nx=k;}};}
NR.on('beat',()=>{if(RET.vary)FM.tickTel();});
{const dp=drawPickups;drawPickups=function(t){dp(t);try{FM.draw(t);}catch(err){}};}
