// physics dev run: load a log (dev shortcut), tap DRIVE, drive the route with real touch holds, print a trace + shots
const L=require('./lib.js');const fs=require('fs');
(async()=>{const {b,p,E,cdp}=await L.launch();await L.tapEl(p,cdp,'#bxMenuBtn');await L.sleep(1500);
 const P=(t,i,j,l,r)=>['p',t,i,j,l,r];
 const log=[['w','meadow'],P('sf',20,8,1,0),P('st',20,9,1,0),P('st',20,10,1,0),P('up',20,11,1,0),P('st',20,13,2,0),P('kk',20,14,2,0),P('st',20,18,2,0),P('dn',20,19,2,0),P('lp',20,21,1,0),P('st',21,23,1,0),P('br',21,24,1,0),P('wr',24,26,1,1)];
 await p.evaluate(l=>__bx.load({log:l},'DEV'),log);await L.sleep(1500);await L.shot(p,'qa_bx/dev_build.png');
 await L.tapEl(p,cdp,'#bxGo');await L.sleep(800);
 const r=await L.drive(p,cdp,{secs:30,out:'qa_bx',tag:'dev',shots:{air:s=>!s.v.g&&s.v.air>.5,loop:s=>s.v.Uy<-.5,start:s=>s.m.t>1.5,wall:s=>s.v.on==='wr'&&s.v.Uy<.5}});
 fs.writeFileSync('qa_bx/dev_trace.json',JSON.stringify(r.info));console.log(JSON.stringify(r.s.m));console.log(r.info.filter((x,i)=>i%5==0).map(x=>x.map(v=>typeof v=='number'?+v.toFixed(1):v).join(' ')).join('\n'));
 console.log(E.length?E.join('\n'):'NO_ERRORS');await b.close()})();
