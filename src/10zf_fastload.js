// ---- FC: persistent chunk cache (fastload-r24g, 2026-10-24). Lesson from fiveplay.lol: build-id keyed local store + read-ahead = a near-instant second load.
// EVERY lazily fetched file goes through FST_get/FST_js/FST_json: xc/*.js, models/<id>.js, models/{as,lx,xf,qa}.js, tune.json, music/*.mp3 (km.js + models.js are sync <script> tags in the
// page head and stay on the HTTP cache). The store is the Cache API (cache name 'odfc-<FSTV>'), else IndexedDB ('odfc'), else nothing: then every call is the plain network, silently.
// FSTV = build version + content hash (tools/build.sh); a raw src/ page has FSTV '' and FC is off. Old versions are deleted at idle. ?fc=0 off, ?fc=1 on (FST_DEF = the default).
// Every storage call is in try/catch (artifact sandbox / private mode throw). Read-ahead (src/98zq_fastload_ahead.js, a lazy chunk): once roam is idle, the equipped garage car + the next 3 and the menu/city music are
// fetched into the store one file per requestIdleCallback. Test hooks: window.__fc.
if(!FST.on)FST_cfg(OD_PREVIEW);   // preview builds: default-OFF -> ON
// ---- read-ahead: chunks of the equipped garage car + the next 3 owned cars (LD_probe with LD_load stubbed: ask which chunks a set needs WITHOUT loading them), then the music
function FST_carChunks(S){
 const ids=new Set(),l0=LD_load;LD_load=id=>{ids.add(id);return Promise.resolve()};
 try{LD_probe(()=>[].concat(GAR_arr(S.car())))}catch(e){}finally{LD_load=l0}
 try{const b=GAR_get().br[S.id];if(b)for(const id of LD_brMiss(b))ids.add(id)}catch(e){}
 return[...ids]}
// old versions out of the store (idle, off the boot path)
function FST_clean(){if(!FST_use())return;setTimeout(()=>{Promise.resolve().then(()=>FST_BE[FST.be].clean()).catch(FST_err)},3000)}
FST_clean();
window.__fc={FST,cfg:FST_cfg,get:FST_get,js:FST_js,prefetch:FST_prefetch,flush:FST_flush,use:FST_use,be:FST_BE};
