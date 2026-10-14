// qa-1 test 1+2: every runtime invariant and every error hook must fire on a planted fault (state-assert test), dedupe by name + 5 m cell, warn once/min.
// usage: node tools/qa/tInv.js [base url | out/<ver> dir]  [--city fra|ath]   → one PASS/FAIL line per case, exit 1 on any FAIL
const L=require('./lib');
const base=process.argv[2]&&!process.argv[2].startsWith('--')?process.argv[2]:undefined,ci=process.argv.indexOf('--city'),city=ci>0?process.argv[ci+1]:'fra';
// each case: setup (JS in game scope; may return a restore fn name via R), expect = bug name prefix; checks run through __qa.check()
const WALK=`RO.foot==='car'&&(OF_exit(),0);for(let i=0;i<40&&RO.foot!=='walk';i++)roamStep(1/60);RO.foot`;
const C=[
 ['nan_position',`window.__s=RO.v;RO.v=NaN;`,`RO.v=window.__s`,{}],
 ['ride_below_ground',`const ud=pl.mesh.userData;window.__y=ud.m.position.y;ud.m.position.y-=1.2;ud.m.updateMatrixWorld(true);`,`pl.mesh.userData.m.position.y=window.__y`,{}],
 ['wheel_gap',`const ws=[];pl.mesh.userData.m.traverse(w=>{if(w.isMesh&&w.userData.r)ws.push(w)});window.__w=ws[0];window.__wy=ws[0].position.y;ws[0].position.y+=.4;pl.mesh.userData.m.updateMatrixWorld(true);RO.v=0;`,`window.__w.position.y=window.__wy`,{settled:1}],
 ['ride_in_building',`let b=null;for(const[k,Ls]of HUB.grid){for(const q of Ls)if(q.hw>4&&q.hd>4&&q.h>12&&q.y0==null){b=q;break}if(b)break}window.__p=[RO.x,RO.z,RO.y];RO.x=b.x;RO.z=b.z;RO.y=(b.trY<1e8?b.trY:0);`,`RO.x=window.__p[0];RO.z=window.__p[1];RO.y=window.__p[2]`,{}],
 ['prop_on_road',`const r=cityAt(RO.x,RO.z);const q={t:'lamp',x:RO.x,z:RO.z,y:0,alive:true};window.__fake=q;HUB.props.push(q);`,`HUB.props.splice(HUB.props.indexOf(window.__fake),1)`,{}],
 ['camera_blocked',`let b=null;for(const[k,Ls]of HUB.grid){for(const q of Ls)if(q.hw>4&&q.hw<14&&q.hd>4&&q.h>12&&q.y0==null){b=q;break}if(b)break}window.__cp=camera.position.clone();window.__p=[RO.x,RO.z,RO.y];const d=b.hw+3;RO.x=b.x-d*(b.c??1);RO.z=b.z+d*(b.s??0);RO.y=(b.trY<1e8?b.trY:0);camera.position.set(b.x+d*(b.c??1),RO.y+3,b.z-d*(b.s??0));`,`RO.x=window.__p[0];RO.z=window.__p[1];RO.y=window.__p[2];camera.position.copy(window.__cp)`,{}],
 ['heading_reversed',`window.__p=[RO.x,RO.z,RO.h,RO.v];RO.h=0;RO.v=12;__qa.rev=.5;__qa.prev={x:RO.x,z:RO.z+6};`,`RO.x=window.__p[0];RO.z=window.__p[1];RO.h=window.__p[2];RO.v=window.__p[3]`,{noPrev:0}],
 ['hud_over_figure',`camSnap=true;roamCam(1/60);camera.updateMatrixWorld();const v=new THREE.Vector3(RO.x,RO.y+.8,RO.z).project(camera);const e=document.querySelector('#roamPlate');window.__e=e.getAttribute('style');const S={transition:'none',animation:'none',position:'fixed',display:'block',opacity:'1',visibility:'visible',width:'120px',height:'60px',left:((v.x+1)/2*innerWidth-60)+'px',top:((1-v.y)/2*innerHeight-30)+'px','z-index':'9'};for(const k in S)e.style.setProperty(k,S[k],'important');e.textContent='QA';`,`const e=document.querySelector('#roamPlate');if(window.__e==null)e.removeAttribute('style');else e.setAttribute('style',window.__e)`,{}],
 ['foot_float',WALK+`;window.__oy=OF.y;OF.y+=.4;OF.air=false;`,`OF.y=window.__oy`,{foot:1}],
 ['foot_in_building',`window.__o=[OF.x,OF.z,OF.y];let b=null;for(const[k,Ls]of HUB.grid){for(const q of Ls)if(q.hw>4&&q.hd>4&&q.h>12&&q.y0==null){b=q;break}if(b)break}OF.x=b.x;OF.z=b.z;OF.y=(b.trY<1e8?b.trY:0);`,`OF.x=window.__o[0];OF.z=window.__o[1];OF.y=window.__o[2]`,{foot:1}],
 ['npc_in_building',`let b=null,bd=1e9;for(const[k,Ls]of HUB.grid){for(const q of Ls)if(q.hw>3&&q.hd>3&&q.h>20&&q.y0==null){const d=Math.hypot(q.x-RO.x,q.z-RO.z);if(d<bd){bd=d;b=q}}}window.__pp=HUB.peds[0];window.__po=[__pp.x,__pp.z,__pp.y,RO.x,RO.z,RO.y];RO.x=b.x-(b.hw+3)*(b.c??1);RO.z=b.z+(b.hw+3)*(b.s??0);RO.y=(b.trY<1e8?b.trY:0);__pp.x=b.x;__pp.z=b.z;__pp.y=(b.trY<1e8?b.trY:0);`,`__pp.x=window.__po[0];__pp.z=window.__po[1];__pp.y=window.__po[2];RO.x=window.__po[3];RO.z=window.__po[4];RO.y=window.__po[5]`,{}],
];
(async()=>{const t0=Date.now();const S=await L.open({base,city});const p=S.p;let fail=0;
  const say=(ok,n,m)=>{console.log((ok?'PASS ':'FAIL ')+n+' '+m);if(!ok)fail++};
  const S0=JSON.parse(await L.ev(p,'JSON.stringify({x:RO.x,z:RO.z,h:RO.h})'));
  await L.ev(p,'__qa.step(90)');
  // a quiet world first: no bug in 3 s of idle driving state
  const q0=await L.ev(p,'__qa.step(120);JSON.stringify(__bugs.map(b=>b.name))');say(q0==='"[]"'.slice(1,-1)||q0==='[]','quiet-start','no invariant fires on an idle start: '+q0);
  for(const[name,setup,restore,o]of C.slice().sort((a,b)=>!!a[3].foot-!!b[3].foot)){
    // every case starts from the same quiet spot in the car (or on foot beside it)
    if(!o.foot)await L.ev(p,`roamWarp(${S0.x},${S0.z},${S0.h});for(let i=0;i<3;i++)roamStep(1/60);RO.v=0`);
    if(name==='prop_on_road'||name==='camera_blocked'||name==='ride_in_building'){/* car mode */}
    if(o.foot&&await L.ev(p,'RO.foot')!=='walk'){const r=await L.ev(p,WALK);if(r!=='walk'){say(false,name,'could not step out of the car ('+r+')');continue}}
    await L.ev(p,'__bugs.length=0;for(const k in __qa.hits)delete __qa.hits[k];__qa.warn={};');
    const e=await L.ev(p,setup);if(typeof e==='string'&&e.startsWith('ERR')){say(false,name,'setup '+e);continue}
    await L.ev(p,`__qa.check(${JSON.stringify(o)})`);
    const got=JSON.parse(await L.ev(p,'JSON.stringify(__bugs.map(b=>b.name+"|"+b.d+"|n"+b.n))'));
    const hit=got.find(g=>g.startsWith(name));say(!!hit,name,hit?hit:'NOT fired; got '+JSON.stringify(got)+' '+await L.ev(p,'JSON.stringify({x:RO.x,z:RO.z,y:RO.y,on:CE_onRoad(RO.x,RO.z),foot:RO.foot,st:state,err:__qa.err,ticks:__qa.ticks})'));
    if(name==='nan_position'){await L.ev(p,'__qa.check({})');const n2=JSON.parse(await L.ev(p,'JSON.stringify(__bugs.map(b=>b.n))'));say(n2.length===1&&n2[0]===2,'dedupe','same name + same cell twice = 1 entry, n=2: '+JSON.stringify(n2))}
    await L.ev(p,restore);
  }
  // error hooks
  await L.ev(p,'__bugs.length=0;for(const k in __qa.hits)delete __qa.hits[k]');
  await p.evaluate(()=>{setTimeout(()=>{throw new Error('qa-hook-throw')},0);Promise.reject(new Error('qa-hook-reject'));console.error('qa-hook-console');document.querySelector('canvas').dispatchEvent(new Event('webglcontextlost'))});
  await p.waitForTimeout(400);
  const hk=JSON.parse(await L.ev(p,'JSON.stringify(__bugs.map(b=>b.name+"|"+b.d.slice(0,40)+"|"+b.build))'));
  for(const n of['js_error','unhandled_rejection','console_error','webgl_context_lost'])say(hk.some(h=>h.startsWith(n)),'hook:'+n,(hk.find(h=>h.startsWith(n))||'missing; got '+JSON.stringify(hk)));
  // console.warn once per minute per name
  const w=await p.evaluate(()=>{const c=[];const w0=console.warn;console.warn=(...a)=>{c.push(a.join(' '))};__qa.warn={};__qa.bug('qa_probe',1,1,0,'a');__qa.bug('qa_probe',500,500,0,'b');__qa.bug('qa_probe',900,900,0,'c');console.warn=w0;return c.filter(x=>x.includes('qa_probe')).length});
  say(w===1,'warn-once','3 distinct-cell hits of one invariant → '+w+' console.warn within a minute');
  const ue=S.errs.filter(e=>!/qa-hook-/.test(e));say(ue.length===0,'page-errors','no uncaught page error besides the planted ones ('+ue.length+') '+(ue[0]||''));
  console.log(`${fail?'FAIL':'PASS'} tInv ${city} ${((Date.now()-t0)/1000).toFixed(0)} s, ${fail} failed`);await S.close();process.exit(fail?1:0)})().catch(e=>{console.log('FAIL tInv crashed: '+e);process.exit(2)});
