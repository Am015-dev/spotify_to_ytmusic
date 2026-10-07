// ==== W14 (worker 14): speed feel (from W13 WIP) ====
// 2) Speed feel. Measured (live v87n, real GAS, city street): top 91 km/h, 0-100 never; FOV 68→76. Physics fix is in roamStep (71, W13S).
//    Here: chase camera 8% closer and 10% lower (SC_RC0 is the preset table SC_rcam scales), and speed lines above ~95 km/h.
try{SC_RC0.chase.b=+(SC_RC0.chase.b*.92).toFixed(2);SC_RC0.chase.h=+(SC_RC0.chase.h*.9).toFixed(2);SC_rcam()}catch(e){console.warn('W13 cam',e)}
// speed lines: thin white streaks at the screen edges (never over the car in the centre), half-resolution 2D canvas between the 3D view and the HUD
const W13L={c:null,g:null,s:[],a:0,on:false};
function W13_lines(dt){let L=W13L;if(!L.c){const c=document.createElement('canvas');c.id='w13sl';c.style.cssText='position:fixed;inset:0;width:100%;height:100%;pointer-events:none;display:block';
  const cv0=document.getElementById('c');if(!cv0||!cv0.parentNode)return;cv0.parentNode.insertBefore(c,cv0.nextSibling);L.c=c;L.g=c.getContext('2d');for(let i=0;i<34;i++)L.s.push({a:Math.random()*6.283,r:Math.random(),w:.6+Math.random()})}
 const kmh=Math.abs(RO.v||0)*3.6,act=state==='roam'&&RO.on&&!paused&&!RO.frozen&&!(pl&&pl.air);
 const tgt=act?clamp((kmh-95)/70,0,1)*.32+(RO.boosting&&act?.18:0):0;L.a+=(tgt-L.a)*Math.min(1,dt*5);
 const c=L.c,g=L.g,W=Math.round(innerWidth/2),H=Math.round(innerHeight/2);if(c.width!==W||c.height!==H){c.width=W;c.height=H;L.on=true}
 if(L.a<.01){if(L.on){g.clearRect(0,0,W,H);L.on=false}return}L.on=true;g.clearRect(0,0,W,H);
 const cx=W/2,cy=H*.42,R=Math.hypot(W,H)*.55,sp=(.6+kmh/120)*dt;g.strokeStyle='#fff';g.lineCap='round';
 for(const q of L.s){q.r+=sp*(.5+q.r);if(q.r>1){q.r=.38+Math.random()*.1;q.a=Math.random()*6.283}const ca=Math.cos(q.a),sa=Math.sin(q.a)*.62;
  // keep the band ahead of / around the car clear: skip streaks pointing into the lower centre
  if(sa>.25&&Math.abs(ca)<.55)continue;const r0=q.r*R,r1=r0+R*(.06+.1*L.a)*q.w;g.globalAlpha=L.a*Math.min(1,(q.r-.38)*4);g.lineWidth=q.w*1.2;
  g.beginPath();g.moveTo(cx+ca*r0,cy+sa*r0);g.lineTo(cx+ca*r1,cy+sa*r1);g.stroke()}g.globalAlpha=1}
roamCam=(f=>function(dt){f(dt);try{W13_lines(dt)}catch(e){}})(roamCam);
// leaving roam (menu, race) must not leave streaks on screen
{const _tm=toMenu;toMenu=function(){try{if(W13L.g){W13L.g.clearRect(0,0,W13L.c.width,W13L.c.height);W13L.a=0;W13L.on=false}}catch(e){}return _tm.apply(this,arguments)}}
