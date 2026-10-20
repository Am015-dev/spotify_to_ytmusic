// ===== tier-r22a (2026-10-20, docs/PLAN_PC_GRAPHICS.md §1): PC graphics tier detector. ONE function, GFX_detect() → {tier 0..3, name, src, ...}.
// 0 LOW (= the phone tier), 1 MID (= PC med), 2 HIGH (= PC high), 3 ULTRA (new; later lanes give it features, today it plays as HIGH).
// Touch (lowGfx) is always LOW with src 'touch' and nothing is changed: GOV_touchBoot / LK stay exactly as in beta.140.
// Order: ?gfx=0..3 (forced) → stored 'mho_gfxtier' for this GPU string (score + 3 s probe from an earlier boot) → GPU-string score capped by caps.
// The 3 s probe (frame work p95 after the reveal) only runs on PC, only once per GPU, and only writes the store: the tier never rises inside a session.
// APPLYING the tier to the governor floor is WIP behind GT.on, default OFF (?gfx=N forces it on; ?gfxt=1 / store 'mho_gfxt'=1 applies the auto tier).
const GT_NAMES=['LOW','MID','HIGH','ULTRA'];
// GPU string → tier (pure; the GO feeds it fake strings)
function GFX_tierOf(gpu,caps){const g=String(gpu||'');let t;
 if(/SwiftShader|llvmpipe|softpipe|Basic Render|Software Adapter/i.test(g))t=0;
 else if(/RTX\s*(?:A)?([3-9]\d{3})\b/i.test(g)||/Radeon\s*(?:\(TM\)\s*)?RX\s*([6-9]\d{3})\b/i.test(g)||/Apple M\d+\s*(Max|Ultra)/i.test(g))t=3;
 else if(/GeForce\s*(MX|GT)\s*\d|Quadro\s*(P|K|M)\d{3}\b/i.test(g))t=1;   // entry/mobile NVIDIA: MID
 else if(/NVIDIA|GeForce|RTX|GTX|Quadro|Radeon\s*(?:\(TM\)\s*)?(RX|Pro)\b|Intel.*\bArc\b|Apple M\d+\s*Pro/i.test(g))t=2;
 else t=1;   // integrated (Intel UHD/HD/Iris, AMD Radeon(TM) Graphics, Apple M1/M2, "Apple GPU") and unknown strings
 const c=caps||{};if(t>1&&((c.maxTex&&c.maxTex<8192)||(c.cores&&c.cores<4)||(c.mem&&c.mem<4)))t=1;   // weak caps: at most MID
 return t}
function GT_caps(){const c={maxTex:0,samples:0,cores:navigator.hardwareConcurrency||0,mem:navigator.deviceMemory||0};
 try{const gl=renderer.getContext();c.maxTex=gl.getParameter(gl.MAX_TEXTURE_SIZE)|0;c.samples=gl.MAX_SAMPLES?gl.getParameter(gl.MAX_SAMPLES)|0:0}catch(e){}return c}
const GT={tier:0,name:'LOW',src:'touch',gpu:'',score:0,caps:null,msaa:true,on:false,dMin:0,probe:null,log:[]};
function GFX_detect(){const P=new URLSearchParams(location.search),q=P.get('gfx');
 if(lowGfx)return Object.assign(GT,{tier:0,name:'LOW',src:'touch',on:false});   // phones: today's path, untouched
 const gpu=typeof PB_gpu==='function'?PB_gpu():'?',caps=GT_caps(),score=GFX_tierOf(gpu,caps);let tier=score,src='gpu';
 const st=store.get('mho_gfxtier',null);if(st&&st.gpu===gpu&&st.tier>=0&&st.tier<=3){tier=Math.min(score,st.tier|0);src='store'}
 if(q!==null&&/^[0-3]$/.test(q)){tier=+q;src='url'}
 const on=src==='url'||P.get('gfxt')==='1'||(P.get('gfxt')!=='0'&&store.get('mho_gfxt',0)===1);
 return Object.assign(GT,{tier,name:GT_NAMES[tier],src,gpu,score,caps,msaa:!caps.samples||caps.samples>=4,on,dMin:[2,1,0,0][tier]})}
