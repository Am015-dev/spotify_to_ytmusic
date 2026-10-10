// ---------- interface: render() reads G and UI only; every click becomes a move through uiAct -> gameAct ----------
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function mySeat(){if(!G)return 0;if(G.mode==='hot'){const s=sideToAct();if(s>=0&&P(s).human)return s;return UI.lastSeat>=0?UI.lastSeat:G.active}if(G.mode==='ai')return -1;if(G.mode==='net')return typeof NET!=='undefined'?NET.mySeat:-1;return 0}
const viewSeat=()=>{const s=mySeat();return s<0?(G.mode==='net'?-1:G.active):s};
const PCOL=['#e03131','#1c7ed6','#2f9e44','#f08c00','#7048e8','#d6336c'];
const PSHAPE=['●','■','▲','◆','★','⬟'];
const ptok=i=>dkPortrait(P(i)&&P(i).nm,'ptok ptokp')||`<span class="ptok" style="--c:${PCOL[i]}" aria-hidden="true">${PSHAPE[i]}</span>`;
// raw emoji become the SVG icon set (text nodes only, never inside a tag or attribute)
const EMO={'💡':'hint','⚠':'warn','☁':'cloud','⚔':'sword','💰':'coin','✋':'hand','💀':'skull','🏆':'trophy','✨':'spark','🎉':'party','🎒':'bag','♂':'male','♀':'female','⏸':'pause','🐢':'slow','⏩':'fast','📜':'scroll','📖':'book','🤖':'bot','💬':'chat','✓':'check','✗':'cross','🧬':'race','🎓':'cls','🪖':'helm','👢':'boot','🛡':'shield','🗡':'sword','✦':'spark','⇆':'swap','🚪':'door','🏃':'run','🙋':'help','📉':'down','💥':'star','🔊':'sound','🔇':'mute','🎵':'music','▶':'play'};
const EMORE=new RegExp('('+Object.keys(EMO).join('|')+')\uFE0F?','gu');
function emo(h){if(typeof ic!=='function'||!h)return h;return h.replace(/(<[^>]*>)|([^<]+)/g,(m,tag,txt)=>tag?tag:txt.replace(EMORE,(x,e)=>ic(EMO[e])))}
UI.speed=1;try{UI.hints=false;UI.speed=+(localStorage.getItem('dkd_speed4')||1)}catch(e){}
const SPEEDN=v=>emo(v<1?'🐢 slow':v>1?'⏩ fast':'▶ normal');
function refresh(){if(G&&G.mode==='net'&&typeof netWindow==='function')netWindow();if(G&&!G.winner)autoPass();if(G&&!G.winner){try{if(G.mode!=='net')localStorage.setItem(SAVE,JSON.stringify(G))}catch(e){}}else{try{localStorage.removeItem(SAVE)}catch(e){}}
  render();schedule();sounds();if(G&&G.mode==='net'&&typeof netPush==='function')netPush()}
let lastFx=0;function sounds(){if(typeof sfx!=='function')return;for(const f of UI.fx){if(f.at<=lastFx)continue;lastFx=f.at;const m={monster:'roar',door:'door',win:'win',bad:'bad',death:'death',curse:'curse',lvl:'level',roll:'dice',shot:'whoosh',turn:'turn'}[f.t];if(m)sfx(m)}}
// ---- one card ----
function kindLabel(c){if(c.t==='monster')return 'monster'+(c.undead?' · undead':'');if(c.t==='item')return (c.slot==='head'?'headgear':c.slot==='foot'?'footgear':c.slot==='armor'?'armor':c.hands===2?'2 hands':c.hands===1?'1 hand':'item')+(c.big?' · big':'');if(c.t==='oneshot')return 'one-shot';if(c.t==='enh')return 'monster boost';if(c.t==='level')return 'level up';return c.t}
// conditional bonuses read "+2 (Elves)", not a bare "+2"
const TRAITS={elf:'Elves',dwarf:'Dwarves',halfling:'Halflings',human:'Humans',warrior:'Warriors',wizard:'Wizards',thief:'Thieves',cleric:'Clerics',female:'women',male:'men'};
function tagOf(c){if(c.t==='monster')return `Lv ${c.lvl}`;if(c.t==='enh')return `${c.b>0?'+':''}${c.b}`;if(c.t!=='item'&&c.t!=='oneshot')return '';
  if(c.sp==='elfwater')return `+${c.b} <small>(Elves)</small>`;if(!c.b)return '';if(c.elfb)return `+${c.b} <small>(+${c.elfb} Elf)</small>`;
  const rq=[].concat(c.req||[]).filter(r=>r[0]!=='!');if(rq.length)return `+${c.b} <small>(${rq.map(r=>TRAITS[r]||r).join(', ')})</small>`;
  const nq=[].concat(c.req||[]).filter(r=>r[0]==='!');if(nq.length)return `+${c.b} <small>(not ${nq.map(r=>TRAITS[r.slice(1)]||r).join(', ')})</small>`;return `+${c.b}`}
function whenText(c){switch(c.t){
  case 'race':case 'class':return 'On your own turn, outside a fight (or during setup). It replaces the one you have.';
  case 'item':return 'On your own turn, outside a fight. It goes on automatically if you can use it.'+(c.big?' Big: you can carry only one Big item (Dwarves and a Porter can carry more).':'');
  case 'monster':return 'After an empty door on your turn: fight it from your hand (“look for trouble”).'+(c.undead?' Undead can also join any fight against undead.':'');
  case 'curse':return 'Any time, on anyone, even on someone else’s turn. It hits at once.';
  case 'level':return (c.sp==='whine'?'Only if you are not the highest level. ':c.sp==='after'?'Only right after you win a fight. ':c.sp==='killhire'?'Only while someone has a Porter. ':'')+'Any time, on anyone, but never for the winning level.';
  case 'enh':return 'During any fight: put it on a monster.';
  case 'oneshot':return c.sp==='dowse'?'On your own turn, outside a fight.':c.sp==='elfwater'?'During a fight with an Elf in it.':c.sp==='dbl'?'In your own fight, when nobody helps.':'During any fight, yours or someone else’s.';
  case 'special':return {half:'On your turn, once you have a race.',super:'On your turn, once you have a class.',wander:'During any fight, together with a monster from your hand.',cheat:'On your turn, on an item you can’t normally wear.',illusion:'During any fight, with a monster from your hand.',lunch:'During any fight.',borrow:'In your own fight, when you are losing.',hire:'Any time.',divine:'Any time.',steal:'Any time, on a rival above level 1.'}[c.sp]||'See the card text.'}
  return ''}
function gemOf(c){if(c.t==='monster')return `${c.lvl}<small>LV</small>`;if(c.t==='enh')return c.b?`${c.b>0?'+':'−'}${Math.abs(c.b)}`:'';if((c.t==='item'||c.t==='oneshot')&&c.b)return `+${c.b}`;return ''}
function condOf(c){const m=tagOf(c).match(/<small>\((.*)\)<\/small>/);return m?m[1]:''}
function cardHTML(id,o){o=o||{};const c=cd(id);const cls=['card',c.d==='door'?'door':'tr','t-'+c.t,o.size||'',o.cls||'',o.badge?'sug':''].join(' ');
  const tag=tagOf(c),gem=gemOf(c),cond=condOf(c);
  const gold=c.g?`${ic('coin')}${c.g}`:c.t==='monster'?`${ic('chest')}${c.tr}${(c.lv||1)>1?' · '+c.lv+' lv':''}`:'';
  const tip=o.notitle?'':` title="${esc(c.n)} (${kindLabel(c)}${tag?' '+tag.replace(/<[^>]+>/g,''):''}): ${esc(c.x||'')}${c.badt?' Bad Stuff: '+esc(c.badt):''} | When: ${esc(whenText(c))}"`;
  const flip=/\bflip\b/.test(o.cls||'');
  return `<button class="${cls}" data-card="${id}" ${o.attr||''}${tip} aria-label="${esc(c.n)}: ${esc(c.x||'')}${o.badge?' ('+o.badge+')':''}${o.risk?' (warning: '+esc(o.risk)+')':''}"><i class="hit" aria-hidden="true"></i>${o.badge?`<span class="sugb">💡 ${o.badge}</span>`:o.risk?`<span class="sugb risk">⚠ you’d lose</span>`:''}<span class="cn">${esc(c.n)}</span><span class="aw">${svgArt(c,c.k)}${gem?`<span class="tag">${gem}</span>`:''}${gold?`<span class="gold">${gold}</span>`:''}</span><span class="kind">${kindLabel(c)}${cond?' · '+cond:''}</span>${c.x?`<span class="cx">${esc(o.notitle?c.x:c.x.split(/\s+/).slice(0,7).join(' ')+(c.x.split(/\s+/).length>7?'…':''))}</span>`:''}${flip&&typeof cardBack==='function'?`<span class="cback">${cardBack(c.d)}</span>`:''}</button>`}
