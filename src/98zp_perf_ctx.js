// ============================================================ PERF1 (v89i): one WebGL context
// The menu car cards (W13_carImg), the garage part thumbnails (GS.th, shared by PA/R2/G9C) and the garage builder (GB.r) each had their own
// WebGLRenderer = a second/third/fourth context, every shader compiled again, and PNG encodes of WebGL canvases (toDataURL) on garage open.
// Now all of them draw with the main renderer:
//  - P1_off(w,h): an offscreen "renderer" (same API subset the old code used) that renders into a 4x MSAA render target and reads the pixels back;
//    .canvas() gives a 2D canvas, .url() a blob URL (tiny uncompressed PNG, no canvas encode).
//  - P1_view(cvs): the builder's "renderer". While the garage is open the main canvas #c is moved under the (now transparent) #gbC,
//    sized to it, and the builder draws there (4x MSAA target + one copy pass); the main game render is skipped (it was hidden by #gbx anyway).
//    Closing the garage puts #c back and calls resize().
// Render targets keep the canvas look: same tone mapping, sRGB encode in the shader (isXRRenderTarget path of three r164), RGBA8 storage.
const P1={gb:false,rt:{},q:[],qOn:false,qs:null,qc:null,qm:null};
function P1_rt(k,w,h){let t=P1.rt[k];if(t&&t.width===w&&t.height===h)return t;if(t)t.dispose();
 // allocate as linear RGBA8 (MSAA renderbuffer and resolve texture must match), then switch the texture to sRGB so three encodes in the shader
 t=new THREE.WebGLRenderTarget(w,h,{samples:renderer.capabilities.isWebGL2?4:0,type:THREE.UnsignedByteType,depthBuffer:true});t.isXRRenderTarget=true;
 const prev=renderer.getRenderTarget();renderer.setRenderTarget(t);renderer.setRenderTarget(prev);t.texture.colorSpace=THREE.SRGBColorSpace;return P1.rt[k]=t}
function P1_free(k){const t=P1.rt[k];if(t){t.dispose();delete P1.rt[k]}}
// draw scene into render target k with the given tone mapping / clear / shadow settings; restores the main renderer afterwards
function P1_draw(k,w,h,sc,cam,o){const R=renderer,sm=R.shadowMap,S={rt:R.getRenderTarget(),tm:R.toneMapping,ex:R.toneMappingExposure,cc:R.getClearColor(new THREE.Color()),ca:R.getClearAlpha(),ac:R.autoClear,se:sm.enabled,st:sm.type,su:sm.autoUpdate,sn:sm.needsUpdate,ar:R.info.autoReset};
 const t=P1_rt(k,w,h);try{R.info.autoReset=false;R.toneMapping=o.tm;R.toneMappingExposure=o.ex;R.setClearColor(o.cc,o.ca);R.autoClear=true;
  if(o.sm){sm.enabled=o.sm.enabled;sm.type=o.sm.type;sm.autoUpdate=o.sm.autoUpdate;sm.needsUpdate=o.sm.needsUpdate}else sm.enabled=false;
  R.setRenderTarget(t);R.clear();R.render(sc,cam);if(o.sm)o.sm.needsUpdate=sm.needsUpdate}
 finally{R.setRenderTarget(S.rt);R.toneMapping=S.tm;R.toneMappingExposure=S.ex;R.setClearColor(S.cc,S.ca);R.autoClear=S.ac;sm.enabled=S.se;sm.type=S.st;sm.autoUpdate=S.su;sm.needsUpdate=S.sn;R.info.autoReset=S.ar}return t}
