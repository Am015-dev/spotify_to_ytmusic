// builder-A test library: real input only (CDP touch taps / holds / drags, keyboard). Reading state through window.__bx is fine;
// every ACTION goes through the screen like a player's finger.
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function launch(q=''){const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const c=await b.newContext({viewport:{width:852,height:393},hasTouch:true,isMobile:true,deviceScaleFactor:1});const p=await c.newPage();const E=[];
 p.on('pageerror',e=>E.push('PAGEERR '+e.message));p.on('console',m=>{if(m.type()==='error')E.push('CONSOLE '+m.text())});
 await p.goto('http://127.0.0.1:8766/local_dbg.html?bxfast=1'+q,{timeout:180000});await p.waitForSelector('#bxMenuBtn',{state:'visible',timeout:180000});await sleep(1500);
 const cdp=await c.newCDPSession(p);return{b,p,E,cdp}}
const T=async(cdp,type,pts)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:pts.map((q,i)=>({x:q[0],y:q[1],id:q[2]??i}))});
async function tap(cdp,x,y){await T(cdp,'touchStart',[[x,y]]);await sleep(60);await T(cdp,'touchEnd',[]);await sleep(160)}
async function tapEl(p,cdp,sel){const l=p.locator(sel).first();await l.scrollIntoViewIfNeeded();const b=await l.boundingBox();if(!b)throw new Error('no '+sel);await tap(cdp,b.x+b.width/2,b.y+b.height/2)}
async function drag(cdp,x0,y0,x1,y1,n=8){await T(cdp,'touchStart',[[x0,y0]]);for(let i=1;i<=n;i++){await T(cdp,'touchMove',[[x0+(x1-x0)*i/n,y0+(y1-y0)*i/n]]);await sleep(25)}await sleep(60);await T(cdp,'touchEnd',[]);await sleep(150)}
// pan the build camera by real one-finger drags until world point (x,z) is near the view centre
async function panTo(p,cdp,x,z){for(let k=0;k<6;k++){const s=await p.evaluate(([x,z])=>{const B=__bx.BX,c=B.camB,dx=x-c.x,dz=z-c.z,cs=Math.cos(c.yaw),sn=Math.sin(c.yaw),kk=c.d/innerHeight*1.4;
   // inverse of the pan in BX_tapInit: c.x -= (mx*cs+my*sn)*k ; c.z -= (-mx*sn+my*cs)*k
   const a=-dx/kk,b=-dz/kk;return{mx:a*cs-b*sn,my:a*sn+b*cs,d:Math.hypot(dx,dz)}},[x,z]);if(s.d<6)return;
  const cx=426,cy=210,L=Math.hypot(s.mx,s.my),f=Math.min(1,300/L);await drag(cdp,cx,cy,cx+s.mx*f,cy+s.my*f)}}
// the sim is frozen while the shot is taken (test-only BX.hold), so the driver never steers on stale input
async function shot(p,path){await p.evaluate(()=>{if(window.__bx){__bx.BX.hold=1;__bx.BX.shotNow=1}});await sleep(300);await p.screenshot({path});await p.evaluate(()=>{if(window.__bx){__bx.BX.hold=0;__bx.BX.last=0}})}
// (CDP drops a single-finger release while others are held: release = lift all, press the rest again)
// --- driving: hold touch buttons like a thumb (GAS is automatic on touch)
function holder(p,cdp){const H={};const pts=async()=>{const out=[];for(const k in H)out.push([H[k].x,H[k].y,H[k].id]);return out};
 const box=async id=>{const b=await p.locator('#'+id).boundingBox();return b&&[b.x+b.width/2,b.y+b.height/2]};
 return{async set(id,on){if(!!H[id]===!!on)return;if(on){const xy=await box(id);if(!xy)return;let i=0;while(Object.values(H).some(o=>o.id===i))i++;H[id]={x:xy[0],y:xy[1],id:i};await T(cdp,'touchStart',await pts())}
  else{delete H[id];const P=await pts();await T(cdp,'touchEnd',[]);if(P.length)await T(cdp,'touchStart',P)}},async clear(){const n=Object.keys(H).length;for(const k in H)delete H[k];if(n)await T(cdp,'touchEnd',[]).catch(()=>{})}}}
