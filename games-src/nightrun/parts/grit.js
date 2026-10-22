// PURPOSE: slower EMP meter, tougher varied enemies
// FLAG: grit (?grit=0), gritBoss (?gritboss=0)
// TEST: grit-test.js
/* ---------- GRIT: a slower EMP meter and tougher, more varied enemies (flag RET.grit, default ON; ?grit=0 = the old numbers exactly). BALANCE.md "Grit". Test: nightrun/grit-test.js.
   Owner, 20 Oct 2026: "the game is very easy, the EMP charges very fast, the enemies are predictable, my weapons are superior to the enemies".
   1. EMP meter: ABIL.gain asks GRIT.emp for every source. Kills of fodder (mini, swarm, mine, plain drones) give nothing, the rest diminish as kills pile up, graze gain is capped per second,
      a pickup gives .6 and a second one within 12 s .4 of that, and one token bucket caps the total: one full charge per ~50 s on Normal at stage 1 (longer on later stages; the hard tiers' FILL still scales it down).
      The EMP button shows the time one charge takes.
   2. On-screen floor hook (GRIT.fk0 x1.3 to stage 10, tapering to x1.1 at stage 20; per-kind GRIT.fkM); weapon levels grow slower on Normal (SC.lvTop .62, LV10 = 1.62x LV1), enemy hulls on Normal follow the power a little more (GRIT.hk).
   3. Durability kinds from stage 3 (not Easy, not the tutorial, at most GRIT.maxK alive): PLATE (front hits x.35: flank, get behind it, or EMP), SHIELD (a shield pool eats damage first, EMP strips it),
      MEDIC (heals the foes around it while they are not being hit), EVASIVE (steps out of the way of straight shots; homing and area weapons still land). Every kind has a drawn tell from the first frame.
   Nothing here touches hard.js, armour.js, the DMG caps or the W13 floors: shield and plate only shave damage, the floor still lets a foe die no sooner than VIS.ml. */
