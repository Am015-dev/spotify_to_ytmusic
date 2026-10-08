/* ---------- more to buy: 14 new pit-stop upgrades (8 in the pool from the start, 6 unlocked in the garage CREW tab), 4 new garage perks, 2 new ships.
   Everything hooks in through wrappers like upgrades.js. Enemies scale softly with all of it (UPS in dir.js), so upgrades help without breaking the game.
   Visible on the ship: side cannons, rear gun, beat drones, the overdrive ring (drawn by drawPlayer, upright in portrait too). ---------- */
const IC={sc:'M3 9h8v2H3zM3 13h8v2H3zM13 4l8 8-8 8z',rg:'M21 9h-8v2h8zM21 13h-8v2h8zM11 4l-8 8 8 8z',pc:'M2 11h14V8l6 4-6 4v-3H2z',cl:'M13 2L4 14h6l-1 8 9-12h-6z',bt:'M12 3a9 9 0 100 18 9 9 0 000-18zm-1 4h2v5.5l3.5 2-1 1.7L11 13z',
  rc:'M4 18l6-12 4 8 6-10v4l-6 10-4-8-6 12z',og:'M12 2c3 4 6 6 6 11a6 6 0 01-12 0c0-2 1-3 2-4 0 2 1 3 2 3 0-4 0-7 2-10z',as:'M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5zm-1 5v3H8v2h3v3h2v-3h3v-2h-3V7z',
  bd:'M12 4a3 3 0 110 6 3 3 0 010-6zM5 14a3 3 0 110 6 3 3 0 010-6zM19 14a3 3 0 110 6 3 3 0 010-6z',sm:'M12 2l3 7 7 .8-5.3 4.7 1.6 7.2L12 18l-6.3 3.7 1.6-7.2L2 9.8 9 9z',
  ni:'M12 1l9 11-9 11L3 12zm0 6v3H9v2h3v3h2v-3h3v-2h-3V7z',wn:'M12 2a10 10 0 100 20 10 10 0 000-20zm0 4l2 4h4l-3 3 1 5-4-2-4 2 1-5-3-3h4z',ec:'M4 9h14v6H4zM18 11h3v2h-3zM6 11h2v2H6zM10 11h2v2h-2z',lk:'M12 21s-8-5.5-8-11a4.5 4.5 0 018-2.8A4.5 4.5 0 0120 10c0 5.5-8 11-8 11zM11 8v3H8v2h3v3h2v-3h3v-2h-3V8z',
  tdl:'M12 3a9 9 0 100 18 9 9 0 000-18zm-1 4h2v5.5l3.5 2-1 1.7L11 13z',prc:'M2 11h14V8l6 4-6 4v-3H2z',nint:'M12 1l9 11-9 11L3 12zm0 6v3H9v2h3v3h2v-3h3v-2h-3V7z',sdc:'M3 9h8v2H3zM3 13h8v2H3zM13 4l8 8-8 8z'};
const NEW2=[
  {id:'sc',n:'Side Cannons',   t:'Wing guns fire with you',            p:44,max:2,c:'#ff8a3d',ic:IC.sc},
  {id:'rg',n:'Rear Gun',       t:'Shoots backwards at flankers',       p:36,max:2,c:'#ffb020',ic:IC.rg},
  {id:'pc',n:'Piercing Shots', t:'Shots pass through enemies',         p:46,max:2,c:'#ffffff',ic:IC.pc,x:'up_pc'},
  {id:'cl',n:'Chain Lightning',t:'On-beat kills arc to nearby foes',   p:50,max:3,c:'#19e3ff',ic:IC.cl,x:'up_cl'},
  {id:'bt',n:'Bullet Time',    t:'On-beat dash slows the world',       p:44,max:2,c:'#7dffd8',ic:IC.bt,x:'up_bt'},
  {id:'rc',n:'Ricochet',       t:'Shots bounce off the edges',         p:34,max:2,c:'#c08aff',ic:IC.rc},
  {id:'og',n:'Overdrive',      t:'Fill the gauge for double fire',     p:56,max:1,c:'#ff5a3d',ic:IC.og,x:'up_og'},
  {id:'as',n:'Auto-Shield',    t:'Shield appears when hull is low',    p:46,max:2,c:'#19e3ff',ic:IC.as},
  {id:'bd',n:'Beat Drone',     t:'Orbiting gun shoots every beat',     p:54,max:2,c:'#ffe14d',ic:IC.bd,x:'up_bd'},
  {id:'sm',n:'Score Magnet',   t:'Shards fly in and pay more',         p:24,max:2,c:'#3dffb0',ic:IC.sm},
  {id:'ni',n:'Neon Interest',  t:'Held Neon grows at every pit stop',  p:40,max:3,c:'#19e3ff',ic:IC.ni},
  {id:'wn',n:'Second Wind',    t:'A full-hull revive with a blast',    p:85,max:1,c:'#ff2d95',ic:IC.wn,x:'up_wn'},
  {id:'ec',n:'EMP Cell',       t:'EMP refills after every district',   p:28,max:1,c:'#ffb020',ic:IC.ec},
  {id:'lk',n:'Lucky Drops',    t:'More hull and shard drops',          p:30,max:2,c:'#3dffb0',ic:IC.lk}];
