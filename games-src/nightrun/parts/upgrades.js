/* ---------- much more to buy: permanent TUNE perks in the garage (levels, scaling prices, a recommended pick), more pit-stop upgrades, five new power-ups
   that can be bought into the drop pool, and "you can afford N upgrades" prompts. Everything hooks in from here (wrappers), the shop/garage files stay as they were. ---------- */
const RGN=[50,44,38,33,28,24];                                   // seconds per shield for Shield Regen levels 1 to 6
const TP_DEF=[
  {id:'dmg',n:'Power Core',   p:45, max:12,c:'#ff5a3d',pri:90,ic:'M13 2L4 14h6l-1 8 9-12h-6z',                                 t:l=>'+'+8*l+'% shot damage'},
  {id:'rof',n:'Rapid Coil',   p:55, max:12, c:'#ffe14d',pri:80,ic:'M3 5l9 7-9 7zM12 5l9 7-9 7z',                                 t:l=>'+'+2.5*l+'% double shots'},
  {id:'shd',n:'Shield Plating',p:120,max:5, c:'#19e3ff',pri:95,ic:'M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5z',                  t:l=>'Start with '+l+' shield'+(l>1?'s':'')},
  {id:'rgn',n:'Shield Regen', p:150,max:6, c:'#19e3ff',pri:70,ic:'M12 4a8 8 0 106.3 3L21 4v7h-7l2.6-2.6A5.5 5.5 0 1012 17.5V20a8 8 0 010-16z',t:l=>'A shield every '+RGN[l-1]+' s'},
  {id:'hul',n:'Hull Plating', p:200,max:5, c:'#3dffb0',pri:100,ic:'M12 21s-8-5.5-8-11a4.5 4.5 0 018-2.8A4.5 4.5 0 0120 10c0 5.5-8 11-8 11z',t:l=>'+'+l+' max hull (now '+(5+l)+')'},
  {id:'dsh',n:'Dash Capacitor',p:130,max:5, c:'#19e3ff',pri:75,ic:'M2 10h11V5l9 7-9 7v-5H2z',                                  t:l=>'+'+l+' dash charge'+(l>1?'s':'')},
  {id:'mag',n:'Magnet Coil',  p:35, max:10,c:'#3dffb0',pri:40,ic:'M5 3h5v9a2 2 0 004 0V3h5v9a7 7 0 01-14 0z',                    t:l=>'+'+20*l+'% pickup range'},
  {id:'ckp',n:'Combo Keeper', p:50, max:10,c:'#ffb020',pri:65,ic:'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z',            t:l=>'Tier lasts +'+2*l+' beats'},
  {id:'pwd',n:'Power Amp',    p:80, max:10,c:'#ff2d95',pri:60,ic:'M12 2l3 7 7 .8-5.3 4.7 1.6 7.2L12 18l-6.3 3.7 1.6-7.2L2 9.8 9 9z',t:l=>'Power-ups last +'+10*l+'%'},
  {id:'crt',n:'Critical Core',p:60, max:12,c:'#ff5a3d',pri:62,ic:'M12 1l2.5 7.5L22 12l-7.5 2.5L12 23l-2.5-8.5L2 12l7.5-3.5z',     t:l=>l*2.5+'% shots hit 3x'},
  {id:'drn',n:'Wingman Drone',p:260,max:3, c:'#c08aff',pri:85,ic:'M12 3l7 9-7 9-7-9zM12 8l-3 4 3 4 3-4z',                        t:l=>l+' drone'+(l>1?'s':'')+' fire with you'},
  {id:'rev',n:'Revive Token', p:400,max:5, c:'#ff2d95',pri:92,ic:'M12 2a10 10 0 100 20 10 10 0 000-20zm1 5v4h4v2h-4v4h-2v-4H7v-2h4V7z',t:l=>'Return from '+l+' death'+(l>1?'s':'')+' per run'},
  {id:'nmn',n:'Neon Mining',  p:70, max:12,c:'#19e3ff',pri:35,ic:'M12 2l8.5 5v10L12 22l-8.5-5V7z',                                 t:l=>'+'+5*l+'% Neon from kills'}];
