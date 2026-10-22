// PURPOSE: Street 2: the Zeil street run rebuilt as a 90 s arc with breakable cover, 3 foe behaviours and a choice every ~15 s
// FLAG: street2 (?street2=0)
// TEST: qa/street2-test.js
/* ---------- STREET2 (design: games-src/nightrun/STREET2.md). Owner, 22 Oct 2026 (2/100): "on foot is extremely boring, very repetitive, not strategic,
   no variety, maybe destructible items, size of the assets is not correct". Replaces FOOT.STAGES.zeil when RET.street2 is on (?street2=0 = footstage.js's
   7-section stage exactly). 6 rooms of ~15 s: rushers, a gunner behind a car (high path / low path), a heavy baited into a red barrel, a gold crate under
   fire, two gunners, the big heavy. Cover stops bullets from both sides and breaks (debris, some hold a reward). No captions during play.
   Engine hooks used (foot.js): p.dr / p.onBreak / p.pass on props, F._in.boom/hitProp/ftHurt/dmgE; streetlook.js: p.draw(c,K,at) draws a prop's picture. ---------- */
if(RET.street2===undefined)RET.street2=!/[?&]street2=0/.test(location.search);
(function(){
if(!RET.street2||!RET.foot||!window.FOOT||!FOOT._in||!FOOT.STAGES)return;
const F=window.FOOT,IN=F._in,FL=470,abs=Math.abs,sgn=v=>v<0?-1:1,clamp=(v,a,b)=>v<a?a:v>b?b:v;
const FE=window.FOOT_ENEMIES=window.FOOT_ENEMIES||{},FBS=window.FOOT_BOSS=window.FOOT_BOSS||{};
const S2=F.S2={log:null};
/* ----- props: own kinds (only this stage places them), pictures from the existing sc-* sheets and the car strip ----- */
Object.assign(IN.PROPD,{car:{hp:9,w:104,h:52,c:'#3a4a66',dr:[]},barrel:{hp:1,w:28,h:40,c:'#d0303a',dr:[]},kiosk:{hp:7,w:56,h:78,c:'#2a8ad0',dr:[]},
  scrate:{hp:4,w:44,h:42,c:'#7a5a30',dr:[]},gold:{hp:4,w:44,h:42,c:'#ffd23a',dr:[]},post:{hp:5,w:54,h:62,c:'#ff2d95',dr:[]}});
const PIC={scrate:'sc-crate',gold:'sc-crate',barrel:'sc-barrel',kiosk:'sc-vending',post:'sc-neon-sign'};
const pic=n=>{const fa=window.FA;const q=fa&&fa._pic?fa._pic('foot/'+n+'.webp'):null;return q&&q.width?q:null;};
function propDraw(p){return function(c,K,at){at(c,p.x,p.y,K);const fl=p.fl>0;let ok=false;
  if(p.k==='gold'){c.fillStyle='#ffd23a';c.globalAlpha=.22+.12*Math.sin(F.S.time*5);c.beginPath();c.ellipse(p.x,p.y-p.w*.45,p.w*.85,p.w*.7,0,0,6.283);c.fill();c.globalAlpha=1;}
  if(p.k==='car'&&typeof ART!=='undefined'&&ART.ANIM&&ART.ANIM.s){const k='prop-car/loop',m=ART.ANIM.s[k];if(m&&ART.anim(k)){const h=p.w*m[3]/m[2];ART.drawAnim(c,k,0,p.x,p.y-h/2,h/m[3],false,1);ok=true;}}
  else{const q=pic(PIC[p.k]);if(q){const h=p.k==='barrel'?p.h:p.k==='kiosk'?p.h*1.05:p.k==='post'?p.h:p.w,w=h*q.width/q.height;c.drawImage(q,p.x-w/2,p.y-h,w,h);ok=true;}}
  if(!ok){c.fillStyle=p.c;c.fillRect(p.x-p.w/2,p.y-p.h,p.w,p.h);}
  if(p.k==='barrel'){c.fillStyle='#ff3040';c.globalAlpha=.25+.2*Math.sin(F.S.time*8);c.beginPath();c.arc(p.x,p.y-p.h*.5,p.w*.8,0,6.283);c.fill();c.globalAlpha=1;}
  const dmg=1-p.hp/p.mhp;if(dmg>.3&&p.k!=='barrel'){c.strokeStyle='#05030c';c.lineWidth=2;c.beginPath();c.moveTo(p.x-p.w*.3,p.y-p.h*.8);c.lineTo(p.x,p.y-p.h*.5);c.lineTo(p.x-p.w*.1,p.y-p.h*.2);if(dmg>.6){c.moveTo(p.x+p.w*.3,p.y-p.h*.9);c.lineTo(p.x+p.w*.05,p.y-p.h*.45);}c.stroke();}
  if(fl){c.globalAlpha=.5;c.fillStyle='#fff';c.fillRect(p.x-p.w/2,p.y-p.h,p.w,p.h);c.globalAlpha=1;}
  c.restore();return true;};}
function debris(S,p){for(let i=0;i<10;i++)S.fx.push({x:p.x+(Math.random()-.5)*p.w,y:p.y-p.h*Math.random(),vx:(Math.random()-.5)*420,vy:-160-Math.random()*320,l:.7,c:p.k==='gold'?'#ffd23a':p.c,r:3+Math.random()*3});}
function barrelBlast(S,p){IN.boom(p.x,FL-24,95,7);const P=S.P;if(abs(P.x-p.x)<70&&P.y>FL-100)IN.ftHurt(1,p.x,'blast');
  for(const e of S.E)if(!e.dead&&e.heavy&&abs(e.x-p.x)<120){e.stun=2.4;e.state='stun';e.sT=0;IN.dmgE(e,e.max*.3,{pierce:1,blast:1});}}
/* ----- foes: rusher (knife sheet), gunner (gunman sheet), heavy (bruiser sheet). They move themselves (ext), feet on the road. ----- */
F.drawX=F.drawX||{};for(const [id,sh] of [['rusher','knife'],['gunner','gunman'],['heavy','bruiser'],['bigheavy','bruiser']])F.drawX[id]=(c,pose,x,y,h,flip,t,col)=>{IN.drawWho(c,sh,pose,x,y,h,flip,t,col);};
function wrap(def,fn){def.touch=0;def.ai=function(e,dt,env){if(!e._i){e._i=1;e.sT=0;e.state='in';e.y=FL;e.facing=sgn(env.P.x-e.x);e.born=env.G.time;}
    e.sT+=dt;e.y=FL;if(e.state==='dead'){e.vx=0;e.tele=0;e.wind=0;if(e.sT>.5)e.remove=true;return;}fn(e,dt,env);};
  def.onDeath=function(e){e.state='dead';e.sT=0;e.tele=0;e.wind=0;const L=def.drops||[];e.dropList=L.length&&Math.random()<(def.dropP||0)?[L[Math.floor(Math.random()*L.length)]]:[];};return def;}
function go(e,s){e.state=s;e.sT=0;}
function walk(e,env,v,dt){const G=env.G,lo=G.camX+e.w/2,hi=G.camX+G.viewW-e.w/2,nx=e.x+v*dt;if(!e.seen||(nx>=lo&&nx<=hi))e.x=nx;e.vx=v;}
const age=(e,env)=>e.seenAt2==null?0:env.G.time-e.seenAt2;
FE.rusher=wrap({hp:2,w:28,h:62,score:120,c:'#ff4a9a',drops:['heal','bomb'],dropP:.12,
  pose:e=>e.state==='dead'?'die':e.flash>0?'hit':e.state==='crouch'?'crouch':e.state==='lunge'?'melee':abs(e.vx)>5?(Math.floor(e.t*8)%2?'run-a':'run-b'):'idle'},
  (e,dt,env)=>{const P=env.P,dx=P.x-e.x;
    if(e.state==='in'||e.state==='run'){e.facing=sgn(dx);walk(e,env,e.facing*300,dt);if(e.state==='in')go(e,'run');if(abs(dx)<120&&e.grace<=0&&abs(P.y-e.y)<120)go(e,'crouch');}
    else if(e.state==='crouch'){e.vx=0;e.tele=.45-e.sT;if(e.sT>=.45){go(e,'lunge');e.tele=0;}}
    else if(e.state==='lunge'){walk(e,env,e.facing*860,dt);env.melee(e,{x:e.x-20,y:e.y-50,w:40,h:50},1);if(e.sT>=.3)go(e,'rest');}
    else if(e.state==='rest'){e.vx=0;if(e.sT>=.5)go(e,'back');}
    else if(e.state==='back'){e.facing=sgn(dx);walk(e,env,-e.facing*240,dt);if(e.sT>=.55||abs(dx)>220)go(e,'run');}});   // backs off after a lunge: a clear shot
FE.gunner=wrap({hp:3,w:30,h:64,score:200,c:'#e07a2a',drops:['w_hmg','w_shot','heal'],dropP:.25,
  canHit:e=>!e.hid,
  pose:e=>e.state==='dead'?'die':e.flash>0?'hit':e.hid?'crouch':e.tele>0||e.state==='pop'?'shoot':abs(e.vx)>5?(Math.floor(e.t*7)%2?'run-a':'run-b'):'idle'},
  (e,dt,env)=>{const P=env.P,S=F.S,dx=P.x-e.x;e.facing=sgn(dx);
    const cov=e.cov&&e.cov.hp>0&&!e.cov.gone?e.cov:null;
    if(!cov&&e.state!=='charge'){let best=null,bd=1e9;for(const p of S.pr)if(p.hp>0&&!p.gone&&p.cover&&!(p.claim&&p.claim!==e&&!p.claim.dead)&&p.x>P.x+90&&p.x<env.G.camX+env.G.viewW-20&&abs(p.x-e.x)<bd){bd=abs(p.x-e.x);best=p;}
      e.cov=best;if(best)best.claim=e;if(!best&&e.state!=='open')go(e,'open');}
    if(age(e,env)>14&&e.state!=='charge'){go(e,'charge');e.hid=false;}
    if(e.state==='charge'){walk(e,env,abs(dx)>120?e.facing*170:abs(dx)<90?-e.facing*120:0,dt);e.hid=false;e.cd=(e.cd||1)-dt;if(e.cd<=0&&abs(dx)<400){e.cd=1.8;env.shoot(e,Math.atan2(P.y-40-(e.y-40),dx),330,1);}return;}
    const c2=e.cov&&e.cov.hp>0?e.cov:null;
    if(c2){const side=sgn(c2.x-P.x)||1,tx=c2.x+side*(c2.w/2+16);if(abs(tx-e.x)>6){walk(e,env,sgn(tx-e.x)*150,dt);e.hid=false;return;}e.vx=0;
      const flank=sgn(e.x-c2.x)!==sgn(P.x-c2.x)?false:true,above=P.y<FL-70&&abs(dx)<300;
      e.cd=(e.cd==null?1.4:e.cd)-dt;
      if(e.state!=='pop'){e.hid=!(flank||above);if(e.cd<=0){go(e,'pop');e.hid=false;e.tele=.5;}}
      else{e.hid=false;if(e.sT>=.5&&!e.fired){e.fired=1;const sy=e.y-44;env.shoot(e,Math.atan2(P.y-40-sy,dx),360,1,{oy:sy});}if(e.sT>=1){e.fired=0;go(e,'hide');e.cd=2+Math.random()*.6;}}
      if(flank||above)e.hid=false;return;}
    // no cover left: in the open, keeps range and fires
    e.hid=false;const want=230;walk(e,env,abs(dx)>want+30?e.facing*150:abs(dx)<want-60?-e.facing*110:0,dt);
    e.cd=(e.cd==null?1:e.cd)-dt;if(e.cd<=0&&e.tele<=0&&!e.tw){e.tele=.5;e.tw=1;}if(e.tw&&e.tele<=0){e.tw=0;e.cd=2.2;env.shoot(e,Math.atan2(P.y-40-(e.y-44),dx),360,1,{oy:e.y-44});}});
function heavyDef(hp,h,w,score,boss){return wrap({hp,w,h,score,c:'#a03050',heavyK:1,drops:['heal','w_rocket'],dropP:boss?0:.6,
  onHit(e,d,env,hit){if(e.state==='dead')return;const front=hit&&!hit.melee&&hit.x!=null&&sgn(hit.x-e.x)===e.facing&&e.state!=='stun';if(front)e.hp+=d*.7;else if(e.state==='stun')e.hp-=d;},
  pose:e=>e.state==='dead'?'die':e.state==='stun'?'hit':e.flash>0?'hit':e.state==='wind'?'crouch':e.state==='charge'?'melee':abs(e.vx)>5?(Math.floor(e.t*5)%2?'run-a':'run-b'):'idle'},
  (e,dt,env)=>{const P=env.P,S=F.S,dx=P.x-e.x;e.heavy=1;e.label=e.state==='stun'?'OPEN':'';
    if(e.state==='in'||e.state==='walk'){e.facing=sgn(dx);walk(e,env,abs(dx)>140?e.facing*70:0,dt);if(e.state==='in')go(e,'walk');e.cd=(e.cd==null?1.6:e.cd)-dt;if(e.cd<=0&&e.grace<=0&&e.seen)go(e,'wind');}
    else if(e.state==='wind'){e.vx=0;e.tele=.8-e.sT;if(e.sT>=.8){e.tele=0;go(e,'charge');e.chX=e.x;}}
    else if(e.state==='charge'){walk(e,env,e.facing*(boss?560:520),dt);env.melee(e,{x:e.x-e.w/2,y:e.y-e.h,w:e.w,h:e.h},1);
      for(const p of S.pr)if(p.hp>0&&!p.gone&&abs(p.x-e.x)<p.w/2+e.w/2){if(p.k==='barrel'){IN.hitProp(p,5);}else IN.hitProp(p,99);}
      const G=env.G,wall=e.x<=G.camX+e.w/2+2||e.x>=G.camX+G.viewW-e.w/2-2;if(e.state==='charge'&&(e.sT>=1.1||wall)){go(e,wall?'stun':'walk');if(wall)e.stun=1;e.cd=boss?2:2.6;}}
    else if(e.state==='stun'){e.vx=0;if(e.sT>=(e.stun||2.2)){go(e,'walk');e.cd=boss?1.6:2.2;}}});}
FE.heavy=heavyDef(22,84,46,500,false);
FBS.bigheavy=FE.bigheavy=heavyDef(110,96,54,3000,true);   // ext bosses get x0.3 hp in the engine: 110 -> 33
/* ----- the stage ----- */
const ROOMS=[{n:'THE STREET',x:0},{n:'BEHIND THE CAR',x:1450},{n:'THE HEAVY',x:2450},{n:'KIOSK ROW',x:3450},{n:'TWO WAYS',x:4450},{n:'CLIMAX',x:5450}];
const w=(x,enemy,count,gap,o)=>Object.assign({x,enemy,count,gap},o||{}),k=(lock,enemy,count,gap,delay,o)=>Object.assign({lock,enemy,count,gap,delay},o||{});
const ST={n:'ZEIL UNDERPASS',len:6500,song:'stage2',cp:2450,cps:[2450,4450],fs:1,s2:1,aimCone:.8,   // aimCone: wide aim help so the high path can shoot down behind cover

  plats:[[1780,372,190],[4790,362,200]],
  props:[[520,'scrate',{dr:['w_shot']}],[760,'scrate'],[980,'gold',{dr:['w_hmg']}],[1150,'scrate'],
    [1800,'scrate',{cover:1}],[1990,'car',{cover:1}],[2200,'post'],
    [2790,'scrate',{cover:1}],[2880,'barrel'],[3120,'scrate'],
    [3800,'scrate',{cover:1}],[3880,'gold',{dr:['heal']}],[3990,'kiosk',{cover:1}],[4200,'scrate'],
    [4790,'scrate',{cover:1}],[4960,'scrate',{cover:1}],[5040,'kiosk',{cover:1}],[5250,'post'],
    [5800,'scrate',{cover:1}],[5900,'barrel'],[6110,'barrel'],[6200,'kiosk',{cover:1}]],
  pk:[[2400,'ammo'],[3300,'heal'],[4400,'heal'],[5450,'heal'],[5600,'ammo']],
  waves:[w(420,'rusher',2,1.4),k('A','rusher',3,1.3,0),k('A','rusher',1,1,4,{side:'l'}),
    w(1500,'rusher',1,1),k('B','gunner',1,1,0),k('B','rusher',2,2.5,4),
    k('C','heavy',1,1,0),k('C','rusher',1,1,7,{side:'l'}),
    w(3300,'rusher',2,1.2),k('D','gunner',1,1,0),k('D','rusher',3,1.8,2.5),
    k('E','gunner',1,1,0),k('E','gunner',1,1,3.5),k('E','rusher',2,2,5,{side:'l'})],
  locks:[{id:'A',x:900},{id:'B',x:1950},{id:'C',x:2900},{id:'D',x:3900},{id:'E',x:4950}],
  boss:{x:6000,id:'bigheavy'},
  tale:F.STAGES.zeil&&F.STAGES.zeil.tale};
const roomOf=S=>{let r=0;for(let i=0;i<ROOMS.length;i++)if(S.P.maxX>=ROOMS[i].x-200)r=i;return r;};
ST.hook={
  step(S,dt,env){const P=S.P;if(!S.s2){S.s2={broke:0,life:[],adds:0,addT:0,rooms:[]};S2.log=S.s2;
      for(const p of S.pr){const o=(ST.props[p.i]||[])[2]||{},d=IN.PROPD[p.k];p.mhp=p.hp;p.cover=!!o.cover;p.dr=o.dr||(p.k==='scrate'&&p.i%3===0?[['heal','bomb','w_shot','w_rocket'][p.i%4]]:[]);p.draw=propDraw(p);
        p.onBreak=q=>{S.s2.broke++;debris(S,q);if(q.k==='barrel')barrelBlast(S,q);};}}
    const f=S.s2;S.note.t=0;   // no captions or chips during play
    const r=roomOf(S);if(f.rooms[f.rooms.length-1]!==r){f.rooms.push(r);}
    for(const p of S.pr)p.pass=p.hp>0&&p.cover&&abs(p.x-P.x)<p.w/2+70;   // the cover Kai stands at: his shots go over it
    for(const e of S.E)if(!e.dead&&!e.seen&&!e._sd&&!e.boss){e._sd=1;const G=env.G;if(abs(e.x-P.x)<260&&!e.fly){const other=e.x>P.x?G.camX-40:G.camX+G.viewW+40;if(abs(other-P.x)>=260)e.x=other;}}   // never spawn on top of Kai: come in from the far side
    for(const e of S.E){if(e.seen&&e.seenAt2==null)e.seenAt2=S.time;if(e.dead&&!e._s2){e._s2=1;if(e.seenAt2!=null){f.life.push(+(S.time-e.seenAt2).toFixed(1));if(e.boss)f.bossLife=+(S.time-e.seenAt2).toFixed(1);}}}
    // enemy bullets: cover stops them and wears down
    for(const b of S.eb){if(b.life<=0)continue;for(const p of S.pr){if(p.hp<=0||p.gone||p.k==='barrel')continue;if(b.x>p.x-p.w/2-b.r&&b.x<p.x+p.w/2+b.r&&b.y>p.y-p.h-b.r&&b.y<p.y+4){b.life=0;IN.hitProp(p,.5);break;}}}
    // climax: rushers keep coming while the big heavy stands (max 2 at once)
    if(S.bossOn&&S.boss&&!S.boss.dead&&S.time>=f.addT){f.addT=S.time+6;if(S.E.filter(e=>!e.dead&&e.id==='rusher').length<2){F.env.spawn('rusher',f.adds++%2?S.camX-40:S.camX+env.G.viewW+40,null);}}},
  draw(c,S){},
  hud(c,vw,u,box,fs,S){const x0=vw*.18,bw=vw*.64,y=540-14*u,h=6*u,pr=clamp(S.P.maxX/ST.boss.x,0,1);
    c.fillStyle='#ffffff22';c.fillRect(x0,y,bw,h);c.fillStyle='#19e3ff';c.fillRect(x0,y,bw*pr,h);
    for(const s of ROOMS.slice(1)){const sx=x0+bw*s.x/ST.boss.x;c.fillStyle=S.P.maxX>=s.x?'#ffd23a':'#ffffff88';c.fillRect(sx-1.5*u,y-3*u,3*u,h+6*u);}
    box(x0,y-8*u,bw,h+16*u);},
  rows(S,rows){rows.splice(3,0,['BROKEN',String(S.s2?S.s2.broke:0)]);}};
F.STAGES.zeil=ST;F.SEC=ROOMS;
})();