// ---- offscreen renderer: render -> pixels (top-down, straight alpha, like drawImage of an alpha WebGL canvas)
function P1_off(w,h){return{w,h,toneMapping:THREE.NoToneMapping,toneMappingExposure:1,outputColorSpace:THREE.SRGBColorSpace,cc:new THREE.Color(0),ca:0,px:null,
 setPixelRatio(){},setSize(w,h){this.w=w;this.h=h},setClearColor(c,a=1){this.cc.set(c);this.ca=a},clear(){},
 render(sc,cam){const w=this.w,h=this.h,t=P1_draw('o'+w+'x'+h,w,h,sc,cam,{tm:this.toneMapping,ex:this.toneMappingExposure,cc:this.cc,ca:this.ca}),b=new Uint8Array(w*h*4);renderer.readRenderTargetPixels(t,0,0,w,h,b);this.px=P1_img(b,w,h)},
 // same, but the pixels come back through a pixel-pack buffer + fence (WebGL2): the main thread never waits for the GPU queue
 renderAsync(sc,cam,cb){const w=this.w,h=this.h,t=P1_draw('o'+w+'x'+h,w,h,sc,cam,{tm:this.toneMapping,ex:this.toneMappingExposure,cc:this.cc,ca:this.ca});
  P1_readAsync(t,w,h,b=>{const o=P1_off(w,h);o.px=P1_img(b,w,h);cb(o.canvas())})},
 canvas(){const c=document.createElement('canvas');c.width=this.w;c.height=this.h;if(this.px)c.getContext('2d').putImageData(this.px,0,0);return c},
 url(){return this.px?P1_png(this.px):null}}}
// GL rows (bottom-up, premultiplied by the blend) -> ImageData (top-down, straight alpha)
function P1_img(b,w,h){const d=new Uint8ClampedArray(w*h*4),r=w*4;for(let y=0;y<h;y++){const s=(h-1-y)*r,o=y*r;for(let i=0;i<r;i+=4){const a=b[s+i+3];d[o+i+3]=a;if(a===255||a===0){d[o+i]=b[s+i];d[o+i+1]=b[s+i+1];d[o+i+2]=b[s+i+2]}else{const k=255/a;d[o+i]=b[s+i]*k;d[o+i+1]=b[s+i+1]*k;d[o+i+2]=b[s+i+2]*k}}}return new ImageData(d,w,h)}
function P1_readAsync(t,w,h,cb){const R=renderer,gl=R.getContext(),sync=()=>{const b=new Uint8Array(w*h*4);R.readRenderTargetPixels(t,0,0,w,h,b);cb(b)};
 if(!R.capabilities.isWebGL2||!gl.fenceSync)return sync();let buf,f;
 try{buf=gl.createBuffer();gl.bindBuffer(gl.PIXEL_PACK_BUFFER,buf);gl.bufferData(gl.PIXEL_PACK_BUFFER,w*h*4,gl.STREAM_READ);R.state.bindFramebuffer(gl.FRAMEBUFFER,R.properties.get(t).__webglFramebuffer);
  gl.readPixels(0,0,w,h,gl.RGBA,gl.UNSIGNED_BYTE,0);f=gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE,0);gl.flush()}catch(e){f=null}finally{gl.bindBuffer(gl.PIXEL_PACK_BUFFER,null);R.state.bindFramebuffer(gl.FRAMEBUFFER,null);R.setRenderTarget(R.getRenderTarget())}
 if(!f){if(buf)gl.deleteBuffer(buf);return sync()}
 const poll=()=>{const st=gl.clientWaitSync(f,0,0);if(st===gl.TIMEOUT_EXPIRED){setTimeout(poll,16);return}gl.deleteSync(f);const b=new Uint8Array(w*h*4);gl.bindBuffer(gl.PIXEL_PACK_BUFFER,buf);gl.getBufferSubData(gl.PIXEL_PACK_BUFFER,0,b);gl.bindBuffer(gl.PIXEL_PACK_BUFFER,null);gl.deleteBuffer(buf);cb(b)};setTimeout(poll,16)}
// minimal PNG (stored deflate blocks): sync, a few hundred µs for a thumbnail, any browser decodes it
const P1_CRC=(()=>{const T=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xedb88320^(c>>>1):c>>>1;T[n]=c>>>0}return T})();
function P1_png(im){const w=im.width,h=im.height,px=im.data,row=w*4+1,raw=new Uint8Array(row*h);for(let y=0;y<h;y++)raw.set(px.subarray(y*w*4,(y+1)*w*4),y*row+1);
 const nb=Math.max(1,Math.ceil(raw.length/65535)),z=new Uint8Array(2+raw.length+nb*5+4);z[0]=0x78;z[1]=1;let p=2,a=1,b2=0;
 for(let i=0;i<nb;i++){const s=i*65535,n=Math.min(65535,raw.length-s);z[p++]=i===nb-1?1:0;z[p++]=n&255;z[p++]=n>>8;z[p++]=~n&255;z[p++]=(~n>>8)&255;z.set(raw.subarray(s,s+n),p);p+=n}
 for(let i=0;i<raw.length;i++){a=(a+raw[i])%65521;b2=(b2+a)%65521}const ad=((b2<<16)|a)>>>0;z[p++]=ad>>>24;z[p++]=(ad>>16)&255;z[p++]=(ad>>8)&255;z[p++]=ad&255;
 const ch=(ty,d)=>{const o=new Uint8Array(12+d.length),v=new DataView(o.buffer);v.setUint32(0,d.length);for(let i=0;i<4;i++)o[4+i]=ty.charCodeAt(i);o.set(d,8);let c=0xffffffff;for(let i=4;i<8+d.length;i++)c=P1_CRC[(c^o[i])&255]^(c>>>8);v.setUint32(8+d.length,(c^0xffffffff)>>>0);return o};
 const hd=new Uint8Array(13),hv=new DataView(hd.buffer);hv.setUint32(0,w);hv.setUint32(4,h);hd[8]=8;hd[9]=6;
 return URL.createObjectURL(new Blob([new Uint8Array([137,80,78,71,13,10,26,10]),ch('IHDR',hd),ch('IDAT',z),ch('IEND',new Uint8Array(0))],{type:'image/png'}))}
