/* ---------- variants.js: one enemy, many looks (owner, 20 Oct 2026: "the game is boring and predictable... make variations of enemies by sizing them or reversing them").
   Flag RET.variants (default on); ?variants=0 = the exact old spawns and draws (nothing below runs, no dice are drawn).
   Every enemy that en() (b.js) builds is rolled once against the table VARTAB (data, edit freely) and gets:
     CLASS   mini (r x.6, hull x.5, faster, single shots, pack of 3-5) | normal | large (r x1.5, hull x2.5, slower, extra aimed shot, drops a pickup)
             | giant (r x2.2, shield plates, a gapped ring every 3rd shot, one per stage)
     ORIENT  N | V (vertical mirror) | T / B (rotated 90: comes down from the top / up from the bottom lane) | L (rotated 180: comes in from the LEFT, turns round, flies back)
             T / B / L are paths on the formations.js rails (FM.mv) so a leak still counts; the picture is turned/mirrored by canvas transform (works for pictures and code shapes)
     TINT    0 plain | 1 hue shift + one pip | 2 hue shift + two pips | 3 ELITE (aura ring + diamond, extra hull, one extra behaviour: shield | split on death | medic link)
   Shape carries every difference (size, pips, diamond, ring), colour is extra. Hooks: b.js en() VAR.apply, enemy loop VAR.pace, eb() VAR.shot, draw.js drawEnemy VAR.in/out, kill via NR.
   Hull ledger: each roll is steered so the stage's total hull stays within +-10% of the old one (small ones add hull, large ones take it away, the ledger decides which). */
const VAR=window.VARIANTS=window.VAR=window.VAR||{};
if(RET.variants===undefined)RET.variants=!/[?&]variants=0/.test(location.search);
/* VARTAB: [last stage of the band, {mini, large, giant: chance per eligible spawn; flip (V), rot (T/B/L); tint (1/2); elite}]. */
VAR.TAB=[
  [3, {mini:.14,large:0,  giant:0,  flip:.16,rot:.10,tint:.22,elite:.04}],      // early: small packs and mirrored / rotated entries
  [10,{mini:.14,large:.06,giant:0,  flip:.18,rot:.16,tint:.30,elite:.07}],
  [20,{mini:.13,large:.11,giant:.012,flip:.20,rot:.18,tint:.34,elite:.12}],     // mid: large + elite
  [30,{mini:.12,large:.13,giant:.02, flip:.22,rot:.20,tint:.38,elite:.15}],     // late: giants with escorts
  [99,{mini:.12,large:.15,giant:.03, flip:.24,rot:.22,tint:.42,elite:.18}]];
VAR.CL={mini:{r:.6,h:.5,s:.4,vs:.32,fire:.5,bs:.8,sp:1},normal:{r:1,h:1,s:1,vs:0,fire:1,bs:1,sp:1},large:{r:1.5,h:2.5,s:2,vs:-.25,fire:1,bs:1.2,sp:.92},giant:{r:2.2,h:2.5,s:6,vs:-.4,fire:1,bs:1.5,sp:.85}};
VAR.KINDS={drone:{o:'NVTBL',c:'MNLG'},flank:{o:'NV',c:'MNL'},charger:{o:'NV',c:'MNLG'},turret:{o:'NV',c:'MNLG'},mine:{o:'NV',c:'L'}};   // eligible per kind (swarm, gate, gunship, boss, zoo kinds: tint / elite only)
VAR.HUES=[0,135,265];VAR.GCAP=1;
VAR.st={led:0,base:0,n:0,gStage:-1,seq:0,fm:0,busy:0,pkN:0,hull0:0,hull1:0};
VAR.stage=()=>ST.on?ST.n:Math.min(45,10+Math.floor(G.t/45));
VAR.rng=()=>{let a=(VAR.st.seq=(VAR.st.seq+1)|0)*0x9E3779B1+VAR.stage()*7919|0;a=Math.imul(a^a>>>15,1|a);a=a+Math.imul(a^a>>>7,61|a)^a;return((a^a>>>14)>>>0)/4294967296;};   // own dice: never touches Math.random (daily seeds and the flag-off path stay exact)
VAR.row=n=>{for(const r of VAR.TAB)if(n<=r[0])return r[1];return VAR.TAB[VAR.TAB.length-1][1];};
VAR.reset=()=>{const s=VAR.st;s.led=0;s.base=0;s.n=0;s.gStage=-1;s.seq=0;s.pkN=0;s.hull0=0;s.hull1=0;};
NR.on('runStart',VAR.reset);
VAR.on=()=>!!(RET.variants&&!G.lab&&!G.tut);
/* a roll: {c:'M|N|L|G', o:'N|V|T|B|L', t:0..3, x:'sh|sp|md' (elite behaviour)}; key = kind|class|orient|tint, what the audits count */
VAR.roll=function(type,fm){const s=VAR.st,n=VAR.stage(),R=VAR.row(n),k=VAR.KINDS[type],rn=VAR.rng,out={c:'N',o:'N',t:0,x:''};if(VAR.force)return Object.assign(out,VAR.force);
  const drift=s.base>0?(s.led/s.base):0;                                      // + = more hull than the old build: favour small, - = favour large
  if(k){
    let pm=R.mini*(drift>.03?1.8:drift<-.05?.5:1),pl=R.large*(drift>.08?0:drift>.02?.25:drift<-.05?1.6:1),pg=R.giant*(drift>.02?0:1);
    const u=rn();
    if(k.c.includes('G')&&s.gStage!==n&&pg>0&&u<pg&&!fm)out.c='G';
    else if(k.c.includes('L')&&u<pg+pl)out.c='L';
    else if(k.c.includes('M')&&u<pg+pl+pm)out.c='M';
    const q=rn();
    if(k.o.length>1&&q<R.flip+R.rot){const pool=k.o.replace('N','');if(fm){out.o='N';}else if(q<R.flip&&pool.includes('V'))out.o='V';else{const rot=pool.replace('V','');if(rot)out.o=rot[Math.floor(rn()*rot.length)];}}}
  const el=drift>.05?.5:1,u=rn();out.t=u<R.elite*el?3:u<R.elite*el+R.tint?1+(rn()<.5?1:0):0;
  if(out.t===3)out.x=['sh','sp','md'][Math.floor(rn()*3)];
  return out;};
