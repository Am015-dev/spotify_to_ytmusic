// ===================== the coached first game: Hadiya explains each rule just in time (owner, 22 Oct: no forced tap-tap tutorial) =====================
// The game is a real game (G.coach, tutdata.js): every legal move is allowed, the computer plays normally, nothing is saved, no step is forced (0 spotlights).
// One bubble at a time (#coach), see-through to taps (only its X answers), it dismisses itself. A rule is explained the first time it matters;
// rules that never came up are listed on the "Things you'll meet later" page of the final count. The final count is walked through with the real numbers.
// To add a rule: an entry in RULES (when -> true / 'me' / 'rival') and its text in LORE.coach (lore.js).
const COACH={seen:{},cur:null,t:0,react:null,tStart:null,lastAct:null,pg:-1,done:false,prevCur:-1};
const cN=p=>MPLUR[p]||p;
const cMine=()=>!!G&&!G.over&&G.phase==='turn'&&G.cur===0;
const cRival=()=>!!G&&!G.over&&G.phase==='turn'&&G.cur===1;
const cWho=()=>cMine()?'me':cRival()?'rival':null;
const cAct=()=>G&&G.phase==='turn'&&G.act?G.act:null;
const cTribe=col=>()=>{const a=cAct();return a&&G.step==='tribe'&&a.color===col?cWho():null};
const cTile=kind=>()=>{const a=cAct();return a&&(G.step==='tile'||G.step==='sell')&&G.board[a.tile].k===kind?cWho():null};
// ordered: the first unseen rule whose `when` holds is told
const RULES=[
 ['goal',()=>G.phase==='bid'&&G.bids.length===0&&G.round===1&&'me'],
 ['bid',()=>G.phase==='bid'&&G.round===1&&G.bidQueue[0]&&G.bidQueue[0].p===0&&G.bids.length===0&&'me'],
 ['markers',()=>G.phase==='bid'&&G.round===1&&G.bids.length>=1&&G.bidQueue[0]&&G.bidQueue[0].p===0&&'me'],
 ['lift',()=>cMine()&&G.step==='move'&&!G.move&&!UI.modal&&'me'],
 ['order',()=>G.phase==='turn'&&G.round===1&&G.turnIdx<=1&&G.step==='move'&&!G.move&&'me'],
 ['drop',()=>cMine()&&G.step==='move'&&G.move&&G.move.hand.length>1&&'me'],
 ['chz',()=>cMine()&&!!UI.chz&&'me'],
 ['lastcolour',()=>cMine()&&G.step==='move'&&G.move&&G.move.hand.length===1&&'me'],
 ['take',()=>{const a=cAct();return a&&G.step==='tribe'&&cWho()}],
 ['tribes',()=>{const a=cAct();return a&&G.step==='tribe'&&COACH.seen.take&&cWho()}],
 ['camel',()=>{const a=cAct();return a&&G.board[a.tile].camel!=null&&G.board[a.tile].camel===G.cur&&cWho()}],
 ['traders',cTribe('merchant')],['masons',cTribe('builder')],['sages',cTribe('elder')],['advisors',cTribe('vizier')],['shadows',cTribe('assassin')],
 ['stall',cTile('small')],['bazaar',cTile('large')],['shrine',cTile('sacred')],['hamlet',cTile('village')],['oasis',cTile('oasis')],['exchange',cTile('exchange')],
 ['goods',()=>G&&!G.over&&G.pl[0].res.some(r=>r!=='fakir')&&'me'],
 ['mystics',()=>G&&!G.over&&G.pl[0].fk>0&&'me'],
 ['sell',()=>cMine()&&G.step==='sell'&&G.pl[0].res.some(r=>r!=='fakir')&&'me'],
 ['palms',()=>G&&!G.over&&G.board.some(t=>t.palm>0)&&'me'],
 ['palaces',()=>G&&!G.over&&G.board.some(t=>t.pal>0)&&'me'],
 ['djinns',()=>G&&!G.over&&G.pl.some(p=>p.dj.length>0)&&'me'],
 ['rival',()=>cRival()&&G.step==='move'&&!!G.move&&'rival'],
 ['end',()=>G&&!G.over&&G.pl.some(p=>p.camels<=1)&&'me']];
function coachText(id,who){const L=LORE.coach[id];if(!L)return '';const a=cAct();
  if(id==='order')return L.say(G.order.map(m=>plName(P(m.p).nm)).join(', '));
  if(id==='take'&&a){const c=who==='me'?L.say:L.rival;return c(a.n,a.n>1?MPLUR[a.color]:MNAME[a.color])}
  return who==='rival'&&L.rival?L.rival:(typeof L.say==='function'?L.say():L.say)}
function coachEl(){let e=document.getElementById('coach');if(!e){e=document.createElement('div');e.id='coach';e.className='coach';e.setAttribute('data-help','');e.setAttribute('role','status');
  e.innerHTML='<i></i><span></span><button type="button" aria-label="Got it" data-help>Got it</button>';const tb=document.getElementById('table');if(tb&&tb.parentNode)tb.parentNode.insertBefore(e,tb);else document.body.appendChild(e);e.querySelector('button').addEventListener('click',ev=>{ev.stopPropagation();coachHide()})}return e}