if(RET.grit===undefined)RET.grit=!/[?&]grit=0/.test(location.search);
if(RET.gritBoss===undefined)RET.gritBoss=!/[?&]gritboss=0/.test(location.search);   // W54: Hard boss mercy, ON by default (owner, 22 Oct 2026: keep on); ?gritboss=0 turns it off
const GRIT=window.GRIT={get on(){return!!RET.grit&&!(typeof G==='object'&&G&&(G.tut||G.lab));},
  rate0:1/50,burst:.25,stK:.03,maxK:4,hk0:.3,hkS:.5,lvTop:.62,from:3,
  /* W47 Normal ease: special kinds thin out before stage 12 (dens), at most maxE alive there, a lower hull slope; stages 1-3 assist: wider beat window, slower enemy shots (humanbot.js: human clear 39% -> 70+% at st3-7) */
  dens0:.35,densA:4,densB:12,maxE:2,hkN:.12,aWin:35,aSp:.14,aTo:3,bsN:1,mc0:.4,mc20:.5,mcMax:3,
  st:{charges:0,gain:0,kill:0,fod:0,spec:0},
  fkM:{},fk0:1.15,fkEnd:1.05,fkA:10,fkB:20,   // on-screen floor x1.3 to stage 10, tapering to x1.1 at stage 20 (humanbot.js: median life 2.4 -> 3.0 s; a flat x1.3 cost the stage-20 oracle dodger 20-30 points)
  fk(e){const k=this.fkM[e.type]||this.fk0,s=this.stg();return s<=this.fkA?k:1+(k-1)*Math.max(0,1-(1-(this.fkEnd-1)/Math.max(.001,k-1))*Math.min(1,(s-this.fkA)/(this.fkB-this.fkA)));},
  mcH:.7,mcHMax:8,   // W54 Hard boss mercy: .7 of a hit per hit taken during a boss fight, at most 8 per run
  hardBoss(){return this.on&&RET.gritBoss&&SET.diff==='hard'&&!!G.boss&&!G.boss.dead;},
  norm(){return this.on&&SET.diff==='normal';},
  dens(){if(!this.norm())return 1;const s=this.stg();return s>=this.densB?1:s<=this.densA?this.dens0:this.dens0+(1-this.dens0)*(s-this.densA)/(this.densB-this.densA);},
  assist(){return this.norm()&&this.stg()<=this.aTo&&!(typeof G==='object'&&G&&G.boss);},
  aK(){return(this.aTo+1-this.stg())/this.aTo;},
  stg(){try{return S2.stg();}catch(e){return 1;}},
  rate(){return this.rate0/(1+this.stK*Math.max(0,this.stg()-1));},
  fillT(){return 1/(this.rate()*(ABIL.FILL[SET.diff]||1));},
  g(){return G.gr||(G.gr={b:.12,t:G.t,kw:0,gz:0,pk:-99,sd:12345,last:P.emp,ev:0});},
  rnd(){const g=this.g();g.sd=(g.sd*1103515245+12345)&0x7fffffff;return g.sd/0x7fffffff;},
  fodder(e){return!e||e.mini||e.type==='swarm'||e.type==='mine'||(e.type==='drone'&&!e.el&&!e.gk);},
  emp(v,src,e){const g=this.g(),dt=Math.max(0,G.t-g.t);g.t=G.t;g.b=Math.min(this.burst,g.b+dt*this.rate());g.kw=Math.max(0,g.kw-dt/3);g.gz=Math.max(0,g.gz-dt*.008);
    if(src==='kill'){if(this.fodder(e)){this.st.fod++;return 0;}v/=1+.35*g.kw;g.kw++;this.st.kill++;}
    else if(src==='graze'){v=Math.min(v,Math.max(0,.012-g.gz));g.gz+=v;}
    else if(src==='pickup'){v*=G.t-g.pk<12?.24:.6;g.pk=G.t;}
    v=Math.min(v,g.b);g.b-=v;this.st.gain+=v;return v;},
  /* durability kinds */
  alive(){let n=0;for(const e of G.en)if(e.gk&&e.hp>0)n++;return n;},
  tag(e){if(!this.on||SET.diff==='easy'||e.mini||e.type==='boss'||this.stg()<this.from||this.alive()>=(this.norm()&&this.stg()<this.densB?this.maxE:this.maxK))return;const r=this.rnd()/this.dens(),t=e.type;let k='';
    if(t==='turret')k=r<.4?'plate':r<.6?'shield':'';
    else if(t==='charger'||t==='flank')k=r<.32?'eva':r<.42?'plate':'';
    else if(t==='drone')k=e.el?(r<.4?'shield':''):(r<.14?'med':r<.28?'shield':'');
    else if(t==='gate')k=r<.4?'shield':'';
    if(!k)return;e.gk=k;this.st.spec++;if(k==='shield')e.gs=Math.round(e.max*.7);if(k==='eva'){e.gcd=0;e.gv=0;e.gvt=0;}},
  /* hit: the damage that reaches the hull */
  hit(r,b,e){if(!e||!e.gk)return r;
    if(e.gk==='plate'&&b&&b.vx>0&&Math.abs(b.vy)<b.vx*.9&&b.x<e.x+e.r)r*=.35;
    if(e.gs>0){const a=Math.min(e.gs,r);e.gs-=a;r-=a;e.gsf=.12;}
    return r;},
  tick(dt){if(!G||G.dead)return;const g=this.g();
    if(P.emp>g.last)this.st.charges+=P.emp-g.last;g.last=P.emp;if(!this.on)return;
    for(const e of G.en){if(!e.gk||e.hp<=0)continue;
      if(e.gsf>0)e.gsf-=dt;
      if(e.gs>0&&G.empT>0)e.gs=0;
      if(e.gk==='med'){e.gm=(e.gm||0)+dt;for(const f of G.en){if(f===e||f.hp<=0||f.type==='boss'||f.flash>0||f.hp>=f.max)continue;if(Math.abs(f.x-e.x)<230&&Math.abs(f.y-e.y)<200)f.hp=Math.min(f.max,f.hp+f.max*.07*dt);}}
      else if(e.gk==='eva'){e.gcd=Math.max(0,e.gcd-dt);
        if(e.gvt>0){e.gvt-=dt;const d=e.gv*dt;e.y=clamp(e.y+d,50,H-50);if(e.by!=null)e.by=clamp(e.by+d,50,H-50);}
        else if(e.gcd<=0&&e.x<W-60&&e.x>P.x+60){for(const b of G.pb){if(b.vx<=0||b.hm||b.hk||b.au||b.tg||b.ab)continue;const dx=e.x-b.x;if(dx>0&&dx<190&&Math.abs(b.y-e.y)<e.r+8){e.gv=(b.y<e.y?1:-1)*(e.y<90?1:e.y>H-90?-1:1)*300;e.gvt=.2;e.gcd=1.1;break;}}}}}},
  link(e,t){let n=0;for(const f of G.en){if(n>=2)break;if(f===e||f.hp<=0||f.type==='boss'||f.flash>0||f.hp>=f.max||Math.abs(f.x-e.x)>=230||Math.abs(f.y-e.y)>=200)continue;n++;const dx=f.x-e.x,dy=f.y-e.y,d=Math.hypot(dx,dy);
    if(!ART.span('fx-w34-gk-medlink',(e.x+f.x)/2,(e.y+f.y)/2,d,14,Math.atan2(dy,dx),.55+.3*Math.sin(t*8))){ctx.globalAlpha=.3;ctx.strokeStyle='#3dff7a';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(e.x,e.y);ctx.lineTo(f.x,f.y);ctx.stroke();ctx.globalAlpha=1;}}},
  draw(){if(!this.on||!G||G.dead)return;ctx.save();
    for(const e of G.en){if(!e.gk||e.hp<=0||e.x<-20||e.x>W+20)continue;const r=e.r+6,t=G.t;
      if((e.gk==='plate'&&ART.pic('gk-plate',r*2.2,e.x,e.y))||(e.gk==='shield'&&e.gs>0&&ART.pic('fx-w34-gk-shield',r*4,e.x,e.y))||(e.gk==='eva'&&ART.pic('gk-evasive',r*3.2,e.x,e.y))){}else if(e.gk==='plate'){ctx.strokeStyle='#e8f4ff';ctx.lineWidth=5;ctx.beginPath();ctx.arc(e.x,e.y,r,Math.PI*.62,Math.PI*1.38);ctx.stroke();ctx.strokeStyle='#7a8fa6';ctx.lineWidth=2;ctx.stroke();}
      else if(e.gk==='shield'&&e.gs>0){ctx.globalAlpha=.4+.5*Math.min(1,e.gs/(e.max*.7))+(e.gsf>0?.3:0);ctx.strokeStyle='#19e3ff';ctx.lineWidth=2.5;ctx.setLineDash([6,4]);ctx.beginPath();ctx.arc(e.x,e.y,r+2,0,7);ctx.stroke();ctx.setLineDash([]);}
      else if(e.gk==='med'){const p=.6+.4*Math.sin(t*6);ctx.globalAlpha=p;ctx.fillStyle='#3dff7a';if(!ART.pic('gk-medic',24,e.x,e.y-r-8)){ctx.fillRect(e.x-2,e.y-r-12,4,12);ctx.fillRect(e.x-6,e.y-r-8,12,4);}ctx.globalAlpha=.15;ctx.strokeStyle='#3dff7a';ctx.beginPath();ctx.arc(e.x,e.y,230,0,7);ctx.stroke();ctx.globalAlpha=1;this.link(e,t);}
      else if(e.gk==='eva'){ctx.strokeStyle='#d36bff';ctx.lineWidth=2;ctx.globalAlpha=e.gvt>0?.9:.55;for(let i=1;i<=2;i++){ctx.beginPath();ctx.moveTo(e.x+r+i*5,e.y-8);ctx.lineTo(e.x+r+i*5-6,e.y);ctx.lineTo(e.x+r+i*5,e.y+8);ctx.stroke();}}}
    ctx.restore();}};
