/* ---------- WEAPON FORGE (flag RET.forge, default ON; ?forge=0 = the old weapons exactly). Owner, 20 Oct 2026: "weapons maybe can be combined and users can
   organize their inventories ... the game needs to be more creative".
   - HYBRIDS: two owned weapons + 3 scrap + 120 Neon forge a named hybrid from the recipe table FGR (one row per pair; add rows to extend). A hybrid sits in a
     weapon slot and fires its first parent's volley with the recipe's traits (seeds, mine trail, edge bounce, beat rings, ...). Its damage factor is
     .95 minus 1.6x the cost of its traits (FGC, .5-.9), x1.03 per level (LV1-5): with its traits no hybrid passes 1.35x its parent (forge-test); hard.js's damage ceiling and
     S3's auto-aim cut book every trait hit (they go through DMG.hit or WP.hurtE inside S3.ctx).
   - MODS (FGM): 12 small mods; a plain weapon slot takes 2, a hybrid slot 1. Every mod trades damage for its effect (k < 1), except HEAVY (slower shots)
     and BEAT (x1.3 on the beat, x.9 off it).
   - CORES (dash / EMP trait when no power-up is running, via ABIL.keys) and PASSIVES. Loadout = 2 weapon slots + 1 core + 1 passive, 3 named presets.
   - SCRAP: +1 per district cleared, +1 per boss, pit-stop / level-up card FORGE SCRAP (choices.js, flag build2). Save: localStorage mnr_forge.
   b.js calls WP.hit for bullets with b.fg (one hook); the inventory UI is inventory.js. Test: nightrun/forge-test.js. */
if(RET.forge===undefined)RET.forge=!/[?&]forge=0/.test(location.search);
/* recipe table: [weapon A (fires), weapon B, id, name, traits, one line]. Traits: seeds n, trail, rc n (edge bounce), px n (pierce), hk (homing), sp (split),
   zp (leap), zp2 (two leaps), ring (pulse ring on the beat), nova (blast on kill), burst (4 shards on hit), grav (pulls foes in), wob (weaving path), rad (wider) */
const FGR=[
 ['pulse','swarm','seedfan','Seed Fan',{seeds:2},'Spread shots burst into homing seeds on hit'],
 ['laser','mine','minelance','Mine Lance',{px:2,trail:1},'A piercing lance that leaves a trail of mines'],
 ['arc','disc','edgearc','Edge Arc',{rc:2,zp:1},'Lightning that bounces off the screen edges and leaps'],
 ['beat','pulse','ringshell','Ring Shell',{ring:1},'Shells release a pulse ring on every beat'],
 ['swarm','beat','choirbomb','Choir Bomb',{hk:1.4,nova:1},'Homing shells that blast when they kill'],
 ['disc','laser','prismdisc','Prism Disc',{rc:1,sp:1},'A bouncing disc that splits in two on hit'],
 ['orbit','arc','halocoil','Halo Coil',{wob:1,zp:1},'Weaving sparks that leap to the next foe'],
 ['mine','swarm','huntermines','Hunter Mines',{trail:1,hk:1},'Seeking shots that drop mines as they fly'],
 ['flame','wave','heatwave','Heat Wave',{rad:6,px:1},'A wide hot wave that burns through one foe'],
 ['frost','rail','iceneedle','Ice Needle',{px:3},'A thin needle that pierces three foes'],
 ['drone','swarm','hivemind','Hive Mind',{seeds:1,hk:.8},'Seeking shots that hatch one more seeker on hit'],
 ['rail','arc','voltrail','Volt Rail',{px:2,zp:1},'A rail slug that pierces and arcs on'],
 ['shell','pulse','clustershell','Cluster Shell',{burst:1},'Shells crack into four shards on hit'],
 ['storm','disc','squalldisc','Squall Disc',{rc:2,wob:1},'A weaving disc that bounces twice'],
 ['wave','beat','bassswell','Bass Swell',{ring:1,rad:3},'A fat wave that rings out on the beat'],
 ['well','mine','gravmines','Gravity Mines',{trail:1,grav:1},'Shots pull foes together and lay mines'],
 ['well','swarm','horizon','Event Horizon',{grav:1,hk:1},'Seeking shots that drag foes into a knot'],
 ['flame','mine','firefield','Fire Field',{trail:1,nova:1},'Burning mines; kills explode'],
 ['frost','orbit','shardring','Shard Ring',{wob:1,burst:1},'Weaving shards that shatter on hit'],
 ['laser','beat','pulselance','Pulse Lance',{px:1,ring:1},'A lance that rings out on the beat'],
 ['storm','arc','thunderhead','Thunderhead',{zp2:1},'Every hit leaps twice'],
 ['rail','disc','railric','Rail Ricochet',{px:1,rc:2},'A piercing slug that ricochets twice'],
 ['pulse','frost','snowburst','Snowburst',{burst:1,rad:3},'A wide frost spread that shatters on hit'],
 ['shell','well','blackshell','Black Shell',{nova:1,grav:1},'Shells pull foes in, kills blow up']];