const TP_BY={};for(const d of TP_DEF)TP_BY[d.id]=d;
const tpPrice=(d,l)=>Math.round(1.5*d.p*(1+.6*l+.12*l*l)/5)*5;                  // price of level l+1: 45, 80, 120, 175 ... 1,000 (Power Core), a full garage costs about 60,000 Neon: many runs
const TP={revLeft:0,rgnT:0,boost:{},
  raw(id){const v=Math.floor(+GA.tune[id])||0;return Math.max(0,Math.min(TP_BY[id].max,v));},                 // the level you own
  l(id){return GA.eqAll||(GA.eq&&GA.eq[id])?this.raw(id):0;}};                                                       // the level that counts: only equipped perks work (see LOADOUT)
GA.tune={};{const o=load('mnr_tune',{});if(o&&typeof o==='object'&&!Array.isArray(o))for(const d of TP_DEF)if(isFinite(o[d.id]))GA.tune[d.id]=Math.max(0,Math.min(d.max,Math.floor(o[d.id])));}
const tsave=()=>save('mnr_tune',GA.tune);
/* LOADOUT: only EQUIPPED perks work. Slots: 4, +1 per 15 story stars (up to 8). Existing players start with their best perks equipped. */
GA.eq={};{const o=load('mnr_eq',null);if(o&&typeof o==='object'){for(const d of TP_DEF)GA.eq[d.id]=!!o[d.id];}
  else{const own=TP_DEF.filter(d=>(GA.tune[d.id]|0)>0).sort((a,b)=>b.pri-a.pri);for(const d of own.slice(0,4))GA.eq[d.id]=true;}}
const eqsave=()=>save('mnr_eq',GA.eq);
const eqSlots=()=>4+Math.min(4,Math.floor((typeof ST!=='undefined'&&ST.totalStars?ST.totalStars():0)/15));
const eqCount=()=>TP_DEF.filter(d=>GA.eq[d.id]&&(GA.tune[d.id]|0)>0).length;
GA.tab='tune';

/* ----- pit-stop upgrades (this run only), more levels and the same themes as the perks ----- */
UBY.lp.ok=null;                                              // Long Power works now (power-ups are 50% longer per level, see PW.give below)
const NEWU=[
  {id:'dm',n:'Overcharge',  t:'+12% shot damage',        p:30,max:5,c:'#ff5a3d',ic:TP_BY.dmg.ic},
  {id:'cr',n:'Crit Chip',   t:'+5% chance of a 3x hit',  p:32,max:5,c:'#ff5a3d',ic:TP_BY.crt.ic},
  {id:'hl',n:'Hull Patch',  t:'Repair 1 hull now',       p:30,max:5,c:'#3dffb0',ic:TP_BY.hul.ic,ok:()=>P&&P.hp<P.max},
  {id:'mh',n:'Hull Plating',t:'+1 max hull, repaired',   p:60,max:3,c:'#3dffb0',ic:TP_BY.hul.ic},
  {id:'dr',n:'Drone',       t:'A wingman fires with you',p:50,max:3,c:'#c08aff',ic:TP_BY.drn.ic},
  {id:'rv',n:'Revive Token',t:'Come back once',          p:90,max:3,c:'#ff2d95',ic:TP_BY.rev.ic}];
