/* ===== 4b. WEAPON LEVELS BOUGHT IN THE GARAGE + EIGHT MORE WEAPONS (loads after g.js) =====
   Every weapon has a permanent level 1..10 (key mnr_wplv, bought in Garage > WEAPONS with Neon). In a run the effective level is the permanent level
   plus the pit-stop level bonus (at most +2, g.js WP.lvOf). Levels grow rate, size and count; damage per shot stays under the soft cap (b.js DMG.hit).
   Total weapon DPS at level 10 is held at about 2.5x level 1 (weapon-test.js measures it). WEAPON_META switches the whole feature off: false = nothing is locked, no new weapons. */
const WEAPON_META=true;
const WPX_PRICE=L=>Math.round(40*Math.pow(1.45,L-1));          // Neon for the upgrade from level L to L+1: 40, 58, 84, 122, 177, 257, 372, 540, 783
const WPX_POWER=L=>1+1.5*(L-1)/9;                              // the "power" shown on the cards: 1.00x at level 1, 2.50x at level 10
const WPX_META={                                               // price to unlock (0 = owned from the start), colour, and what levels 3, 6 and 10 add
  pulse:{p:0,ab:['Fan opens wider','A third pair of shots','A fourth pair of shots']},
  laser:{p:30,ab:['The beam thickens','Fires 2 shots in 3','Fires on every shot']},
  swarm:{p:40,ab:['Missiles home harder','Two missiles per volley','Faster, harder missiles']},
  beat:{p:50,ab:['Shell pierces 1 foe','Pierces 2, side shells','Pierces 3, fatter shell']},
  arc:{p:80,ab:['Lightning reaches further','A third target','A fourth target']},
  orbit:{p:100,ab:['A third blade','Blades spin wider','A fourth blade']},
  disc:{p:120,ab:['The disc hits harder','Twin discs','A third bounce']},
  mine:{p:140,ab:['A bigger blast','Five mines out at once','Biggest blast, harder hit']},
  frost:{p:160,ab:['Beam pierces 3 foes','Pierces 4, freezes longer','Twin side beams']},
  flame:{p:180,ab:['Flames reach further','A wider cone','Longest reach, burns hotter']},
  wave:{p:200,ab:['The wave grows wider','Eats more enemy bullets','Fires every other beat']},
  shell:{p:260,ab:['Bursts into 5 fragments','7 fragments','10 fragments, wide cone']},
  drone:{p:300,ab:['The echo follows closer','Two echo shots','Echoes hit harder']},
  well:{p:340,ab:['The pull reaches further','Two wells at once','Pulls harder, wider burst']},
  rail:{p:380,ab:['A wider rail lane','Charges in 2 beats','Fully charged: huge hit']},
  storm:{p:400,ab:['The field grows','Two fields at once','Longest reach']}};
Object.assign(WPD,{
  frost:{n:'FROST BEAM',s:'FROST',c:'#9fe8ff',tx:'Icy beam that slows what it touches.'},
  flame:{n:'FLAME ARC',s:'FLAME',c:'#ff5a2d',tx:'Wide fire cone. Fly in close.'},
  wave:{n:'PLASMA WAVE',s:'WAVE',c:'#5b8cff',tx:'A growing wave that eats bullets.'},
  shell:{n:'SHRAPNEL SHELL',s:'SHELL',c:'#ffa94d',tx:'A shell that bursts into fragments.'},
  drone:{n:'ECHO DRONE',s:'DRONE',c:'#e6a8ff',tx:'A drone that repeats your last shot.'},
  well:{n:'GRAVITY WELL',s:'WELL',c:'#7a4dff',tx:'An orb that pulls foes in, then bursts.'},
  rail:{n:'RAIL SNIPER',s:'RAIL',c:'#ff3d6a',tx:'Charges, then one huge piercing shot.'},
  storm:{n:'STORM CELL',s:'STORM',c:'#fff06a',tx:'A field dropped behind that zaps foes.'}});
