/* ---------- Neon + pit stop: after every district a 10 s shop, upgrades stack for the rest of the run ---------- */
const UPG=[
  {id:'fr',n:'Rapid Fire',t:'Extra off-beat shots',p:28,max:5,c:'#ffe14d',ic:'M3 5l9 7-9 7zM12 5l9 7-9 7z'},
  {id:'dc',n:'Spare Dash',t:'+1 dash charge',p:34,max:5,c:'#19e3ff',ic:'M2 10h11V5l9 7-9 7v-5H2z'},
  {id:'mg',n:'Magnet',t:'Pickups fly to you from farther',p:20,max:5,c:'#3dffb0',ic:'M5 3h5v9a2 2 0 004 0V3h5v9a7 7 0 01-14 0z'},
  {id:'sh',n:'Shield',t:'Absorbs the next hit',p:38,max:5,c:'#19e3ff',ic:'M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5z'},
  {id:'lp',n:'Long Power',t:'Power-ups last 30% longer',p:26,max:5,c:'#ff2d95',ic:'M13 2L4 14h6l-1 8 9-12h-6z',ok:()=>!!NR.timed},
  {id:'wd',n:'Wide Beat',t:'On-beat window 14 ms wider',p:26,max:5,c:'#ffe14d',ic:'M2 12l5-5v3h10V7l5 5-5 5v-3H7v3z'},
  {id:'hm',n:'Homing',t:'Shots curve toward enemies',p:38,max:5,c:'#ff2d95',ic:'M12 2a10 10 0 100 20 10 10 0 000-20zm0 3a7 7 0 110 14 7 7 0 010-14zm0 4a3 3 0 100 6 3 3 0 000-6z'},
  {id:'ck',n:'Tier Keeper',t:'Tier lasts 4 beats longer',p:22,max:5,c:'#ffb020',ic:'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z'},
  // extras: only in the pool once bought in the garage
  {id:'db',n:'Dash Blast',t:'Dashing hurts enemies you pass',p:34,max:5,c:'#ff5a3d',x:'up_db',ic:'M12 1l2.5 7.5L22 12l-7.5 2.5L12 23l-2.5-8.5L2 12l7.5-3.5z'},
  {id:'sb',n:'Sharp Beat',t:'Gold pulse shots hit 30% harder',p:28,max:5,c:'#ffe14d',x:'up_sb',ic:'M12 1l9 11-9 11L3 12z'},
  {id:'nx',n:'Neon Boost',t:'Kills drop 30% more Neon',p:22,max:5,c:'#19e3ff',x:'up_nx',ic:'M12 2l8.5 5v10L12 22l-8.5-5V7z'}];
const UBY={};for(const u of UPG)UBY[u.id]=u;
const PIT_SECS=10,PIT_LOCK=.6;
const NEON_K=.032;                                         // Neon per kill: districts last as long as their song now (3 to 5 minutes), so a kill pays much less than it did
const NEON_V={drone:.5,charger:.5,turret:1,gate:1,gunship:3,boss:8};     // fractions add up: about 40 Neon from a first district
const p2d={};const path2=d=>p2d[d]||(p2d[d]=new Path2D(d));