VAR.key=e=>e.vk||'';
/* ---- hook: en() builds e (after the hull multipliers, before e.max) ---- */
VAR.apply=function(e,o){if(!VAR.on()||e.vz||e.type==='boss'||e.gnd||o&&(o.vz===0||o.mini&&!o.pk))return;
  if(!(e.hp>0))return;const s=VAR.st,fm=!!(s.fm||window.FM&&FM.cur),base=e.hp;let rl=VAR.roll(e.type,fm||!!o.pk);
  if(o&&o.pkc){rl={c:'M',o:o.pkc.o,t:0,x:''};}
  if(e.type==='swarm'&&rl.t===3)rl.t=1;
  {const k=VAR.KINDS[e.type];if(!k){rl.c='N';rl.o='N';}else{if(rl.c!=='N'&&!k.c.includes(rl.c))rl.c='N';if(!k.o.includes(rl.o))rl.o='N';}}
  const cl=VAR.CL[{M:'mini',N:'normal',L:'large',G:'giant'}[rl.c]];
  e.vz=1;e.vc=rl.c;e.vo=rl.o;e.vt=rl.t;e.vx=undefined;e.vcl=cl;e.r0=e.r;
  e.r=Math.max(e.type==='swarm'?5:7,Math.round(e.r*cl.r));e.hp=Math.max(1,Math.round(e.hp*cl.h));e.score=Math.max(1,Math.round(e.score*cl.s));
  if(rl.c==='G'){e.shl=1;s.gStage=VAR.stage();e.mb=1;e.hp=Math.round(e.hp*1.6);}
  if(rl.t===3){e.vel=rl.x;e.hp=Math.round(e.hp*1.5);e.score=Math.round(e.score*1.5);if(rl.x==='sh')e.shl=1;}
  e.vsp=e.type==='drone'?cl.vs:0;
  if(rl.o==='V'){if(!o.pkc){e.y=H-e.y;if(e.by!=null)e.by=H-e.by;}if(e.amp)e.amp=-e.amp;}
  if((rl.o==='T'||rl.o==='B'||rl.o==='L')&&e.type==='drone'&&!e.fp)VAR.rail(e,rl.o,o);
  e.vk=e.type+'|'+rl.c+rl.o+rl.t+(rl.x?rl.x:'');
  s.n++;s.base+=base;s.led+=e.hp-base;s.hull0+=base;s.hull1+=e.hp;
  if(rl.c==='M'&&!o.pk&&!fm&&!e.fp&&e.type!=='mine'&&e.type!=='turret'&&s.pkN<6){const nn=2+Math.floor(VAR.rng()*3);s.pkN++;   // a pack of 3-5 (this one + 2-4 more), never from inside a formation
    VAR.pack=[e,nn,o];}
  return e;};
VAR.after=function(e,o){const p=VAR.pack;if(!p||p[0]!==e)return;VAR.pack=null;const nn=p[1];if(VAR.st.busy)return;VAR.st.busy=1;
  try{for(let i=1;i<=nn;i++){const sp=Object.assign({},p[2]||{},{pk:1,pkc:{o:e.vo==='V'?'V':'N'},x:e.x+(e.vo==='L'?-1:1)*i*26,y:clamp(e.y+(i%2?1:-1)*Math.ceil(i/2)*22,30,H-30),by:undefined,pt:undefined});
      if(e.vo==='V'&&sp.by!=null)sp.by=undefined;
      const q=en(e.type,sp);if(q)q.vpk=e;}}finally{VAR.st.busy=0;}};