// ---- panels ----
// key art behind the title and end screens (CSS reads the class; media/ files are deployed beside the page)
function modalArt(k){const m=$('#modal');if(!m)return;['title','win','lose'].forEach(n=>m.classList.toggle('art-'+n,k===n))}
function render(){const root=$('#app');if(!root)return;syncMenu();if(typeof netRender==='function')netRender();
  if(!G){if(typeof musicSync==='function')musicSync();setHTML(root,'');setHTML($('#side'),'<div id="prompt"><p>Set up a game to start.</p></div>');$('#docktitle').textContent='Doorkick Dungeon';setHTML($('#modal'),startHTML());$('#modal').hidden=false;modalArt('title');if(GX.open&&GX.open!=='dkRules'&&GX.open!=='dkNet')GX.close();return}
  scanLog();if(typeof musicSync==='function')musicSync();const me=viewSeat();sinceTrack(me);const s=sideToAct();if(UI.sell&&!(me>=0&&validMoves(me).some(m=>m.act==='sell')))UI.sell=null;
  if(UI.menu&&UI.menu.ask&&!(me>=0&&validMoves(me).some(m=>m.act==='ask')))UI.menu=null;
  // hot-seat: hide the hand while the device passes between human players
  if(G.mode==='hot'&&s>=0&&P(s).human&&UI.lastSeat!==s&&!G.winner){UI.pass=s}
  const hs=(root.querySelector('.hand')||{}).scrollLeft||0,os=(root.querySelector('.opps')||{}).scrollLeft||0,gs=(root.querySelector('.gear')||{}).scrollLeft||0;
  UI.arRes=92;const ar=arenaHTML();const snapS=typeof GFX!=='undefined'?GFX.snap(root):null;
  setHTML(root,`<div class="tbl" data-board>${oppsHTML(me)}<div class="table"><div class="felt paper">${pilesHTML()}<div class="arena" aria-label="The table" style="--res:${UI.arRes}px">${ar}</div>${pileR()}</div></div>${mineHTML(me)}</div>`);
  if(typeof GFX!=='undefined'){GFX.after(root,snapS);GFX.clash(root)}const hd=root.querySelector('.hand');if(hd)hd.scrollLeft=hs;const od=root.querySelector('.opps');if(od)od.scrollLeft=os;const gd=root.querySelector('.gear');if(gd)gd.scrollLeft=gs;
  const sd=$('#side'),st=sd.scrollTop;setHTML(sd,promptHTML(me)+recentHTML());sd.scrollTop=st;
  $('#docktitle').textContent=dockTitle(me);
  setHTML($('#dkLogBody'),logHTML());setHTML($('#dkOppBody'),oppsFullHTML(me));
  // card details / card actions: a closable popup
  const cardOn=(UI.menu&&UI.menu.card!=null)||UI.zoom!=null;
  if(cardOn&&UI.pass==null&&!G.winner){const cid=UI.menu&&UI.menu.card!=null?UI.menu.card:UI.zoom;setHTML($('#dkCardBody'),UI.menu&&UI.menu.card!=null?menuHTML(me):zoomHTML());const t=$('#dkCard h2');if(t)t.textContent=cname(cid);if(GX.open!=='dkCard')GX.show('dkCard')}
  else{if(cardOn){UI.menu=null;UI.zoom=null}if(GX.open==='dkCard')GX.close()}
  let m='';if(UI.pass!=null&&!G.winner)m=passHTML(UI.pass);else if(G.winner)m=endHTML();if(G.mode==='net'&&typeof netModalHTML==='function')m=netModalHTML()||m;
  if(m&&GX.open)GX.close();
  setHTML($('#modal'),m);$('#modal').hidden=!m;modalArt(G.winner&&m?(musicWant()[0]==='victory'?'win':'lose'):'');$('#modal').classList.toggle('opaque',UI.pass!=null&&!G.winner);
  // a human decision is pending: make sure the dock is open (once per new decision)
  const need=me>=0&&s===me&&P(me).human&&!G.winner?JSON.stringify([G.turn,G.phase,G.q&&G.q.kind,G.cb&&G.cb.stage]):'';if(need&&need!==UI.needKey)GX.showDock();UI.needKey=need;
  $('#live').textContent=UI.toast&&UI.toast.until>Date.now()?'Ouch! '+UI.toast.t:(G.log[0]?G.log[0].t:'');
  // expire toasts and barks
  const ex=[UI.toast&&UI.toast.until].concat(Object.values(UI.bark||{}).map(b=>b.until)).filter(t=>t&&t>Date.now());clearTimeout(UI.tt);if(ex.length)UI.tt=setTimeout(expireFx,Math.min(...ex)-Date.now()+60)}
// expire a toast or a bark without re-rendering the whole page (buttons stay where they are)
function expireFx(){if(!G)return;const now=Date.now();if(UI.toast&&UI.toast.until<=now){document.querySelectorAll('#prompt .toast').forEach(e=>e.remove())}
  const o=$('#app .opps');if(o){const sl=o.scrollLeft;const t=document.createElement('div');t.innerHTML=oppsHTML(viewSeat());o.replaceWith(t.firstElementChild);const n=$('#app .opps');if(n)n.scrollLeft=sl}
  const ex=[UI.toast&&UI.toast.until].concat(Object.values(UI.bark||{}).map(b=>b.until)).filter(t=>t&&t>now);if(ex.length)UI.tt=setTimeout(expireFx,Math.min(...ex)-now+60)}
// only touch the DOM when the markup really changed (a click in flight keeps its button)
function setHTML(el,h){if(!el)return;h=emo(h);if(el._h===h)return;el._h=h;el.innerHTML=h}
function syncMenu(){const b=$('#dkMenuBody');if(!b)return;const so=typeof SND!=='undefined'?SND.on:true,mu=typeof SND!=='undefined'?SND.music:true;const sp=UI.speed<1?'slow':UI.speed>1?'fast':'normal';
  b.innerHTML=`<div class="menu">${typeof tutBtn==='function'?tutBtn('btn'):''}<button class="btn" data-a="snd">${ic(so?'sound':'mute')} Sound effects: ${so?'on':'off'}</button><button class="btn" data-a="mus">${ic('music')} Music: ${mu?'on':'off'}</button><button class="btn" data-a="music">${ic('music')} Pick the songs…</button><button class="btn" data-a="speed">${ic(sp)} Computer speed: ${sp}</button><button class="btn" data-a="pause">${ic(UI.pause?'play':'pause')} ${UI.pause?'Resume':'Pause'} the computer</button>${typeof GXH!=='undefined'?GXH.settingsHTML({rowClass:'mrow',btnClass:'btn'}):''}<button class="btn" data-a="gfx">${ic('gem')} Graphics: ${typeof GFX!=='undefined'?GFX.name():'High'}</button>${typeof PerfHUD!=='undefined'?PerfHUD.buttonsHTML('btn'):''}<button class="btn primary" data-a="new">New game</button></div>`}
function syncGfxBtn(){const g=$('#gfxbtn');if(g&&typeof GFX!=='undefined')g.innerHTML=`${ic('gem')} ${GFX.name()}`;syncMenu()}
function dockTitle(me){const s=sideToAct();if(G.winner)return 'Game over';if(s<0)return 'Turn '+G.turn;const p=P(s);return (s===me&&p.human?'Your move':p.human?p.nm+'’s move':p.nm+' is thinking…')+' · turn '+G.turn}
function recentHTML(){if(!G||!G.log.length)return '';const o=G.out&&G.out.turn===G.turn&&!G.cb?G.out:null;const bk=(UI.barkLog||[]).filter(b=>G.ln-b.n<12).slice(0,2);
  return `<div class="recent"><div class="rl"><h3>Just happened</h3><button class="btn" data-gx="dkLog" style="min-height:40px;padding:2px 10px;font-size:.85rem">📜 Diary</button></div><ol>${o?`<li class="story">📖 ${narrate(o)}</li>`:''}${bk.map(b=>`<li class="quote" style="border-left-color:${PCOL[b.s]}"><b>${esc(P(b.s).nm)}:</b> “${esc(b.t)}”</li>`).join('')}${G.log.slice(0,2).map(l=>`<li${l.s>=0?` style="border-left-color:${PCOL[l.s]}"`:''}>${esc(l.t)}</li>`).join('')}</ol></div>`}
function oppsHTML(me){const n=G.pl.length-(me>=0?1:0);return `<div class="opps n${n}" aria-label="Rivals">${G.pl.filter(p=>p.i!==me).map((p,k,a)=>{const act=p.i===G.active;const rv=me>=0&&G.mode!=='ai'?(((G.rv||{})[me]||{})[p.i]||null):null;const q=a.length>1?(k/(a.length-1))*2-1:0;
  return `<button class="opp seat paper ${act?'active':''}${p.dead?' dead':''}" data-opp="${p.i}" style="--c:${PCOL[p.i]};--q:${q.toFixed(2)}" title="${esc(heroTitle(p))}: level ${p.lvl}, strength ${pStr(p)}, ${p.hand.length} cards in hand, ${p.eq.length} items in play" aria-label="${esc(p.nm)}, level ${p.lvl}, strength ${pStr(p)}, ${p.hand.length} cards in hand, ${p.eq.length} items${act?', their turn':''}${rv&&rv.curse?`, has cursed you ${rv.curse} times`:''}. Hold for details."><span class="sav">${typeof bfAv==='function'?bfAv(p,'savi'):''}<b class="slv" aria-hidden="true">${p.lvl}</b>${p.dead?'<i class="sdead" aria-hidden="true">💀</i>':''}</span><span class="snm">${esc(p.nm.split(/[ ,]/)[0])}</span><span class="sbd" aria-hidden="true"><span class="sw">⚔${pStr(p)}</span><span class="sg">🪖${p.eq.length}</span>${p.curse.length?`<span class="sc">☁${p.curse.length}</span>`:''}</span></button>`}).join('')}</div>`}
