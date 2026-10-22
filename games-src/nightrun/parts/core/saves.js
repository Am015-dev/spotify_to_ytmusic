// PURPOSE: explicit, safe saving and save slots
// FLAG: saves (?saves=0)
// TEST: saves-test.js
/* ---------- explicit, safe saving (owner request: "User must be able to save progress."). Flag RET.saves, ?saves=0 = the old behaviour (no wrappers, no listeners, no UI).
   What existed before: every game key is written to localStorage the moment it changes (save() in a.js), a Settings > Save group exports / imports a versioned base64+checksum code or a file (ret.js, B24: RET.sio) with one undo backup, and a storage-blocked toast.
   Added here:
   - the save list is generic: every localStorage key that starts with mnr_ / nr- / nr. (except this part's own and the sio backup keys) is saved, slotted, exported and imported, so parts that add data later need no registration;
   - autosave: save() calls (purchase, loadout, stage result, forge ...) and the events stageClear / runEnd / banked / forge / forgePreset / districtEnd schedule a flush; pagehide / visibilitychange flush at once. A flush never re-writes in-memory state (a second tab or an import may have written newer data); it snapshots what is stored, verifies the write, rotates the backup key (mnr_svauto0 <- mnr_svauto) and stamps the time (mnr_svinfo.t);
   - 3 manual slots mnr_sv1..3 {name,t,stage,neon,keys} in Settings > Save / Load (the old copy of a slot rotates to mnr_svbk<N> before it is overwritten); load / delete / overwrite ask first; "Saved" toast outside runs;
   - a failed write (private mode, quota, blocked) shows a warning with the way out (COPY CODE) instead of failing silently;
   - daily / weekly runs only ever write their own keys (mnr_daily, mnr_streak); slots and the auto backup are never touched by a run.
   Nothing is sent anywhere. Test: saves-test.js. ---------- */