for(const u of NEWU){SH.UPG.push(u);UBY[u.id]=u;}
/* ----- effects (all through wrappers) ----- */
const tpDmg=()=>Math.min(2.1,1+.08*TP.l('dmg')+.12*SH.n('dm'));   // stacking cap: damage perks together never more than x2.1
const DRONE_CAP=3,DOUBLE_CAP=.3,CRIT_CAP=.3;
const tpCrit=()=>Math.min(CRIT_CAP,.025*TP.l('crt')+.05*SH.n('cr'));
const tpDouble=()=>Math.min(DOUBLE_CAP,.025*TP.l('rof'));
const tpDrones=()=>Math.min(DRONE_CAP,TP.l('drn')+SH.n('dr'));
{const rc=SH.recalc;SH.recalc=function(){rc.call(this);
    NR.mod.mag+=28*TP.l('mag');NR.mod.pw+=.1*TP.l('pwd');this.ck+=2*TP.l('ckp');this.dmax+=TP.l('dsh');this.nx*=1+.05*TP.l('nmn');
    TP.mag0=NR.mod.mag;TP.nx0=this.nx;};
  const add=SH.add;SH.add=function(id){add.call(this,id);
    if(id==='hl'&&P)P.hp=Math.min(P.max,P.hp+1);
    if(id==='mh'&&P){P.max++;P.hp=Math.min(P.max,P.hp+1);}
    if(id==='rv')TP.revLeft++;};
  const vol=SH.volley;                                        // damage, crits and double shots on every volley the ship fires
  const boost=n0=>{const dm=tpDmg(),pc=tpCrit();for(let i=n0;i<G.pb.length;i++){const b=G.pb[i];b.dm*=dm;if(pc&&Math.random()<pc){b.dm*=3;b.crit=1;if(!b.big&&!b.hv)b.big=1;}}};
  SH.volley=function(x,y,pf){const n0=G.pb.length;vol.call(this,x,y,pf);boost(n0);
    const dd=tpDouble();if(dd&&Math.random()<dd)G.delayed.push({t:.07,f:()=>{if(G.dead||!running||P.over)return;const m=G.pb.length;vol.call(SH,P.x+22,P.y+2,0);boost(m);}});};
  const hurt0=hurt;hurt=function(){if(PW.on('bub')){if(P.inv<=0){P.inv=.0;}if(!TP.bt||performance.now()-TP.bt>400){TP.bt=performance.now();burst(P.x,P.y,'#3dffb0',10,220,.3);AU.sfx('graze');}return;}hurt0();};
  const die0=die;die=function(){if(TP.revLeft>0&&!G.dead){TP.revLeft--;P.hp=Math.max(2,Math.ceil(P.max/2));P.inv=3;G.eb=[];G.flash=Math.max(G.flash,.5*FX());shake(14);
      burst(P.x,P.y,'#ff2d95',30,380,.6);G.rings.push({x:P.x,y:P.y,l:.7,m:.7,c:'#ff2d95'});floater(P.x,P.y-28,'REVIVED','#ff2d95');AU.sfx('up');return;}die0();};}
NR.on('runStart',()=>{TP.revLeft=TP.l('rev');TP.rgnT=0;TP.dn=0;TP.drones=[];
  const h=TP.l('hul');if(h){P.max=5+h;P.hp=Math.min(P.max,P.hp+h);}
  SH.sh+=TP.l('shd');SH.spare=Math.max(SH.spare,SH.dmax);});
NR.on('tick',dt=>{if(!G.live||G.dead)return;
  const r=TP.l('rgn');if(r){const cap=1+TP.l('shd');if(SH.sh<cap){TP.rgnT+=dt;if(TP.rgnT>=RGN[r-1]){TP.rgnT=0;SH.sh++;floater(P.x,P.y-28,'SHIELD READY','#19e3ff');AU.sfx('up');}}else TP.rgnT=0;}
  if(PW.on('bub'))P.inv=Math.min(P.inv,0);
  NR.mod.mag=PW.on('mag')?1500:TP.mag0;SH.nx=TP.nx0*(PW.on('nr')?2:1);
  const n=tpDrones(),ds=TP.drones;while(ds.length<n)ds.push({x:P.x,y:P.y});ds.length=n;      // drones follow the ship loosely
  const offs=[[-14,-38],[-14,38],[-44,0],[-34,-72],[-34,72]];ds.forEach((d,i)=>{d.x+=(P.x+offs[i][0]-d.x)*Math.min(1,dt*8);d.y+=(P.y+offs[i][1]-d.y)*Math.min(1,dt*8);});});
NR.on('fire',f=>{const ds=TP.drones;if(ds&&ds.length&&((TP.dn=(TP.dn||0)+1)%2===0)){const dm=tpDmg()*.7;for(const d of ds)G.pb.push({x:d.x+12,y:d.y,vx:900,vy:0,dm,pf:0,dr:1});}
  if(PW.on('tri')){G.pb.push({x:f.x,y:f.y-8,vx:860,vy:-170,dm:.8*tpDmg(),pf:0},{x:f.x,y:f.y+8,vx:860,vy:170,dm:.8*tpDmg(),pf:0});}});

