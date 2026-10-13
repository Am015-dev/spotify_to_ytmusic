// tbDemo.mjs — design helper for builder tracks: node tools/tbDemo.mjs in.json out.json spec.json ; places pieces by lap fraction
// spec: {meta:{name,city,laps,road,desc}, pts:[[x,z,h,ter]…], st:<pt index>, pc:[[kind, fraction, name?, lateral offset m?]…]}
// (lm pieces: name = landmark type, offset = metres to the right (+) / left (−) of the track)
import * as THREE from '../node_modules/three/build/three.module.js';import fs from 'fs';
const src=fs.readFileSync(new URL('../src/98tb_track_builder.js',import.meta.url),'utf8');const a=src.indexOf('const TB_TERS'),b=src.indexOf('/* ---------------- builder JSON');
const V3=(x,y,z)=>new THREE.Vector3(x,y,z),clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const T=new Function('THREE','V3','clamp',src.slice(a,b)+';return{TB_lint,TB_geo,TB_V};')(THREE,V3,clamp);
const t=JSON.parse(fs.readFileSync(process.argv[2],'utf8')),spec=JSON.parse(fs.readFileSync(process.argv[4],'utf8'));
if(spec.turtle){// turtle: [["S",len,dh,ter],["L"|"R",radius,degrees,dh,ter]…] from (0,0) heading +x; points every ~70 m; prints the closing gap
  let x=0,z=0,h=spec.h0||4,a=0;const P=[[0,0,h,spec.turtle[0][3]||'grass']];
  for(const c of spec.turtle){const[k]=c;if(k==='S'){const[,len,dh,ter]=c,n=Math.max(1,Math.round(len/70));for(let q=1;q<=n;q++){x+=Math.cos(a)*len/n;z+=Math.sin(a)*len/n;h+=(dh||0)/n;P.push([x,z,h,ter||'grass'])}}
    else{const[,R,deg,dh,ter]=c,sg=k==='R'?1:-1,ang=deg*Math.PI/180,n=Math.max(2,Math.round(R*ang/60));for(let q=1;q<=n;q++){const da=sg*ang/n,cx=x-Math.sin(a)*R*sg,cz=z+Math.cos(a)*R*sg;a+=da;x=cx+Math.sin(a)*R*sg;z=cz-Math.cos(a)*R*sg;h+=(dh||0)/n;P.push([x,z,h,ter||'grass'])}}}
  const last=P.pop();console.log('turtle close gap',Math.round(last[0]),Math.round(last[1]),'dh',(last[2]-P[0][2]).toFixed(1),'heading',Math.round((a*180/Math.PI)%360));
  t.pts=P.map(p=>[Math.round(p[0]),Math.round(p[1]),Math.max(0,Math.round(p[2])),p[3]])}
else if(spec.pts)t.pts=spec.pts;Object.assign(t,spec.meta||{});const g=T.TB_geo(t);t.pc=[];
for(const[k,f,n,off]of spec.pc){const i=Math.floor(((f%1)+1)%1*g.N);const o=off||0,ab=Array.isArray(o),ah=typeof o==='string'&&o.startsWith('ahead');let p;if(ah){const[,D,A]=o.split(':').map(Number),an=Math.atan2(g.TZ[i],g.TX[i])+A*Math.PI/180;p={k,x:Math.round(g.X[i]+Math.cos(an)*D),z:Math.round(g.Z[i]+Math.sin(an)*D)}}else p=ab?{k,x:o[0],z:o[1]}:{k,x:Math.round(g.X[i]-g.TZ[i]*o),z:Math.round(g.Z[i]+g.TX[i]*o)};if(n)p.n=n;t.pc.push(p)}
if(spec.st!=null){const p=t.pts[spec.st];t.st=[p[0],p[1]]}
fs.writeFileSync(process.argv[3],JSON.stringify(t));
const L=T.TB_lint(t);if(process.env.TABLE)for(let q=0;q<40;q++){const i=Math.floor(q/40*g.N);console.log((q/40).toFixed(3),Math.round(g.X[i]),Math.round(g.Z[i]),'R',Math.round(1/Math.max(1e-5,Math.abs(g.K[i])))*Math.sign(g.K[i]),'y',g.Y[i].toFixed(0),'seg',g.SEG[i],'t',(L.g.T[i]*T.TB_V.cal).toFixed(1))}
console.log('lap',L.lap.toFixed(1),'race',L.race.toFixed(0),'L',L.g.L.toFixed(0),'corners',JSON.stringify(L.cor.map(c=>Math.round(c.r)*c.sg)));
for(const r of L.rules)if(!r.ok||process.env.ALL)console.log((r.ok?'OK ':'XX ')+r.id+' '+r.name+': '+r.val+'  ('+r.need+')');for(const m of L.marks)console.log('  mark',m.t,Math.round(m.x),Math.round(m.z));
console.log(L.rules.filter(r=>r.ok).length+'/'+L.rules.length);
