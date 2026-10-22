// PURPOSE: build pressure and real choices (default OFF)
// FLAG: build2 (OFF; ?build2=1)
// TEST: choices-test.js
/* ---------- BUILD PRESSURE + REAL CHOICES (flag RET.build2, default off for now; ?build2=1 = on). BALANCE.md "Build pressure + choices". ----------
   1. Hard tiers: a ship that hugs the back line (mean x under 125 px over ~3 s) is flanked: telegraphed lane shots from behind and drops from the top or
      bottom edge at its column. The rate grows with the power score above what the stage expects (SC.f), so a maxed ship that camps is punished and a fresh
      one barely notices. Nothing here touches hard.js's damage ceiling or armour.js's boss caps.
   2. Weapon parity: the Gravity Well pulls less (its pull, wpx.js, reads CHO.wellPull) and its orb is smaller on the hard tiers.
   3. Choices: a level-up shows 3 cards for 6 s (LEVEL UP is the default and is applied at once; another card takes the level back), the pit stop shows 3
      free cards (none taken if you leave), and some pickups drop in pairs: take one, the other vanishes. Every pick is logged (CHO.log) and fires NR 'choice'. */
if(RET.build2===undefined)RET.build2=/[?&]build2=1/.test(location.search);   // default OFF until ret-test/tutorial-test are cleared (HANDOFF); ?build2=1 = on
RET.sioKeys.push('mnr_chohint');
const CHO=window.CHO={get on(){return!!RET.build2;},open:null,log:[],stat:{n:0,rear:0,pair:0},dk:0,dash:0,wellPull:240,
  BACK:125,RATE:1.2,TELE:.6,GAP:22,SPD:300,N:5,
  DECK:[
    {id:'lv',n:'LEVEL UP',d:'+1 weapon level',only:'lvl'},
    {id:'dash',n:'QUICK DASH',d:'dash recharges 35% faster'},
    {id:'shield',n:'SHIELD',d:'+1 hull now'},
    {id:'emp',n:'EMP CELL',d:'+1 EMP charge'},
    {id:'mag',n:'MAGNET',d:'pickups come from further away'},
    {id:'mod',n:'OVERCLOCK',d:'+15% weapon damage'},
    {id:'glass',n:'GLASS CANNON',d:'+35% damage',bad:'-1 max hull',risk:1},
    {id:'gamble',n:'ALL IN',d:'+2 weapon levels',bad:'-1 hull now',risk:1}]};
