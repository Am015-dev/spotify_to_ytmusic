const L=require('./lib.js');(async()=>{const T=await L(process.argv[2],process.argv[3]);const{tap,ev,shot}=T;
 await tap('#gbMenuBtn');await T.pg.waitForTimeout(1500);await shot('g0');
 await tap('#r2R [data-r2m="build"]');await T.pg.waitForTimeout(2500);await shot('b0');
 console.log(JSON.stringify(await ev(()=>{const o=[];for(const e of document.querySelectorAll('#gbx button')){const r=e.getBoundingClientRect();if(r.width&&r.bottom>0&&r.top<innerHeight&&getComputedStyle(e).visibility!=='hidden')o.push([e.dataset.a||e.dataset.r2b||e.dataset.r2a||e.dataset.p||e.dataset.ct||e.dataset.r2h||e.dataset.r2m||e.id||e.textContent.trim().slice(0,10),Math.round(r.x),Math.round(r.y),Math.round(r.width),Math.round(r.height)])}return o})));
 console.log('parts',await ev(()=>__gb.list().length),'bp',await ev(()=>__gb.d().bp),'cells',await ev(()=>__gb.cells().length));
 await T.close()})();