// phone only (CSS shows it instead of the mini cards): one readable row per card, tap = the big card
function phList(p){const ids=p.race.concat(p.cls).concat(p.half!=null?[p.half]:[]).concat(p.sup!=null?[p.sup]:[]).concat(p.hire!=null?[p.hire]:[]).map(id=>({id,on:true})).concat(p.eq.map(e=>({id:e.id,on:e.on})));
  return `<ul class="phlist">${ids.map(x=>{const c=cd(x.id);const t=tagOf(c).replace(/<[^>]+>/g,'');return `<li><button class="gchip ${c.d==='door'?'door':'tr'} ${x.on?'':'eqoff'}" data-card="${x.id}" aria-label="${esc(c.n)}: ${esc(c.x||'')}${x.on?'':' (carried, not worn)'}"><b>${esc(c.n)}</b>${t?' '+esc(t):''}${x.on?'':' (not worn)'}</button></li>`}).join('')||'<li class="small muted">No items yet.</li>'}</ul>`}
function oppsFullHTML(me){const ps=G.pl.filter(p=>p.i!==me);const f=UI.oppView;ps.sort((a,b)=>(b.i===f)-(a.i===f));if(!ps.length)return '<p class="muted">No rivals.</p>';
  return ps.map(p=>{const act=p.i===G.active;return `<div class="oppfull paper ${act?'active':''}"><span class="lv" aria-label="level">${p.lvl}</span>
   <div class="nm">${ptok(p.i)} ${esc(heroTitle(p))} ${p.human?'':'<span class="small muted">(computer'+(p.lv!=='normal'?' · '+p.lv:'')+')</span>'}${act?' <span class="chip" style="background:#ffd43b;color:#2b2233">their turn</span>':''}</div>
   <div class="small">⚔ strength ${pStr(p)} (level ${p.lvl} + items ${itemBonus(p)}) · ${p.sex==='m'?'♂':'♀'} · ✋ ${p.hand.length} card${p.hand.length===1?'':'s'} in hand (secret)${p.dead?' · 💀 dead':''}</div>${PERSONA[p.nm]?`<div class="small muted">${esc(PERSONA[p.nm][1])}.</div>`:''}${(()=>{const me=viewSeat();const rv=me>=0&&me!==p.i&&G.mode!=='ai'?(((G.rv||{})[me]||{})[p.i]):null;return rv&&(rv.curse+rv.boost+rv.stab)?`<div class="small warn">Against you so far: ${rv.curse} curse${plural(rv.curse)}, ${rv.boost} monster boost${plural(rv.boost)}, ${rv.stab} backstab${plural(rv.stab)}.${rv.curse>=2?' Payback?':''}</div>`:''})()}
   <div class="chips">${races(p).concat(classes(p)).map(r=>`<span class="chip">${esc(TRAITNAME[r]||r)}</span>`).join('')}${p.curse.map(id=>`<span class="chip" style="background:#e9ecef;color:#2b2233">☁ ${esc(cname(id))}</span>`).join('')}</div>
   <div class="tableau">${p.race.concat(p.cls).concat(p.half!=null?[p.half]:[]).concat(p.sup!=null?[p.sup]:[]).concat(p.hire!=null?[p.hire]:[]).map(id=>cardHTML(id,{size:'xs'})).join('')}${p.eq.map(e=>cardHTML(e.id,{size:'xs',cls:e.on?'':'eqoff'})).join('')||'<span class="small muted">No items yet.</span>'}</div>${phList(p)}</div>`}).join('')}
function deckHTML(kind,n){const d=Math.min(10,Math.ceil(n/7));const sh=[];for(let i=1;i<=d;i++)sh.push(`${(i*.55).toFixed(1)}px ${(i*1.25).toFixed(1)}px 0 ${i===d?'#1a0d06':i%2?'#e9dab4':'#bfa878'}`);
  const door=kind==='door';return `<div class="stack ${door?'door':'treas'}" aria-label="${door?'Door':'Treasure'} deck" style="--deck:${sh.join(',')||'0 0 0 transparent'}${n?'':';opacity:.35'}"><span class="back">${typeof cardBack==='function'?cardBack(door?'door':'tr'):''}</span><span class="dn">${door?'DOOR':'TREASURE'}</span><span class="n">${n}</span></div>`}
function pilesHTML(){const dk=G.door.length;const ld=G.dd[G.dd.length-1];
  return `<div class="pile pl">${deckHTML('door',dk)}<span class="lbl">discard: ${G.dd.length}</span>${ld!=null?cardHTML(ld,{size:'xs'}):''}</div>`}
function pileR(){const tk=G.tr.length,lt=G.td[G.td.length-1];return `<div class="pile pr">${deckHTML('tr',tk)}<span class="lbl">discard: ${G.td.length}</span>${lt!=null?cardHTML(lt,{size:'xs'}):''}</div>`}
function arenaHTML(){const cb=G.cb;
  if(!cb){const o=G.out;if(o&&o.turn===G.turn&&['after','post','charity'].includes(G.phase)){const oh=outcomeHead(o);UI.arRes=150;const k=G.kicked!=null&&cd(G.kicked).t==='monster'?G.kicked:null;
      return `<div class="outcome ${oh.cls} ${isMe(o.who)&&o.won?animOnce(o.who,'pop'):''}"><div class="oh">${oh.h}</div><div class="os">${oh.sub}</div><div class="story">${narrate(o)}</div></div>${k!=null?`<div class="row">${cardHTML(k,{size:'xs'})}</div>`:''}${rollHTML()}`}
    if(G.kicked!=null&&G.phase!=='main'){const c=cd(G.kicked);UI.arRes=110;return `<div class="empty">${esc(curPl().nm)} kicked open the door and found…</div><div class="row">${cardHTML(G.kicked,{cls:animOnce(G.kicked,'flip')})}</div><div class="empty small">${c.t==='curse'?'A curse! It hit '+(isMe(G.active)?'you':esc(curPl().nm))+' at once.':'It went into '+(isMe(G.active)?'your':esc(curPl().nm)+'’s')+' hand.'}</div>${rollHTML()}`}
    return `<div class="empty">${G.phase==='setup'?'Set up: play cards from hand.':G.phase==='window'?esc(curPl().nm)+' is about to kick.':`${isMe(G.active)?'You stand':esc(curPl().nm)+' stands'} before a closed door…`}</div>${rollHTML()}`}
  UI.arRes+=34;const a=sideStr(cb),b=monStr(cb),win=winning(cb);
  const f=P(cb.who),h=cb.help>=0?P(cb.help):null;const chips=[];
  cb.killed.forEach(k=>chips.push(`<span class="chip">${esc(k.def.n)}${k.kill?' (killed)':' (gone, treasure kept)'}</span>`));
  if(cb.mons.some(m=>m.enh.length))UI.arRes+=46;
  cb.os.forEach(o=>chips.push(`<span class="chip">${esc(cname(o.id))} (${o.side==='p'?'heroes':'monsters'})</span>`));
  const wt=winThreat(cb);if(wt)chips.unshift(`<span class="chip wchip">${isMe(wt.who)?'🏆 This fight wins you the game!':'⚠ This fight wins '+esc(f.nm)+' the game!'}</span>`);
  const hn=`${nmY(f.i)}${h?' + '+nmY(h.i):''}`;const en=animOnce(cb.who+'-'+(cb.mons[0]?cb.mons[0].id:'x'),'enter');
  return `<div class="vs clash" data-k="${G.turn}:${cb.who}" data-a="${a}" data-b="${b}" role="group" aria-label="${hn}: ${a} versus the monsters: ${b}"><span class="score hero ${win?'win':'lose'} ${en}"><span class="hsav">${typeof bfAv==='function'?bfAv(f,'hsavi')+(h?bfAv(h,'hsavi h2'):''):''}</span><b class="num">${a}</b><span class="sl">${hn}</span></span><span class="vsx ${en}" aria-hidden="true">${ic('swords')}</span><span class="score mons ${win?'lose':'win'} ${en}"><span class="sl">Monsters</span><b class="num">${b}</b></span></div>
   <div class="row mons" style="--n:${cb.mons.length}">${cb.mons.map((m,j)=>`<div class="mon">${cardHTML(m.like!=null?m.like:m.id,{cls:animOnce(m.like!=null?m.like:m.id,'fly')})}<span class="small mstr">${m.like!=null?'the date · ':''}strength ${mStr(m,cb)}</span>${m.enh.length?`<div class="row" style="gap:4px">${m.enh.map(e=>{const c=cd(e);return `<button class="gchip door" data-card="${e}" aria-label="${esc(c.n)}: ${esc(c.x||'')}">${esc(c.n)} <b>${c.b>0?'+':''}${c.b}</b></button>`}).join('')}</div>`:''}</div>`).join('')}</div>
   ${chips.length?(UI.arRes+=30,`<div class="row small" style="gap:4px">${chips.join('')}</div>`):''}${rollHTML()}${fightBtns(cb)}`}
function runShort(cb,me){try{const o=runOdds(P(me),cb);return o.all===0?' (no chance)':o.all===1?' (sure)':' '+pct(o.all)}catch(e){return ''}}
// the fight's own buttons sit on the fight: Fight!, Run, Get help (the dock no longer repeats them)
function fightBtns(cb){const me=viewSeat();if(me<0||!P(me).human||sideToAct()!==me||G.q||G.phase!=='combat'||cb.stage!=='act')return '';const vm=validMoves(me);const by=a=>vm.find(m=>m.act===a);
  const co=coach(me);const recK=UI.hints&&co.rec?mvKey(co.rec):null;const win=winning(cb);const mv=(m,cl,t)=>`<button class="btn ${cl}${recK&&mvKey(m)===recK?' rec':''}" data-mv='${esc(JSON.stringify(m))}'>${t}</button>`;
  const askRec=UI.hints&&co.rec&&co.rec.act==='ask';
  UI.arRes+=document.documentElement.classList.contains('ph')?56:110;return `<div class="fbtns">${by('fight')?mv({act:'fight'},'primary fightb'+(win?' pulse':''),'⚔ Fight!'):''}${by('run')?mv({act:'run'},'runb'+(co.rec&&co.rec.act==='run'?' primary':''),'🏃 Run'+runShort(cb,me)):''}${vm.some(m=>m.act==='ask')?`<button class="btn helpb${askRec?' rec primary':''}" data-a="askmenu">🙋 Help</button>`:''}</div>`}
