// ===================== playable.js: a turn you can follow, one thing at a time =====================
// (a) a banner "Your turn" / "<Rival>'s turn", (b) one always-visible instruction line (#say, plain words), (c) after every move a caption
// ("Teal points at one of your wires and says 3" -> "Hit! ..."), (d) a score pop with the plain reason ("+2 wires: matching 3s"),
// (e) the rival plays step by step: banner, "points at" caption, result caption; tap the table to speed up. Words for the story are in story.js.
const PL={key:'',bt:0,pt:0};
const plSeat=()=>{const v=UI.V;return v&&v.seat>=0?v.seat:-1};
const plEsc=s=>String(s).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
// "Amber" (the viewer) becomes "you"/"your": the log is written for everyone, the caption for the person holding the phone
function plain(t){const me=plSeat();t=String(t||'');
  t=t.replace(/All four (\S+)s are cut: validation token \S+ goes on the track\./,'All four $1s are done.').replace(/solo-cuts 2 × (\S+)\./,'cuts both $1s alone.').replace(/solo-cuts 4 × (\S+)\./,'cuts all four $1s alone.')
    .replace(/(\d+) wires of (\w+)\b/g,"$1 of $2's wires").replace(/a wire of (\w+)\b/g,"one of $1's wires").replace(/says "([^"]+)"/,'says $1');
  if(me<0)return t;const n=plEsc(nm(me));
  return t.replace(new RegExp("one of "+n+"'s wires",'g'),'one of your wires').replace(new RegExp("of "+n+"'s wires",'g'),'of your wires')
    .replace(new RegExp('^'+n+' (points|cuts|uses)','g'),(m,a)=>'You '+({points:'point',cuts:'cut',uses:'use'})[a]).replace(new RegExp('(; |, )'+n+' cuts','g'),'$1you cut')
    .replace(/^You point(.*) and says/,'You point$1 and say').replace(new RegExp('^'+n+"'s",'g'),'Your').replace(new RegExp(n+"'s",'g'),'your').replace(new RegExp('\\b'+n+'\\b','g'),'you')}
// ---------- reading time (owner, 8 Nov): a caption stays 4 s + 1 s per 10 words, or until you tap; the crew waits for it ----------
function plRead(t){const w=String(t||'').trim().split(/\s+/).filter(Boolean).length;const ms=4000+Math.ceil(w/10)*1000;return (UI.speed||1)>=3?Math.max(400,ms/UI.speed):ms}
function plTick(ms){try{if(navigator.vibrate)navigator.vibrate(ms||12)}catch(e){}}
function plWait(){if(!ANIM||!TBL.sayT)return;UI.aiNotBefore=Math.max(UI.aiNotBefore||0,TBL.sayT);clearTimeout(PL.rt);PL.rt=setTimeout(()=>{try{if(Date.now()>=TBL.sayT)refresh()}catch(e){}},TBL.sayT-Date.now()+40);
  if(UI.aiT){clearTimeout(UI.aiT);UI.aiT=null;schedule()}}
function plSkip(){if(!TBL.sayT||Date.now()>=TBL.sayT)return false;TBL.sayT=0;UI.aiNotBefore=0;const el=document.getElementById('say');if(el)el.classList.remove('hot','badc','goodc');
  const s=decider();if(s>=0&&isHuman(s))return true;   // your own turn: the tap goes on to the wire; the next refresh shows the instruction
  if(UI.aiT){clearTimeout(UI.aiT);UI.aiT=null}try{refresh();schedule()}catch(e){}return true}
// a short vibrate tick when you pick up or drop a piece (phones that support it)
(function(){if(typeof sfx!=='function')return;const o=sfx;sfx=function(k){try{if(k==='select'||k==='click')plTick(k==='select'?8:14)}catch(e){}return o.apply(this,arguments)}})();
function plCut(){return G?G.st.reduce((a,s)=>a+s.w.filter(x=>x.cut).length,0):0}
// ---------- (a) the banner ----------
function plBanner(txt,col){const tb=document.getElementById('fx');if(!tb)return;let b=document.getElementById('turnb');if(!b){b=document.createElement('div');b.id='turnb';b.setAttribute('aria-hidden','true');b.setAttribute('data-help','');tb.appendChild(b)}
  b.textContent=txt;b.style.setProperty('--bc',col||'#ffd34d');b.classList.remove('on');void b.offsetWidth;b.classList.add('on');clearTimeout(PL.bt);PL.bt=setTimeout(()=>{b.classList.remove('on');b.remove()},Math.max(500,1100/(UI.speed||1)))}
