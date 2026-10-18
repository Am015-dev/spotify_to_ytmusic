/* ---------- stagescripts.js: every story stage plays its own script (VARIETY A, owner 18 Oct 2026). Flag RET.vary (formations.js); ?vary=0 = the old shuffled pools.
   THE SCRIPT TABLE (edit freely; vary-test.js checks it): stage number -> {sig, mut, m}
     m    the moments in order, spread evenly over the stage (a boss / mini-boss stage: over the build-up before it). One moment is a few bars of one formation:
            'snake'        a formation from the library in formations.js            'snake~r'   the same formation remixed (arrowheads, faster, mirrored)
            'pincer|gates' two formations taking turns (the escalation)             '~bounce'   a breather (fewer enemies, light formation)
            'stairs+g'     ground units may roll in during this moment (leak.js)    '*'         the stage's SIGNATURE set piece (below)
     sig  [name, formation A, formation B, twist]: the set piece no other stage has; twist = mirror | elite | fast | echo
     mut  the stage's rule change (VMUT below), every second stage; '' = none. It is on the intro card and in the HUD and pauses while a boss is out.
   The director keeps its own timing, budget, caps and READY gaps (dir.js, zoo.js, leak.js): it decides WHEN and HOW MUCH, the script decides WHAT.
   On Hard / Very hard / Legend the old random zoo and ground waves still come between the scripted pieces, and 25 / 35 / 40% of the calls use the stage's old
   wave pool, so the hard tiers keep their pressure (scale-test, scale2-test, scale3-test). ---------- */