const FGC={seeds:.2,trail:.18,ring:.15,nova:.1,burst:.15,zp:.12,zp2:.3,sp:.12,grav:.05,px:.04,rc:.1,hk:.06,rad:.01,wob:0};   // damage cost per trait (x its number)
const FG_SH=['tri','dia','ring','dot','cross','star'];
/* mods: id, name, traits, damage factor, line, icon shape */
const FGM=[
 ['pierce','PIERCE',{px:1},.95,'Shots pass through one more foe','tri'],
 ['bounce','BOUNCE',{rc:1},.97,'Shots bounce off the edges once','dia'],
 ['beat','BEAT SYNC',{beat:1},1,'On-beat shots x1.3, off-beat x0.9','ring'],
 ['shield','KILL SHIELD',{shield:1},.95,'Every 10th kill shields you for 1 s','hex'],
 ['homing','SEEKER',{hk:.9},.88,'Shots curve towards foes','tri'],
 ['split','SPLITTER',{sp:1},.85,'Shots split in two on hit','cross'],
 ['zap','ARC TIP',{zp:1},.85,'Hits leap to a nearby foe','star'],
 ['wide','WIDE BORE',{rad:4},.92,'Bigger shots, easier hits','dot'],
 ['heavy','HEAVY',{heavy:1},1.2,'x1.2 damage, shots fly slower','sq'],
 ['seed','SEED',{seeds:1},.85,'Each hit hatches a homing seed','tri'],
 ['nova','NOVA',{nova:1},.9,'Kills explode','star'],
 ['ring','RINGER',{ring:1},.88,'Live shots ring out on the beat','ring']];
/* cores: the dash / EMP trait while no power-up runs (abilities.js reads ABIL.keys); passives */
const FGK=[['burn','BURN CORE','nova','Dash leaves a burning trail'],['ram','RAM CORE','chord','Dash rams; EMP breaks cores'],['phase','PHASE CORE','slice','Dash turns bullets to shards'],
 ['decoy','DECOY CORE','wing','Dash leaves a decoy; EMP chains'],['magnet','MAGNET CORE','magb','Dash and EMP pull pickups']];
