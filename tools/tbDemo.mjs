// tbDemo.mjs — design helper for builder tracks: node tools/tbDemo.mjs in.json out.json "<scale>" ; places pieces by lap fraction (spec inside)
import * as THREE from '../node_modules/three/build/three.module.js';import fs from 'fs';
const src=fs.readFileSync(new URL('../src/98tb_track_builder.js',import.meta.url),'utf8');const a=src.indexOf('const TB_TERS'),b=src.indexOf('/* ---------------- builder JSON');
const V3=(x,y,z)=>new THREE.Vector3(x,y,z),clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const T=new Function('THREE','V3','clamp',src.slice(a,b)+';return{TB_lint,TB_geo,TB_V};')(THREE,V3,clamp);
const t=JSON.parse(fs.readFileSync(process.argv[2],'utf8')),spec=JSON.parse(fs.readFileSync(process.argv[4],'utf8'));
if(spec.pts)t.pts=spec.pts;Object.assign(t,spec.meta||{});const g=T.TB_geo(t);t.pc=[];
for(const[k,f,n]of spec.pc){const i=Math.floor(((f%1)+1)%1*g.N);const p={k,x:Math.round(g.X[i]),z:Math.round(g.Z[i])};if(n)p.n=n;t.pc.push(p)}
if(spec.st!=null){const p=t.pts[spec.st];t.st=[p[0],p[1]]}
fs.writeFileSync(process.argv[3],JSON.stringify(t));
// print sample table: fraction → x,z,R,y,seg
const L=T.TB_lint(t);for(let q=0;q<40;q++){const i=Math.floor(q/40*g.N);console.log((q/40).toFixed(3),Math.round(g.X[i]),Math.round(g.Z[i]),'R',Math.round(1/Math.max(1e-5,Math.abs(g.K[i])))*Math.sign(g.K[i]),'y',g.Y[i].toFixed(0),'seg',g.SEG[i],'t',(L.g.T[i]*T.TB_V.cal).toFixed(1))}
