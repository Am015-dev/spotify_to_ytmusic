// ---- G8: builder camera on the phone, brick-shower transition, STEP VERTICAL, REDO (garage worker 8, docs/GARAGE2K_GAP.md gaps 4-6)
// 1) phone camera: a lower 3/4 view so the workshop (walls, roller doors, GARAGE sign, crew) fills the back of the shot like the 2K Body Shop,
//    and the view is shifted so the car sits in the free band between the top toolbar and the parts palette.
// 2) brick shower: LEGO bricks pour across the screen when you enter or leave the builder. 3) STEP ▲/▼ moves the held part a plate up/down
//    (it must still touch something: rest on, hang under or sit beside a part or the chassis). 4) REDO next to UNDO (Ctrl+Y / Ctrl+Shift+Z).
const G8={T:{pit:.15,k:.92,top:6,bot:4,dur:1},redo:[],sh:null,nSh:0};
// ---------- 1) camera
function G8_band(){const c=$('#gbC').getBoundingClientRect(),t=$('#gbBkT'),p=$('#gbBkP');let y0=c.top,y1=c.bottom;
 if(t&&t.offsetParent){let m=0;for(const e of t.querySelectorAll('button,#gbBkN'))if(e.offsetParent&&!e.closest('#gbBkS'))m=Math.max(m,e.getBoundingClientRect().bottom);if(m)y0=m}
 if(p&&p.offsetParent){const r=p.getBoundingClientRect();if(r.height)y1=Math.min(y1,r.top)}return[y0-c.top+G8.T.top,y1-c.top-G8.T.bot,c.height,c.width]}
GB_cam=(f=>function(){f();if(!GB_.bk||innerHeight>500)return;const C=GB.cam,k=G8.T.k;C.position.set(C.position.x*k,.5+(C.position.y-.5)*k,C.position.z*k);C.lookAt(0,.5,0);
 const[a,b,h,w]=G8_band();if(b-a<60)return;const oy=Math.round(h/2-(a+b)/2),v=C.view;if(!v||!v.enabled||v.offsetY!==oy||v.fullWidth!==w||v.fullHeight!==h)C.setViewOffset(w,h,0,oy,w,h);C.updateMatrixWorld()})(GB_cam);
GB_enter=(f=>function(){const was=GB_.bk,r=f.apply(this,arguments);if(!was&&GB_.bk){if(innerHeight<=500)GB_.pit=G8.T.pit;G8.redo=[];G8_ui();G8_shower(1)}return r})(GB_enter);
GNB_new=(f=>function(){const r=f.apply(this,arguments);if(innerHeight<=500)GB_.pit=G8.T.pit;return r})(GNB_new);
GB_exit=(f=>function(){const was=GB_.bk,r=f.apply(this,arguments);if(was&&!GB_.bk)G8_shower(0);return r})(GB_exit);
// ---------- 2) brick shower: one full-screen 2D canvas, ~70 bricks, 0.9 s, then removed (no pointer events, never blocks a tap)
function G8_shower(enter){if(G8.sh&&G8.sh.t0)G8.sh.t0-=400;const cv=document.createElement('canvas'),W=innerWidth,H=innerHeight,dp=Math.min(2,devicePixelRatio||1);cv.width=W*dp;cv.height=H*dp;
 cv.id='g8Sh';cv.style.cssText='position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:9999';document.body.appendChild(cv);const g=cv.getContext('2d'),N=70,B=[];
 for(let i=0;i<N;i++){const s=(16+Math.random()*22)*Math.max(.8,Math.min(1.4,H/500)),n=1+(Math.random()*4|0);
  B.push({x:enter?W*Math.random():W*(i/N)+Math.random()*40-20,y:enter?H+s*2+Math.random()*H*.3:-s*2-Math.random()*H*.5,vx:enter?(Math.random()-.5)*W*.5:(Math.random()-.3)*120,vy:enter?-(H*1.3+Math.random()*H*.9):H*(.6+Math.random()*.6),
   r:Math.random()*6.3,vr:(Math.random()-.5)*9,s,n,c:GB_BC[i%GB_BC.length],d:Math.random()*.25})}
 const S={cv,t0:0,B};G8.sh=S;G8.nSh++;try{AU.sfx('brick')}catch(e){}
 const shade=(c,k)=>{const n=parseInt(c.slice(1),16),f=v=>Math.max(0,Math.min(255,Math.round(v*k)));return`rgb(${f(n>>16)},${f(n>>8&255)},${f(n&255)})`};
 const draw=now=>{if(!S.t0)S.t0=now;const t=(now-S.t0)/1000/G8.T.dur;g.setTransform(dp,0,0,dp,0,0);g.clearRect(0,0,W,H);if(t>1.05||!cv.isConnected){cv.remove();if(G8.sh===S)G8.sh=null;return}
  for(const q of B){const u=t-q.d;if(u<0)continue;const x=q.x+q.vx*u,y=q.y+q.vy*u+(enter?H*1.6:H*.5)*u*u,w=q.s*q.n*.62+q.s*.4,h=q.s*.62;g.save();g.translate(x,y);g.rotate(q.r+q.vr*u);g.globalAlpha=Math.min(1,(1.05-t)*5);
   g.fillStyle=shade(q.c,.62);g.fillRect(-w/2,-h/2+h*.25,w,h);g.fillStyle=q.c;g.fillRect(-w/2,-h/2,w,h*.8);g.fillStyle=shade(q.c,1.25);g.fillRect(-w/2,-h/2,w,h*.12);
   const sw=w/q.n;for(let k=0;k<q.n;k++){const sx=-w/2+sw*(k+.5);g.fillStyle=shade(q.c,.7);g.fillRect(sx-sw*.28,-h/2-h*.22,sw*.56,h*.24);g.fillStyle=q.c;g.fillRect(sx-sw*.28,-h/2-h*.3,sw*.56,h*.14)}g.restore()}
  requestAnimationFrame(draw)};requestAnimationFrame(draw)}