if(RET.saves===undefined)RET.saves=!/[?&]saves=0/.test(location.search);
RET.SV=(()=>{
  const L=window.localStorage,IN=/^(mnr_|nr[-.])[A-Za-z0-9_.-]{1,48}$/,OUT=/^(mnr_(bak|bakinfo|probe|svinfo|svauto0?|sv[1-3]|svbk[1-3]|svpre))$/,BAD=/^(__proto__|constructor|prototype)$/;
  const KNOWN=new Set(['mnr_forge','mnr_hintseen','mnr_fs','mnr_fscard','mnr_achint','mnr_mmhint','mnr_bpcodex','mnr_pw3','nr-novelty','nr.zoo.seen']);   // keys the game itself reads or writes; anything else in an imported code is refused
  const S={fail:false,msg:'',freeze:false,n:0,flushes:0,pending:0,inFlush:false,slots:3};
  const get=k=>{try{return L.getItem(k);}catch(e){return null;}};
  const put=(k,v)=>{try{L.setItem(k,v);return true;}catch(e){return false;}};
  const del=k=>{try{L.removeItem(k);}catch(e){}};
  const okKey=k=>typeof k==='string'&&IN.test(k)&&!OUT.test(k)&&!BAD.test(k);
  const known=k=>okKey(k)&&(KNOWN.has(k)||(RET.sioKeys&&RET.sioKeys.indexOf(k)>=0));
  try{const P=Storage.prototype,g=P.getItem,st=P.setItem;P.getItem=function(k){if(this===L&&okKey(k))KNOWN.add(k);return g.apply(this,arguments);};P.setItem=function(k){if(this===L&&okKey(k))KNOWN.add(k);return st.apply(this,arguments);};}catch(e){}
  const keys=()=>{const a=[];try{for(let i=0;i<L.length;i++){const k=L.key(i);if(okKey(k))a.push(k);}}catch(e){}return a.sort();};
  const snap=()=>{const m={};for(const k of keys()){const v=get(k);if(v!=null)m[k]=v;}return m;};
  const jget=(k,d)=>{try{const v=JSON.parse(get(k)||'null');return v&&typeof v==='object'?v:d;}catch(e){return d;}};
  function sync(){if(!RET.sioKeys)return;for(const k of keys())if(RET.sioKeys.indexOf(k)<0)RET.sioKeys.push(k);}   // the export / import / undo of ret.js see every key
  function stageOf(m){try{const o=JSON.parse(m.mnr_story||'{}'),st=o&&o.stars||{};let hi=0;for(const k in st)if(st[k]>0)hi=Math.max(hi,+k||0);return Math.min(40,hi+1);}catch(e){return 1;}}
  function neonOf(m){try{return Math.max(0,Math.floor(+JSON.parse(m.mnr_bank||'0'))||0);}catch(e){return 0;}}
  const info=()=>jget('mnr_svinfo',{});
  const setInfo=p=>put('mnr_svinfo',JSON.stringify(Object.assign(info(),p)));
  const when=t=>t?new Date(t).toLocaleString():'never';
  const slotKey=i=>'mnr_sv'+i;
  function slot(i){const o=jget(slotKey(i),null);return o&&o.keys&&typeof o.keys==='object'?o:null;}
  /* ---- warnings and toast ---- */
  let toastT=0;
  function toast(t,bad){let e=document.getElementById('svToast');if(!e){e=document.createElement('div');e.id='svToast';e.setAttribute('role','status');document.body.appendChild(e);
      e.style.cssText='position:fixed;left:50%;bottom:14px;transform:translateX(-50%);max-width:92vw;border-radius:8px;padding:8px 12px;font:700 12px sans-serif;z-index:99998;pointer-events:none';}
    e.style.background=bad?'#2a0a0a':'#06201a';e.style.color=bad?'#ff9a8a':'#7dffcf';e.style.border='1px solid '+(bad?'#ff6a6a':'#3ce0a0');
    e.textContent=t;e.hidden=false;clearTimeout(toastT);toastT=setTimeout(()=>{e.hidden=true;},bad?7000:1400);}
  function fail(why){S.fail=true;S.msg='Cannot save: the browser blocked or filled its storage. Your progress is only kept until this page closes. Copy a save code in Settings > Save and keep it.';
    if(!S.warned){S.warned=true;toast(S.msg,true);}ui();}
  const live=()=>{try{return !!(G&&G.live&&!G.dead);}catch(e){return false;}};
  /* ---- autosave ---- */
  let tm=0;
  function flush(now){clearTimeout(tm);tm=0;if(S.freeze||S.inFlush||!RET.saves)return false;S.inFlush=true;let good=true;
    try{const m=snap(),txt=JSON.stringify({t:Date.now(),keys:m}),prev=get('mnr_svauto');
      if(prev!=null)put('mnr_svauto0',prev);
      good=put('mnr_svauto',txt)&&get('mnr_svauto')===txt;
      if(good){setInfo({t:Date.now()});S.flushes++;if(S.fail){S.fail=false;S.msg='';}}else{del('mnr_svauto');if(prev!=null)put('mnr_svauto',prev);fail();}
    }catch(e){good=false;fail();}
    S.inFlush=false;ui();if(good&&now!==true&&!live()&&S.toastOk)toast('Saved');return good;}
  function soon(){if(S.freeze||!RET.saves)return;S.pending++;if(!tm)tm=setTimeout(()=>{tm=0;flush();},1500);}
  /* ---- slots ---- */
  function saveSlot(i,name){if(i<1||i>S.slots)return false;sync();flush(true);const m=snap(),old=get(slotKey(i)),
      o={name:String(name||('Slot '+i)).replace(/[^\w .\-]/g,'').slice(0,16)||('Slot '+i),t:Date.now(),stage:stageOf(m),neon:neonOf(m),keys:m};
    if(old!=null)put('mnr_svbk'+i,old);
    const ok=put(slotKey(i),JSON.stringify(o))&&get(slotKey(i))!=null;
    if(!ok){if(old!=null)put(slotKey(i),old);fail();return false;}
    toast('Saved: '+o.name);ui();return true;}
  function loadSlot(i,reload){const o=slot(i);if(!o)return false;
    const names=Object.keys(o.keys);if(!names.length||names.some(k=>!okKey(k)||typeof o.keys[k]!=='string'||o.keys[k].length>262144))return false;
    for(const k of names){try{JSON.parse(o.keys[k]);}catch(e){if(!/^(mnr_(fs|fscard)|nr-)/.test(k)&&o.keys[k]!=='1'&&o.keys[k]!=='0')return false;}}   // plain flags are not JSON
    const pre=JSON.stringify({t:Date.now(),keys:snap()});if(!put('mnr_svpre',pre)){fail();return false;}   // undo copy of what is replaced
    S.freeze=true;for(const k of keys())del(k);for(const k of names)put(k,o.keys[k]);
    setInfo({load:Date.now()});toast('Loaded: '+o.name);if(reload!==false)setTimeout(()=>location.reload(),RET.sioNoReload?1e9:500);return true;}
  function delSlot(i){const old=get(slotKey(i));if(old==null)return false;put('mnr_svbk'+i,old);del(slotKey(i));ui();toast('Slot '+i+' deleted');return true;}
  /* ---- UI (Settings > Save / Load) ---- */
  const $$=id=>document.getElementById(id);let box=null,ask=null;
  const css='#svBox{display:flex;flex-direction:column;gap:8px;margin-top:2px}#svBox .svSlot{display:flex;flex-direction:column;gap:6px;padding:8px;border:1px solid rgba(76,234,255,.3);border-radius:8px;background:rgba(8,20,32,.55)}#svBox .svRow{display:flex;gap:8px;flex-wrap:wrap;align-items:center}#svBox button{all:unset;box-sizing:border-box;cursor:pointer;font:italic 800 12px var(--display,sans-serif);letter-spacing:.08em;text-transform:uppercase;padding:0 12px;min-height:44px;min-width:44px;display:inline-flex;align-items:center;justify-content:center;border-radius:8px;border:1px solid rgba(76,234,255,.45);background:rgba(8,20,32,.7);color:#e6f6ff}#svBox button.hot{background:linear-gradient(90deg,#ff6a6a,#ff9a3c);border-color:transparent;color:#1a0a00}#svBox input{box-sizing:border-box;min-height:44px;max-width:100%;width:9.5em;font:700 14px sans-serif;padding:0 8px;border-radius:8px;border:1px solid rgba(76,234,255,.45);background:#06101a;color:#e6f6ff}#svBox .svNote{font:12px/1.4 sans-serif;color:#b8d4e6}#svBox .svNote.err{color:#ff9a8a;font-weight:700}';
  function slotHtml(i){const o=slot(i);return '<div class="svSlot" data-i="'+i+'"><div class="svRow"><input type="text" maxlength="16" aria-label="Slot '+i+' name" value="'+(o?o.name.replace(/"/g,''):'Slot '+i)+'"></div>'
    +'<div class="svNote">'+(o?'Stage '+o.stage+' · '+o.neon+' Neon · '+when(o.t):'Empty')+'</div>'
    +'<div class="svRow"><button type="button" data-a="save">SAVE</button><button type="button" data-a="load"'+(o?'':' disabled')+'>LOAD</button><button type="button" data-a="del"'+(o?'':' disabled')+'>DELETE</button></div></div>';}
  function ui(){const lt=info().t,sel=$$('svLast');if(sel)sel.textContent='Last saved: '+when(lt);
    const w=$$('svWarn');if(w){w.hidden=!S.fail;w.textContent=S.fail?S.msg:'';}
    const lm=$$('setLastSave');if(lm)lm.textContent='Last saved: '+when(lt);
    if(!box||!box.isConnected)return;const list=$$('svList');if(list&&!ask)list.innerHTML=[1,2,3].map(slotHtml).join('');}
  function say(t){const n=$$('svMsg');if(n)n.textContent=t||'';}
  function confirmAsk(text,yes){ask={yes};const a=$$('svAsk');a.hidden=false;a.firstChild.textContent=text;}
  function build(){if(!RET.saves)return null;if(box&&box.isConnected)return box;const body=$$('setBody');if(!body)return null;
    if(!$$('svCss')){const s=document.createElement('style');s.id='svCss';s.textContent=css;document.head.appendChild(s);}
    const h=document.createElement('h3');h.id='svH';h.textContent='Save / Load';box=document.createElement('div');box.id='svBox';
    box.innerHTML='<div class="svNote" id="svLast"></div><div class="svNote err" id="svWarn" role="alert" hidden></div><div id="svList"></div>'
      +'<div class="svNote" id="svAsk" hidden><span></span><div class="svRow"><button type="button" id="svYes" class="hot">YES</button><button type="button" id="svNo">CANCEL</button></div></div><div class="svNote" id="svMsg" role="status"></div>';
    const sio=$$('sioBox');if(sio&&sio.parentNode===body){body.insertBefore(h,sio.previousSibling&&sio.previousSibling.id==='sioH'?sio.previousSibling:sio);body.insertBefore(box,$$('sioH')||sio);}else{body.appendChild(h);body.appendChild(box);}
    box.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('button');if(!b)return;
      if(b.id==='svNo'){ask=null;$$('svAsk').hidden=true;ui();return;}
      if(b.id==='svYes'){const y=ask&&ask.yes;ask=null;$$('svAsk').hidden=true;if(y)y();ui();return;}
      const row=b.closest('.svSlot');if(!row)return;const i=+row.dataset.i,name=row.querySelector('input').value,a=b.dataset.a;
      if(a==='save'){const go=()=>{if(saveSlot(i,name))say('Saved to slot '+i+'.');else say('Could not save.');};
        if(slot(i))confirmAsk('Overwrite slot '+i+'? The old copy is kept as a backup.',go);else go();}
      else if(a==='load'){confirmAsk('Load slot '+i+'? This replaces your current progress (a copy is kept).',()=>{if(loadSlot(i))say('Loaded. Reloading…');else say('That slot is damaged. Nothing was changed.');});}
      else if(a==='del'){confirmAsk('Delete slot '+i+'?',()=>{delSlot(i);say('Deleted.');});}});
    ui();return box;}
  function inSettings(){   // the Settings screen shows the last save time next to the other Save line
    const body=$$('setBody');if(!body||$$('setLastSave'))return;const d=document.createElement('div');d.id='setLastSave';d.className='sioNote';d.style.cssText='font:12px/1.4 sans-serif;color:#b8d4e6;margin:6px 0';const f=$$('svH');if(f)body.insertBefore(d,f);else body.appendChild(d);ui();}
  function onOpen(){setTimeout(()=>{if(!RET.saves){const b=$$('svBox');if(b){b.remove();const h=$$('svH');if(h)h.remove();const d=$$('setLastSave');if(d)d.remove();box=null;}return;}build();inSettings();ui();},30);}
  return{S,keys,snap,sync,flush,soon,saveSlot,loadSlot,delSlot,slot,info,build,onOpen,fail,toast,ui,stageOf,okKey,known,stageOfSlot:i=>{const o=slot(i);return o?o.stage:0;},when};
})();
if(RET.saves){
  const SV=RET.SV;
  /* every write through save() is noticed: a throwing setItem is reported, any success schedules an autosave flush */
  {const raw=save;save=function(k,v){let t;try{t=JSON.stringify(v);}catch(e){return raw(k,v);}
      try{localStorage.setItem(k,t);}catch(e){SV.fail(e);return;}
      if(!SV.S.inFlush)SV.soon();};}
  /* the export / import / undo of ret.js now cover every key, including ones another device never wrote */
  if(RET.sio){const X=RET.sio,p0=X.parse,pk=X.pack,di=X.doImport,un=X.undo;
    const names=txt=>{try{let t=String(txt).trim(),raw=t;if(t[0]!=='{')raw=decodeURIComponent(escape(atob(t.replace(/^MNR1\./,'').replace(/\s+/g,'').replace(/-/g,'+').replace(/_/g,'/'))));const o=JSON.parse(raw);return o&&o.keys&&typeof o.keys==='object'?Object.keys(o.keys):[];}catch(e){return[];}};
    X.parse=function(txt){for(const k of names(txt))if(SV.known(k)&&RET.sioKeys.indexOf(k)<0)RET.sioKeys.push(k);return p0(txt);};
    X.pack=function(){SV.sync();SV.flush(true);return pk();};
    X.doImport=function(p){SV.sync();const r=di(p);if(r)SV.S.freeze=true;return r;};   // frozen: the page that is about to reload must not write its old memory over the import
    X.undo=function(){SV.sync();const r=un();if(r)SV.S.freeze=true;return r;};}
  SV.sync();
  for(const e of['stageClear','runEnd','banked','forge','forgePreset','districtEnd','choice'])NR.on(e,()=>{SV.S.toastOk=e==='stageClear'||e==='runEnd';SV.soon();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)SV.flush(true);});
  addEventListener('pagehide',()=>{SV.flush(true);});
  for(const id of['setBtn','pSetBtn']){const b=document.getElementById(id);if(b)b.addEventListener('click',SV.onOpen);}
  try{if(!localStorage.getItem('mnr_svinfo'))SV.flush(true);}catch(e){}
}