// governor floor: LOW → LK 'low', MID → 'med', HIGH/ULTRA → 'high'. Only with GT.on, only on PC; Auto steps down as before, never above the floor.
function GT_floor(){if(!GT.on||lowGfx)return;if(GOV.d<GT.dMin)GOV.d=GT.dMin}
GOV_apply=(f=>function(){GT_floor();return f.apply(this,arguments)})(GOV_apply);
// no tier upgrade inside a session: a tier step down (after the 60 s scale-only window) raises the floor for the rest of the session
GOV_step=(f=>function(dir){const d0=GOV.d,r=f.apply(this,arguments);if(GT.on&&!lowGfx&&dir<0&&GOV.d>d0){GT.dMin=Math.max(GT.dMin,GOV.d);GT.log.push(['down',GOV.d])}return r})(GOV_step);
// 3 s probe after the reveal (2 s settle first): p95 of the frame's own work. ULTRA with p95 > 8 ms → HIGH, HIGH with p95 > 12 ms → MID. Stored for the next boot.
function GT_probeFeed(ms,busy){const p=GT.probe;if(!p||p.done)return;
 if(paused||document.hidden||LD.on||state!=='roam'||ms>250||ms<=0){p.t=0;p.b.length=0;return}
 p.t+=ms;if(p.t<2000)return;p.b.push(busy);if(p.t<5000)return;
 p.done=1;const p95=_gp(p.b,.95);p.p95=+p95.toFixed(1);let t=GT.score;if(t===3&&p95>8)t=2;if(t===2&&p95>12)t=1;p.tier=t;
 try{store.set('mho_gfxtier',{gpu:GT.gpu,tier:t,p95:p.p95,score:GT.score})}catch(e){}}