const FGP=[['salvage','SALVAGER','+1 scrap per district cleared'],['showman','SHOWMAN','+6% score from kills'],['spare','SPARE CELL','Start each run with +1 EMP']];
const FG_T=((location.search.match(/[?&]fgt=([a-z,]+)/)||[])[1]||'').split(',').filter(Boolean),FG_TM=((location.search.match(/[?&]fgm=([a-z,]+)/)||[])[1]||'').split(',').filter(Boolean);
const FG_MAXLV=5,FG_COST={scrap:3,neon:120},FG_MODC=2,FG_CORC=4;
const FG=window.FG={get on(){return!!RET.forge;},s:null,ver:0,mn:[],kills:[0,0],stat:{forged:0,seeds:0,mines:0,rings:0,novas:0,bursts:0,grav:0,trait:0},
  key(a,b){return a<b?a+'-'+b:b+'-'+a;},
  rec(a,b){if(!this._rk){this._rk={};for(const r of FGR)this._rk[this.key(r[0],r[1])]=r;}return this._rk[this.key(a,b)]||null;},
  rid(id){return FGR.find(r=>r[2]===id)||null;},
  st(){if(this.s)return this.s;const d={scrap:0,gift:0,hy:{},mods:{},cores:{},pas:{},lo:{w:[null,null],m:[[],[]],core:null,pas:null},pre:[null,null,null],made:0};
    let v=null;try{v=JSON.parse(localStorage.getItem('mnr_forge')||'null');}catch(e){}
    if(v&&typeof v==='object')for(const k in d)if(v[k]!=null&&typeof v[k]===typeof d[k])d[k]=v[k];
    if(!Array.isArray(d.lo.w)||d.lo.w.length!==2)d.lo.w=[null,null];if(!Array.isArray(d.lo.m)||d.lo.m.length!==2)d.lo.m=[[],[]];if(!Array.isArray(d.pre)||d.pre.length!==3)d.pre=[null,null,null];
    if(!d.gift){d.gift=1;d.scrap+=4;}                                                        // a first forge is free to try
    return this.s=d;},
  save(){try{localStorage.setItem('mnr_forge',JSON.stringify(this.st()));}catch(e){}this.ver++;},
  owner(it){return it&&it.startsWith('h:')?(this.rid(it.slice(2))||[])[0]||null:it;},
  hlv(rid){return Math.max(1,Math.min(FG_MAXLV,this.st().hy[rid]|0));},
  sockets(it){return it&&it.startsWith('h:')?1:2;},
  // the loadout follows the WEAPONS sheet: a slot whose weapon changed there holds that weapon (its mods stay if they fit)
  sync(){const s=this.st(),lo=s.lo;let ch=0;for(let i=0;i<2;i++){const id=WP.eq[i]||null;if(this.owner(lo.w[i])!==id){lo.w[i]=id;ch=1;}lo.m[i]=(lo.m[i]||[]).slice(0,this.sockets(lo.w[i]));}if(ch)this.save();},
  // traits for bullets of weapon id: hybrid traits + mods of the slot that fires it
  tr(id){if(!this.on)return null;const ck=WP.eq.join()+'/'+this.ver;if(this._ck!==ck){this._ck=ck;this._tc={};this.sync();}
    if(id in this._tc)return this._tc[id];const s=this.st(),i=WP.eq[0]===id?0:WP.eq[1]===id?1:-1;let r=null;
    if(i>=0&&FG_T.length){const R=FGR.find(r=>r[0]===id&&(FG_T[0]==='all'||FG_T.includes(r[2]))),t={};let k=1;if(R){Object.assign(t,R[4]);k=this.hk(R)*(1+.03*(FG_MAXLV-1))/(1+.03*(this.hlv(R[2])-1));}   // test link ?fgt=<ids|all>&fgm=<mods>: every slot gets its hybrid and the mods
      for(const m of FG_TM.slice(0,R?1:2)){const M=FGM.find(x=>x[0]===m);if(M){for(const q in M[2])t[q]=(t[q]||0)+M[2][q];k*=M[3];}}
      return this._tc[id]=Object.keys(t).length?{t,k,sh:R?FG_SH[FGR.indexOf(R)%FG_SH.length]:null,c2:R?WPD[R[1]].c:null,slot:i}:null;}
    if(i>=0){const it=s.lo.w[i],t={};let k=1,sh=null,c2=null;
      if(it&&it.startsWith('h:')){const R=this.rid(it.slice(2));if(R&&R[0]===id&&s.hy[R[2]]){Object.assign(t,R[4]);k=this.hk(R);sh=FG_SH[FGR.indexOf(R)%FG_SH.length];c2=WPD[R[1]].c;}}
      for(const m of s.lo.m[i]||[]){const M=FGM.find(x=>x[0]===m);if(!M||!(s.mods[m]>0))continue;for(const q in M[2])t[q]=(t[q]||0)+M[2][q];k*=M[3];}
      if(Object.keys(t).length)r={t,k,sh,c2,slot:i};}
    return this._tc[id]=r;},
  hk(R){let c=0;for(const q in R[4])c+=(FGC[q]||0)*R[4][q];return Math.max(.5,Math.min(.9,.95-1.6*c))*(1+.03*(this.hlv(R[2])-1));},
  put(o,r){const t=r.t;o.fg=r;o.fgk=(o.fgk||1)*r.k;
    if(t.px){if(!o.px){o.px=new Set();o.pn=t.px;}else if(o.pn!=null&&o.pn<90)o.pn+=t.px;}
    if(t.rc)o.rc=(o.rc||0)+t.rc;if(t.hk)o.hk=Math.max(o.hk||0,t.hk);if(t.sp)o.sp=1;if(t.zp||t.zp2)o.zp=1;if(t.rad)o.rad=(o.rad||0)+t.rad;
    if(r.c2)o.fc2=r.c2;if(r.sh)o.fgs=r.sh;return o;},
  hurt(e,dm){if(window.S3)S3.ctx++;try{WP.hurtE(e,dm);}finally{if(window.S3)S3.ctx--;}this.stat.trait+=dm;},
  near(x,y,R,f){for(const e of G.en)if(WP.tgt(e)&&e.type!=='gate'&&(e.x-x)**2+(e.y-y)**2<(R+e.r)**2)f(e);},
  // one bullet hit (b.js -> WP.hit)
  hit(b,e){const r=b.fg,t=r.t,c=b.fc2||b.col||'#fff';
    if(t.seeds&&!b.fgsd){b.fgsd=1;for(let i=0;i<t.seeds&&pbRoom();i++){G.pb.push({x:b.x,y:b.y,vx:420,vy:(i%2?1:-1)*260,dm:b.dm*.28,pf:0,col:c,len:6,th:3,hk:2.2,fz:1,wid:b.wid});this.stat.seeds++;}}
    if(t.burst&&!b.fgbu){b.fgbu=1;for(let i=0;i<4&&pbRoom();i++){const a=Math.PI/4+i*Math.PI/2;G.pb.push({x:b.x,y:b.y,vx:Math.cos(a)*560,vy:Math.sin(a)*560,dm:b.dm*.3,pf:0,col:c,len:8,th:2,fz:1,wid:b.wid});}this.stat.bursts++;}
    if(t.zp2)WP.leap(e,b.dm*.3);
    if(t.grav){let n=0;this.near(e.x,e.y,90,o=>{if(o===e||o.type==='boss'||n>=4)return;n++;const d=Math.hypot(e.x-o.x,e.y-o.y)||1;o.x+=(e.x-o.x)/d*10;o.y+=(e.y-o.y)/d*10;});this.stat.grav+=n;}
    if(t.nova&&e.hp<=0&&!e.fgnv){e.fgnv=1;this.near(e.x,e.y,50,o=>{if(o!==e)this.hurt(o,b.dm*.5);});G.rings.push({x:e.x,y:e.y,l:.3,m:.3,c});this.stat.novas++;}},
  tick(dt){if(!this.on||!G.live||G.dead)return;const s=this.st();
    for(const b of G.pb){const r=b.fg;if(!r)continue;const t=r.t;
      if(t.wob){if(b.fgw==null){b.fgw=b.vy;b.fgt=G.t;}b.vy=b.fgw+170*Math.cos((G.t-b.fgt)*13);}
      if(t.trail){b.fgm=(b.fgm||0)+dt;if(b.fgm>.14&&this.mn.length<14){b.fgm=0;this.mn.push({x:b.x,y:b.y,t:2.4,dm:b.dm*.45,c:b.fc2||b.col||'#c08aff'});}}}
    for(let i=this.mn.length-1;i>=0;i--){const m=this.mn[i];m.t-=dt;let hit=null;this.near(m.x,m.y,10,e=>{if(!hit)hit=e;});
      if(hit){this.near(m.x,m.y,30,e=>this.hurt(e,m.dm));if(G.rings.length<24)G.rings.push({x:m.x,y:m.y,l:.25,m:.25,c:m.c});this.stat.mines++;this.mn.splice(i,1);}else if(m.t<=0)this.mn.splice(i,1);}},
  beat(){if(!this.on||!G.live||G.dead)return;let n=0;
    for(const b of G.pb){const r=b.fg;if(!r||!r.t.ring||n>=6||b.x>W-10)continue;n++;this.near(b.x,b.y,56,e=>this.hurt(e,b.dm*.5));if(G.rings.length<24)G.rings.push({x:b.x,y:b.y,l:.3,m:.3,c:b.fc2||b.col||'#ffe14d'});this.stat.rings++;}},
  shape(c,sh,x,y,R){c.beginPath();
    if(sh==='tri'){c.moveTo(x+R,y);c.lineTo(x-R*.7,y-R*.8);c.lineTo(x-R*.7,y+R*.8);c.closePath();}
    else if(sh==='dia'){c.moveTo(x+R,y);c.lineTo(x,y-R);c.lineTo(x-R,y);c.lineTo(x,y+R);c.closePath();}
    else if(sh==='cross'){c.rect(x-R,y-R*.28,2*R,R*.56);c.rect(x-R*.28,y-R,R*.56,2*R);}
    else if(sh==='star'){for(let i=0;i<10;i++){const a=i*Math.PI/5-Math.PI/2,q=i%2?R*.45:R;c.lineTo(x+Math.cos(a)*q,y+Math.sin(a)*q);}c.closePath();}
    else if(sh==='hex'){for(let i=0;i<6;i++){const a=i*Math.PI/3;c.lineTo(x+Math.cos(a)*R,y+Math.sin(a)*R);}c.closePath();}
    else if(sh==='sq')c.rect(x-R*.8,y-R*.8,1.6*R,1.6*R);
    else c.arc(x,y,sh==='dot'?R*.6:R,0,Math.PI*2);},
  draw(){if(!this.on)return;const c=ctx;c.save();c.globalCompositeOperation='lighter';c.lineWidth=2;
    for(const b of G.pb){if(!b.fgs)continue;c.strokeStyle=c.fillStyle=b.fc2||'#fff';c.globalAlpha=.85;this.shape(c,b.fgs,b.x,b.y,6+(b.rad||0)*.5);b.fgs==='ring'?c.stroke():c.fill();}
    for(const m of this.mn){c.globalAlpha=Math.min(1,m.t*2)*.9;c.fillStyle=m.c;this.shape(c,'tri',m.x,m.y,6);c.fill();}
    c.restore();},
  // icon of an inventory item: weapon = its colour circle, hybrid = circle A + triangle B + mini shapes, mod = its shape, core = hexagon, passive = square
  icon(c,it,S){c.clearRect(0,0,S,S);{const pi=typeof ART==='object'&&ART.img('fg-'+it.replace(':','-'));if(pi){c.drawImage(pi,0,0,S,S);return;}}   // real picture fg-<h|m|k|p>-<id> when listed in ready.json
    const m=S/2;c.save();c.lineWidth=Math.max(2,S/16);
    const ty=it.split(':')[0],id=it.split(':')[1];
    if(ty==='w'){const col=WPD[id]?WPD[id].c:'#fff';c.fillStyle=col;this.shape(c,'o',m,m,S*.3);c.fill();c.fillStyle='#0b0820';c.font='700 '+Math.round(S*.24)+'px "Share Tech Mono",monospace';c.textAlign='center';c.textBaseline='middle';c.fillText((WPD[id]?WPD[id].s:'?').slice(0,2),m,m+1);}
    else if(ty==='h'){const R=this.rid(id);if(R){const c1=WPD[R[0]].c,c2=WPD[R[1]].c,sh=FG_SH[FGR.indexOf(R)%FG_SH.length];c.fillStyle=c1;this.shape(c,'o',m-S*.08,m,S*.28);c.fill();
      c.globalCompositeOperation='lighter';c.fillStyle=c2;this.shape(c,'tri',m+S*.12,m,S*.24);c.fill();c.strokeStyle=c2;this.shape(c,sh,m+S*.3,m-S*.3,S*.1);sh==='ring'?c.stroke():c.fill();c.fillStyle=c1;this.shape(c,'dot',m-S*.32,m+S*.3,S*.12);c.fill();}}
    else if(ty==='m'){const M=FGM.find(x=>x[0]===id);c.strokeStyle=c.fillStyle='#e6e1ff';this.shape(c,M?M[5]:'dot',m,m,S*.3);(M&&M[5]==='ring')?c.stroke():c.fill();c.strokeStyle='#19e3ff';this.shape(c,'o',m,m,S*.44);c.stroke();}
    else if(ty==='k'){c.strokeStyle='#ffe14d';this.shape(c,'hex',m,m,S*.38);c.stroke();c.fillStyle='#ffe14d';this.shape(c,'dot',m,m,S*.24);c.fill();}
    else{c.strokeStyle='#3dffb0';this.shape(c,'sq',m,m,S*.38);c.stroke();c.fillStyle='#3dffb0';this.shape(c,'tri',m,m,S*.2);c.fill();}
    c.restore();},
  // actions (the inventory UI calls these; each returns '' or a message)
  canForge(a,b){const s=this.st(),R=a&&b&&a!==b?this.rec(a,b):null;if(!R)return'No recipe for this pair';if(s.hy[R[2]])return'Already forged';if(!WP.has(a)||!WP.has(b))return'Own both weapons first';
    if(s.scrap<FG_COST.scrap)return'Need '+FG_COST.scrap+' scrap';if(GA.bank<FG_COST.neon)return'Need '+FG_COST.neon+' Neon';return'';},
  forge(a,b){const m=this.canForge(a,b);if(m)return m;const s=this.st(),R=this.rec(a,b);s.scrap-=FG_COST.scrap;GA.bank-=FG_COST.neon;try{gsave();}catch(e){}s.hy[R[2]]=1;s.made++;this.stat.forged++;this.save();NR.emit('forge',{id:R[2]});return'';},
  lvCost(rid){return 2*this.hlv(rid);},
  levelUp(rid){const s=this.st();if(!s.hy[rid])return'Not forged';if(s.hy[rid]>=FG_MAXLV)return'Max level';const c=this.lvCost(rid);if(s.scrap<c)return'Need '+c+' scrap';s.scrap-=c;s.hy[rid]++;this.save();return'';},
  craft(ty,id){const s=this.st(),c=ty==='m'?FG_MODC:FG_CORC,bag=ty==='m'?s.mods:ty==='k'?s.cores:s.pas;if(ty!=='m'&&bag[id])return'Owned';if(s.scrap<c)return'Need '+c+' scrap';s.scrap-=c;bag[id]=(bag[id]|0)+1;this.save();return'';},
  used(id){const lo=this.st().lo;return lo.m[0].filter(x=>x===id).length+lo.m[1].filter(x=>x===id).length;},
  scrapIt(ty,id){const s=this.st();
    if(ty==='h'){if(!s.hy[id])return'Not owned';const back=1+s.hy[id];delete s.hy[id];for(let i=0;i<2;i++)if(s.lo.w[i]==='h:'+id){s.lo.w[i]=WP.eq[i]||null;}s.scrap+=back;this.save();return'';}
    if(ty==='m'){if(!(s.mods[id]>0))return'Not owned';if(s.mods[id]<=this.used(id))return'Take it out of the slot first';s.mods[id]--;GA.bank+=30;try{gsave();}catch(e){}this.save();return'';}
    const bag=ty==='k'?s.cores:s.pas;if(!bag[id])return'Not owned';delete bag[id];if(s.lo.core===id)s.lo.core=null;if(s.lo.pas===id)s.lo.pas=null;s.scrap+=2;this.save();return'';},
  // put an item into a loadout slot: 0/1 weapon slots, 'core', 'pas'
  equip(slot,it){const s=this.st(),lo=s.lo;
    if(slot==='core'){lo.core=lo.core===it?null:it;this.save();return'';}if(slot==='pas'){lo.pas=lo.pas===it?null:it;this.save();return'';}
    const own=this.owner(it);if(!own||!WP.has(own))return'Not owned';if(it.startsWith('h:')&&!s.hy[it.slice(2)])return'Not forged';
    const o=1-slot;if(this.owner(lo.w[o])===own){lo.w[o]=lo.w[slot];lo.m[o]=[];}                           // the same weapon cannot fire from both slots: swap
    lo.w[slot]=it;lo.m[slot]=(lo.m[slot]||[]).slice(0,this.sockets(it));this.apply();return'';},
  socket(slot,mod){const s=this.st(),lo=s.lo,a=lo.m[slot]||(lo.m[slot]=[]);if(a.includes(mod)){a.splice(a.indexOf(mod),1);this.save();return'';}
    if(a.length>=this.sockets(lo.w[slot]))return'Slot full ('+this.sockets(lo.w[slot])+' mod'+(this.sockets(lo.w[slot])>1?'s':'')+')';
    if(!(s.mods[mod]>this.used(mod)))return'Craft another '+mod.toUpperCase()+' first';a.push(mod);this.save();return'';},
  apply(){const lo=this.st().lo;WP.eq=[this.owner(lo.w[0])||WP.eq[0]||'pulse',this.owner(lo.w[1])];if(WP.eq[0]===WP.eq[1])WP.eq[1]=null;WP._fk=null;try{WP.save();WP.sync();}catch(e){}this.save();},
  savePre(i,name){const s=this.st();s.pre[i]={n:String(name||'').slice(0,14)||('BUILD '+(i+1)),lo:JSON.parse(JSON.stringify(s.lo))};this.save();return'';},
  usePre(i){const s=this.st(),p=s.pre[i];if(!p)return'Empty preset';const lo=JSON.parse(JSON.stringify(p.lo));
    for(let j=0;j<2;j++){const it=lo.w[j];if(it&&(!WP.has(this.owner(it))||(it.startsWith('h:')&&!s.hy[it.slice(2)])))lo.w[j]=null;lo.m[j]=(lo.m[j]||[]).filter(m=>s.mods[m]>0).slice(0,this.sockets(lo.w[j]));}
    if(lo.core&&!s.cores[lo.core])lo.core=null;if(lo.pas&&!s.pas[lo.pas])lo.pas=null;s.lo=lo;this.apply();NR.emit('forgePreset',{i});return'';},
  gain(n,why){if(!this.on||G.lab||G.tut)return;const s=this.st();s.scrap+=n;this.save();if(G.live&&!G.dead)floater(P.x,P.y-44,'SCRAP +'+n,'#c9c3e6');}};
