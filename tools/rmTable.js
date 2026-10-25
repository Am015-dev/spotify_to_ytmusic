// racemode-r25a: docs/RACEMODE_TRIAGE.md from tools/tRaceMode.js output. node tools/rmTable.js <before dir> <after dir>[,<rerun dir>...] > docs/RACEMODE_TRIAGE.md (a later after dir replaces those rows)
const fs=require('fs'),[,,BD,AD]=process.argv,rd=(d,c)=>{try{return JSON.parse(fs.readFileSync(`${d}/${c}.json`,'utf8'))}catch(e){return[]}};
const y=b=>b?'✅':'❌',cell=(R,k)=>{if(!R)return'·';switch(k){case'picked':return y(R.picked)+(R.picked?'':' '+R.got);case'fin':return y(R.fin)+(R.place?' P'+R.place:'')+(R.t?' '+R.t+' s':'');
 case'stuck':return y(!R.stuck)+(R.stuck?' '+R.stuck:'');case'walls':return(R.walls<10?'✅ ':'❌ ')+R.walls;case'riv':return y(R.riv)+' '+R.rivN;case'fly':return y(!R.fly&&!R.sink)+(R.fly?' fly':'')+(R.sink?' sink':'');
 case'cam':return R.camOk==null?'·':y(R.camOk)+' '+R.camSay;case'err':return y(!(R.pageErr||[]).length&&!R.err&&!R.threw)}};
let o=`# Race mode triage (racemode-r25a, 2026-10-25)
Every race of the race menu, started through the real menu buttons (tab, city, track, START) on the BUILT page, phone profile (iPhone UA, 852x393 touch), driven by the human-like bot (0.15 s steering lag, arrow keys) on a stepped clock. Tool: \`tools/tRaceMode.js\`; GO \`race/racemode-all\` (\`src/99crm_racemode_go.js\`).
Before = same build with \`?stkcam=0\` (old race camera = beta.162 behaviour); after = this build. Columns: picked (the race that started is the one picked), finished (race types: player finished, not DNF; time trial: a lap; Zone/Arena/Derby/Crash Jct: ended with a result or ran 60 s), stuck (2 s standstill with gas), walls (speed halved from > 14 m/s; ✅ < 10), rivals (no rival left < 60 % of the player's distance at the finish), fly/sink (airborne > 6 s, or off its road plane), camera (cam/steady judge: <= 4 distance / FOV reversals per 10 s, zoom-out <= 2 m/s, FOV <= 8°/s), errors (page errors).
Shots: \`docs/shots/racemode/\`.

`;const tot={b:0,a:0,n:0};
for(const c of['fra','ath']){const B=rd(BD,c),A=[];for(const d of AD.split(','))for(const r of rd(d,c)){const k=A.findIndex(q=>q.n===r.n);if(k>=0)A[k]=r;else A.push(r)}o+=`## ${c==='fra'?'Frankfurt':'Athens'}\n| race | | picked | finished | stuck | walls | rivals | fly/sink | camera | errors |\n|---|---|---|---|---|---|---|---|---|---|\n`;
 const names=[...new Set([...A.map(r=>r.n),...B.map(r=>r.n)])];
 for(const n of names){const b=B.find(r=>r.n===n),a=A.find(r=>r.n===n);tot.n++;if(b&&b.ok)tot.b++;if(a&&a.ok)tot.a++;
  for(const[t,R]of[['before',b],['after',a]])if(R)o+=`| ${t==='before'?n:''} | ${t} | ${['picked','fin','stuck','walls','riv','fly','cam','err'].map(k=>cell(R,k)).join(' | ')} |\n`}o+='\n'}
o+=`Totals (all columns ✅): before ${tot.b}/${tot.n}, after ${tot.a}/${tot.n}.\n`;process.stdout.write(o);console.error(`before ${tot.b}/${tot.n} after ${tot.a}/${tot.n}`)
