// PURPOSE: wiring fixes for painted art: flat backgrounds keyed out at load (sprites), white gaps keyed out of the street layers, the street sky drawn at its own aspect
// FLAG: artfix (?artfix=0 = the old wiring)
// TEST: qa/assetaudit.js (BLUR / DIST / OPAQUE / WHITE flags before and after); qa/loadgate.js
/* ---------- ARTFIX (owner, 22 Oct 2026: "lots of assets not wired correctly: blurred, distorted, without the background removal").
   ART.fix(n,b)   called by ART.load for every picture: a SPRITE (en-, spr-, pk-, fl-, char-) whose four corners are one flat opaque colour gets that colour flooded away from the
                  edges with a soft 1-pixel edge. Scenes (corners differ), pictures that already have transparent corners, and a flood that would eat < 8% or > 92% are left alone.
   AFX.fixFoot    called by footart.js when a media/foot/ picture has loaded: the street layers far/mid/near lose their enclosed WHITE gaps (the white key of the generator only
                  reached the edges); an on-foot pose with a flat background is keyed like a sprite. The keyed copy is made once, at load, and cached by the loader. ---------- */
if(RET.artfix===undefined)RET.artfix=!/[?&]artfix=0/.test(location.search);
const AFX={log:{},KEY:/^(en|spr|pk|fl|char)-/,LAYER:/^foot\/bg-(far|mid|near)$/,POSE:/^foot\/(?!bg-)/};
AFX.px=b=>{const w=b.naturalWidth||b.width,h=b.naturalHeight||b.height;if(!w||!h)return null;const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d',{willReadFrequently:true});g.drawImage(b,0,0);
  try{const id=g.getImageData(0,0,w,h);return{c,g,id,d:id.data,w,h};}catch(e){return null;}};
/* flat colour at the four corners -> flood from the whole border, soft edge; returns the removed fraction (0 = untouched) */
AFX.flat=o=>{const{d,w,h}=o,N=w*h,cs=[0,w-1,(h-1)*w,N-1].map(p=>[d[p*4],d[p*4+1],d[p*4+2],d[p*4+3]]);if(cs.some(c=>c[3]<250))return 0;
  const m=[0,1,2].map(k=>(cs[0][k]+cs[1][k]+cs[2][k]+cs[3][k])/4);if(cs.some(c=>Math.abs(c[0]-m[0])+Math.abs(c[1]-m[1])+Math.abs(c[2]-m[2])>60))return 0;
  const T=30,S=80,dist=p=>Math.abs(d[p*4]-m[0])+Math.abs(d[p*4+1]-m[1])+Math.abs(d[p*4+2]-m[2]),seen=new Uint8Array(N),st=new Int32Array(N);let sp=0,n=0;
  const push=p=>{if(!seen[p]&&dist(p)<=T){seen[p]=1;st[sp++]=p;}};
  for(let x=0;x<w;x++){push(x);push((h-1)*w+x);}for(let y=0;y<h;y++){push(y*w);push(y*w+w-1);}
  while(sp){const p=st[--sp],x=p%w;n++;if(x>0)push(p-1);if(x<w-1)push(p+1);if(p>=w)push(p-w);if(p<N-w)push(p+w);}
  if(n<N*.08||n>N*.92)return 0;
  for(let p=0;p<N;p++)if(seen[p])d[p*4+3]=0;
  for(let p=0;p<N;p++){if(seen[p])continue;const x=p%w;if(!((x>0&&seen[p-1])||(x<w-1&&seen[p+1])||(p>=w&&seen[p-w])||(p<N-w&&seen[p+w])))continue;const q=dist(p);if(q<S)d[p*4+3]=Math.round(d[p*4+3]*Math.max(0,q-T)/(S-T));}
  return n/N;};
/* enclosed near-white gaps (a lit sky seen through the buildings) -> transparent; small white specks (highlights) stay; returns the removed fraction */
AFX.white=o=>{const{d,w,h}=o,N=w*h,lo=p=>Math.min(d[p*4],d[p*4+1],d[p*4+2]),isW=p=>lo(p)>228&&d[p*4+3]>200,seen=new Uint8Array(N),rem=new Uint8Array(N),st=new Int32Array(N),cm=Math.max(120,N*.00006);let tot=0;
  for(let s=0;s<N;s++){if(seen[s]||!isW(s))continue;let sp=0,n=0;const from=[];seen[s]=1;st[sp++]=s;while(sp){const p=st[--sp],x=p%w;n++;from.push(p);const nb=[x>0?p-1:-1,x<w-1?p+1:-1,p>=w?p-w:-1,p<N-w?p+w:-1];for(const q of nb)if(q>=0&&!seen[q]&&isW(q)){seen[q]=1;st[sp++]=q;}}
    if(n>=cm){for(const p of from)rem[p]=1;tot+=n;}}
  if(!tot)return 0;for(let p=0;p<N;p++)if(rem[p])d[p*4+3]=0;
  for(let p=0;p<N;p++){if(rem[p]||d[p*4+3]===0)continue;const x=p%w;if(!((x>0&&rem[p-1])||(x<w-1&&rem[p+1])||(p>=w&&rem[p-w])||(p<N-w&&rem[p+w])))continue;const l=lo(p);if(l>170)d[p*4+3]=Math.round(d[p*4+3]*Math.max(0,Math.min(1,(250-l)/80)));}
  return tot/N;};
AFX.run=(id,b,fn)=>{try{const o=AFX.px(b);if(!o)return null;const k=fn(o);if(!k)return null;o.g.putImageData(o.id,0,0);AFX.log[id]=+k.toFixed(3);return o.c;}catch(e){return null;}};
ART.fix=(n,b)=>{if(!RET.artfix||!b||!AFX.KEY.test(n)||n.indexOf('anim/')===0)return b;return AFX.run(n,b,AFX.flat)||b;};
AFX.fixFoot=(f,r)=>{if(!RET.artfix||!r||!r.im)return;const id=f.replace(/\.webp$/,'');let c=null;
  if(AFX.LAYER.test(id))c=AFX.run(id,r.im,AFX.white);else if(AFX.POSE.test(id))c=AFX.run(id,r.im,AFX.flat);
  if(c)r.im=c;};
