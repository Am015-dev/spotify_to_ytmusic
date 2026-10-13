// tbLint.mjs — run the builder lint (src/98tb_track_builder.js TB_geo/TB_lint) in node on a track JSON: node tools/tbLint.mjs track.json
import * as THREE from '../node_modules/three/build/three.module.js';import fs from 'fs';
const src=fs.readFileSync(new URL('../src/98tb_track_builder.js',import.meta.url),'utf8');
const a=src.indexOf('const TB_TERS'),b=src.indexOf('/* ---------------- builder JSON');
const V3=(x,y,z)=>new THREE.Vector3(x,y,z),clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const f=new Function('THREE','V3','clamp',src.slice(a,b)+';return{TB_lint,TB_geo,TB_V};');const T=f(THREE,V3,clamp);
const t=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));const L=T.TB_lint(t);
console.log('lap',L.lap.toFixed(1),'race',L.race.toFixed(1),'L',L.g&&L.g.L.toFixed(0),'corners',JSON.stringify((L.cor||[]).map(c=>Math.round(c.r)*c.sg)));
for(const r of L.rules)console.log((r.ok?'OK ':'XX ')+r.id+' '+r.name+': '+r.val+'  ('+r.need+')');for(const m of L.marks)console.log('  mark',m.t,Math.round(m.x),Math.round(m.z));
