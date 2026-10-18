/* ---------- flavor.js: run-and-gun flavour for the shooter (W5, 18 Oct 2026). Flag RET.flavor; ?flavor=0 = the game as it was (nothing spawns, nothing is drawn, no dice are rolled).
   Story stages only (never the LAB, the tutorial, endless or the daily run), nothing new starts during a boss.
   1. CAPTIVES: a hacked courier drone (DATA SPRITE) in a glowing cage drifts in from the right, 1 (stages 1-4) or 2 per stage, none in the first minute of stages 1-2.
      Shoot the cage (6-8 hits, the shots pass through it) to free it: a free WINGMATES for 2 bars, or +1000 and a random pickup if a timed power is already running.
      An unrescued cage that leaves the screen is neutral (not a leak, no BREACH). RESCUED n/m shows on the clear screen and pays a few Neon.
   2. BREAKABLES: neon signs, lamps, billboards and cargo crates drift in the background lane (themed per district), at most 3 at once. Shot, they drop shards or a pickup;
      about one in five is a decoy that pops harmlessly. They never block a bullet or an enemy, never count as a leak, and never spawn level with the ship (standing still earns nothing).
   3. SECRETS: from stage 3 one per stage: a faint marked spot to fly into (odd stages) or a flickering sign to shoot (even stages) -> SECRET FOUND + a medal worth points. NR.emit('secret').
   4. MEDALS on the clear screen: NO LEAK, NO HIT, ALL RESCUED, SECRET, SPEED CLEAR (only the ones this stage can award), a few Neon the first time per stage. NR.emit('medal',{id}).
   5. SET PIECES (the 2nd stage of a district, one per stage, spawned on a bar line, dodgeable): CONVOY (a long armoured train along the road, shoot its roof hatch; not in portrait: no road)
      or COLLAPSE (a billboard drops debris down lanes that flash red for >= 0.6 s first); the reward is a chest.
   Enemy bullets only through eb() (ebCap/BCAP), the one hurt() per hazard, no new bullet kinds. Tests: ret-flavor-test.js. Art: code-drawn placeholders, assets-manifest.json group 'Shooter flavour'. ---------- */