const SH={UPG,nk:NEON_K,neon:0,earned:0,spent:0,got:{},order:[],active:false,cb:null,left:0,lock:0,cards:[],rerolls:0,live:false,flash:0,
  ck:0,hm:0,sharp:1,nx:1,spare:0,dmax:0,sh:0,db:0,dashId:0,wasDash:false,tk:false,prevCur:-1,rch:0,picks:0,pits:0,
  reset(){if(this.live)this.bankRun(true);
    this.pitLog=[];this.neon=0;this.earned=0;this.acc=0;this.spent=0;this.got={};this.order=[];this.active=false;this.cb=null;this.rerolls=0;this.picks=0;this.pits=0;this.live=false;this.flash=0;
    this.sh=0;this.spare=0;this.rch=0;this.prevCur=-1;this.tk=false;this.ship=GA.ship;this.recalc();shopEl.hidden=true;},
  n(id){return this.got[id]||0;},
  recalc(){const n=id=>this.n(id);
    NR.mod.mag=140+70*n('mg');NR.mod.win=14*n('wd');NR.mod.pw=1+.3*n('lp');
    this.ck=4*n('ck');this.hm=n('hm');this.sharp=1+.3*n('sb');this.nx=1+.3*n('nx');this.dmax=n('dc');this.db=n('db');this.fr=Math.pow(.8,n('fr'));},
  // ----- Neon -----
  award(e,keep){if(!this.live)return;let v=NEON_V[e.type]||.5;if(e.pf)v*=1.5;v+=Math.min(3,tierOf(C.n)-1);this.acc=(this.acc||0)+v*this.nx*NEON_K;   // on-beat kills pay 1.5x, combos add up to +3
    const n=Math.floor(this.acc);if(n<1)return;this.acc-=n;this.neon+=n;this.earned+=n;this.flash=.35;if(n>=3)floater(e.x+14,e.y+8,'+'+n+' NEON','#19e3ff');},
  bankRun(quiet){if(!this.live)return 0;this.live=false;const add=this.neon+Math.round(this.earned*.3);GA.bank+=add;GA.runs++;gsave();this.lastBank=add;this.lastTotal=GA.bank;
    if(!quiet)NR.emit('banked',add);return add;},
  // ----- pit stop -----
  price(u){return Math.round(1.25*u.p*(1+.5*this.n(u.id)));},
  rerollPrice(){return 8+6*this.rerolls;},
  pool(){return UPG.filter(u=>this.n(u.id)<u.max&&(!u.x||GA.own[u.x])&&(!u.ok||u.ok()));},
  deal(){const pool=this.pool(),out=[];while(out.length<3&&pool.length){out.push(pool.splice(Math.floor(Math.random()*pool.length),1)[0]);}
    this.cards=out.map(u=>({u,sold:false}));},
  pit(cb){if(!this.live){cb();return;}                                   // attract / no live run: no shop
    this.pits++;this.pitLog.push(this.neon);this.cb=cb;this.active=true;this.left=PIT_SECS;this.lock=PIT_LOCK;this.rerolls=0;this.deal();touch=null;touchFire=false;pressed={};
    this.msg('');this.draw();shopEl.hidden=false;syncUI();NR.emit('pitStart',this.pits);},
  close(){if(!this.active)return;this.active=false;shopEl.hidden=true;syncUI();const cb=this.cb;this.cb=null;if(cb)cb();},
  tick(dt){pressed={};this.left-=dt;this.lock=Math.max(0,this.lock-dt);this.flash=Math.max(0,this.flash-dt);
    const pq=((typeof PUL==='number'?PUL:0)*5|0)/5;if(pq!==this.pq){this.pq=pq;shopEl.style.setProperty('--pul',pq.toFixed(1));}   // 6 glow steps, not a new blurred shadow every frame
    const bw=Math.round(Math.max(0,this.left/PIT_SECS*200))/2,sc=Math.max(0,Math.ceil(this.left));if(bw!==this.bw){this.bw=bw;$('shBar').style.width=bw+'%';}if(sc!==this.sc){this.sc=sc;$('shSec').textContent=sc;}
    if(this.left<=0)this.close();},
  buy(i){if(!this.active||this.lock>0)return false;const c=this.cards[i];if(!c||c.sold)return false;const pr=this.price(c.u);
    if(this.neon<pr){this.msg('Need '+(pr-this.neon)+' more Neon');const el=$('shCards').children[i];if(el){el.classList.remove('shake');void el.offsetWidth;el.classList.add('shake');}return false;}
    this.neon-=pr;this.spent+=pr;this.picks++;c.sold=true;this.add(c.u.id);AU.sfx('up');this.msg(c.u.n+' fitted');this.draw();
    if(this.cards.every(x=>x.sold))setTimeout(()=>{if(this.active&&this.cards.every(x=>x.sold))this.close();},900);
    return true;},
  add(id){this.got[id]=this.n(id)+1;if(!this.order.includes(id))this.order.push(id);
    if(id==='sh')this.sh++;if(id==='dc')this.spare=Math.min(this.dmax+1,this.spare+1);this.recalc();},
  reroll(){if(!this.active||this.lock>0)return false;const pr=this.rerollPrice();
    if(this.neon<pr){this.msg('Need '+(pr-this.neon)+' more Neon');return false;}
    this.neon-=pr;this.spent+=pr;this.rerolls++;this.deal();this.msg('');this.draw();return true;},
  msg(t){$('shMsg').textContent=t;},
  draw(){const box=$('shCards');box.innerHTML='';
    this.cards.forEach((c,i)=>{const u=c.u,pr=this.price(u),b=document.createElement('button');b.type='button';
      b.className='card'+(c.sold?' sold':this.neon<pr?' no':'');b.style.setProperty('--c',u.c);b.dataset.id=u.id;
      b.innerHTML=svgI(u.ic)+`<div class="tx"><div class="n">${u.n}</div><div class="t">${u.t}</div></div><div class="pr">${c.sold?'FITTED':neonI+' '+pr}</div>`;
      b.addEventListener('click',()=>this.buy(i));box.appendChild(b);});
    $('shN').textContent=this.neon;$('shRe').innerHTML='REROLL '+neonI+' '+this.rerollPrice();$('shRe').classList.toggle('dim',this.neon<this.rerollPrice());
    $('shGo').textContent=this.picks?'GO':'SKIP';
    $('shOwn').innerHTML=this.order.length?this.order.map(id=>{const u=UBY[id];return `<span style="--c:${u.c}">${svgI(u.ic)}${this.n(id)>1?'×'+this.n(id):''}</span>`;}).join(''):'<span style="color:var(--dim)">No upgrades yet</span>';},
  // ----- during the run -----
  upd(sdt){                                                               // once per frame at the end of update
    if(this.spare<this.dmax){this.rch+=sdt;if(this.rch>=5){this.rch=0;this.spare++;}}else this.rch=0;
    const g=this.ship==='tri'?1/3:this.ship==='hv'?2:0;
    if(g){const cur=Math.floor(G.bp/g);this.tk=cur!==this.prevCur&&this.prevCur!==-1;this.prevCur=cur;}else this.tk=true;
    const dn=P.dashT>0;if(dn&&!this.wasDash)this.dashId++;this.wasDash=dn;
    if(dn&&this.db){const dm=5*this.db;for(const e of G.en){if(e.dashHit===this.dashId||e.hp<=0)continue;if(Math.hypot(P.x-e.x,P.y-e.y)<e.r+34){e.dashHit=this.dashId;e.hp-=dm;e.flash=.12;burst(e.x,e.y,'#ff5a3d',8,200,.35);AU.sfx('hit');}}}},
  absorb(){if(this.sh>0){this.sh--;P.inv=1.3;shake(8);G.flash=Math.max(G.flash,.12*FX());burst(P.x,P.y,'#19e3ff',26,320,.5);floater(P.x,P.y-24,'SHIELD','#19e3ff');AU.sfx('hurt');
      return true;}return false;},
  steer(b,dt,k){k=k||this.hm;let best=null,bd=1e9;for(const e of G.en){if(e.type==='gate'||e.hp<=0||e.x<b.x-10||e.x>W+10)continue;const d=Math.hypot(e.x-b.x,e.y-b.y);if(d<bd&&d<420){bd=d;best=e;}}
    if(!best)return;const sp=Math.hypot(b.vx,b.vy),cur=Math.atan2(b.vy,b.vx);let want=Math.atan2(best.y-b.y,best.x-b.x)-cur;want=Math.atan2(Math.sin(want),Math.cos(want));
    const a=cur+clamp(want,-dt*2.2*k,dt*2.2*k);b.vx=Math.cos(a)*sp;b.vy=Math.sin(a)*sp;},
  // ----- weapon rhythms: the garage ships -----
  // the grid the ship shoots on, in beats: Courier a 16th, Echo an 8th, Triplet a third of a beat, Heavy every second beat
  cellOn(cell){return true;},                                              // a ship may skip grid cells (Syncopator)
  gridStep(){const s=this.ship;return s==='tri'?1/3:s==='hv'?2:s==='ec'?1/2:1/4;},
  // damage per shot makes up for the grid being slower than the old free-running fire (same damage per second at every tempo)
  dmk(){const s=this.ship,old=Math.max(.09,BT.spb/6);return s==='std'?Math.min(2,this.gridStep()*BT.spb/old):s==='ec'?Math.min(2,this.gridStep()*BT.spb/Math.max(.12,old*2)):1;},
  shot(){const s=this.ship,sec=this.gridStep()*BT.spb,cd0=Math.max(.09,BT.spb/6);       // heat per shot follows the interval, so heat per second stays about the same for every ship
    return{heat:s==='hv'?6:.7*1.65*sec/cd0};},
  extra(cell,gs){const n=this.n('fr');if(!n||this.ship==='hv')return;                                  // Rapid Fire: an extra shot half a cell later, so it lands off the grid; LV4 and LV5 add a quarter-cell shot each
    const go=t=>G.delayed.push({t:gs*BT.spb*t,f:()=>{if(G.dead||!running||P.over)return;this.volley(P.x+22,P.y+2,0);}});
    if(!(cell%(n===1?4:n===2?2:1)))go(.5);if(n>=4)go(.25);if(n>=5)go(.75);},
  volley(x,y,pf){const s=this.ship;
    const mk=(xx,yy,dm,ec)=>{const std=(vx,vy,d,o)=>G.pb.push(Object.assign({x:xx,y:yy,vx,vy,dm:d*dm*this.dmk(),pf,ec},o));
      std(900,0,1,{y:yy-5});std(900,0,1,{y:yy+5});WP.shots(std,pf);
      if(s==='tri'){std(900,-80,1);std(900,80,1);}};
    if(s==='hv'){G.pb.push({x,y,vx:780,vy:0,dm:14+4*(P.wl-1),pf,big:1,hv:1,rad:12,px:new Set()});return;}
    mk(x,y,1,0);
    if(s==='ec'){G.delayed.push({t:BT.spb,f:()=>{if(G.dead||!running)return;mk(P.x+22,P.y+2,.8,1);AU.sfx('shot');}});}},
  // ----- HUD (canvas): Neon counter, upgrade icons, shield / dash pips -----
  ring(c,t){if(this.sh>0&&!G.dead){c.save();c.strokeStyle='#19e3ff';c.globalAlpha=.55+.25*Math.sin(t*6);c.lineWidth=2;c.beginPath();c.arc(P.x,P.y,26,0,7);c.stroke();c.restore();}},
  // L: where the pieces go (landscape default or the portrait HUD)
  hud(c,t,L){L=L||{nx:24,ny:57,dx:214,dy:H-30,sx:18,sy:H-34,ring:true};const f=this.flash>0?1+this.flash:1,k=L.k||1;
    c.save();c.translate(L.nx,L.ny);c.scale(.5*f*k,.5*f*k);c.translate(-12,-12);c.fillStyle='#19e3ff';c.fill(path2(NEON_D));c.restore();
    c.save();c.font=`700 ${Math.round(13*f*k)}px "Share Tech Mono",monospace`;c.fillStyle=this.flash>0?'#ffffff':'#19e3ff';c.textAlign='left';c.fillText(String(this.neon),L.nx+10*k,L.ny+5*k);
    let x=L.nx+(10+String(this.neon).length*8+10)*k;
    for(const id of this.order){const u=UBY[id];c.save();c.translate(x,L.ny-7*k);c.scale(.55*k,.55*k);c.fillStyle=u.c;c.fill(path2(u.ic),'evenodd');c.restore();
      if(this.n(id)>1){c.font=`${Math.round(10*k)}px "Share Tech Mono",monospace`;c.fillStyle='#fff';c.fillText(this.n(id),x+14*k,L.ny+5*k);}x+=(this.n(id)>1?25:19)*k;}
    c.restore();
    if(L.ring)this.ring(c,t);
    if(this.dmax){c.save();c.fillStyle='#19e3ff';for(let i=0;i<this.dmax;i++){c.globalAlpha=i<this.spare?1:.2;c.fillRect(L.dx+i*10*k,L.dy,7*k,3*k);}c.restore();}
    if(this.sh>0){c.save();c.fillStyle='#19e3ff';c.font=`${Math.round(11*k)}px "Share Tech Mono",monospace`;c.fillText('SHIELD'+(this.sh>1?' ×'+this.sh:''),L.sx,L.sy);c.restore();}
    HUDLOG.sh=this.sh;HUDLOG.spare=this.spare;}
};
NR.on('kill',d=>SH.award(d.e));
NR.on('districtEnd',()=>{if(SH.live){SH.neon+=5;SH.earned+=5;SH.flash=.5;}});
NR.on('runStart',()=>{SH.live=true;SH.neon=0;SH.earned=0;const sd=shipDef();if(sd.id!=='std'&&G.live)G.note={t:4,txt:sd.n+' ready'};});
NR.on('runEnd',()=>{if(SH.active){SH.active=false;shopEl.hidden=true;}const add=SH.bankRun();const el=$('oNeon');if(el)el.innerHTML=add?'Banked '+neonI+' <strong>+'+add+'</strong> · garage '+GA.bank:'Banked nothing';gaDraw();});