for(const u of NEW2){SH.UPG.push(u);UBY[u.id]=u;}
for(const [id,n,t,p,ic] of [['up_pc','Piercing Shots','Pit stop: shots pass through enemies',160,IC.pc],['up_cl','Chain Lightning','Pit stop: on-beat kills arc to foes',190,IC.cl],['up_bt','Bullet Time','Pit stop: on-beat dash slows the world',180,IC.bt],
    ['up_og','Overdrive','Pit stop: a gauge for double fire',220,IC.og],['up_bd','Beat Drone','Pit stop: an orbiting gun on the beat',240,IC.bd],['up_wn','Second Wind','Pit stop: a full-hull second revive',260,IC.wn]])CREW.push({id,n,t,p,ic});
/* ----- four new garage perks (permanent levels, same price curve) ----- */
TP_DEF.push({id:'tdl',n:'Time Dilator',  p:90, max:3,c:'#7dffd8',pri:55,ic:IC.tdl, t:l=>'On-beat dash slows time '+(.4+.3*l).toFixed(1)+' s'},
  {id:'prc',n:'Piercing Rounds',p:110,max:3,c:'#ffffff',pri:58,ic:IC.prc, t:l=>'Shots pierce '+l+' enem'+(l>1?'ies':'y')},
  {id:'nint',n:'Neon Interest', p:75, max:4,c:'#19e3ff',pri:30,ic:IC.nint,t:l=>'Pit stops pay '+2*l+'% interest'},
  {id:'sdc',n:'Side Mounts',    p:150,max:2,c:'#ff8a3d',pri:68,ic:IC.sdc, t:l=>l+' pair'+(l>1?'s':'')+' of wing cannons from the start'});
for(const d of TP_DEF.slice(-4))TP_BY[d.id]=d;
/* ----- two new ships with their own rhythm: Swing (long-short pairs) and Syncopator (a 3-2 clave, the shots fall between the beats) ----- */
SHIPS.push({id:'swg',n:'Swing',       t:'Long-short pairs on the swing',  p:120,ic:'M4 8a3 3 0 110 6 3 3 0 010-6zM14 9a2 2 0 110 4 2 2 0 010-4zM19 9a2 2 0 110 4 2 2 0 010-4z'},
           {id:'syn',n:'Syncopator',  t:'Fires between the beats (3-2)',  p:160,ic:'M2 11h3v2H2zM8 11h3v2H8zM14 8h2v8h-2zM19 11h3v2h-3z'});
const CLAVE=[0,3,6,10,12];                                  // 3-2 son clave on a 16th grid: five shots per bar
const SHIPX={swg:{gs:1/3,mk:c=>((c%3)+3)%3!==1,dmk:2.3,hk:1.5},syn:{gs:1/4,mk:c=>CLAVE.includes(((c%16)+16)%16),dmk:3.4,hk:3.2}};
{const gs0=SH.gridStep,cell0=SH.cellOn,dmk0=SH.dmk,shot0=SH.shot;
  SH.gridStep=function(){const x=SHIPX[this.ship];return x?x.gs:gs0.call(this);};
  SH.cellOn=function(c){const x=SHIPX[this.ship];return x?x.mk(c):cell0.call(this,c);};
  SH.dmk=function(){const x=SHIPX[this.ship];return x?x.dmk:dmk0.call(this);};
  SH.shot=function(){const r=shot0.call(this),x=SHIPX[this.ship];if(x)r.heat*=x.hk;return r;};}
