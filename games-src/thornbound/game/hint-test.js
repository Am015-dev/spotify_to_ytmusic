// each command's one-line hint (CMD_L in src/ui1.js) must name the engine's real effect
const fs=require('fs');
const src=fs.readFileSync(__dirname+'/src/ui1.js','utf8');
const m=src.match(/const CMD_L=(\{[^\n]*\});/);
if(!m){console.log('FAIL: CMD_L not found');process.exit(1)}
const L=eval('('+m[1]+')');
const must={
 flank:[/moves/i,/another region|other region/i],
 rally:[/returns/i,/hand/i,/Active/i],
 deploy:[/hand card/i,/face-up/i,/region/i],
 deadly:[/ALL/,/rival/i,/Agent/i],
 ambush:[/late|joins/i],retreat:[/leaves|lost/i]};
const bad={flank:[/fights in the next/i],rally:[/Supporter/i],deploy:[/Supporter/i],deadly:[/a rival card/i]};
let fails=0;
for(const k in must){const t=L[k]||'';for(const r of must[k])if(!r.test(t)){fails++;console.log('FAIL',k,'missing',r,'in',t)}
 for(const r of (bad[k]||[]))if(r.test(t)){fails++;console.log('FAIL',k,'has wrong',r)}}
console.log(fails?'hint-test FAIL '+fails:'hint-test PASS ('+Object.keys(must).length+' commands)');
process.exit(fails?1:0);