/* ----- the pit-stop screen ----- */
const shopEl=document.createElement('div');shopEl.id='shop';shopEl.className='ov solid pg';shopEl.hidden=true;
shopEl.innerHTML='<div class="top"><span class="ttl">PIT STOP</span><span class="neon" id="shNeon">'+neonI+' <b id="shN">0</b></span><div class="bar"><i id="shBar"></i></div><span class="neon" id="shSec" style="min-width:1.4em;text-align:right">10</span></div>'
  +'<div class="cards" id="shCards"></div><div class="own" id="shOwn"></div><div class="msg" id="shMsg"></div>'
  +'<div class="bot"><button class="go dim" id="shRe" type="button">REROLL</button><button class="go alt" id="shGo" type="button">SKIP</button></div>';
stage.appendChild(shopEl);
$('shRe').addEventListener('click',()=>SH.reroll());
$('shGo').addEventListener('click',()=>{if(SH.lock<=0)SH.close();});
addEventListener('keydown',e=>{if(!SH.active)return;if(e.code==='Digit1'||e.code==='Digit2'||e.code==='Digit3'){SH.buy(+e.code.slice(5)-1);e.preventDefault();}
  else if(e.code==='KeyR')SH.reroll();else if(e.code==='Enter'||e.code==='Space'){if(SH.lock<=0)SH.close();e.preventDefault();}});
// "banked" line on the game-over screen
{const d=document.createElement('div');d.className='stat';d.id='oNeon';$('oBest').after(d);}
