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
const GRIT=window.GRIT={get on(){return!!RET.grit&&!(typeof G==='object'&&G&&(G.tut||G.lab));},
  rate0:1/50,burst:.25,stK:.03,maxK:4,hk0:.3,hkS:.5,lvTop:.62,from:3,
  st:{charges:0,gain:0,kill:0,fod:0,spec:0},
  fkM:{},fk0:1.3,fkEnd:1.1,fkA:10,fkB:20,   // on-screen floor x1.3 to stage 10, tapering to x1.1 at stage 20 (humanbot.js: median life 2.4 -> 3.0 s; a flat x1.3 cost the stage-20 oracle dodger 20-30 points)
  fk(e){const k=this.fkM[e.type]||this.fk0,s=this.stg();return s<=this.fkA?k:1+(k-1)*Math.max(0,1-(1-(this.fkEnd-1)/Math.max(.001,k-1))*Math.min(1,(s-this.fkA)/(this.fkB-this.fkA)));},
  norm(){return this.on&&SET.diff==='normal';},
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
  tag(e){if(!this.on||SET.diff==='easy'||e.mini||e.type==='boss'||this.stg()<this.from||this.alive()>=this.maxK)return;const r=this.rnd(),t=e.type;let k='';
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
  draw(){if(!this.on||!G||G.dead)return;ctx.save();
    for(const e of G.en){if(!e.gk||e.hp<=0||e.x<-20||e.x>W+20)continue;const r=e.r+6,t=G.t;
      if(e.gk==='plate'){ctx.strokeStyle='#e8f4ff';ctx.lineWidth=5;ctx.beginPath();ctx.arc(e.x,e.y,r,Math.PI*.62,Math.PI*1.38);ctx.stroke();ctx.strokeStyle='#7a8fa6';ctx.lineWidth=2;ctx.stroke();}
      else if(e.gk==='shield'&&e.gs>0){ctx.globalAlpha=.4+.5*Math.min(1,e.gs/(e.max*.7))+(e.gsf>0?.3:0);ctx.strokeStyle='#19e3ff';ctx.lineWidth=2.5;ctx.setLineDash([6,4]);ctx.beginPath();ctx.arc(e.x,e.y,r+2,0,7);ctx.stroke();ctx.setLineDash([]);}
      else if(e.gk==='med'){const p=.6+.4*Math.sin(t*6);ctx.globalAlpha=p;ctx.fillStyle='#3dff7a';ctx.fillRect(e.x-2,e.y-r-12,4,12);ctx.fillRect(e.x-6,e.y-r-8,12,4);ctx.globalAlpha=.15;ctx.strokeStyle='#3dff7a';ctx.beginPath();ctx.arc(e.x,e.y,230,0,7);ctx.stroke();}
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
  const k0=SC.hpK.bind(SC);SC.hpK=()=>{const v=k0();return GRIT.norm()&&v!=null?v*(1+GRIT.hk0+GRIT.hkS*SC.f()):v;};
  const e0=en;en=function(type,o){const e=e0(type,o||{});try{GRIT.tag(e);}catch(x){}return e;};}
NR.on('tick',dt=>GRIT.tick(dt));
NR.on('runStart',()=>{for(const k in GRIT.st)GRIT.st[k]=0;});
window.__grit=GRIT;