function plTurnWatch(){if(!G||!UI.started||G.over||UI.brief||G.phase!=='turn'||G.q||passTo()>=0){return}
  const s=decider();if(s<0)return;const key=G.mission+':'+G.turn+':'+s;if(key===PL.key)return;PL.key=key;
  if(UI._boost&&isHuman(s)){UI.speed=UI._boost;UI._boost=null}
  if(UI.tut)return;const me=plSeat();
  if(me>=0&&s===me)plBanner('Your turn','#ffd34d');else if(!isHuman(s)||me<0)plBanner(nm(s)+"'s turn",SEATC[posOf(s)%5]);else plBanner(nm(s)+"'s turn",SEATC[posOf(s)%5])}
(function(){const o=refresh;refresh=function(){o();try{plTurnWatch()}catch(e){console.error(e)}}})();
// ---------- (c)+(e) captions: before the move (announce) and after it (the log lines the engine just wrote) ----------
(function(){const o=announce;announce=function(m,seat){o(m,seat);try{if(m&&m.a==='dual'&&G&&G.st[m.st]){const ow=ownerOf(m.st),who=ow===plSeat()?'one of your wires':'one of '+nm(ow)+"'s wires";
    void who}}catch(e){}}})();
function plLines(n0){const out=[];for(const e of G.log){if(e.i<=n0)break;if(e.c==='turn'||/opening token|fuse is lit/i.test(e.t))continue;out.unshift(e)}return out}
(function(){const o=applyMove;applyMove=function(m,seat){if(!G||G.over)return o(m,seat);const n0=G.logN,c0=plCut(),d0=G.dial;const r=o(m,seat);
  try{if(r&&r.success!==false&&G){const L=plLines(n0);if(L.length&&!(m.a==='q'&&!L.length)){const first=L[0],bad=L.some(e=>e.c==='bad'),good=L.some(e=>e.c==='good');
      let t=plain(L.slice(0,2).map(e=>e.t).join(' '));if(t.length>84){const rs=L.find(e=>/^(Hit|Miss)/.test(e.t));t=plain((rs||L[0]).t)}let hold=plRead(t);if(m.a==='q'||!L.length)hold=0;
      if(hold&&ANIM){hold=0;UI.aiNotBefore=Math.max(UI.aiNotBefore||0,Date.now()+Math.max(300,1600/(UI.speed||1)))}void bad;void good;void t;
      const dc=plCut()-c0;let pop=null;
      if(dc>0)pop=['+'+dc,dc>=3?'wires cut':(m.a==='solo'?'solo cut: no guessing needed':'a match: both wires cut'),'good'];
      else if(G.dial!=null&&d0!=null&&G.dial<d0)pop=['Fuse −'+(d0-G.dial),'a miss: nobody cut','bad'];
      if(pop)plPop(pop[0],pop[1],pop[2]);if(UI.aiT){clearTimeout(UI.aiT);UI.aiT=null;schedule()}}}}catch(e){console.error(e)}return r}})();
// ---------- (d) the score pop ----------
function plPop(big,why,cls){const tb=document.getElementById('fx');if(!tb||UI.tut&&false)return;let p=document.getElementById('spop');if(!p){p=document.createElement('div');p.id='spop';p.setAttribute('aria-hidden','true');p.setAttribute('data-help','');tb.appendChild(p)}
  p.className='';p.innerHTML='<b>'+esc(big)+'</b>';if(cls==='good')plTick(18);void p.offsetWidth;p.className='on '+cls;clearTimeout(PL.pt);PL.pt=setTimeout(()=>{p.classList.remove('on');p.remove()},Math.max(900,1500/(UI.speed||1)))}
// ---------- (b) the one instruction line, in plain words ----------
(function(){const o=sayText;sayText=function(V){const t=o(V);if(!G||G.over||UI.brief||!V||V.seat<0)return t;const me=V.seat,s=decider();if(UI.tut)return t;
  if(V.q&&V.q.who===me&&V.q.kind==='infoStd')return 'Show a wire: tap one of yours.';
  if(V.legal&&s===me&&!(V.q&&V.q.who===me)){const sel=UI.sel;
    if(sel&&sel.mode==='dual'&&!sel.tool&&!sel.two){if(sel.tg.length&&sel.v==null)return 'Now tap one of your own numbers to say it.';if(sel.v!=null&&!sel.tg.length)return 'Now tap the crew wire you think matches.'}
    if(!sel&&t==='Tap a glowing wire')return 'Your turn: tap a glowing crew wire to guess it.';
    if(!sel&&t==='Tap your glowing wires')return 'Your turn: you hold every one left. Tap them to cut.'}
  if(s>=0&&s!==me&&!isHuman(s)&&!G.q)return nm(s)+' is thinking…';return t}})();
