// tVF: garage builder opened outside events (real click) holds the world; reopening + closing resumes it; camera offset count reported
const {boot}=require('./common.js');const F=require('./fast.js');let pass=0,fail=0;const ok=(c,m,i)=>{c?pass++:fail++;console.log((c?'PASS ':'FAIL ')+m+(i!==undefined?' · '+JSON.stringify(i):''))};
(async()=>{const r=await boot({view:'desk',page:process.env.PAGE||'local_dbg.html'});const p=r.p;await F.on(p);
 await p.evaluate(()=>__mho.roamSim(30));await p.keyboard.press('Escape');await p.waitForTimeout(200);
 await p.click('#roamPause [data-p="garage"]');await p.waitForTimeout(400);const open=await p.evaluate(()=>!document.querySelector('#gbx').hidden);
 const st=()=>p.evaluate(()=>[__mho.RO.x,__mho.RO.z]);let a=await st();await p.keyboard.down('ArrowUp');await p.evaluate(()=>__mho.roamSim(120));await p.keyboard.up('ArrowUp');let b=await st();
 ok(open&&Math.hypot(b[0]-a[0],b[1]-a[1])<1,'garage builder open (outside events): gas does not move the car',{open,moved:+Math.hypot(b[0]-a[0],b[1]-a[1]).toFixed(1)});
 await p.evaluate(()=>document.querySelector('#gbBack').click());await p.waitForTimeout(400);
 a=await st();await p.keyboard.down('ArrowUp');await p.evaluate(()=>__mho.roamSim(120));await p.keyboard.up('ArrowUp');b=await st();
 ok(Math.hypot(b[0]-a[0],b[1]-a[1])>5,'builder closed: car drives again',{moved:+Math.hypot(b[0]-a[0],b[1]-a[1]).toFixed(1),hold:await p.evaluate(()=>__vf.hold())});
 ok(!r.errs.length,'no page errors',r.errs);await r.b.close();console.log(`tVF: ${pass} pass, ${fail} fail`);process.exit(fail?1:0)})();
