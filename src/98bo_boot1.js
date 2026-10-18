// boot-1 (2026-10-18): one-time work moved behind the loading screen, measured with tools/perf1/tBoot.js (touch 852x393, first 60 s after drivable).
// Frankfurt before: the first roam frame was 440 ms (PC scan + full pass 180, the whole-city minimap paint 122), the shortcut scan set-up 61 ms at 1 s.
// Here, inside ldPrewarm (the loader is still up): PC registration + grid (no packing yet), the minimap (Athens: the nearest street-map tiles), the DEST grid/sort + ~100 ms of its scan.
{const _lp=ldPrewarm;ldPrewarm=async function(...a){const T=(n,f)=>{try{f()}catch(e){console.warn('boot1 '+n,e)}};
  T('pc',()=>PC_prewarm());
  T('mini',()=>{if(!HUB.built)return;if(!MINI)MINI=miniBase();if(SM_ON&&MINI&&MINI.smm)SMM_tick(250)});
  T('cull',()=>{if(!HUB.built||!HUB.grp)return;if(!HUB.cull)hubCullInit();if(typeof LDS_scan==='function'&&LDS.st&&HUB.ptypes)LDS_scan(true)});/* boot-3: the cull list (every hub mesh's bounding sphere, Athens 130 ms) and the tree-LOD scan, built here, not in the first roam frame */
  T('dest',()=>{if(!DEST.on||!HUB.nodes)return;if(DEST.N!==HUB.nodes)DEST_reset();DEST_find(100)});
  return _lp.apply(this,a)}}