CHO.hard=()=>HARDS.includes(SET.diff);
/* ---- 1. the flank: lane shots on campers ---- */
CHO.reset=function(){this.ax=P.x;this.rt=1.5;this.q=[];this.side=0;this.log=[];this.stat={n:0,rear:0,pair:0};this.dk=0;this.dash=0;this.pairs=[];this.close(true);};
NR.on('runStart',()=>CHO.reset());
CHO.tick=function(dt){
  if(!this.on||!G.live||G.dead||G.lab||G.tut||!this.hard()){this.q&&(this.q.length=0);return;}
  this.ax=(this.ax==null?P.x:this.ax)+(P.x-this.ax)*Math.min(1,dt/3);
  const f=window.SC?SC.f():0;
  if(this.ax<this.BACK&&f>.15&&G.t>5&&!(G.transT>=0)){this.rt-=dt*this.RATE*(.3+f);
    if(this.rt<=0){this.rt=1;const s=this.side++%3;   // 2 lane shots from behind, then a drop at the ship's column
      if(s<2){const y=clamp(P.y,30,H-30);this.q.push({t:this.TELE,k:'r',y});G.rings.push({x:12,y,l:this.TELE,m:this.TELE,c:'#ff2d78'});}
      else{const x=P.x,top=P.y>H/2;this.q.push({t:this.TELE,k:'s',x,top});G.rings.push({x,y:top?12:H-12,l:this.TELE,m:this.TELE,c:'#ff2d78'});}}}
  else this.rt=Math.min(1,this.rt+dt*.5);
  for(let i=this.q.length-1;i>=0;i--){const o=this.q[i];o.t-=dt;if(o.t>0)continue;this.q.splice(i,1);if(G.eb.length>140)continue;this.stat.rear++;
    if(!o.f2)this.q.push(Object.assign({},o,{t:.32,f2:1}));   // a second wall 0.32 s later: one dash does not cover both
    eb.src='flank';
    if(o.k==='r')for(let j=-this.N;j<=this.N;j++)eb(-8,o.y+j*this.GAP,0,this.SPD,BULLET,6);                                   // a closed wall of 11 (240 px) from behind on the telegraphed lane: read the ring and leave the lane
    else for(let j=-this.N;j<=this.N;j++)eb(o.x+j*this.GAP,o.top?-8:H+8,o.top?Math.PI/2:-Math.PI/2,this.SPD,BULLET,6);
    eb.src=null;}
  if(this.dash&&P.dashCd>0)P.dashCd=Math.max(0,P.dashCd-dt*this.dash);
  /* pairs: take one, the other vanishes */
  for(let i=this.pairs.length-1;i>=0;i--){const[a,b]=this.pairs[i];const pa=!!a.dead,pb=!pa&&!!b.dead;   // only a pick sets .dead (b.js)
    if(pa||pb){const o=pa?b:a;if(!o.dead){o.dead=1;burst(o.x,o.y,'#8a8aa0',6,120,.3);}this.pairs.splice(i,1);this.stat.pair++;this.note('pair',(pa?a:b).t);}
    else if(a.x<-40&&b.x<-40)this.pairs.splice(i,1);}
  if(this.on&&G.pk.length<30)for(let i=0,n=G.pk.length;i<n;i++){const p=G.pk[i];if(p._c)continue;p._c=1;
    const alt={up:'hp',hp:'emp',emp:'up'}[p.t];if(!alt||Math.random()>.35||p.pr)continue;
    const q={t:alt,x:p.x,y:clamp(p.y+(p.y>H/2?-90:90),40,H-40),vx:p.vx||0,vy:p.vy||0,bob:0,_c:1};p.pr=q;q.pr=p;G.pk.push(q);this.pairs.push([p,q]);this.hint();}
  if(this.open&&this.open.k==='lvl'&&G.t>this.open.end)this.close();};
NR.on('tick',dt=>CHO.tick(dt));
/* ---- 2. weapon parity: the Well on the hard tiers ---- */
{const f0=WPX.fire.well;WPX.fire.well=function(std,L){const n=WS.orb.length;f0.call(this,std,L);if(CHO.on&&CHO.hard()&&WS.orb.length>n){const o=WS.orb[WS.orb.length-1];o.R*=.8;}};}
Object.defineProperty(CHO,'wellPull',{get(){return this.on&&this.hard()?130:240;}});
/* ---- 3. cards ---- */
/* back-line drag (hard tiers): a ship whose mean x is behind BACK+20 (full at BACK-30) loses up to BK x its power over the stage's expectation, on its hits and on its share of
   hard.js's ceiling (S3.cap is only ever lowered here, never raised). A fresh ship (SC.f 0) and a ship up front lose nothing. */
CHO.BK=.9;CHO.backK=function(){if(!this.on||!this.hard()||!G||!G.live||this.ax==null)return 1;const bk=clamp((this.BACK+20-this.ax)/50,0,1);return 1-this.BK*bk*(window.SC?SC.f():0);};
HOOK['DMG.hit'](h=>function(d,b,e){const v=h.call(this,d,b,e);if(!CHO.on||!G||!G.live)return v;return v*(1+CHO.dk)*CHO.backK();});
if(window.S3){const c0=S3.cap;S3.cap=function(){return c0.apply(this,arguments)*Math.min(1,CHO.backK());};}
CHO.note=function(k,id){const r={k,id,t:+G.t.toFixed(1),st:ST.on?ST.n:0};this.log.push(r);this.stat.n++;NR.emit('choice',r);};
CHO.hint=function(){if(this.hinted)return;this.hinted=1;try{if(localStorage.getItem('mnr_chohint'))return;localStorage.setItem('mnr_chohint','1');}catch(e){}
  if(window.HINT&&HINT.show)HINT.show('CHOOSE: take one card or one of two pickups, the other is lost',{t:4});};
