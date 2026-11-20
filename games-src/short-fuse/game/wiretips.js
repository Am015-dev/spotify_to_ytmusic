// wiretips.js: instruction wording, tap a wire to read its clues, PC keys. No rules here.
// (1) the instruction line: on your turn it names the crewmate whose wires to tap; a double match says which of YOUR wires
// F4: a reference drawer (gear, job card) opened while the crew played would hide the wires that glow when your turn starts: close it then
let f4Turn=null;function f4Open(){if(!G||!UI.V||G.over||UI.brief||UI.tut||!UI.started)return;const V=UI.V;if(V.seat<0||!V.legal||decider()!==V.seat)return;const k=G.turn+':'+G.round;if(k===f4Turn)return;f4Turn=k;
  const d=document.querySelector('.gx-drawer.on');const x=d&&d.querySelector('.gx-x');if(x)x.click()}
function f4Scroll(){const c=document.getElementById('crew');if(!c||!c.classList.contains('scroll'))return;const t=c.querySelector('.tile.glow');if(!t)return;const r=t.getBoundingClientRect(),cr=c.getBoundingClientRect();if(r.top<cr.top||r.bottom>cr.bottom)c.scrollTop+=r.top<cr.top?r.top-cr.top-4:r.bottom-cr.bottom+24}
(function(){const o=refresh;refresh=function(){o();try{f4Open();f4Scroll();f3Say()}catch(e){console.error(e)}}})();
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
// F4: the first time a clue pill ("2·4", "3·Y", "≠2,6") or the scissor badge shows up on your turn, one line says what it means
function f4Explain(){if(!G||!UI.V||G.over||UI.brief||UI.tut||UI.coach||!UI.started||UI.sel||G.q)return;const V=UI.V;if(V.seat<0||decider()!==V.seat||!V.legal)return;
  if(Date.now()<(TBL.sayT||0))return;
  if(!lsGet('sf_x_pill',0)){const t=[...document.querySelectorAll('#crew .tile:not(.cut)')].find(x=>/\d·|·\d|·Y|Y·|≠/.test(x.textContent));
    if(t){lsSet('sf_x_pill',1);setSay('"2·4" is between 2 and 4. "≠2,6" is not 2 or 6.',6000);return}}
  if(!lsGet('sf_x_cut',0)){const t=document.querySelector('#mine .tile.g-solo');if(t){lsSet('sf_x_cut',1);setSay('Scissors: tap to cut all your matching wires.',6000)}}}
(function(){const o=refresh;refresh=function(){o();try{f4Explain()}catch(e){console.error(e)}}})();
// (3) PC keys (a bonus; every control still works by mouse): arrows pick a crew wire, 1-9 / 0 / Y say a number, Enter confirms, Escape cancels, Space skips a computer wait
(function(){let kc=-1;const wires=()=>[...document.querySelectorAll('#crew .tile.glow')];
  function ring(){document.querySelectorAll('.kf').forEach(x=>x.classList.remove('kf'));const w=wires();if(kc>=0&&w[kc]){w[kc].classList.add('kf');try{w[kc].scrollIntoView({block:'nearest'})}catch(e){}}}
  const o=refresh;refresh=function(){o();try{const w=wires();if(kc>=w.length)kc=-1;ring()}catch(e){}};
  const keysEl=()=>{let k=document.getElementById('keys');if(!k){k=document.createElement('div');k.id='keys';k.setAttribute('aria-label','Keyboard keys');k.innerHTML='<b>Keys</b> <kbd>&larr;</kbd><kbd>&rarr;</kbd> pick a wire <kbd>Enter</kbd> OK <kbd>1</kbd>-<kbd>9</kbd> <kbd>0</kbd> <kbd>Y</kbd> say a number <kbd>Esc</kbd> cancel <kbd>Space</kbd> skip wait';const b=document.getElementById('board');(b||document.body).appendChild(k)}return k};
  setInterval(()=>{try{const k=keysEl();k.hidden=!(G&&UI.started&&!G.over&&!UI.brief&&!UI.tut)}catch(e){}},700);
  document.addEventListener('keydown',e=>{if(!G||!UI.started||G.over||e.ctrlKey||e.metaKey||e.altKey||(typeof GX!=='undefined'&&GX.open))return;const tg=e.target&&e.target.tagName;if(tg==='INPUT'||tg==='TEXTAREA'||tg==='SELECT')return;const V=UI.V;if(!V||V.seat<0||UI.brief)return;
    const mineTurn=decider()===V.seat&&!!V.legal;const k=e.key;
    if(/^[0-9yY]$/.test(k)){const v=(k==='y'||k==='Y')?'Y':k==='0'?10:+k;const t=[...document.querySelectorAll('#mine .tile.glow')].find(x=>{const sl=G.st[+x.dataset.s]&&G.st[+x.dataset.s].w[+x.dataset.k];return sl&&sl.v===v});e.preventDefault();
      if(t)t.click();else if(mineTurn)toast(v==='Y'?'You hold no yellow wire to say':'You do not hold a '+v+' to say');else toast('Not your turn yet');return}
    if(k==='ArrowRight'||k==='ArrowLeft'||k==='ArrowDown'||k==='ArrowUp'){const w=wires();if(!w.length||!mineTurn)return;e.preventDefault();const d=(k==='ArrowRight'||k==='ArrowDown')?1:-1;kc=kc<0?(d>0?0:w.length-1):(kc+d+w.length)%w.length;ring();return}
    if(k==='Enter'||k===' '){if(e.target.closest&&e.target.closest('button,a'))return;
      const c=document.querySelector('#tray .chip.go');if(c){e.preventDefault();c.click();return}
      if(!mineTurn&&decider()>=0&&UI.aiT!==undefined&&k===' '){e.preventDefault();if(!UI._boost){UI._boost=UI.speed;UI.speed=Math.max(UI.speed,6);if(UI.aiT){clearTimeout(UI.aiT);UI.aiT=null;schedule()}}return}
      const w=wires();if(k==='Enter'&&mineTurn&&kc>=0&&w[kc]){e.preventDefault();w[kc].click();kc=-1;return}
      if(mineTurn&&!UI.sel){e.preventDefault();toast('Arrows pick a wire, or press a number');}return}
    if(k==='Escape'&&UI.sel){e.preventDefault();UI.sel=null;kc=-1;refresh()}},true)})();