// entry animations play once per card per turn, not on every re-render (opening a popup re-renders the table)
function animOnce(id,c){const k=c+id+':'+G.turn;UI.anim1=UI.anim1||{};if(UI.anim1[k])return '';UI.anim1[k]=1;return c}
function fightNote(cb){const f=P(cb.who),h=cb.help>=0?P(cb.help):null,win=winning(cb);return `<div class="fightnote">${nmY(f.i)} ${win?'is winning.':'is losing.'}${fighters(cb).some(x=>isCls(x,'warrior'))?' A Warrior is fighting, so a tie counts as a win.':''}${special(cb,'lvlonly')?' <b class="warn">Levels only in this fight!</b>':''}${special(cb,'bonusonly')?' <b class="warn">Bonuses only: levels don’t count!</b>':''} Strength is level + worn items + one-shots${h?' + the helper':''}.</div>`}
function rollHTML(){const r=G.lastRoll;if(!r)return '';UI.rollAt=UI.rollAt||{};const rk=G.gid+':'+r.id;if(UI.rollAt[rk]==null)UI.rollAt[rk]=G.turn;
  // only this turn's roll, and inside a fight only a roll made in this fight (no stale dice)
  if(UI.rollAt[rk]!==G.turn||(G.cb&&!G.cb.runs))return '';const faces=[r.v,1,6,3,4,2];const PIP={1:[4],2:[0,8],3:[0,4,8],4:[0,2,6,8],5:[0,2,4,6,8],6:[0,2,3,5,6,8]};const face=v=>[0,1,2,3,4,5,6,7,8].map(k=>PIP[v]&&PIP[v].includes(k)?'<b></b>':'<span></span>').join('');const tot=r.v+(r.mod||0);
  const anim=UI.rolled!==r.id;UI.rolled=r.id;UI.arRes+=46;return `<div class="rollbox" aria-label="Last roll"><div class="dwrap"><div class="die3 ${anim?'roll':''}">${faces.map(v=>`<i>${face(v)}</i>`).join('')}</div></div><span class="small">${nmY(r.who)} rolled ${r.v}${r.mod?` ${r.mod>0?'+':'−'} ${Math.abs(r.mod)} = ${tot}`:''}${r.what==='slugs'?'':`: ${r.ok?'✓ made it':'✗ failed'} (needed ${r.need}+)`}</span></div>`}
function gchipHTML(id,cls){const c=cd(id);const ic=c.t==='race'?'🧬':c.t==='class'?'🎓':c.t==='curse'?'☁':c.slot==='head'?'🪖':c.slot==='foot'?'👢':c.slot==='armor'?'🛡':c.hands?'🗡':c.t==='item'?'🎒':'✦';
  return `<button class="gchip ${c.d==='door'?'door':'tr'} ${c.t==='curse'?'curse ':''}${cls||''}" data-card="${id}" aria-label="${esc(c.n)}: ${esc(c.x||'')}${/eqoff/.test(cls||'')?' (carried, not worn)':''}"><span aria-hidden="true">${ic}</span>${esc(c.n)}${c.t==='item'&&c.b?` <b>+${c.b}</b>`:''}</button>`}
function mineHTML(me){if(me<0||!G.pl[me])return `<div class="mine paper box"><div class="empty">Watching the computer play. Press ⏸ to pause at any moment; tap a rival for their cards.</div></div>`;
  const p=P(me);const vm=myMoves(me);const playable=new Set(vm.filter(m=>m.card!==undefined).map(m=>m.card));const sellSet=UI.sell?new Set(UI.sell):null;const selc=id=>sellSet?(sellSet.has(id)?'sel ':sellable(p).includes(id)?'play ':'dim '):'';
  const co=p.human?coach(me):{};const sug=UI.hints&&co.card!=null?co.card:null;const badge=co.disc?(G.phase==='charity'&&charityTargets(p).length?'Suggested give-away':'Suggested discard'):'Suggested play';
  const gear=p.race.concat(p.cls).concat(p.half!=null?[p.half]:[]).concat(p.sup!=null?[p.sup]:[]).map(id=>gchipHTML(id,'')).join('')+(p.hire!=null?gchipHTML(p.hire,''):'')+p.eq.map(e=>gchipHTML(e.id,(e.on?'':'eqoff ')+(sellSet?selc(e.id):playable.has(e.id)?'play':'')+(sug===e.id?' sug':''))).join('')+p.curse.map(id=>gchipHTML(id,'')).join('');
  const lim=handLimit(p),over=p.hand.length-lim;
  return `<section class="mine paper" aria-label="You"><div class="top"><span class="who">${ptok(p.i)} ${esc(p.nm)}${G.mode!=='ai'?' <span class="you">(you)</span>':''} <span class="small muted">${p.sex==='m'?'♂':'♀'}${races(p).concat(classes(p)).map(r=>' · '+(TRAITNAME[r]||r)).join('')}</span></span>
    <span class="str">⚔ <b>${pStr(p)}</b> strength <span class="muted">(level ${p.lvl} + items ${itemBonus(p)}${p.sexPen?' − 5 next fight':''})</span> · ✋ ${p.hand.length} card${plural(p.hand.length)} <span class="${over>0?'warn':'muted'}">(limit ${lim}${over>0?`: give away ${over} at end of turn`:''})</span>${p.hire!=null?' · Porter':''}${p.dead?' · 💀 dead until next turn':''}</span><span class="swipe" aria-hidden="true">${p.hand.length>3?'⇆ swipe':''}</span><span class="lv"><small>Lv</small> ${p.lvl}</span></div>
    <div class="gear" aria-label="In play: tap to wear, take off or sell"><span class="gl">In play:</span>${gear||'<span class="slots" aria-hidden="true"><i>🪖</i><i>🛡</i><i>🗡</i><i>👢</i></span><span class="small muted nogear">nothing yet: items you play from your hand appear here.</span>'}</div>
    <div class="hand${p.hand.length>3?' many':''}" aria-label="Your hand, ${p.hand.length} cards${p.hand.length>3?', scroll sideways for more':''}">${p.hand.map((id,i)=>{const n=p.hand.length,q=i-(n-1)/2;const fan=`style="--rot:${Math.max(-6,Math.min(6,q*1.7)).toFixed(1)}deg;--arc:${Math.min(10,q*q*.9).toFixed(1)}px"`;if(sellSet)return cardHTML(id,{cls:selc(id),attr:fan});const pl=playable.has(id);const rk=pl&&UI.hints?riskyCard(me,id):'';
      return cardHTML(id,{cls:(pl?(rk?'play risky ':'play '):''),badge:sug===id?badge:'',risk:rk,attr:fan})}).join('')||'<span class="small muted">No cards.</span>'}</div></section>`}
function sellBar(p){const ids=UI.sell;const v=sellValue(p,ids);const lv=Math.min(R.WIN-1-p.lvl,Math.floor(v/R.SELL));return `<div class="tip sellbar"><b>Sell:</b> ${ids.length} card${ids.length===1?'':'s'}, ${v} gold${isRace(p,'halfling')&&!p.halfT?' (Halfling x2)':''}. ${v>=R.SELL?`Buys ${lv} level${lv===1?'':'s'}.`:`Need ${R.SELL}.`}<div class="acts"><button class="btn primary" data-mv='${esc(JSON.stringify({act:'sell',cards:ids.join(',')}))}' ${v>=R.SELL?'':'disabled'}>Sell</button><button class="btn" data-a="sellx">Cancel</button></div></div>`}
function myMoves(me){if(!G||me<0)return[];if(!P(me).human)return[];return validMoves(me)}
const STEPS=[['main','Get ready'],['kick','Kick the door'],['combat','Fight or flee'],['after','Trouble or loot'],['post','Tidy up'],['charity','Charity']];
function stepIdx(){const ph=G.phase;return ph==='setup'||ph==='window'||ph==='main'?0:ph==='combat'?2:ph==='after'?3:ph==='post'?4:ph==='charity'?5:0}
function orderHTML(me){const n=G.pl.length;const f=G.first!=null?G.first:0;const seats=[];for(let j=0;j<n;j++){const i=(f+j)%n;if(!P(i).gone)seats.push(i)}const round=Math.floor((G.turn-1)/Math.max(1,seats.length))+1;
  return `<div class="order" aria-label="Turn order, round ${round}"><span class="rd">Round ${round}</span>${seats.map(i=>`<span class="${i===G.active?'on':''}" style="--c:${PCOL[i]}">${i===G.active?'▶ ':''}${esc(P(i).nm)}${isMe(i)?' (you)':''}</span>`).join('<i aria-hidden="true">→</i>')}</div>`}
