// built-in builder tracks: each test = the checklist's 📍 GO (window.__chk.go('bxT/<id>') -> BX_test), real touch driving along the course,
// then the page's own check. ONE browser session, all shots.  node tools/bx/tTracks.js [ids...]  -> qa_bx/trk_<id>_*.png + qa_bx/trk.json
const L=require('./lib.js');const fs=require('fs');
const RUNS={'bx-t-cliff':[[0]],'bx-t-city':[[0]],'bx-t-canyon':[[0],[1]]},SECS=+process.env.SECS||70;
(async()=>{const ids=process.argv.slice(2).length?process.argv.slice(2):Object.keys(RUNS);const {b,p,E,cdp}=await L.launch();const R={};
 for(const id of ids){const t0=Date.now();await p.evaluate(i=>__chk.go('bxT/'+i),id);await L.sleep(1500);
  const shots={start:s=>s.m.t>1.2,air:s=>!s.v.g&&!s.v.boat&&s.v.air>.5,high:s=>s.v.g&&s.v.p[1]>14,boat:s=>s.v.boat&&s.m.boat>.6,low:s=>s.v.g&&s.v.p[1]<4&&s.m.t>6,off:s=>s.v.g&&!s.v.on&&s.m.t>3};
  for(const ch of RUNS[id]){if(ch[0]===1){await L.tapEl(p,cdp,'#bxBack');await L.sleep(500);await L.tapEl(p,cdp,'#bxGo');await L.sleep(800)}
   let W=await p.evaluate(c=>__bx.route(c),ch);W=W.concat(W.slice(0,12));
   const rr=await L.drive(p,cdp,{secs:SECS,out:'qa_bx',tag:'trk_'+id+(ch[0]?'_b':''),shots,wpExtra:W,stopLaps:1,maxWall:SECS*3});
   fs.writeFileSync(`qa_bx/trace_${id}${ch[0]?'_b':''}.json`,JSON.stringify(rr.info));console.log(id,'run',ch[0]||0,'t',rr.s.m.t.toFixed(1),'laps',rr.s.m.laps,'resp',rr.s.m.resp,rr.s.m.respWhy.join(','))}
  R[id]=await p.evaluate(i=>__bx.check(i),id);R[id].wall=((Date.now()-t0)/1000|0)+'s';console.log(id,JSON.stringify(R[id]))}
 R['errors']={ok:E.length===0,msg:E.length+' console/page errors',err:E.slice(0,5)};console.log('errors',JSON.stringify(R.errors));
 fs.writeFileSync('qa_bx/trk.json',JSON.stringify(R,null,1));await b.close()})();