/* ---- rails: T / B / L entries as formations.js paths (every path ends flying left, so a leak still counts) ---- */
VAR.rail=function(e,o,op){const W0=W,xs=clamp(W-70-((e.x-W-30)%400+400)%400*.45,W*.5,W-50),yl=clamp(e.y,70,H-120),v=150;let f;
  if(o==='T'||o==='B'){const sg=o==='T'?1:-1,y0=o==='T'?-30:H+30,ya=sg>0?yl:H-yl;
    f=t=>{const ty=Math.abs(ya-y0)/300;if(t<ty)return[xs-40*t,y0+sg*300*t];return[xs-40*ty-v*(t-ty),ya+Math.sin((t-ty)*2)*22];};}
  else{const R=52,xc=W*.46,x0=-40,t1=(xc-x0)/170,tu=1.0;
    f=t=>{if(t<t1)return[x0+170*t,yl];if(t<t1+tu){const th=Math.PI*(t-t1)/tu;return[xc+R*Math.sin(th),yl+R*(1-Math.cos(th))];}return[xc-v*(t-t1-tu),yl+2*R];};}
  e.pth=f;e.fp=1;e.pt=-(o==='L'?0:0);e.tk=1;const p=f(0);e.ox=0;e.x=p[0];e.y=p[1];e.by=p[1];
  if(o==='L'&&G.rings.length<24)G.rings.push({x:14,y:clamp(yl,30,H-30),l:.5,m:.5,c:'#ff3d6a'});};
/* ---- per-frame: speed of plain movers (mini faster, large slower); elite behaviours ---- */
VAR.pace=function(e,sdt,d){if(!e.vz)return;
  if(e.vsp&&!e.fp&&e.type==='drone')e.x-=e.vsp*(120+15*d)*sdt;
  if(e.vel==='md'&&e.hp>0&&G.t-(e.vm||0)>1){e.vm=G.t;let b=null,bd=170;for(const q of G.en){if(q===e||q.hp<=0||q.type==='boss'||q.hp>=q.max)continue;const dd=Math.hypot(q.x-e.x,q.y-e.y);if(dd<bd){bd=dd;b=q;}}
    e.vl=b;if(b)b.hp=Math.min(b.max,b.hp+.5);}
  if(e.vel!=='md')e.vl=null;};
/* ---- hook: eb() — class changes the shots. return null = drop this shot; else {r,s} ---- */
VAR.shot=function(src,x,y,a,s,c,r){if(!src.vz||VAR.st.busy)return {r,s};const cl=src.vcl;if(!cl)return {r,s};
  src.vn=(src.vn|0)+1;
  if(src.vc==='M'&&src.vn%2===0)return null;                                      // minis shoot half as often, one bullet at a time
  const o={r:Math.max(3.5,Math.round(r*cl.bs*10)/10),s:s*cl.sp};
  if(src.vc==='L'&&src.vn%2===1){VAR.st.busy=1;try{const k=Math.min(PW.bs*bsM(),BCAP/Math.max(60,o.s));if(G.eb.length<ebCap()-4)G.eb.push(AI.kind({x,y,vx:Math.cos(a+.16)*o.s*k,vy:Math.sin(a+.16)*o.s*k,r:o.r,c:BULLET,g:false,sl:PW.bs!==1,hm:0},src));}finally{VAR.st.busy=0;}}   // double fire
  if(src.vc==='G'&&src.vn%3===0&&G.eb.length<ebCap()-12){VAR.st.busy=1;try{const k=Math.min(PW.bs*bsM(),BCAP/Math.max(60,110));
      for(let i=0;i<12;i++){const aa=a+.55+i*(6.283-1.1)/11;G.eb.push(AI.kind({x,y,vx:Math.cos(aa)*110*k,vy:Math.sin(aa)*110*k,r:5,c:BULLET,g:false,sl:PW.bs!==1,hm:0},src));}}finally{VAR.st.busy=0;}}   // signature: slow ring with a 63-degree gap on the ship
  return o;};
/* ---- deaths: split into 2 minis (elite), pickup (large / giant) ---- */
NR.on('kill',x=>{const e=x&&x.e;if(!e||!e.vz||x.boss)return;
  if(e.vc==='L'||e.vc==='G')G.pk.push({t:e.vc==='G'?'up':'shard',x:e.x,y:e.y,vx:-80,vy:0,bob:0});
  if(e.vel==='sp'&&!e.rk&&!VAR.st.busy&&e.type!=='mine'&&e.x>40&&e.x<W-20&&Math.hypot(e.x-P.x,e.y-P.y)>=220){VAR.st.busy=1;try{for(let i=0;i<2;i++){const q=en(e.type,{x:e.x,y:clamp(e.y+(i?26:-26),30,H-30),amp:0,pk:1,pkc:{o:'N'},vz:undefined});if(q){q.x=e.x;q.gr=0;q.bf=Math.max(q.bf,6);}}}finally{VAR.st.busy=0;}}});