// follow the course waypoints; returns {metrics, log}. shots: {name: predicate(state)} -> first frame matching is saved
// SLOPPY=<metres>: a human-like player: wanders up to ~1.6x that many metres off the line, reacts 0.3 s late, brakes late
const SL=+process.env.SLOPPY||0,LAG=SL?.3:0;
async function drive(p,cdp,{ch=[],secs=90,out,tag,shots={},wpExtra=null,stopLaps=1,maxWall=900}){const W=wpExtra||await p.evaluate(c=>__bx.route(c),ch);const h=holder(p,cdp);const Q=[];let idx=0,last=-1,taken={},t0=Date.now(),info=[];
 const st=()=>p.evaluate(()=>__bx.st());let s=await st();
 while(true){s=await st();const V=s.v;if(!V)break;if(s.m.t>secs||s.m.laps>=stopLaps||(Date.now()-t0)/1000>maxWall)break;
  // advance along the route (never backwards more than a few points; after a respawn re-find)
  let best=1e9,bi=idx;for(let i=Math.max(0,idx-6);i<Math.min(W.length,idx+40);i++){const d=Math.hypot(W[i][0]-V.p[0],W[i][2]-V.p[2])+Math.abs(W[i][1]-V.p[1])*.5;if(d<best){best=d;bi=i}}
  if(s.m.resp!==last){last=s.m.resp;if(best>15){for(let i=0;i<W.length;i++){const d=Math.hypot(W[i][0]-V.p[0],W[i][2]-V.p[2])+Math.abs(W[i][1]-V.p[1]);if(d<best){best=d;bi=i}}}}
  idx=Math.max(idx,bi);if(idx>=W.length-2&&stopLaps<=1&&!W.loop)idx=W.length-2;
  const look=Math.min(W.length-1,idx+Math.max(3,Math.round(V.sp/3.2))),tw=W[look%W.length],tw2=W[Math.min(W.length-1,look+1)],wob=SL?SL*Math.sin(s.m.t*.8)+SL*.6*Math.sin(s.m.t*2.3):0,tl=Math.hypot(tw2[0]-tw[0],tw2[2]-tw[2])||1,dx=tw[0]+wob*(tw2[2]-tw[2])/tl-V.p[0],dz=tw[2]-wob*(tw2[0]-tw[0])/tl-V.p[2],fh=Math.hypot(V.F[0],V.F[2])||1;
  const cross=(V.F[2]*dx-V.F[0]*dz)/fh,dot=(V.F[0]*dx+V.F[2]*dz)/fh,ang=Math.atan2(cross,dot); // >0: target is to the LEFT (x-left convention: right = F x up)
  const steer0=Math.abs(ang)<.06?0:ang>0?-1:1;Q.push([s.m.t,steer0]);while(Q.length>1&&Q[1][0]<=s.m.t-LAG)Q.shift();const steer=SL?Q[0][1]:steer0;await h.set('bxL',steer<0);await h.set('bxR',steer>0);
  // brake like a player before a corner: the tightest radius in the next ~45 m of course (heading change per metre) vs speed (yaw limit ~1.25 rad/s)
  let need=99;{let acc=0,i=idx,a0=null;const P=[];while(acc<45&&i<W.length-1){const a=W[i],b=W[i+1],d=Math.hypot(b[0]-a[0],b[2]-a[2]);if(d>.3)P.push([Math.atan2(b[0]-a[0],b[2]-a[2]),d,acc]);acc+=d;i++}
   for(let k=0;k<P.length;k++){let dd=0,m=k;while(m<P.length-1&&dd<14){dd+=P[m][1];m++}if(dd<8)break;const t=Math.abs(Math.atan2(Math.sin(P[m][0]-P[k][0]),Math.cos(P[m][0]-P[k][0])));if(t>.05){const R=dd/t,v=1.25*R+Math.max(0,P[k][2]-10)*.5;if(v<need)need=v}}}
  const brk=(Math.abs(ang)>.9&&V.sp>16)||V.sp>Math.max(12,need)+2+(SL?6:0);if(process.env.DBG&&s.m.t>+process.env.DBG)console.log('drv',s.m.t.toFixed(2),idx,ang.toFixed(2),need.toFixed(1),V.sp,brk,steer);await h.set('bxB',brk);
  for(const k in shots)if(!taken[k]&&shots[k](s)){taken[k]=1;await shot(p,`${out}/${tag}_${k}.png`)}
  info.push([+s.m.t.toFixed(2),...V.p,V.sp,V.g?1:0,V.boat?1:0,idx]);await sleep(70)}
 await h.clear();return{s,info,taken}}
module.exports={launch,tap,tapEl,drag,panTo,shot,drive,sleep,holder};