Object.assign(WTAG,{frost:['slow','beam'],flame:['melee','spread'],wave:['wave','spread'],shell:['frag','blast'],drone:['homing','echo'],well:['pull','blast'],rail:['pierce','heavy'],storm:['chain','field']});
for(const id of Object.keys(WPX_META))if(WPD[id]){WPD[id].p=WPX_META[id].p;WPD[id].ab=WPX_META[id].ab;}
WP_IDS.length=0;WP_IDS.push('pulse','laser','swarm','beat','arc','orbit','disc','mine','frost','flame','wave','shell','drone','well','rail','storm');
if(!WEAPON_META)WP_IDS.length=8;
/* generic fusions for the pairs with no hand-made rule: the effect comes from the tags, the name from the two weapon names, +12% damage like all fusions */
FU_RULES.push(['slow',null,'chill'],['blast',null,'splash'],['pull',null,'splash'],['wave',null,'wide'],['melee',null,'wide'],['*',null,'pierce1']);
Object.assign(FU_TX,{chill:'Partner shots chill foes',splash:'Partner hits burst in a small blast',wide:'Partner shots are thicker',pierce1:'Partner shots pierce one more foe'});
function fuName(x,y){const w=id=>WPD[id].n.split(' '),cap=t=>t[0]+t.slice(1).toLowerCase();return cap(w(x)[0])+' '+cap(w(y).slice(-1)[0]);}
/* ----- saved levels ----- */
{const pl=load('mnr_wplv',null);WP.pl={pulse:1};
 if(pl&&typeof pl==='object')for(const id of WP_IDS){const v=Math.floor(+pl[id]);if(v>=1&&v<=WP_MAX)WP.pl[id]=v;}
 const ld=load('mnr_wp',null),ok=i=>WP_IDS.includes(i)&&WP.has(i);
 if(ld&&Array.isArray(ld.eq)){WP.eq=[ok(ld.eq[0])?ld.eq[0]:null,ok(ld.eq[1])&&ld.eq[1]!==ld.eq[0]?ld.eq[1]:null];if(!WP.eqIds().length)WP.eq=['pulse',null];}
 if(!WEAPON_META)WP_ALL_FREE=true;}
var WP_ALL_FREE=false;
WP.has=function(id){return WP_ALL_FREE||(this.pl[id]|0)>0||WP_ALL;};
WP.perm=function(id,n){this.pl[id]=n;this.sync();};                 // test hook: set the permanent level (not saved)
WP.price=function(id){const cur=this.pl[id]|0;return cur>=WP_MAX?0:cur<1?WPD[id].p:WPX_PRICE(cur);};
/* buy the next level (or the unlock) with Neon from the garage wallet; returns {ok,why} and never lets the bank go below zero */
WP.buy=function(id){if(!WPD[id]||!WP_IDS.includes(id))return{ok:false,why:'unknown'};const cur=this.pl[id]|0;if(cur>=WP_MAX)return{ok:false,why:'max'};
  const price=this.price(id);if(!(Number.isFinite(price)&&price>=0)||!(GA.bank>=price))return{ok:false,why:'money',need:Math.max(0,price-GA.bank)};
  GA.bank=Math.max(0,GA.bank-price);this.pl[id]=cur+1;this.save();gsave();this.sync();return{ok:true,price,lv:this.pl[id]};};
{const tg=WP.toggle;WP.toggle=function(id){if(!this.has(id)){this.msg('Locked: buy it in Garage > WEAPONS');return;}tg.call(this,id);};}

/* ----- the eight newer weapons: state, fire, per-tick work, drawing ----- */
const WS={orb:[],fld:[],dr:{x:0,y:0},rc:0,rf:null,fa:0,sly:-999,ft:0};
WPX.reset=()=>{WS.orb=[];WS.fld=[];WS.rc=0;WS.rf=null;WS.fa=0;WS.sly=-999;WPX.last=null;WS.ft=0;if(typeof P!=='undefined'&&P){WS.dr.x=P.x-30;WS.dr.y=P.y-30;}};
WPX.fire.frost=(std,L)=>{if(WP.vc%2!==0)return;const o=y=>({big:1,px:new Set(),pn:1+(L>=3)+(L>=6),col:'#9fe8ff',len:64,th:4+.2*L,cl:1.4+.12*L});
  std(1000,0,.7+.02*L,o());if(L>=10){std(980,-120,.35,o());std(980,120,.35,o());}};