CHO.offer=function(k){if(!this.on)return null;if(this.open)this.close();
  const pool=this.DECK.filter(c=>!c.only||c.only===k),rest=pool.filter(c=>c.id!=='lv'),risky=rest.filter(c=>c.risk),safe=rest.filter(c=>!c.risk);
  const pk=a=>a.splice(Math.floor(Math.random()*a.length),1)[0],cards=[];
  if(k==='lvl')cards.push(pool.find(c=>c.id==='lv'));
  cards.push(pk(risky));while(cards.length<3)cards.push(pk(safe));if(k!=='lvl')cards.push(cards.shift());
  this.open={k,cards,end:G.t+6,snap:k==='lvl'?{lv:Object.assign({},WP.lv),emp:P.emp}:null};this.ui();this.hint();return cards;};
CHO.apply=function(id){switch(id){
  case'lv':break;
  case'dash':this.dash+=.35;break;
  case'shield':P.max=Math.max(P.max,P.hp+1);P.hp=Math.min(P.max,P.hp+1);break;
  case'emp':P.emp=Math.min(3,P.emp+1);break;
  case'mag':NR.mod.mag=Math.round(NR.mod.mag*1.4);break;
  case'mod':this.dk+=.15;break;
  case'glass':this.dk+=.35;P.max=Math.max(2,P.max-1);P.hp=Math.min(P.hp,P.max);break;
  case'gamble':{const g=WP.gain;CHO.inGain=1;try{g.call(WP);g.call(WP);}finally{CHO.inGain=0;}if(P.hp>1)P.hp--;break;}}
  if(id!=='lv')floater(P.x,P.y-30,this.DECK.find(c=>c.id===id).n,'#3dffb0');};
CHO.pick=function(i){const o=this.open;if(!o)return;const c=o.cards[Math.max(0,Math.min(o.cards.length-1,i|0))];
  if(o.snap&&c.id!=='lv'){WP.lv=o.snap.lv;P.emp=o.snap.emp;try{WP.sync();}catch(e){}}   // another card than LEVEL UP takes back the level given at pickup
  this.open=null;this.ui();this.apply(c.id);this.note(o.k,c.id);};
CHO.close=function(quiet){if(!this.open)return;const o=this.open;this.open=null;this.ui();if(!quiet&&o.k==='lvl')this.note('lvl','lv');};
{const g0=WP.gain;WP.gain=function(){const r=g0.apply(this,arguments);if(CHO.on&&!CHO.inGain&&G.live&&!G.tut&&!G.lab&&!CHO.open)CHO.offer('lvl');return r;};}
NR.on('pitStart',()=>{if(CHO.on&&G.live)CHO.offer('pit');});
{const c0=SH.close;SH.close=function(){if(CHO.open&&CHO.open.k==='pit')CHO.close(true);return c0.apply(this,arguments);};}
CHO.ui=function(){let el=document.getElementById('choL');
  if(!el){el=document.createElement('div');el.id='choL';el.style.cssText='position:fixed;left:50%;bottom:10px;transform:translateX(-50%);z-index:60;display:none;gap:8px;width:min(96vw,620px);font-family:inherit';
    document.body.appendChild(el);
    addEventListener('keydown',e=>{if(CHO.open&&/^[123]$/.test(e.key)){CHO.pick(+e.key-1);e.preventDefault();}});}
  const o=this.open;if(!o){el.style.display='none';el.innerHTML='';return;}
  el.style.display='flex';el.innerHTML='';
  o.cards.forEach((c,i)=>{const b=document.createElement('button');
    b.style.cssText='flex:1 1 0;min-width:44px;min-height:64px;padding:6px 6px;border-radius:10px;border:2px solid '+(c.risk?'#ff2d78':i===0&&o.k==='lvl'?'#3dffb0':'#5ad1ff')+';background:rgba(10,8,24,.92);color:#fff;font-size:14px;line-height:1.2;cursor:pointer;touch-action:manipulation';
    const t=document.createElement('div');t.textContent=(i+1)+' '+c.n;t.style.cssText='font-size:15px;font-weight:700';
    const d=document.createElement('div');d.textContent=c.d;d.style.cssText='font-size:14px;opacity:.9';b.append(t,d);
    if(c.bad){const x=document.createElement('div');x.textContent=c.bad;x.style.cssText='font-size:14px;color:#ff7aa8';b.append(x);}
    b.addEventListener('pointerdown',e=>{e.stopPropagation();e.preventDefault();CHO.pick(i);});el.appendChild(b);});};