/* ----- levels: pit-stop upgrade + garage perk where there is one ----- */
const lvSide=()=>Math.min(3,SH.n('sc')+TP.l('sdc')),lvRear=()=>SH.n('rg'),lvPierce=()=>SH.n('pc')+TP.l('prc'),lvBT=()=>SH.n('bt')+TP.l('tdl');
const AX={od:0,odOn:0,odBeats:0,sw:0,asLeft:0,arcs:[],bd:[],lastBd:-1};
{const rc=SH.recalc;SH.recalc=function(){rc.call(this);this.smk=1+.5*this.n('sm');this.smg=120*this.n('sm');this.lk=.03*this.n('lk');upsCalc();};}
/* ----- bullets: piercing, ricochet, overdrive ----- */
{const vol=SH.volley;SH.volley=function(x,y,pf){const n0=G.pb.length;vol.call(this,x,y,pf);const pl=lvPierce(),rc=SH.n('rc'),od=AX.odOn>0;
  for(let i=n0;i<G.pb.length;i++){const b=G.pb[i];if(pl&&!b.px){b.px=new Set();b.pn=pl;}if(rc)b.rc=rc;if(od){b.dm*=1.4;b.od=1;}if(this.ship==='syn'&&!b.big)b.big=1;}};}
/* ----- what happens on every shot of the ship ----- */
NR.on('fire',f=>{
  const sd=lvSide();if(sd){const dm=.55*tpDmg();for(let k=1;k<=sd;k++){const a=k*85;G.pb.push({x:f.x-6,y:f.y-13*k,vx:860,vy:-a,dm,pf:0,sc:1},{x:f.x-6,y:f.y+13*k,vx:860,vy:a,dm,pf:0,sc:1});}}
  const rg=lvRear();if(rg&&((AX.rgN=(AX.rgN||0)+1)%2===0)){const dm=.7*tpDmg();G.pb.push({x:f.x-46,y:f.y,vx:-820,vy:0,dm,pf:0,rg:1});if(rg>1){G.pb.push({x:f.x-46,y:f.y-6,vx:-780,vy:-170,dm:dm*.7,pf:0,rg:1},{x:f.x-46,y:f.y+6,vx:-780,vy:170,dm:dm*.7,pf:0,rg:1});}}
  if(AX.odOn>0){const gs=SH.gridStep();G.delayed.push({t:gs*BT.spb/2,f:()=>{if(G.dead||!running||P.over)return;SH.volley(P.x+22,P.y+2,0);}});}});
/* ----- overdrive gauge: kills, grazes and on-beat dashes fill it; full = 8 beats of double fire and +40% damage ----- */
function odGain(v){if(!SH.n('og')||G.dead||AX.odOn>0)return;AX.od=Math.min(100,AX.od+v);
  if(AX.od>=100){AX.od=0;AX.odOn=1;AX.odBeats=8;floater(P.x,P.y-30,'OVERDRIVE','#ff5a3d');G.flash=Math.max(G.flash,.12*FX());AU.sfx('up');G.rings.push({x:P.x,y:P.y,l:.6,m:.6,c:'#ff5a3d'});}}
NR.on('kill',d=>{if(d.boss)return;odGain(d.e.pf?5:2.5);
  // chain lightning: an on-beat (pulse shot) kill arcs to the nearest foes
  const cl=SH.n('cl');if(cl&&d.e.pf&&!d.e.cl){const src=d.e;let tg=G.en.filter(e=>e!==src&&e.hp>0&&e.type!=='gate'&&e.type!=='boss'&&!e.cl&&Math.hypot(e.x-src.x,e.y-src.y)<230).sort((a,b)=>Math.hypot(a.x-src.x,a.y-src.y)-Math.hypot(b.x-src.x,b.y-src.y)).slice(0,1+cl);
    let px=src.x,py=src.y;for(const e of tg){e.hp-=6*tpDmg();e.flash=.12;e.cl=1;AX.arcs.push({x1:px,y1:py,x2:e.x,y2:e.y,l:.28});px=e.x;py=e.y;AU.sfx('graze');}}});