function hintBox(co,extra){return '';const L=[];if(co.why)L.push(`<div class="hl">💡 ${co.why}</div>`);(co.lines||[]).forEach(x=>L.push(`<div class="hx">${x}</div>`));(extra||[]).forEach(x=>x&&L.push(`<div class="hx">${x}</div>`));return L.length?`<div class="hint" aria-label="Hint">${L.join('')}</div>`:''}
function promptHTML(me){const s=sideToAct();const p=s>=0?P(s):null;const mine=me>=0&&s===me&&P(me).human;const vm=mine?validMoves(me):[];const si=stepIdx();
  let h=`<div id="prompt">${me>=0&&P(me)&&P(me).human?toastHTML():''}<div class="steps" aria-label="Turn step ${si+1} of ${STEPS.length}: ${STEPS[si][1]}">${STEPS.map((x,i)=>`<span class="${i===si?'on':i<si?'done':''}" title="${x[1]}">${i+1}${i===si?' '+x[1]:''}</span>`).join('')}</div>${G.phase!=='setup'?orderHTML(me):''}`;
  if(G.mode==='net'&&typeof netStatusHTML==='function')h+=netStatusHTML()+nwHTML(me);
  if(!p){return h+'</div>'}
  const warn=G.cb?winWarnHTML(me):'';h+=warn;
  h+=`<div class="who">${ptok(p.i)} ${esc(p.nm)}${mine?' · your move':''}</div>`;
  if(!mine){h+=`<p>${P(s).human?'Waiting for '+esc(p.nm)+'…':G.cb&&G.cb.who!==s&&G.cb.help!==s?esc(p.nm)+' decides whether to meddle in '+nmY(G.cb.who)+'’s fight…':esc(p.nm)+' is thinking…'}</p>${G.cb?fightNote(G.cb):''}</div>`;return h}
  const co=coach(me);const recK=UI.hints&&co.rec?mvKey(co.rec):null;
  const cb=G.cb;const by=a=>vm.filter(m=>m.act===a);const btn=(m,label,cl)=>`<button class="btn ${cl||''}${recK&&mvKey(m)===recK?' rec':''}" data-mv='${esc(JSON.stringify(m))}'>${label}</button>`;
  let say='',ol=[],tip='',acts='',extra=[];
  if(G.q){const q=G.q;
    if(q.kind==='help'){const f=P(q.from);say=`${esc(f.nm)} asks you to help against ${cb.mons.map(m=>esc(cname(m.id))).join(' and ')}, offering ${q.n} treasure${q.n===1?'':'s'}.`;tip=`With you: ${sideStr(cb)+pStr(P(me))} vs ${monStr(cb)}. If you lose, you both run away.`;acts=btn({act:'opt',opt:'yes'},'Help','good')+btn({act:'opt',opt:'no'},'Refuse')}
    if(q.kind==='rescue'){say='Caught! You can still get away.';ol=['Use an escape card, or take the Bad Stuff.'];acts=by('use').map(m=>btn(m,'Use '+esc(cname(m.card)),'good')).join('')+btn({act:'opt',opt:'no'},'Take the Bad Stuff','danger')}
    if(q.kind==='pick'){say=q.text||'Choose one.';acts=q.opts.map((v,i)=>v==='hand'?btn({act:'pick',opt:i},'A random card from their hand'):v==='lvl'?btn({act:'pick',opt:i},'Lose the levels'):typeof v==='number'&&document.documentElement.classList.contains('ph')?btn({act:'pick',opt:i},esc(cname(v))+(cd(v).b?` ${cd(v).b>0?'+':''}${cd(v).b}`:''),'pickchip'):typeof v==='number'?`<button class="btn opt${recK&&mvKey({act:'pick',opt:i})===recK?' rec':''}" data-mv='${esc(JSON.stringify({act:'pick',opt:i}))}' style="padding:2px">${cardHTML(v,{size:'xs',attr:'tabindex="-1"',notitle:1}).replace('<button','<span').replace(' data-card=',' data-pcard=').replace(/<\/button>$/,'</span>')}</button>`:btn({act:'pick',opt:i},v==='hand'?'Discard my hand':esc(v))).join('');if(q.why==='handOr')acts=btn({act:'pick',opt:0},'Discard my whole hand')+btn({act:'pick',opt:1},'Lose '+q.cont.n+' levels')}
    if(q.kind==='ward'){say=`A curse is coming: ${esc(cname(q.curse))}. ${esc(cd(q.curse).x)}`;ol=['Cancel it with your '+esc(cname(q.ring))+'?'];acts=btn({act:'opt',opt:'yes'},'Cancel the curse','good')+btn({act:'opt',opt:'no'},'Let it happen')}
    if(q.kind==='glue'){const r=G.cb.runs[q.run];say=`${esc(P(r.w).nm)} got away from ${esc(mdef(runMon(r)).n)}. Make them roll again with your Sticky Paste?`;acts=btn({act:'opt',opt:'yes'},'Stick them!','danger')+btn({act:'opt',opt:'no'},'Let them go')}
    if(q.kind==='lawyer'){say='The lizards won’t sue a Thief. Swap 2 treasures from your hand for 2 new ones?';acts=btn({act:'opt',opt:'yes'},'Swap','good')+btn({act:'opt',opt:'no'},'Keep them')}
    if(q.kind==='fetch'){say=`Throw your ${esc(cname(q.card))} for the hound to escape automatically?`;acts=btn({act:'opt',opt:'yes'},'Throw it','good')+btn({act:'opt',opt:'no'},'Roll instead')}}
  else switch(G.phase){
  case 'setup':say='Set up your hero before the first door.';ol=['Play a race or class card from your hand (tap it).','Play items: they go on automatically if you can use them.','Press Ready when done.'];acts=autoBtn(me,co)+btn({act:'ready'},'Ready',autoN(me,co)?'':'primary pulse');break;
  case 'window':say=`Before ${esc(curPl().nm)} kicks the door, you may play a curse or a level-up (tap it in your hand).`;acts=btn({act:'pass'},`Let ${esc(curPl().nm)} go on`,'primary');break;
  case 'main':say='Get ready, then kick open the door.';ol=['Play races, classes and items; wear your best gear.','Sell items worth 1,000 gold for a level.','Kick open the door!'];acts=autoBtn(me,co)+btn({act:'kick'},'🚪 Kick open the door',autoN(me,co)?'':'primary pulse')+sellBtn(vm,me);tip=`Your combat strength is ${pStr(P(me))}.`+(by('resurrect').length?' As a Cleric you can instead take the top door discard: tap a card to discard for it.':'');break;
  case 'after':say='No monster behind the door.';ol=['Look for trouble: fight a monster from your hand, or','Loot the room: draw a face-down door card.'];acts=btn({act:'loot'},'Loot the room (free card)','primary')+by('trouble').filter(m=>!riskyCard(me,m.card)).slice(0,1).map(m=>btn(m,`⚔ Fight ${esc(cname(m.card))} (Lv ${cd(m.card).lvl})`,'good')).join('')+sellBtn(vm,me);extra.push(co.low);break;
  case 'post':{const over=P(me).hand.length-handLimit(P(me));say='Tidy up, then end your turn.';ol=['Play or wear new items, sell for levels.',over>0?`End your turn: you hold ${over} card${plural(over)} too many and will give ${over===1?'it':'them'} away.`:'End your turn.'];acts=autoBtn(me,co)+btn({act:'end'},'End turn',autoN(me,co)?'':'primary pulse')+sellBtn(vm,me);break}
  case 'charity':{const t=charityTargets(P(me));const ex=P(me).hand.length-handLimit(P(me));say=`You hold ${P(me).hand.length} cards but may keep only ${handLimit(P(me))}. ${t.length?`Tap ${ex} card${plural(ex)} to give to ${t.map(i=>esc(P(i).nm)).join(' or ')}: extra cards go to the lowest-level hero.`:`You are the lowest level, so tap ${ex} card${plural(ex)} to discard.`} Then your turn ends.`;acts=co.card!=null&&UI.hints?`<button class="btn primary pulse" data-a="autocharity">✨ Give away the suggested card${ex>1?'s':''} (${ex})</button>`:'';break}
  case 'combat':{const win=winning(cb);
    if(cb.stage==='act'){say=win?`You are winning, ${sideStr(cb)} to ${monStr(cb)}.`:`You are losing, ${sideStr(cb)} to ${monStr(cb)}.`;
      ol=win?['Add more one-shots for safety, or','Fight: others get one last chance to interfere.']:['Play one-shots or powers, ask someone to help, or','Run away: roll 5 or more on a die for each monster.'];
      const askRec=UI.hints&&co.rec&&co.rec.act==='ask';
      acts=(by('fight').length?btn({act:'fight'},'⚔ Fight!','primary pulse'):'')+(by('run').length?btn({act:'run'},'🏃 Run away'+runLabel(me,cb),co.rec&&co.rec.act==='run'?'primary':''):'')+(by('ask').length?`<button class="btn${askRec?' rec primary':''}" data-a="askmenu">🙋 Ask for help</button>`:'')+abilityBtns(vm,recK);
      tip=monTips(cb)}
    else{say=`${nmY(cb.who)} is fighting (${sideStr(cb)} vs ${monStr(cb)}). Anything to play?`;ol=['Tap a monster boost or one-shot in your hand to change the fight,','or let it be.'];acts=btn({act:'pass'},'Let it be',co.threat&&co.rec&&co.rec.act!=='pass'?'':'primary')+abilityBtns(vm,recK)}
    break}}
  if(co.plan&&co.plan.length&&UI.hints){const pl=co.plan.map(x=>`<b>${x.label}</b>${x.why?` <span class="muted">(${x.why})</span>`:''}`);co.why=co.why||(co.plan.length>1?'Suggested: '+pl.join(' → '):'Suggested: '+pl[0])}
  if(co.catchup)extra.push('📉 '+co.catchup);
  h+=`${UI.sell&&me>=0?sellBar(P(me)):''}${UI.menu&&UI.menu.ask?askHTML(me):''}${autoNoteHTML()}${sinceHTML(me)}${lessonHTML(me)}<p class="say">${say}</p>${acts?`<div class="acts main">${acts}</div>`:''}${co.threat?'':hintBox(co,extra)}${ol.length?`<ol>${ol.map(x=>`<li>${x}</li>`).join('')}</ol>`:''}${G.cb?fightNote(G.cb):''}${tip?`<div class="tip">${tip}</div>`:''}</div>`;return h}
