// boot-1 (2026-10-18): one-time work moved behind the loading screen, measured with tools/perf1/tBoot.js (touch 852x393, first 60 s after drivable).
// Frankfurt before: the first roam frame was 440 ms (PC scan + full pass 180, the whole-city minimap paint 122), the shortcut scan set-up 61 ms at 1 s.
// Here, inside ldPrewarm (the loader is still up): PC registration + grid (no packing yet), the minimap (Athens: the nearest street-map tiles), the DEST grid/sort + ~100 ms of its scan.
{const _lp=ldPrewarm;ldPrewarm=async function(...a){const T=(n,f)=>{try{f()}catch(e){console.warn('boot1 '+n,e)}};
  T('pc',()=>PC_prewarm());
  T('mini',()=>{if(!HUB.built)return;if(!MINI)MINI=miniBase();if(SM_ON&&MINI&&MINI.smm)SMM_tick(250)});
  T('cull',()=>{if(!HUB.built||!HUB.grp)return;if(!HUB.cull)hubCullInit();if(typeof LDS_scan==='function'&&LDS.st&&HUB.ptypes)LDS_scan(true)});/* boot-3: the cull list (every hub mesh's bounding sphere, Athens 130 ms) and the tree-LOD scan, built here, not in the first roam frame */
  T('dest',()=>{if(!DEST.on||!HUB.nodes)return;if(DEST.N!==HUB.nodes)DEST_reset();DEST_find(100)});
  return _lp.apply(this,a)}}
// perf-r11c: Athens' first frames after the curtain were roamCam's first call (96 ms at f3: spring state, roamHit/groundAt grids) and the first hubTrafficStep
// (77 ms at f25: first miniDraw / pedStep / cull / car pose). Run each once inside roamLoad, after roamPost placed the car and before ldHide lifts the curtain.
// camSnap is kept, so the first real frame still snaps the camera. ?bootpre=0 off.
function BOOT1_pre(){if(state!=='roam'||/[?&]bootpre=0/.test(location.search))return;const T=(n,f)=>{try{f()}catch(e){console.warn('boot1 '+n,e)}};
  T('cam',()=>{const sn=camSnap;roamCam(1/60);camSnap=sn});T('w13',()=>{if(typeof W13L==='undefined'||!W13L.g)return;const a0=W13L.a;W13L.a=.3;W13_lines(1/60);W13L.a=a0;W13_lines(1/60)});/* perf-r17j: first stroked frame of the speed-line canvas under the curtain */T('traffic',()=>hubTrafficStep(1/60))}
{const _rp=roamPost;roamPost=function(...a){const r=_rp.apply(this,a);if(LD.busy)BOOT1_pre();return r}}
