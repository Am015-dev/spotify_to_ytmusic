// PURPOSE: one shared film-grain / dust / scratch overlay and a faint vignette over the whole play field, plus smooth-noise camera shake
// FLAG: RET.grain (?grain=0 / ?grain=1); on the flight (pure.js) and street (purefoot.js) frames, drawn after the actors and before the HUD
// TEST: qa/grain-probe.js (cost per frame, phone + PC shots with and without)
/* ---------- W252: the separate painted layers read as ONE picture when the same animated texture lies over all of them. Five small noise tiles are
   made once from a seeded PRNG (no Math.random: probes stay deterministic), cycled at 12 fps, tiled over the field with low alpha as dark specks, a few
   pale dust motes and rare vertical scratches; the vignette is one cached radial gradient per size. SHAKE: the existing G.shake / S.shake amplitude
   (shake() in b.js, ftShake() in foot.js, comfort caps, 0 with reduced motion) is read through smooth value noise instead of a random jitter. ---------- */
if(RET.grain===undefined)RET.grain=!/[?&]grain=0/.test(location.search)&&(/[?&]grain=1/.test(location.search)||false);   // default decided by the W252 gates (HANDOFF-W252.md)
const GRAIN=window.GRAIN={N:5,TS:192,FPS:12,A:.9,K:2,tiles:null,fr:[],vk:'',
  rng(s){return()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};},   // mulberry32
  make(){const TS=this.TS,r=this.rng(252);this.tiles=[];
    for(let k=0;k<this.N;k++){const c=document.createElement('canvas');c.width=c.height=TS;const g=c.getContext('2d');
      for(let i=0;i<TS*TS/26;i++){g.fillStyle=`rgba(0,0,0,${.35+r()*.65})`;g.fillRect(r()*TS|0,r()*TS|0,1+(r()<.25),1);}   // dark specks
      for(let i=0;i<TS*TS/220;i++){g.fillStyle=`rgba(255,244,225,${.25+r()*.5})`;g.fillRect(r()*TS|0,r()*TS|0,1,1);}   // pale dust
      if(r()<.6){const x=r()*TS|0;g.fillStyle='rgba(255,255,255,.35)';g.fillRect(x,r()*TS*.4|0,1,TS*(.3+r()*.5));}   // a faint scratch
      for(let i=0;i<2;i++){g.fillStyle='rgba(0,0,0,.5)';const x=r()*TS,y=r()*TS;g.fillRect(x,y,1+r()*5,1);}   // short hairs
      this.tiles.push(c);}
    this.pats=null;},
  draw(c,w,h,t){if(!RET.grain)return;if(!this.tiles)this.make();
    const K=this.K,i=Math.floor(t*this.FPS)%this.N,key=w+'x'+h;   // per size, N half-resolution frames (grain + vignette baked together): a frame costs one scaled blit
    if(this.vk!==key){this.fr=[];this.vk=key;}
    let f=this.fr[i];if(!f){const m=Math.max(64,Math.round(w/K)),n=Math.max(64,Math.round(h/K));f=this.fr[i]=document.createElement('canvas');f.width=m;f.height=n;const g=f.getContext('2d');
      g.fillStyle=g.createPattern(this.tiles[i],'repeat');g.globalAlpha=this.A*(SET.hc?.5:1);g.translate(-(i*37%this.TS),-(i*91%this.TS));g.fillRect(i*37%this.TS,i*91%this.TS,m+1,n+1);g.setTransform(1,0,0,1,0,0);g.globalAlpha=1;
      const q=g.createRadialGradient(m/2,n/2,Math.min(m,n)*.38,m/2,n/2,Math.hypot(m,n)*.52);q.addColorStop(0,'rgba(0,0,0,0)');q.addColorStop(1,'rgba(2,0,8,.5)');g.fillStyle=q;g.fillRect(0,0,m,n);}
    c.save();c.setTransform(1,0,0,1,0,0);c.globalAlpha=1;c.globalCompositeOperation='source-over';c.imageSmoothingEnabled=false;c.drawImage(f,0,0,w,h);c.restore();},
  // smooth value noise in -1..1 (cosine-eased lattice), two octaves: the shake wanders instead of jumping
  n1(x,s){const i=Math.floor(x),f=x-i,u=(1-Math.cos(f*Math.PI))/2,h=k=>{k=Math.imul(k+s*131|0,0x45d9f3b);k=Math.imul(k^k>>>16,0x45d9f3b);return((k^k>>>16)>>>0)/2147483648-1;};return h(i)*(1-u)+h(i+1)*u;},
  cap(){return(window.innerWidth>760&&window.innerHeight>500?10:6);},   // px: phone 6, PC 10
  shake(a,t){if(!(a>0)||SET.rm)return null;a=Math.min(a*.5,this.cap());const x=t*26;return[a*(this.n1(x,1)+.5*this.n1(x*2.3,2))/1.5,a*(this.n1(x,3)+.5*this.n1(x*2.3,4))/1.5];}};
