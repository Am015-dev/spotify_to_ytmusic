// ===== Help kit (gx-help.js): first-time coach bubbles, the lightbulb, rules cards. See shell/GX-KIT.md section 9. =====
// One phase id per moment of play. The bulb's suggestion comes from the game's own advisors (advise(), suggestMask(), suggestCard()),
// so the finger always points at what "What now?" used to say; with no safe advice the bulb shows only the rules cards.
const HLP_Q=s=>document.querySelector(s);
const hlpWords=t=>String(t||'').replace(/[^a-zA-Z0-9'’+]+/g,' ').trim().split(' ').filter(Boolean).length;
// shortest honest version of a longer "why": the first sentence, else its first clause, else the plain fallback
function hlpFit(t,alt){t=String(t||'').replace(/\s+/g,' ').trim();if(hlpWords(t)<=15)return t;
  const s=t.split(/(?<=[.!?])\s+/)[0];if(hlpWords(s)<=15)return s;
  let out='';for(const c of s.split(/(?<=[,;:])\s*/)){if(hlpWords(out+' '+c)>15)break;out=(out+' '+c).trim()}
  out=out.replace(/[,;:]$/,'.');return out&&hlpWords(out)>=3?out:(alt||'It is the safest pick here.')}
function hlpChoiceOn(){const c=UI.choice;const el=document.getElementById('choice');return c&&el&&!el.classList.contains('hidden')&&!UI.intro?c:null}
function hlpPhase(){
  if(!G||G.winner||UI.info)return null;
  if(document.querySelector('.gx-dock[data-bf="resolving"]'))return null;   // the dice are being resolved: nothing to decide, buttons hidden
  if(UI.intro)return 'intro';
  const c=hlpChoiceOn();
  if(c)return /secret power|^Evolution!/.test(c.title)?'power':/^Stay or yield/.test(c.title)?'yield':'choice';
  if(!humanTurn())return 'watch';
  if(G.phase==='roll'){if(!G.dice.length)return null;const nk=G.dice.filter(d=>!d.k).length;
    if(G.rolls<=0||!nk)return 'done';return G.dice.some(d=>d.k)?'reroll':'roll'}
  if(G.phase==='buy')return 'buy';
  return null}
// ---- pictures: the game's own dice faces in a small SVG strip, plus a few drawn icons ----
const HLP_INK='#1a1320';
function hlpFaces(faces,cap,on){const n=faces.length,w=76;let s=`<svg viewBox="0 0 ${n*w} ${cap?104:84}" xmlns="http://www.w3.org/2000/svg">`;
  faces.forEach((f,i)=>{const x=i*w+6,hot=on&&on.includes(i);s+=`<rect x="${x}" y="6" width="64" height="64" rx="13" fill="${hot?'#ffd23f':'#fff6dc'}" stroke="${HLP_INK}" stroke-width="3.5"/>`+faceSVG(f).replace('<svg ',`<svg x="${x+4}" y="10" width="56" height="56" `)});
  if(cap)s+=`<text x="${n*w/2}" y="97" text-anchor="middle" font-size="17" font-weight="800" font-family="Nunito,sans-serif" fill="#231a10">${cap}</text>`;return s+'</svg>'}
const HLP_STAR='<path d="M30 5l7.6 15.6 17 2.4-12.3 12 2.9 17L30 43.8 14.8 52l2.9-17L5.4 23l17-2.4z" fill="#ffd23f" stroke="#1a1320" stroke-width="3.5" stroke-linejoin="round"/>';
const HLP_CROWN='<path d="M8 46V20l13 12 9-18 9 18 13-12v26z" fill="#ffd23f" stroke="#1a1320" stroke-width="3.5" stroke-linejoin="round"/><rect x="8" y="46" width="44" height="8" rx="2" fill="#e8a317" stroke="#1a1320" stroke-width="3.5"/>';
const HLP_HEART='<path d="M30 52C8 36 6 22 14 15c7-5 14-1 16 5 2-6 9-10 16-5 8 7 6 21-16 37z" fill="#ff5d73" stroke="#1a1320" stroke-width="3.5" stroke-linejoin="round"/>';
function hlpIcons(items,cap,w){const n=items.length,W=w||84;let s=`<svg viewBox="0 0 ${n*W} ${cap?104:84}" xmlns="http://www.w3.org/2000/svg">`;
  items.forEach((it,i)=>{s+=`<g transform="translate(${i*W+(W-60)/2},8)">${it}</g>`});
  if(cap)s+=`<text x="${n*W/2}" y="97" text-anchor="middle" font-size="17" font-weight="800" font-family="Nunito,sans-serif" fill="#231a10">${cap}</text>`;return s+'</svg>'}
const HLP_TXT=(t,c)=>`<text x="30" y="40" text-anchor="middle" font-size="${c||24}" font-weight="900" font-family="Bangers,Impact,sans-serif" fill="#1a1320">${t}</text>`;
const HLP_ARROW='<path d="M6 30h40M32 14l16 16-16 16" fill="none" stroke="#c99a35" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>';
const HLP_BTN=(t,c)=>`<rect x="-6" y="14" width="72" height="34" rx="10" fill="${c}" stroke="#1a1320" stroke-width="3.5"/><text x="30" y="38" text-anchor="middle" font-size="17" font-weight="900" font-family="Nunito,sans-serif" fill="#1a1320">${t}</text>`;
const HLP_CARD='<rect x="8" y="2" width="44" height="56" rx="7" fill="#fff6dc" stroke="#1a1320" stroke-width="3.5"/><path d="M33 12L19 33h9l-3 15 15-23h-9z" fill="#2ec27e" stroke="#1a1320" stroke-width="2.5" stroke-linejoin="round"/>';
const HLP_BULB='<path d="M20 48h20M22 55h16M30 4a18 18 0 0 0-10.8 32.4c2 1.8 3.3 4.2 3.3 6.6h15c0-2.4 1.3-4.8 3.3-6.6A18 18 0 0 0 30 4z" fill="#ffd95a" stroke="#6b4a00" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>';
const HLP_DNA='<rect x="8" y="2" width="44" height="56" rx="7" fill="#e9d5ff" stroke="#1a1320" stroke-width="3.5"/><path d="M20 12c14 8 6 16 20 24M40 12c-14 8-6 16-20 24M20 36c14 8 6 12 20 12" fill="none" stroke="#7a1f9a" stroke-width="4" stroke-linecap="round"/>';
const hlpShop=()=>`<svg viewBox="0 0 252 84" xmlns="http://www.w3.org/2000/svg">${[0,1,2].map(i=>`<g transform="translate(${i*84+12},10)">${HLP_CARD}</g>`).join('')}<text x="126" y="80" text-anchor="middle" font-size="15" font-weight="800" font-family="Nunito,sans-serif" fill="#231a10">3 cards for sale</text></svg>`;
// ---- the help file ----
const HLP_STEPS={
  intro:{target:()=>HLP_Q('#choice [data-a="story"]'),title:'Meet your monster',text:'First to 20 ★ wins. Tap Let’s smash to begin.',pic:()=>hlpIcons([HLP_STAR],'',60)},
  power:{target:()=>HLP_Q('#choice .acts'),title:'Pick a secret power',text:'Tap the one you want to keep. You play it later.',pic:()=>hlpIcons([HLP_DNA],'',60)},
  yield:{target:()=>HLP_Q('#choice .acts'),title:'Stay or yield?',text:'Yield to leave Downtown and stop the hits. Staying pays 2 ★ each turn.',pic:()=>hlpIcons([HLP_CROWN],'',60)},
  choice:{target:()=>HLP_Q('#choice .acts'),title:'Make a choice',text:'Each button says what it does. Not sure? Tap the bulb.',pic:()=>hlpIcons([HLP_BULB],'',60)},
  roll:{target:()=>HLP_Q('#dice'),title:'Tap dice to keep',text:'Tap the dice you like. They turn yellow and stay. Then press Roll.',pic:()=>hlpFaces(['3'],'',[0])},
  reroll:{target:()=>HLP_Q('#pacts [data-act="reroll"]'),title:'Roll the rest',text:'Press Roll to throw the dice you did not keep.',pic:()=>hlpFaces(['2','C'],'')},
  done:{target:()=>HLP_Q('#pacts [data-act="resolve"]'),title:'Use your dice',text:'Press Done to score them: stars, energy, hearts and claws.',pic:()=>hlpFaces(['E','C','H'],'')},
  buy:{target:()=>HLP_Q('#pshop:not(:empty)')||HLP_Q('#buymini'),title:'Buy a power card',text:'Tap a card to read it, then tap Buy. Or press Done to save your ⚡.',pic:()=>hlpIcons([HLP_CARD],'',60)},
  watch:{target:()=>{const e=HLP_Q('#bline');return e&&e.getClientRects().length&&e.textContent?e:HLP_Q('#ptop')},title:'Others are playing',text:'Watch their dice. Tap the board to speed them up.',pic:()=>hlpIcons([HLP_CROWN],'',60)}};
const HLP_RULES=[
  {title:'Win the city',text:'First monster to 20 ★ wins. The last monster standing wins too.',pic:()=>hlpIcons([HLP_STAR,HLP_CROWN],'20 ★ wins')},
  {title:'Your turn',text:'Roll six dice, up to three times. Keep the good ones, roll the rest again.',pic:()=>hlpFaces(['1','2','3','E','C','H'],'')},
  {title:'The dice faces',text:'Three matching numbers score stars. ⚡ gives energy, claws hit rivals, hearts heal you.',pic:()=>hlpFaces(['3','E','C','H'],'')},
  {title:'Downtown',text:'The monster in Downtown earns 2 ★ each turn, but every rival’s claws hit it.',pic:()=>hlpIcons([HLP_CROWN],'',60)}];
const HLP_PH=(ph,list)=>list.map(r=>Object.assign({phase:ph},r));
const HLP_ALL=[].concat(HLP_RULES,
  HLP_PH('intro',[
    {title:'Win the city',text:'First monster to 20 ★ wins. The last monster standing wins too.',pic:()=>hlpIcons([HLP_STAR,HLP_CROWN],'20 ★ wins')},
    {title:'Your turn',text:'Roll six dice, up to three times. Keep the good ones, roll the rest again.',pic:()=>hlpFaces(['1','2','3','E','C','H'],'roll · keep · roll again')},
    {title:'The dice faces',text:'Three matching numbers score stars. ⚡ gives energy, claws hit rivals, hearts heal you.',pic:()=>hlpFaces(['3','E','C','H'],'')},
    {title:'Downtown',text:'The monster in Downtown earns 2 ★ each turn, but every rival’s claws hit it.',pic:()=>hlpIcons([HLP_CROWN],'',60)}]),
  HLP_PH('power',[
    {title:'Secret powers',text:'Evolutions are secret powers only you can see. Keep one of the two offered.',pic:()=>hlpIcons([HLP_DNA,HLP_DNA],'keep one')},
    {title:'Playing one',text:'Play it later with the 🧬 button, when its rules allow. Details are on the card.',pic:()=>hlpIcons([HLP_DNA,HLP_ARROW,HLP_STAR],'')}]),
  HLP_PH('yield',[
    {title:'Yield or stay',text:'When claws hit you in Downtown you may yield: leave the city, and the attacker moves in.',pic:()=>hlpIcons([HLP_CROWN,HLP_ARROW],'yield = leave')},
    {title:'Why stay?',text:'Starting your turn in Downtown pays 2 ★. But you cannot heal there, and every rival’s claws hit you.',pic:()=>hlpIcons([HLP_CROWN,HLP_STAR,HLP_HEART],'2 ★ a turn, no healing')}]),
  HLP_PH('choice',[
    {title:'A choice for you',text:'Some cards and events ask you to decide. Each button says what it does.',pic:()=>hlpIcons([HLP_BTN('Yes','#ffd23f'),HLP_BTN('No','#fff6dc')],'')},
    {title:'Not sure?',text:'Tap the bulb: it points at the pick an experienced monster would make.',pic:()=>hlpIcons([HLP_BULB],'',60)}]),
  HLP_PH('roll',[
    {title:'Keep dice',text:'Tap a die to keep it. It turns yellow and stays put when you roll again.',pic:()=>hlpFaces(['3','3','C','E'],'tap to keep',[0,1])},
    {title:'What scores',text:'Three matching numbers score that many ★. Each extra match adds 1. A pair scores nothing.',pic:()=>hlpFaces(['3','3','3'],'= 3 ★',[0,1,2])},
    {title:'The other faces',text:'⚡ gives energy. Claws hit rivals. Hearts heal you, but not in Downtown.',pic:()=>hlpFaces(['E','C','H'],'')},
    {title:'Three rolls',text:'You roll up to three times. Before each reroll, choose again which dice to keep.',pic:()=>hlpFaces(['1','2','3'],'roll 1 · 2 · 3')}]),
  HLP_PH('reroll',[
    {title:'Roll again',text:'Press Roll to throw every die you did not keep. You get up to two rerolls.',pic:()=>hlpFaces(['3','3','2'],'keep two, roll one',[0,1])},
    {title:'Chase a triple',text:'Two matching numbers score nothing. Keep the pair and roll for a third one.',pic:()=>hlpFaces(['2','2','2'],'three = 2 ★',[0,1,2])},
    {title:'Happy already?',text:'You can press Done at any time. You do not have to use every roll.',pic:()=>hlpIcons([HLP_BTN('Done','#ffd23f')],'',84)}]),
  HLP_PH('done',[
    {title:'Using your dice',text:'Done scores them: numbers give ★, ⚡ adds energy, hearts heal, claws hit.',pic:()=>hlpFaces(['3','E','H','C'],'')},
    {title:'Claws',text:'Outside Downtown, claws hit the monster inside. Inside Downtown, they hit everyone outside.',pic:()=>hlpIcons([HLP_CROWN,HLP_ARROW],'claws hit the city')},
    {title:'What follows',text:'If Downtown is empty you move in for 1 ★. Then you may buy cards with ⚡.',pic:()=>hlpIcons([HLP_CROWN,HLP_STAR],'+1 ★')}]),
  HLP_PH('buy',[
    {title:'Power cards',text:'Spend ⚡ on the face-up cards. Tap a card to read it, tap Buy to take it.',pic:hlpShop},
    {title:'Card types',text:'PERMANENT cards stay with you. ONE-SHOT cards act at once. SAVE FOR LATER cards wait for their moment.',pic:()=>hlpIcons([HLP_CARD],'')},
    {title:'New cards',text:'Pay 2 ⚡ to throw away the cards for sale and deal fresh ones.',pic:hlpShop},
    {title:'Save your ⚡',text:'Buying nothing is fine: saved ⚡ carries over. Press Done to end your turn.',pic:()=>hlpIcons([HLP_BTN('Done','#ffd23f')],'',84)}]),
  HLP_PH('watch',[
    {title:'Others play',text:'Each monster takes a turn. Watch which dice they keep. Tap the board to speed it up.',pic:()=>hlpFaces(['1','C','E'],'')},
    {title:'Your moment',text:'You get a pop-up when you may yield Downtown or play a special card.',pic:()=>hlpIcons([HLP_BTN('Yield','#ffd23f')],'',84)},
    {title:'Downtown',text:'The monster in Downtown earns 2 ★ a turn, cannot heal, and takes every rival’s claws.',pic:()=>hlpIcons([HLP_CROWN],'',60)}]));
// ---- the bulb: the game's own advisors decide, the kit draws ----
function hlpOpt(k){return ()=>[...document.querySelectorAll('#choice [data-opt]')].find(b=>b.dataset.opt===String(k))||null}
function hlpDie(i){return ()=>HLP_Q(`#dice .die[data-die="${i}"]`)}
function hlpFaceNote(p,f,m){const nm=f,occ=G.city>=0?P(G.city):null,c=G.dice.filter((d,k)=>m[k]&&d.f===f).length;
  if(f==='1'||f==='2'||f==='3')return c>=3?`Three ${nm}s score ${nm} ★.`:c===2?`Two ${nm}s: a third scores ${nm} ★.`:`Three ${nm}s would score ${nm} ★.`;
  if(f==='E')return 'Energy buys power cards.';
  if(f==='C')return inCity(p.i)?'Claws hit every monster outside.':occ?`Claws hit ${mname(occ)} in Downtown.`:'Claws hit rivals.';
  if(f==='H')return 'Hearts heal you outside Downtown.';
  return 'It is part of the best set.'}
// dice still flying or spinning: a finger would point at the middle of the air
function hlpBusy(){return !!(BF.spin&&bfNow()<BF.spin.end)||!!document.querySelector('#dice .die.spin')}
function hlpSuggest(){
  const ph=hlpPhase();if(!ph||ph==='watch'||!G)return null;const p=cur();let a;try{a=advise()}catch(e){return null}
  if(ph==='intro')return {target:()=>HLP_Q('#choice [data-a="story"]'),why:'Read the card, then start your turn.'};
  if(ph==='power'||ph==='yield'||ph==='choice'){if(a.k===undefined||a.k===null)return null;return {target:hlpOpt(a.k),why:hlpFit(a.w,'An experienced monster picks this.')}}
  if(ph==='roll'||ph==='reroll'){if(hlpBusy())return null;let m;try{m=suggestMask(p)}catch(e){return null}if(!m)return null;
    const nk=G.dice.filter(d=>!d.k).length,i=G.dice.findIndex((d,k)=>!!m[k]!==!!d.k);
    if(i>=0){const d=G.dice[i];return {target:hlpDie(i),why:hlpFit(m[i]?`Keep this one. ${hlpFaceNote(p,d.f,m)}`:'Tap it to roll it again: it is not worth keeping.')}}
    if(G.rolls>0&&nk)return {target:()=>HLP_Q('#pacts [data-act="reroll"]'),why:nk===G.dice.length?'Roll all the dice again.':`Now roll the other ${nk} ${nk===1?'die':'dice'} (${G.rolls} left).`};
    return null}
  if(ph==='done')return {target:()=>HLP_Q('#pacts [data-act="resolve"]'),why:hlpFit(`Use them: you get ${scoreDice(p,G.dice).text}.`,'No rerolls worth it: use these dice.')};
  if(ph==='buy'){const sg=suggestCard(p);
    if(sg>=0){const id=G.market[sg],C=CARDS[base(id)];return {target:()=>HLP_Q(`#pshop [data-shop="${sg}"]`)||HLP_Q(`#buymini [data-card="${sg}"]`),
      why:hlpFit(`Buy ${C.n} for ${costOf(p,id)} ⚡. ${C.t==='K'?'It helps every turn.':C.t==='C'?'Saved for later.':'It acts at once.'}`,`Buy ${C.n} for ${costOf(p,id)} ⚡.`)}}
    return {target:()=>HLP_Q('#pacts [data-act="end"]'),why:p.en<3?'Nothing to buy yet. Save your ⚡.':'Nothing here is worth it. Save your ⚡.'}}
  return null}
{
  GXH.init({game:'crown-city-smash',defaultOn:true,steps:HLP_STEPS,rules:HLP_ALL,avoid:'.sugg,.rec,#pacts .btn,#choice .btn.primary,#pshop .ptile,#dice .die,.pchip,.gx-bar button'});
  GXH.bulb({el:'#bulbbtn',suggest:hlpSuggest,rulesFor:hlpPhase});
  const set=document.getElementById('gxhset');if(set)set.innerHTML=GXH.settingsHTML({rowClass:'mrow',btnClass:'btn'});
  const _pr=phRender;phRender=function(){const r=_pr.apply(this,arguments);try{if(G)GXH.phase(GX&&GX.open?null:hlpPhase())}catch(e){console.error(e)}return r};
  const _r=render;render=function(){const r=_r.apply(this,arguments);try{GXH.phase(GX&&GX.open?null:hlpPhase())}catch(e){console.error(e)}return r};
}