// ---------- 3) STEP VERTICAL: the held part moves one plate up or down to the next spot where it touches something and overlaps nothing
function G8_free(b,y,list){const[fw,fd]=GB_dims(b),h=GB_PC[b.t].h;let bmax=-1e9,floor=1e9,touch=0;for(const k in GB_.base){bmax=Math.max(bmax,GB_.base[k]);floor=Math.min(floor,GB_.base[k])}if(y+h>bmax+GB_CAP)return 0;
 for(let i=b.x;i<b.x+fw;i++)for(let j=b.z;j<b.z+fd;j++){if(i<GB_N0||i>GB_N1||j<GB_N0||j>GB_N1)return 0;const s=GB_.base[i+','+j];if(s!=null){if(s>y)return 0;if(s===y)touch=1}}
 if(y<floor)return 0;
 for(let i=b.x-1;i<=b.x+fw;i++)for(let j=b.z-1;j<=b.z+fd;j++){const ins=i>=b.x&&i<b.x+fw&&j>=b.z&&j<b.z+fd;if(ins)continue;const s=GB_.base[i+','+j];if(s!=null&&s>y&&(i===b.x-1||i===b.x+fw)!==(j===b.z-1||j===b.z+fd))touch=1}
 for(const o of list){const[ow,od]=GB_dims(o),oh=GB_PC[o.t].h;const ox=o.x<b.x+fw&&o.x+ow>b.x,oz=o.z<b.z+fd&&o.z+od>b.z,vy=o.y<y+h&&o.y+oh>y;
  if(ox&&oz){if(vy)return 0;if(o.y+oh===y||o.y===y+h)touch=1}else if(vy&&o.x<=b.x+fw&&o.x+ow>=b.x&&o.z<=b.z+fd&&o.z+od>=b.z&&((o.x+ow===b.x||o.x===b.x+fw)!==(o.z+od===b.z||o.z===b.z+fd)))touch=1}
 return touch}
function G8_step(dir){const b=GS.held;if(!b){GS_tip('Tap the car first to hold a part');return 0}const L=GB_list();
 for(let y=b.y+dir;y>=-12&&y<=60;y+=dir)if(G8_free(b,y,L)){const nb={...b,y};GS.held=nb;GB_ghostSet(nb);try{AU.sfx('pick')}catch(e){}GS_ui();GS_tip((dir>0?'▲ Up':'▼ Down')+' · '+(y-G8_top(b))+' plates from the top');return 1}
 try{AU.sfx('bump')}catch(e){}GS_tip(dir>0?'Can\'t go higher here':'Can\'t go lower here');return 0}