const VSCRIPT={
 1:{sig:['COURIER LIGHTS','wave','zigzag','mirror'],mut:'',m:['line','snake','zigzag','helix','gates','snake|wave','wave','crossX','echo','~stutter','*','bounce']},
 2:{sig:['PATROL GRID','gates','snake','fast'],mut:'offbeat',m:['vee','fan','turrets','chargers','echo','fan|wave','wave','zigzag','stutter','~hold','*','helix']},
 3:{sig:['WINDOW DISPLAY','stutter','bounce','echo'],mut:'',m:['hold','pincer','stampede+g','stairs','mirror+g','pincer|gates','gates','crossX+g','snake','~bounce','*','line']},
 4:{sig:['GUARD CHANGE','cross','mirror','mirror'],mut:'mirror',m:['chargers','shieldwall','sandwich+g','bloom','cross+g','orbit','shieldwall|swoop','swoop+g','gunship','turrets','~wave','*','fan']},
 5:{sig:['VAULT ALARM','bloom','hold','elite'],mut:'',m:['vee','shieldwall','spiral+g','box','scissors+g','bait','sweep','stampede+g','*','~stutter']},
 6:{sig:['CONVOY AMBUSH','orbit','pincer','mirror'],mut:'wind',m:['gates','kamikaze','burst+g','braid','arrow+g','kamikaze|tide','tide','stairs+g','pincer','~hold','*','mirror']},
 7:{sig:['GLASS ELEVATOR','fan','bloom','echo'],mut:'',m:['cross','kamikaze','fork+g','meteors','comet+g','kamikaze|bloom','bloom','gunship+g','sandwich','~line','*','orbit']},
 8:{sig:['SIREN CHASE','meteors','comet','mirror'],mut:'quickdash',m:['vee','shadow','geyser+g','bait','swoop+g','scissors','box','sweep+g','spiral','*','~bounce']},
 9:{sig:['RIVER LANTERNS','burst','echo','fast'],mut:'',m:['crossX','splitterv','river','loop','slalom','splitterv|noose','noose','gates','stairs','~hold','*','stampede']},
 10:{sig:['BRIDGE STRAIN','stampede','box','mirror'],mut:'curve',m:['zigzag','splitterv','snake~r','orbit','pincer','splitterv|gunship','gunship','comet','chargers','~bounce','*','snake']},
 11:{sig:['MARKET BELLS','arrow','sweep','echo'],mut:'',m:['stutter','bomberrun','spiral+g','sweep','burst+g','braid','bomberrun|tide','tide+g','mirror','box','~line','*','meteors']},
 12:{sig:['BOW WAVE','spiral','bounce','mirror'],mut:'nopower',m:['vee','bomberrun','pincer~r+g','scissors','cross+g','bomberrun|bloom','bloom','fork+g','bait','~bounce','*','sandwich']},
 13:{sig:['OLD STONES','bounce','splitterv','mirror'],mut:'',m:['echo','shadow','fan+g','helix','geyser+g','shieldwall','swoop','kamikaze+g','*','~wave']},
 14:{sig:['FLEET SIGNAL','turrets','noose','elite'],mut:'laser',m:['hold','sniperlanes','snake~r+g','turrets','arrow+g','sniperlanes|spiral','spiral','river+g','crossX','~line','*','pincer']},
 15:{sig:['CRANE SWING','fan','arrow','fast'],mut:'',m:['snake','sniperlanes','stampede+g','mirror','sandwich+g','sniperlanes|stairs','stairs','cross+g','box','~bounce','*','comet']},
 16:{sig:['UNDERTOW','stairs','river','fast'],mut:'drop',m:['wave','healerpack','pincer~r+g','loop','shadow+g','scissors','bloom','vee+g','*','~line']},
 17:{sig:['RED LIGHTS','stutter','fork','elite'],mut:'',m:['crossX','wall','curtain','sweep','river','wall|slalom','slalom','noose','tide','~bounce','*','bomberrun']},
 18:{sig:['SHUNTING YARD','sniperlanes','meteors','elite'],mut:'split',m:['snake','river~r','helix','pincer','zigzag','river~r|swoop','swoop','comet','braid','~wave','*','gunship']},
 19:{sig:['FIREWALL BREACH','carrier','turrets','fast'],mut:'',m:['line','carrier','sniperlanes+g','stairs','spiral+g','carrier|bloom','bloom','echo+g','burst','~hold','*','mirror']},
 20:{sig:['SIGNAL FAILURE','sandwich','stutter','echo'],mut:'shrink',m:['stutter','carrier','loop~r+g','meteors','stampede+g','orbit','carrier|sandwich','sandwich+g','arrow','shieldwall','~wave','*','splitterv']},
 21:{sig:['BARRIER DROP','fan','stairs','echo'],mut:'',m:['chargers','bait','shadow+g','scissors','turrets+g','fork','geyser','gates+g','*','~bounce']},
 22:{sig:['LAST CORDON','arrow','slalom','echo'],mut:'beatgap',m:['vee','minefield','river~r+g','box','fan+g','minefield|kamikaze','kamikaze','cross+g','loop','~hold','*','noose']},
 23:{sig:['CRATE STACK','minefield','geyser','mirror'],mut:'',m:['snake','minefield','healerpack+g','sandwich','echo+g','minefield|mirror','mirror','sweep+g','burst','~wave','*','orbit']},
 24:{sig:['ICE CORE','wave','minefield','fast'],mut:'blackout',m:['zigzag','loop~r','spiral+g','pincer','crossX+g','tide','bloom','meteors+g','*','~stutter']},
 25:{sig:['PRESS PASS','slalom','snake','elite'],mut:'',m:['helix','nest','lattice','pulse','splitterv','nest|gates','gates','shadow','noose','~bounce','*','wall']},
 26:{sig:['GRIDLOCK','fork','echo','fast'],mut:'order',m:['snake','escort','nest','wall~r','river','escort|loop','loop','orbit','gunship','~hold','*','mirror']},
 27:{sig:['HAMMER BEAT','loop','arrow','mirror'],mut:'',m:['zigzag','escort','sweep+g','bomberrun','scissors+g','escort|curtain','curtain','pincer+g','turrets','~wave','*','crossX']},
 28:{sig:['SPOTLIGHTS','zigzag','stampede','fast'],mut:'hail',m:['echo','curtain~r','carrier+g','meteors','kamikaze+g','curtain~r|shieldwall','shieldwall','spiral+g','braid','~line','*','bloom']},
 29:{sig:['GUARD OF HONOUR','burst','lattice','mirror'],mut:'',m:['stairs','geyser','fork+g','sandwich','slalom+g','stampede','sniperlanes','minefield+g','*','~bounce']},
 30:{sig:['HOSTILE TAKEOVER','comet','minefield','fast'],mut:'minefield',m:['vee','wall~r','bait+g','arrow','fan+g','wall~r|tide','tide','comet+g','cross','~stutter','*','box']},
 31:{sig:['TOP FLOOR','bounce','nest','echo'],mut:'',m:['wave','chargers','pincer+g','shieldwall','healerpack+g','chargers|gates','gates','swoop+g','burst','~bounce','*','river']},
 32:{sig:['MARKET CRASH','burst','snake','echo'],mut:'drop',m:['helix','curtain~r','gunship+g','geyser','snake+g','sweep','spiral','shadow+g','*','~stutter']},
 33:{sig:['ROOFTOP KIOSKS','swoop','nest','echo'],mut:'',m:['stairs','testudo','lattice~r','phalanx','pillars','testudo|bait','bait','orbit','slalom','~wave','*','stampede']},
 34:{sig:['HARBOUR CHAIN','sweep','pillars','mirror'],mut:'laser',m:['vee','ambush','testudo','pulse~r','sniperlanes','ambush|pincer','pincer','noose','pulse','~bounce','*','carrier']},
 35:{sig:['HILL BEACONS','stairs','ambush','fast'],mut:'',m:['snake','ambush','lattice~r+g','cross','minefield+g','ambush|arrow','arrow','fork+g','spiral','~wave','*','mirror']},
 36:{sig:['SACRED STEPS','lattice','fork','echo'],mut:'split',m:['zigzag','pulse~r','bomberrun+g','line','shieldwall+g','pulse~r|crossX','crossX','box+g','meteors','~stutter','*','sweep']},
 37:{sig:['BRONZE SHIELDS','mirror','kamikaze','echo'],mut:'',m:['helix','snake~r','burst+g','fan','bloom+g','shadow','sandwich','gates+g','*','~wave']},
 38:{sig:['STALL ROWS','scissors','box','elite'],mut:'beatgap',m:['echo','testudo~r','wall+g','curtain','loop+g','testudo~r|lattice','lattice','splitterv+g','swoop','~hold','*','comet']},
 39:{sig:['OLIVE GROVE','sandwich','bait','fast'],mut:'',m:['chargers','ambush~r','braid+g','escort','nest+g','ambush~r|river','river','kamikaze+g','healerpack','~stutter','*','turrets']},
 40:{sig:['BRONZE DAWN','wall','loop','fast'],mut:'quickdash',m:['zigzag','testudo~r','geyser+g','tide','gunship+g','shadow','noose','scissors+g','carrier','*','~hold']},
 41:{sig:['GLASS CORRIDOR','mirror','bait','fast'],mut:'',m:['turrets','swoop','bloom','gunship','pincer','sandwich','mirror','~orbit','*','cross']},
 42:{sig:['FERRY WAKE','fork','sweep','fast'],mut:'',m:['zigzag','meteors','burst','orbit','sweep','fork','noose','~hold','*','slalom']},
 43:{sig:['RAIL RHYTHM','comet','spiral','echo'],mut:'',m:['vee','wall','comet','curtain','stampede','gunship','arrow','~hold','*','helix']},
 44:{sig:['TRADE RUSH','box','crossX','elite'],mut:'',m:['echo','bloom','turrets','scissors','wall','cross','crossX','~hold','*','zigzag']},
 45:{sig:['MARBLE ECHO','arrow','curtain','echo'],mut:'',m:['chargers','curtain','wall','stairs','orbit','swoop','lattice','~bounce','*','comet']},

};
/* ---- the rule changes. n = HUD / card name, t = one line (8 words max). Each one is dodgeable and gentler on Easy. ---- */
const VMUT={
  offbeat:{n:'OFF-BEAT',t:'Enemy shots wait half a beat'},
  mirror:{n:'MIRROR',t:'Every formation comes back mirrored'},
  wind:{n:'CROSSWIND',t:'The wind pushes your ship'},
  quickdash:{n:'QUICK DASH',t:'Your dash recharges three times faster'},
  curve:{n:'CURVED SHOTS',t:'Enemy shots bend as they fly'},
  nopower:{n:'PURE RUN',t:'No power-ups. Double score.'},
  laser:{n:'LASER CURTAIN',t:'Leave the flashing lane'},
  drop:{n:'AIR DROP',t:'Enemies drop in from above'},
  split:{n:'SPLIT SHOTS',t:'Enemy shots split in two'},
  shrink:{n:'SQUEEZE',t:'The sky closes in. Stay inside.'},
  beatgap:{n:'FOLLOW THE SONG',t:'Fly through the gap on the beat'},
  blackout:{n:'BLACKOUT',t:'A dark band sweeps the sky'},
  order:{n:'TARGET ORDER',t:'Shoot the beacons 1, 2, 3'},
  hail:{n:'HAILSTORM',t:'Slow rain from above'},
  minefield:{n:'MINEFIELD',t:'Mines drift in'}};
