'use strict';
// BUILT-IN TRACK lint: the builder piece table BX_P (grades, exits, rail profile) and every demo track's piece chain (gaps, overlaps). Real source, no browser.
const L=require('./lib.js');
module.exports=async T=>{
 const THREE=await L.THREE();
 if(!THREE){console.log('SKIP '+'lint_tracks.js'+': three.js missing: run  npm i three@0.164.1 --no-save  (node_modules is not tracked)');return}
 const ss=/bxSS=([^,;]+)[,;]/.exec(L.JSCODE());
 const pre='const bxSS='+ss[1]+';\nconst bxCl=(v,a,b)=>v<a?a:v>b?b:v;\n'+L.lineSrc('bxRamp')+'\n'+L.lineSrc('bxCurve')+'\n'+L.lineSrc('bxBowl')+'\n';
 const S=L.sandbox(['BXF','BXC','BXH','BXRW','fn:BX_exit','BX_P','BX_PAL','BX_PROF','BX_RAIL','bxRep','fn:bxCh','BX_WORLDS','BXN','BX_OFF'],{THREE},'',pre);
 const {BX_P,BX_PAL,BX_PROF,BX_RAIL,BXC,BXH,BXRW,BX_WORLDS,BXN}=S;const BXO=-BXN*BXC/2;
 // demos: run the real Object.assign(BX_DEMOS,{...}) statement
 const src=L.JSCODE(),i0=src.indexOf('Object.assign(BX_DEMOS,{'),i1=L.bal(src,i0+'Object.assign'.length);
 const D=S.ctx.BX_DEMOS={};require('vm').runInContext('BX_DEMOS={};'+src.slice(i0,i1+1),S.ctx);const DEMOS=S.ctx.BX_DEMOS;
 T.group('tracks-pieces');
 const keys=Object.keys(BX_P);T.ok(keys.length>=20,'piece-count','only '+keys.length);
 for(const k of BX_PAL)T.ok(BX_P[k],'palette-piece-exists-'+k,'palette lists a missing piece');
 for(const k of keys){const P=BX_P[k];
  T.ok(P.n&&Array.isArray(P.p)&&P.p.length>=1&&Array.isArray(P.ex)&&P.ex.length===P.p.length||P.ex.length>=1,'shape-'+k);
  T.ok(P.k>0,'cost-'+k);
  const f=P.p[0];let ok=true,maxg=0,bad='',prev=null,jump=0;
  for(let n=0;n<=60;n++){const t=n/60,q=f(t);if(!(q.length===3&&q.every(isFinite))){ok=false;bad='t='+t;break}
   if(prev){const dx=q[0]-prev[0],dy=q[1]-prev[1],dz=q[2]-prev[2],h=Math.hypot(dx,dz);jump=Math.max(jump,Math.hypot(dx,dy,dz));if(h>.05)maxg=Math.max(maxg,Math.abs(dy)/h)}prev=q}
  T.ok(ok,'path-finite-'+k,bad);
  T.ok(jump<3,'path-continuous-'+k,'sample step '+jump.toFixed(2)+' m');
  const a=f(0);T.ok(Math.abs(a[0])+Math.abs(a[1])+Math.abs(a[2])<1e-9,'path-starts-at-origin-'+k);
  const legacy=/1$/.test(k)&&!BX_PAL.includes(k);
  if(!P.jump&&k!=='lp'&&!legacy)T.ok(maxg<=.225,'grade-<=22pct-'+k,'peak grade '+(maxg*100).toFixed(1)+'%');
  if(P.bank)for(let n=0;n<=20;n++){const b=P.bank(n/20);if(!(isFinite(b)&&Math.abs(b)<=1.3)){T.ok(false,'bank-sane-'+k,'bank '+b);break}}
  if(P.p.length===1&&!P.jump&&k!=='lp'){const e=f(1);T.ok(Math.abs(e[1]-P.ex[0][2]*BXH)<=Math.max(1.2,Math.abs(e[1])*.35)||P.ex[0][2]===0&&Math.abs(e[1])<=1,'exit-height-matches-'+k,'path ends '+e[1].toFixed(2)+' m, exit says '+P.ex[0][2]+' levels (×'+BXH+')')}
 }
 // rails: every normal piece is drawn with BX_PROF + BX_RAIL (not forks/merges); the rail wall must exist on both sides and be tall enough to stop a car
 T.group('tracks-rails');
 T.ok(BX_RAIL.length>=6,'rail-profile-segments','rail segments '+BX_RAIL.length);
 const lx=BX_RAIL.filter(e=>e[0]<0&&e[2]<0),rx=BX_RAIL.filter(e=>e[0]>0&&e[2]>0);
 T.ok(lx.length>=3&&rx.length>=3,'rails-both-sides','left '+lx.length+' right '+rx.length);
 const top=Math.max(...BX_RAIL.flatMap(e=>[e[1],e[3]]));T.ok(top>=1.0,'rail-height>=1m','top '+top+' m');
 T.ok(Math.min(...BX_RAIL.flatMap(e=>[e[0],e[2]]))<=-BXRW&&Math.max(...BX_RAIL.flatMap(e=>[e[0],e[2]]))>=BXRW,'rails-outside-road','rails inside the road width '+BXRW);
 T.ok(BX_RAIL.every(e=>e.slice(0,4).every(isFinite)),'rail-finite');
 for(const [n,e] of BX_PROF.entries())if(n>0){const p=BX_PROF[n-1];T.ok(Math.abs(p[2]-e[0])<1e-9&&Math.abs(p[3]-e[1])<1e-9,'profile-continuous-'+n,'gap between profile segs '+(n-1)+' and '+n)}
 for(const [n,e] of BX_RAIL.entries())if(n>0&&n%3!==0){const p=BX_RAIL[n-1];T.ok(Math.abs(p[2]-e[0])<1e-9&&Math.abs(p[3]-e[1])<1e-9,'rail-continuous-'+n,'gap in rail wall seg '+n)}
 // demos
 T.group('tracks-demos');
 const names=Object.keys(DEMOS);T.ok(names.length>=3,'demo-count','demos: '+names);
 for(const nm of names){const log=DEMOS[nm].log,pcs=log.filter(a=>a[0]==='p');
  T.ok(pcs.length>=8,'pieces-'+nm,pcs.length+' pieces');
  T.ok(pcs.every(a=>BX_P[a[1]]),'known-pieces-'+nm,'unknown piece in log');
  T.ok(pcs.some(a=>a[1]==='sf'),'has-start-'+nm);T.ok(pcs.some(a=>a[1]==='cp'),'has-checkpoint-'+nm);
  // boat crossings (trk-2): a lane may end in the lake and the course go on from a ramp that starts in the lake (the car is a boat between them),
  // like the in-game BX_data rule (exits into water are allowed). Water = terrain < -0.7 m under the cell; such pieces may start below sea level.
  const wf=(BX_WORLDS[(log.find(a=>a[0]==='w')||[])[1]]||{}).f,wet=c=>!!wf&&wf(BXO+(c.i+.5)*BXC,BXO+(c.j+.5)*BXC)<-.7&&c.l*BXH<=.5;
  const key=c=>c.i+','+c.j+','+c.l+','+c.r,exits=new Set(),starts=new Map();let gaps=[],dups=[],wetStarts=new Set();
  pcs.forEach((a,n)=>{const c={i:a[2],j:a[3],l:a[4],r:a[5]},k=key(c);if(n>0&&!exits.has(k)){if(wet(c))wetStarts.add(n);else gaps.push(n+':'+a[1]+'@'+k)}if(starts.has(k)&&!['mg'].includes(a[1]))dups.push(n+':'+a[1]+'@'+k);starts.set(k,1);
   for(const e of BX_P[a[1]].ex)exits.add(key(S.BX_exit(c,e)))});
  T.ok(gaps.length===0,'no-gaps-'+nm,gaps.length+' pieces start where no piece ends: '+gaps.slice(0,4));
  T.ok(dups.length===0,'no-overlap-'+nm,dups.length+' pieces start in an occupied cell: '+dups.slice(0,4));
  const inb=pcs.every(a=>a[2]>=-2&&a[3]>=-2&&a[2]<=S.ctx.BXN+1&&a[3]<=S.ctx.BXN+1||true);void inb;
  // cell bounds (BXN = 56 since trk-2)
  T.ok(pcs.every(a=>a[2]>=-2&&a[3]>=-2&&a[2]<=BXN+1&&a[3]<=BXN+1),'in-world-bounds-'+nm,'a piece sits outside the '+BXN+'x'+BXN+' builder world');
  T.ok(pcs.every((a,n)=>a[4]>=0||wetStarts.has(n)),'above-sea-level-'+nm,'a piece at a negative height level (outside a boat crossing)');
  T.ok(wetStarts.size===0||pcs.some(a=>BX_P[a[1]].ex.some(e=>{const x=S.BX_exit({i:a[2],j:a[3],l:a[4],r:a[5]},e);return wet(x)&&!starts.has(key(x))})),'boat-crossing-has-splash-'+nm,'a lake restart with no lane ending in the lake');
 }
};
