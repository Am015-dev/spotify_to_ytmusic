// ---------- table graphics: procedural textures, the quality setting, candle embers and card motion ----------
// Everything here is decoration. Without a canvas (jsdom tests) or with Low quality, the page renders the same game with CSS fallbacks.
const GFX=(function(){
  const HAS_DOM=typeof document!=='undefined';
  const JSDOM=typeof navigator!=='undefined'&&/jsdom/i.test(navigator.userAgent||'');
  const LV=['low','medium','high'],NAME={low:'Low',medium:'Medium',high:'High'};
  const PH=typeof PerfHUD!=='undefined'?PerfHUD:null,RAF=f=>PH?PH.raf(f):requestAnimationFrame(f);
  let level='high',auto=true,embersOn=false;
  const reduce=()=>{try{return matchMedia('(prefers-reduced-motion: reduce)').matches}catch(e){return false}};
  function autoPick(){let small=false;try{small=Math.min(innerWidth,innerHeight)<700||matchMedia('(pointer:coarse)').matches}catch(e){}return small?'medium':'high'}
  function load(){let v=null;try{v=localStorage.getItem('dkd_gfx')}catch(e){}if(LV.includes(v)){auto=false;return v}auto=true;return autoPick()}
  function apply(v){level=v;if(HAS_DOM)document.documentElement.dataset.gfx=v;setEmbers(v==='high')}
  function set(v,persist){if(!LV.includes(v))return;if(persist){auto=false;try{localStorage.setItem('dkd_gfx',v)}catch(e){}if(PH)PH.hitch()}apply(v);if(typeof syncGfxBtn==='function')syncGfxBtn()}
  function cycle(){set(LV[(LV.indexOf(level)+2)%3],true)}
  // ---- procedural textures (periodic value noise, so the tiles repeat without seams) ----
  function noise(seed,px,py){const p=new Uint8Array(512);let s=seed>>>0;for(let i=0;i<256;i++)p[i]=i;for(let i=255;i>0;i--){s=Math.imul(s^s>>>15,2246822507)+i>>>0;const j=s%(i+1);const t=p[i];p[i]=p[j];p[j]=t}for(let i=0;i<256;i++)p[i+256]=p[i];
    const h=(i,j)=>p[(p[((i%px)+px)%px]+(((j%py)+py)%py))&511]/255;const sm=t=>t*t*(3-2*t);
    return (x,y)=>{const xi=Math.floor(x),yi=Math.floor(y),xf=sm(x-xi),yf=sm(y-yi);const a=h(xi,yi),b=h(xi+1,yi),c=h(xi,yi+1),d=h(xi+1,yi+1);return a+(b-a)*xf+(c-a)*yf+(a-b-c+d)*xf*yf}}
  function tile(w,h,fn,type,q){const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');if(!x)return null;const im=x.createImageData(w,h),d=im.data;
    for(let j=0;j<h;j++)for(let i=0;i<w;i++){const o=(j*w+i)*4;const r=fn(i,j);d[o]=r[0];d[o+1]=r[1];d[o+2]=r[2];d[o+3]=r[3]==null?255:r[3]}x.putImageData(im,0,0);const u=c.toDataURL(type||'image/jpeg',q||.82);
    // a short blob: URL keeps the custom property tiny (a data: URL in a var() is re-parsed on every style recalc)
    try{const b=atob(u.split(',')[1]),a=new Uint8Array(b.length);for(let i=0;i<b.length;i++)a[i]=b.charCodeAt(i);return URL.createObjectURL(new Blob([a],{type:type||'image/jpeg'}))}catch(e){return u}}
  const clamp=v=>v<0?0:v>255?255:v;
  function woodTile(){const W=512,H=256,PH=64;const nA=noise(11,8,64),nB=noise(23,128,512),nC=noise(37,32,128);
    const base=[[112,68,40],[98,59,34],[120,76,45],[104,62,36]];const seams=[173,401,77,289];
    return tile(W,H,(x,y)=>{const k=Math.floor(y/PH),yy=y%PH;const b=base[k%4];
      const warp=nA(x/64,y/8+k*5.3)*2-1;const ring=Math.sin((yy*.55+warp*9+k*3.1)+nC(x/16,y/4)*4);
      const fine=nB(x/4,y/.5)-.5;let v=.82+.13*ring+.16*fine+.1*warp;
      if(yy<2)v*=.42;else if(yy===2)v*=1.12;else if(yy>=PH-2)v*=.7;
      const sx=seams[k%4];if(Math.abs(x-sx)<1.5)v*=.5;else if(Math.abs(x-sx)<3)v*=.85;
      return [clamp(b[0]*v),clamp(b[1]*v),clamp(b[2]*v)]})}
  function leatherTile(){const S=256;const nA=noise(51,8,8),nB=noise(67,64,64),nC=noise(71,32,32);
    return tile(S,S,(x,y)=>{const m=nA(x/32,y/32)*.6+nC(x/8,y/8)*.4;const g=nB(x/4,y/4);const crease=Math.abs(nC(x/8+11.5,y/8+5.5)-.5)<.03?.8:1;
      let v=(.78+.3*m+.1*(g-.5))*crease;if(g>.93)v*=.75;return [clamp(92*v),clamp(47*v),clamp(26*v)]})}
  function parchTile(){const S=256;const nA=noise(83,8,8),nB=noise(97,64,16),nC=noise(101,128,128);
    return tile(S,S,(x,y)=>{const m=nA(x/32,y/32);const fib=nB(x/4,y/16);const sp=nC(x/2,y/2);
      let a=.05+.12*Math.max(0,m-.45)+.07*Math.max(0,fib-.6);if(sp>.965)a+=.12;return [120,78,30,clamp(a*255)]},'image/png')}
  function textures(){if(!HAS_DOM||JSDOM)return;try{const t=document.createElement('canvas');if(!t.getContext||!t.getContext('2d'))return;
      const r=document.documentElement.style;const w=woodTile(),l=leatherTile(),p=parchTile();
      if(w)r.setProperty('--tex-wood',`url("${w}")`);if(l)r.setProperty('--tex-leather',`url("${l}")`);if(p)r.setProperty('--tex-parch',`url("${p}")`);
      // bake the big surfaces (light, vignette and texture in one picture) so the browser paints one image instead of stacked gradients
      if(w&&l&&p)Promise.all([w,l,p].map(img)).then(([W,Lt,Pt])=>{try{const set=(k,c)=>{const u=blobURL(c);if(u)r.setProperty(k,`url("${u}")`)};
        set('--img-table',bakeTable(W));set('--img-wall',bakeWall(W));set('--img-mat',bakeMat(Lt));set('--img-bar',bakeBar(W));set('--img-parch',bakeParch(Pt));
        document.documentElement.classList.add('baked')}catch(e){}})}catch(e){}}
  function img(u){return new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=rej;i.src=u})}
  function cnv(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return [c,c.getContext('2d')]}
  function blobURL(c){try{const u=c.toDataURL('image/jpeg',.86);const b=atob(u.split(',')[1]),a=new Uint8Array(b.length);for(let i=0;i<b.length;i++)a[i]=b.charCodeAt(i);return URL.createObjectURL(new Blob([a],{type:'image/jpeg'}))}catch(e){return null}}
  function glow(x,cx,cy,r,col){const g=x.createRadialGradient(cx,cy,0,cx,cy,r);g.addColorStop(0,col);g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(0,0,x.canvas.width,x.canvas.height)}
  function vign(x,a,inner){const W=x.canvas.width,H=x.canvas.height;x.save();x.translate(W/2,H/2);x.scale(1,H/W);const g=x.createRadialGradient(0,0,W*(inner||.3),0,0,W*.62);g.addColorStop(0,'rgba(8,3,0,0)');g.addColorStop(1,`rgba(8,3,0,${a})`);x.fillStyle=g;x.fillRect(-W,-W,W*2,W*2);x.restore()}
  function bakeTable(W){const [c,x]=cnv(1400,760);x.fillStyle=x.createPattern(W,'repeat');x.save();x.scale(.66,.66);x.fillRect(0,0,1400/.66,760/.66);x.restore();
    x.globalCompositeOperation='soft-light';glow(x,250,-40,700,'rgba(255,190,110,.95)');glow(x,1200,0,600,'rgba(255,160,80,.7)');x.globalCompositeOperation='source-over';
    glow(x,250,-40,650,'rgba(255,180,100,.18)');glow(x,1200,0,520,'rgba(255,150,70,.12)');vign(x,.8,.26);return c}
  function bakeWall(W){const [c,x]=cnv(1000,700);x.fillStyle=x.createPattern(W,'repeat');x.save();x.rotate(Math.PI/2);x.translate(0,-1000);x.fillRect(0,0,700,1000);x.restore();
    x.fillStyle='rgba(12,5,1,.72)';x.fillRect(0,0,1000,700);glow(x,300,0,700,'rgba(255,160,70,.2)');glow(x,900,700,500,'rgba(255,120,40,.1)');vign(x,.6,.2);return c}
  function bakeMat(Lt){const [c,x]=cnv(1400,320);x.fillStyle=x.createPattern(Lt,'repeat');x.fillRect(0,0,1400,320);glow(x,700,-80,700,'rgba(255,200,140,.22)');vign(x,.55,.3);return c}
  function bakeBar(W){const [c,x]=cnv(1600,64);x.fillStyle=x.createPattern(W,'repeat');x.fillRect(0,0,1600,64);const g=x.createLinearGradient(0,0,0,64);g.addColorStop(0,'rgba(20,8,2,.45)');g.addColorStop(.6,'rgba(10,4,1,.7)');g.addColorStop(1,'rgba(5,2,0,.85)');x.fillStyle=g;x.fillRect(0,0,1600,64);return c}
  function bakeParch(Pt){const [c,x]=cnv(700,1000);let base='#f3e6c8';try{base=getComputedStyle(document.documentElement).getPropertyValue('--paper').trim()||base}catch(e){}
    x.fillStyle=base;x.fillRect(0,0,700,1000);x.fillStyle=x.createPattern(Pt,'repeat');x.fillRect(0,0,700,1000);glow(x,350,0,800,'rgba(255,252,240,.5)');vign(x,.28,.35);return c}
  // ---- embers drifting up through the candle light (High only) ----
  let cv=null,ctx=null,parts=[],raf=0,lastE=0;
  function setEmbers(on){embersOn=on&&!JSDOM&&HAS_DOM&&!reduce();if(!HAS_DOM)return;
    if(!embersOn){if(cv){cv.remove();cv=null}return}if(!raf&&!JSDOM&&typeof requestAnimationFrame==='function')raf=RAF(frame);
    if(!cv){const host=document.querySelector('.gx-main');if(!host)return;cv=document.createElement('canvas');cv.className='embers';cv.setAttribute('aria-hidden','true');host.appendChild(cv);ctx=cv.getContext('2d');if(!ctx){cv.remove();cv=null;embersOn=false;return}sizeEmbers()}}
  function sizeEmbers(){if(!cv)return;const b=document.querySelector('.gx-board');if(!b)return;const r=b.getBoundingClientRect(),hr=cv.parentNode.getBoundingClientRect();const dpr=Math.min(2,devicePixelRatio||1);
    cv.style.left=(r.left-hr.left)+'px';cv.style.top=(r.top-hr.top)+'px';cv.style.width=r.width+'px';cv.style.height=r.height+'px';cv.width=Math.round(r.width*dpr);cv.height=Math.round(r.height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0)}
  function stepEmbers(t){if(!cv||!ctx)return;if(t-lastE<33)return;const dt=Math.min(.1,(t-lastE)/1000);lastE=t;const W=cv.width/(Math.min(2,devicePixelRatio||1)),H=cv.height/(Math.min(2,devicePixelRatio||1));
    while(parts.length<22)parts.push({x:Math.random()*W,y:H*(.35+Math.random()*.7),vx:(Math.random()-.5)*8,vy:-(6+Math.random()*14),r:.6+Math.random()*1.6,l:0,m:4+Math.random()*6,ph:Math.random()*6});
    ctx.clearRect(0,0,W,H);ctx.globalCompositeOperation='lighter';
    for(const p of parts){p.l+=dt;p.x+=(p.vx+Math.sin(p.l*1.3+p.ph)*6)*dt;p.y+=p.vy*dt;const a=Math.sin(Math.min(1,p.l/p.m)*Math.PI)*.55;
      const g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*4);g.addColorStop(0,`rgba(255,214,140,${a})`);g.addColorStop(1,'rgba(255,140,40,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(p.x,p.y,p.r*4,0,6.283);ctx.fill()}
    parts=parts.filter(p=>p.l<p.m&&p.y>-10)}
  // ---- embers loop (High only). The frame watchdog and step-down are PerfHUD's standard controller now (see register below) ----
  function frame(t){if(!embersOn){raf=0;return}raf=RAF(frame);stepEmbers(t)}
  // PerfHUD: FPS-only stats (no renderer); Apply on the speed-test card is a choice by hand; auto changes are not saved
  function perf(){if(!PH)return;PH.register({game:'Doorkick Dungeon',levels:['high','medium','low'],names:NAME,anchor:'.felt',corner:'bl',
    getLevel:()=>level,isAuto:()=>auto,autoTop:()=>autoPick(),setLevel:(l,why)=>{set(l,why==='apply');if(typeof syncMenu==='function')try{syncMenu()}catch(e){}},
    // something is animating = a card flight, deal or clash is running (the endless CSS loops and the embers do not count)
    isAnimating:()=>{try{return document.getAnimations().some(a=>a.playState==='running'&&isFinite(a.effect.getComputedTiming().endTime))}catch(e){return false}},
    beforeTest:()=>{try{if(typeof GX!=='undefined'&&GX.close)GX.close()}catch(e){}}});PH.hitch(6000)}  // load: textures bake and card art is flattened in the first seconds
  // ---- card motion: a played card flies from the hand to where it lands; new cards are dealt from the deck ----
  function motion(){return HAS_DOM&&!JSDOM&&level!=='low'&&!reduce()&&typeof Element!=='undefined'&&typeof Element.prototype.animate==='function'&&(typeof ANIM==='undefined'||ANIM)}
  function snap(root){if(PH)PH.wake();if(!motion()||!root)return null;const m=new Map();root.querySelectorAll('.hand [data-card]').forEach(e=>{const r=e.getBoundingClientRect();if(r.width)m.set(e.dataset.card,{r,h:e.outerHTML})});
    const decks={};root.querySelectorAll('.pile .stack').forEach(s=>{decks[s.classList.contains('door')?'door':'tr']=s.getBoundingClientRect()});return {m,decks,started:!!root.querySelector('.hand')}}
  function after(root,s){if(!s||!motion()||!root)return;const host=document.querySelector('.gx-main');if(!host)return;const hr=host.getBoundingClientRect();
    const now=new Set();let k=0;
    root.querySelectorAll('.hand [data-card]').forEach(e=>{const id=e.dataset.card;now.add(id);if(s.m.has(id))return;
      const c=typeof cd==='function'?cd(+id):null;const dr=(c&&c.d==='door'?s.decks.door:s.decks.tr)||s.decks.door;if(!dr)return;const r=e.getBoundingClientRect();if(!r.width)return;
      const dx=dr.left+dr.width/2-(r.left+r.width/2),dy=dr.top+dr.height/2-(r.top+r.height/2),sc=dr.width/r.width;
      e.animate([{transform:`translate(${dx}px,${dy}px) scale(${sc}) rotate(-14deg)`,opacity:.2},{transform:'translate(0,0) scale(1) rotate(0)',opacity:1}],{duration:520,delay:Math.min(6,k++)*85,easing:'cubic-bezier(.2,.9,.3,1.08)',fill:'backwards'})});
    for(const [id,o] of s.m){if(now.has(id))continue;let t=null;for(const e of root.querySelectorAll(`[data-card="${id}"]`))if(!e.closest('.hand')){t=e;break}
      const g=document.createElement('div');g.className='ghost';g.setAttribute('aria-hidden','true');g.innerHTML=o.h.replace(/ data-card="/g,' data-gc="').replace(/<button/g,'<div').replace(/<\/button>/g,'</div>');host.appendChild(g);
      const x0=o.r.left-hr.left,y0=o.r.top-hr.top;let kf;
      if(t){const tr=t.getBoundingClientRect();const sc=Math.max(.2,tr.width/o.r.width);const x1=tr.left-hr.left,y1=tr.top-hr.top;const chip=t.classList.contains('gchip');
        kf=[{transform:`translate(${x0}px,${y0}px)`,opacity:1},{transform:`translate(${(x0+x1)/2}px,${Math.min(y0,y1)-60}px) scale(${(1+sc)/2*1.1}) rotate(6deg)`,opacity:1,offset:.45},{transform:`translate(${x1}px,${y1}px) scale(${sc})`,opacity:chip?0:1}];
        t.animate([{opacity:0},{opacity:0,offset:.85},{opacity:1}],{duration:560})}
      else kf=[{transform:`translate(${x0}px,${y0}px)`,opacity:1},{transform:`translate(${x0}px,${y0-90}px) scale(.8) rotate(-8deg)`,opacity:0}];
      const a=g.animate(kf,{duration:560,easing:'cubic-bezier(.3,.7,.3,1)',fill:'forwards'});a.onfinish=()=>g.remove();setTimeout(()=>g.remove(),1200)}}
  // ---- the clash: when a fight total changes, the number bumps and the difference floats up ----
  let lastClash=null;
  function clash(root){if(!root)return;const v=root.querySelector('.vs.clash');if(!v){lastClash=null;return}const k=v.dataset.k,a=+v.dataset.a,b=+v.dataset.b;const prev=lastClash;lastClash={k,a,b};
    if(!prev||prev.k!==k||!motion())return;
    const pop=(sel,d)=>{if(!d)return;const s=v.querySelector(sel);if(!s)return;const n=s.querySelector('.num');if(n)n.animate([{transform:'scale(1)'},{transform:'scale(1.5)',offset:.4},{transform:'scale(1)'}],{duration:520,easing:'cubic-bezier(.2,1.8,.4,1)'});
      const f=document.createElement('span');f.className='fxdelta '+(d>0?'up':'dn');f.textContent=(d>0?'+':'−')+Math.abs(d);s.appendChild(f);setTimeout(()=>f.remove(),1150)};
    pop('.score.hero',a-prev.a);pop('.score.mons',b-prev.b)}
  function init(){if(!HAS_DOM)return;textures();apply(load());
    perf();
    try{addEventListener('resize',()=>{sizeEmbers();if(auto){const v=autoPick();if(v!==level&&!(v==='high'&&level!=='high'))apply(v)}})}catch(e){}
    if(typeof GX!=='undefined'&&GX.onResize)GX.onResize(()=>sizeEmbers())}
  return {init,set,cycle,snap,after,clash,motion,get level(){return level},get auto(){return auto},name:()=>NAME[level],sizeEmbers}})();