function G8_top(b){const y=GB_fit(b,GB_list());return y==null?b.y:y}
// a stepped part keeps its height when you rotate it (if it still fits there)
GS_reheld=(f=>function(){const y=GS.held&&GS.held.y;f();if(y!=null&&GS.held&&GS.held.y!==y&&G8_free(GS.held,y,GB_list())){GS.held={...GS.held,y};GB_ghostSet(GS.held)}})(GS_reheld);
// placing at a stepped height: the same as GB_add but at b.y (the mirror twin only when it fits too)
GS_place=(f=>function(){const b=GS.held;if(!b||b.bad||b.y===G8_top(b))return f();const L=GB_list();if(!G8_free(b,b.y,L)){try{AU.sfx('bump')}catch(e){}return 0}
 const nb={t:b.t,x:b.x,z:b.z,y:b.y,r:b.r%4,m:0,c:b.c},add=[nb];if(GB_.mir){const w=GB_twin(nb);if(w.x!==nb.x&&G8_free(w,w.y,L.concat([nb])))add.push(w)}
 if(L.length+add.length>GB_MAX){if(L.length+1>GB_MAX){GB_msg('Brick budget full · '+GB_MAX);try{AU.sfx('bump')}catch(e){}return 0}add.length=1}
 GB_snap();L.push(...add);GS.held=null;GS.hit=null;try{AU.sfx('brick')}catch(e){}GB_refresh();GS_pop(nb);GS_ui();return add.length})(GS_place);
// ---------- 4) REDO: every new edit (GB_snap) clears it; UNDO feeds it
GB_snap=(f=>function(){f.apply(this,arguments);G8.redo.length=0;G8_ui()})(GB_snap);
GB_undo=function(){if(!GB_.undo.length)return 0;if(GS.held)GS_drop();G8.redo.push(JSON.stringify(GB_list()));GB.d.bricks=JSON.parse(GB_.undo.pop());GB_refresh();try{AU.sfx('pick')}catch(e){}G8_ui();return 1};
function GB_redo(){if(!G8.redo.length)return 0;if(GS.held)GS_drop();GB_.undo.push(JSON.stringify(GB_list()));GB.d.bricks=JSON.parse(G8.redo.pop());GB_refresh();try{AU.sfx('pick')}catch(e){}G8_ui();return 1}
addEventListener('keydown',e=>{if(!GB_.bk||$('#gbx').hidden||!(e.ctrlKey||e.metaKey))return;if(e.code==='KeyY'||(e.code==='KeyZ'&&e.shiftKey)){e.preventDefault();e.stopImmediatePropagation();GB_redo();GB_ui()}},true);
// ---------- UI: REDO button right after UNDO; STEP ▲ / STEP ▼ in the held-part bar
function G8_ui(){const T=$('#gbBkT');if(T){let r=T.querySelector('[data-a="redo"]');const u=T.querySelector('[data-a="undo"]');
  if(!r&&u){r=document.createElement('button');r.dataset.a='redo';r.title='Redo (Ctrl+Y)';r.textContent='↷';r.addEventListener('click',()=>GB_redo());u.after(r)}
  if(u)u.disabled=!GB_.undo.length;if(r)r.disabled=!G8.redo.length}
 const B=$('#gsBar');if(B&&!B.querySelector('[data-g8]')){for(const[d,ic,tx]of[[1,'▲','STEP UP'],[-1,'▼','STEP DOWN']]){const x=document.createElement('button');x.dataset.g8=d;x.className='g8St';x.innerHTML=`<i>${ic}</i>${tx}`;
   x.addEventListener('click',e=>{e.stopPropagation();G8_step(d)});B.appendChild(x)}}}
GS_ui=(f=>function(){const r=f.apply(this,arguments);G8_ui();return r})(GS_ui);
GB_ui=(f=>function(){const r=f.apply(this,arguments);G8_ui();return r})(GB_ui);
{const st=document.createElement('style');st.textContent=`#gbBkT button:disabled{opacity:.4}
#gsBar{grid-template-columns:repeat(2,auto)}#gsBar .gsPl{grid-column:1/3;width:auto}#gsBar button{width:104px}#gsBar .g8St{font-size:12px;letter-spacing:0;gap:4px;padding:0 6px}
@media (max-width:760px),(max-height:500px){#gbx #gbBkT{gap:5px}#gbx #gbBkT button{padding:0 5px}#gsBar{gap:5px}#gsBar button{height:40px;width:106px;font-size:12px;gap:5px;padding:0 6px;white-space:nowrap}#gsBar button i{font-size:15px;width:16px}}`;document.head.appendChild(st)}
window.__g8={S:G8,T:G8.T,redo:()=>GB_redo(),undo:()=>GB_undo(),step:d=>G8_step(d),free:(b,y)=>G8_free(b,y,GB_list()),held:()=>GS.held&&{...GS.held},shower:()=>G8.nSh,showing:()=>!!G8.sh,nRedo:()=>G8.redo.length,band:()=>G8_band()};
