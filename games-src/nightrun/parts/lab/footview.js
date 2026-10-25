// PURPOSE: LAB > ON FOOT opens a calm VIEWER: pick Kai, a foe or a prop, click a state and watch its sheet loop at game scale (plus 2x zoom), frame by frame; PLAY TEST = the old sandbox
// FLAG: footview (?footview=0 = the ON FOOT tab starts the sandbox as before)
// TEST: qa/footlab-test.js
/* ---------- FOOTVIEW. Owner, 22 Oct 2026: "the on-foot lab is not a lab. I want to see the states: e.g. I spawn Kai and I can click and see the states, how they look;
   same for all the foes; so no spawn and fighting if I don't want to. Also I see already several sprites are cut down for foes."
   The viewer never starts the street stage (FOOT.start): no waves, no AI, no damage, no timers. It draws the painted street layers (media/foot/bg-*) and one
   character standing on the road line, at the height the street gives it (Kai = 0.225 of the view, streetlook.js; the others by streetfeel FEEL.H), plus a 2x zoom.
   Frames are cut exactly as art.js does (frame i = x i*w, w*h from ART.ANIM), at the sheet fps and smoothing holds (ART.aS). A frame whose opaque pixels touch its
   top / left / right edge (the same rule as qa/spritecut.js) gets a red edge: that art is cut. A state with no sheet says 'no art' and names its slot id. ---------- */