function coachHide(){clearTimeout(COACH.t);COACH.cur=null;const e=document.getElementById('coach');if(e)e.classList.remove('on');try{fit()}catch(x){}}
const coachMin=()=>ANIM?4600+(COACH.words||8)*100:50;   // a message stays at least 4 s + 1 s per 10 words
function coachShow(id,text,name,face){const e=coachEl();e.querySelector('i').textContent=face;e.querySelector('span').innerHTML='<b>'+esc(name)+'</b>'+esc(text);
  const w=text.split(' ').length;COACH.words=w;const tc=document.getElementById('turnover');if(tc)tc.classList.remove('on');
  e.classList.add('on');COACH.cur=id;COACH.shownAt=Date.now();COACH.text=text;clearTimeout(COACH.t);try{fit()}catch(x){}
  COACH.t=setTimeout(coachHide,ANIM?9000+w*150:500)}
function coachBegin(){COACH.seen={};COACH.log=[];COACH.react=null;COACH.tStart=null;COACH.lastAct=null;COACH.done=false;COACH.pg=-1;COACH.prevCur=-1;coachHide();const o=document.getElementById('coachend');if(o)o.remove()}
function coachEnd(){coachHide();const o=document.getElementById('coachend');if(o)o.remove();COACH.pg=-1}
function coachSee(id,text){COACH.seen[id]=1;(COACH.log=COACH.log||[]).push(id)}
// what happened on your turn: a good or poor move gets one line of why
function coachReact(){if(!G||!G.coach||G.over)return;const a=cAct();if(cMine()){if(COACH.tStart==null)COACH.tStart=shownTotal(G.pl[0]);if(a)COACH.lastAct={n:a.n,c:a.color}}
  else if(COACH.tStart!=null&&G.phase==='turn'&&G.cur===1){const d=shownTotal(G.pl[0])-COACH.tStart;const la=COACH.lastAct;COACH.tStart=null;COACH.lastAct=null;let t='';
    if(la&&la.n===1)t='Only one '+MNAME[la.c]+'. Land on tiles with several of its colour.';
    else if(la&&la.n>=3)t='Well walked: '+la.n+' '+MPLUR[la.c]+' in one go.';
    else if(d>=8)t='Good turn: +'+d+' points.';
    else if(d<=0)t='No points this turn. Early on, build land and goods first.';
    /* the rating card (score.js) now says this; no separate reaction */}
  else if(G.phase==='bid')COACH.tStart=null}
function coachAfter(){if(!G||!G.coach){coachHide();return}
  if(G.over){coachFinal();return}
  coachReact();
  if(UI.modal||GX.open){return}
  if((COACH.cur&&Date.now()-COACH.shownAt<coachMin())||(typeof PLQB!=='undefined'&&PLQB))return;   // a new rule waits until the one on screen has been readable long enough and no score pop is up
  if(COACH.react&&G.phase==='turn'){const t=COACH.react;COACH.react=null;coachShow('react',t,LORE.guide.name,LORE.guide.face);return}
  for(const [id,when] of RULES){if(COACH.seen[id])continue;let w=false;try{w=when()}catch(e){w=false}
    if(w){coachSee(id);const rv=w==='rival';coachShow(id,coachText(id,w),rv?LORE.rival.name:LORE.guide.name,rv?LORE.rival.face:LORE.guide.face);return}}}
