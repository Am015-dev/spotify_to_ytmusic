// before/after tables from gauntlet json outputs: node tools/aitable.js <beforeDir> <afterDir>   (files normal_*.json / hard_*.json or b_<lv>_*.json)
const fs=require('fs'),path=require('path');const [bd,ad]=process.argv.slice(2);
const rowsOf=(dir,lv)=>fs.readdirSync(dir).filter(f=>f.endsWith('.json')&&(f.startsWith(lv+'_')||f.startsWith('b_'+lv+'_'))).flatMap(f=>JSON.parse(fs.readFileSync(path.join(dir,f))).rows);
const groups=[[1,3,'1-3'],[4,8,'4-8'],[9,19,'9-19'],[20,30,'20-30'],[31,42,'31-42'],[43,54,'43-54'],[55,66,'55-66'],[1,66,'**all**']];
const pct=rs=>{const g=rs.reduce((a,r)=>a+r.g,0),w=rs.reduce((a,r)=>a+r.w,0);return g?Math.round(100*w/g):NaN};
let out='';
for(const lv of ['normal','hard']){const B=rowsOf(bd,lv),A=rowsOf(ad,lv);out+=`\n#### ${lv}: win % before -> after (8 seeds per job and player count)\n\n| Jobs | 2p | 3p | 4p | 5p | all |\n|---|---|---|---|---|---|\n`;
  for(const [a,b,l] of groups){const f=(R,np)=>R.filter(r=>r.n>=a&&r.n<=b&&(np==null||r.np===np));out+=`| ${l} | ${[2,3,4,5,null].map(np=>`${pct(f(B,np))} -> ${pct(f(A,np))}`).join(' | ')} |\n`}}
const tj=[26,29,43,45,47,49,51,53,54,61,64,65,66];out+='\n#### Target jobs: wins (all player counts)\n\n| Job | normal before | normal after | hard before | hard after |\n|---|---|---|---|---|\n';
const cnt=(R,n)=>{const rs=R.filter(r=>r.n===n);return `${rs.reduce((a,r)=>a+r.w,0)}/${rs.reduce((a,r)=>a+r.g,0)}`};
const R={nb:rowsOf(bd,'normal'),na:rowsOf(ad,'normal'),hb:rowsOf(bd,'hard'),ha:rowsOf(ad,'hard')};
for(const n of tj)out+=`| ${n} | ${cnt(R.nb,n)} | ${cnt(R.na,n)} | ${cnt(R.hb,n)} | ${cnt(R.ha,n)} |\n`;
const sum=(R)=>`${R.reduce((a,r)=>a+r.w,0)}/${R.reduce((a,r)=>a+r.g,0)}`;out+=`\nTotals: normal ${sum(R.nb)} -> ${sum(R.na)}, hard ${sum(R.hb)} -> ${sum(R.ha)}\n`;
console.log(out);
