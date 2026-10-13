// node tools/roads/rdShot.js <url> <fra|ath> <outdir> <spec.json>: spec = [{x,z,sec,h,tag,pitch}] — park the player at (x,z) (or the start when x is null), step sec s,
// render one frame from an overhead/oblique camera (h m up), save <tag>.png (852x393). Also counts (rdXmon) per spot.
const enter=require('../../bc/enter.js');const fs=require('fs');const path=require('path');const[,,URL,CITY,OUT,SPEC]=process.argv;fs.mkdirSync(OUT,{recursive:true});
(async()=>{const seed=`localStorage.setItem('mho_slot','1');localStorage.setItem('mho_roam@1',JSON.stringify({tut:1,otg:{}}));localStorage.setItem('mho_city@1','${CITY}');localStorage.setItem('mho_athd@1','A');localStorage.setItem('mho_roam.ath@1','{"otg":{},"tut":1}')`;
 const E=await enter(URL,{gfx:process.env.GFX||'min',seed});const {p,errs}=E;p.setDefaultTimeout(1800000);await E.roamApi();if(process.env.NOSTUB)await p.evaluate(()=>window.__nostub=1);await p.waitForTimeout(1500);const dis=async()=>{for(let i=0;i<4;i++){const l=p.getByText('CONTINUE',{exact:false}).first();if(await l.count()&&await l.isVisible()){await E.tapEl(await l.elementHandle());await p.waitForTimeout(800)}else break}};await dis();
 await p.evaluate(()=>__g9ev(`{const _rc=roamCam;roamCam=function(){const r=_rc.apply(this,arguments);const o=window.__camO;if(o){camera.position.set(o.x+(o.ox||0),o.h,o.z+o.h*o.pitch);camera.lookAt(o.x,0,o.z);camera.updateMatrixWorld()}return r}}`));
 await p.evaluate(()=>{window.__R0=window.__dbg.composer.render;if(!window.__nostub)window.__dbg.composer.render=()=>{}});
 for(const s of JSON.parse(fs.readFileSync(SPEC,'utf8'))){if(s.x!=null)await p.evaluate(([x,z])=>__g9ev(`RO.x=${x};RO.z=${z};RO.v=0;if(pl){pl.x=${x};pl.z=${z}}`),[s.x,s.z]);
  for(let k=0;k<(s.sec||10)*60;k+=60)await p.evaluate(()=>{for(let i=0;i<60;i++){window.__tick(1);__g9ev('RO.v=0')}});
  await dis();await p.evaluate(s=>{const o=JSON.parse(__g9ev('JSON.stringify([RO.x,RO.z])'));window.__camO={x:s.x??o[0],z:s.z??o[1],h:s.h||60,pitch:s.pitch??.5,ox:s.ox||0};if(s.cam===false)window.__camO=null;window.__dbg.composer.render=window.__R0;__tick(2)},s);
  const du=await p.evaluate(()=>{__g9ev('composer.render()');return __g9ev('renderer.domElement.toDataURL("image/png")')});fs.writeFileSync(path.join(OUT,s.tag+'_c.png'),Buffer.from(du.split(',')[1],'base64'));
  await p.screenshot({path:path.join(OUT,s.tag+'.png')});await p.evaluate(()=>{window.__dbg.composer.render=()=>{}})}
 console.log('errors',errs.length,errs.slice(0,3).join(' | '));await E.b.close()})();
