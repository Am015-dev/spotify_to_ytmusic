'use strict';
// ROAD GRAPH + PLACEMENT lint on the Frankfurt (rf-data) and Athens (ath-data net, decoded with the game's own athNetDecode) data, in data metres.
const L=require('./lib.js');
const seg=(p,a,b)=>{const dx=b[0]-a[0],dy=b[1]-a[1],l=dx*dx+dy*dy;let t=l?((p[0]-a[0])*dx+(p[1]-a[1])*dy)/l:0;t=t<0?0:t>1?1:t;return Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dy)};
class Grid{constructor(ways,cell){this.c=cell||200;this.m=new Map();this.ways=ways;ways.forEach((w,i)=>{for(let k=0;k<w.pts.length-1;k++){const a=w.pts[k],b=w.pts[k+1],x0=Math.floor(Math.min(a[0],b[0])/this.c)-1,x1=Math.floor(Math.max(a[0],b[0])/this.c)+1,y0=Math.floor(Math.min(a[1],b[1])/this.c)-1,y1=Math.floor(Math.max(a[1],b[1])/this.c)+1;
   for(let x=x0;x<=x1;x++)for(let y=y0;y<=y1;y++){const key=x+','+y;let l=this.m.get(key);if(!l)this.m.set(key,l=[]);l.push([i,a,b])}}})}
 near(p,r,skip){let best=1e9,bi=-1;const R=Math.ceil(r/this.c);const cx=Math.floor(p[0]/this.c),cy=Math.floor(p[1]/this.c);
  for(let x=cx-R;x<=cx+R;x++)for(let y=cy-R;y<=cy+R;y++){const l=this.m.get(x+','+y);if(!l)continue;for(const [i,a,b] of l){if(i===skip)continue;const d=seg(p,a,b);if(d<best){best=d;bi=i}}}return{d:best,i:bi}}}