/* ----- new power-ups: bought in the garage (CREW tab), then they drop like the others ----- */
Object.assign(PWK,{
  mag:{n:'MAGNET STORM',tip:'Pulls in every pickup',c:'#3dffb0',bars:8,w:2,need:'pu_mag'},
  bub:{n:'BUBBLE',tip:'Hits bounce off',c:'#7dffd8',bars:2,w:2,need:'pu_bub'},
  tri:{n:'TRIPLE SHOT',tip:'Two extra side shots',c:'#ff8a3d',bars:6,w:2,need:'pu_tri'},
  nr:{n:'NEON RAIN',tip:'Kills pay double Neon',c:'#19e3ff',bars:8,w:2,need:'pu_nr'},
  fix:{n:'REPAIR',tip:'Hull +1 at once',c:'#3dffb0',bars:0,w:2,need:'pu_fix'}});
{const pick=PW.pick;PW.pick=function(){const s=this.st(),ks=Object.keys(PWK).filter(k=>!this.on(k)&&!(k==='drop'&&s.drop)&&(!PWK[k].need||GA.own[PWK[k].need])&&!(k==='fix'&&P.hp>=P.max));
    if(!ks.length)return pick.call(this);let t=0;for(const k of ks)t+=PWK[k].w;let r=gx(0,t);for(const k of ks){r-=PWK[k].w;if(r<=0)return k;}return ks[0];};
  const give=PW.give;PW.give=function(kind,ob){
    if(kind==='fix'){if(P.hp<P.max)P.hp++;PW.stat.given++;floater(P.x,P.y-24,'HULL +1','#3dffb0');G.hint={t:3,txt:say(PWK.fix.tip)};AU.sfx('up');return true;}
    const r=give.call(this,kind,ob);if(r&&kind!=='drop'){const a=this.st().act.find(x=>x.k===kind);if(a&&NR.mod.pw!==1&&!a.scaled){a.d*=NR.mod.pw;a.scaled=1;}}return r;};
  const gl=PW.glyph;const SH_=(k,r,c)=>{ctx.save();ctx.scale(r/11,r/11);ctx.strokeStyle=c;ctx.fillStyle=c;ctx.lineWidth=2;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();
    if(k==='mag'){ctx.moveTo(-6,-7);ctx.lineTo(-6,2);ctx.arc(0,2,6,Math.PI,0,true);ctx.lineTo(6,-7);}
    else if(k==='bub'){ctx.arc(0,0,7,0,7);ctx.moveTo(-3.5,-3);ctx.arc(0,0,4.5,Math.PI*1.1,Math.PI*1.6);}
    else if(k==='tri'){ctx.moveTo(-7,0);ctx.lineTo(7,0);ctx.moveTo(-5,-3);ctx.lineTo(6,-8);ctx.moveTo(-5,3);ctx.lineTo(6,8);}
    else if(k==='nr'){ctx.moveTo(0,-8);ctx.lineTo(6,0);ctx.lineTo(0,8);ctx.lineTo(-6,0);ctx.closePath();}
    else{ctx.moveTo(-6,0);ctx.lineTo(6,0);ctx.moveTo(0,-6);ctx.lineTo(0,6);}
    ctx.stroke();ctx.restore();};
  PW.glyph=function(k,r,c){if(k==='mag'||k==='bub'||k==='tri'||k==='nr'||k==='fix')SH_(k,r,c);else gl.call(this,k,r,c);};}
for(const [id,n,t,p,ic] of [['pu_mag','Magnet Storm','Power-up: pulls in every pickup',120,'M5 3h5v9a2 2 0 004 0V3h5v9a7 7 0 01-14 0z'],['pu_bub','Bubble','Power-up: hits bounce off for 2 bars',160,'M12 3a9 9 0 100 18 9 9 0 000-18z'],
    ['pu_tri','Triple Shot','Power-up: two extra side shots',140,'M3 11h18v2H3zM4 5l17 4-1 2L3 7zM4 19l17-4-1-2L3 17z'],['pu_nr','Neon Rain','Power-up: kills pay double Neon',130,'M12 2l8.5 5v10L12 22l-8.5-5V7z'],
    ['pu_fix','Repair Kit','Power-up: +1 hull at once',100,'M10 3h4v7h7v4h-7v7h-4v-7H3v-4h7z']])CREW.push({id,n,t,p,ic});