// one tap plays every card the suggestion would play now (races, classes, items, level-ups): the casual player's shortcut
const AUTOACTS=['play','equip'];
function autoN(me,co){if(!UI.hints||!co||!co.plan)return 0;let n=0;for(const x of co.plan){if(!x.m||!AUTOACTS.includes(x.m.act)||x.m.act==='play'&&(cd(x.m.card).t==='curse'||cd(x.m.card).t==='monster'))break;n++}return n}
function autoBtn(me,co){const n=autoN(me,co);return n?`<button class="btn primary pulse" data-a="autoplay">✨ Play suggested card${n>1?'s':''} (${n})</button>`:''}
function autoPlay(me){const s0=pStr(P(me)),l0=P(me).lvl,did=[];for(let k=0;k<12;k++){const co=coach(me);const x=co.plan&&co.plan[0];const m=x&&x.m;if(!m||!autoN(me,co)||sideToAct()!==me)break;const before=G.ln;const lab=x.label;uiAct(m);if(G.ln===before)break;did.push(lab)}
  if(did.length)UI.autoNote={ln:G.ln,t:`You played: ${did.join(', ')}. Strength ${s0} → ${pStr(P(me))}${P(me).lvl!==l0?`, level ${l0} → ${P(me).lvl}`:''}.`};render()}
function autoNoteHTML(){const a=UI.autoNote;return a&&G&&a.ln===G.ln?`<div class="since" role="status">${a.t}</div>`:''}
function runLabel(me,cb){if(typeof runOdds!=='function')return '';try{const o=runOdds(P(me),cb);if(o.rows.length===1){const r=o.rows[0];return r.pr===0?' (this monster can’t be escaped)':r.pr===1?' (sure)':` (need ${r.need}+: ${pct(o.all)})`}return ` (${pct(o.all)})`}catch(e){return ''}}
function sellBtn(vm,me){if(vm.some(m=>m.act==='sell'))return `<button class="btn" data-a="sellmode">💰 Sell items</button>`;const p=me>=0?P(me):null;if(!p)return '';const g=maxSell(p);
  return `<button class="btn" disabled title="Sell items worth ${R.SELL} gold at once for a level">💰 Sell (${p.lvl>=R.WIN-1?'not at level '+(R.WIN-1):g?`${g} of ${R.SELL} gold`:'no items yet'})</button>`}
function monTips(cb){const t=[];for(const m of cb.mons){const c=mdef(m);t.push(`<b>${esc(c.n)}</b>: ${esc(c.x||'')} <i>Bad Stuff: ${esc(c.badt||'lose a level')}</i>`)}return t.join('<br>')}
function abilityBtns(vm,recK){const k=new Set(vm.map(m=>m.act));let h='';const b=m=>`<button class="btn${recK&&mvKey(m)===recK?' rec':''}" data-mv='${esc(JSON.stringify(m))}'>${moveLabel(m)}</button>`;vm.filter(m=>['skip','shoo','charm','bribe'].includes(m.act)).forEach(m=>h+=b(m));
  const pw=['berserk','turn','flight','backstab'].filter(a=>k.has(a));if(pw.length)h+=`<span class="small muted">Class power: tap a card in your hand to ${pw.map(a=>({berserk:'go berserk',turn:'turn undead',flight:'cast flight',backstab:'backstab'})[a]).join(' or ')}.</span>`;return h}
function actsHTML(vm,me){return ''}
function logHTML(){return `<ol id="log" reversed>${G.log.slice(0,200).map(l=>`<li${l.s>=0?` style="border-left:4px solid ${PCOL[l.s]};padding-left:6px;list-style:none;margin-left:-1rem"`:' style="list-style:none;margin-left:-1rem"'}>${l.s>=0&&G.pl[l.s]?dkPortrait(G.pl[l.s].nm,'ptok ptokp ptoklog'):''}${esc(l.t)}</li>`).join('')}</ol>`}
// ---- card menu: everything this card can do right now ----
function cardMoves(me,id){return myMoves(me).filter(m=>m.card===id)}
function moveLabel(m){const c=m.card!=null?cd(m.card):null;const me=viewSeat();const cb=G.cb;const myFight=cb&&(cb.who===me||cb.help===me);switch(m.act){
  case 'play':if(c.t==='level')return m.tgt===me?'Go up a level':`Give ${nmY(m.tgt)} a level (helps a rival!)`;if(c.sp==='steal')return `Take a level from ${nmY(m.tgt)}`;if(c.sp==='illusion')return `Swap ${esc(mdef(G.cb.mons[m.tgt]).n)} for ${esc(cname(m.opt))}`;if(c.sp==='borrow')return `Take ${esc(cname(m.opt))} from ${nmY(m.tgt)}`;if(c.sp==='transfer')return m.tgt===me?'Take over this fight yourself':`Make ${nmY(m.tgt)} fight instead`;if(c.sp==='garlic'&&typeof m.tgt==='number')return 'Kill the Hovering Sniffer outright';if(c.sp==='mate')return `Give ${esc(mdef(G.cb.mons[m.tgt]).n)} a date${myFight?' (against yourself!)':''}`;
    if(c.t==='curse')return `Curse ${nmY(m.tgt)}${m.tgt===me?' (yourself!)':''}`;if(c.t==='enh')return `${c.b>0?'Boost':'Weaken'} ${esc(mdef(G.cb.mons[m.tgt]).n)} (${c.b>0?'+':''}${c.b})${myFight&&c.b>0?' (against yourself!)':''}`;if(c.sp==='wander')return `Send in ${esc(cname(m.tgt))} as an uninvited guest${myFight?' (against yourself!)':''}`;if(c.sp==='cheat')return `Cheat: wear ${esc(cname(m.tgt))} against the rules`;
    if(m.tgt==='p')return `Use for the heroes (+${c.b||0})${cb&&!myFight?` (helps ${esc(P(cb.who).nm)}!)`:''}`;if(m.tgt==='m')return `Use for the monsters (+${c.b||0})${myFight?' (against yourself!)':''}`;if(typeof m.tgt==='number'&&G.cb&&G.cb.mons[m.tgt])return `Use on ${esc(mdef(G.cb.mons[m.tgt]).n)}`;
    if(c.t==='item'){const p=P(me);const w=equipWhy(p,m.card)||bigWhy(p,m.card);return w?`Put into play (carried: ${w})`:'Put on'}
    if(c.t==='race'||c.t==='class'){const p=P(me);const z=c.t==='race'?p.race:p.cls;const dual=c.t==='race'?p.half!=null:p.sup!=null;return 'Become '+esc(c.n)+(z.length&&!dual?` (replaces your ${esc(z.map(cname).join(', '))})`:'')}if(c.t==='level')return 'Go up a level';return c.sp==='hire'?'Hire '+esc(c.n):'Play '+esc(c.n);
  case 'equip':return 'Wear it';case 'unequip':return 'Take it off (carry)';case 'sell':return 'Sell';case 'trouble':{const rk=riskyCard(me,m.card);return `Look for trouble: fight it (level ${c.lvl})${rk?` ⚠ ${rk}`:''}`}
  case 'give':return `Give to ${nmY(m.tgt)}`;case 'toss':return 'Discard';case 'berserk':return 'Berserk: discard for +1';case 'turn':return 'Turn undead: discard for +3';case 'flight':return 'Flight spell: discard for +1 to run';
  case 'backstab':return `Backstab ${nmY(m.tgt)}: discard for −2${m.tgt===me?' (yourself!)':''}`;case 'steal':return `Steal it from ${nmY(m.tgt)} (discard a card, roll 4+ or lose a level)`;
  case 'drop':return c.t==='race'||c.t==='class'?'Discard this '+(c.t==='race'?'race':'class'):'Let the Porter go';case 'resurrect':return 'Discard this and take the top door discard instead of kicking';case 'join':return 'Add it to the fight (undead join undead)';
  case 'skip':return `Walk past ${esc(mdef(G.cb.mons[m.tgt]).n)}`;case 'shoo':return `Shoo off ${esc(mdef(G.cb.mons[m.tgt]).n)} (Cleric)`;case 'charm':return `✨ Charm ${esc(mdef(G.cb.mons[m.tgt]).n)} (discard your whole hand)`;case 'bribe':return `Bribe the Sniffer with ${esc(c.n)}`;case 'use':return 'Use '+esc(c.n);
  case 'ask':return `Ask ${nmY(m.tgt)} for help (offer ${m.opt})`;case 'ready':return 'Ready';case 'kick':return 'Kick open the door';case 'loot':return 'Loot the room';case 'end':return 'End your turn';case 'fight':return 'Fight!';case 'run':return 'Run away';case 'pass':return 'Let it be';
  default:return m.act}}
