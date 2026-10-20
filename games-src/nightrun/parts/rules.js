/* ---------- RULES: a new-mechanic cadence (flag RET.rules, default ON; ?rules=0 = the old game). Test: nightrun/rules-test.js.
   Every 3 stages a NEW mechanic comes in (stages 2, 5, 8 ... 44), the next stage brings it back with a TWIST, the third stage combines it with the twist of the one before.
   Endless: one plan step every 5 min of play. Each mechanic is a table entry in RU.T (name, one-line card, colour, interactions) with code-drawn shape art (circles, triangles, bars),
   a >= .8 s telegraph (outline only, no effect), a free gap >= 96 px and caps on what it spawns. It never runs in a boss fight, the tutorial, the Lab or the pit stop.
   None of them takes hull: a mistake costs multiplier, EMP meter or score, so no stage gets harder to clear. Hard+ gets smaller gifts (RU.gk), so Legend is not easier.
   Interactions: DASH (parry) and EMP each change what a mechanic does (RU.T[id].dash / .emp). Codex: localStorage 'mnr_rulecodex' (save export), counters in RU.stat. ---------- */
if(RET.rules===undefined)RET.rules=!/[?&]rules=0/.test(location.search);
if(RET.rules)RET.sioKeys.push('mnr_rulecodex');
const RU=window.RU={st:null,stat:{seen:{},use:{},card:0,obj:0},TEL:.8,
  on(){return !!RET.rules&&!G.tut&&!G.lab&&!(window.SH&&SH.active)&&!G.boss&&!G.dead&&!(ST.on&&ST.over)&&running;},
  gk(){return HARDS.includes(SET.diff)?.5:1;},                    // gifts on Hard, Very hard, Legend: half
  rm(){return !!SET.reduce;},
  codex(){try{return JSON.parse(localStorage.getItem('mnr_rulecodex')||'{}')||{};}catch(x){return{};}},
  seen(id,tw){const c=this.codex(),o=c[id]||(c[id]={n:this.T[id].n,tw:0});const nw=!o.met;o.met=1;if(tw)o.tw=1;try{localStorage.setItem('mnr_rulecodex',JSON.stringify(c));}catch(x){}return nw;},
  count(){const c=this.codex();return Object.keys(c).filter(k=>c[k].met).length;},
  use(id){this.stat.use[id]=(this.stat.use[id]|0)+1;},
  /* ---- the schedule: plan(i) for story stage i (or Endless step i) -> [{id,tw}] ---- */
  plan(n){const L=this.ORDER,N=L.length;if(n<2)return [];const k=Math.floor((n-2)/3),r=(n-2)%3;
    if(k>=N){const a=L[(n*7)%N],b=L[(n*11+3)%N];return a===b?[{id:a,tw:1}]:[{id:a,tw:n%2},{id:b,tw:1-n%2}];}   // past the table: combinations, twists alternate
    if(r===0)return [{id:L[k],tw:0}];
    if(r===1)return [{id:L[k],tw:1}];
    return k>=1?[{id:L[k],tw:0},{id:L[k-1],tw:1}]:[{id:L[0],tw:0}];},
  idx(){return ST.on?ST.n:2+Math.floor(G.t/300);},
  start(){this.st=null;if(!RET.rules||G.tut||G.lab)return;const i=this.idx(),p=this.plan(i);
    this.st={i,list:p.map(x=>({id:x.id,tw:x.tw,age:-6,o:{},on:0})),card:0};},
  /* ---- per frame ---- */
  tick(dt){if(!RET.rules)return;if(!this.st||(!ST.on&&this.idx()!==this.st.i))this.start();const S=this.st;if(!S)return;
    const live=this.on();for(const m of S.list){const D=this.T[m.id];if(!live){if(m.on&&D.off)D.off(m);m.on=0;continue;}
      m.age+=dt;if(m.age<0)continue;
      if(!m.on){m.on=1;m.age=0;D.init(m);this.stat.obj++;
        const nw=this.seen(m.id,m.tw);this.stat.seen[m.id+(m.tw?'~tw':'')]=1;NR.emit('rule',{id:m.id+(m.tw?'~tw':''),n:D.n});
        if(S.list.length>1&&m===S.list[S.list.length-1])NR.emit('rule',{id:S.list.map(x=>x.id+(x.tw?'~tw':'')).join('+')});
        if(nw||m.tw){const t=(m.tw?'TWIST: ':'NEW: ')+D.n+' · '+(m.tw?D.tt:D.t);if(window.HINT){if(HINT.show(t,{t:3.2,col:D.c}))this.stat.card++;}else hintShow(t,3);}}
      if(m.age>=this.TEL)D.tick(m,dt);}},
  draw(){const S=this.st;if(!RET.rules||!S||!this.on())return;
    for(const m of S.list){if(!m.on)continue;const D=this.T[m.id],a=Math.min(1,m.age/this.TEL);ctx.save();
      if(m.age<this.TEL){ctx.setLineDash([6,6]);ctx.globalAlpha=.35+.5*(this.rm()?1:Math.abs(Math.sin(m.age*9)));}   // telegraph: dashed outline, blinking (steady with reduced motion)
      try{D.draw(m,a<1);}catch(e){}ctx.restore();}},
  dash(){const S=this.st;if(!S||!this.on())return;for(const m of S.list)if(m.on&&m.age>=this.TEL&&this.T[m.id].dash){this.T[m.id].dash(m);}},
  emp(){const S=this.st;if(!S||!this.on())return;for(const m of S.list)if(m.on&&m.age>=this.TEL&&this.T[m.id].emp){this.T[m.id].emp(m);}},
  /* ---- helpers ---- */
  shot(x,y,a,dm){if(G.pb.length>=24)return;   // never crowd the ship's own weapon out of the player-shot cap (b.js trims the oldest)
    G.pb.push({x,y,vx:Math.cos(a)*620,vy:Math.sin(a)*620,dm:dm||6,pf:0,ab:1});},
  near(x,y){let b=null,bd=1e9;for(const e of G.en){if(e.dead||e.type==='boss'||e.x>W-10)continue;const d=Math.hypot(e.x-x,e.y-y);if(d<bd){bd=d;b=e;}}return b;},
  shard(x,y){if(G.pk.length<30)G.pk.push({t:'shard',x,y,vx:-60,vy:0,bob:0});},
  sting(txt){G.mult=Math.max(1,G.mult*.6);if(G.ab)G.ab.m=Math.max(0,(G.ab.m||0)-.15);floater(P.x,P.y-28,txt,'#ff3d6a');},
  tri(x,y,r,a){ctx.beginPath();for(let i=0;i<3;i++){const q=a+i*2.094;ctx[i?'lineTo':'moveTo'](x+Math.cos(q)*r,y+Math.sin(q)*r);}ctx.closePath();},
  ring(x,y,r,c,w){ctx.strokeStyle=c;ctx.lineWidth=w||3;ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.stroke();},
  cap(){return ebCap();},
  free(x,y,r){return !G.eb.some(b=>Math.hypot(b.x-x,b.y-y)<r);}};
