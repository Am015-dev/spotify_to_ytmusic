// tSpeed.js (v88z): real-input top-speed run. Holds ArrowUp (keys steer along the line) on the longest Autobahn and the longest city
// street, then ArrowUp+Shift (boost, meter filled once). Reports HUD km/h plateau, boost max, 0-100 time, per vehicle form.
// usage: node tools/tSpeed.js <url> <outdir> [forms=car,offroad]  · SHOTS=1 for 852×393 HUD shots at top and boost top
const fs=require('fs'),path=require('path');const {chromium}=require('/opt/node22/lib/node_modules/playwright');const {boot}=require('./d24lib.js');
const URL=process.argv[2],OUT=process.argv[3]||'qa_speed',FORMS=(process.argv[4]||'ship,offroad').split(',');fs.mkdirSync(OUT,{recursive:true});
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const {p,errs,shot}=await boot(b,{city:'fra',url:URL,phone:true});const res=[];
 const hud=()=>p.evaluate(()=>+(document.querySelector('#rgSpd')||{}).textContent||0);
 for(const form of FORMS)for(const ab of[true,false]){
  await p.evaluate(([form,ab])=>{const M=__mho,R=M.RO;R.ch=null;R.sp=null;window.__L=__qs.line(ab);const L=__L,i=Math.floor(L.length*.1);M.warp(L[i][0],L[i][1],Math.atan2(L[i+1][0]-L[i][0],L[i+1][1]-L[i][1]));
   R.vsel=form;window.__li=i},[form,ab]);await p.evaluate(()=>__tick(30));
  const drive=async(secs,boost,tag)=>{let kL=0,kR=0,mx=0,t100=null,hist=[];await p.keyboard.down('ArrowUp');if(boost){await p.evaluate(()=>{__qs.fill()});await p.keyboard.down('Shift')}
   for(let f=0;f<secs*60;f+=6){const o=await p.evaluate(()=>{const R=__mho.RO,L=__L;let bi=__li,bd=1e9;for(let k=Math.max(0,__li-5);k<Math.min(L.length,__li+60);k++){const d=Math.hypot(L[k][0]-R.x,L[k][1]-R.z);if(d<bd){bd=d;bi=k}}__li=bi;
     let k=bi,acc=0;while(k<L.length-1&&acc<30+Math.abs(R.v)*.6){acc+=Math.hypot(L[k+1][0]-L[k][0],L[k+1][1]-L[k][1]);k++}let e=Math.atan2(L[k][0]-R.x,L[k][1]-R.z)-R.h;e=Math.atan2(Math.sin(e),Math.cos(e));
     return{e,v:Math.abs(R.v)*3.6,end:k>=L.length-2,ab:!!R.onAB,city:!!R.inCity,veh:__qs.veh(),cls:__qs.cls()}});
    hist.push(o.v);mx=Math.max(mx,o.v);if(t100==null&&o.v>=100)t100=+(f/60).toFixed(1);if(o.end)break;
    const wl=o.e>.03,wr=o.e<-.03;if(wl!=kL){kL=wl;wl?await p.keyboard.down('ArrowLeft'):await p.keyboard.up('ArrowLeft')}if(wr!=kR){kR=wr;wr?await p.keyboard.down('ArrowRight'):await p.keyboard.up('ArrowRight')}
    await p.evaluate(()=>{for(const b of document.querySelectorAll('[data-r3u],#resBtn,#storyGo'))if(b.offsetWidth&&!b.closest('[hidden]'))b.click();__tick(6)});if(f%60===0)res.last=o}  // a person taps level-up / result cards away
   if(process.env.SHOTS){await shot(path.join(OUT,`hud_${form}_${ab?'autobahn':'city'}_${tag}.jpg`))}
   const h=await hud();if(boost)await p.keyboard.up('Shift');if(kL)await p.keyboard.up('ArrowLeft');if(kR)await p.keyboard.up('ArrowRight');
   const tail=hist.slice(-10);return{max:Math.round(mx),plateau:Math.round(tail.reduce((a,b)=>a+b,0)/Math.max(1,tail.length)),t100,hud:h}};
  const base=await drive(ab?45:30,false,'top');const bst=await drive(6,true,'boost');await p.keyboard.up('ArrowUp');
  const r={form,road:ab?'autobahn':'city',cls:res.last&&res.last.cls,veh:res.last&&res.last.veh,onAB:res.last&&res.last.ab,inCity:res.last&&res.last.city,top:base,boost:bst};res.push(r);console.log(JSON.stringify(r))}
 fs.writeFileSync(path.join(OUT,'speed.json'),JSON.stringify(res,null,1));console.log('SPEED done · errs',errs.length,errs.slice(0,3));await b.close()})();
