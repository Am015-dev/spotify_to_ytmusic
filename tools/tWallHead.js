// wallhit-r31e: head-on facade probe on the BUILT page (phone profile, 6x CPU). node tools/tWallHead.js <base url> <city> <episodes> [deg=0 head-on; 30 glance]
// Per episode: drive at a straight building face at 60 km/h, gas held, at DEG off the face normal; report speed 0.3 s after contact (as % of impact) and "inside" (car centre in a collider).
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const [BASE,C,NE,DEG]=process.argv.slice(2);
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const ctx=await b.newContext({viewport:{width:852,height:393},deviceScaleFactor:3,isMobile:true,hasTouch:true,userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mobile/15E148 Safari/604.1'.replace('like Mobile','like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile')});
 const p=await ctx.newPage();p.setDefaultTimeout(1800000);const errs=[];p.on('pageerror',e=>errs.push(String(e).slice(0,160)));
 const cdp=await ctx.newCDPSession(p);await cdp.send('Emulation.setCPUThrottlingRate',{rate:6});
 const EV=(fn,arg)=>p.evaluate(c=>__xc.ev(c),'('+fn.toString()+')('+JSON.stringify(arg||{})+')');
 await p.goto(BASE+'?test='+C+'&draw=0'+(process.env.Q||''));await p.waitForFunction(()=>window.__tq&&__tq.ready,null,{polling:250,timeout:300000});
 await EV(()=>new Promise(r=>setTimeout(r,3000)));
 const out=await EV(A=>{if(A.s0)TUNE.wallStop=0;const R0=(s=>()=>(s=(s*16807)%2147483647)/2147483647)(A.seed),res=[];
  const T=o=>{TOUCH.on=true;TOUCH.used=true;TOUCH.dir=0;TOUCH.gas=!!o.gas;TOUCH.brake=false;TOUCH.hb=false};SET.touch='buttons';
  const hitAt=(x,z,a,y,d0,d1)=>{const sx=Math.sin(a),sz=Math.cos(a);for(let d=d0;d<=d1;d+=.25)if(roamHit(x+sx*d,z+sz*d,.05,y+.5))return[x+sx*d,z+sz*d,d];return null};
  let tries=0;while(res.length<A.n&&tries<6000){tries++;const q=rfSnap(WX0+R0()*(WX1-WX0),WZS+R0()*(WZN-WZS),40);if(!q)continue;const px=q[0],pz=q[1],g=groundAt(px,pz,99);if(g<-1||(CID==='fra'&&inRiver(px,pz,0)))continue;
   const a=R0()*6.283,c=hitAt(px,pz,a,g,8,35);if(!c)continue;const l=hitAt(px,pz,a-.12,g,6,45),r=hitAt(px,pz,a+.12,g,6,45);if(!l||!r)continue;
   let tx=r[0]-l[0],tz=r[1]-l[1];const tl=Math.hypot(tx,tz);if(tl<1.5)continue;tx/=tl;tz/=tl;
   const off=(c[0]-l[0])*tz-(c[1]-l[1])*tx;if(Math.abs(off)>.4)continue;
   // tall: solid 5 m up too (a facade, not a prop)
   if(!roamHit(c[0]-(c[0]-px)*.02,c[1]-(c[1]-pz)*.02,.3,g+5)&&!roamHit(c[0]+Math.sin(a)*.5,c[1]+Math.cos(a)*.5,.3,g+5))continue;
   let nx=tz,nz=-tx;if((px-c[0])*nx+(pz-c[1])*nz<0){nx=-nx;nz=-nz}
   const th=A.deg/57.3,sg=R0()<.5?1:-1,ux=-nx*Math.cos(th)+sg*tx*Math.sin(th),uz=-nz*Math.cos(th)+sg*tz*Math.sin(th),D=Math.min(24,3/Math.max(.15,Math.cos(th))+22);
   const sx=c[0]+nx*2.6-ux*D,sz=c[1]+nz*2.6-uz*D,sg0=groundAt(sx,sz,99);if(Math.abs(sg0-g)>.6||roamHit(sx,sz,2.8,sg0+.5))continue;
   let clear=true;for(let d=0;d<D-4;d+=2){const x=sx+ux*d,z=sz+uz*d;if(roamHit(x,z,2.4,sg0+.5)||Math.abs(groundAt(x,z,99)-sg0)>.6){clear=false;break}}if(!clear)continue;
   const ep={x:Math.round(c[0]),z:Math.round(c[1])};
   try{OF_reset()}catch(e){}roamWarp(sx,sz,Math.atan2(ux,uz),true);RO.x=sx;RO.z=sz;RO.y=sg0;RO.vy=0;RO.h=RO.vh=Math.atan2(ux,uz);RO.v=0;RO.gOn=false;RO.crTurn=null;T({gas:1});roamStep(1/60);
   RO.x=sx;RO.z=sz;RO.y=sg0;RO.h=RO.vh=Math.atan2(ux,uz);RO.v=60/3.6;RO.yr=0;RO.dl=0;RO.dDir=0;RO.dT=0;RO.inv=99;RO.hp=100;RO.turbo=0;RO.stkT=0;RO.stkP=false;RO.stkP3=false;RO.stkW=-.5;RO.stkX=RO.x;RO.stkZ=RO.z;RO.crTurn=null;camSnap=true;
   const rb0=roamBounce;roamBounce=function(ax,sp,nX,nZ){if(!ep.rb)ep.rb=[ax,Math.round(sp*3.6),nX==null?null:+nX.toFixed(2),nZ==null?null:+nZ.toFixed(2),+nx.toFixed(2),+nz.toFixed(2),Math.round(RO.v*3.6),Math.round((RO.vh-Math.atan2(-nx,-nz))*57.3),Math.round((RO.h-Math.atan2(-nx,-nz))*57.3),RO.vy,DEST.on];return rb0.apply(this,arguments)};
   const ring=[];let hitI=-1,vin=0,v03=null,v10=null,inside=0,depth=0,maxv=0;
   for(let i=0;i<300;i++){T({gas:1});RO.inv=99;roamStep(1/60);try{roamCam(1/60)}catch(e){}
    const dn=(RO.x-c[0])*nx+(RO.z-c[1])*nz;ring.push((RO.stkP?'P':'-')+(RO.stkW||0).toFixed(2)+':'+Math.round(RO.v*3.6)+'@'+dn.toFixed(1)+'h'+Math.round(((RO.h-Math.atan2(-nx,-nz)+9.42)%6.283-3.14)*57));if(ring.length>A.rl)ring.shift();if(hitI<0&&ep.rb&&!ep.pre)ep.pre=ring.slice();
    if(hitI<0&&(dn<2.7||ep.rb)){hitI=i;vin=ep.rb?ep.rb[6]:Math.round(RO.v*3.6)}
    if(hitI>=0){if(i-hitI<=60&&-dn>depth)depth=-dn;if(roamHit(RO.x,RO.z,.3,RO.y+.5))inside++;if(i===hitI+2)ep.fl=[RO.stkP,RO.crTurn==null?null:+RO.crTurn.toFixed(2),RO.stkT,RO.stkW,RO.nudgeT,+RO.yr.toFixed(2)];if(i===hitI+18)v03=Math.round(Math.abs(RO.v)*3.6);ep.s03=Math.round(RO.v*3.6);if(hitI>=0&&i>=hitI&&i<=hitI+30&&i%2===0)(ep.tr=ep.tr||[]).push(Math.round(RO.v*3.6)+"@"+dn.toFixed(1)+"h"+Math.round(((RO.h-Math.atan2(-nx,-nz)+9.42)%6.283-3.14)*57));if(i===hitI+60)v10=Math.round(Math.abs(RO.v)*3.6)}
    if(RO.wk)break}
   roamBounce=rb0;
   if(!ep.rb){const bb=roamHit(c[0],c[1],.3,g+.5);ep.dbg={g:+g.toFixed(1),sg0:+sg0.toFixed(1),y:+RO.y.toFixed(1),b:bb&&{h:+(bb.h||0).toFixed(1),y0:bb.y0,hw:bb.hw,hd:bb.hd,rh:bb.rh},at:[+RO.x.toFixed(0),+RO.z.toFixed(0)],start:[+sx.toFixed(0),+sz.toFixed(0)],c:[+c[0].toFixed(1),+c[1].toFixed(1)],sc:typeof SC_hit==='function'&&!!SC_hit(c[0],c[1],g)}}
   ep.vin=vin;ep.v03=v03;ep.v10=v10;ep.inside=inside;ep.depth=+depth.toFixed(2);ep.hit=hitI>=0;res.push(ep)}
  T({});TOUCH.used=false;return{tries,res}},{n:+NE,seed:C==='fra'?11:23,deg:+(DEG||0),s0:!!process.env.STOP0,rl:+process.env.RL||10});
 // eligible = the car really reached the face square on (the road/steering assist can swing it before contact: a miss or a >15 deg approach is a script outcome, counted as 'skipped')
 const A=out.res.filter(e=>e.hit&&e.rb&&Math.abs(e.rb[8])<=15||(process.env.ALL&&e.hit)),R=A;let bad=0;const DEGN=+(DEG||0);for(const e of R){const ok=DEGN>0?(e.inside===0&&e.depth<1.5):(e.v03!=null&&e.v03<=7&&e.inside===0&&e.depth<1.5);if(!ok)bad++;if(process.env.V)console.log(JSON.stringify(Object.assign({},e,{tr:undefined,pre:process.env.PRE?e.pre:undefined})),ok?'ok':'BAD')}
 console.log((bad?'FAIL':'PASS')+' wallhead '+C+' deg'+DEGN+' '+(R.length-bad)+'/'+R.length+' ok ('+(out.res.length-R.length)+' skipped: missed the face or swung >15 deg); v03 list '+R.map(e=>e.v03).join(',')+'; inside '+R.reduce((a,e)=>a+e.inside,0)+' errs '+errs.length);await b.close()})().catch(e=>{console.log('ERR',e.message.slice(0,300));process.exit(1)});