module.exports=T=>{
 global.atob=global.atob||(s=>Buffer.from(s,'base64').toString('binary'));
 const F=L.FRA(),A=L.ATH();
 const Fw=F.streets.map(s=>({id:s[0],name:s[1],cls:s[2],w:s[3],pts:s[4]}));
 const Aw=L.ev(L.fnSrc('athNetDecode'),{RF:A,atob:global.atob})();
 if(L.SEED==='ath-zero'&&Aw[5])Aw[5].pts.splice(1,0,Aw[5].pts[0].slice());
 const CITY={fra:{ways:Fw,box:[-3000,3000,-3000,3000],hw:s=>s.w/2},ath:{ways:Aw,box:A.box,hw:s=>s.w/2}};
 // FRA box: from the data extent of the major streets +- margin
 {const xs=Fw.flatMap(s=>s.pts.map(p=>p[0])),ys=Fw.flatMap(s=>s.pts.map(p=>p[1]));CITY.fra.box=[Math.min(...xs),Math.max(...xs),Math.min(...ys),Math.max(...ys)]}
 for(const c of ['fra','ath']){
  T.group('roads-'+c);const {ways,box}=CITY[c],G=new Grid(ways.filter(w=>w.cls!=='ped'));const nw=G.ways;
  T.ok(ways.length>=(c==='fra'?20:3000),'way-count','ways '+ways.length);
  let bad={fin:0,short:0,dup:0,rev:0,long:0,wid:0},ex={};
  const note=(k,w,extra)=>{bad[k]++;(ex[k]=ex[k]||[]).length<3&&ex[k].push((w.name||w.id)+(extra||''))};
  for(const w of ways){
   if(!(w.pts.length>=2))note('short',w);
   let okf=true;for(const p of w.pts)if(!(isFinite(p[0])&&isFinite(p[1])&&Math.abs(p[0])<2e4&&Math.abs(p[1])<2e4))okf=false;if(!okf)note('fin',w);
   for(let k=1;k<w.pts.length;k++){const a=w.pts[k-1],b=w.pts[k],d=Math.hypot(b[0]-a[0],b[1]-a[1]);if(d<.5)note('dup',w,'@'+k);if(d>(c==='fra'?2500:900))note('long',w,' '+d.toFixed(0)+'m');
    if(k<w.pts.length-1){const n=w.pts[k+1],ux=b[0]-a[0],uy=b[1]-a[1],vx=n[0]-b[0],vy=n[1]-b[1],lu=Math.hypot(ux,uy),lv=Math.hypot(vx,vy);if(lu>8&&lv>8&&(ux*vx+uy*vy)/(lu*lv)<-.94)note('rev',w,'@'+k)}}
   if(!(w.w>=4&&w.w<=40))note('wid',w,' w='+w.w)}
  T.ok(!bad.fin,'coords-finite',bad.fin+' ways with NaN/huge coords '+(ex.fin||[]));
  T.ok(!bad.short,'ways-have-2-points',bad.short+' ways <2 pts '+(ex.short||[]));
  T.ok(!bad.dup,'no-zero-length-edge',bad.dup+' zero-length edges '+(ex.dup||[]));
  T.ok(!bad.rev,'no-hairpin-reversal',bad.rev+' >160° reversals '+(ex.rev||[]));
  T.ok(!bad.long,'no-teleport-edge',bad.long+' absurdly long edges '+(ex.long||[]));
  T.ok(!bad.wid,'width-4-to-40m',bad.wid+' bad widths '+(ex.wid||[]));
  // dead ends in-line: an arterial/main endpoint (inside the map, not by water) that touches no other road within 10 m
  const edge=60,inside=p=>p[0]>box[0]+edge&&p[0]<box[1]-edge&&p[1]>box[2]+edge&&p[1]<box[3]-edge;
  const cnt={arterial:0,main:0,ring:0},exs=[];
  for(const [i,w] of nw.entries()){if(!(w.cls in cnt))continue;for(const e of [w.pts[0],w.pts[w.pts.length-1]]){if(!inside(e))continue;const r=G.near(e,12,i);if(r.d>10){cnt[w.cls]++;exs.length<3&&exs.push((w.name||w.id)+'@'+e.join(','))}}}
  const budget=c==='fra'?{arterial:99,main:99,ring:0}:{arterial:30,main:40,ring:0};
  T.ok(cnt.arterial<=budget.arterial,'deadend-arterial',cnt.arterial+' arterial dead ends inside the map (budget '+budget.arterial+') '+exs);
  T.ok(cnt.main<=budget.main,'deadend-main',cnt.main+' main dead ends inside the map (budget '+budget.main+') '+exs);
  T.ok(cnt.ring<=2,'deadend-ring',cnt.ring+' ring dead ends (an open ring has 2 ends at the river)');
  // placements: landmark centres must not sit on a carriageway (building over road)
  const lms=(c==='fra'?F.lm:A.lm).map(l=>({id:l[0],name:l[1],p:[l[2],l[3]]}));
  const dead=[];for(const m of lms){const r=G.near(m.p,80);if(r.d<nw[r.i].w/2+3)dead.push(m.id+' '+r.d.toFixed(0)+'m from '+(nw[r.i].name||nw[r.i].id))}
  T.ok(!dead.length,'landmark-not-on-road',dead.join('; '));
  // spawn/taxi stands near a road (the filler grid covers the rest of Frankfurt, so 30 m to the MAJOR streets is the bar for the named ones)
  const taxis=c==='fra'?F.taxi:A.taxi;
  taxis.forEach((t,i)=>{const r=G.near(t,300);T.ok(r.d<=30,'taxi-on-road-'+i,'stand '+t+' is '+r.d.toFixed(0)+' m from the nearest road')});
  if(c==='fra'){const g=F.spots.garage,r=G.near(g,300);T.ok(r.d<=30,'garage-spawn-on-road','garage spot '+g+' is '+r.d.toFixed(0)+' m from a road')}
  else{A.garages.forEach(g=>{const r=G.near([g[2],g[3]],300);T.ok(r.d<=30,'garage-on-road-'+g[0],'garage '+g[0]+' is '+r.d.toFixed(0)+' m from a road')});
   const g=A.spots.garage,r=G.near(g,300);T.ok(r.d<=30,'garage-spawn-on-road','garage spot '+g+' is '+r.d.toFixed(0)+' m from a road')}
  // quests/spots must be inside the playable box
  const sp=Object.entries((c==='fra'?F:A).spots).filter(([k,v])=>Array.isArray(v)&&v.length>=2&&typeof v[0]==='number'&&typeof v[1]==='number');
  T.ok(sp.length>=(c==='fra'?30:2),'spots-parsed','only '+sp.length+' numeric spots');
  for(const [k,v] of sp)T.ok(isFinite(v[0])&&isFinite(v[1])&&Math.abs(v[0])<3e4&&Math.abs(v[1])<3e4,'spot-finite-'+k,k+'='+v);
 }
 // Frankfurt bridges must cross the river: both approach ends within the street/quay box and deck width sane
 T.group('roads-fra-bridges');
 for(const b of F.bridges)T.ok(b[4]>=4&&b[4]<=60&&b[2]!==b[3],'bridge-'+b[0],b[0]+' w='+b[4]);
 const q=F.quays;T.ok(q.length===2,'quays-two');for(const k of q)T.ok(Math.abs(k[4])<5000&&Math.abs(k[5])<5000&&k[4]<k[5],'quay-span-'+k[0],k[0]+' span '+k[4]+'..'+k[5]);
};
