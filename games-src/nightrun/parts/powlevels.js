// PURPOSE: power-up levels + five new shooter power-ups
// FLAG: pw3 (?pw3=0)
// TEST: ret-pw3-test.js
/* ---------- power-up LEVELS + five new shooter power-ups (flag RET.pw3; ?pw3=0 = parts/powerups.js exactly as before) ----------
   LEVELS (LV1..LV5): the same power picked up again while it runs, or within 4 bars of it ending, goes up one level and its 8-bar timer restarts.
   A hit (the hull really takes it; an absorbed hit does not count) lowers every running leveled power by one level, never below LV1.
   Every level effect is in the table PW3L below. None of them touches a cap: bullets still go through the 64/44 player-bullet cap (pbRoom) and DMG.hit,
   direct damage lowers e.hp and is booked by DMG.pass (hard.js ceiling for ordinary enemies, armour.js cap for bosses), nothing here writes e.hp upwards.
   New powers: BOMB STOCK, HEAVY CRATE, RICOCHET, TIME SLICE, LIFE LEECH (weights as the others; stages 1-2 and the first drops of every later stage use a smaller pool).
   Leveled: ECHO, DOWNBEAT NOVA, MAGNET BASS, WINGMATES, CRESCENDO, CHORD SHIELD, DRUM BURST (its LV3/LV5 shots live in g.js, driven by a.lv) and the five new ones.
   TEMPO UP, SLOW GROOVE and DROP keep g.js's longer-timer levels. Best level per power: localStorage mnr_pw3 (save export list, Stats sheet). Tests: ret-pw3-test.js. */
if(RET.pw3===undefined)RET.pw3=!/[?&]pw3=0/.test(location.search);
/* ----- the level table: index 0 = LV1 ... index 4 = LV5. tx = what the level adds (shown in the Stats sheet and the LAB) ----- */
const PW3L={
  drum:{tx:['auto-shot on every beat','','3 shots: diagonals too','','5 shots: double diagonals']},
  echo:{tx:['1 ghost, a beat later','ghost +15% damage','+ a ghost every half beat','ghost +30% damage','+ a 2nd ghost; ghosts pierce'],
    dm:[1,1.15,1.15,1.3,1.3],half:[0,0,1,1,1],two:[0,0,0,0,1],pn:[0,0,0,0,1],xk:.6},   // xk: the extra (half-beat, 2nd) ghosts hit at this fraction of a ghost
  nova:{tx:['ring, radius 230','bigger ring','+ 2nd ring','bigger, harder','+ a damage field'],
    R:[230,260,260,290,320],dm:[5,5,6,6,7],ring2:[0,0,1,1,1],field:[0,0,0,0,1],fr:6},   // fr: field damage per second to ordinary enemies (bosses 60%)
  magb:{tx:['pulls pickups on the beat','longer reach','+ stronger pull','','widest reach, strongest pull'],R:[640,760,900,900,1100],k:[1,1,1.3,1.3,1.8]},
  wing:{tx:['2 drones','harder drone shots','3 drones','','4 drones, shots home in'],n:[2,2,3,3,4],dm:[1,1.15,1.15,1.3,1.3],home:[0,0,0,0,1]},
  cres:{tx:['x1.6 at most','x1.7 at most','x1.8 at most','x1.9 at most','x2.0 at most'],cap:[1.6,1.7,1.8,1.9,2.0]},   // still +12% a bar; the DMG.hit / scale ceilings come on top
  chord:{tx:['absorbs 1 hit','','absorbs 2 hits','bigger ring-out','reflects bullets'],ch:[1,1,2,2,2],rel:[170,170,190,230,230],refl:[0,0,0,0,1]},
  bomb:{tx:['+1 EMP pulse','','+2 EMP pulses','pulses hit harder','harder pulses, 1 s shield'],n:[1,1,2,2,2],x:[0,0,0,4,8],inv:[0,0,0,0,1]},   // x: extra damage the fired pulse deals to ordinary enemies; inv: seconds of invulnerability
  crate:{tx:['heavy shells','bigger shells','shells pierce 1','bigger, pierce 2','biggest, pierce 3'],nb:[2,3,3,4,5],rad:[8,10,12,14,17],pn:[0,0,1,2,3],k:[.8,.85,.9,.95,1]},   // k: the banked normal-gun damage a burst carries
  ric:{tx:['shots bounce once','','bounce twice','','bounce three times'],rc:[1,1,2,2,3]},
  slice:{tx:['bullets slow on the beat','longer slow','','','slow almost the whole beat'],f:[.55,.5,.45,.4,.35],duty:[.4,.5,.6,.7,.8],hardK:.75},   // f: bullet speed in the slow part of the beat; duty: how much of the beat it lasts
  leech:{tx:['kills heal a little','','','','']  ,f:[.03,.04,.05,.06,.08],gap:20,hardGap:30}};   // f: hull point per kill in the last bar; at most 1 point per gap seconds