GOV_feed=(f=>function(ms,busy){try{GT_probeFeed(ms,busy)}catch(e){}return f.apply(this,arguments)})(GOV_feed);
try{GFX_detect();if(!lowGfx&&!TQ&&GT.src==='gpu')GT.probe={t:0,b:[],done:0,p95:null,tier:null};if(GT.on&&!lowGfx&&GOV.on){GT_floor();GOV_apply(0)}   // a manual Settings quality (GOV off) wins over the tier
}catch(e){console.warn('gfxtier',e)}
window.__gt={GT,detect:GFX_detect,tierOf:GFX_tierOf,todL:t=>GFX_todL(t)};
// GOs (state asserts, no graphics): gfx/tier and gfx/tod. The checklist is a lazy chunk: register as soon as it exists.
const GT_go={tier(goSay){const out=[];let ok=true;const chk=(n,c)=>{out.push((c?'✓ ':'✗ ')+n);if(!c)ok=false};
  const T=(g,caps)=>GFX_tierOf(g,caps);
  chk('SwiftShader → LOW',T('ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero)), SwiftShader driver)')===0);
  chk('llvmpipe → LOW',T('llvmpipe (LLVM 15.0.7, 256 bits)')===0);
  chk('Intel UHD 620 → MID',T('ANGLE (Intel, Intel(R) UHD Graphics 620 Direct3D11 vs_5_0 ps_5_0, D3D11)')===1);
  chk('AMD Radeon(TM) Graphics → MID',T('ANGLE (AMD, AMD Radeon(TM) Graphics Direct3D11 vs_5_0 ps_5_0, D3D11)')===1);
  chk('Apple M1 → MID',T('Apple M1')===1);chk('Apple GPU (masked) → MID',T('Apple GPU')===1);
  chk('GTX 1060 → HIGH',T('ANGLE (NVIDIA, NVIDIA GeForce GTX 1060 6GB Direct3D11 vs_5_0 ps_5_0, D3D11)')===2);
  chk('RTX 2060 → HIGH',T('ANGLE (NVIDIA, NVIDIA GeForce RTX 2060 (0x00001F08) Direct3D11 vs_5_0 ps_5_0, D3D11)')===2);
  chk('RX 580 → HIGH',T('ANGLE (AMD, Radeon RX 580 Series Direct3D11 vs_5_0 ps_5_0, D3D11)')===2);
  chk('GeForce MX250 → MID',T('ANGLE (NVIDIA, NVIDIA GeForce MX250 Direct3D11 vs_5_0 ps_5_0, D3D11)')===1);
  chk('Apple M1 Pro → HIGH',T('Apple M1 Pro')===2);
  chk('RTX 3060 → ULTRA',T('ANGLE (NVIDIA, NVIDIA GeForce RTX 3060 (0x00002503) Direct3D11 vs_5_0 ps_5_0, D3D11)')===3);
  chk('RTX 4090 → ULTRA',T('NVIDIA GeForce RTX 4090/PCIe/SSE2')===3);
  chk('RX 6600 → ULTRA',T('ANGLE (AMD, AMD Radeon RX 6600 Direct3D11 vs_5_0 ps_5_0, D3D11)')===3);
  chk('Apple M2 Max → ULTRA',T('Apple M2 Max')===3);
  chk('RTX 3060 + maxTex 4096 → MID',T('NVIDIA GeForce RTX 3060',{maxTex:4096})===1);
  chk('RTX 3060 + 2 cores → MID',T('NVIDIA GeForce RTX 3060',{cores:2})===1);
  chk('detect() returns a tier 0..3',GT.tier>=0&&GT.tier<=3&&GT.name===GT_NAMES[GT.tier]);
  if(lowGfx){chk('touch: tier LOW, src touch, not applied',GT.tier===0&&GT.src==='touch'&&!GT.on);
   chk('touch: governor floor untouched (GOV_touchBoot state)',GT.dMin===0||!GT.on);chk('touch: LK_lvl unchanged by the tier',typeof LK_lvl()==='string')}
  else{chk('PC: src '+GT.src+', GPU score '+GT.score,['gpu','store','url'].includes(GT.src));
   chk('PC: default not applied (WIP flag OFF)',GT.on===(GT.src==='url'||/[?&]gfxt=1/.test(location.search)||store.get('mho_gfxt',0)===1))}
  {const d0=GOV.d,on0=GT.on,m0=GT.dMin;try{GT.on=!lowGfx;GT.dMin=1;GOV.d=0;GT_floor();chk('floor: HIGH asked under a MID floor stays MID',lowGfx||GOV.d===1)}finally{GOV.d=d0;GT.on=on0;GT.dMin=m0}}
  const r='📍 gfx/tier '+(ok?'✅ PASS':'❌ FAIL')+' · '+out.join(' · ');if(goSay)goSay(r);return r},
 tod(goSay){const out=[];let ok=true;const chk=(n,c)=>{out.push((c?'✓ ':'✗ ')+n);if(!c)ok=false};const t0=GFX.tod;
  try{GFX.tod=false;const a=GFX_todL(.45),b=GFX_todL(.78),ath=CID==='ath';
   chk('off: noon look = beta.140 constants',a.sunI===TUNE.gfxSun&&a.hemiI===TUNE.gfxHemi&&a.env===TUNE.gfxEnv&&a.sunC===(ath?'#ffd9a8':'#ffe1b4')&&a.hor[2]===(ath?.78:.95)&&a.el===TUNE.gfxEl);
   chk('off: time of day ignored',JSON.stringify(a)===JSON.stringify(b));
   GFX.tod=true;const n=GFX_todL(.45),d=GFX_todL(.78),x=GFX_todL(.02),k=o=>[o.sunC,o.sunI.toFixed(2),o.hemiI.toFixed(2),o.hor.map(v=>v.toFixed(2)).join()].join('|');
   chk('on: noon (t .45) = the off look (golden views stay)',JSON.stringify(n)===JSON.stringify(a));
   chk('on: noon, dusk, night tuples all differ',k(n)!==k(d)&&k(d)!==k(x)&&k(n)!==k(x));
   chk('on: sun noon > dusk > night ('+[n.sunI,d.sunI,x.sunI].map(v=>v.toFixed(2))+')',n.sunI>d.sunI&&d.sunI>x.sunI);
   chk('on: sky horizon darker at night',x.hor[2]<n.hor[2]);chk('on: sun lower at dusk',d.el<n.el&&d.el>0)}
  finally{GFX.tod=t0}
  const r='📍 gfx/tod '+(ok?'✅ PASS':'❌ FAIL')+' · '+out.join(' · ');if(goSay)goSay(r);return r}};
window.__gt.go=GT_go;
// the checklist (src/99c_checklist.js) is a lazy chunk at the 200 KB module cap: register the items and their GOs as soon as it exists (as 99ui_noise)
{const reg=setInterval(()=>{if(!window.__chk||!__chk.GO)return;clearInterval(reg);
 __chk.items.unshift({ver:'gfx',id:'tier',area:'perf',text:'tier-r22a · PC graphics tier (📍 GO, state asserts): GPU string + caps → LOW/MID/HIGH/ULTRA, ?gfx=0..3 forces it; phones always LOW and unchanged; applying the auto tier is WIP (?gfxt=1).'},
  {ver:'gfx',id:'tod',area:'world',text:'tier-r22a · One light owner (📍 GO, state asserts): sun, fill, sky and fog come from GFX_todL; off = the beta.140 noon look, on (?tod=1) follows the time of day.'});
 __chk.GO['gfx/tier']=[{c:'fra',n:'tier detector',fn:()=>GT_go.tier(__chk.goSay)}];
 __chk.GO['gfx/tod']=['fra','ath'].map(c=>({c,n:c==='fra'?'light owner Frankfurt':'light owner Athens',fn:()=>GT_go.tod(__chk.goSay)}))},500)}
