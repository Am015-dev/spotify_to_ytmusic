// ath/v88x/adprobe.js <url> : Athens dressing stats at the 3 close.js spots
const enter=require('../../bc/enter.js');const URL=process.argv[2];
(async()=>{const seed=`localStorage.setItem('mho_slot','1');localStorage.setItem('mho_roam@1',JSON.stringify({tut:1,otg:{}}));localStorage.setItem('mho_city@1','ath');localStorage.setItem('mho_athd@1','A');localStorage.setItem('mho_roam.ath@1','{"otg":{},"tut":1}');localStorage.setItem('mho_story.ath@1','{"seen":1}')`;
 const E=await enter(URL,{gfx:'normal',seed});const {p,errs}=E;p.setDefaultTimeout(900000);await E.roamApi();await p.waitForTimeout(4000);
 for(const [x,z,h] of JSON.parse(require('fs').readFileSync('ath/v88w/spots_ath.json','utf8'))){await p.evaluate(([x,z,h])=>{const M=__mho,R=M.RO;M.warp(x,z,h,performance.now());R.x=x;R.z=z;R.y=M.gnd(x,z,R.y+60);R.v=0;R.vh=h;R.h=h},[x,z,h]);await p.waitForTimeout(3000);
  console.log(await p.evaluate(()=>{const N=__g9ev('HUB.nodes'),R=__g9ev('RO');let b=null,bd=1e9;for(const n of N){const d=(n.x-R.x)**2+(n.z-R.z)**2;if(d<bd&&!n.ab){bd=d;b=n}}return JSON.stringify([__g9ev('AD.n'),{w:b.w,pw:b.pw,g:b.g}])}))}
 console.log('errors',errs.length,errs.slice(0,3));process.exit(0)})();