WPX.fire.wave=(std,L)=>{if(WP.vc%(L>=10?2:3)!==0)return;std(520,0,.9,{big:1,px:new Set(),pn:99,col:'#5b8cff',len:26,th:5,rad:6,gw:55+6*L,rm:26+3*L,eat:2+L+(L>=6?3:0)});};
WPX.fire.shell=(std,L)=>{if(WP.vc%4!==0)return;std(480,0,2,{big:1,rad:9,col:'#ffa94d',len:30,th:9,sh:1,sl:L,bx:P.x});};
WPX.fire.drone=(std,L)=>{if(WP.vc%2!==0)return;const l=WPX.last||{vx:900,vy:0,d:1,o:{}},n=1+(L>=6);
  for(let i=0;i<n;i++){const o=Object.assign({},l.o,{x:WS.dr.x+12,y:WS.dr.y,col:'#e6a8ff'});if(l.o.px){o.px=new Set();}if(o.big){o.big=0;o.th=Math.min(o.th||4,5);}
    std(l.vx,l.vy+(i?(i%2?1:-1)*140*Math.ceil(i/2):0),(L>=10?.58:.5)*Math.min(l.d,2),o);}};
WPX.fire.well=(std,L)=>{if(WP.vc%5!==0||WS.orb.length>=(L>=6?2:1))return;WS.orb.push({x:P.x+34,y:P.y,vx:170,t:0,life:2.2+.1*L,R:120+8*L+(L>=3?14:0),L,tk:0});};
WPX.fire.storm=(std,L)=>{if(WP.vc%5!==0||Math.abs(P.y-WS.sly)<40)return;WS.sly=P.y;if(WS.fld.length>=1+(L>=6))WS.fld.shift();WS.fld.push({x:P.x-10,y:P.y,vx:-30,t:0,life:4.5,R:70+4*L+(L>=3?10:0),L,zt:.15});};
WP.hit=(h=>function(b,e){h.call(this,b,e);
  if(b.cl)e.chl=Math.max(e.chl||0,b.cl);
  if(b.sh&&!b.shd){b.shd=1;WPX.shell(b.x,b.y,b.sl||1,b);}
  if(b.ax&&!b.axd){b.axd=1;for(const o of G.en){if(o!==e&&this.tgt(o)&&Math.hypot(o.x-b.x,o.y-b.y)<46+o.r)this.hurtE(o,b.dm*.5);}G.rings.push({x:b.x,y:b.y,l:.2,m:.2,c:b.col||'#fff'});}})(WP.hit);
WPX.shell=(x,y,L,b)=>{const n=4+Math.floor(L/2)+(L>=10),wide=.9+.03*L,k=WP.fk();
  for(let i=0;i<n&&pbRoom();i++){const a=(n>1?i/(n-1)-.5:0)*wide;G.pb.push({x,y,vx:Math.cos(a)*650,vy:Math.sin(a)*650,dm:(.7+.03*L)*tpDmg()*k,pf:0,col:'#ffa94d',len:10,th:3,fz:1});}
  G.rings.push({x,y,l:.3,m:.3,c:'#ffa94d'});burst(x,y,'#ffa94d',8,220,.35);AU.sfx('hit');if(b)b.dead=1;};
WPX.railFire=(L)=>{const dm=DMG.hit((8+.3*L)*tpDmg()*WP.fk()),w=10+.6*L;let n=0;
  for(const e of G.en){if(!WP.tgt(e)||e.x<P.x||Math.abs(e.y-P.y)>e.r+w)continue;WP.hurtE(e,dm);n++;burst(e.x,e.y,WPD.rail.c,4,160,.25);}
  WS.rf={x:P.x,y:P.y,w,l:.3,m:.3};AU.sfx('shot');return n;};
{const bt=WP.beat;WP.beat=function(){bt.call(this);if(!G.live||G.dead||SH.active||P.over||!this.eq.includes('rail'))return;
  const L=this.lvOf('rail'),need=L>=6?2:3;if(++WS.rc>=need){WS.rc=0;WPX.railFire(L);}};
 const rs=WP.reset;WP.reset=function(){rs.call(this);WPX.reset();};
 const u0=WP.upd;WP.upd=function(dt){u0.call(this,dt);if(!G.live||G.dead||SH.active||P.over)return;WPX.upd(dt);};
 const dw=WP.drawWorld;WP.drawWorld=function(t){dw.call(this,t);if(!G||!G.live||G.dead)return;WPX.draw(t);};}
