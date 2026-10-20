/* ---------- FEEDBACK: one optional tap at the end of a run (FUN / SAME AGAIN / BORING). Flag RET.feedback (?feedback=0 = nothing shown, nothing stored).
   Answers go to localStorage 'mnr_fb' (newest last, capped at 500): {stage, mode, diff, wp, sec, ts}. The STATS sheet lists the counts per stage and has a COPY button for the JSON.
   The strip sits under the buttons of #over / #stres, so it never delays or covers NEXT STAGE / RETRY; it is shown once per run. ---------- */
if(RET.feedback===undefined)RET.feedback=!/[?&]feedback=0/.test(location.search);
RET.sioKeys.push('mnr_fb');
const FB=(function(on){
  const KEY='mnr_fb',CAP=500,ANS=[['fun','FUN'],['same','SAME AGAIN'],['bore','BORING']];
  let run=null,id=0;
  const load=()=>{try{const a=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(a)?a.filter(x=>x&&typeof x==='object'&&typeof x.a==='string'):[];}catch(e){return[];}};
  const add=(e)=>{const a=load();a.push(e);while(a.length>CAP)a.shift();try{localStorage.setItem(KEY,JSON.stringify(a));}catch(x){}return a;};
  const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const hosts=()=>[['fbO',document.getElementById('over')],['fbR',document.getElementById('stres')]];
  function strip(hid,host){let e=document.getElementById(hid);if(!e){const h=host&&host.querySelector('.in');if(!h)return null;
      e=document.createElement('div');e.id=hid;e.className='fbBar';e.hidden=true;h.appendChild(e);
      e.addEventListener('click',ev=>{const b=ev.target.closest&&ev.target.closest('button[data-a]');if(b)FB.answer(b.dataset.a);});}return e;}
  function render(e,done){e.innerHTML=done?'<span class="fbQ">Thanks, noted.</span>':'<span class="fbQ">How did this run feel? (optional)</span><div class="fbR">'+ANS.map(a=>'<button type="button" class="fbB" data-a="'+a[0]+'">'+a[1]+'</button>').join('')+'</div>';}
  function show(){if(!on||!run||run.shown)return;run.shown=true;for(const [hid,host] of hosts()){const e=strip(hid,host);if(e){render(e,false);e.hidden=false;}}}
  function hide(){for(const [hid] of hosts()){const e=document.getElementById(hid);if(e)e.hidden=true;}}
  function answer(a){if(!on||!run||run.done||!ANS.some(x=>x[0]===a))return false;run.done=true;
    add({a,stage:run.stage,mode:run.mode,diff:run.diff,wp:run.wp,sec:Math.max(0,Math.round((Date.now()-run.t0)/1000)),ts:Date.now()});
    for(const [hid] of hosts()){const e=document.getElementById(hid);if(e&&!e.hidden)render(e,true);}return true;}
  function counts(){const m={};for(const x of load()){const k=x.stage;(m[k]||(m[k]={fun:0,same:0,bore:0}))[x.a]++;}return m;}
  function sheet(){if(!on)return'';const m=counts(),ks=Object.keys(m).sort((a,b)=>(+a||0)-(+b||0)||(a<b?-1:1));
    return '<h3>FEEDBACK</h3><div class="stParts fbList">'+(ks.length?ks.map(k=>'<div><span>'+(/^\d+$/.test(k)?'Stage '+k:esc(k))+'</span><em>Fun '+m[k].fun+' · Same '+m[k].same+' · Boring '+m[k].bore+'</em></div>').join(''):'<div><span>No answers yet</span></div>')+'</div>'
      +'<button type="button" class="go dim" id="fbCopy">COPY FEEDBACK</button>';}
  function copy(b){const t=JSON.stringify(load());const ok=()=>{b.textContent='COPIED';setTimeout(()=>{if(b.isConnected)b.textContent='COPY FEEDBACK';},1800);};
    const fall=()=>{try{const ta=document.createElement('textarea');ta.value=t;ta.style.cssText='position:fixed;left:-999px;top:0';document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove();ok();}catch(e){b.textContent='COPY FAILED';}};
    try{if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(t).then(ok,fall);else fall();}catch(e){fall();}}
  if(on){
    const st=document.createElement('style');st.textContent=`
.fbBar{margin-top:10px;text-align:center;font-family:var(--mono,monospace)}.fbBar[hidden]{display:none}
.fbQ{display:block;font-size:14px;color:#c9c4ec;margin-bottom:6px}
.fbR{display:flex;gap:8px;justify-content:center;flex-wrap:wrap}
.fbB{min-height:48px;min-width:96px;flex:1 1 96px;max-width:170px;padding:6px 10px;border-radius:10px;border:2px solid #ffffff55;background:#ffffff14;color:#fff;font:700 15px/1.1 var(--mono,monospace);letter-spacing:.06em;cursor:pointer}
.fbB:active{background:#19e3ff44;border-color:#19e3ff}
.fbList em{font-style:normal}
#stSheet #fbCopy{min-height:48px}`;
    document.head.appendChild(st);
    NR.on('runStart',d=>{id++;hide();
      if(!d||d.tut||d.lab){run=null;return;}
      run={id,shown:false,done:false,t0:Date.now(),stage:d.story?d.story:'endless',mode:d.story?'story':(d.daily?'daily':(typeof G!=='undefined'&&G.weekly?'weekly':'arcade')),
        diff:(typeof SET!=='undefined'&&SET.diff)||'normal',wp:(()=>{try{return WP.eqIds().slice();}catch(e){return[];}})()};});
    NR.on('runEnd',d=>{if(!d||d.quit||!run)return;run.sec=Math.round((Date.now()-run.t0)/1000);setTimeout(show,0);});
    document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('#fbCopy');if(b)copy(b);});
  }
  return{on,answer,load,counts,sheet,show,hide};
})(RET.feedback);
window.FB=FB;
