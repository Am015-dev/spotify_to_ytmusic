// tools/ld/tFacing.js <url> <out.json> [ids,..]: facing-1 audit dump. For every LDraw ride (presets t_v*, or the ids given) the car brick list exactly as the
// garage builds it (__g9c.bricks: SZ_add driver included), each brick with its LDraw design id (G13_ID), part name, colour, r, and its world box (game units,
// ride frame: front of a ride = -z, the driver figure faces -z at r 0). tools/ld/facing.py turns the dump into the audit table.
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const p=await b.newPage({viewport:{width:852,height:393}});const errs=[];p.on('pageerror',e=>errs.push(String(e)));
 await p.goto(process.argv[2],{timeout:0});await p.waitForFunction(()=>window.__mho&&window.__ld&&window.__g9c&&window.__LDX,null,{timeout:240000});
 const ids=process.argv[4]?process.argv[4].split(','):await p.evaluate(()=>Object.keys(__LDX.s).filter(k=>/^t_v/.test(k)));
 const out={};
 for(const id of ids){
  const r=await p.evaluate(async id=>{const S=__ld.set(id);if(!S||!S.car)return{err:'no set'};await __ld.need(__ld.probe(()=>__g9c.bricks(id,'car')));
   const B=__g9c.bricks(id,'car'),T=__ld.THREE,A=[];
   for(const b of B){const k=b.t.split('@')[0],P=__ld.PC[k]||{};let box=null;
    try{if(!(b.t==='drvM'&&b.y<=-90)){const g=__ld.grp(__ld.fix([Object.assign({},b)]));const bb=new T.Box3().setFromObject(g);if(!bb.isEmpty())box=[bb.min.x,bb.min.y,bb.min.z,bb.max.x,bb.max.y,bb.max.z].map(v=>+v.toFixed(3))}}catch(e){}
    A.push({t:b.t,id:__ld.ID[k]||null,n:P.n||'',c:b.c,r:b.r,m:b.m,x:b.x,y:b.y,z:b.z,box})}
   return{n:S.n,ref:S.ref,B:A}},id);
  out[id]=r;process.stdout.write(id+' '+(r.B?r.B.length:r.err)+'\n')}
 fs.writeFileSync(process.argv[3],JSON.stringify(out));console.log('ERR',JSON.stringify(errs.slice(0,5)));await b.close()})();