WPX.upd=function(dt){const ids=WP.eqIds(),k=WP.fk();
  if(ids.includes('drone')){const tx=P.x-34,ty=P.y-36,a=Math.min(1,dt*5);WS.dr.x+=(tx-WS.dr.x)*a;WS.dr.y+=(ty-WS.dr.y)*a;}
  // chilled foes move and fire at about half speed
  for(const e of G.en){if(e.chl>0){e.chl-=dt;if(e.type!=='boss'&&e.type!=='gate'&&e.lx!=null){e.x=e.lx+(e.x-e.lx)*.5;e.y=e.ly+(e.y-e.ly)*.5;if(e.bf!=null)e.bf+=dt*.5;}e.lx=e.x;e.ly=e.y;}else e.lx=null;}
  if(ids.includes('wave')){const L=WP.lvOf('wave');for(const b of G.pb){if(!b.gw||b.dead)continue;b.rad=Math.min(b.rm,(b.rad||6)+b.gw*dt);b.th=4+b.rad*.45;
    for(const o of G.eb){if(b.eat<=0)break;if(!o.dead&&Math.hypot(o.x-b.x,o.y-b.y)<b.rad+8){o.dead=1;b.eat--;burst(o.x,o.y,WPD.wave.c,2,100,.2);}}}}
  for(const b of G.pb)if(b.sh&&!b.dead&&b.x>b.bx+300)WPX.shell(b.x,b.y,b.sl||1,b);
  if(ids.includes('well')){const L=WP.lvOf('well');for(let i=WS.orb.length-1;i>=0;i--){const o=WS.orb[i];o.t+=dt;o.x+=o.vx*dt;o.vx=Math.max(60,o.vx-120*dt);o.tk-=dt;
      for(const e of G.en){if(!WP.tgt(e)||e.type==='boss')continue;const dx=o.x-e.x,dy=o.y-e.y,d=Math.hypot(dx,dy);if(d<o.R&&d>4){const pull=Math.min(d,(1-d/o.R)*240*dt);e.x+=dx/d*pull;e.y+=dy/d*pull;}}
      if(o.tk<=0){o.tk=.3;for(const e of G.en)if(WP.tgt(e)&&Math.hypot(e.x-o.x,e.y-o.y)<o.R*.6+e.r)WP.hurtE(e,(.4)*tpDmg()*k);}
      if(o.t>=o.life||o.x>W-20){WS.orb.splice(i,1);const dm=3.4*tpDmg()*k;for(const e of G.en)if(WP.tgt(e)&&Math.hypot(e.x-o.x,e.y-o.y)<o.R*.8+e.r)WP.hurtE(e,dm);
        G.rings.push({x:o.x,y:o.y,l:.4,m:.4,c:WPD.well.c});burst(o.x,o.y,WPD.well.c,10,240,.4);AU.sfx('hit');}}}
  else WS.orb.length=0;
  if(ids.includes('flame')){const L=WP.lvOf('flame');WS.ft-=dt;WS.fa=Math.max(0,WS.fa-dt);
    if(WS.ft<=0){WS.ft=.16;const R=110+4*L+(L>=3?10:0)+(L>=10?14:0),half=.5+.015*L+(L>=6?.06:0),dm=(.55+.025*L)*tpDmg()*k;let any=false;
      for(const e of G.en){if(!WP.tgt(e)||e.x<P.x)continue;const dx=e.x-(P.x+10),dy=e.y-P.y,d=Math.hypot(dx,dy);if(d<R+e.r&&Math.abs(Math.atan2(dy,dx))<half+Math.atan2(e.r,Math.max(20,d))){WP.hurtE(e,dm);any=true;if(Math.random()<.5)burst(e.x,e.y,WPD.flame.c,2,100,.2);}}
      if(any)WS.fa=.25;WS.R=R;WS.half=half;}}
  if(ids.includes('storm')){for(let i=WS.fld.length-1;i>=0;i--){const f=WS.fld[i],L=WP.lvOf('storm');f.t+=dt;f.x+=f.vx*dt;f.zt-=dt;
      if(f.t>=f.life||f.x<-40){WS.fld.splice(i,1);continue;}
      if(f.zt<=0){f.zt=.3;const tg=G.en.filter(e=>WP.tgt(e)&&Math.hypot(e.x-f.x,e.y-f.y)<f.R+e.r).sort((a,b)=>Math.hypot(a.x-f.x,a.y-f.y)-Math.hypot(b.x-f.x,b.y-f.y)).slice(0,1);
        for(const e of tg){WP.hurtE(e,1.6*tpDmg()*k);AX.arcs.push({x1:f.x,y1:f.y,x2:e.x,y2:e.y,l:.18});}if(tg.length)AU.sfx('graze');}}}
  else WS.fld.length=0;
  if(WS.rf){WS.rf.l-=dt;if(WS.rf.l<=0)WS.rf=null;}};