if(RET.flavor===undefined)RET.flavor=!/[?&]flavor=0/.test(location.search);
const FL=window.FL=(function(){
  const KEY='mnr_flavor',MEDALS=[
    ['noleak','NO LEAK','▣','#19e3ff'],['nohit','NO HIT','✚','#3dffb0'],['rescued','ALL RESCUED','♥','#ff7ad9'],['secret','SECRET','✦','#ffd23d'],['speed','SPEED CLEAR','»','#ff8a3d']];
  const NEON={medal:4,resc:2,rescCap:4};                                  // economy: a few Neon, medals only the first time per stage
  const F={on:()=>!!RET.flavor,MEDALS,NEON,id:0,cap:[],brk:[],itm:[],fx:[],sec:null,set:null,plan:null,s:null,res:null,
    S:(function(){let o=null;try{o=JSON.parse(localStorage.getItem(KEY)||'null');}catch(e){}o=o&&typeof o==='object'?o:{};
      return{resc:o.resc|0,sec:o.sec|0,brk:o.brk|0,med:o.med&&typeof o.med==='object'?o.med:{},first:o.first&&typeof o.first==='object'?o.first:{},found:Array.isArray(o.found)?o.found.slice(0,60):[]};})(),
    store(){try{localStorage.setItem(KEY,JSON.stringify(this.S));}catch(e){}},
    rnd:(a,b)=>a+Math.random()*(b-a),
    easy:()=>SET.diff==='easy'||SET.diff==='normal',
    live(){return !!RET.flavor&&running&&G.live&&!G.dead&&ST.on&&!ST.over&&!G.lab&&!G.tut;},
    calm(){return !!(G.boss||G.bossDone);},
    reset(){this.cap=[];this.brk=[];this.itm=[];this.fx=[];this.sec=null;this.set=null;this.plan=null;this.res=null;this.s=null;this.lastBrk=-9;},
    /* ---- the plan of one stage (bars on the stage clock; the bar line decides the exact spawn) ---- */
    mkPlan(){const n=ST.n,span=Math.max(12,ST.lead>0?ST.lead:ST.len),d=ST.def||{},j=()=>this.rnd(-.04,.04);
      const caps=n<=4?[.5+j()]:[.3+j(),.64+j()];
      this.s={n,tot:0,resc:0,sec:false,secPlanned:false,brk:0,bossBar:-1,goalBar:-1,span};
      this.plan={caps:caps.map(f=>({bar:f*span,done:false})),sec:null,set:null};
      if(n>=3&&n<=MAIN&&!ST.ch){this.plan.sec={bar:(.35+this.rnd(0,.3))*span,done:false,kind:n%2?'spot':'sign'};this.s.secPlanned=true;}
      if((d.pos|0)===1&&!ST.ch&&n<=MAIN)this.plan.set={bar:(.5+j())*span,done:false};},
    yAway(lo,hi,gap){gap=Math.max(gap,120);for(let i=0;i<10;i++){const y=this.rnd(lo,hi);if(Math.abs(y-P.y)>=gap)return y;}return P.y<(lo+hi)/2?hi:lo;},
    pickup(t,x,y,k){const p={t,x,y,vx:this.rnd(-40,20),vy:this.rnd(-60,60),bob:this.rnd(0,7)};if(k){p.k=k;p.vx=-30;p.vy=0;}G.pk.push(p);},
    shards(x,y,n){for(let i=0;i<n;i++)this.pickup('shard',x+this.rnd(-14,14),y+this.rnd(-14,14));},
    /* a random pickup that is useful right now (hull only when hurt, a weapon level only when one can still be gained) */
    loot(x,y,rich){const r=gx(0,1),hurt=P.hp<P.max,up=(()=>{try{return WP.canGain();}catch(e){return false;}})();
      if(rich||r<.12){const q=gx(0,1);if(q<.3&&hurt)this.pickup('hp',x,y);else if(q<.55&&P.emp<3)this.pickup('emp',x,y);else if(q<.75&&up)this.pickup('up',x,y);else{try{this.pickup('pw',x,y,PW.pick());}catch(e){this.shards(x,y,5);}}if(rich)this.shards(x,y+12,4);return;}
      if(r<.2&&hurt){this.pickup('hp',x,y);return;}
      if(r<.28&&P.emp<3){this.pickup('emp',x,y);return;}
      this.shards(x,y,2+(gx(0,1)<.4?1:0));},
    flash(x,y,c,r){if(this.fx.length<14)this.fx.push({x,y,r:r||30,c:c||'#fff',l:.35,m:.35});},
    /* ---- bullets: every shot passes through (nothing blocks); one hit per shot per object ---- */
    idle(){return STILL.t>(HARD?2:3);},                                     // anti-idle (h.js): a ship that stands still for 3 s earns nothing from the flavour
    hits(o,rad){let n=0;if(this.idle())return 0;for(const b of G.pb){if(b.dead)continue;const rr=rad+4+(b.rad||0);if((b.x-o.x)*(b.x-o.x)+(b.y-o.y)*(b.y-o.y)>=rr*rr)continue;
        const l=b._fl||(b._fl=[]);if(l.indexOf(o.id)>=0)continue;l.push(o.id);n++;if(Math.random()<.3)burst(b.x,b.y,'#ffffff',2,120,.2);}
      return n;},
    /* ---- captives ---- */
    spawnCap(){const hp=this.easy()?6:8,y=this.yAway(90,H-140,110),c={id:++this.id,x:W+46,y,by:y,r:28,hp,max:hp,t:0,vx:-52,flash:0};this.cap.push(c);this.s.tot++;
      if(!(G.hint&&G.hint.t>0))hintShow(say('SHOOT THE CAGE: FREE THE DATA SPRITE'),3);},
    free(c){this.s.resc++;this.S.resc++;this.store();burst(c.x,c.y,'#7df9ff',26,280,.7);this.flash(c.x,c.y,'#7df9ff',54);floater(c.x,c.y-34,'FREED','#7df9ff');AU.sfx('up');NR.emit('rescue',{n:ST.n});
      let wing=false;
      try{const s=PW.st(),busy=s.act.some(a=>PWK[a.k]&&(PWK[a.k].pw2||a.k==='drum'));
        if(PWK.wing&&!busy&&!PW.on('wing')&&PW.give('wing')){const a=s.act.find(q=>q.k==='wing');if(a){a.d=8;a.s=PW.cur();}wing=true;floater(P.x,P.y-60,'WINGMATE · 2 BARS','#ffd23d');}}catch(e){}
      if(!wing){G.score+=1000;floater(c.x,c.y-54,'+1000','#ffd23d');this.loot(c.x,c.y,true);}},
    /* ---- breakables ---- */
    THEME:[['sign','lamp'],['lamp','crate'],['billboard','sign'],['crate','billboard']],
    spawnBrk(kind,o){const k=kind||this.THEME[G.di%4][Math.random()<.5?0:1],R={sign:24,lamp:18,billboard:32,crate:22,chest:24}[k],HP={sign:2,lamp:1,billboard:3,crate:2,chest:2}[k];
      const b=Object.assign({id:++this.id,k,x:W+50,y:this.yAway(70,H-120,100),r:R,hp:HP,t:0,vx:-70,flash:0,decoy:k!=='chest'&&Math.random()<.2},o||{});b.by=b.y;this.brk.push(b);return b;},
    popBrk(b){this.S.brk++;this.s&&this.s.brk++;
      if(b.decoy){burst(b.x,b.y,'#ffb020',14,200,.4);this.flash(b.x,b.y,'#ffb020',44);floater(b.x,b.y-22,'POP','#ffb020');AU.sfx('hit');return;}
      burst(b.x,b.y,b.k==='lamp'?'#ffe9a0':'#19e3ff',16,240,.5);this.flash(b.x,b.y,'#fff',40);AU.sfx('pick');
      if(b.k==='chest')this.loot(b.x,b.y,true);else this.loot(b.x,b.y,false);},
    /* ---- secret ---- */
    spawnSec(kind){const y=this.yAway(100,H-150,150);
      this.sec=kind==='spot'?{id:++this.id,kind,x:W+70,y,r:36,t:0,vx:-60}:{id:++this.id,kind,x:W+60,y,r:26,hp:3,t:0,vx:-62,flash:0,by:y};},
    found(x,y){if(!this.s||this.s.sec)return;this.s.sec=true;this.S.sec++;if(this.S.found.indexOf(ST.n)<0)this.S.found.push(ST.n);this.store();this.sec=null;
      banner('SECRET FOUND','medal · +2500',false,2.4);burst(x,y,'#ffd23d',30,300,.8);this.flash(x,y,'#ffd23d',70);AU.sfx('up');G.flash=Math.max(G.flash,.12*FX());
      this.itm.push({x,y,vx:-40,vy:0,r:16,t:0,pts:2500});NR.emit('secret',{n:ST.n});},
    /* ---- set pieces ---- */
    startSet(){if(this.set)return;if(!rotMode&&(G.di+ST.n)%2===1)this.mkTrain();else this.mkBill();},
    mkTrain(){const gy=UIK.groundY(),e=this.easy();
      this.set={k:'train',id:++this.id,ph:'warn',t:0,x:W+30,L:560,gy,v:e?125:160,wp:{hp:e?9:13,max:e?9:13,off:80,r:24,dead:false,flash:0},fire:0,hz:0};
      floater(W-90,gy-40,'CONVOY','#ff6a7a');if(!(G.hint&&G.hint.t>0))hintShow(say('SHOOT THE GLOWING ROOF HATCH'),3);},
    mkBill(){const e=this.easy(),n=e?2:3,lanes=[];let x0=clamp(P.x+this.rnd(-70,70),70,W-70);lanes.push(x0);
      for(let i=0;i<30&&lanes.length<n;i++){const x=this.rnd(80,W-80);if(lanes.every(l=>Math.abs(l-x)>120))lanes.push(x);}
      this.set={k:'bill',id:++this.id,ph:'warn',t:0,need:e?1.2:.9,lanes:lanes.map(x=>({x,hit:false,y:-60})),fall:0};
      if(!(G.hint&&G.hint.t>0))hintShow(say('DEBRIS: LEAVE THE RED LANES'),3);},
    endSet(chest){const s=this.set;this.set=null;if(!s||!chest)return;this.spawnBrk('chest',{x:chest.x,y:chest.y,by:chest.y,vx:-70,decoy:false});},
    /* ---- one frame ---- */
    tick(dt){if(!RET.flavor)return;
      if(!this.live()){if((ST.on&&ST.over||G.dead)&&(this.cap.length||this.brk.length||this.set||this.sec||this.itm.length))this.cap=[],this.brk=[],this.itm=[],this.sec=null,this.set=null;return;}
      if(!this.plan)this.mkPlan();
      if(this.calm()){if(this.cap.length||this.set||this.sec){this.cap=[];this.set=null;this.sec=null;}}
      const sdt=dt*(G.slow||1);
      for(const f of this.fx)f.l-=dt;this.fx=this.fx.filter(f=>f.l>0);
      for(const c of this.cap){c.t+=sdt;c.x+=c.vx*sdt;c.y=c.by+Math.sin(c.t*2.1)*14;c.flash=Math.max(0,c.flash-dt);
        const h=this.hits(c,c.r);if(h){c.hp-=h;c.flash=.08;AU.sfx('hit');if(c.hp<=0){c.dead=1;this.free(c);}}
        if(c.x<-70)c.dead=1;}
      this.cap=this.cap.filter(c=>!c.dead);
      for(const b of this.brk){b.t+=sdt;b.x+=b.vx*sdt;b.y=b.by+Math.sin(b.t*1.6+b.id)*5;b.flash=Math.max(0,b.flash-dt);
        const h=this.hits(b,b.r);if(h){b.hp-=h;b.flash=.08;if(b.hp<=0){b.dead=1;this.popBrk(b);}else AU.sfx('hit');}
        if(b.x<-80)b.dead=1;}
      this.brk=this.brk.filter(b=>!b.dead);
      const q=this.sec;if(q){q.t+=sdt;q.x+=q.vx*sdt;
        if(q.kind==='spot'){if(!this.idle()&&Math.hypot(P.x-q.x,P.y-q.y)<q.r+8)this.found(q.x,q.y);}
        else{q.y=q.by+Math.sin(q.t*1.6)*5;q.flash=Math.max(0,q.flash-dt);const h=this.hits(q,q.r);if(h){q.hp-=h;q.flash=.08;AU.sfx('hit');if(q.hp<=0)this.found(q.x,q.y);}}
        if(q&&q.x<-80)this.sec=null;}
      for(const m of this.itm){m.t+=sdt;m.x+=m.vx*sdt;m.y+=Math.sin(m.t*3)*.4;
        if(!G.dead&&!this.idle()&&Math.hypot(P.x-m.x,P.y-m.y)<m.r+14){m.dead=1;G.score+=m.pts;floater(m.x,m.y-24,'+'+m.pts,'#ffd23d');burst(m.x,m.y,'#ffd23d',16,220,.5);AU.sfx('pick');}
        if(m.x<-40)m.dead=1;}
      this.itm=this.itm.filter(m=>!m.dead&&m.x>-40);
      if(this.set)this.tickSet(dt,sdt);
      /* speed-clear bookkeeping: when the kill / score goal is first met */
      const g=ST.def&&ST.def.goal;if(g&&this.s.goalBar<0&&((g.k==='kill'&&G.kills>=ST.kv)||(g.k==='score'&&G.score>=ST.sv)))this.s.goalBar=G.dbar;},
    tickSet(dt,sdt){const s=this.set;s.t+=sdt;
      if(s.k==='train'){
        if(s.ph==='warn'){if(s.t>=1.1)s.ph='run';return;}
        s.x-=s.v*sdt;const w=s.wp;w.flash=Math.max(0,w.flash-dt);
        const wx=s.x+w.off,wy=s.gy-62;
        if(!w.dead){const h=this.hits({id:s.id,x:wx,y:wy},w.r);if(h){w.hp-=h;w.flash=.08;AU.sfx('hit');if(w.hp<=0){w.dead=true;burst(wx,wy,'#ff7a3d',34,320,.8);this.flash(wx,wy,'#ffb020',80);shake(8);AU.sfx('boom');G.score+=1500;floater(wx,wy-30,'+1500','#ffd23d');this.spawnBrk('chest',{x:wx,y:wy-8,by:wy-8,vx:-110,decoy:false});}}}
        if(!G.dead&&P.x>s.x-10&&P.x<s.x+s.L+10&&P.y>s.gy-52&&P.y<s.gy+18)hurt();
        if(s.x+s.L<-20)this.set=null;}
      else{
        if(s.ph==='warn'){if(s.t>=s.need&&s.beat){s.ph='fall';s.fall=0;AU.sfx('warn');}return;}
        if(s.ph==='fall'){s.fall+=dt;const k=Math.min(1,s.fall/.42);
          for(const l of s.lanes){l.y=-60+(H+120)*k;if(!l.hit&&!G.dead&&Math.abs(P.x-l.x)<34&&Math.abs(P.y-l.y)<46){l.hit=true;hurt();}}
          if(k>=1){s.ph='done';s.t=0;shake(7);for(const l of s.lanes){burst(l.x,H-60,'#ff6a7a',16,260,.6);}}return;}
        if(s.ph==='done'&&s.t>.8){const l=s.lanes[s.lanes.length-1];this.set=null;this.spawnBrk('chest',{x:clamp(l.x,120,W-120),y:(rotMode?H-110:UIK.groundY()-22),by:(rotMode?H-110:UIK.groundY()-22),vx:-70,decoy:false});}}},
    beat(){const s=this.set;if(!s||!this.live())return;
      if(s.k==='bill'&&s.ph==='warn')s.beat=true;
      if(s.k==='train'&&s.ph==='run'&&!s.wp.dead&&G.bc%(this.easy()?4:2)===0){const gy=s.gy,xs=[s.x+s.L*.38,s.x+s.L*.74];
        const tx=xs[(G.bc>>1)%2],e={x:tx,y:gy-58,type:'drone'};
        if(tx>P.x+60&&tx<W-30&&tx>40&&Math.hypot(tx-P.x,e.y-P.y)>minShot(150)){eb.src=e;eb(tx,e.y,aim(e),150,'#ff9a3c');eb.src=null;}}},
    bar(){if(!this.live()||!this.plan||this.calm())return;this.inBar=true;try{this.barWork();}finally{this.inBar=false;}},
    barWork(){const p=this.plan,db=G.dbar;
      for(const c of p.caps)if(!c.done&&db>=c.bar&&!(ST.n<=2&&G.t<60)){c.done=true;if(this.cap.length<1)this.spawnCap();}
      if(p.sec&&!p.sec.done&&db>=p.sec.bar&&!this.sec){p.sec.done=true;this.spawnSec(p.sec.kind);}
      if(p.set&&!p.set.done&&db>=p.set.bar&&!this.set){p.set.done=true;this.startSet();}
      if(G.bc-this.lastBrk>=12&&this.brk.filter(b=>b.k!=='chest').length<3&&Math.random()<.55&&G.t>6){this.lastBrk=G.bc;this.spawnBrk();}},
    /* ---- clear screen ---- */
    clear(){if(!this.s)return;const s=this.s,g=ST.def&&ST.def.goal||{},list=[];
      if(window.LEAK&&RET.leak)list.push(['noleak',LEAK.total===0]);
      list.push(['nohit',ST.hits===0]);
      if(s.tot>0)list.push(['rescued',s.resc===s.tot]);
      if(s.secPlanned)list.push(['secret',!!s.sec]);
      if(g.k==='boss'||g.k==='mini'){if(s.bossBar>=0)list.push(['speed',G.dbar-s.bossBar<=.6*(g.k==='mini'?MINI_BARS:BOSS_BARS)]);}
      else if(g.k==='kill'||g.k==='score')list.push(['speed',s.goalBar>=0&&ST.len-s.goalBar>=8]);
      let assist=false;try{assist=RET.assistRun();}catch(e){}
      const ids=list.filter(m=>m[1]).map(m=>m[0]);
      this.res={n:ST.n,list,resc:s.resc,tot:s.tot,assist,paid:false,bonus:0,first:[]};
      for(const id of ids){NR.emit('medal',{id,n:ST.n});this.S.med[id]=(this.S.med[id]|0)+1;}
      this.cap=[];this.brk=[];this.set=null;this.sec=null;this.itm=[];},
    pay(){const r=this.res;if(!r||r.paid)return;r.paid=true;if(r.assist)return;
      let b=Math.min(NEON.rescCap,NEON.resc*r.resc);
      for(const [id,ok] of r.list)if(ok){const k=r.n+'_'+id;if(!this.S.first[k]){this.S.first[k]=1;b+=NEON.medal;r.first.push(id);}}
      r.bonus=b;if(b>0){try{GA.bank+=b;gsave();}catch(e){}}this.store();},
    rowHTML(){const r=this.res;if(!RET.flavor||!r||r.n!==ST.n||!(r.tot||r.list.length))return '';
      const art=id=>window.ART&&ART.rd&&ART.rd.has&&ART.rd.has('fl-medal-'+id+'.webp');
      let h='';if(r.tot)h+=`<div class="sr${r.resc?' ok':''} flr"><span class="sg">♥</span> RESCUED ${r.resc}/${r.tot}${r.resc&&!r.assist?' · +'+Math.min(NEON.rescCap,NEON.resc*r.resc)+' Neon':''}</div>`;
      h+='<div class="flm">'+r.list.map(([id,ok])=>{const m=MEDALS.find(q=>q[0]===id);
        return `<span class="flb${ok?' on':''}" style="--c:${m[3]}" data-id="${id}"><i>${art(id)?'<img alt="" src="'+ART.base+'fl-medal-'+id+'.webp">':m[2]}</i>${m[1]}</span>`;}).join('')+'</div>';
      if(r.bonus>0)h+=`<div class="sr ok flr"><span class="sg">◆</span> +${r.bonus} Neon · medals</div>`;
      return h;},
    /* ---- drawing (code-drawn placeholders; the painted files fl-*.webp replace them) ---- */
    back(t){if(!RET.flavor||!running||!G||!G.live)return;
      for(const b of this.brk)this.drawBrk(b,t);
      if(this.sec)this.drawSec(this.sec,t);
      for(const c of this.cap)this.drawCap(c,t);
      for(const m of this.itm)this.drawMedal(m,t);
      if(this.set&&this.set.k==='train')this.drawTrain(this.set,t);},
    front(t){if(!RET.flavor||!running||!G||!G.live)return;
      ctx.save();
      if(this.set&&this.set.k==='bill')this.drawBill(this.set,t);
      for(const f of this.fx){const k=1-f.l/f.m;ctx.globalCompositeOperation='lighter';G_(f.x,f.y,f.r*(1+k),f.c,(1-k)*.8);}
      ctx.restore();},
    drawCap(c,t){ctx.save();ctx.translate(c.x,c.y);
      try{if(ART.dflash('fl-captive',c.r*3.2,0,0,0,c.flash>0)){ctx.restore();return;}}catch(e){}
      ctx.globalCompositeOperation='lighter';G_(0,0,c.r*2.3,'#7df9ff',.3+.12*Math.sin(t*5));ctx.globalCompositeOperation='source-over';
      const fl=c.flash>0;ctx.lineWidth=2;ctx.fillStyle='#0a0612';ctx.strokeStyle=fl?'#fff':'#ffd23d';   // the little courier drone
      ctx.beginPath();ctx.moveTo(-13,0);ctx.lineTo(0,-9);ctx.lineTo(13,0);ctx.lineTo(0,9);ctx.closePath();ctx.fill();ctx.stroke();
      ctx.fillStyle=fl?'#fff':'#ff3050';ctx.fillRect(-2,-2,4,4);
      ctx.strokeStyle=fl?'#fff':'#7df9ff';ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(0,0,c.r,0,7);ctx.stroke();        // the cage
      ctx.lineWidth=1.6;for(let i=-2;i<=2;i++){const x=i*c.r*.4,h=Math.sqrt(Math.max(0,c.r*c.r-x*x));ctx.beginPath();ctx.moveTo(x,-h);ctx.lineTo(x,h);ctx.stroke();}
      hpBar(-14,-c.r-9,28,c.hp/c.max);ctx.restore();},
    drawBrk(b,t){ctx.save();ctx.translate(b.x,b.y);ctx.globalAlpha=.88;const D=DISTRICTS[G.di],fl=b.flash>0,col=fl?'#fff':b.k==='lamp'?'#ffe9a0':b.k==='crate'||b.k==='chest'?'#ffb020':D.a,r=b.r;
      try{if(ART.dflash('fl-'+b.k,r*3,0,0,0,fl)){ctx.restore();return;}}catch(e){}
      ctx.globalCompositeOperation='lighter';G_(0,0,r*2,col,.22+.1*Math.sin(t*3+b.id));ctx.globalCompositeOperation='source-over';
      ctx.lineWidth=2;ctx.strokeStyle=col;ctx.fillStyle='#0a0612';
      if(b.k==='sign'){ctx.fillRect(-r,-r*.55,r*2,r*1.1);ctx.strokeRect(-r,-r*.55,r*2,r*1.1);ctx.beginPath();ctx.moveTo(-r*.6,0);ctx.lineTo(r*.6,0);ctx.stroke();}
      else if(b.k==='lamp'){ctx.beginPath();ctx.moveTo(0,r*1.3);ctx.lineTo(0,-r*.5);ctx.stroke();ctx.beginPath();ctx.arc(0,-r*.8,r*.5,0,7);ctx.fill();ctx.stroke();}
      else if(b.k==='billboard'){ctx.fillRect(-r,-r*.6,r*2,r*1.2);ctx.strokeRect(-r,-r*.6,r*2,r*1.2);ctx.beginPath();ctx.moveTo(-r*.5,r*.6);ctx.lineTo(-r*.5,r*1.3);ctx.moveTo(r*.5,r*.6);ctx.lineTo(r*.5,r*1.3);ctx.stroke();ctx.fillStyle=col;ctx.fillRect(-r*.7,-r*.35,r*1.4,r*.2);}
      else{ctx.fillRect(-r,-r,r*2,r*2);ctx.strokeRect(-r,-r,r*2,r*2);ctx.beginPath();ctx.moveTo(-r,-r);ctx.lineTo(r,r);ctx.moveTo(r,-r);ctx.lineTo(-r,r);ctx.stroke();if(b.k==='chest'){ctx.fillStyle='#ffd23d';ctx.fillRect(-4,-4,8,8);}}
      ctx.restore();},
    drawSec(q,t){ctx.save();ctx.translate(q.x,q.y);
      if(q.kind==='spot'){ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.22+.12*Math.sin(t*2.4);ctx.strokeStyle='#ffd23d';ctx.lineWidth=2;ctx.setLineDash([5,7]);ctx.beginPath();ctx.arc(0,0,q.r,0,7);ctx.stroke();ctx.setLineDash([]);
        G_(0,0,q.r*1.3,'#ffd23d',.12);ctx.globalAlpha=.5+.4*Math.sin(t*5);ctx.fillStyle='#ffd23d';ctx.fillRect(-2,-2,4,4);}
      else{const fl=q.flash>0,on=Math.sin(t*9)>-.4||fl;ctx.globalAlpha=on?.95:.35;const r=q.r,col=fl?'#fff':'#ff2d95';ctx.globalCompositeOperation='lighter';G_(0,0,r*2,col,.2);ctx.globalCompositeOperation='source-over';
        ctx.fillStyle='#0a0612';ctx.strokeStyle=col;ctx.lineWidth=2;ctx.fillRect(-r,-r*.55,r*2,r*1.1);ctx.strokeRect(-r,-r*.55,r*2,r*1.1);ctx.beginPath();ctx.moveTo(-r*.5,-r*.2);ctx.lineTo(-r*.1,r*.2);ctx.lineTo(r*.2,-r*.2);ctx.lineTo(r*.5,r*.2);ctx.stroke();}
      ctx.restore();},
    drawMedal(m,t){ctx.save();ctx.translate(m.x,m.y);ctx.globalCompositeOperation='lighter';G_(0,0,m.r*2.4,'#ffd23d',.4+.2*Math.sin(t*6));ctx.globalCompositeOperation='source-over';
      ctx.fillStyle='#ffd23d';ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,m.r*.7,0,7);ctx.fill();ctx.stroke();ctx.fillStyle='#0a0612';ctx.fillRect(-3,-5,6,10);ctx.restore();},
    drawTrain(s,t){ctx.save();ctx.translate(s.x,s.gy);const D=DISTRICTS[G.di],L=s.L,warn=s.ph==='warn';
      if(warn){ctx.globalAlpha=.4+.4*Math.sin(t*14);ctx.fillStyle='#ff3050';ctx.fillRect(W-s.x-60,-6,60,6);ctx.restore();return;}
      ctx.lineWidth=2;ctx.fillStyle='#14091f';ctx.strokeStyle=D.a;
      for(let i=0;i<4;i++){const x=i*(L/4)+3,w=L/4-8;ctx.beginPath();ctx.rect(x,-46,w,42);ctx.fill();ctx.stroke();ctx.fillStyle=D.a+'66';for(let j=0;j<4;j++)ctx.fillRect(x+10+j*(w-20)/3-3,-14,6,6);ctx.fillStyle='#14091f';}
      ctx.fillStyle='#0a0612';for(let i=0;i<9;i++){ctx.beginPath();ctx.arc(14+i*(L-28)/8,-2,6,0,7);ctx.fill();ctx.stroke();}
      for(const f of[.38,.74]){ctx.fillStyle='#14091f';ctx.beginPath();ctx.rect(L*f-12,-62,24,16);ctx.fill();ctx.stroke();ctx.beginPath();ctx.moveTo(L*f-12,-56);ctx.lineTo(L*f-34,-56);ctx.stroke();}   // two gun turrets, barrels left
      const w=s.wp,wx=w.off,wy=-62;
      if(!w.dead){const p=Math.pow(1-PHF,2);ctx.globalCompositeOperation='lighter';G_(wx,wy,w.r*(1.6+.5*p),'#ffd23d',.45+.4*p);ctx.globalCompositeOperation='source-over';
        ctx.fillStyle=w.flash>0?'#fff':'#ffb020';ctx.beginPath();ctx.arc(wx,wy,12,0,7);ctx.fill();ctx.strokeStyle='#fff';ctx.stroke();hpBar(wx-14,wy-24,28,w.hp/w.max);}
      else{ctx.fillStyle='#ff6a3a55';ctx.beginPath();ctx.arc(wx,wy,14,0,7);ctx.fill();}
      ctx.restore();},
    drawBill(s,t){const e=s.ph==='warn'?(Math.sin(t*16)>0?1:.55):1,top=22;
      if(s.ph==='warn'||s.ph==='fall'){for(const l of s.lanes){ctx.globalAlpha=(s.ph==='warn'?.18+.14*e:.12);ctx.fillStyle='#ff3050';ctx.fillRect(l.x-34,0,68,H);
        ctx.globalAlpha=.9*e;ctx.strokeStyle='#ff6a7a';ctx.lineWidth=2;ctx.setLineDash([10,8]);ctx.strokeRect(l.x-34,2,68,H-4);ctx.setLineDash([]);
        ctx.globalAlpha=1;ctx.fillStyle='#ff6a7a';ctx.beginPath();ctx.moveTo(l.x-12,top);ctx.lineTo(l.x+12,top);ctx.lineTo(l.x,top+16);ctx.closePath();ctx.fill();
        if(s.ph==='fall'){ctx.fillStyle='#14091f';ctx.strokeStyle='#ffb020';ctx.lineWidth=3;ctx.beginPath();ctx.rect(l.x-28,l.y-22,56,44);ctx.fill();ctx.stroke();ctx.beginPath();ctx.moveTo(l.x-28,l.y-22);ctx.lineTo(l.x+28,l.y+22);ctx.stroke();}}}
      ctx.globalAlpha=1;}};
  return F;
})();
if(RET.sioKeys&&RET.sioKeys.push)RET.sioKeys.push('mnr_flavor');
{const st=document.createElement('style');st.textContent=`
.flm{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin:6px 0}
.flb{display:inline-flex;align-items:center;gap:6px;font:600 14px/1.1 var(--mono);padding:4px 10px 4px 4px;border:1px solid #ffffff33;border-radius:99px;color:var(--dim,#9a93b8);opacity:.6}
.flb.on{opacity:1;color:#fff;border-color:var(--c)}.flb i{flex:none;width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-style:normal;font-size:14px;line-height:1;border:2px solid var(--c);color:var(--c);overflow:hidden}
.flb.on i{background:var(--c);color:#0a0612}.flb i img{width:100%;height:100%;object-fit:cover}
#stres .sr.flr{font-size:max(14px,clamp(13px,min(2vw,3.4vh),19px))}
`;document.head.appendChild(st);}
/* ---- hooks: all behind RET.flavor ---- */
NR.on('runStart',d=>{FL.reset();});
NR.on('runEnd',d=>{if(!RET.flavor)return;if(d&&d.cleared&&d.story)FL.pay();FL.cap=[];FL.brk=[];FL.set=null;FL.sec=null;FL.itm=[];});
NR.on('tick',dt=>{try{FL.tick(dt);}catch(e){}});
NR.on('bar',()=>{try{FL.bar();}catch(e){}});
NR.on('beat',()=>{try{FL.beat();}catch(e){}});
NR.on('bossIn',()=>{if(FL.s)FL.s.bossBar=G.dbar;FL.cap=[];FL.set=null;FL.sec=null;});
NR.on('stageClear',()=>{if(RET.flavor&&ST.on)try{FL.clear();}catch(e){}});
{const dp=drawPickups;drawPickups=function(t){dp(t);try{FL.back(t);}catch(e){}};}
{const pd=PW.draw;PW.draw=function(t){pd.call(this,t);try{FL.front(t);}catch(e){}};}
{const rr=RET.resultRow;RET.resultRow=function(){let h=rr.apply(this,arguments);try{if(RET.flavor&&ST.on)h+=FL.rowHTML();}catch(e){}return h;};}
/* ---- the Stats sheet (parts/stats.js) gets a SHOOTER FLAVOUR block when it exists; read defensively ---- */
{const put=sh=>{try{if(!RET.flavor||!RET.stats||!sh||sh.querySelector('#flStats'))return;const S=FL.S,n=Object.values(S.med).reduce((a,b)=>a+(b|0),0),cell=(l,v)=>'<div class="sc"><small>'+l+'</small><b>'+v+'</b></div>';
    const h=[...sh.querySelectorAll('h3')].find(x=>/^CREDITS/.test(x.textContent));if(!h)return;
    const d=document.createElement('div');d.id='flStats';d.innerHTML='<h3>SHOOTER FLAVOUR</h3><div class="stGrid">'+cell('Sprites rescued',S.resc)+cell('Secrets found',S.sec)+cell('Medals earned',n)+cell('Signs and crates',S.brk)+'</div>'
      +(S.found.length?'<div class="stCred"><p><b>Secrets</b> stages '+S.found.slice().sort((a,b)=>a-b).join(', ')+'</p></div>':'');
    h.parentNode.insertBefore(d,h);}catch(e){}};
  const watch=()=>{const sh=document.getElementById('stSheet');if(!sh)return false;put(sh);new MutationObserver(()=>put(sh)).observe(sh,{childList:true});return true;};
  if(!watch()){const o=new MutationObserver(()=>{if(watch())o.disconnect();});o.observe(document.body,{childList:true});}}
