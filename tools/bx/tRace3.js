// trk-3 checks for Alex's beta.36 portrait race (FAIL lines only). VP=393x852 (default) or 852x393. node tools/bx/tRace3.js [shot.png]  (~2 min)
// bx-race-hud: position box + timer fully on screen, >= 100 px down in portrait, clear of buttons (after GO)
// bx-race-pack: the route-following driver (real touch, neutral pace) races 30 s; the nearest rival is never > 60 m away
// bx-look: pad/lip colours, 0 pillars through a deck, 0 near-coplanar transparent meshes, normalBias, trackside dressing
const L=require('./lib.js');process.env.VP=process.env.VP||'393x852';
(async()=>{const {b,p,cdp,E}=await L.launch();const out=[];const run=async(id,fn)=>{await p.evaluate(id=>__chk.go('bxT/'+id),id);await L.sleep(300);await fn();const c=await p.evaluate(id=>__bx.check(id),id);out.push(`${id} ${c.ok?'PASS':'FAIL'} ${c.msg}`)};
 await run('bx-race-hud',()=>p.waitForFunction(()=>__bx.race()&&__bx.race().cd<=0&&__bx.race().t>1,null,{timeout:90000}));
 await run('bx-race-pack',async()=>{await p.waitForFunction(()=>__bx.race()&&__bx.race().cd<=0,null,{timeout:90000});const sh=process.argv[2];
  await L.drive(p,cdp,{secs:32,out:sh?require('path').dirname(sh):'.',tag:sh?require('path').basename(sh,'.png'):'x',shots:sh?{race:s=>s.m.t>9}:{}}).catch(e=>out.push('drive error '+e.message));});
 await run('bx-look',()=>L.sleep(1500));
 await run('bx-clear',()=>L.sleep(500));
 for(const o of out)console.log(o);console.log('errors',E.length?E.slice(0,3).join(' / '):'none');await b.close()})();