WPX.draw=function(t){const c=ctx,ids=WP.eqIds();c.save();c.globalCompositeOperation='lighter';
  for(const e of G.en)if(e.chl>0){c.globalAlpha=.5;c.strokeStyle=WPD.frost.c;c.lineWidth=2;c.beginPath();c.arc(e.x,e.y,e.r+4,0,7);c.stroke();}
  if(ids.includes('drone')){const d=WS.dr;c.globalAlpha=.95;c.fillStyle=WPD.drone.c;c.beginPath();c.moveTo(d.x+9,d.y);c.lineTo(d.x,d.y-6);c.lineTo(d.x-8,d.y);c.lineTo(d.x,d.y+6);c.closePath();c.fill();c.globalAlpha=.3;c.beginPath();c.arc(d.x,d.y,12+Math.sin(t*9)*2,0,7);c.stroke();}
  for(const o of WS.orb){c.globalAlpha=.25;c.fillStyle=WPD.well.c;c.beginPath();c.arc(o.x,o.y,o.R*(.55+.45*Math.min(1,o.t/o.life)),0,7);c.fill();c.globalAlpha=1;c.strokeStyle=WPD.well.c;c.lineWidth=2;c.beginPath();c.arc(o.x,o.y,8,0,7);c.stroke();c.beginPath();c.arc(o.x,o.y,3,0,7);c.fillStyle='#fff';c.fill();}
  for(const f of WS.fld){c.globalAlpha=.18+.1*Math.sin(t*14);c.fillStyle=WPD.storm.c;c.beginPath();c.arc(f.x,f.y,f.R,0,7);c.fill();c.globalAlpha=.9;c.strokeStyle=WPD.storm.c;c.lineWidth=1.5;c.setLineDash([6,8]);c.beginPath();c.arc(f.x,f.y,f.R,t*2,t*2+6.28);c.stroke();c.setLineDash([]);c.beginPath();c.arc(f.x,f.y,5,0,7);c.stroke();}
  if(ids.includes('flame')&&WS.fa>0){const R=WS.R||130,h=WS.half||.6;c.globalAlpha=Math.min(.55,WS.fa*2.2);const g=c.createRadialGradient(P.x+10,P.y,4,P.x+10,P.y,R);g.addColorStop(0,'#fff6c0');g.addColorStop(.35,WPD.flame.c);g.addColorStop(1,'#ff5a2d00');c.fillStyle=g;c.beginPath();c.moveTo(P.x+10,P.y);c.arc(P.x+10,P.y,R,-h,h);c.closePath();c.fill();}
  if(ids.includes('rail')){const L=WP.lvOf('rail'),need=L>=6?2:3,f=WS.rc/need;c.globalAlpha=.25+.6*f;c.strokeStyle=WPD.rail.c;c.lineWidth=1.5;c.beginPath();c.arc(P.x+26,P.y,5+10*f,0,7);c.stroke();if(f>0){c.globalAlpha=.12*f;c.beginPath();c.moveTo(P.x+30,P.y);c.lineTo(W,P.y);c.stroke();}}
  if(WS.rf){const r=WS.rf,a=r.l/r.m;c.globalAlpha=a;c.fillStyle=WPD.rail.c;c.fillRect(r.x,r.y-r.w*a,W-r.x,r.w*2*a);c.globalAlpha=Math.min(1,a*1.6);c.fillStyle='#fff';c.fillRect(r.x,r.y-2,W-r.x,4);}
  c.restore();};