if(RET.footview===undefined)RET.footview=!/[?&]footview=0/.test(location.search);
(function(){
if(!RET.footview||!window.FOOTLAB||!window.LABX||typeof ART==='undefined'||!ART.ANIM)return;
const FLAB=window.FOOTLAB,F=window.FOOT,clamp=(v,a,b)=>v<a?a:v>b?b:v;
const FOOTWHO='kai grunt gunman shield bruiser knife sniper drone turret mech warden jetpack hound flamer ninja medic'.split(' ');
const NAME={kai:'KAI',knife:'RUSHER',gunman:'GUNNER',bruiser:'HEAVY',bigheavy:'BIG HEAVY',grunt:'GRUNT',shield:'SHIELD',sniper:'SNIPER',drone:'DRONE',turret:'TURRET',mech:'MECH',warden:'WARDEN',
  jetpack:'JETPACK',hound:'HOUND',flamer:'FLAMER',ninja:'NINJA',medic:'MEDIC','prop-car':'CAR','prop-police':'POLICE CAR','prop-steam':'STEAM VENT','prop-beacon':'BEACON','prop-neon':'NEON SIGN',
  'prop-banner':'BANNER','prop-holo':'HOLO AD','prop-windows':'WINDOWS','prop-drone':'SKY DRONE','pk-ammo':'AMMO PICKUP','pk-coin':'COIN','pk-health':'HEALTH','st-crate':'CRATE','st-barrel':'RED BARREL'};
const HT={kai:64,knife:64,gunman:64,bruiser:80,bigheavy:90};               // body heights on the street (streetfeel FEEL.H): heavy 1.25 x Kai
const PH={'prop-car':80,'prop-police':84,'prop-steam':120,'prop-beacon':160,'prop-neon':150,'prop-banner':170,'prop-holo':150,'prop-windows':190,'prop-drone':58,'pk-ammo':32,'pk-coin':32,'pk-health':32,'st-crate':40,'st-barrel':44};   // art.js ART.PROPS heights, foot.js PROPD sizes
const STILL={'st-crate':'media/foot/sc-crate.webp','st-barrel':'media/foot/sc-barrel.webp'};
const CORE=['idle','walk','run','shoot','runshoot','crouch','crouchshoot','jump','land','aimup','aimdiag','hit','hurt','die','cover','melee'];
const V=window.FOOTVIEW={on:false,who:'kai',sheet:'kai',act:'idle',play:true,t:0,frame:0,speed:1,flip:false,box:true,road:true,mz:true,cmp:[],log:{open:0,acts:{}}};
const acts=sh=>Object.keys(ART.ANIM.s).filter(k=>k.slice(0,k.indexOf('/'))===sh).map(k=>k.slice(k.indexOf('/')+1));
V.chars=()=>{const s=new Set(Object.keys(ART.ANIM.s).map(k=>k.slice(0,k.indexOf('/'))));const o=[];
  for(const w of FOOTWHO)if(s.has(w)){o.push([w,w]);if(w==='bruiser')o.push(['bigheavy','bruiser']);}
  for(const w of [...s].sort())if(/^kai-/.test(w))o.push([w,w]);
  for(const w of [...s].sort())if(/^(prop|pk)-/.test(w))o.push([w,w]);
  for(const w in STILL)o.push([w,w]);return o;};
V.states=sh=>{if(STILL[sh])return [['still',true]];const have=acts(sh),o=[];const prop=/^(prop|pk)-/.test(sh);
  for(const a of prop?[]:CORE)if(have.indexOf(a)>=0||!(a==='hurt'&&sh!=='kai')&&!(a==='hit'&&sh==='kai'))o.push([a,have.indexOf(a)>=0]);
  for(const a of have)if(!o.some(q=>q[0]===a))o.push([a,true]);return o;};
/* ----- per-sheet frame facts from the pixels: body box (alpha > 32) and the cut edges, cached ----- */
const info={};
function facts(key){if(info[key])return info[key];const m=ART.ANIM.s[key],b=ART.anim(key);if(!m||!b)return null;const W=m[0]*m[2],H=m[3],c=document.createElement('canvas');c.width=W;c.height=H;
  const g=c.getContext('2d',{willReadFrequently:true});g.drawImage(b,0,0);let d;try{d=g.getImageData(0,0,W,H).data;}catch(e){return info[key]={fr:[]};}
  const a=(x,y)=>d[(y*W+x)*4+3],feet=FOOTWHO.indexOf(key.slice(0,key.indexOf('/')).replace(/^kai-.*/,'kai'))>=0,fr=[];
  for(let i=0;i<m[0];i++){const x0=i*m[2];let l=1e9,r=-1,t=1e9,bt=-1;for(let y=0;y<H;y++)for(let x=0;x<m[2];x++)if(a(x0+x,y)>32){if(x<l)l=x;if(x>r)r=x;if(y<t)t=y;bt=y;}
    const run=(n,f)=>{let mx=0,k=0;for(let j=0;j<n;j++){if(f(j)>32){k++;if(k>mx)mx=k;}else k=0;}return mx;},e=[];
    if(run(m[2],x=>a(x0+x,0))>2)e.push('top');if(run(H,y=>a(x0,y))>2)e.push('left');if(run(H,y=>a(x0+m[2]-1,y))>2)e.push('right');if(!feet&&run(m[2],x=>a(x0+x,H-1))>2)e.push('bottom');
    fr.push({l,r,t,b:bt,cut:e});}
  return info[key]={fr,W,H};}
V.facts=facts;V.info=info;V.ready=k=>!!ART.anim(k);V.has=k=>!!ART.ANIM.s[k];   // for the tests (ART is not on window)
/* ----- painted street (the five street layers, no actors, no waves) ----- */
const BG={};for(const n of ['sky','far','mid','near','floor'])Object.defineProperty(BG,n,{get(){const im=new Image();im.src='media/foot/bg-'+n+'.webp';Object.defineProperty(BG,n,{value:im});return im;},configurable:true});   // W242: loaded when the LAB street view first draws, not at boot (1 MB)
const still={};
function street(g,W,H,road){g.fillStyle='#0a0612';g.fillRect(0,0,W,H);const ok=im=>im&&im.complete&&im.naturalWidth;
  if(ok(BG.sky)){const s=Math.max(W/BG.sky.naturalWidth,road/BG.sky.naturalHeight);g.drawImage(BG.sky,(W-BG.sky.naturalWidth*s)/2,road-BG.sky.naturalHeight*s,BG.sky.naturalWidth*s,BG.sky.naturalHeight*s);}
  for(const n of ['far','mid','near']){const im=BG[n];if(!ok(im))continue;const s=Math.max(W/im.naturalWidth,road*.9/im.naturalHeight);g.drawImage(im,(W-im.naturalWidth*s)/2,road-im.naturalHeight*s,im.naturalWidth*s,im.naturalHeight*s);}
  if(ok(BG.floor)){const im=BG.floor,s=W/im.naturalWidth;g.drawImage(im,0,road-8,W,Math.max(H-road+8,im.naturalHeight*s*.3));}else{g.fillStyle='#1a1426';g.fillRect(0,road,W,H-road);}}
/* ----- one character: the frame cut as the game cuts it, feet on (x, y), h = body height in px ----- */
function key(){return V.sheet+'/'+V.act;}
function frameAt(k){const o=ART.aS(k);if(!o)return 0;const n=o.m[0];if(V.play){const tot=o.tot+(o.loop?0:.4);const u=V.t%tot;V.frame=u>=o.tot?n-1:ART.aframe(k,u);}return V.frame=clamp(V.frame,0,n-1);}
function drawOne(g,sh,act,i,x,y,h,o){const k=sh+'/'+act,m=ART.ANIM.s[k],b=m&&ART.anim(k);
  if(STILL[sh]){let im=still[sh];if(!im){im=still[sh]=new Image();im.src=STILL[sh];}if(!im.complete||!im.naturalWidth)return null;const s=h/im.naturalHeight;
    g.save();if(V.flip){g.translate(x,0);g.scale(-1,1);x=0;}g.drawImage(im,x-im.naturalWidth*s/2,y-h,im.naturalWidth*s,h);g.restore();return {s,still:true};}
  if(!b)return null;const fe=FOOTWHO.indexOf(sh.replace(/^kai-.*/,'kai'))>=0,FE=F&&F.FEEL;let hh=h;
  if(fe&&FE){const base=sh.indexOf('kai')===0?'kai':sh,bk=FE.BODY[base+'/'+act],rf=FE.BODY[base+'/idle'];if(bk&&rf&&!/crouch|die|jump|land|dash/.test(act))hh*=rf/bk;}
  const s=hh/m[3],ax=fe?m[4]:m[2]/2,ay=fe?m[5]:m[3]/2,yy=fe?y:y-m[3]*s/2;i=clamp(i,0,m[0]-1);
  g.save();g.translate(x,yy);if(V.flip)g.scale(-1,1);g.imageSmoothingQuality='high';g.drawImage(b,i*m[2],0,m[2],m[3],-ax*s,-ay*s,m[2]*s,m[3]*s);
  const f=facts(k),fr=f&&f.fr[i];
  if(o&&o.marks){g.lineWidth=Math.max(1,1.5/1);
    g.strokeStyle='rgba(255,255,255,.35)';g.setLineDash([4,4]);g.strokeRect(-ax*s,-ay*s,m[2]*s,m[3]*s);g.setLineDash([]);   // the frame cell
    if(fr&&fr.cut.length){g.strokeStyle='#ff3040';g.lineWidth=3;g.beginPath();for(const e of fr.cut){const L=-ax*s,T=-ay*s,R=L+m[2]*s,B=T+m[3]*s;
      if(e==='top'){g.moveTo(L,T);g.lineTo(R,T);}if(e==='left'){g.moveTo(L,T);g.lineTo(L,B);}if(e==='right'){g.moveTo(R,T);g.lineTo(R,B);}if(e==='bottom'){g.moveTo(L,B);g.lineTo(R,B);}}g.stroke();}
    if(V.box&&fr&&fr.r>=0){g.strokeStyle='#19e3ff';g.lineWidth=1.5;g.strokeRect((fr.l-ax)*s,(fr.t-ay)*s,(fr.r-fr.l+1)*s,(fr.b-fr.t+1)*s);}
    const mz=FE&&FE.MZ[(sh.indexOf('kai')===0?'kai':sh)+'/'+act];if(V.mz&&mz&&fe){const q=mz[Math.min(mz.length-1,i)];g.fillStyle='#ffe14d';g.beginPath();g.arc(q[0]*s,q[1]*s,4,0,6.283);g.fill();g.strokeStyle='#000';g.lineWidth=1;g.stroke();}}
  g.restore();return {s,m,fr,i};}
/* ----- the stage, the zoom box and the info line ----- */
let el=null,cv=null,zc=null,txt=null,raf=0,last=0,chips=[],stList=null,chList=null;let bgK='';const bgC=document.createElement('canvas');
function size(c){const r=c.getBoundingClientRect(),d=Math.min(2,window.devicePixelRatio||1,Math.sqrt(2.2e6/Math.max(1,r.width*r.height))),   // at most ~2.2 megapixels (a 4K screen at 2x was 15 MP redrawn 30 times a second)
  w=Math.max(1,Math.round(r.width*d)),h=Math.max(1,Math.round(r.height*d));if(c.width!==w||c.height!==h){c.width=w;c.height=h;}return d;}
function hOf(sh,H){return STILL[sh]||/^(prop|pk)-/.test(sh)?.225*H*(PH[sh]||64)/64:.225*H*(HT[sh]||64)/64;}
/* the road line is drawn as rectangles: a dashed stroke() across a 5000 px canvas cost ~120 ms a frame (owner 22 Oct: the viewer crawled on a fast PC) */
function paint(){if(!cv)return;const d=size(cv),g=cv.getContext('2d'),W=cv.width,H=cv.height,road=Math.round(H*470/540);g.setTransform(1,0,0,1,0,0);{const ld=Object.values(BG).filter(im=>im.complete&&im.naturalWidth).length,bk=W+'x'+H+'|'+ld;if(bk!==bgK){bgK=bk;bgC.width=W;bgC.height=H;street(bgC.getContext('2d'),W,H,road);}g.drawImage(bgC,0,0);}   // the street is painted once per size, then copied
  if(V.road){g.fillStyle='#ffe14d';{const dl=10*d,gp=6*d,lw=Math.max(1,Math.round(1.5*d)),y=Math.round(road-lw/2);for(let x=0;x<W;x+=dl+gp)g.fillRect(x,y,dl,lw);}g.fillStyle='#ffe14d';g.font='bold '+Math.round(11*d)+'px monospace';g.textAlign='left';g.textBaseline='bottom';g.fillText('ROAD LINE (feet stand here)',6*d,road-3*d);}
  const k=key(),has=STILL[V.sheet]||ART.ANIM.s[k],i=has?(STILL[V.sheet]?0:frameAt(k)):0;let r=null;
  if(V.cmp.length){const list=V.cmp.indexOf(V.who)<0?V.cmp.concat([V.who]):V.cmp,n=list.length;list.forEach((w,j)=>{const sh=w==='bigheavy'?'bruiser':w,a=ART.ANIM.s[sh+'/'+V.act]?V.act:STILL[sh]?'still':'idle',kk=sh+'/'+a,
      fi=STILL[sh]?0:ART.ANIM.s[kk]?(V.play?ART.aframe(kk,V.t%(ART.aS(kk).tot+(ART.aS(kk).loop?0:.4))):Math.min(V.frame,ART.ANIM.s[kk][0]-1)):0,x=W*(j+.5)/n;
      const q=drawOne(g,sh,a,fi,x,road,hOf(w,H),{marks:true});if(w===V.who)r=q;g.fillStyle='#e8e4ff';g.font='bold '+Math.round(11*d)+'px monospace';g.textAlign='center';g.textBaseline='top';g.fillText((NAME[w]||w.toUpperCase())+' · '+a,x,road+6*d);});}
  else if(has)r=drawOne(g,V.sheet,V.act,i,W/2,road,hOf(V.who,H),{marks:true});
  if(!has){g.fillStyle='rgba(5,3,12,.8)';g.fillRect(W/2-150*d,road-90*d,300*d,58*d);g.fillStyle='#ff8a5a';g.font='bold '+Math.round(14*d)+'px monospace';g.textAlign='center';g.textBaseline='middle';g.fillText('NO ART',W/2,road-72*d);
    g.fillStyle='#e8e4ff';g.font=Math.round(11*d)+'px monospace';g.fillText('slot id '+k+' (ART-SLOTS-STREET.md)',W/2,road-48*d,290*d);}
  // zoom box: the same frame at 2x the game scale, feet at the bottom
  if(zc){size(zc);const z=zc.getContext('2d'),ZW=zc.width,ZH=zc.height;z.setTransform(1,0,0,1,0,0);z.fillStyle='#0a0612';z.fillRect(0,0,ZW,ZH);
    if(has){const h2=Math.min(hOf(V.who,H)*2,ZH*.8);const fe=!/^(prop|pk|st)-/.test(V.sheet);drawOne(z,V.sheet,STILL[V.sheet]?'still':V.act,i,ZW/2,fe?ZH-12*d:ZH/2+h2/2,h2,{marks:true});}
    z.fillStyle='#8a82b0';z.font='bold '+Math.round(10*d)+'px monospace';z.textAlign='left';z.textBaseline='top';z.fillText('ZOOM 2x',4*d,4*d);}
  if(txt){let s;if(STILL[V.sheet])s=(NAME[V.who]||V.who)+' · still picture '+STILL[V.sheet].slice(6);
    else if(!has)s=(NAME[V.who]||V.who)+' · '+V.act+' · no art yet';
    else{const m=ART.ANIM.s[k],o=ART.aS(k),fr=r&&r.fr;s=(NAME[V.who]||V.who)+' · '+V.act+' · frame '+(i+1)+' of '+m[0]+' · '+m[1]+' frames per second'+(o&&o.loop?' (loops)':' (plays once, shown on a loop)')+' · frame '+m[2]+'x'+m[3]+' px · sheet anim/'+k+'-strip.webp'+(fr&&fr.cut.length?' · CUT at the '+fr.cut.join(' and ')+' edge (red)':'');}
    if(txt.textContent!==s)txt.textContent=s;}}
function loop(now){raf=requestAnimationFrame(loop);if(document.hidden||(last&&now-last<32))return;const dt=last?Math.min(.1,(now-last)/1000):0;last=now;if(V.play)V.t+=dt*V.speed;try{paint();}catch(e){console.error(e);}if(++V._n%10===0)sync();}   // 30 draws a second at most (owner 22 Oct: the viewer made a fast PC crawl)
/* ----- the panel ----- */
const css=`#fvP{position:fixed;inset:0;z-index:9000;display:flex;flex-direction:column;background:#05030c;color:var(--ink,#e8e4ff);font-family:var(--mono,monospace)}
#fvP .vbar{display:flex;flex-wrap:wrap;align-items:center;gap:4px 6px;padding:4px 8px;flex:0 0 auto;border-bottom:1px solid #3a2b5c}#fvP .vbar b{font-size:12px;letter-spacing:.1em;color:var(--cyan,#19e3ff);flex:1 1 160px;min-width:0}
#fvP .vmain{flex:1 1 auto;min-height:0;display:flex;flex-direction:column}#fvP .vstage{position:relative;flex:1 1 0;min-height:0;overflow:hidden;display:flex;gap:6px;padding:6px}
#fvP #fvC{display:block;flex:1 1 0;width:0;min-width:0;height:100%;border:1px solid #3a2b5c;border-radius:6px}#fvP #fvZ{display:block;flex:0 0 30%;width:30%;min-width:0;height:100%;border:1px solid #3a2b5c;border-radius:6px}
#fvP .vinfo{flex:0 0 auto;padding:2px 8px;font-size:11px;line-height:1.35;color:var(--amber,#ffb020);min-height:30px}
#fvP .vside{flex:1 1 auto;min-height:0;overflow-y:auto;overflow-x:hidden;padding:2px 8px 10px;-webkit-overflow-scrolling:touch}
#fvP .fs{margin:4px 0}#fvP .ft{display:block;font-size:11px;letter-spacing:.12em;color:var(--dim,#8a82b0);margin:0 0 2px}#fvP .fr{display:flex;flex-wrap:wrap;gap:4px}
#fvP .fc{min-height:36px;min-width:36px;padding:0 10px;font:700 12px var(--mono,monospace);color:var(--ink,#e8e4ff);background:#140c26;border:1px solid #3a2b5c;border-radius:6px;cursor:pointer;white-space:nowrap}
#fvP .fc.on{background:var(--cyan,#19e3ff);color:var(--void,#05030c);border-color:var(--cyan,#19e3ff)}#fvP .fc.na{opacity:.55;border-style:dashed}#fvP .fc.x{border-color:var(--pink,#ff2d95);color:var(--pink,#ff2d95)}
#fvP .fc.hot{border-color:var(--amber,#ffb020);color:var(--amber,#ffb020)}#fvP .fc.cut{box-shadow:inset 0 -3px 0 #ff3040}
#fvP .vkey{font-size:11px;line-height:1.4;color:var(--dim,#8a82b0)}
@media (min-width:900px){#fvP .vmain{flex-direction:row}#fvP .vleft{flex:1 1 auto;min-width:0;display:flex;flex-direction:column}#fvP .vstage{flex:1 1 auto}#fvP .vside{flex:0 0 360px;border-left:1px solid #3a2b5c}}
@media (max-width:899px){#fvP .vleft{flex:0 0 auto;height:52%;display:flex;flex-direction:column}#fvP .vstage{flex:1 1 auto}}`;
function chip(host,label,fn,on,cls,id){const b=document.createElement('button');b.type='button';b.className='fc'+(cls?' '+cls:'');b.textContent=label;if(id)b.id=id;
  b.addEventListener('click',()=>{fn(b);sync();});host.append(b);chips.push({b,on});return b;}
function sec(host,title){const s=document.createElement('div');s.className='fs';const t=document.createElement('span');t.className='ft';t.textContent=title;const r=document.createElement('div');r.className='fr';s.append(t,r);host.append(s);return r;}
function sync(){chips=chips.filter(c=>c.b.isConnected);for(const {b,on} of chips)if(on)b.classList.toggle('on',!!on());}
V.pick=function(w){const c=V.chars().find(q=>q[0]===w);if(!c)return false;V.who=w;V.sheet=c[1];const st=V.states(V.sheet);if(!st.some(q=>q[0]===V.act&&q[1]))V.act=(st.find(q=>q[1])||st[0]||['idle'])[0];V.t=0;V.frame=0;buildStates();return true;};
V.state=function(a){V.act=a;V.t=0;V.frame=0;V.log.acts[V.sheet+'/'+a]=1;return !!ART.ANIM.s[V.sheet+'/'+a]||!!STILL[V.sheet];};
V.step=function(d){V.play=false;const m=ART.ANIM.s[key()];V.frame=m?(V.frame+d+m[0])%m[0]:0;};
function buildStates(){if(!stList)return;stList.textContent='';for(const [a,has] of V.states(V.sheet)){const k=V.sheet+'/'+a,f=has&&info[k],cut=f&&f.fr.some(q=>q.cut.length);
  const b=chip(stList,a.toUpperCase()+(has?'':' · no art'),()=>V.state(a),()=>V.act===a,has?(cut?'cut':''):'na');b.dataset.act=a;b.dataset.has=has?'1':'0';if(!has)b.title='no art: slot id '+k;}}
function build(){if(el)return;const st=document.createElement('style');st.id='fvCss';st.textContent=css;document.head.append(st);
  el=document.createElement('div');el.id='fvP';el.setAttribute('role','dialog');el.setAttribute('aria-label','On foot viewer');chips=[];
  const bar=document.createElement('div');bar.className='vbar';const ti=document.createElement('b');ti.textContent='ON FOOT VIEWER · no foes, no damage';bar.append(ti);
  chip(bar,'PLAY TEST (spawn and fight)',()=>V.playTest(),null,'hot','fvPlay');chip(bar,'EXIT',()=>V.close(),null,'x','fvExit');
  const main=document.createElement('div');main.className='vmain';const left=document.createElement('div');left.className='vleft';const stage=document.createElement('div');stage.className='vstage';
  cv=document.createElement('canvas');cv.id='fvC';zc=document.createElement('canvas');zc.id='fvZ';stage.append(cv,zc);txt=document.createElement('div');txt.className='vinfo';txt.id='fvInfo';txt.setAttribute('role','status');left.append(stage,txt);
  const side=document.createElement('div');side.className='vside';
  chList=sec(side,'CHARACTER (tap one)');for(const [w] of V.chars())chip(chList,NAME[w]||w.toUpperCase(),()=>V.pick(w),()=>V.who===w).dataset.who=w;
  stList=sec(side,'STATE (tap to loop it; dashed = no art yet; red line = a cut frame)');buildStates();
  const pr=sec(side,'PLAY');chip(pr,'PLAY / PAUSE',()=>{V.play=!V.play;},()=>V.play,'','fvPP');chip(pr,'◀ FRAME',()=>V.step(-1),null,'','fvPrev');chip(pr,'FRAME ▶',()=>V.step(1),null,'','fvNext');
  const sp=sec(side,'SPEED');for(const v of [.25,.5,1])chip(sp,v+'x',()=>{V.speed=v;},()=>V.speed===v);
  const sh=sec(side,'SHOW');chip(sh,'FACE LEFT',()=>{V.flip=!V.flip;},()=>V.flip);chip(sh,'BODY BOX (cyan)',()=>{V.box=!V.box;},()=>V.box);chip(sh,'ROAD LINE (yellow)',()=>{V.road=!V.road;},()=>V.road);chip(sh,'MUZZLE POINT (yellow dot)',()=>{V.mz=!V.mz;},()=>V.mz);
  const cp=sec(side,'COMPARE SCALE (side by side on the road)');chip(cp,'ADD THIS ONE',()=>{if(V.cmp.indexOf(V.who)<0&&V.cmp.length<5)V.cmp.push(V.who);},null);
  chip(cp,'KAI + RUSHER + GUNNER + HEAVY',()=>{V.cmp=['kai','knife','gunman','bruiser','bigheavy'];},null);chip(cp,'CLEAR',()=>{V.cmp=[];},null,'x');
  const k=document.createElement('div');k.className='vkey';k.textContent='Dashed white box = the frame cell the game cuts from the sheet. Cyan box = the visible body. Red edge = the art touches the cell edge (cut off). Yellow dot = where shots leave the gun.';side.append(k);
  main.append(left,side);el.append(bar,main);document.body.append(el);}
V.open=function(w){if(V.on){if(w)V.pick(w);return true;}if(FLAB.on)FLAB.exit();V.on=true;V.log.open++;build();V.pick(w||V.who);V.t=0;last=0;V._n=0;if(!raf)raf=requestAnimationFrame(loop);sync();return true;};
V.close=function(){if(!V.on)return;V.on=false;bgK='';bgC.width=bgC.height=1;if(raf){cancelAnimationFrame(raf);raf=0;}if(el){el.remove();el=null;}const s=document.getElementById('fvCss');if(s)s.remove();cv=zc=txt=stList=chList=null;chips=[];};
V.playTest=function(){V.close();return FLAB.start();};
/* the sandbox panel gets a VIEWER button back (a toggle both ways) */
{const st0=FLAB.start;FLAB.start=function(){const r=st0.apply(this,arguments);const add=()=>{const bar=document.querySelector('#flP .fbar');if(!bar||document.getElementById('flView2'))return;const b=document.createElement('button');b.type='button';b.className='fc';b.id='flView2';b.textContent='VIEWER';b.setAttribute('aria-label','Leave the play test and open the calm viewer');
  b.addEventListener('click',()=>{FLAB.exit();V.open();});bar.insertBefore(b,document.getElementById('flFold'));};add();setTimeout(add,120);setTimeout(add,700);return r;};}
/* the ON FOOT tab: the viewer first, the sandbox as PLAY TEST */
{const b0=LABX.build.foot;LABX.build.foot=body=>{const r=lsec(body,'ON FOOT: look at every character and state, or play test the street');
  lchip(r,'OPEN ON FOOT VIEWER',()=>V.open(),{cls:'hot',aria:'See Kai, every foe and prop in each state, frame by frame'});
  lchip(r,'PLAY TEST (spawn and fight)',()=>FLAB.start(),{aria:'Start the Zeil street stage in the sandbox'});
  lchip(r,'OPEN THE SOUND PAGE',()=>labShow('sound'),{aria:'Switch each on foot sound on or off'});
  const n=lsec(body,'WHAT IT DOES');const p=lel('div','',null);p.style.cssText='font-size:13px;line-height:1.4;color:var(--ink);max-width:560px';
  p.textContent='VIEWER: a calm street with no foes, no damage and no timers. Pick Kai, a foe or a prop, tap a state (idle, run, shoot, ...) and it loops at the game\'s frame rate and size, with a 2x zoom, frame steps, speed, facing, the body box, the road line and the muzzle point. A state with no art says so. A frame with a red edge is cut off in the art. PLAY TEST: the street run with spawn buttons, god mode, every weapon, pause and slow motion. Nothing is saved.';
  n.append(p);};void b0;}
V.auto=/[?&]footlab=1/.test(location.search)&&!/[?&]footplay=1/.test(location.search);   // ?footlab=1 opens the viewer (footlab.js asks V.auto), ?footlab=1&footplay=1 the sandbox
})();
