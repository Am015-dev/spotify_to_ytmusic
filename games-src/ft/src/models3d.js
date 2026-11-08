// ===================== the 10 owner 3D models (games/sands-of-qamar/models/*.glb) =====================
// *-lite.glb (meeple, camel, palace, palm, lamp): rendered once to sprites for the board tokens; the full *.glb files: turntables on the title, the result card and the Card list drawer.
// Without WebGL or a file the @512 sprites stay (html.sp3). Needs three.min.js + gx-glb.js (build.py).
const M3={ok:false,r:null,scene:null,cam:null,shows:[],raf:0,spr:{}};
function m3Init(){if(M3.r)return M3.ok;try{if(typeof THREE==='undefined'||typeof GXGLB==='undefined')return false;const T=THREE;M3.r=new T.WebGLRenderer({alpha:true,antialias:true,preserveDrawingBuffer:true});M3.r.setClearColor(0,0);M3.scene=new T.Scene();
  M3.scene.add(new T.HemisphereLight(0xfff2d8,0x6a4a2a,1.15));const d=new T.DirectionalLight(0xffffff,1.7);d.position.set(2,4,3);M3.scene.add(d);M3.cam=new T.PerspectiveCamera(30,1,.1,50);M3.cam.position.set(0,.9,5.2);M3.cam.lookAt(0,0,0);M3.ok=true}catch(e){console.warn('3d off',e);M3.ok=false}return M3.ok}
function m3Frame(name,full,yaw,px){const src=M3['src_'+name+(full?'':'L')];if(!src)return null;const T=THREE,g=GXGLB.prep(src,{h:2.2,yaw:yaw||0,env:.9});M3.scene.add(g);M3.r.setSize(px,px,false);M3.r.render(M3.scene,M3.cam);M3.scene.remove(g);return M3.r.domElement}
async function m3Load(){if(!m3Init())return;const names=['meeple','camel','palace','palm','lamp'];
  await Promise.all(names.map(n=>GXGLB.load('models/'+n+'-lite.glb').then(s=>{M3['src_'+n+'L']=s}).catch(()=>{})));
  names.forEach(n=>{if(!M3['src_'+n+'L'])return;const c=m3Frame(n,false,.5,256);if(c)document.documentElement.style.setProperty('--g3-'+n,'url('+c.toDataURL('image/png')+')')});
  if(names.every(n=>M3['src_'+n+'L']))document.documentElement.classList.add('g3d');
  names.forEach(n=>GXGLB.load('models/'+n+'.glb').then(s=>{M3['src_'+n]=s}).catch(()=>{}))}   // the full models, for the turntables
// a turntable in a container: <canvas> copy of the shared renderer, 30 fps, only while in the page
function m3Show(el,name,px){if(!el||!m3Init())return;if(el.querySelector('canvas.t3d'))return;const c=document.createElement('canvas');c.className='t3d';c.width=c.height=px;c.setAttribute('aria-hidden','true');c.setAttribute('data-help','');el.appendChild(c);M3.shows.push({c,name,t:Math.random()*6});if(!M3.raf)M3.raf=requestAnimationFrame(m3Loop)}
let _m3t=0;function m3Loop(ts){M3.raf=0;M3.shows=M3.shows.filter(s=>document.body.contains(s.c));if(!M3.shows.length)return;if(ts-_m3t>33){_m3t=ts;for(const s of M3.shows){const r=s.c.getBoundingClientRect();if(!r.width||r.bottom<0||r.top>innerHeight)continue;s.t+=.035;const f=m3Frame(s.name,!!M3['src_'+s.name],s.t,s.c.width);if(f){const x=s.c.getContext('2d');x.clearRect(0,0,s.c.width,s.c.height);x.drawImage(f,0,0,s.c.width,s.c.height)}}}M3.raf=requestAnimationFrame(m3Loop)}
function m3Gallery(el){if(!el)return;['meeple','palm','palace','camel','lamp'].forEach(n=>{const f=document.createElement('figure');el.appendChild(f);m3Show(f,n,96);f.insertAdjacentHTML('beforeend','<figcaption>'+n+'</figcaption>')})}
// title and result card
(function(){const o=renderModal;renderModal=function(){o.apply(this,arguments);try{const m=document.getElementById('modal');if(!m||m.hidden)return;
  if(UI.modal==='start'){const b=m.querySelector('.mbox.start');if(b&&!b.querySelector('.hero3d')){const h=document.createElement('div');h.className='hero3d';h.setAttribute('data-help','');b.insertBefore(h,b.firstChild);m3Show(h,'lamp',160)}}
  if(UI.modal==='over'&&G&&G.over){const b=m.querySelector('.mbox.over');if(b&&!b.querySelector('.hero3d')){const won=viewP()&&G.over.win.includes(viewP().i);const h=document.createElement('div');h.className='hero3d';h.setAttribute('data-help','');b.insertBefore(h,b.firstChild);m3Show(h,won?'palace':'camel',160)}}}catch(e){console.error(e)}}})();
if(document.readyState==='complete')setTimeout(m3Load,600);else addEventListener('load',()=>setTimeout(m3Load,600));
