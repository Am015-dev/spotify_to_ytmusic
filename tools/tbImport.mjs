// tbImport.mjs — turn an exported track code into an official race: node tools/tbImport.mjs <code|file> [--id tb_my_id] [--add]
// decodes the ODT1 code, writes docs/tracks/<id>.json, prints the lint (docs/TRACK_FUN.md); --add puts it into TB_BUILTIN (src/98tb_track_builder.js)
import * as THREE from '../node_modules/three/build/three.module.js';import fs from 'fs';
const a=process.argv.slice(2);let code=a.find(x=>!x.startsWith('--')&&a[a.indexOf(x)-1]!=='--id');if(code&&fs.existsSync(code))code=fs.readFileSync(code,'utf8');
const idA=a.includes('--id')?a[a.indexOf('--id')+1]:null,ADD=a.includes('--add');
const m=String(code||'').match(/ODT1:([A-Za-z0-9+/=]+)/);if(!m){console.error('no ODT1: code');process.exit(1)}
const t=JSON.parse(Buffer.from(m[1],'base64').toString('utf8'));if(idA)t.id=idA;if(!/^tb_/.test(t.id))t.id='tb_'+t.id;
fs.mkdirSync('docs/tracks',{recursive:true});fs.writeFileSync(`docs/tracks/${t.id}.json`,JSON.stringify(t));
const srcP='src/98tb_track_builder.js',src=fs.readFileSync(srcP,'utf8');const i0=src.indexOf('const TB_TERS'),i1=src.indexOf('/* ---------------- builder JSON');
const V3=(x,y,z)=>new THREE.Vector3(x,y,z),clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));const T=new Function('THREE','V3','clamp',src.slice(i0,i1)+';return{TB_lint};')(THREE,V3,clamp);
const L=T.TB_lint(t),ok=L.rules.filter(r=>r.ok).length;console.log(`${t.name} (${t.id}, ${t.city}, ${t.laps} laps) lap ${L.lap.toFixed(1)} s race ${L.race.toFixed(0)} s lint ${ok}/${L.rules.length}`);
for(const r of L.rules)if(!r.ok)console.log('  XX',r.id,r.name,r.val,'('+r.need+')');console.log('wrote docs/tracks/'+t.id+'.json');
if(ADD){const k='const TB_BUILTIN=[',p=src.indexOf(k);if(p<0){console.error('TB_BUILTIN not found');process.exit(1)}if(src.includes(`"id":"${t.id}"`)){console.error('already in TB_BUILTIN: '+t.id);process.exit(1)}
  fs.writeFileSync(srcP,src.slice(0,p+k.length)+JSON.stringify(t)+','+src.slice(p+k.length));console.log('added to TB_BUILTIN in '+srcP+' (shows under MY TRACKS for every player)')}