document.addEventListener('pointerdown',e=>{if(!G||!UI.started||!e.target.closest)return;if(e.target.closest('#say')||e.target.closest('#tb'))plSkip()},true);
// ---------- tap the table while the computer crew plays to speed it up ----------
document.addEventListener('pointerdown',e=>{if(!G||!UI.started||G.over||UI.brief||UI.tut||!e.target.closest||!e.target.closest('#tb'))return;const s=decider();if(s<0||isHuman(s)||UI._boost)return;
  UI._boost=UI.speed;UI.speed=Math.max(UI.speed,3);if(UI.aiT){clearTimeout(UI.aiT);UI.aiT=null;schedule()}},true);
// drawer text that is scrolled completely out of view is hidden (it is not visible anyway): nothing is left "under" the painted frame
function plClip(){document.querySelectorAll('.gx-drawer.open .gx-drawer-body,.gx-drawer.on .gx-drawer-body,.gx-drawer-body').forEach(body=>{const r=body.getBoundingClientRect();if(!r.height)return;
  body.querySelectorAll('*').forEach(e=>{const q=e.getBoundingClientRect();if(!q.height)return;const out=q.top>=r.bottom-1||q.bottom<=r.top+1;const h=e.style.visibility==='hidden';if(out&&!h)e.style.visibility='hidden';else if(!out&&h)e.style.visibility=''})})}
document.addEventListener('scroll',e=>{if(e.target&&e.target.classList&&e.target.classList.contains('gx-drawer-body'))plClip()},true);
setInterval(plClip,300);
// ---------- the middle of the table: the rig and the race (cut / total), in the biggest empty gap between the stands ----------
function plCenter(){const tb=document.getElementById('tb');if(!tb)return;let c=document.getElementById('midc');
  const off=()=>{if(c)c.hidden=true};if(!G||!UI.started||G.over||UI.brief)return off();
  const b=tb.getBoundingClientRect();if(!b.height)return off();
  const rows=[...tb.querySelectorAll('#crew .sg,#gear,#mine')].map(e=>e.getBoundingClientRect()).filter(r=>r.height>4).sort((x,y)=>x.top-y.top);
  const say=document.getElementById('say');let top=say?say.getBoundingClientRect().bottom:b.top,best=null;
  let k=0;for(const r of rows){const g=r.top-top;const w=g+(k>0&&g>=120?1000:0);if(w>(best?best.w:0))best={y:top,h:g,w};top=Math.max(top,r.bottom);k++}
  let side=null;if(!best||best.h<120){best=null;const cr=[...tb.querySelectorAll('#crew .sg')].map(e=>e.getBoundingClientRect()).filter(r=>r.height>4).sort((x,y)=>x.left-y.left);
    for(let i=1;i<cr.length;i++){const p=cr[i-1],q=cr[i];if(Math.min(p.bottom,q.bottom)-Math.max(p.top,q.top)<20)continue;const w=q.left-p.right;if(w>=200&&(!side||w>side.w))side={x:p.right,w,y:Math.max(p.top,q.top),h:Math.min(p.bottom,q.bottom)-Math.max(p.top,q.top)}}
    if(!side)return off()}
  if(side){const h=Math.min(side.h,side.w*.42,180),tot=G.st.reduce((a,s)=>a+s.w.length,0),cut=plCut();
    if(!c){c=document.createElement('div');c.id='midc';c.setAttribute('aria-hidden','true');c.innerHTML='<i></i><div><b></b><span>wires cut</span></div>';tb.appendChild(c)}
    c.hidden=false;c.style.left=(side.x-b.left+12)+'px';c.style.right=(b.right-side.x-side.w+12)+'px';c.style.top=(side.y-b.top+(side.h-h)/2)+'px';c.style.height=h+'px';c.style.setProperty('--mh',h+'px');
    const t=cut+' / '+tot;if(c.querySelector('b').textContent!==t){c.querySelector('b').textContent=t;c.classList.remove('bump');void c.offsetWidth;if(cut)c.classList.add('bump')}return}
  const h=Math.min(best.h-16,Math.max(120,b.width>900?230:170)),tot=G.st.reduce((a,s)=>a+s.w.length,0),cut=plCut();
  if(!c){c=document.createElement('div');c.id='midc';c.setAttribute('aria-hidden','true');c.innerHTML='<i></i><div><b></b><span>wires cut</span></div>';tb.appendChild(c)}
  c.hidden=false;c.style.left='0';c.style.right='0';c.style.top=(best.y-b.top+(best.h-h)/2)+'px';c.style.height=h+'px';c.style.setProperty('--mh',h+'px');
  const t=cut+' / '+tot;if(c.querySelector('b').textContent!==t){c.querySelector('b').textContent=t;c.classList.remove('bump');void c.offsetWidth;if(cut)c.classList.add('bump')}}
(function(){const o=refresh;refresh=function(){o();try{plCenter()}catch(e){console.error(e)}}})();
setInterval(()=>{try{plCenter()}catch(e){}},700);
