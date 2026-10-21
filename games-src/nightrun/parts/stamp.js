// PURPOSE: build stamp and update check
// FLAG: stamp (?stamp=0)
// TEST: stamp-test.js
/* ---------- build stamp + update check (owner, 21 Oct 2026: "the game has not changed" = an old shell on the phone). Flag RET.stamp (off with ?stamp=0): off = no stamp, no button, no toast, no auto reload.
   NR_STAMP is filled by parts/build.py: short hash (the same one that names the service worker caches nr-shell-<hash>) + UTC build date.
   Title screen + Settings show it; Settings has CHECK FOR UPDATE; a new worker taking over reloads the page once, only on the title/game-over screen, never in a run.
   Saves and localStorage are never touched (the only key written is nrStampSeen, to say "Updated to ..." once). ---------- */
if(RET.stamp===undefined)RET.stamp=!/[?&]stamp=0/.test(location.search);
const NR_STAMP='__STAMP__';
RET.stampX=(function(){
  const X={stamp:NR_STAMP,hash:NR_STAMP.split(' ')[0],pending:false,reloaded:false};
  const sw='serviceWorker' in navigator&&location.protocol!=='file:'&&!SIM;
  const FLAGS=[['sprites','sprites'],['musicpack','music pack'],['lessons','lessons'],['classes','classes'],['foot','on-foot'],['footstage','street stage'],['fever','fever'],['flavor','flavour'],['leak','ground enemies'],['zoo','zoo'],['pwa','offline app']];
  X.flags=()=>FLAGS.map(([k,l])=>l+(RET[k]?' on':' off')).join(' / ');
  X.safe=()=>{const t=$('title'),o=$('over'),s=$('setm');return !!t&&!(s&&!s.hidden&&setFrom==='pause')&&(!t.hidden||!!(o&&!o.hidden)||!!(s&&!s.hidden));};
  X.toast=function(t){let e=$('stampToast');if(!e){e=document.createElement('div');e.id='stampToast';e.setAttribute('role','status');e.style.cssText='position:fixed;left:50%;bottom:14px;transform:translateX(-50%);max-width:92vw;background:#220;color:#ffd24a;border:1px solid #ffd24a;border-radius:8px;padding:8px 12px;font:700 14px sans-serif;z-index:99999;pointer-events:none';document.body.appendChild(e);}
    e.textContent=t;e.hidden=false;clearTimeout(X.tt);X.tt=setTimeout(()=>{e.hidden=true;},5000);};
  X.reload=function(){if(X.reloaded)return;X.reloaded=true;location.reload();};
  X.tryReload=function(){if(!X.pending||X.reloaded)return;if(X.safe())X.reload();else setTimeout(X.tryReload,1000);};
  X.stampText=()=>'build '+X.stamp.replace(' ',' · ');
  X.paint=function(){const t=$('stampT');if(t)t.textContent=X.stampText();const s=$('stampS');if(s)s.textContent=X.stampText();const f=$('stampF');if(f)f.textContent=X.flags();};
  X.liveStamp=async function(){const r=await fetch('index.html?_='+Date.now(),{cache:'no-store'});if(!r.ok)throw new Error('http '+r.status);const m=/const NR_STAMP\s*=\s*'([^']+)'/.exec(await r.text());return m?m[1]:null;};
  X.clearCaches=async function(){try{for(const n of await caches.keys())if(n.startsWith('nr-'))await caches.delete(n);}catch(e){}};
  X.check=async function(){const st=$('stampSt'),btn=$('stampBtn');if(!st)return;
    if(!X.safe()||setFrom==='pause'){st.textContent='Open Settings from the title screen to check.';return;}
    btn.disabled=true;st.textContent='Checking...';
    try{
      if(sw){const reg=await navigator.serviceWorker.getRegistration();if(reg)await reg.update().catch(()=>{});}
      const live=await X.liveStamp();
      if(live&&live.split(' ')[0]!==X.hash){st.textContent='New version found, reloading';X.pending=true;await X.clearCaches();setTimeout(X.reload,600);return;}
      st.textContent=live?'Up to date':'Could not read the live version';
    }catch(e){st.textContent='Could not check (offline?)';}
    btn.disabled=false;};
  X.build=function(){const body=$('setBody');if(!RET.stamp||!body||$('stampRow'))return;
    const row=document.createElement('div');row.id='stampRow';
    row.innerHTML='<h3>BUILD</h3><div id="stampS"></div><div id="stampF"></div><button type="button" class="go dim" id="stampBtn">CHECK FOR UPDATE</button><div id="stampSt" role="status"></div>';
    body.appendChild(row);$('stampBtn').addEventListener('click',e=>{e.stopPropagation();X.check();});X.paint();};
  if(!RET.stamp)return X;
  if(!document.getElementById('stampCss')){const st=document.createElement('style');st.id='stampCss';st.textContent='#stampT{margin:8px 0 0;font:14px var(--mono);color:var(--dim);text-align:center;opacity:.8}#stampRow{display:flex;flex-direction:column;align-items:center;gap:6px;margin:6px 0;text-align:center;font:14px var(--mono);color:var(--dim)}#stampRow h3{align-self:stretch;text-align:left}#stampBtn{min-height:44px}#stampSt:empty{display:none}';document.head.appendChild(st);}
  X.paint();
  try{const seen=localStorage.getItem('nrStampSeen');if(seen&&seen!==X.hash&&!SIM)setTimeout(()=>X.toast('Updated to '+X.hash),800);localStorage.setItem('nrStampSeen',X.hash);}catch(e){}
  if(sw){const had=!!navigator.serviceWorker.controller;
    navigator.serviceWorker.addEventListener('controllerchange',()=>{if(!had)return;X.pending=true;X.tryReload();});}
  return X;})();