NR.on('perfect',d=>{if(d.kind==='dash'){odGain(14);const bl=lvBT();if(bl){G.bt=.4+.3*bl;G.btk=.55;}}else odGain(2.5);});
NR.on('beat',()=>{if(AX.odOn>0&&--AX.odBeats<=0){AX.odOn=0;}
  // beat drones: orbit the ship a quarter turn per beat, one golden piercing shot per beat
  const n=SH.n('bd');if(n&&!G.dead&&G.live){for(let k=0;k<n;k++){const a=G.bp*Math.PI/2+k*Math.PI,x=P.x+Math.cos(a)*46,y=P.y+Math.sin(a)*46;
    G.pb.push({x:x+10,y,vx:900,vy:0,dm:2.2*tpDmg(),pf:1,big:1,px:new Set(),pn:1,bd:1});}}});
/* ----- auto-shield, second wind, EMP cell, interest, drones that follow the ship ----- */
{const hu=hurt;hurt=function(){const hp0=P.hp,sh0=SH.sh;hu();if(P.hp<hp0&&P.hp<=1&&P.hp>0&&SH.sh===0&&AX.asLeft>0){AX.asLeft--;SH.sh++;floater(P.x,P.y-30,'AUTO-SHIELD','#19e3ff');AU.sfx('up');}};}
{const d0=die;die=function(){if(AX.sw>0&&!G.dead&&TP.revLeft<=0){AX.sw--;P.hp=P.max;P.inv=3;G.eb=[];G.flash=Math.max(G.flash,.6*FX());shake(16);
      for(const e of G.en){if(e.type==='boss')e.hp-=25;else e.hp-=30;e.flash=.2;}burst(P.x,P.y,'#ff2d95',40,420,.7);G.rings.push({x:P.x,y:P.y,l:.8,m:.8,c:'#ff2d95'});floater(P.x,P.y-30,'SECOND WIND','#ff2d95');AU.sfx('up');return;}
    d0();};}
{const add=SH.add;SH.add=function(id){add.call(this,id);if(id==='as')AX.asLeft=SH.n('as');if(id==='wn')AX.sw++;if(id==='ec')P.emp=Math.max(P.emp,3);};}
NR.on('runStart',()=>{AX.od=0;AX.odOn=0;AX.odBeats=0;AX.sw=SH.n('wn');AX.asLeft=SH.n('as');AX.arcs.length=0;AX.rgN=0;AX.cache=0;G.bt=0;});
NR.on('pitStart',()=>{AX.asLeft=SH.n('as');if(SH.n('ec'))P.emp=Math.max(P.emp,3);
  const li=SH.n('ni')+TP.l('nint');if(li){const add=Math.min(12*li,Math.floor(SH.neon*(.04*SH.n('ni')+.02*TP.l('nint'))));if(add>0){SH.neon+=add;SH.earned+=add;floater(P.x,P.y-30,'+'+add+' INTEREST','#19e3ff');SH.draw();}}});
// the score magnet only pulls shards harder; the shard pays more
NR.on('tick',dt=>{if(!G.live||G.dead)return;const r=SH.smg;if(r)for(const p of G.pk){if(p.t!=='shard')continue;const dx=P.x-p.x,dy=P.y-p.y,l=Math.hypot(dx,dy);if(l<NR.mod.mag+r&&l>1){p.vx+=dx/l*900*dt;p.vy+=dy/l*900*dt;}}
  for(let i=AX.arcs.length-1;i>=0;i--){AX.arcs[i].l-=dt;if(AX.arcs[i].l<=0)AX.arcs.splice(i,1);}});