/* ----- what each level of a pit-stop upgrade does (shown on its card; the pips under it show the level) ----- */
const LVT={fr:l=>['Extra shot on every 4th beat step','Extra shot on every 2nd step','Extra shot on every step','Plus a quarter-step shot','Plus a three-quarter shot'][l-1],
  dc:l=>'Dash charges +'+l,mg:l=>'Pickup range +'+(70*l)+' px',sh:l=>l+' shield'+(l>1?'s':'')+' in total',lp:l=>'Power-ups last '+(30*l)+'% longer',
  wd:l=>'On-beat window '+(14*l)+' ms wider',hm:l=>'Shots steer '+['a little','well','strongly','hard','almost always hit'][l-1],ck:l=>'Tier lasts '+(4*l)+' beats longer',
  db:l=>'Dash hits for '+(5*l)+' damage',sb:l=>'Gold pulse shots +'+(30*l)+'%',nx:l=>'Kills drop +'+(30*l)+'% Neon',
  dm:l=>'Shot damage +'+(12*l)+'%',cr:l=>(5*l)+'% chance of a 3x hit',mh:l=>'Max hull +'+l+', repaired',dr:l=>l+' wingman'+(l>1?' drones':''),rv:l=>'Come back '+l+' time'+(l>1?'s':''),
  sc:l=>l+' pair'+(l>1?'s':'')+' of wing guns',rg:l=>['Shoots backwards','Backwards fan, more shots','Backwards fan, fires every shot'][l-1],pc:l=>'Shots pierce '+l+' enem'+(l>1?'ies':'y'),
  cl:l=>'On-beat kills arc to '+(l+1)+' foes',bt:l=>'On-beat dash slows time '+(.4+.3*l).toFixed(1)+' s',rc:l=>'Shots bounce '+l+'x',as:l=>l+' auto-shield'+(l>1?'s':''),bd:l=>l+' orbiting gun'+(l>1?'s':'')};
const lvText=(u,l)=>LVT[u.id]&&u.max>1?(LVT[u.id](l)||u.t):u.t;

/* ----- recommended pick + afford counts ----- */
const afford={tune:0,all:0,rec:null};
function tuneNext(d){const l=TP.raw(d.id);return l>=d.max?0:tpPrice(d,l);}
function recTune(){let best=null,bs=-1e9;for(const d of TP_DEF){const pr=tuneNext(d);if(!pr||pr>GA.bank)continue;const s=d.pri-7*TP.raw(d.id)+(pr<GA.bank*.5?3:0);if(s>bs){bs=s;best=d.id;}}return best;}
function affordCount(){let n=0;for(const d of TP_DEF){const pr=tuneNext(d);if(pr&&pr<=GA.bank)n++;}
  for(const s of SHIPS)if(s.p&&!GA.own['ship_'+s.id]&&s.p<=GA.bank)n++;
  for(const c of CREW)if(!GA.own[c.id]&&c.p<=GA.bank)n++;
  for(const h of THEMES)if(h.p&&!GA.own['th_'+h.id]&&h.p<=GA.bank)n++;return n;}
function recPit(){let best=-1,bs=-1e9;const pri={hl:()=>P.hp<=P.max-2?100:P.hp<P.max?45:0,sh:()=>SH.sh===0?90:55,rv:()=>TP.revLeft===0?85:30,mh:()=>60,dm:()=>70,dc:()=>55,dr:()=>65,fr:()=>50,cr:()=>45,hm:()=>40,ck:()=>35,mg:()=>30,wd:()=>25,lp:()=>30};
  SH.cards.forEach((c,i)=>{if(c.sold||SH.neon<SH.price(c.u))return;const s=(pri[c.u.id]?pri[c.u.id]():30)-4*SH.n(c.u.id);if(s>bs){bs=s;best=i;}});return best;}