const VARY=window.VARY={S:VSCRIPT,M:VMUT,st:null,log:[],kinds:{},pg0:window.LEAK?LEAK.pg:.3,X:{},
  on(){return !!RET.vary;},
  active(){return !!(RET.vary&&ST.on&&this.st&&this.st.n===ST.n&&!G.lab&&!G.tut);},
  parse(x){const o={raw:x,br:x[0]==='~',sig:x==='*',g:/\+g$/.test(x)};const b=x.replace(/^~/,'').replace(/\+g$/,'');o.ids=o.sig?[]:b.split('|');return o;},
  plan(){this.st=null;const s=ST.on&&!G.lab&&!G.tut?this.S[ST.n]:null;if(!RET.vary||!s)return;
    this.st={n:ST.n,s,ms:s.m.map(x=>this.parse(x)),i:-1,inst:{},c:{},mut:s.mut&&VMUT[s.mut]?s.mut:'',card:0,sigOn:0};this.X={};
    DIR.mut=this.st.mut==='hail'?['hail']:this.st.mut==='minefield'?['mine']:[];},
  span(){return Math.max(8,ST.lead>0?ST.lead:ST.ch==='speed'?ST.tb*.55:ST.len);},   // a speed challenge usually ends early: its script is packed into the first half
  idx(){const n=this.st.ms.length,sp=this.span(),b=Math.max(0,G.dbar);if(b<sp)return clamp(Math.floor(b*n/sp),0,n-1);
    return 1+Math.floor((b-sp)*n/sp)%(n-1);},                     // a kill stage that runs past its song: the moments come round again (not the opening)
  cur(){const st=this.st;return st.cur==null?0:st.cur;},          // the moment being played: it follows the bars, but never skips one (a short build-up or a READY bar could)
  step(){const st=this.st,t=this.idx();if(st.cur==null)st.cur=0;
    if(t>st.cur&&(st.c[st.cur]|0)>=1){let nx=st.cur+1;if(t-nx>=2)nx=t-1;const sg=st.ms.findIndex(m=>m.sig);if(sg>st.cur&&sg<nx&&!(st.c[sg]>0))nx=sg;st.cur=nx;}   // at most one moment behind; the set piece is never skipped
    else if(t<st.cur&&G.dbar>=this.span())st.cur=t;return st.cur;},
  mom(){return this.st.ms[this.cur()];},
  gnd(){return !!this.mom().g;},
  hard(){return HARDS.includes(SET.diff);},                    // Hard, Very hard, Legend: the old random zoo and ground waves still come between the scripted pieces (Legend must not get easier)
  oldK(){return {hard:.25,vhard:.35,legend:.4}[SET.diff]||0;},   // ... and this share of the director's calls still uses the stage's old wave pool (its turrets and gunships)
  /* ---- the director's call: one piece of the moment's formation ---- */
  spawn(fill){const st=this.st,i=this.step(),m=st.ms[i];if(i!==st.i){st.i=i;this.enter(i,m);}
    const c=st.c[i]=(st.c[i]|0)+1;let id,key,tw='';
    if(m.sig){id=st.s.sig[1+((c-1)%2)];tw=st.s.sig[3];key='S'+id;}else{id=m.ids[(c-1)%m.ids.length];key=i+':'+id;}
    const rm=/~r$/.test(id),base=id.replace(/~r$/,'');if(!FM.L[base]){id='line';key=i+':line';}
    let I=st.inst[key];if(!I){I=st.inst[key]=FM.make(FM.L[base]?base:'line',{r:rm?1:0});if(rm)I.s.sd=1;
      if(tw==='elite')I.el=1;if(tw==='fast')I.tk=1.22;}
    if(rm||tw==='mirror'||st.mut==='mirror')I.mir=(I.k%2===1);
    const fid=m.sig?'sig:'+st.s.sig[0]:id;
    FM.piece(I);NR.emit('pattern',{id:fid});
    if(tw==='echo'&&I.k%2===0)FM.later(I,2,()=>{I.mir=!I.mir;FM.piece(I);});
    if(this.log.length<6000)this.log.push({n:st.n,b:+G.dbar.toFixed(1),t:+G.t.toFixed(1),f:fid,p:m.sig?id:'',i,br:m.br?1:0,mut:st.mut});
    if(DIR.log.spawns.length<400)DIR.log.spawns.push([+G.dbar.toFixed(1),fid]);},
  enter(i,m){if(m.sig){const nm=this.st.s.sig[0];G.note={t:4,txt:'★ '+nm};floater(W*.62,H*.2,'★ '+nm,'#ffe14d');this.st.sigOn=1;NR.emit('setPiece',{n:this.st.n,name:nm});}},
  theme(){if(!this.active())return;const m=this.mom();DIR.thName=m.br?'breath':DIR.thName==='breath'?'ranks':DIR.thName;if(window.LEAK)LEAK.pg=m.g&&!this.hard()?.55:this.pg0;},
  /* ---- the rule change ---- */
  mutOn(){return this.active()&&!!this.st.mut&&!G.boss&&!G.dead&&!ST.over&&running;},
  mk(){return SET.diff==='easy'?.65:1;},                        // Easy: every rule change is gentler
  tick(dt){if(!this.active())return;const st=this.st;
    if(st.card&&G.t>=st.card){st.card=0;const M=VMUT[st.mut];banner('RULE · '+M.n,M.t,false,2.6);}
    if(!this.mutOn())return;const id=st.mut,X=this.X,k=this.mk(),bs=fmBs();
    for(const b of G.eb){if(b.vm)continue;b.vm=1;if(b.lob)continue;
      if(id==='offbeat'){const f=((G.bp%1)+1)%1;if(f<.25||f>.92){b.hv=[b.vx,b.vy];b.vx=0;b.vy=0;b.ht=bs*.5;}}
      else if(id==='curve'){b.cw=(GX()<.5?-1:1)*.75*k;b.ct=1;}
      else if(id==='split')b.st=.7;}
    for(const b of G.eb){
      if(b.hv){b.ht-=dt;if(b.ht<=0){b.vx=b.hv[0];b.vy=b.hv[1];b.hv=null;}}
      if(b.ct>0){b.ct-=dt;const a=b.cw*dt,c=Math.cos(a),s=Math.sin(a),vx=b.vx;b.vx=vx*c-b.vy*s;b.vy=vx*s+b.vy*c;}
      if(b.st>0){b.st-=dt;if(b.st<=0&&G.eb.length<ebCap()-1&&!b.dead){const sp=Math.hypot(b.vx,b.vy)*.85,a=Math.atan2(b.vy,b.vx),d=.3*k+.1;b.dead=1;
        for(const s of[-1,1])G.eb.push(Object.assign({},b,{dead:0,vx:Math.cos(a+s*d)*sp,vy:Math.sin(a+s*d)*sp,st:0,g:false}));}}}
    if(id==='split')G.eb=G.eb.filter(b=>!b.dead);
    if(id==='wind'){const ph=Math.floor((G.dbar||0)/2)%2?1:-1;X.w=ph*42*k;P.y=clamp(P.y+X.w*dt,22,H-22);}
    if(id==='quickdash'&&P.dashCd>.36)P.dashCd=.36;
    if(id==='nopower')G.pk=G.pk.filter(p=>p.t!=='pw'&&p.t!=='up'&&p.t!=='emp');
    if(id==='shrink'){const c=((G.dbar||0)%8+8)%8,m=c<3?c/3:c<6?1:Math.max(0,1-(c-6)/2);X.m=m*72*k;P.y=clamp(P.y,X.m+20,H-X.m-20);}
    if(id==='laser'){for(const L of X.lz||[]){if(G.bc>=L.on&&G.bc<L.on+1&&!L.hit&&Math.abs(P.y-L.y)<10){L.hit=1;hurt();}}X.lz=(X.lz||[]).filter(L=>G.bc<L.on+1);}
    if(id==='beatgap'){const w=X.bw;if(w){w.x-=145*FM.tk()*dt;w.gc+=(w.tg-w.gc)*Math.min(1,dt*10);
        if(!w.hit&&Math.abs(P.x-w.x)<9&&Math.abs(P.y-w.gc)>w.g/2-6){w.hit=1;hurt();}if(w.x<-20)X.bw=null;}}
    if(id==='order'){for(const o of X.bc||[]){o.x-=38*dt;for(const b of G.pb){if(b.dead||o.hit)continue;if((b.x-o.x)**2+(b.y-o.y)**2<22*22){b.dead=1;
        if(o.n===X.nx){o.hit=1;X.nx++;floater(o.x,o.y-20,String(o.n),'#ffe14d');if(X.nx>3){const pts=1500+250*ST.n;G.score+=pts;floater(W*.5,H*.3,'ORDER BONUS +'+pts,'#ffe14d');AU.sfx('up');X.bc=[];}}
        else{for(const q of X.bc)q.hit=0;X.nx=1;floater(o.x,o.y-20,'WRONG ORDER','#ff6a7a');}}}}
      X.bc=(X.bc||[]).filter(o=>o.x>-20);}
    if(id==='blackout'){const c=((G.dbar||0)%8+8)%8;X.bx=c<4?W+120-(W+360)*c/4:null;}},
  beat(){if(!this.mutOn())return;const id=this.st.mut,X=this.X,bb=((G.bc%4)+4)%4,bar=Math.floor(G.dbar||0);
    if(id==='laser'&&bb===0&&bar%4===1&&!(X.lz&&X.lz.length)){const y=clamp(P.y,40,H-40),tb=SET.diff==='easy'?3:2;X.lz=[{y,t0:G.t,b0:G.bc,on:G.bc+tb}];}
    if(id==='beatgap'){const w=X.bw;if(!w&&bb===0&&bar%4===2){const g=SET.diff==='easy'?180:150;X.bw={x:W+10,gc:clamp(P.y,g/2+30,H-g/2-30),tg:0,g,st:0};X.bw.tg=X.bw.gc;}
      else if(w){w.st++;const g=w.g;w.tg=clamp(w.tg+(Math.sin(w.st*.9)>0?1:-1)*55*this.mk(),g/2+30,H-g/2-30);w.nx=clamp(w.tg+(Math.sin((w.st+1)*.9)>0?1:-1)*55*this.mk(),g/2+30,H-g/2-30);}}
    if(id==='order'&&bb===0&&bar%8===3&&!(X.bc&&X.bc.length)){X.nx=1;const xs=[.6,.74,.88].sort(()=>GX()-.5);X.bc=[1,2,3].map((n,j)=>({n,x:W*xs[j],y:gx(90,H-90),hit:0}));}},
  draw(t){if(!this.mutOn())return;const id=this.st.mut,X=this.X;ctx.save();
    if(id==='blackout'&&X.bx!=null){const x0=X.bx,w=230;ctx.fillStyle='#000';ctx.globalAlpha=.62;ctx.fillRect(x0,0,w,H);ctx.globalAlpha=1;
      ctx.strokeStyle='#ffffffcc';ctx.lineWidth=1.5;for(const b of G.eb)if(b.x>x0&&b.x<x0+w){ctx.beginPath();ctx.arc(b.x,b.y,b.r+2,0,7);ctx.stroke();}   // shots inside the band keep a white rim: never invisible
      for(const e of G.en)if(e.x>x0&&e.x<x0+w&&e.hp>0){ctx.strokeStyle='#ff7080aa';ctx.beginPath();ctx.arc(e.x,e.y,e.r+3,0,7);ctx.stroke();}}
    if(id==='shrink'&&X.m>1){ctx.fillStyle='#ff304030';ctx.fillRect(0,0,W,X.m);ctx.fillRect(0,H-X.m,W,X.m);ctx.strokeStyle='#ff7080';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,X.m);ctx.lineTo(W,X.m);ctx.moveTo(0,H-X.m);ctx.lineTo(W,H-X.m);ctx.stroke();}
    if(id==='wind'&&X.w){ctx.strokeStyle='#9ad8ff';ctx.globalAlpha=.55;ctx.lineWidth=2;const s=Math.sign(X.w),o=(t*60)%40;for(let x=60;x<W;x+=160)for(let j=0;j<3;j++){const y=(s>0?o+j*170:H-o-j*170);ctx.beginPath();ctx.moveTo(x-8,y-s*8);ctx.lineTo(x,y);ctx.lineTo(x+8,y-s*8);ctx.stroke();}ctx.globalAlpha=1;}
    if(id==='laser')for(const L of X.lz||[]){const live=G.bc>=L.on;ctx.strokeStyle=live?'#ff3050':'#ff7080';ctx.globalAlpha=live?1:.45+.35*(Math.floor(t*10)%2);ctx.lineWidth=live?6:2;ctx.setLineDash(live?[]:[12,10]);
      ctx.beginPath();ctx.moveTo(0,L.y);ctx.lineTo(W,L.y);ctx.stroke();ctx.setLineDash([]);if(live){ctx.globalAlpha=.25;ctx.fillStyle='#ff3050';ctx.fillRect(0,L.y-12,W,24);}ctx.globalAlpha=1;}
    if(id==='beatgap'&&X.bw){const w=X.bw;ctx.fillStyle='#ff3dbb';ctx.globalAlpha=.85;ctx.fillRect(w.x-5,0,10,w.gc-w.g/2);ctx.fillRect(w.x-5,w.gc+w.g/2,10,H-w.gc-w.g/2);
      if(w.nx!=null){ctx.globalAlpha=.4;ctx.strokeStyle='#3dffb0';ctx.setLineDash([6,6]);ctx.strokeRect(w.x-14,w.nx-w.g/2,28,w.g);ctx.setLineDash([]);}ctx.globalAlpha=1;}
    if(id==='order')for(const o of X.bc||[]){ctx.globalAlpha=o.hit?.35:1;ctx.strokeStyle=o.n===X.nx?'#ffe14d':'#9aa7c4';ctx.lineWidth=3;ctx.beginPath();ctx.arc(o.x,o.y,18,0,7);ctx.stroke();
      ctx.fillStyle=ctx.strokeStyle;ctx.font='700 18px "Chakra Petch",sans-serif';ctx.textAlign='center';ctx.fillText(String(o.n),o.x,o.y+6);ctx.globalAlpha=1;}
    ctx.restore();}};