// ---- garage builder view: draws into the main canvas, which sits under the transparent #gbC while the garage is open
function P1_view(cvs){return{domElement:cvs,toneMapping:THREE.NoToneMapping,toneMappingExposure:1,outputColorSpace:THREE.SRGBColorSpace,pr:1,cc:new THREE.Color(0),ca:0,
 shadowMap:{enabled:false,type:THREE.PCFShadowMap,autoUpdate:true,needsUpdate:false},
 setPixelRatio(p){this.pr=p},getPixelRatio(){return this.pr},setSize(w,h){cvs.width=Math.floor(w*this.pr);cvs.height=Math.floor(h*this.pr)},setClearColor(c,a=1){this.cc.set(c);this.ca=a},
 render(sc,cam){P1_gbDraw(this,sc,cam)}}}
function P1_attach(cvs){if(P1.gb)return;const c=renderer.domElement;P1.par=c.parentNode;P1.nx=c.nextSibling;P1.gb=true;cvs.parentNode.insertBefore(c,cvs);$('#gbx').classList.add('p1on');P1.box=''}
function P1_detach(){if(!P1.gb)return;const c=renderer.domElement;P1.gb=false;if(P1.par)P1.par.insertBefore(c,P1.nx&&P1.nx.parentNode===P1.par?P1.nx:null);c.style.cssText='';$('#gbx').classList.remove('p1on');P1_free('gb');try{resize()}catch(e){}}
function P1_gbDraw(V,sc,cam){const cvs=V.domElement;if($('#gbx').hidden)return;P1_attach(cvs);const R=renderer,c=R.domElement,W=cvs.width,H=cvs.height;if(!W||!H)return;
 const bx=cvs.offsetLeft+','+cvs.offsetTop+','+cvs.clientWidth+','+cvs.clientHeight;if(bx!==P1.box){P1.box=bx;c.style.cssText=`position:absolute;inset:auto;left:${cvs.offsetLeft}px;top:${cvs.offsetTop}px;width:${cvs.clientWidth}px;height:${cvs.clientHeight}px;pointer-events:none`}
 if(R.getPixelRatio()!==1)R.setPixelRatio(1);if(c.width!==W||c.height!==H)R.setSize(W,H,false);
 const t=P1_draw('gb',W,H,sc,cam,{tm:V.toneMapping,ex:V.toneMappingExposure,cc:V.cc,ca:V.ca,sm:V.shadowMap});
 if(!P1.qs){P1.qm=new THREE.ShaderMaterial({uniforms:{t:{value:null},bg:{value:new THREE.Vector3(0x31/255,0x3a/255,0x4c/255)}},depthTest:false,depthWrite:false,toneMapped:false,
   vertexShader:'varying vec2 u;void main(){u=uv;gl_Position=vec4(position.xy,0.,1.);}',fragmentShader:'uniform sampler2D t;uniform vec3 bg;varying vec2 u;void main(){vec4 c=texture2D(t,u);gl_FragColor=vec4(c.rgb+bg*(1.-c.a),1.);}'});
  const m=new THREE.Mesh(new THREE.PlaneGeometry(2,2),P1.qm);m.frustumCulled=false;P1.qs=new THREE.Scene();P1.qs.add(m);P1.qc=new THREE.OrthographicCamera(-1,1,1,-1,0,1)}
 P1.qm.uniforms.t.value=t.texture;const ac=R.autoClear,ar=R.info.autoReset;R.info.autoReset=false;R.autoClear=false;try{R.setRenderTarget(null);R.render(P1.qs,P1.qc)}finally{R.autoClear=ac;R.info.autoReset=ar}}
{const st=document.createElement('style');st.textContent='#gbx.p1on #gbC{opacity:0}';document.head.appendChild(st)}
new MutationObserver(()=>{if($('#gbx').hidden)P1_detach()}).observe($('#gbx'),{attributes:true,attributeFilter:['hidden']});
// while the builder owns the main canvas: no game render into it and no resize of it (resize runs when the garage closes)
composer.render=(f=>function(...a){if(P1.gb){if($('#gbx').hidden)P1_detach();else return}return f.apply(this,a)})(composer.render);
resize=(f=>function(){if(P1.gb)return;return f.apply(this,arguments)})(resize);
// ---- garage thumbnails: lazy, a few per frame (≥2, ~10 ms; visible tiles first), cached per part + colour
GS_thumbs=function(){if(!GB_.bk)return;const c=GB_.col;document.querySelectorAll('#gbBkPc .gbPc').forEach(b=>{if(b.style.display==='none'||b.dataset.tc===String(c))return;
  const key=b.dataset.p+'|'+c;if(GS.thC.has(key))P1_thSet(b,c,GS.thC.get(key));else if(!P1.q.some(q=>q.b===b&&q.c===c))P1.q.push({b,c})});P1_tq()};