/* ----- vector demos for the weapon cards (shown until wp-<id>.webp exists) ----- */
Object.assign(WPX.demo,{
  frost(c,t,col,foe,sy){const p=(t%1),hit=p>.5;foe(60,sy,hit);foe(92,sy,p>.7);c.lineWidth=4;c.beginPath();c.moveTo(20,sy);c.lineTo(20+Math.min(1,p*1.5)*76,sy);c.stroke();if(hit){c.globalAlpha=.6;c.beginPath();c.arc(60,sy,9,0,7);c.stroke();c.beginPath();c.arc(92,sy,9,0,7);c.stroke();c.globalAlpha=1;}},
  flame(c,t,col,foe,sy){const f=.75+.25*Math.sin(t*20);foe(60,sy-8,t%1>.5);foe(70,sy+9,t%1>.5);c.globalAlpha=.55;c.beginPath();c.moveTo(20,sy);c.arc(20,sy,58*f,-.6,.6);c.closePath();c.fill();c.globalAlpha=1;},
  wave(c,t,col,foe,sy){const p=(t%1),x=20+p*70,r=4+p*20;foe(96,sy,p>.9);c.beginPath();c.arc(x,sy,r,-1.2,1.2);c.stroke();c.beginPath();c.arc(x-6,sy,r*.8,-1.1,1.1);c.globalAlpha=.4;c.stroke();c.globalAlpha=1;c.fillStyle='#ffffff88';c.fillRect(70,sy-14+((t*40)%28),3,3);},
  shell(c,t,col,foe,sy){const p=(t%1.2)/1.2;if(p<.55){c.beginPath();c.arc(20+p*110,sy,5,0,7);c.fill();}else{const q=(p-.55)/.45;for(let i=-3;i<=3;i++){const a=i*.2;c.beginPath();c.arc(52+Math.cos(a)*q*44,sy+Math.sin(a)*q*44,2,0,7);c.fill();}}foe(96,sy-10,p>.85);foe(96,sy+10,p>.85);},
  drone(c,t,col,foe,sy){const p=(t%.8)/.8;foe(98,sy-6,p>.8);c.fillRect(20+p*70,sy-3,8,3);c.fillRect(30+p*70-20>20?20+((p+.35)%1)*70:20,sy-22,8,3);c.beginPath();c.moveTo(26,sy-22);c.lineTo(20,sy-27);c.lineTo(14,sy-22);c.lineTo(20,sy-17);c.closePath();c.fill();},
  well(c,t,col,foe,sy){const p=(t%2)/2,x=36+p*36;foe(98-p*38,sy-14,p>.9);foe(96-p*34,sy+16,p>.9);foe(100-p*40,sy+2,p>.9);c.globalAlpha=.25;c.beginPath();c.arc(x,sy,26,0,7);c.fill();c.globalAlpha=1;c.beginPath();c.arc(x,sy,6,0,7);c.stroke();if(p>.88){c.globalAlpha=(1-p)*8;c.beginPath();c.arc(x,sy,30,0,7);c.stroke();c.globalAlpha=1;}},
  rail(c,t,col,foe,sy){const p=(t%2)/2,ch=Math.min(1,p*1.6);foe(50,sy,p>.75);foe(94,sy,p>.75);c.globalAlpha=.3+.6*ch;c.beginPath();c.arc(26,sy,3+8*ch,0,7);c.stroke();c.globalAlpha=1;if(p>.75&&p<.95){c.lineWidth=5;c.beginPath();c.moveTo(24,sy);c.lineTo(106,sy);c.stroke();}},
  storm(c,t,col,foe,sy){const p=(t%1);foe(60,sy-10,p>.5&&p<.7);foe(74,sy+12,p>.8);c.globalAlpha=.3;c.setLineDash([4,5]);c.beginPath();c.arc(58,sy,24,t*2,t*2+6.28);c.stroke();c.setLineDash([]);c.globalAlpha=1;c.beginPath();c.arc(58,sy,3,0,7);c.fill();if(p>.5&&p<.7){c.beginPath();c.moveTo(58,sy);c.lineTo(62,sy-6);c.lineTo(60,sy-10);c.stroke();}}});

