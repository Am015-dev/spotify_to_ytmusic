// wiretips.js: instruction wording, tap a wire to read its clues, PC keys. No rules here.
// (1) the instruction line: on your turn it names the crewmate whose wires to tap; a double match says which of YOUR wires
// F4: a reference drawer (gear, job card) opened while the crew played would hide the wires that glow when your turn starts: close it then
let f4Turn=null;function f4Open(){if(!G||!UI.V||G.over||UI.brief||UI.tut||!UI.started)return;const V=UI.V;if(V.seat<0||!V.legal||decider()!==V.seat)return;const k=G.turn+':'+G.round;if(k===f4Turn)return;f4Turn=k;
  const d=document.querySelector('.gx-drawer.on');const x=d&&d.querySelector('.gx-x');if(x)x.click()}
(function(){const o=refresh;refresh=function(){o();try{f4Open();f3Say()}catch(e){console.error(e)}}})();
function f3Say(){const el=document.getElementById('say');if(!el||!G||!UI.V||G.over||UI.brief||UI.tut)return;const V=UI.V,me=V.seat;if(me<0)return;
  let txt=null,mine=false;
  if(V.q&&V.q.who===me&&V.q.kind==='pickMatch'&&V.q.opts&&V.q.opts[0]&&V.q.opts[0].d){const u=V.q.opts[0].d.u;let v=null;
    for(const st of G.st)for(const w of st.w)if(w.u===u)v=w.v;
    txt=v==null?'Two of your wires match: tap one to cut':'Two of your '+(v==='Y'?'yellow':String(v))+'s match: tap one to cut';mine=true}
  else if(/^Your turn/.test(el.textContent)&&!UI.sel&&!G.q){const by={};document.querySelectorAll('#crew .tile.glow').forEach(t=>{const sg=t.closest('.sg');if(sg&&sg.dataset.seat!=null)by[sg.dataset.seat]=(by[sg.dataset.seat]||0)+1});
    const seats=Object.keys(by).sort((a,b)=>by[b]-by[a]||0);if(seats.length){const n=nm(+seats[0]);txt='Your turn: tap one of '+n+(/s$/.test(n)?"' wires":"'s wires");mine=true}}
  if(txt!==null&&el.textContent!==txt)el.textContent=txt;el.classList.toggle('mine',mine&&/^(Your turn|Two of your)/.test(el.textContent))}
// (2) tap a crew wire that does not glow: its full clue list
function f3Tip(msg,el){let t=document.getElementById('wtip');if(!t){t=document.createElement('div');t.id='wtip';t.setAttribute('role','status');t.addEventListener('click',()=>{t.hidden=true});document.body.appendChild(t)}
  t.textContent=msg;t.hidden=false;const r=el.getBoundingClientRect();const w=Math.min(300,innerWidth-24);t.style.width=w+'px';
  t.style.left=Math.max(12,Math.min(innerWidth-w-12,r.left+r.width/2-w/2))+'px';const below=r.bottom+6+t.offsetHeight<innerHeight-8;t.style.top=(below?r.bottom+6:Math.max(8,r.top-6-t.offsetHeight))+'px';
  clearTimeout(t._h);t._h=setTimeout(()=>{t.hidden=true},6000)}
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('#crew .tile.back,#crew .tile.glow');const w=document.getElementById('wtip');if(w&&!w.hidden&&!(e.target.closest&&e.target.closest('#wtip')))w.hidden=true;
  if(!t||!G||!UI.started||G.over||UI.tut||UI.brief||t.classList.contains('cut'))return;
  if(t.classList.contains('glow')&&UI.V&&UI.V.legal&&decider()===UI.V.seat)return;   // a wire you can pick: the line above already lists its clues
  let by=null;try{by=clRead()}catch(x){}const c=by&&by[+t.dataset.u];
  f3Tip(c?'Could be '+clList(c.vals)+(c.vals.has(14)?'. Might be red!':'. Not red.'):'No clue on this wire yet.',t)},true);
// (3) PC keys (a bonus; every control still works by mouse): 1-9 say that number, Enter confirms the one chip that is left, Escape cancels
document.addEventListener('keydown',e=>{if(!G||!UI.started||G.over||e.ctrlKey||e.metaKey||e.altKey||GX.open)return;const tg=e.target&&e.target.tagName;if(tg==='INPUT'||tg==='TEXTAREA'||tg==='SELECT')return;
  if(/^[1-9]$/.test(e.key)||e.key==='0'||e.key==='y'||e.key==='Y'){const v=e.key==='y'||e.key==='Y'?'Y':e.key==='0'?10:+e.key;
    const t=[...document.querySelectorAll('#mine .tile.glow')].find(x=>{const sl=G.st[+x.dataset.s]&&G.st[+x.dataset.s].w[+x.dataset.k];return sl&&sl.v===v});if(t){e.preventDefault();t.click()}}
  else if(e.key==='Enter'&&!(e.target.closest&&e.target.closest('button,a'))){const c=document.querySelector('#tray .chip.go');if(c){e.preventDefault();c.click()}}},true);