function P1_thSet(b,c,u){if(!u)return;b.dataset.tc=c;let im=b.querySelector('img');if(!im){im=document.createElement('img');im.alt='';b.insertBefore(im,b.firstChild)}im.src=u;b.classList.add('gsTh')}
function P1_tq(){if(P1.qOn||!P1.q.length)return;P1.qOn=true;requestAnimationFrame(function step(){const t0=performance.now(),vh=innerHeight,vw=innerWidth;
  P1.q=P1.q.filter(q=>q.c===GB_.col&&q.b.isConnected&&q.b.dataset.tc!==String(q.c)&&!$('#gbx').hidden);
  const vis=q=>{const r=q.b.getBoundingClientRect();return r.width>0&&r.right>0&&r.left<vw&&r.bottom>0&&r.top<vh};P1.q.sort((a,b)=>vis(b)-vis(a));
  let n=0;while(P1.q.length&&(n++<2||performance.now()-t0<10)){const q=P1.q.shift();try{P1_thSet(q.b,q.c,GS_thumb(q.b.dataset.p,q.c))}catch(e){}}
  if(P1.q.length)requestAnimationFrame(step);else P1.qOn=false})}
window.__P1={P1,off:P1_off,draw:P1_draw,gb:()=>GB,R:renderer,ctx:()=>P1,progs:()=>renderer.info.programs.map(p=>p.name+'#'+p.usedTimes),keys:()=>renderer.info.programs.map(p=>p.cacheKey)};
// ============================================================ PERF2 (v89i): shader warm-up off the critical path
// renderer.compile only issues compile/link to the GPU process; the main thread blocks later, at the first draw that needs a program
// (three reads its uniforms). So: link programs early and in the background (the existing ldPrewarm polls KHR_parallel_shader_compile where the browser has it), and never ask for programs the next frame does not draw.
function P2_after(fn){requestAnimationFrame(()=>requestAnimationFrame(()=>{try{fn()}catch(e){console.warn('P2',e)}}))}
// every warm-up compiled with no render target bound, i.e. the canvas variant (sRGB out + tone mapping). The game draws the scene through the
// composer (RenderPass -> linear HalfFloat target, no tone mapping): a different program. So each warm-up linked ~50 programs that were never used,
// and the real ones still linked at the first frame. P2_compile compiles for the composer's target.
function P2_compile(sc,cam){const R=renderer,t=R.getRenderTarget(),f=R.getActiveCubeFace(),l=R.getActiveMipmapLevel();R.setRenderTarget(composer.readBuffer);
 try{return R.compile(sc,cam)}finally{R.setRenderTarget(t,f,l)}}
// (plain compile: issuing the links is enough; three r164 compileAsync can throw on a material without a program while polling)
function P2_warm(sc,cam){try{P2_compile(sc,cam)}catch(e){}}