/* ---- hooks (all inert with the flag off) ---- */
{const so=DIR.spawnOne;DIR.spawnOne=function(fill){if(VARY.active()&&!(VARY.hard()&&GR()<VARY.oldK()))return VARY.spawn(fill);return so.call(this,fill);};}   // innermost: zoo.js and leak.js wrap it later (caps, READY gaps)
{const pt=DIR.pickTheme;DIR.pickTheme=function(bar){pt.call(this,bar);VARY.theme();};}
{const bl=DIR.barLine;DIR.barLine=function(i){VARY.theme();return bl.call(this,i);};}
if(window.ZOO){const wo=ZOO.waveOK;ZOO.waveOK=function(){return wo.call(this)&&(!VARY.active()||VARY.hard());};}   // Easy/Normal: the zoo kinds come from the scripts' roles; the hard tiers keep the old random zoo pressure on top
if(window.LEAK){const g0=LEAK.gndOK;LEAK.gndOK=function(){const r=g0.call(this);return r&&(!VARY.active()||VARY.hard()||VARY.gnd());};}   // Easy/Normal: ground units only in '+g' moments
{const lb=ST.label;ST.label=function(){const s=lb.call(this);return VARY.mutOn()?s+' · '+VMUT[VARY.st.mut].n:s;};}
{const dp=drawPlayer;drawPlayer=function(t){try{VARY.draw(t);}catch(err){}dp(t);};}
NR.on('runStart',d=>{VARY.plan();if(!VARY.active())return;const st=VARY.st,M=VMUT[st.mut];
  if(M&&!(d&&d.resume))st.card=G.t+3.6;});   // the stage card (story.js) keeps its intro; the RULE card follows it (each line 8 words or fewer)
NR.on('spawn',e=>{if(e&&VARY.mutOn()&&VARY.st.mut==='nopower'&&e.type!=='boss')e.score*=2;});
NR.on('fmUnit',o=>{if(!o||!o.e)return;const f=o.I&&o.I.id||'?',k=o.e.type;(VARY.kinds[f]=VARY.kinds[f]||{})[k]=1;
  if(VARY.mutOn()&&VARY.st.mut==='drop'&&o.e.fp&&o.e.pt>=0){const e=o.e;let t=0;while(t<6&&e.pth(t,e)[0]+e.ox>W-90)t+=.05;e.pt=t;const p=e.pth(t,e);e.x=p[0]+e.ox;const top=GX()<.5;e.drp={t0:G.t,T:.9,y0:top?-30:H+30};e.y=e.drp.y0;
    if(G.rings.length<24)G.rings.push({x:e.x,y:top?14:H-14,l:.5,m:.5,c:'#ff3d6a'});}});
NR.on('tick',dt=>{try{VARY.tick(dt);}catch(err){}});
NR.on('beat',()=>{try{VARY.beat();}catch(err){}});
NR.on('runEnd',()=>{if(window.LEAK)LEAK.pg=VARY.pg0;});
