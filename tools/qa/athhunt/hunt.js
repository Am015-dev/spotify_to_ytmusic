const L=require('/home/user/spotify_to_ytmusic/tools/qa/lib.js'),fs=require('fs');
const OUT=process.argv[2]||'h',SEED=+(process.argv[3]||1),AT=process.argv[4]||'',MIN=+(process.argv[5]||3);fs.mkdirSync(OUT,{recursive:true});
const src=fs.readFileSync(__dirname+'/drv_page.js','utf8');
(async()=>{const S=await L.open({base:'/home/user/spotify_to_ytmusic/out/athbugs',city:'ath',at:AT||undefined,extra:{lowmem:'auto'}});
 await S.p.evaluate(s=>window.__qa.ev('window.__drv='+s),src);
 if(SEED>1)console.log('WARP',await L.ev(S.p,`(()=>{const C=CITY_S.filter(S=>S.r&&S.r.cls!=='ped'&&S.L>150);const S=C[(${SEED}*397)%C.length];const p=S.pts[S.pts.length>>1];roamWarp(p.x,p.z,Math.atan2(p.tx,p.tz));__qa.step(10,.05);return [Math.round(RO.x),Math.round(RO.z),S.r.n||'']})()`));const res=[];for(let k=0;k<MIN*2;k++){const o=await S.p.evaluate(a=>window.__drv(a[0],a[1]),[SEED*100+k,30]);res.push(o);}
 const an=await L.ev(S.p,'JSON.stringify(window.__drvA)'),bugs=await L.ev(S.p,'JSON.stringify((window.__bugs||[]).map(b=>({name:b.name,x:Math.round(b.x),z:Math.round(b.z),n:b.n,d:b.d})))');
 const hud=await L.ev(S.p,`(()=>{const ctl=[...document.querySelectorAll('[id*=pad],[id*=btn],[id*=Btn],.tb,button')].filter(e=>e.offsetWidth&&e.getBoundingClientRect().bottom>200);const hudE=[...document.querySelectorAll('#roam > *,#hud > *')].filter(e=>e.offsetWidth&&e.textContent.trim());const o=[];for(const h of hudE){const a=h.getBoundingClientRect();for(const c of ctl){if(c===h||h.contains(c)||c.contains(h))continue;const b=c.getBoundingClientRect();const ix=Math.min(a.right,b.right)-Math.max(a.left,b.left),iy=Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top);if(ix>6&&iy>6)o.push((h.id||h.className)+' x '+(c.id||c.className))}}return JSON.stringify([...new Set(o)].slice(0,8))})()`);
 const rinfo=await L.ev(S.p,'JSON.stringify({calls:renderer.info.render.calls,tris:renderer.info.render.triangles})');
 await S.p.evaluate(()=>__tq.draw()).catch(()=>{});await S.p.screenshot({path:OUT+'/end.jpg',type:'jpeg',quality:60});
 fs.writeFileSync(OUT+'/res.json',JSON.stringify({res,an:JSON.parse(an),bugs:JSON.parse(bugs),hud,rinfo,errs:S.errs},null,1));
 const A=JSON.parse(an),c={};for(const a of A)c[a.k]=(c[a.k]||0)+1;const B={};for(const b of JSON.parse(bugs))B[b.name]=(B[b.name]||0)+1;
 console.log('ROUTE',SEED,'dist',res.reduce((a,b)=>a+b.dist,0),'m anomalies',JSON.stringify(c),'bugs',JSON.stringify(B),'errs',S.errs.length,'hud',hud);
 await S.close();process.exit(0)})().catch(e=>{console.log('CRASH',String(e).slice(0,300));process.exit(1)});