/* hooks: volley (traits + damage factor), WP.mod, bullet hits, ticks, beats, drawing, kills, cores, passives, scrap */
{const s0=WP.shots;WP.shots=function(std,pf){const n0=G.pb.length;s0.call(this,std,pf);if(!FG.on)return;
  for(let i=0;i<2;i++){const id=this.eq[i],r=id&&FG.tr(id);if(!r||(i&&id===this.eq[0]))continue;let has=false;for(let j=Math.max(0,n0);j<G.pb.length;j++)if(G.pb[j].fg===r){has=true;break;}
    if(!has&&pbRoom())std(860,0,.45,FG.put({wid:id,col:WPD[id].c,len:10,th:4,y:P.y+(i?9:-9)},r));}   // weapons without plain shots (arc, orbit, mines, beams...) carry the traits on a light carrier shot
  for(let i=Math.max(0,n0);i<G.pb.length;i++){const b=G.pb[i];if(!b.fg)continue;let k=b.fgk||1;if(b.fg.t.beat)k*=pf?1.3:.9;if(b.fg.t.heavy){b.vx*=.7;b.vy*=.7;}b.dm*=k;b.fgk=1;}};
 const m0=WP.mod;WP.mod=function(id,o){o=m0.call(this,id,o);const r=FG.tr(id);return r?FG.put(o,r):o;};
 const h0=WP.hit;WP.hit=function(b,e){h0.call(this,b,e);if(b.fg&&FG.on)FG.hit(b,e);};
 const dw=WP.drawWorld;WP.drawWorld=function(t){dw.call(this,t);if(G&&G.live&&!G.dead)FG.draw();};}