// ---------------- the final count, walked through with the real numbers ----------------
function coachPages(){const sc=G.over.scores;const A=sc.find(x=>x.p===0),B=sc.find(x=>x.p===1);const a=A.s,b=B.s,pa=G.pl[0],pb=G.pl[1];const f=(x,y)=>({a:x,b:y});
  const row=(l,x,y,why)=>`<div class="ce-r"><span>${l}</span><b>${x}</b><b>${y}</b><p>${why}</p></div>`;
  const hd='<div class="ce-h"><span></span><b>You</b><b>Farid</b></div>';
  const tiles=G.board.filter(t=>owner(t)===0).length,tilesB=G.board.filter(t=>owner(t)===1).length;
  const gs=p=>{const c={};for(const r of p.res)c[r]=(c[r]||0)+1;return Object.keys(c).length};
  const pages=[
   {t:'Coins and land',h:hd+row('Coins',a.coins,b.coins,'Every coin is a point.')+row('Land',a.tiles,b.tiles,'You hold '+tiles+' tile'+(tiles===1?'':'s')+', Farid '+tilesB+'. Each scores the number printed on it.')},
   {t:'Palms and palaces',h:hd+row('Palms',a.palms,b.palms,'3 points per palm on a tile you hold. You: '+(a.palms/3)+' palm'+(a.palms===3?'':'s')+'.')+row('Palaces',a.palaces,b.palaces,'5 points per palace on a tile you hold. You: '+(a.palaces/5)+'.')},
   {t:'People',h:hd+row('Sages',a.sages,b.sages,'2 points each. You have '+pa.el+', Farid '+pb.el+'.')+row('Advisors',a.advisors,b.advisors,'1 each, plus 10 for every rival with fewer. You have '+pa.vz+', Farid '+pb.vz+'.')},
   {t:'Djinns and goods',h:hd+row('Djinns',a.djinns,b.djinns,'You hold '+pa.dj.length+', Farid '+pb.dj.length+'; each scores its own points.')+row('Goods',a.goods,b.goods,'Sets of different kinds score 1, 3, 7, 13. Your goods: '+pa.res.filter(r=>r!=='fakir').length+' cards in '+gs({res:pa.res.filter(r=>r!=='fakir')})+' kinds.')},
   {t:'The count',h:hd+row('Total',a.total,b.total,esc(plName(G.winText)))}];
  const later=Object.keys(LORE.coach).filter(id=>!COACH.seen[id]).slice(0,6).map(id=>'<li>'+esc(LORE.coach[id].later)+'</li>').concat(['Everything else is in How to play.']).map(x=>x.startsWith('<li>')?x:'<li>'+esc(x)+'</li>').join('');
  {const m=(x,y,t)=>({t,h:x.h+y.h.replace(hd,'')});pages.splice(0,4,m(pages[0],pages[1],'Land and coins'),m(pages[2],pages[3],'People, djinns and goods'))}   // 3 pages, not 5
  if(typeof GD!=='undefined'&&GD.i>0){pages[pages.length-1].last=1;return pages}   // the guided game taught every rule: no "later" list
  pages.push({t:"Things you'll meet later",h:'<ul class="ce-l">'+later+'</ul>',last:1});return pages}
function coachFinal(){COACH.done=true;coachHide();if(UI.modal)UI.modal=null;let o=document.getElementById('coachend');
  if(!o){const pages=coachPages();COACH.pages=pages;COACH.pg=0;o=document.createElement('div');o.id='coachend';o.className='coachend';o.setAttribute('data-help','');document.body.appendChild(o);
    o.addEventListener('click',e=>{const b=e.target.closest('[data-ce]');if(!b)return;const k=b.dataset.ce;
      if(k==='next'){COACH.pg++;coachDraw()}else if(k==='back'){COACH.pg--;coachDraw()}
      else{try{GXT.markDone(TUT_GAME)}catch(x){}const story=UI.coachStory;tutLeave();if(k==='chapter'&&window.CAMPAIGN&&typeof GXC!=='undefined')GXC.play(window.CAMPAIGN.chapters[0].id);else if(k==='story'&&typeof GXC!=='undefined')GXC.open();else{UI.modal='start';render()}}});coachDraw()}}
function coachDraw(){const o=document.getElementById('coachend');if(!o||!COACH.pages)return;const P_=COACH.pages,i=Math.max(0,Math.min(P_.length-1,COACH.pg)),pg=P_[i];
  const voice=i===0?'<p class="ce-v"><i>'+LORE.guide.face+'</i><span><b>Hadiya</b> The game is over, child. Let us count it together.</span></p>':'';
  const btns=pg.last?(UI.coachStory&&window.CAMPAIGN?'<button class="btn go big" data-ce="chapter">Start chapter 1</button>':'<button class="btn go big" data-ce="play">Play a real game</button>')+(window.CAMPAIGN&&!UI.coachStory?'<button class="btn big" data-ce="story">Story mode</button>':''):'<button class="btn go big" data-ce="next">Next</button>';
  o.innerHTML='<div class="ce-box"><h2>'+esc(pg.t)+'</h2>'+voice+pg.h+'<div class="ce-a">'+(i>0?'<button class="btn" data-ce="back">Back</button>':'')+btns+'</div><small class="ce-d">'+(i+1)+' / '+P_.length+'</small></div>'}
(function(){const o=render;render=function(){o.apply(this,arguments);try{coachAfter()}catch(e){console.error(e)}}})();
setInterval(()=>{try{if(G&&G.coach&&!G.over)coachAfter()}catch(e){}},700);

// for the QA bot's coached driver: running while the coached game is on, explained = rule ids told so far, done once the final count was reached
window.GXCOACH={get running(){return !!(G&&G.coach&&!G.over)},get explained(){return Object.keys(COACH.seen)},get done(){return !!COACH.done}};

// QA hook: the shell tutor API (GXT) also reports the coached game, so the feel audit finds, starts and plays Learn
try{if(typeof GXT!=='undefined'){const r=GXT.running&&GXT.running.bind(GXT),s=GXT.state&&GXT.state.bind(GXT);GXT.running=()=>!!(r&&r())||!!(G&&G.coach&&!G.over);GXT.state=()=>{const x=s?s():null;return x&&x.active?x:(G&&G.coach&&!G.over?{active:true,phase:'end',coached:true}:x)}}}catch(e){}
