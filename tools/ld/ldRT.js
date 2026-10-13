// tools/ld/ldRT.js <url> <converted.json> : round-trip check. Every converted part is drawn alone by the game code; its box must match the
// LDraw part's world box (from the .json, studs included). Prints the worst parts and RT_OK when all are within TOL (default 0.06 game units = 2 LDU).
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const R=JSON.parse(require('fs').readFileSync(process.argv[3]));const TOL=+(process.env.TOL||.06);
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});const p=await b.newPage();
 await p.goto(process.argv[2]);await p.waitForFunction(()=>window.__ld&&window.__mho,null,{timeout:240000});
 const res=await p.evaluate(B=>B.filter(b=>b._box).map((b,i)=>{const T=__ld.THREE,o=Object.assign({},b);delete o._box;try{CR_reg}catch(e){}const g=__ld.grp(__ld.fix([o])),X=new T.Box3().setFromObject(g);
  const d=Math.max(...[X.min.x-b._box[0],X.min.y-b._box[1],X.min.z-b._box[2],X.max.x-b._box[3],X.max.y-b._box[4],X.max.z-b._box[5]].map(Math.abs));return{i,t:b.t,d:+d.toFixed(3),ours:[...X.min.toArray(),...X.max.toArray()].map(v=>+v.toFixed(2)),ld:b._box}}),R.bricks);
 res.sort((a,c)=>c.d-a.d);const bad=res.filter(r=>r.d>TOL);for(const r of res.slice(0,+(process.env.N||8)))console.log(JSON.stringify(r));
 console.log(bad.length?'RT_FAIL':'RT_OK',R.model,'parts',res.length,'over',TOL,':',bad.length,'median',res[res.length>>1].d);await b.close()})();