/* ----- styles ----- */
{const st=document.createElement('style');st.textContent=`
.pg .card .rec{position:absolute;top:-9px;right:10px;background:var(--amber,#ffb020);color:#120a1f;font-family:var(--mono);font-weight:700;font-size:clamp(9px,calc(var(--u)*2.6),12px);letter-spacing:.08em;padding:1px 7px;border-radius:9px;white-space:nowrap}
.pg .card .lv{font-family:var(--mono);font-weight:400;color:var(--dim);font-size:.82em;margin-left:4px;white-space:nowrap}
.pg .card .pp{display:flex;gap:2px;margin-top:2px}.pg .card .pp i{display:block;width:clamp(5px,calc(var(--u)*2),9px);height:4px;border-radius:1px;background:#ffffff22}.pg .card .pp i.on{background:var(--c)}
#gaCards.tune{display:grid!important;grid-template-columns:repeat(auto-fill,minmax(min(100%,235px),1fr));grid-auto-rows:min-content;align-content:start;gap:calc(var(--u)*2) calc(var(--u)*2);overflow-y:auto;-webkit-overflow-scrolling:touch;padding:12px 2px 6px;flex:1 1 0;min-height:0}
#gaCards.tune .card{flex-direction:row;text-align:left;justify-content:flex-start;gap:10px;padding:8px 10px;min-height:58px}
#gaCards.tune .card .tx{flex:1 1 0}#gaCards.tune .card>svg{height:30px;width:30px}
#gaCards.tune .card.max{opacity:.55;border-style:dashed}
.pg .aff{font-family:var(--mono);color:var(--cyan);text-align:center;font-size:clamp(11px,calc(var(--u)*3.3),16px);min-height:1.3em;flex:0 0 auto}
.pg .aff b{color:var(--amber)}
#gaBtn small,#gaBtn2 small{display:block;font-size:.62em;letter-spacing:.08em;color:#ffe14d;font-weight:700;line-height:1.1}
#gaBtn.rdy{box-shadow:0 0 14px #ffe14d88}
`;document.head.appendChild(st);}

/* ----- the garage: a TUNE tab with levels; the old tabs keep working ----- */
{const tabs=garageEl.querySelector('.tabs'),b=document.createElement('button');b.className='go dim';b.dataset.t='tune';b.type='button';b.textContent='TUNE';tabs.prepend(b);b.addEventListener('click',()=>{GA.tab='tune';gaDraw();});}
const gaItems0=gaItems;
function perkIcon(d){let real=false;try{real=ART.isReal('kit-'+(d.uid||d.id));}catch(e){}return real?`<img class="ki" src="media/kit-${d.uid||d.id}.webp" alt="" decoding="async">`:svgI(d.ic);}      // kit perks have their own painted icon (a placeholder until the art is in, see ASSETS-NEEDED.md)
function tuneDraw(){const box=$('gaCards');box.innerHTML='';box.classList.add('tune');const rec=recTune();
  for(const d of TP_DEF){const l=TP.raw(d.id),pr=tuneNext(d),b=document.createElement('button');b.type='button';
    b.className='card'+(!pr?' max':GA.bank<pr?' no':'');b.style.setProperty('--c',!pr?'#8c86b8':d.c);b.dataset.id='tp_'+d.id;b.dataset.kind='tune';b.dataset.lvl=l;
    b.innerHTML=perkIcon(d)+`<div class="tx"><div class="n">${d.n}<span class="lv">${l}/${d.max}</span></div><div class="t">${l<d.max?d.t(l+1):d.t(l)}</div><div class="pp">${Array.from({length:d.max},(_,i)=>`<i class="${i<l?'on':''}"></i>`).join('')}</div></div>`
      +`<div class="pr">${pr?neonI+' '+pr:'MAX'}</div>`+(d.id===rec?'<span class="rec">RECOMMENDED</span>':'');
    b.addEventListener('click',()=>tuneBuy(d,b));box.appendChild(b);}}
function tuneBuy(d,b){const l=TP.raw(d.id),pr=tuneNext(d);if(!pr){gaMsg(d.n+' is maxed');return false;}
  if(GA.bank<pr){b.classList.remove('shake');void b.offsetWidth;b.classList.add('shake');gaMsg('Need '+(pr-GA.bank)+' more Neon');return false;}
  GA.bank-=pr;GA.tune[d.id]=l+1;if(l===0&&eqCount()<eqSlots()){GA.eq[d.id]=true;eqsave();}   // a new perk goes into a free slot at once
  tsave();gsave();SH.recalc();gaMsg(d.n+' level '+(l+1));AU.sfx('up');gaDraw();return true;}
