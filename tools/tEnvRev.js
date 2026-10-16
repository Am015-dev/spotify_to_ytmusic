// tEnvRev (env-rev): 8 environment shots (852x393) on the BUILT page. node tools/tEnvRev.js <base url> <outdir>
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');const [BASE,OUT]=process.argv.slice(2);fs.mkdirSync(OUT,{recursive:true});
(async()=>{
 for(const c of(process.env.CITIES||'fra,ath').split(',')){const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const p=await b.newPage({viewport:{width:852,height:393}});
  p.on('pageerror',e=>console.log('ERR',e.message.slice(0,120)));p.on('console',m=>{if(m.type()==='error'&&/shader|THREE|env1/i.test(m.text()))console.log('CERR',m.text().slice(0,300))});
  await p.goto(BASE+'?test='+c+'&q=high'+(process.env.Q||''));/* env-1: Q='&env1=0' for the before shots */await p.waitForFunction(()=>window.__chk&&window.__bv,null,{timeout:300000});await p.waitForTimeout(4000);
  // pick spots in-page: returns [name,x,z,yaw]
  await p.evaluate(()=>{window.__dbg=true});
  const spots=await p.evaluate(c=>__oc.ev('('+(function(c){const out=[];const face=(x,z,tx,tz)=>Math.atan2(tx-x,tz-z);
   const place=(name,tx,tz,dist,hUp)=>{ // stand `dist` m from target on a free ring point, face it
     for(let r=dist;r<dist*2.5;r+=dist*.3)for(let a=0;a<6.28;a+=.4){const x=tx+Math.sin(a)*r,z=tz+Math.cos(a)*r;if(roamHit(x,z,3))continue;out.push([name,x,z,face(x,z,tx,tz)]);return}};
   if(c==='fra'){
    const W=WATERS.find(w=>/main/i.test(w.id+w.name))||WATERS[0];const m=W.pts[Math.floor(W.pts.length*.35)];place('fra_main_river',m.x,m.z,45);
    place('fra_taunus_hills',5200,4800,500);
    place('fra_berg_hill',HILL.cx,HILL.cz,420);
    place('fra_open_field',-1600,-2300,60);
   }else{
    const L=HILL_BY.lykavittos||HILLS[0],F=HILL_BY.filopappou||HILLS[1];place('ath_lycabettus',L.cx,L.cz,500);place('ath_filopappou',F.cx,F.cz,700);
    const k=__cvf.park();if(k)out.push(['ath_park',RO.x,RO.z,RO.h||0]);
    // coast: scan SW for water
    let best=null;for(let x=-6000;x<6000&&!best;x+=200)for(let z=-9000;z<-2000;z+=200){if(TR_Y(x,z)<-1.5&&!roamHit(x,z,3)){best=[x,z];break}}
    if(best)place('ath_sea',best[0],best[1],60);
   }
   return out}).toString()+')("'+c+'")'),c);
  console.log(c,JSON.stringify(spots.map(s=>s.map(v=>typeof v==='number'?Math.round(v*100)/100:v))));
  for(const [n,x,z,yaw] of spots.filter(s=>!process.env.ONLY||process.env.ONLY.split(',').includes(s[0]))){await p.evaluate(a=>__oc.ev('if("'+a[0]+'"!=="ath_park"){roamWarp('+a[1]+','+a[2]+','+a[3]+');RO.v=0;camSnap=true}'),[n,x,z,yaw]);await p.waitForTimeout(+process.env.WAIT||5000);await p.screenshot({path:`${OUT}/${n}.png`});console.log('shot',n)}
  // driving views: from start spot, give gas via __tq if available; else shoot chase cam
  await p.evaluate(()=>{try{__chk.go('bv1/'+(window.CID||'fra'))}catch(e){}});await p.waitForTimeout(15000);await p.screenshot({path:`${OUT}/${c}_drive.png`});console.log('shot',c+'_drive');
  await b.close()}
})();