function askHTML(me){const cb=G.cb;const opts=validMoves(me).filter(m=>m.act==='ask');const who=[...new Set(opts.map(m=>m.tgt))];const co=coach(me);const recK=UI.hints&&co.rec?mvKey(co.rec):null;const offs=UI.hints?helpOffers(me):[];
    return `<div class="asks" role="group" aria-label="Ask for help"><b>Ask for help</b><span class="small">Pick a helper and how many of the ${cbTreasure(cb)} treasures you offer. They add their strength; if you still lose, you both run.</span>${who.map(i=>{const o=offs.find(x=>x.i===i);return `<div><b>${esc(P(i).nm)}</b> <span class="small">(strength ${pStr(P(i))}${pStr(P(i))+sideStr(cb)>monStr(cb)?', enough to win':', not enough'}${o&&o.yes!=null?`; will say yes for ${o.yes}`:o&&o.wins&&!o.human?'; will say no':''})</span><div class="acts" style="margin:.2rem 0">${opts.filter(m=>m.tgt===i).map(m=>`<button class="btn${recK&&mvKey(m)===recK?' rec':''}" data-mv='${esc(JSON.stringify(m))}'>offer ${m.opt}</button>`).join('')}</div></div>`}).join('')}<div><button class="btn" data-a="close">Cancel</button></div></div>`}
function infoHTML(c){return `${c.t==='monster'?`<p class="small">Level ${c.lvl} · ${c.tr} treasure${c.tr===1?'':'s'}${(c.lv||1)>1?` · worth ${c.lv} levels`:''}<br>Bad Stuff: ${esc(c.badt||'lose a level')}</p>`:''}${c.t==='item'?`<p class="small">${kindLabel(c)} · ${tagOf(c).replace(/<[^>]+>/g,'')||'+0'} · ${c.g||0} gold${c.req?` · ${[].concat(c.req).map(r=>r[0]==='!'?'not for '+(TRAITS[r.slice(1)]||r.slice(1)):'only for '+(TRAITS[r]||r)).join(', ')}`:''}</p>`:''}<p class="when small"><b>When you can play it:</b> ${esc(whenText(c))}</p>`}
function menuHTML(me){const u=UI.menu;
  const id=u.card;const ms=cardMoves(me,id);const c=cd(id);const co=coach(me);const recK=UI.hints&&co.rec?mvKey(co.rec):null;const rk=riskyCard(me,id);
  return `<div class="zoom"><div class="zgrid">${cardHTML(id,{attr:'tabindex="-1"',notitle:1})}<div>${infoHTML(c)}${rk?`<p class="warn">⚠ ${esc(rk)}.</p>`:''}${UI.hints&&co.card===id&&co.why?`<p class="why">💡 ${co.why}</p>`:''}
    <div class="opts">${ms.map(m=>`<button class="btn opt ${recK&&recK===mvKey(m)?'rec':''}" data-mv='${esc(JSON.stringify(m))}'>${moveLabel(m)}</button>`).join('')||'<p class="small muted">You can\'t use this card right now.</p>'}${me>=0&&validMoves(me).some(m=>m.act==='sell')&&sellable(P(me)).includes(id)?`<button class="btn opt sellone" data-a="sellone" data-id="${id}">Sell it (${cd(id).g||0} gold)</button>`:''}</div>
    <div class="acts"><button class="btn" data-a="close">Close</button></div></div></div></div>`}
function zoomHTML(){const id=UI.zoom;const c=cd(id);const me=viewSeat();const mineCard=me>=0&&P(me).hand.includes(id);return `<div class="zoom"><div class="zgrid">${cardHTML(id,{attr:'tabindex="-1"',notitle:1})}<div>${infoHTML(c)}${mineCard?'<p class="small muted">You can’t use this card right now.</p>':''}<div class="acts"><button class="btn" data-a="close">Close</button></div></div></div></div>`}
function passHTML(s){return `<div class="dlg paper" style="text-align:center"><h2>Pass the device to ${esc(P(s).nm)}</h2><p>Everyone else, look away: ${esc(P(s).nm)}'s hand is secret.</p><button class="btn primary" data-a="iam">I'm ${esc(P(s).nm)}: show my cards</button></div>`}
function endHTML(){const ps=G.pl.slice().sort((a,b)=>b.lvl-a.lvl);const me=viewSeat();const won=G.winner==='P'+(me+1)&&P(me).human&&G.mode!=='ai';
  return `<div class="dlg paper end ${won?'won':''}">${won?'<div class="confetti" aria-hidden="true">🎉 ✨ 🏆 ✨ 🎉</div>':''}${(()=>{const w=G.pl[parseInt(String(G.winner).slice(1))-1];return w?dkPortrait(w.nm,'winp'):''})()}<h2>${won?'🎉 Victory! You are a Level 10 Legend!':'🏆 '+esc(G.winText)}</h2>${won?`<p class="small muted">${esc(G.winText)}</p>`:''}${recapHTML()}<table style="width:100%;border-collapse:collapse;font-variant-numeric:tabular-nums"><tr><th align="left">Hero</th><th>Level</th><th>Kills</th><th>Helps</th><th>Deaths</th><th>Cursed</th></tr>${ps.map(p=>`<tr style="${'P'+(p.i+1)===G.winner?'background:#fff3bf;color:#2b2233':''}"><td>${dkPortrait(p.nm,'ptok ptokp')}${nmY(p.i)}</td><td align="center">${p.lvl}</td><td align="center">${p.st.kills}</td><td align="center">${p.st.helps}</td><td align="center">${p.st.deaths}</td><td align="center">${p.st.cursed}</td></tr>`).join('')}</table><p class="small muted">The dungeon doors slam shut for another year.</p><div class="acts"><button class="btn primary" data-a="new">Play again</button></div></div>`}
function startHTML(){const n=UI.n||DEFN;let saved=null;try{saved=localStorage.getItem(SAVE)}catch(e){}const net=typeof netAvail==='function'&&netAvail();if(UI.mode==='net'&&!net)UI.mode='F';const online=UI.mode==='net';const guest=online&&typeof isClient==='function'&&isClient();
  return `<div class="dlg paper start"${typeof NET!=='undefined'&&NET.on?' style="animation:none"':''}><h2 style="font-size:2rem">Doorkick <span style="color:var(--red)">Dungeon</span></h2><p>Kick doors. Fight monsters. Stab friends.</p>${typeof tutBtn==='function'?tutBtn('btn bigb'):''}${online||typeof campLine!=='function'?'':`<button class="btn primary bigb story-btn" data-a="story">📖 Story mode: 10 chapters, 3 bosses</button>${campLine()}`}${online?'':introHTML(n,UI.mode||'F')}
   <h3>Who plays?</h3><div class="seg">${[['F','Me vs computer'],['hot','Friends on one device'],['ai','Watch the computer']].concat(net?[['net','🌐 Play online']]:[]).map(([k,l])=>`<button class="btn ${ (UI.mode||'F')===k?'on':''}" data-set="mode" data-v="${k}">${l}</button>`).join('')}</div>
   ${online||UI.mode==='ai'?'':`<button class="btn learn ${UI.learn===true?'on':''}" data-a="learnon" aria-pressed="${UI.learn===true}">${UI.learn===true?'✓':'○'} Teach me as I play</button>`}
   ${online?`<h3>🌐 Play online</h3>${onlineBlock()}`:''}${guest?'<p class="small muted">The host chooses the seats, the computer skill and the expansions.</p>':startOpts(n,online)}
   <div class="acts" style="margin-top:12px">${online?'':`<button class="btn primary pulse" data-start="${UI.mode||'F'}">Start</button>${saved?'<button class="btn" data-a="load">Continue saved game</button>':''}`}<button class="btn" data-a="rules">How to play</button><button class="btn" data-a="music">${ic('music')} Music</button></div>${!net&&typeof onlineBlock==='function'?onlineBlock():''}</div>`}
function startOpts(n,online){return `<h3>${online?'Seats (friends first, the computer fills the rest)':'Heroes at the table'}</h3><div class="seg">${[3,4,5,6].map(k=>`<button class="btn ${n===k?'on':''}" data-set="n" data-v="${k}">${k}</button>`).join('')}</div>
   <h3>Computer skill</h3><div class="seg">${['easy','normal','hard'].map(k=>`<button class="btn ${(UI.lvl||'normal')===k?'on':''}" data-set="lvl" data-v="${k}">${k[0].toUpperCase()+k.slice(1)}</button>`).join('')}</div>
   ${EXPS.length?`<h3>Expansions</h3><div class="grid2">${EXPS.map(e=>`<button class="btn ${DEFEX[e.k]?'on':''}" data-set="ex" data-v="${e.k}" title="${esc(e.d)}"><b>${esc(e.n)}</b><br><span class="small">${esc(e.d)}</span></button>`).join('')}</div>`:''}`}