/* meter fill time on the EMP button */
{const st=document.createElement('style');st.textContent='#touch button#bEmp::before{content:attr(data-t);position:absolute;left:0;right:0;bottom:-13px;text-align:center;color:#ffb020;font:700 10px var(--mono);text-shadow:0 0 3px #000;pointer-events:none}';document.head.appendChild(st);
  const r0=ABIL.rings;ABIL.rings=function(){r0.call(this);const e=$('bEmp');if(e)e.setAttribute('data-t',GRIT.on?'~'+Math.round(GRIT.fillT())+'s':'');};
  const d0=ABIL.draw;ABIL.draw=function(t){d0.call(this,t);GRIT.draw();};}
/* hooks: the damage that reaches the hull, the weapon level curve, the hull factor on Normal, the spawn tag */
{const l0=VIS.life;VIS.life=function(e){const b=l0.call(this,e);return GRIT.norm()&&b>0?b*GRIT.fk(e):b;};
  const h0=DMG.hit;DMG.hit=function(d,b,e){const r=h0.call(this,d,b,e);return GRIT.on?GRIT.hit(r,b,e):r;};
  Object.defineProperty(SC,'lvTop',{get(){return GRIT.norm()?GRIT.lvTop:.8;},set(){},configurable:true});
  const k0=SC.hpK.bind(SC);SC.hpK=()=>{const v=k0();return GRIT.norm()&&v!=null?v*(1+(GRIT.norm()?GRIT.hkN:GRIT.hk0)+GRIT.hkS*SC.f()):v;};
  const e0=en;en=function(type,o){const e=e0(type,o||{});try{GRIT.tag(e);}catch(x){}return e;};}
{const w0=RET.asWinMs;RET.asWinMs=function(){return w0.call(this)+(GRIT.assist()?Math.round(GRIT.aWin*GRIT.aK()):0);};
  const b0=eb;eb=function(x,y,a,s,c,r){if(GRIT.assist())s*=1-GRIT.aSp*GRIT.aK();if(GRIT.norm())s*=GRIT.bsN;return b0(x,y,a,s,c,r===undefined?5:r);};}
{const h1=hurt;hurt=function(n){const b=P.hp;h1.apply(this,arguments);   // W47 mercy: on Normal a share of hull hits is absorbed (hull restored, short grace) - a human takes 4-7 hits a stage, not 9
    if(GRIT.hardBoss()&&!G.dead&&P.hp<b&&b>1){const g=GRIT.g();g.hc=(g.hc||0)+GRIT.mcH;if(g.hc>=1&&(g.hn||0)<GRIT.mcHMax){g.hc-=1;g.hn=(g.hn||0)+1;P.hp=b;P.inv=Math.max(P.inv||0,.6);GRIT.st.mercyH=(GRIT.st.mercyH||0)+1;}}   // W54: Hard (not very hard / Legend) boss fights only - a share of hull hits is absorbed, a few per run; bosses cost a dodger 8 hits in 40 s while stage 1-4 cost 8 in 126 s
    if(GRIT.norm()&&!G.dead&&P.hp<b&&b>1){const g=GRIT.g(),m=GRIT.mc0+(GRIT.mc20-GRIT.mc0)*Math.min(1,Math.max(0,(GRIT.stg()-1)/19));g.mc=(g.mc||0)+m;if(g.mc>=1&&(g.mn||0)<GRIT.mcMax){g.mc-=1;g.mn=(g.mn||0)+1;P.hp=b;P.inv=Math.max(P.inv||0,.6);GRIT.st.mercy=(GRIT.st.mercy||0)+1;}}};}
NR.on('tick',dt=>GRIT.tick(dt));
NR.on('runStart',()=>{for(const k in GRIT.st)GRIT.st[k]=0;});
window.__grit=GRIT;