for(const k in PW3L)if(!PW3L[k].tx.every(Boolean)){const t=PW3L[k].tx;for(let i=0;i<5;i++)if(!t[i])t[i]=t[i-1]||'';}
const PW3NEW={bomb:{n:'BOMB STOCK',tip:'BOMB STOCK: more EMP pulses',c:'#ffb020'},
  crate:{n:'HEAVY CRATE',tip:'HEAVY CRATE: big slow shells',c:'#d6ff3d'},
  ric:{n:'RICOCHET',tip:'RICOCHET: shots bounce off edges',c:'#ffffff'},
  slice:{n:'TIME SLICE',tip:'TIME SLICE: bullets slow on the beat',c:'#00e5c3'},
  leech:{n:'LIFE LEECH',tip:'LIFE LEECH: kills heal a little',c:'#ff4f8b'}};
const PW3G=['drum','echo','nova','magb','wing','cres','chord','crate','ric','slice','leech'];   // one timed power at a time inside this group (BOMB STOCK is a stock, it stacks)
const PW3={get on(){return!!(RET.pw3&&RET.pw2);},L:PW3L,G:PW3G,N:PW3NEW,MAX:5,GRACE:16,
  stat:{up:0,down:0,bomb:0,leech:0,refl:0,fld:0,ring2:0,hb:0,heavy:0,rb:0,drawn:0},
  hi:{},seen:{},
  lvl(k){return!!PW3L[k];},
  act(k){return PW2.act(k);},
  lv(k){const a=PW2.act(k);return a?a.l3||1:0;},
  v(k,f){const a=PW2.act(k);return a?PW3L[k][f][(a.l3||1)-1]:PW3L[k][f][0];},
  S(){return G.p3||(G.p3={rec:{},live:{},picks:0,stage:-1,hb:[],rg:[],fld:null,wx:[],bank:0,crT:0,kl:[],lh:0,lhT:-99,emp0:2,rf:-1,sf:1,sl:0});},
  load(){try{const o=load('mnr_pw3',{})||{};PW3.hi={};PW3.seen={};for(const k in (o.hi||{}))if(PW3L[k])PW3.hi[k]=Math.max(0,Math.min(5,o.hi[k]|0));for(const k in (o.s||{}))if(/^[a-z]{2,8}$/.test(k))PW3.seen[k]=1;}catch(e){PW3.hi={};PW3.seen={};}},
  persist(){try{save('mnr_pw3',{v:1,hi:PW3.hi,s:PW3.seen});}catch(e){}},
  chime(lv,down){const a=AU.a;if(!a||a.state!=='running')return;try{const N=down?[7,5,3,0]:[0,2,4,5,7];for(let i=0;i<(down?2:lv);i++)PW2.note(N[i],.14,.07,'triangle',a.currentTime+i*.06,24);}catch(e){}},
  sheet(){try{if(!Object.keys(PW3.hi).some(k=>PW3.hi[k]>0))return'';const rows=Object.keys(PW3L).filter(k=>PW3.hi[k]>0).map(k=>{const K=PWK[k]||{n:k,c:'#fff'};return'<div><span>'+K.n+'</span><i><u style="width:'+Math.round(PW3.hi[k]*20)+'%"></u></i><em>LV'+PW3.hi[k]+'</em></div>';});
    return'<h3>POWER-UP LEVELS</h3><div class="stParts">'+rows.join('')+'</div>';}catch(e){return'';}},
  /* the hooks parts/powerups.js calls (each guarded there by PW3.on) */
  echoGhost(n0){const lv=PW3.lv('echo')||1,dm=PW3L.echo.dm[lv-1],pn=PW3L.echo.pn[lv-1];for(let i=n0;i<G.pb.length;i++){const b=G.pb[i];b.dm*=dm;b.e3=1;if(pn){b.px=new Set();b.pn=pn;}}},
  wingShot(n0){const a=PW2.act('wing');if(!a)return;const lv=a.l3||1,dm=PW3L.wing.dm[lv-1],home=PW3L.wing.home[lv-1],S=PW3.S();
    for(let i=n0;i<G.pb.length;i++){const b=G.pb[i];b.dm*=dm;if(home)b.hk=3;}
    if(PW3.wingN(lv)>2)for(const w of S.wx){if(typeof pbRoom==='function'&&!pbRoom(1))break;G.pb.push({x:w.x+10,y:w.y,vx:900,vy:0,dm:.8*dm,pf:0,gh:1,hk:home?3:0});}},
  wingN(lv){return PW3L.wing.n[lv-1];},
  novaTag(n){const lv=PW3.lv('nova')||1;n.R=PW3L.nova.R[lv-1];n.dm=PW3L.nova.dm[lv-1];n.p3=lv;},
  novaEnd(n){const lv=n.p3||0;if(lv&&PW3L.nova.field[lv-1]&&!n.ch){PW3.S().fld={x:n.x,y:n.y,r:n.R*.6,until:G.t+BT.spb,l:BT.spb,m:BT.spb};PW3.stat.fld++;}},
  magR(){return PW3.lv('magb')?PW3.v('magb','R'):640;},
  magK(){return PW3.lv('magb')?PW3.v('magb','k'):1;},
  cresK(a){return Math.min(PW3L.cres.cap[(a.l3||1)-1],1+.12*(a.bars|0));},
  chordUse(a){a.ch=(a.ch==null?PW3L.chord.ch[(a.l3||1)-1]:a.ch)-1;if(a.ch>0)a.used=false;}   // charges left: the shield stays up and does not ring out yet
};
window.PW3=PW3;   // parts/powerups.js reaches it through window
if(PW3.on){
  PW3.load();
  RET.sioKeys.push('mnr_pw3');
  for(const k in PW3NEW)PWK[k]={n:PW3NEW[k].n,tip:PW3NEW[k].tip,c:PW3NEW[k].c,bars:8,w:2,pw3:1,nw:1};
  /* ----- give: the level rule, the one-at-a-time group, the first-time tips ----- */
  {const give=PW.give;PW.give=function(kind,ob){if(!PW3.on||!PW3L[kind])return give.call(this,kind,ob);
    const s=this.st(),S=PW3.S(),cur=this.cur(),old=s.act.find(a=>a.k===kind),rc=S.rec[kind];
    const l0=old?old.l3||1:(rc&&cur-rc.at<=PW3.GRACE?rc.lv:0),lv=Math.min(PW3.MAX,l0+1),bars=old?old.bars:0,ch=old?old.ch:null;
    if(PW3G.indexOf(kind)>=0)for(let i=s.act.length-1;i>=0;i--){const a=s.act[i];if(a.k!==kind&&PW3G.indexOf(a.k)>=0){S.rec[a.k]={lv:a.l3||1,at:cur};s.act.splice(i,1);PW.stat.ended++;}}   // a new power replaces the running one; its level waits 4 bars
    delete S.rec[kind];
    if(typeof PWL!=='undefined')PWL[kind]=lv-1;                    // g.js counts levels per pickup: hand it ours so its floater and its LV3/LV5 drum shots agree
    const r=give.call(this,kind,ob);if(!r)return r;
    const a=this.st().act.find(x=>x.k===kind);if(!a)return r;const K=PWK[kind];
    a.l3=lv;a.lv=lv;a.d=K.bars*4*(ob?1.5:1);                       // the timer restarts; no longer than the base 8 bars (g.js's longer timers are for the unleveled powers)
    if(kind==='cres')a.bars=lv>1?bars|0:0;
    if(kind==='chord'){a.ch=PW3L.chord.ch[lv-1];a.used=false;a.rel=false;}
    if(kind==='bomb'){const n=PW3L.bomb.n[lv-1];P.emp=Math.min(3,P.emp+n);floater(P.x,P.y-24,'EMP +'+n,K.c);}
    if(lv>(PW3.hi[kind]|0)){PW3.hi[kind]=lv;PW3.persist();}
    if(lv>l0&&l0>0){PW3.stat.up++;PW3.chime(lv);}
    if(PW3.seen[kind]!==1&&PW3NEW[kind]){PW3.seen[kind]=1;PW3.persist();hintShow(say(PW3NEW[kind].tip),6);}
    else if(lv===2&&!PW3.seen.rule){PW3.seen.rule=1;PW3.persist();hintShow(say('Grab again to level up'),6);}
    else if(lv>1)hintShow(say(K.n+' LV'+lv+': '+PW3L[kind].tx[lv-1]),2.4);
    return r;};}
  /* ----- the drop table: stages 1-2 keep the old pool; in a later stage the first 4 drops come from 3 new + 2 old powers; Endless uses everything ----- */
  {const OLD=['drum','tempo','slow','drop','echo','nova','magb','wing','cres','chord'],NEW=Object.keys(PW3NEW);
    const rot=(a,n)=>a.slice(n%a.length).concat(a.slice(0,n%a.length));
    PW.pick=function(){const s=this.st(),S=PW3.S();let ks=Object.keys(PWK).filter(k=>!(k==='drop'&&s.drop)&&(PW3L[k]||!this.on(k)));
      if(ST.on){if(S.stage!==ST.n){S.stage=ST.n;S.picks=0;}
        if(ST.n<=2)ks=ks.filter(k=>!PWK[k].nw);
        else if(S.picks<4){const keep=rot(NEW,ST.n*2).slice(0,3).concat(rot(OLD,ST.n).slice(0,2)),f=ks.filter(k=>keep.indexOf(k)>=0);if(f.length)ks=f;}
        S.picks++;}
      const wt=k=>PWK[k].w*(PW3L[k]&&this.on(k)?1.5:1);let t=0;for(const k of ks)t+=wt(k);let r=gx(0,t);for(const k of ks){r-=wt(k);if(r<=0)return k;}return ks[0]||'drum';};}
  /* ----- a hit costs a level; a power that ends keeps its level for 4 bars ----- */
  NR.on('hurt',()=>{if(!G.live||!G.pw)return;let d=0;for(const a of G.pw.act)if(PW3L[a.k]&&(a.l3||1)>1){a.l3--;a.lv=a.l3;d++;PW3.stat.down++;floater(P.x,P.y-44-10*d,PWK[a.k].n.split(' ')[0]+' LV'+a.l3,'#ff9a9a');
      if(a.k==='chord'&&a.ch!=null)a.ch=Math.min(a.ch,PW3L.chord.ch[a.l3-1]);}
    if(d)PW3.chime(0,true);});
  NR.on('runStart',()=>{G.p3=null;PW3.load();});NR.on('runEnd',()=>{if(G)G.p3=null;});
  /* ----- the main per-frame job ----- */
  NR.on('tick',dt=>{if(!G.live||G.dead){return;}const s=G.pw;if(!s)return;const S=PW3.S(),cur=PW.cur();
    for(const a of s.act)if(PW3L[a.k])S.live[a.k]=a.l3||1;
    for(const k in S.live)if(!s.act.some(a=>a.k===k)){if(!S.rec[k])S.rec[k]={lv:S.live[k],at:cur};delete S.live[k];}
    for(const k in S.rec)if(cur-S.rec[k].at>PW3.GRACE)delete S.rec[k];
    /* ECHO: the half-beat and the second ghost */
    const e=PW2.act('echo');
    if(e){const lv=e.l3||1,t=bpos();for(let i=S.hb.length-1;i>=0;i--){const g=S.hb[i];if(t<g.at)continue;S.hb.splice(i,1);
        if(typeof pbRoom==='function'&&!pbRoom(2))continue;const dm=PW3L.echo.dm[lv-1]*PW3L.echo.xk,pn=PW3L.echo.pn[lv-1];
        for(const vy of[-24,24]){const b={x:g.x,y:g.y+(vy<0?-4:4),vx:900,vy,dm,pf:0,gh:1,e3:1};if(pn){b.px=new Set();b.pn=pn;}G.pb.push(b);}
        PW2.st().trl.push({x:g.x,y:g.y,l:.24,m:.24});PW3.stat.hb++;PW2.note(7+(S.hb.length%2),.1,.05,'square',0,24);}}
    else S.hb.length=0;
    /* WINGMATES: the extra drones follow the ship */
    const wg=PW2.act('wing'),wn=wg?PW3.wingN(wg.l3||1)-2:0;
    if(wn>0){const off=wn===1?[[-34,0]]:[[-6,-72],[-6,72]];while(S.wx.length<wn)S.wx.push({x:P.x-10,y:P.y});S.wx.length=wn;
      S.wx.forEach((w,i)=>{w.x+=(P.x+off[i][0]-w.x)*Math.min(1,dt*9);w.y+=(P.y+off[i][1]-w.y)*Math.min(1,dt*9);});}else S.wx.length=0;
    /* NOVA: second ring, damage field. Rings are pw2's: they clear bullets and hit each enemy once through e.hp (booked by DMG.pass) */
    const ring=n=>{n.r+=dt*720;
      for(const b of G.eb){if(!b.dead&&Math.hypot(b.x-n.x,b.y-n.y)<n.r+(b.r||4)){b.dead=1;G.score+=5;}}
      for(const q of G.en){if(q.hp<=0||q.dying||q.gr||n.hit.has(q))continue;if(Math.hypot(q.x-n.x,q.y-n.y)<n.r+q.r&&(q.type!=='boss'||q.x<W-20)){n.hit.add(q);q.hp-=q.type==='boss'?n.dm*.6:n.dm;q.flash=.1;}}};
    for(let i=S.rg.length-1;i>=0;i--){const n=S.rg[i];ring(n);if(n.r>=n.R)S.rg.splice(i,1);}
    const nv=G.p2&&G.p2.nv;if(nv&&nv.ch&&!nv.p3){nv.p3=1;const c=PW2.act('chord');nv.R=PW3L.chord.rel[(c?c.l3||1:1)-1];}   // CHORD SHIELD ring-out size by level
    const f=S.fld;if(f){if(G.t>=f.until)S.fld=null;else for(const q of G.en){if(q.hp<=0||q.dying||q.gr||(q.type==='boss'&&q.x>=W-20))continue;if(Math.hypot(q.x-f.x,q.y-f.y)<f.r+q.r){q.hp-=PW3L.nova.fr*dt*(q.type==='boss'?.6:1);q.flash=Math.max(q.flash,.05);}}}
    /* CHORD SHIELD LV5: bullets that touch the shield bounce back (one per beat) */
    const ch=PW2.act('chord');
    if(ch&&PW3L.chord.refl[(ch.l3||1)-1]&&!ch.used&&S.rf!==G.bc){for(const b of G.eb){if(b.dead||Math.hypot(b.x-P.x,b.y-P.y)>40)continue;
        if(typeof pbRoom==='function'&&!pbRoom(1))break;b.dead=1;S.rf=G.bc;const l=Math.hypot(b.vx,b.vy)||1;
        G.pb.push({x:P.x+(b.x>P.x?30:-30),y:b.y,vx:-b.vx/l*700,vy:-b.vy/l*700,dm:1.2,pf:0,gh:1,col:PWK.chord.c,len:12,th:3});PW3.stat.refl++;burst(b.x,b.y,PWK.chord.c,10,200,.3);AU.sfx('pick');break;}}
    /* BOMB STOCK: a fired EMP pulse carries the level's extra damage and shield */
    const bo=PW2.act('bomb');
    if(bo&&P.emp<S.emp0&&G.empT>0){const lv=bo.l3||1,x=PW3L.bomb.x[lv-1],inv=PW3L.bomb.inv[lv-1];PW3.stat.bomb++;
      if(x)for(const q of G.en)if(q.type!=='boss'&&q.hp>0&&!q.gr&&!q.dying)q.hp-=x;
      if(inv)P.inv=Math.max(P.inv,inv);}
    S.emp0=P.emp;
    /* TIME SLICE: the speed of enemy bullets, read by RET.asB; the beat clock is never touched */
    const sl=PW2.act('slice');S.sf=1;
    if(sl){const lv=sl.l3||1,ph=((bpos()%1)+1)%1,du=PW3L.slice.duty[lv-1]*(HARDS.includes(SET.diff)?PW3L.slice.hardK:1);if(ph<du){S.sf=PW3L.slice.f[lv-1];PW3.stat.drawn++;}}
    /* LIFE LEECH: a bar's kills pay out at the bar line (below); here only the kill list is pruned */
    if(S.kl.length&&cur-S.kl[0]>4)S.kl.shift();
  });
  NR.on('beat',d=>{if(!G.live||G.dead||!G.pw)return;const S=PW3.S(),n=PW2.act('nova');
    if(n&&(n.l3||1)>=3&&d.i%4===2&&PW3L.nova.ring2[(n.l3||1)-1]){const lv=n.l3;S.rg.push({x:P.x,y:P.y,r:0,R:PW3L.nova.R[lv-1]*.85,hit:new Set(),dm:PW3L.nova.dm[lv-1]*.7});PW3.stat.ring2++;PW2.note(4,.3,.07,'sawtooth',0,12);}});
  NR.on('fire',f=>{if(!G.live||G.dead||!f.pf)return;const a=PW2.act('echo');if(!a)return;const lv=a.l3||1,S=PW3.S(),t=bpos();
    if(PW3L.echo.half[lv-1]&&S.hb.length<4)S.hb.push({x:f.x,y:f.y,at:t+.5});
    if(PW3L.echo.two[lv-1]&&S.hb.length<4)S.hb.push({x:f.x,y:f.y,at:t+2});});
  /* LIFE LEECH */
  NR.on('kill',()=>{if(!G.live||G.dead||!PW2.act('leech'))return;PW3.S().kl.push(PW.cur());});
  NR.on('bar',()=>{if(!G.live||G.dead)return;const a=PW2.act('leech');if(!a)return;const S=PW3.S(),cur=PW.cur(),n=S.kl.filter(t=>cur-t<=4).length;S.kl.length=0;if(!n)return;
    S.lh=Math.min(1,S.lh+n*PW3L.leech.f[(a.l3||1)-1]);
    const gap=HARDS.includes(SET.diff)?PW3L.leech.hardGap:PW3L.leech.gap;
    if(S.lh>=1&&P.hp<P.max&&G.t-S.lhT>=gap){P.hp++;S.lh=0;S.lhT=G.t;PW3.stat.leech++;floater(P.x,P.y-24,'HULL +1',PWK.leech.c);burst(P.x,P.y,PWK.leech.c,14,200,.4);AU.sfx('pick');}});
  /* HEAVY CRATE and RICOCHET: shaped where the volley is made (same place CRESCENDO scales it) */
  HOOK['SH.volley'](vol=>function(x,y,pf){const n0=G.pb.length;vol.call(this,x,y,pf);if(!PW3.on||!G.pw||G.pb.length<=n0)return;
    const r=PW2.act('ric'),c=PW2.act('crate');
    if(r){const rc=PW3L.ric.rc[(r.l3||1)-1];for(let i=n0;i<G.pb.length;i++){const b=G.pb[i];if(!b.rc&&b.vx>0){b.rc=rc;PW3.stat.rb++;}}}   // b.js bounces a bullet off the top, bottom and right edge while b.rc>0
    if(c){const lv=c.l3||1,S=PW3.S();let sum=0;const keep=[];
      for(let i=n0;i<G.pb.length;i++){const b=G.pb[i];if(!b.col&&!b.hk&&!b.big&&!b.gh&&!b.px)sum+=b.dm;else keep.push(b);}   // the plain gun only; weapons keep their own shots
      if(sum>0){G.pb.length=n0;for(const b of keep)G.pb.push(b);S.bank+=sum;}
      if(S.bank>0&&(pf||G.t-S.crT>BT.spb*1.1)){const nb=PW3L.crate.nb[lv-1],tot=S.bank*PW3L.crate.k[lv-1],rad=PW3L.crate.rad[lv-1];S.bank=0;S.crT=G.t;
        for(let j=0;j<nb;j++){const a=(nb>1?j/(nb-1)-.5:0)*.34;G.pb.push({x:x+8,y,vx:Math.cos(a)*540,vy:Math.sin(a)*540,dm:tot/nb,pf:0,big:1,rad,px:new Set(),pn:PW3L.crate.pn[lv-1],col:PWK.crate.c,len:rad*2.4,th:rad*1.5});}
        PW3.stat.heavy++;}}});
  /* TIME SLICE: RET.asB is the enemy-bullet speed factor b.js already multiplies in */
  {const ab=RET.asB;RET.asB=function(){const f=ab.call(this);return PW3.on&&G&&G.p3&&G.pw?f*G.p3.sf:f;};}
  /* ----- drawing: icons, extra drones, rings, field, slice frame ----- */
  {const gl=PW.glyph;PW.glyph=function(k,r,c){if(!PWK[k]||!PWK[k].pw3)return gl.call(this,k,r,c);
    ctx.save();ctx.scale(r/11,r/11);ctx.strokeStyle=c;ctx.fillStyle=c;ctx.lineWidth=2;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();
    if(k==='bomb'){ctx.arc(0,3,6,0,7);ctx.moveTo(3,-2);ctx.lineTo(6,-7);ctx.moveTo(4,-9);ctx.lineTo(8,-9);}
    else if(k==='crate'){ctx.rect(-6,-6,12,12);ctx.moveTo(-6,-6);ctx.lineTo(6,6);ctx.moveTo(6,-6);ctx.lineTo(-6,6);}
    else if(k==='ric'){ctx.moveTo(-8,7);ctx.lineTo(-3,-6);ctx.lineTo(3,6);ctx.lineTo(8,-5);}
    else if(k==='slice'){ctx.arc(0,0,8,0,7);ctx.moveTo(0,0);ctx.lineTo(0,-5);ctx.moveTo(0,0);ctx.lineTo(4,2);}
    else{ctx.moveTo(0,8);ctx.bezierCurveTo(-10,0,-6,-8,0,-3);ctx.bezierCurveTo(6,-8,10,0,0,8);}
    ctx.stroke();ctx.restore();};}
  {const pd=PW.draw;PW.draw=function(t){pd.call(this,t);const S=G.p3;if(!S||!G.pw)return;ctx.save();ctx.lineCap='round';
    const wg=PW2.act('wing');if(wg)for(const w of S.wx){ctx.globalAlpha=.95;ctx.fillStyle='#0a0612';ctx.strokeStyle=PWK.wing.c;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(w.x+9,w.y);ctx.lineTo(w.x,w.y-7);ctx.lineTo(w.x-8,w.y);ctx.lineTo(w.x,w.y+7);ctx.closePath();ctx.fill();ctx.stroke();ctx.globalAlpha=.3;ctx.globalCompositeOperation='lighter';G_(w.x,w.y,16,PWK.wing.c,.5);ctx.globalCompositeOperation='source-over';}
    for(const n of S.rg){ctx.globalAlpha=clamp(1-n.r/n.R,0,1)*.8;ctx.strokeStyle=PWK.nova.c;ctx.lineWidth=5*(1-n.r/n.R)+2;ctx.beginPath();ctx.arc(n.x,n.y,n.r,0,7);ctx.stroke();}
    const f=S.fld;if(f){const k=clamp((f.until-G.t)/f.m,0,1);ctx.globalAlpha=.12+.25*k;ctx.fillStyle=PWK.nova.c;ctx.beginPath();ctx.arc(f.x,f.y,f.r,0,7);ctx.fill();ctx.globalAlpha=.5*k;ctx.strokeStyle=PWK.nova.c;ctx.lineWidth=2;ctx.stroke();}
    const ch=PW2.act('chord');if(ch&&!ch.used&&(ch.ch|0)>1){ctx.globalAlpha=.5;ctx.strokeStyle=PWK.chord.c;ctx.lineWidth=2;ctx.beginPath();ctx.arc(P.x,P.y,38,0,7);ctx.stroke();}   // a second charge: a second ring
    if(S.sf<1){ctx.globalAlpha=.5;ctx.strokeStyle=PWK.slice.c;ctx.lineWidth=6;ctx.strokeRect(3,3,W-6,H-6);}
    ctx.restore();};}
  /* ----- the level on the HUD: 'LV3' on the power's bar (desktop list) and next to its round chip (phone strip) ----- */
  const lvTag=(it,x,y,fs)=>{ctx.save();ctx.font='700 '+fs+'px "Share Tech Mono",monospace';ctx.textAlign='left';ctx.fillStyle=PWK[it.k].c;ctx.fillText('LV'+it.lv,x,y);ctx.restore();};
  {const hd=PW.hud;PW.hud=function(t,x0,y0,k){hd.call(this,t,x0,y0,k);const s=G.pw;if(!s)return;k=k||1;x0=x0==null?18:x0;let y=y0==null?112:y0;
    for(const a of s.act){if(PW3L[a.k]){ctx.save();ctx.translate(x0,y);ctx.scale(k,k);ctx.font='700 14px "Chakra Petch",sans-serif';const w=ctx.measureText(PWK[a.k].n).width;ctx.restore();
        ctx.save();ctx.translate(x0,y);ctx.scale(k,k);ctx.fillStyle=PWK[a.k].c;ctx.font='700 14px "Share Tech Mono",monospace';ctx.textAlign='left';ctx.fillText('LV'+(a.l3||1),32+w+8,-3);ctx.restore();}
      y+=46*k;}};}
  {const ch=PW.chips;PW.chips=function(t,x,y,k){ch.call(this,t,x,y,k);const s=G.pw;if(!s)return;const r=11*k;let cx=x+r;
    for(const a of s.act){if(PW3L[a.k])lvTag({k:a.k,lv:a.l3||1},cx-r*.9,y-4*k+r+11*k,Math.max(11,Math.round(11*k)));cx+=2*r+10*k;}};}
  window.__pw3={PW3,PW3L};
}