const BT0=()=>((G.bp%1)+1)%1;   // beat phase 0..1
/* ---- the table: 15 mechanics. id: {n name, t card line, tt twist line, c colour, init, tick, draw, dash?, emp?} (cards: <= 8 words with the name) ---- */
RU.T={
  well:{n:'GRAVITY WELL',t:'it bends every shot',tt:'it orbits, EMP collapses it',c:'#b06bff',
    init(m){m.o.w=[{x:W*.55,y:H*.35},{x:W*.7,y:H*.68}].slice(0,m.tw?1:2);m.o.ph=0;},
    pos(m,w,i){if(!m.tw)return w;const a=m.o.ph+i*3.14;return {x:W*.58+Math.cos(a)*120,y:H*.5+Math.sin(a)*130};},
    tick(m,dt){m.o.ph+=dt*.5;m.o.w.forEach((w0,i)=>{const w=this.pos(m,w0,i);w.x0=w.x;w.y0=w.y;
      for(const b of G.pb){const dx=w.x-b.x,dy=w.y-b.y,d=Math.hypot(dx,dy);if(d<150&&d>8){b.vx+=dx/d*900*dt;b.vy+=dy/d*900*dt;}}
      for(const b of G.eb){const dx=w.x-b.x,dy=w.y-b.y,d=Math.hypot(dx,dy);if(d<130&&d>8){b.vx+=dx/d*110*dt;b.vy+=dy/d*110*dt;}if(d<16&&!b.dead){b.dead=1;RU.use('well');}}});},
    draw(m,t){m.o.w.forEach((w0,i)=>{const w=this.pos(m,w0,i);if(ART.pic('fx-w34-rule-well',300,w.x,w.y))return;RU.ring(w.x,w.y,22,this.c,4);ctx.globalAlpha*=.4;RU.ring(w.x,w.y,150,this.c,1.5);ctx.globalAlpha/=.4;
      if(!t&&!RU.rm())RU.ring(w.x,w.y,22+((G.t*40)%120),this.c,1);});},
    emp(m){for(const [i,w0] of m.o.w.entries()){const w=this.pos(m,w0,i);for(let k=0;k<6;k++)RU.shot(w.x,w.y,k*1.047,8);burst(w.x,w.y,this.c,10,200,.5);}RU.use('well');}},
  lane:{n:'SAFE LANE',t:'stay inside for double score',tt:'it narrows and drifts faster',c:'#3dffb0',
    init(m){m.o.y=H*.5;m.o.h=m.tw?140:190;m.o.in=0;},
    tick(m,dt){m.o.y=H*.5+Math.sin(G.t*(m.tw?.45:.28))*(H*.5-m.o.h/2-40);const inn=Math.abs(P.y-m.o.y)<m.o.h/2;m.o.in=inn;
      if(inn){G.score+=Math.round(40*dt*G.mult);if(G.ab&&P.emp<3)G.ab.m=Math.min(1,(G.ab.m||0)+.012*dt*RU.gk());RU.use('lane');}},
    draw(m){if(ART.pic('fx-w34-rule-lane',W,W/2,m.o.y))return;ctx.fillStyle=this.c;ctx.globalAlpha*=m.o.in?.16:.08;ctx.fillRect(0,m.o.y-m.o.h/2,W,m.o.h);ctx.globalAlpha/=m.o.in?.16:.08;
      ctx.strokeStyle=this.c;ctx.lineWidth=2;for(const s of [-1,1]){ctx.beginPath();ctx.moveTo(0,m.o.y+s*m.o.h/2);ctx.lineTo(W,m.o.y+s*m.o.h/2);ctx.stroke();}
      for(let x=60;x<W;x+=160)RU.tri(x,m.o.y-m.o.h/2+10,8,1.57);},
    dash(m){if(m.o.in&&G.ab){G.ab.n=Math.min(4,(G.ab.n||0)+.5*RU.gk());}}},
  bounce:{n:'BOUNCE PANELS',t:'enemy shots ricochet off them',tt:'dash near one: it bounces shots back',c:'#19e3ff',
    init(m){m.o.p=[{x:W*.62,y:H*.22,l:120},{x:W*.48,y:H*.78,l:120}];m.o.gold=0;},
    tick(m,dt){if(m.o.gold>0)m.o.gold-=dt;for(const p of m.o.p)for(const b of G.eb){if(b.rb||b.dead)continue;if(Math.abs(b.y-p.y)<8&&Math.abs(b.x-p.x)<p.l/2){b.rb=1;b.vy=-b.vy;RU.use('bounce');
      if(m.tw&&m.o.gold>0){b.dead=1;RU.shot(b.x,b.y,Math.atan2(b.vy,-b.vx),7);}}}},
    draw(m){for(const p of m.o.p){if(ART.pic('rule-bounce',p.l+16,p.x,p.y))continue;ctx.fillStyle=m.o.gold>0?'#ffe14d':this.c;ctx.fillRect(p.x-p.l/2,p.y-4,p.l,8);RU.tri(p.x-p.l/2-8,p.y,8,3.14);ctx.fill();RU.tri(p.x+p.l/2+8,p.y,8,0);ctx.fill();}},
    dash(m){if(m.o.p.some(p=>Math.hypot(P.x-p.x,P.y-p.y)<180)){m.o.gold=3;floater(P.x,P.y-30,'PANELS GOLD','#ffe14d');}}},
  echo:{n:'ECHO SHIP',t:'a mirror ship fires too. Protect it',tt:'it follows your path, dash parries for it',c:'#ffb020',
    init(m){m.o.hp=3;m.o.dn=0;m.o.cd=0;m.o.tr=[];m.o.x=P.x;m.o.y=H-P.y;},
    tick(m,dt){const o=m.o;o.tr.push([P.x,P.y]);if(o.tr.length>48)o.tr.shift();
      if(m.tw){const q=o.tr[0];o.x=q[0]-30;o.y=q[1];}else{o.x=P.x;o.y=clamp(H-P.y,30,H-30);}
      if(o.dn>0){o.dn-=dt;if(o.dn<=0)o.hp=3;return;}
      o.cd-=dt;if(o.cd<=0){o.cd=.42/RU.gk();RU.shot(o.x+14,o.y,0,5);RU.use('echo');}
      for(const b of G.eb)if(!b.dead&&Math.hypot(b.x-o.x,b.y-o.y)<b.r+9){b.dead=1;o.hp--;burst(o.x,o.y,this.c,6,140,.3);if(o.hp<=0){o.dn=8;floater(o.x,o.y-20,'ECHO DOWN','#ff3d6a');}break;}},
    draw(m){const o=m.o;if(o.dn>0){ctx.globalAlpha*=.25;}if(!ART.pic('rule-echo',40,o.x,o.y)){ctx.fillStyle=this.c;RU.tri(o.x,o.y,13,0);ctx.fill();}for(let i=0;i<3;i++){ctx.fillStyle=i<o.hp?this.c:'#ffffff33';ctx.fillRect(o.x-12+i*9,o.y+16,7,4);}},
    dash(m){const o=m.o;if(o.dn>0)return;let k=0;for(const b of G.eb)if(!b.dead&&Math.hypot(b.x-o.x,b.y-o.y)<70){b.dead=1;k++;}if(k){RU.use('echo');floater(o.x,o.y-22,'ECHO PARRY','#ffe14d');}}},
  hulls:{n:'BEAT HULLS',t:'ringed foes open only on the beat',tt:'EMP opens every hull for 4 s',c:'#ff5ad8',
    init(m){m.o.open=0;m.o.mk=new WeakSet();m.o.n=0;},
    tick(m,dt){if(m.o.open>0)m.o.open-=dt;const op=m.o.open>0||BT0()<.38||BT0()>.9;
      for(const e of G.en){if(e.dead||e.type==='boss'||e.rh===0)continue;if(e.rh==null){e.rh=(m.o.n++%5===0)?4:0;continue;}
        if(op)continue;for(const b of G.pb){if(b.dead||b.ab)continue;if(Math.hypot(b.x-e.x,b.y-e.y)<e.r+16){b.dead=1;e.rh--;RU.use('hulls');burst(b.x,b.y,this.c,3,90,.2);if(e.rh<=0){e.rh=0;break;}}}}},
    draw(m){const op=m.o.open>0||BT0()<.38||BT0()>.9;for(const e of G.en){if(!(e.rh>0)||e.dead)continue;if(ART.pic('rule-hulls',(e.r+10)*2,e.x,e.y))continue;ctx.strokeStyle=this.c;ctx.lineWidth=3;ctx.beginPath();
      if(op)ctx.arc(e.x,e.y,e.r+10,.6,5.7);else ctx.arc(e.x,e.y,e.r+10,0,7);ctx.stroke();}},
    emp(m){m.o.open=4;RU.use('hulls');}},
  gold:{n:"FOOL'S GOLD",t:'triangles are traps, circles pay',tt:'shoot a trap and it turns real',c:'#ffe14d',
    init(m){m.o.g=[];m.o.cd=2;},
    tick(m,dt){const o=m.o;o.cd-=dt;if(o.cd<=0&&o.g.length<6){o.cd=1.6;o.g.push({x:W+20,y:gx(60,H-60),tr:GX()<.45,ph:GX()*6});}
      for(const g of o.g){g.x-=110*dt;g.ph+=dt;const d=Math.hypot(g.x-P.x,g.y-P.y);
        if(m.tw&&g.tr)for(const b of G.pb)if(!b.dead&&Math.hypot(b.x-g.x,b.y-g.y)<16){b.dead=1;g.tr=false;RU.use('gold');break;}
        if(d<22){g.dead=1;RU.use('gold');if(g.tr)RU.sting('FOOL\'S GOLD');else{G.score+=Math.round(150*G.mult);G.mult=Math.min(9.9,G.mult+.2*RU.gk());floater(g.x,g.y-16,'REAL GOLD','#ffe14d');}}
        if(g.x<-20)g.dead=1;}o.g=o.g.filter(g=>!g.dead);},
    draw(m){for(const g of m.o.g){if(g.tr&&ART.pic('rule-gold',22,g.x,g.y))continue;ctx.fillStyle=this.c;if(g.tr){RU.tri(g.x,g.y,11,g.ph*(RU.rm()?0:2));ctx.fill();ctx.strokeStyle='#ff3d6a';ctx.lineWidth=2;ctx.stroke();}else{ctx.beginPath();ctx.arc(g.x,g.y,9,0,7);ctx.fill();}}}},
  portal:{n:'LANE PORTALS',t:'dash into a ring to jump lanes',tt:'enemy shots go through them too',c:'#7cf8ff',
    init(m){m.o.p=[[W*.3,H*.2],[W*.3,H*.8]];m.o.cd=0;},
    tick(m,dt){const o=m.o;if(o.cd>0)o.cd-=dt;
      if(m.tw)for(const b of G.eb){if(b.pt)continue;for(let i=0;i<2;i++){const p=o.p[i],q=o.p[1-i];if(Math.hypot(b.x-p[0],b.y-p[1])<26){b.pt=1;b.x=q[0]+(b.x-p[0]);b.y=q[1]+(b.vy>0?30:-30);b.vy=-b.vy;RU.use('portal');break;}}}},
    draw(m){for(const p of m.o.p){if(ART.pic('fx-w34-rule-portal',60,p[0],p[1]))continue;RU.ring(p[0],p[1],26,this.c,4);ctx.fillStyle=this.c;ctx.globalAlpha*=.2;ctx.beginPath();ctx.arc(p[0],p[1],26,0,7);ctx.fill();}},
    dash(m){const o=m.o;if(o.cd>0)return;for(let i=0;i<2;i++){const p=o.p[i],q=o.p[1-i];if(Math.hypot(P.x-p[0],P.y-p[1])<70&&RU.free(q[0],q[1],60)){P.x=q[0];P.y=q[1];o.cd=1.2;burst(q[0],q[1],this.c,12,180,.4);RU.use('portal');if(G.ab)G.ab.n=Math.min(4,(G.ab.n||0)+1);return;}}}},
  tide:{n:'RISING TIDE',t:'the tide pushes your ship up',tt:'tides from both edges, EMP drains them',c:'#4d8bff',
    init(m){m.o.h=0;m.o.h2=0;m.o.dr=0;},
    tick(m,dt){const o=m.o;if(o.dr>0)o.dr-=dt;const tgt=o.dr>0?0:(Math.sin(G.t*.35)*.5+.5)*120;o.h+=(tgt-o.h)*dt;
      if(m.tw){const t2=o.dr>0?0:(Math.cos(G.t*.35)*.5+.5)*100;o.h2+=(t2-o.h2)*dt;}
      if(P.y>H-o.h){P.y-=80*dt;RU.use('tide');}if(m.tw&&P.y<o.h2){P.y+=80*dt;RU.use('tide');}},
    draw(m){const o=m.o;ctx.fillStyle=this.c;ctx.globalAlpha*=.28;if(!(o.h>4&&ART.pic('fx-w34-rule-tide',W,W/2,H-o.h+W/8)))ctx.fillRect(0,H-o.h,W,o.h);if(m.tw)ctx.fillRect(0,0,W,o.h2);ctx.globalAlpha/=.28;
      ctx.fillStyle=this.c;for(let x=30;x<W;x+=90){RU.tri(x+((RU.rm()?0:G.t*20)%90),H-o.h-6,7,-1.57);ctx.fill();}},
    emp(m){m.o.dr=6;RU.use('tide');}},
  pocket:{n:'TIME POCKETS',t:'shots crawl inside the bubbles',tt:'the bubble follows you, EMP makes one',c:'#9fffcf',
    init(m){m.o.z=m.tw?[{x:P.x,y:P.y,r:95,f:1}]:[{x:W*.42,y:H*.3,r:90},{x:W*.62,y:H*.72,r:90}];},
    tick(m,dt){const k=HARDS.includes(SET.diff)?.6:.4;for(const z of m.o.z){if(z.f){z.x+=(P.x-z.x)*dt*.6;z.y+=(P.y-z.y)*dt*.6;}if(z.t!=null){z.t-=dt;if(z.t<=0)z.dead=1;}
      for(const b of G.eb){const inn=Math.hypot(b.x-z.x,b.y-z.y)<z.r;if(inn&&!b.tz){b.tz=1;b.vx*=k;b.vy*=k;RU.use('pocket');}else if(!inn&&b.tz===1&&!m.o.z.some(q=>Math.hypot(b.x-q.x,b.y-q.y)<q.r)){b.tz=2;b.vx/=k;b.vy/=k;}}}
      m.o.z=m.o.z.filter(z=>!z.dead);},
    draw(m){for(const z of m.o.z){if(ART.pic('fx-w34-rule-pocket',z.r*2,z.x,z.y))continue;ctx.fillStyle=this.c;ctx.globalAlpha*=.12;ctx.beginPath();ctx.arc(z.x,z.y,z.r,0,7);ctx.fill();ctx.globalAlpha/=.12;RU.ring(z.x,z.y,z.r,this.c,2);
      ctx.beginPath();ctx.moveTo(z.x,z.y-12);ctx.lineTo(z.x,z.y);ctx.lineTo(z.x+9,z.y+5);ctx.stroke();}},
    emp(m){if(m.o.z.length<3){m.o.z.push({x:P.x,y:P.y,r:80,t:5});RU.use('pocket');}}},
  cash:{n:'CASH LINE',t:'shots that cross the line turn to shards',tt:'it only cashes on the beat',c:'#ffd84d',
    init(m){m.o.x=W*.3;m.o.n=0;m.o.c=0;},
    tick(m,dt){const o=m.o;o.x=W*.3+Math.sin(G.t*.3)*80;o.c=Math.max(0,o.c-dt*6);const ok=!m.tw||BT0()<.25;
      for(const b of G.eb){if(b.dead||b.cx)continue;if(b.x<o.x){b.cx=1;if(ok&&o.c<6*RU.gk()){b.dead=1;o.c++;RU.shard(b.x,b.y);RU.use('cash');}}}},
    draw(m){const o=m.o,ok=!m.tw||BT0()<.25;if(ART.pic('fx-w34-rule-cash',H,o.x,H/2,Math.PI/2))return;ctx.strokeStyle=this.c;ctx.lineWidth=ok?4:2;ctx.setLineDash([10,8]);ctx.beginPath();ctx.moveTo(o.x,0);ctx.lineTo(o.x,H);ctx.stroke();ctx.setLineDash([]);
      ctx.fillStyle=this.c;for(let y=40;y<H;y+=120){ctx.beginPath();ctx.arc(o.x,y,6,0,7);ctx.fill();}},
    dash(m){if(Math.abs(P.x-m.o.x)<60){for(const b of G.eb)if(!b.dead&&Math.hypot(b.x-P.x,b.y-P.y)<100){b.dead=1;RU.shard(b.x,b.y);}RU.use('cash');}}},
  hunter:{n:'SHADOW HUNTER',t:'it flies your path. Dash through it',tt:'two hunters, one close behind',c:'#ff3d6a',
    init(m){m.o.tr=[];m.o.h=(m.tw?[60,130]:[110]).map(d=>({d,hp:20,cd:0,dn:0}));},
    tick(m,dt){const o=m.o;o.tr.push([P.x,P.y]);if(o.tr.length>140)o.tr.shift();
      for(const h of o.h){if(h.dn>0){h.dn-=dt;continue;}const q=o.tr[Math.max(0,o.tr.length-h.d)];h.x=q[0];h.y=q[1];if(h.cd>0)h.cd-=dt;
        if(o.tr.length>=h.d&&h.cd<=0&&Math.hypot(h.x-P.x,h.y-P.y)<20&&P.dashT<=0){h.cd=2;RU.sting('STUNG');RU.use('hunter');}
        for(const b of G.pb)if(!b.dead&&Math.hypot(b.x-h.x,b.y-h.y)<16){b.dead=1;h.hp-=1;if(h.hp<=0){h.dn=9;h.hp=20;RU.shard(h.x,h.y);G.score+=Math.round(300*G.mult);RU.use('hunter');}}}},
    draw(m){for(const h of m.o.h){if(h.dn>0||h.x==null)continue;if(ART.pic('rule-hunter',30,h.x,h.y,Math.PI))continue;ctx.fillStyle=this.c;ctx.globalAlpha*=.75;RU.tri(h.x,h.y,12,3.14);ctx.fill();ctx.globalAlpha/=.75;RU.ring(h.x,h.y,17,this.c,1.5);}},
    dash(m){for(const h of m.o.h)if(!(h.dn>0)&&h.x!=null&&Math.hypot(h.x-P.x,h.y-P.y)<90){h.dn=9;RU.shard(h.x,h.y);G.score+=Math.round(300*G.mult);floater(h.x,h.y-20,'HUNTER DOWN','#ffe14d');RU.use('hunter');}}},
  gate:{n:'RHYTHM GATE',t:'shots wait at the gate for the beat',tt:'released shots home in',c:'#ff8a3d',
    init(m){m.o.hold=[];},
    tick(m,dt){const op=BT0()<.3,o=m.o;for(const b of G.pb){if(b.ab||b.gh||b.dead)continue;b.gh=1;if(!op&&o.hold.length<24){b.hv=[b.vx,b.vy];b.vx=0;b.vy=0;o.hold.push(b);}}
      if(op&&o.hold.length){for(const b of o.hold){if(b.hv){b.vx=b.hv[0];b.vy=b.hv[1];b.hv=null;if(m.tw)b.hk=Math.max(b.hk||0,1.6);}}o.hold=[];RU.use('gate');}},
    draw(m){const op=BT0()<.3;if(ART.pic('fx-w34-rule-gate',60,P.x+30,P.y))return;ctx.strokeStyle=this.c;ctx.lineWidth=3;ctx.beginPath();if(op)ctx.arc(P.x+30,P.y,26,-.4,.4);else ctx.arc(P.x+30,P.y,26,-1.2,1.2);ctx.stroke();
      if(!op){ctx.fillStyle=this.c;RU.tri(P.x+56,P.y,7,0);ctx.fill();}},
    dash(m){for(const b of m.o.hold)if(b.hv){b.vx=b.hv[0];b.vy=b.hv[1];b.hv=null;}m.o.hold=[];}},
  cover:{n:'UMBRELLA BLOCKS',t:'rain falls. Hide under your blocks',tt:'EMP shatters blocks into shots',c:'#c8d2ff',
    init(m){m.o.b=[];m.o.cd=0;m.o.rc=1;},
    tick(m,dt){const o=m.o;o.cd-=dt;if(o.cd<=0&&o.b.length<3){o.cd=5;this.drop(m);}
      o.rc-=dt;if(o.rc<=0){o.rc=.9/RU.gk();if(G.eb.length<ebCap()-6){const x=gx(150,W-60);if(Math.abs(x-P.x)>96){eb.src=null;eb(x,-8,1.5708,110,null,5);RU.use('cover');}}}
      for(const k of o.b){k.x-=20*dt;for(const b of G.eb)if(!b.dead&&Math.abs(b.x-k.x)<k.w/2&&Math.abs(b.y-k.y)<10){b.dead=1;k.hp--;RU.use('cover');}if(k.hp<=0||k.x<-40)k.dead=1;}o.b=o.b.filter(k=>!k.dead);},
    drop(m){if(m.o.b.length<4)m.o.b.push({x:P.x,y:Math.max(30,P.y-50),w:70,hp:6});},
    draw(m){for(const k of m.o.b){if(ART.pic('rule-cover',k.w,k.x,k.y,0,.5+.1*k.hp))continue;ctx.fillStyle=this.c;ctx.globalAlpha*=.4+.1*k.hp;ctx.fillRect(k.x-k.w/2,k.y-6,k.w,12);ctx.globalAlpha/=.4+.1*k.hp;}},
    dash(m){this.drop(m);},
    emp(m){if(!m.tw)return;for(const k of m.o.b){for(let i=0;i<4;i++)RU.shot(k.x,k.y,-.6+i*.4,7);}m.o.b=[];RU.use('cover');}},
  bumper:{n:'BUMPER ORBS',t:'your shots ricochet off them at foes',tt:'dash into one to launch it',c:'#5affb4',
    init(m){m.o.o=[{x:W*.5,y:H*.3,vx:40,vy:70},{x:W*.66,y:H*.7,vx:-50,vy:-60}];},
    tick(m,dt){for(const q of m.o.o){if(q.l){q.l-=dt;q.x+=q.vx*dt;q.y+=q.vy*dt;for(const e of G.en)if(!e.dead&&e.type!=='boss'&&Math.hypot(e.x-q.x,e.y-q.y)<e.r+16){RU.shot(e.x-10,e.y,0,25);q.l=0;}if(q.l<=0){q.l=0;q.x=W*.55;q.y=H*.5;q.vx=40;q.vy=60;}continue;}
      q.x+=q.vx*dt;q.y+=q.vy*dt;if(q.y<60||q.y>H-60)q.vy=-q.vy;if(q.x<W*.35||q.x>W*.8)q.vx=-q.vx;
      for(const b of G.pb){if(b.dead||b.bo||Math.hypot(b.x-q.x,b.y-q.y)>18)continue;b.bo=1;const e=RU.near(q.x,q.y);if(e){const a=Math.atan2(e.y-q.y,e.x-q.x),s=Math.hypot(b.vx,b.vy)||600;b.vx=Math.cos(a)*s;b.vy=Math.sin(a)*s;RU.use('bumper');}}}},
    draw(m){for(const q of m.o.o){if(ART.pic('rule-bumper',42,q.x,q.y))continue;ctx.fillStyle=this.c;ctx.beginPath();ctx.arc(q.x,q.y,14,0,7);ctx.fill();RU.ring(q.x,q.y,20,this.c,2);}},
    dash(m){if(!m.tw)return;for(const q of m.o.o)if(!q.l&&Math.hypot(q.x-P.x,q.y-P.y)<110){q.l=1.5;q.vx=700;q.vy=0;RU.use('bumper');}}},
  pads:{n:'BOOST PADS',t:'fly over arrows: a dash charge back',tt:'the arrows flip, follow them',c:'#a6ff3d',
    init(m){m.o.p=[];m.o.cd=1;},
    tick(m,dt){const o=m.o;o.cd-=dt;if(o.cd<=0&&o.p.length<3){o.cd=3.5;o.p.push({x:W+20,y:gx(70,H-70),u:0});}
      for(const p of o.p){p.x-=90*dt;const dir=m.tw&&Math.floor(G.t/3)%2?-1:1;p.dir=dir;
        if(!p.u&&Math.hypot(p.x-P.x,p.y-P.y)<30){p.u=1;if(G.ab)G.ab.n=Math.min(4,(G.ab.n||0)+(m.tw?1:.6)*RU.gk());P.y=clamp(P.y+dir*40,30,H-30);RU.use('pads');floater(P.x,P.y-24,'BOOST','#a6ff3d');}
        if(p.x<-30)p.dead=1;}o.p=o.p.filter(p=>!p.dead);},
    draw(m){for(const p of m.o.p){if(ART.pic('rule-pads',44,p.x,p.y,(p.dir||1)>0?0:Math.PI,p.u?.3:1))continue;ctx.fillStyle=this.c;ctx.globalAlpha*=p.u?.3:1;RU.tri(p.x,p.y,14,(p.dir||1)>0?1.5708:-1.5708);ctx.fill();RU.tri(p.x+14,p.y,10,(p.dir||1)>0?1.5708:-1.5708);ctx.fill();ctx.globalAlpha/=p.u?.3:1;}}}};
RU.ORDER=['well','lane','echo','gold','portal','bounce','pocket','hunter','gate','tide','cash','cover','bumper','hulls','pads'];
/* ---- hooks (all inert with the flag off) ---- */
NR.on('runStart',()=>{RU.st=null;if(RET.rules)RU.start();});
NR.on('tick',dt=>{try{RU.tick(dt);}catch(err){}});
{const dp=drawPlayer;drawPlayer=function(t){if(RET.rules)try{RU.draw();}catch(err){}dp(t);};}
if(window.CTR){const cd=CTR.dash,ce=CTR.emp;CTR.dash=function(){const r=cd.apply(this,arguments);try{RU.dash();}catch(e){}return r;};CTR.emp=function(){try{RU.emp();}catch(e){}return ce.apply(this,arguments);};}