gaDraw=function(){const bank=$('gaBank');bank.innerHTML=neonI+' <b id="gaBankN">'+GA.bank+'</b>';
  for(const b of garageEl.querySelectorAll('.tabs button'))b.classList.toggle('on',b.dataset.t===GA.tab);
  const box=$('gaCards');box.classList.remove('tune');
  if(GA.tab==='tune')tuneDraw();
  else{box.innerHTML='';
    for(const it of gaItems()){const own=!it.k||GA.own[it.k],b=document.createElement('button');b.type='button';
      b.className='card'+(it.eq?' sel':'')+(!own&&GA.bank<it.p?' no':'');b.style.setProperty('--c',it.eq?'#19e3ff':own?'#8c86b8':'#ffb020');b.dataset.id=it.id;b.dataset.kind=it.kind;
      const ic=it.kind==='theme'?`<div class="sw" style="filter:${it.f||'none'}"></div>`:it.kind==='ship'?shipPortrait(it):svgI(it.ic);
      const pr=own?(it.kind==='crew'?'IN POOL':it.eq?'EQUIPPED':'EQUIP'):neonI+' '+it.p;
      b.innerHTML=`${ic}<div class="tx"><div class="n">${it.n}</div><div class="t">${it.t}</div></div><div class="pr">${pr}</div>`;
      b.addEventListener('click',()=>gaTap(it,b));box.appendChild(b);}
    if(GA.tab==='crew')box.classList.add('tune');}
  affUpd();};
function affUpd(){const n=affordCount();afford.all=n;const g=$('gaBtn');
  if(g){g.innerHTML='GARAGE '+neonI.replace('class="nI"','class="nI" style="color:#fff"')+' '+GA.bank+(n?'<small>'+n+' UPGRADE'+(n>1?'S':'')+' READY</small>':'');g.classList.toggle('rdy',n>0);}
  const g2=$('gaBtn2');if(g2){g2.innerHTML='GARAGE'+(n?'<small>'+n+' READY</small>':'');g2.classList.toggle('rdy',n>0);}}
gaDraw();

/* ----- the pit stop: levels on the cards, a recommended pick, and "you can afford N" ----- */
{const row=document.createElement('div');row.className='aff';row.id='shAff';$('shMsg').before(row);}
SH.draw=function(){const box=$('shCards');box.innerHTML='';const rec=recPit();let aff=0;
  this.cards.forEach((c,i)=>{const u=c.u,pr=this.price(u),n=this.n(u.id),b=document.createElement('button');b.type='button';if(!c.sold&&this.neon>=pr)aff++;
    b.className='card'+(c.sold?' sold':this.neon<pr?' no':'');b.style.setProperty('--c',u.c);b.dataset.id=u.id;
    b.innerHTML=svgI(u.ic)+`<div class="tx"><div class="n">${u.n}${u.max>1?`<span class="lv">${n+1}/${u.max}</span>`:''}</div><div class="t">${lvText(u,n+1)}</div>${u.max>1?`<div class="pp">${Array.from({length:u.max},(_,k)=>`<i class="${k<n?'on':''}"></i>`).join('')}</div>`:''}</div><div class="pr">${c.sold?'FITTED':neonI+' '+pr}</div>`+(i===rec&&!c.sold?'<span class="rec">RECOMMENDED</span>':'');
    b.addEventListener('click',()=>this.buy(i));box.appendChild(b);});
  $('shN').textContent=this.neon;$('shRe').innerHTML='REROLL '+neonI+' '+this.rerollPrice();$('shRe').classList.toggle('dim',this.neon<this.rerollPrice());
  $('shGo').textContent=this.picks?'GO':'SKIP';
  $('shOwn').innerHTML=this.order.length?this.order.map(id=>{const u=UBY[id];return `<span style="--c:${u.c}">${svgI(u.ic)}${this.n(id)>1?'×'+this.n(id):''}</span>`;}).join(''):'<span style="color:var(--dim)">No upgrades yet</span>';
  const ga=affordCount();$('shAff').innerHTML=(aff?`You can afford <b>${aff}</b> upgrade${aff>1?'s':''}`:'Nothing affordable yet')+(ga?` · Garage: <b>${ga}</b> ready`:'');
  SH.aff=aff;SH.rec=rec;};
NR.on('banked',()=>affUpd());NR.on('runEnd',()=>setTimeout(affUpd,0));
affUpd();