/* ---- draw ---- */
VAR.reduced=()=>{try{return !!(window.SET&&SET.reduce)||matchMedia('(prefers-reduced-motion: reduce)').matches;}catch(_){return false;}};
VAR.in=function(e,t){const cl=e.vcl;if(!cl)return;if(VAR._t!==t){VAR._t=t;VAR.nf=0;}const f=e.r/Math.max(1,e.r0||e.r);e._rr=e.r;e.r=e.r0||e.r;ctx.scale(f,f);
  const dx=e.x-(e._px==null?e.x:e._px),dy=e.y-(e._py==null?e.y:e._py);e._px=e.x;e._py=e.y;
  if(Math.abs(dx)+Math.abs(dy)>.01){e._hx=dx;e._hy=dy;}
  const hx=e._hx||-1,hy=e._hy||0;
  if(e.vo==='V')ctx.scale(1,-1);
  else if(e.fp&&(e.vo==='T'||e.vo==='B'||e.vo==='L')){if(Math.abs(hy)>Math.abs(hx)*1.2)ctx.rotate(hy>0?-Math.PI/2:Math.PI/2);else if(hx>0)ctx.scale(-1,1);}
  if(e.vt&&e.vt<3&&VAR.HUES[e.vt]&&ctx.filter!==undefined&&VAR.nf<10){VAR.nf++;e._flt=ctx.filter;ctx.filter='hue-rotate('+VAR.HUES[e.vt]+'deg)';}};
VAR.nf=0;
VAR.out=function(e,t){if(e._rr!=null){e.r=e._rr;e._rr=null;}if(e._flt!=null){ctx.filter=e._flt;e._flt=null;}};
/* overlay (screen space, after the enemy picture): pips, elite aura + diamond, medic link. Shape-coded, not colour only. */
VAR.mark=function(e,t){if(!e.vz||e.hp<=0)return;ctx.save();ctx.translate(e.x,e.y);const r=e.r,st=VAR.reduced();
  if(e.vt===1||e.vt===2){ctx.fillStyle='#fff';ctx.strokeStyle='#101020';ctx.lineWidth=1.5;for(let i=0;i<e.vt;i++){const px=(i-(e.vt-1)/2)*7;ctx.beginPath();ctx.moveTo(px,-r-9);ctx.lineTo(px+3.5,-r-3);ctx.lineTo(px-3.5,-r-3);ctx.closePath();ctx.stroke();ctx.fill();}}
  if(e.vt===3){const k=st?.7:.6+.4*Math.sin(t*5);ctx.strokeStyle='#ffd23d';ctx.globalAlpha=k;ctx.lineWidth=2;ctx.setLineDash([5,4]);ctx.beginPath();ctx.arc(0,0,r+7,0,7);ctx.stroke();ctx.setLineDash([]);ctx.globalAlpha=1;
    ctx.fillStyle='#ffd23d';ctx.strokeStyle='#101020';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(0,-r-17);ctx.lineTo(5,-r-11);ctx.lineTo(0,-r-5);ctx.lineTo(-5,-r-11);ctx.closePath();ctx.stroke();ctx.fill();
    if(e.vel==='sh'){ctx.strokeStyle='#4ad1ff';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,r+3,-2.2,-.9);ctx.stroke();}}
  if(e.vc==='G'){ctx.strokeStyle='#9fb4ff';ctx.lineWidth=4;for(let i=0;i<3;i++){const a=i*2.094+.5;ctx.beginPath();ctx.arc(0,0,r+3,a,a+.9);ctx.stroke();}}
  ctx.restore();
  if(e.vl&&e.vl.hp>0){ctx.save();ctx.strokeStyle='#5dff9a';ctx.globalAlpha=.7;ctx.lineWidth=2;ctx.setLineDash([4,4]);ctx.beginPath();ctx.moveTo(e.x,e.y);ctx.lineTo(e.vl.x,e.vl.y);ctx.stroke();ctx.restore();}};
/* ---- numbers for the audits / lab: distinct looks per stage ---- */
VAR.X={en:(t,o)=>en(t,o),draw:(e,t)=>{ctx.save();drawEnemy(e,t);ctx.restore();VAR.mark(e,t);},cap:()=>ebCap()};   // for variants-test.js
VAR.stat=()=>({n:VAR.st.n,hull0:VAR.st.hull0,hull1:VAR.st.hull1});