/* ----- looks: wing cannons, rear gun, beat drones, overdrive ring, bullet-time tint, lightning ----- */
{const dp=drawPlayer;drawPlayer=function(t){dp(t);if(G.dead)return;if(P.inv>0&&(SET.reduce?Math.floor(t*6)%3===0:Math.floor(t*20)%2))return;
  ctx.save();ctx.translate(P.x,P.y);ctx.rotate(P.tilt);const D=DISTRICTS[G.di];
  const sd=lvSide(),rg=lvRear();
  ctx.fillStyle='#16102a';ctx.strokeStyle='#ff8a3d';ctx.lineWidth=1.2;
  for(let k=1;k<=sd;k++)for(const s of[-1,1]){ctx.beginPath();ctx.rect(2-k*5,s*(10+k*3)-2.5,14,5);ctx.fill();ctx.stroke();ctx.fillStyle='#ffd0a0';ctx.fillRect(15-k*5,s*(10+k*3)-1,3,2);ctx.fillStyle='#16102a';}
  if(rg){ctx.strokeStyle='#ffb020';ctx.beginPath();ctx.rect(-32,-3,12,6);ctx.fill();ctx.stroke();if(rg>1){ctx.beginPath();ctx.rect(-28,-9,8,3);ctx.rect(-28,6,8,3);ctx.fill();ctx.stroke();}}
  if(lvPierce()){ctx.fillStyle='#ffffff';ctx.globalAlpha=.9;ctx.beginPath();ctx.moveTo(26,2);ctx.lineTo(34+4*lvPierce(),2);ctx.lineTo(26,0);ctx.lineTo(26,4);ctx.closePath();ctx.fill();ctx.globalAlpha=1;}
  if(this_ship()==='swg'){ctx.fillStyle='#ffe14d';ctx.fillRect(-10,-12,6,2);ctx.fillRect(-2,-12,3,2);}
  else if(this_ship()==='syn'){ctx.fillStyle='#ff2d95';for(const x of[-14,-9,-3,5,11])ctx.fillRect(x,-11.5,2.2,2);}
  ctx.restore();
  const n=SH.n('bd');if(n){ctx.save();ctx.globalCompositeOperation='lighter';for(let k=0;k<n;k++){const a=G.bp*Math.PI/2+k*Math.PI,x=P.x+Math.cos(a)*46,y=P.y+Math.sin(a)*46;
      G_(x,y,15,'#ffe14d',.55);ctx.globalCompositeOperation='source-over';ctx.fillStyle='#120a1f';ctx.strokeStyle='#ffe14d';ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y,6,0,7);ctx.fill();ctx.stroke();ctx.fillStyle='#fff';ctx.fillRect(x+1,y-1,4,2);ctx.globalCompositeOperation='lighter';}ctx.restore();}
  if(SH.n('og')){ctx.save();ctx.lineWidth=3.2;const on=AX.odOn>0,f=on?AX.odBeats/8:AX.od/100;ctx.strokeStyle=on?'#ffb020':'#ff5a3d';ctx.globalAlpha=on?.95:.45+.4*f;
    ctx.beginPath();ctx.arc(P.x,P.y,30,-Math.PI/2,-Math.PI/2+6.2832*Math.max(.02,f));ctx.stroke();if(on){ctx.globalCompositeOperation='lighter';G_(P.x,P.y,52,'#ff5a3d',.35+.2*PUL);}ctx.restore();}};}
const this_ship=()=>SH.ship;
{const dp=drawPickups;drawPickups=function(t){dp(t);
  if(AX.arcs.length){ctx.save();ctx.globalCompositeOperation='lighter';ctx.lineCap='round';for(const a of AX.arcs){ctx.globalAlpha=clamp(a.l*4,0,1);ctx.strokeStyle='#8fe9ff';ctx.lineWidth=2.4;ctx.beginPath();ctx.moveTo(a.x1,a.y1);
      const n=5;for(let i=1;i<n;i++){const u=i/n;ctx.lineTo(a.x1+(a.x2-a.x1)*u+(((i*37+(a.x1|0))%11)-5),a.y1+(a.y2-a.y1)*u+(((i*53+(a.y1|0))%11)-5));}ctx.lineTo(a.x2,a.y2);ctx.stroke();}ctx.restore();}
  if(G.bt>0&&G.live){ctx.save();ctx.globalAlpha=clamp(G.bt*.5,0,.14);ctx.fillStyle='#19e3ff';ctx.fillRect(0,0,W,H);ctx.restore();}};}
/* ----- recommended picks in the pit stop for the new upgrades ----- */
{const rp=recPit;recPit=function(){let best=-1,bs=-1e9;const pri={sc:62,rg:38,pc:60,cl:58,bt:48,rc:36,og:64,as:66,bd:63,sm:28,ni:34,wn:80,ec:32,lk:35};
  const base=rp.call(this);SH.cards.forEach((c,i)=>{if(c.sold||SH.neon<SH.price(c.u))return;const b=pri[c.u.id];if(b==null)return;const s=b-4*SH.n(c.u.id);if(s>bs){bs=s;best=i;}});
  if(best<0)return base;if(base<0)return best;return bs>=60?best:base;};}
