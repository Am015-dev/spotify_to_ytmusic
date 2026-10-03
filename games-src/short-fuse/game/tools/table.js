// win-rate table from gauntlet json outputs: node tools/table.js out/gf_*.json
const fs=require('fs');const rows=process.argv.slice(2).flatMap(f=>JSON.parse(fs.readFileSync(f,'utf8')).rows);
const groups=[[1,3,'1-3 training'],[4,8,'4-8 training'],[9,19,'9-19'],[20,30,'20-30'],[31,42,'31-42'],[43,54,'43-54'],[55,66,'55-66']];
const cell=(rs)=>{const g=rs.reduce((a,r)=>a+r.g,0),w=rs.reduce((a,r)=>a+r.w,0);return g?`${Math.round(100*w/g)}% (${w}/${g})`:'-'};
let out='| Jobs | 2p | 3p | 4p | 5p | all |\n|---|---|---|---|---|---|\n';
for(const [a,b,l] of groups){const rs=rows.filter(r=>r.n>=a&&r.n<=b);out+=`| ${l} | ${[2,3,4,5].map(np=>cell(rs.filter(r=>r.np===np))).join(' | ')} | ${cell(rs)} |\n`}
out+=`| **all 66** | ${[2,3,4,5].map(np=>cell(rows.filter(r=>r.np===np))).join(' | ')} | ${cell(rows)} |\n`;
let per='\n| Job | win | Job | win | Job | win |\n|---|---|---|---|---|---|\n';const by={};for(const r of rows){by[r.n]=by[r.n]||{g:0,w:0,t:0};by[r.n].g+=r.g;by[r.n].w+=r.w;by[r.n].t+=r.turns}
for(let i=1;i<=22;i++){per+='| '+[i,i+22,i+44].map(n=>`${n} | ${by[n].w}/${by[n].g}`).join(' | ')+' |\n'}
console.log(out+per);