NR.on('tick',dt=>FG.tick(dt));NR.on('beat',()=>FG.beat());
NR.on('runStart',()=>{FG.mn=[];FG.kills=[0,0];FG.got=0;if(!FG.on)return;FG._ck=null;const s=FG.st();if(s.lo.pas==='spare'&&s.pas.spare)P.emp=Math.min(3,(P.emp|0)+1);});
NR.on('kill',d=>{if(!FG.on||!G.live)return;const e=d&&d.e;if(!e)return;const s=FG.st();
  if(d.boss)FG.gain(1,'boss');
  else if(s.lo.pas==='showman'&&s.pas.showman)G.score+=Math.round((e.score||0)*.06*(G.mult||1));
  for(let i=0;i<2;i++){const r=FG.tr(WP.eq[i]);if(r&&r.t.shield&&e._wk===WP.eq[i]&&++FG.kills[i]%10===0){P.inv=Math.max(P.inv||0,1);floater(P.x,P.y-30,'SHIELD','#19e3ff');}}});
NR.on('districtEnd',()=>{if(!FG.on)return;const s=FG.st();FG.gain(1+(s.lo.pas==='salvage'&&s.pas.salvage?1:0),'district');});
if(window.ABIL){const k0=ABIL.keys;ABIL.keys=function(){const k=k0.call(this);if(!FG.on||k.length)return k;const s=FG.st(),c=s.lo.core&&s.cores[s.lo.core]?FGK.find(x=>x[0]===s.lo.core):null;return c?[c[2]]:k;};}
if(window.CHO){CHO.DECK.push({id:'scrap',n:'FORGE SCRAP',d:'+2 forge scrap for the Garage forge',fg:1});
  const a0=CHO.apply;CHO.apply=function(id){if(id==='scrap'){FG.gain(2,'card');return;}return a0.apply(this,arguments);};
  const o0=CHO.offer;CHO.offer=function(k){const d=this.DECK,keep=d.slice();if(!FG.on)this.DECK=d.filter(c=>!c.fg);try{return o0.call(this,k);}finally{this.DECK=keep;}};}
window.__fg={FG,FGR,FGM,FGK,FGP};