/* ===== Garage > WEAPONS: one card per weapon, level bar, power preview, next ability, price ===== */
{const st=document.createElement('style');st.textContent=`
#gaCards.wpt{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr));grid-auto-rows:min-content;gap:calc(var(--u)*1.6);overflow-y:auto;-webkit-overflow-scrolling:touch;touch-action:pan-y;align-content:start}
#gaCards.wpt .card{flex-direction:row;text-align:left;justify-content:flex-start;gap:10px;padding:8px 10px;min-height:96px;flex:none}
#gaCards.wpt .card canvas{width:108px;height:52px;flex:0 0 auto;background:#0a0618;border-radius:6px}
#gaCards.wpt .card .tx{flex:1 1 0;min-width:0}#gaCards.wpt .card .n small{font-family:var(--mono);font-weight:400;color:var(--dim);margin-left:6px;font-size:.8em}
#gaCards.wpt .card .pb{display:flex;gap:2px;margin:4px 0 2px}#gaCards.wpt .card .pb i{flex:1 1 0;max-width:16px;height:6px;border-radius:1px;background:#ffffff22}#gaCards.wpt .card .pb i.on{background:var(--c)}
#gaCards.wpt .card .t2{font-family:var(--mono);font-size:clamp(10px,calc(var(--u)*2.9),13px);color:var(--ink);line-height:1.2}#gaCards.wpt .card .t2 b{color:var(--c);font-weight:400}
#gaCards.wpt .card .pr{margin-left:0;align-self:center;border:1px solid var(--amber);border-radius:8px;padding:6px 8px;min-width:64px;text-align:center}
#gaCards.wpt .card.sold .pr{border-color:#8c86b8;color:#8c86b8}
#wpL .card .pp i.run{background:var(--c);opacity:.45}`;document.head.appendChild(st);}
{const tb=garageEl.querySelector('.tabs'),b=document.createElement('button');b.className='go dim';b.dataset.t='weapons';b.type='button';b.textContent='WEAPONS';b.addEventListener('click',()=>{GA.tab='weapons';gaDraw();});tb.appendChild(b);
 window.wpTabDraw=function(){const box=$('gaCards');box.innerHTML='';
  for(const id of WP_IDS){const d=WPD[id],cur=WP.pl[id]|0,own=cur>0,max=cur>=WP_MAX,price=WP.price(id),can=GA.bank>=price,el=document.createElement('button');el.type='button';
   el.className='card'+(max?' sold':'')+(!max&&!can?' no':'');el.style.setProperty('--c',d.c);el.dataset.id=id;el.dataset.kind='weapon';
   const nxt=own?cur+1:1,ab=[3,6,10].find(l=>l>=nxt&&l>cur),abT=ab?`<br>LV${ab}: ${d.ab[[3,6,10].indexOf(ab)]}`:'',
     pw=own?(max?`power <b>${WPX_POWER(cur).toFixed(2)}x</b> (max)`:`power <b>${WPX_POWER(cur).toFixed(2)}x</b> &rarr; <b>${WPX_POWER(cur+1).toFixed(2)}x</b>`):`unlocks at <b>1.00x</b>`;
   el.innerHTML=`<canvas width="108" height="52" data-w="${id}"></canvas><div class="tx"><div class="n">${d.n}<small>${own?'LV '+cur+'/'+WP_MAX:'LOCKED'}</small></div><div class="t">${d.tx}</div><div class="pb">${Array.from({length:WP_MAX},(_,i)=>`<i class="${i<cur?'on':''}"></i>`).join('')}</div><div class="t2">${pw}${max?'':abT}</div></div><div class="pr">${max?'MAX':(own?'BUY LV'+(cur+1):'UNLOCK')+'<br>'+neonI+' '+price}</div>`;
   el.addEventListener('click',()=>{const r=WP.buy(id);if(!r.ok){if(r.why==='money'){el.classList.remove('shake');void el.offsetWidth;el.classList.add('shake');gaMsg('Need '+r.need+' more Neon');}else if(r.why==='max')gaMsg(d.n+' is at max level');return;}
     gaMsg(r.lv===1?d.n+' unlocked':d.s+' is now LV '+r.lv);try{AU.sfx('up')}catch(e){}gaDraw();});
   box.appendChild(el);const c=el.querySelector('canvas').getContext('2d'),n='wp-'+id;if(ART.have(n)){c.drawImage(ART.bm[n],28,0,52,52);}else if(WPX.demoFn)WPX.demoFn(id,c,.7,d.c);}};
 gaDraw();}
// painted weapon icons and fusion pictures: only the files that are real art (media/ready.json) are loaded
try{fetch(ART.base+'ready.json').then(r=>r.ok?r.json():[]).then(l=>{for(const n of l)if(/^(wp-|fx-fuse)/.test(n))ART.load(n.replace(/\.webp$/,''));}).catch(()=>{});}catch(e){}
window.__ga={GA,gsave,openGarage:f=>openGarage(f),WPD};          // test hook