function rulesHTML(){return RULES_HTML}
// ---- input ----
function uiAct(m){if(UI.lessonNow){learnDone(UI.lessonNow);UI.lessonNow=null}const me=viewSeat();const s=m.seat!=null?m.seat:me;UI.menu=null;if(m.act==='sell')UI.sell=null;if(G&&G.mode==='net'&&typeof netAct==='function'){netAct(m);render();return}const ok=gameAct(m,s);if(!ok)render()}
document.addEventListener('click',e=>{const t=e.target.closest('[data-mv],[data-a],[data-card],[data-start],[data-set],[data-opp]');if(!t)return;
  if(t.dataset.mv){uiAct(JSON.parse(t.dataset.mv));return}
  const a=t.dataset.a;
  if(typeof netClick==='function'&&(a&&/^net/.test(a)||(a==='new'&&G&&G.mode==='net'))){netClick(a==='new'?'netnew':a);return}
  if(a==='close'){UI.menu=null;UI.zoom=null;UI.rules=false;if(GX.open==='dkCard')GX.close();render();return}
  if(a==='autocharity'){const me=viewSeat();if(me>=0){const gone=[];for(let k=0;k<12&&G.phase==='charity'&&sideToAct()===me;k++){const co=coach(me);if(co.card==null)break;const m=cardMoves(me,co.card).find(x=>x.act==='give'||x.act==='toss');if(!m)break;const before=G.ln;gone.push(cname(co.card)+(m.act==='give'?' → '+P(m.tgt).nm:' (discarded)'));uiAct(m);if(G.ln===before)break}if(gone.length)UI.autoNote={ln:G.ln,t:'You gave away: '+gone.map(esc).join(', ')+'.'}}render();return}
  if(a==='autoplay'){const me=viewSeat();if(me>=0)autoPlay(me);return}
  if(a==='learned'){learnDone(t.dataset.k);UI.lessonNow=null;render();return}
  if(a==='learnon'){UI.learn=!(UI.learn===true);render();return}
  if(a==='askmenu'){UI.menu={ask:true};render();return}
  if(a==='sellmode'){UI.sell=[];render();return}
  if(a==='sellx'){UI.sell=null;render();return}
  if(a==='sellone'){const me=viewSeat();if(me>=0&&sellable(P(me)).includes(+t.dataset.id)){UI.sell=[+t.dataset.id];UI.menu=null;UI.zoom=null;if(GX.open==='dkCard')GX.close();render()}return}
  if(a==='iam'){UI.lastSeat=UI.pass;UI.pass=null;render();return}
  if(a==='rules'){GX.show('dkRules');return}
  if(a==='new'){G=null;UI.info=true;UI.menu=null;UI.zoom=null;UI.sell=null;GX.close();render();return}
  if(a==='load'){try{G=JSON.parse(localStorage.getItem(SAVE));UI.pass=null;UI.lastSeat=-1;refresh()}catch(e){G=null;render()}return}
  if(a==='gfx'&&typeof GFX!=='undefined'){GFX.cycle();syncGfxBtn();return}
  if(a==='pause'){UI.pause=!UI.pause;$('#pausebtn').innerHTML=ic(UI.pause?'play':'pause');syncMenu();if(!UI.pause)schedule();return}
  if(a==='speed'){UI.speed=UI.speed>=2?0.5:UI.speed*2;try{localStorage.setItem('dkd_speed4',UI.speed)}catch(e){};$('#speedbtn').innerHTML=SPEEDN(UI.speed);syncMenu();return}
  if(a==='snd'&&typeof toggleSound==='function'){toggleSound();syncMenu();return}
  if(a==='music'){renderMusic();GX.show('dkMusic');return}
  if(a==='mall'){const on=MLOOPS.every(k=>SND.pick[k]==='all');MLOOPS.forEach(k=>musicPick(k,on?MDEF[k]:'all'));renderMusic();return}
  if(a==='mpick'){musicPick(t.dataset.s,t.dataset.c);renderMusic();return}
  if(a==='mprev'){musicPreview(t.dataset.s);renderMusic();return}
  if(a==='mprevx'){musicPreviewStop();renderMusic();return}
  if(a==='mmus'&&typeof toggleMusic==='function'){toggleMusic();renderMusic();return}
  if(a==='mus'&&typeof toggleMusic==='function'){toggleMusic();syncMenu();return}
  if(t.dataset.set){const k=t.dataset.set,v=t.dataset.v;if(k==='n')UI.n=+v;else if(k==='mode')UI.mode=v;else if(k==='lvl')UI.lvl=v;else if(k==='ex'){DEFEX[v]=!DEFEX[v];try{localStorage.setItem('dkd_ex',JSON.stringify(DEFEX))}catch(e){}}render();return}
  if(t.dataset.opp!=null&&t.dataset.card===undefined){UI.oppView=+t.dataset.opp;render();GX.show('dkOpp');const d=$('#dkOpp .gx-drawer-body');if(d)d.scrollTop=0;return}
  if(t.dataset.start){UI.pass=null;UI.lastSeat=-1;newGame(t.dataset.start,UI.n||DEFN);if(G){G.learn=UI.learn===true&&t.dataset.start!=='ai';render()}return}
  if(t.dataset.card!==undefined&&G){const id=+t.dataset.card;const me=viewSeat();
    if(t.closest('.dlg')||t.closest('#dkCard')){return}
    if(UI.sell){if(me>=0&&sellable(P(me)).includes(id)){const i=UI.sell.indexOf(id);if(i>=0)UI.sell.splice(i,1);else UI.sell.push(id);render()}return}
    const ms=cardMoves(me,id);
    if(ms.length===1&&['give','toss','equip','unequip'].includes(ms[0].act)&&!document.documentElement.classList.contains('ph')){uiAct(ms[0]);return}
    if(ms.length){UI.menu={card:id};render();return}UI.zoom=id;render();return}
});
document.addEventListener('keydown',e=>{if(e.target.tagName==='INPUT')return;if(e.key==='Escape'){UI.menu=null;UI.zoom=null;UI.rules=false;if(G)render();return}
  if((e.key==='Enter'||e.key===' ')&&e.target.matches&&e.target.matches('span[data-gx]')){e.preventDefault();e.target.click();return}
  if(GX.open)return;
  if(!G||G.winner)return;const me=viewSeat();if(sideToAct()!==me)return;const vm=validMoves(me);const f=a=>vm.find(m=>m.act===a);
  const k=e.key.toLowerCase();const m=k==='k'?f('kick'):k==='l'?f('loot'):k==='e'?f('end'):k==='f'?f('fight'):k==='r'?f('run'):k===' '||k==='enter'?(f('kick')||f('fight')||f('pass')||f('end')||f('ready')||f('loot')):null;
  if(m&&!UI.menu&&UI.pass==null){e.preventDefault();uiAct(m)}});
function humanTurn(){if(!G||G.winner)return false;const s=sideToAct();return s>=0&&P(s).human}
try{const ex=JSON.parse(localStorage.getItem('dkd_ex')||'null');if(ex)Object.assign(DEFEX,ex)}catch(e){}
// ---- board-first shell: popups for the diary, rivals, card details and rules ----
GX.init({key:'dkd'});
if(typeof GXSK!=='undefined')GXSK.init({});
GX.drawer('dkLog','Dungeon diary',$('#dkLogBody'));
GX.drawer('dkOpp','Rivals: gear and cards',$('#dkOppBody'),true);
GX.drawer('dkCard','Card',$('#dkCardBody'));
GX.drawer('dkRules','How to play',$('#dkRulesBody'),true);$('#dkRulesBody').innerHTML=rulesHTML();
GX.drawer('dkMenu','Menu',$('#dkMenuBody'));
GX.drawer('dkMusic','Music',$('#dkMusicBody'));
function renderMusic(){const b=$('#dkMusicBody');if(!b||typeof MSLOTS==='undefined')return;const on=SND.music;let vol=.5;try{vol=GA.state().musVol}catch(e){}
  const rows=MSLOTS.map(([k,nm])=>{const cur=SND.pick[k],act=SND.wslot===k&&on&&cur!=='off';
    const ch=[['a'],['b']].map(([v])=>`<button class="mchip${cur===v?' on':''}" data-a="mpick" data-s="${k}" data-c="${v}">${MTITLE[k+'-'+v]}</button>`);
    if(k!=='victory'&&k!=='defeat')ch.push(`<button class="mchip${cur==='classic'?' on':''}" data-a="mpick" data-s="${k}" data-c="classic">Classic</button>`);
    ch.push(`<button class="mchip${cur==='shuffle'?' on':''}" data-a="mpick" data-s="${k}" data-c="shuffle">⇄ Shuffle</button>`);
    if(MLOOPS.includes(k))ch.push(`<button class="mchip${cur==='all'?' on':''}" data-a="mpick" data-s="${k}" data-c="all">⇄ All songs</button>`);
    ch.push(`<button class="mchip${cur==='off'?' on':''}" data-a="mpick" data-s="${k}" data-c="off">Off</button>`);
    const pv=SND.prev===k?`<button class="mchip prev" data-a="mprevx" data-s="${k}">■ Stop preview</button>`:(!act&&cur!=='off'&&on?`<button class="mchip prev" data-a="mprev" data-s="${k}">▶ Preview</button>`:'');
    return `<div class="mrow2"><h3>${nm}${act?' <small>playing now</small>':''}</h3><div class="mchips">${ch.join('')}${pv}</div></div>`}).join('');
  setHTML(b,`<div class="music"><div class="mtop"><button class="mchip${on?' on':''}" data-a="mmus">${ic('music')} Music: ${on?'on':'off'}</button><label class="mvol">Volume <input type="range" id="mvol" min="0" max="1" step="0.05" value="${vol}" aria-label="Music volume"></label></div><div class="mtop"><button class="mchip${MLOOPS.every(k=>SND.pick[k]==='all')?' on':''}" data-a="mall">⇄ Shuffle all songs</button></div>${rows}</div>`)}
document.addEventListener('input',e=>{if(e.target&&e.target.id==='mvol'&&window.GA)GA.setVolume('music',+e.target.value)});
GX.drawer('dkNet','🌐 Online game',$('#dkNetBody'));
$('#speedbtn').innerHTML=SPEEDN(UI.speed);if(typeof GFX!=='undefined'){GFX.init();syncGfxBtn()}
GX.onClose=id=>{if(id==='dkCard'&&((UI.menu&&UI.menu.card!=null)||UI.zoom!=null)){UI.menu=null;UI.zoom=null;if(G)render()}};
render();
