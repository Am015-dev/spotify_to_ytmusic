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
    const v=m.v==='Y'?'yellow':m.v;setSay(plain(nm(seat)+' points at '+who+' and says '+v+(m.v2!=null?' or '+(m.v2==='Y'?'yellow':m.v2):'')),Math.max(900,1500/(UI.speed||1)))}}catch(e){}}})();
function plLines(n0){const out=[];for(const e of G.log){if(e.i<=n0)break;if(e.c==='turn'||/opening token|fuse is lit/i.test(e.t))continue;out.unshift(e)}return out}
(function(){const o=applyMove;applyMove=function(m,seat){if(!G||G.over)return o(m,seat);const n0=G.logN,c0=plCut(),d0=G.dial;const r=o(m,seat);
  try{if(r&&r.success!==false&&G){const L=plLines(n0);if(L.length&&!(m.a==='q'&&!L.length)){const first=L[0],bad=L.some(e=>e.c==='bad'),good=L.some(e=>e.c==='good');
      let t=plain(L.slice(0,2).map(e=>e.t).join(' '));if(t.length>84){const rs=L.find(e=>/^(Hit|Miss)/.test(e.t));t=plain((rs||L[0]).t)}let hold=Math.max(1400,2200/(UI.speed||1));if(m.a==='q'||!L.length)hold=0;
      if(hold){const say=document.getElementById('say');TBL.sayT=0;setSay(t,hold);if(say){say.classList.toggle('badc',bad&&!good);say.classList.toggle('goodc',good&&!bad);setTimeout(()=>say.classList.remove('badc','goodc'),hold)}}
      const dc=plCut()-c0;let pop=null;
      if(dc>0)pop=['+'+dc,dc>=3?'wires cut':(m.a==='solo'?'solo cut: no guessing needed':'a match: both wires cut'),'good'];
      else if(G.dial!=null&&d0!=null&&G.dial<d0)pop=['Fuse −'+(d0-G.dial),'a miss: nobody cut','bad'];
      if(pop)plPop(pop[0],pop[1],pop[2])}}}catch(e){console.error(e)}return r}})();
// ---------- (d) the score pop ----------
function plPop(big,why,cls){const tb=document.getElementById('fx');if(!tb||UI.tut&&false)return;let p=document.getElementById('spop');if(!p){p=document.createElement('div');p.id='spop';p.setAttribute('aria-hidden','true');p.setAttribute('data-help','');tb.appendChild(p)}
  p.className='';p.innerHTML='<b>'+esc(big)+'</b><span>'+esc(why)+'</span>';void p.offsetWidth;p.className='on '+cls;clearTimeout(PL.pt);PL.pt=setTimeout(()=>{p.classList.remove('on');p.remove()},Math.max(900,1700/(UI.speed||1)))}
// ---------- (b) the one instruction line, in plain words ----------
(function(){const o=sayText;sayText=function(V){const t=o(V);if(!G||G.over||UI.brief||!V||V.seat<0)return t;const me=V.seat,s=decider();if(UI.tut)return t;
  if(V.q&&V.q.who===me&&V.q.kind==='infoStd')return 'Show a wire: tap one of yours.';
  if(V.legal&&s===me&&!(V.q&&V.q.who===me)){const sel=UI.sel;
    if(sel&&sel.mode==='dual'&&!sel.tool&&!sel.two){if(sel.tg.length&&sel.v==null)return 'Now tap one of your own numbers to say it.';if(sel.v!=null&&!sel.tg.length)return 'Now tap the crew wire you think matches.'}
    if(!sel&&t==='Tap a glowing wire')return 'Your turn: tap a glowing crew wire to guess it.';
    if(!sel&&t==='Tap your glowing wires')return 'Your turn: you hold every one left. Tap them to cut.'}
  if(s>=0&&s!==me&&!isHuman(s)&&!G.q)return nm(s)+"'s turn: thinking...";return t}})();
// ---------- tap the table while the computer crew plays to speed it up ----------
document.addEventListener('pointerdown',e=>{if(!G||!UI.started||G.over||UI.brief||UI.tut||!e.target.closest||!e.target.closest('#tb'))return;const s=decider();if(s<0||isHuman(s)||UI._boost)return;
  UI._boost=UI.speed;UI.speed=Math.max(UI.speed,3);if(UI.aiT){clearTimeout(UI.aiT);UI.aiT=null;schedule()}},true);
