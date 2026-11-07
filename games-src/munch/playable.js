// ===================== W389 playable layer: turn banner, step captions for the rival's turn, score pops =====================
// Pure overlay (pointer-events none, except the caption, which is tap-to-speed-up). Reads G.log and G.pl; never changes game state.
// Rival steps are held ~1 s each (UI.hold) so the player can follow; tap the caption to skip the wait. Off when ANIM=0 (sweeps/tests).
(function(){
  const PB={gid:null,ln:0,turn:null,act:null,lvl:{},capT:0,banT:0};
  const el=(id,cls)=>{let e=document.getElementById(id);if(!e){e=document.createElement('div');e.id=id;e.className=cls||'';document.body.appendChild(e)}return e};
  const arenaRect=()=>{const a=document.querySelector('.arena')||document.querySelector('#app');return a?a.getBoundingClientRect():{left:0,top:80,width:innerWidth,height:300}};
  const esc2=s=>String(s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
  function banner(txt,mine){const r=arenaRect(),b=el('pbBanner','pbbanner');b.className='pbbanner '+(mine?'mine':'rival');b.textContent=txt;b.style.top=(r.top+r.height*0.38)+'px';b.style.left=(r.left+r.width/2)+'px';
    b.classList.remove('go');void b.offsetWidth;b.classList.add('go');clearTimeout(PB.banT);PB.banT=setTimeout(()=>b.classList.remove('go'),1300)}
  function caption(txt,rival){const r=arenaRect(),c=el('pbCap','pbcap');c.textContent=txt;c.className='pbcap'+(rival?' rival':'');c.style.top=(r.top+6)+'px';c.style.left=(r.left+8)+'px';c.style.width=(r.width-16)+'px';
    c.classList.add('on');clearTimeout(PB.capT);PB.capT=setTimeout(()=>c.classList.remove('on'),rival?2600:2000)}
  function pop(txt,why,good){const r=arenaRect(),p=document.createElement('div');p.className='pbpop '+(good?'up':'down');p.innerHTML='<b>'+esc2(txt)+'</b>'+(why?'<small>'+esc2(why)+'</small>':'');
    p.style.top=(r.top+r.height*0.45)+'px';p.style.left=(r.left+r.width/2)+'px';document.body.appendChild(p);setTimeout(()=>p.remove(),1900)}
  function after(){
    if(typeof G==='undefined'||!G){PB.gid=null;return}
    const me=typeof viewSeat==='function'?viewSeat():-1;
    if(PB.gid!==G.gid){PB.gid=G.gid;PB.ln=G.ln||0;PB.turn=null;PB.act=null;PB.lvl={};G.pl.forEach(p=>PB.lvl[p.i]=p.lvl);return}
    if(!ANIM||G.winner){PB.ln=G.ln||0;if(G.winner){['pbCap','pbBanner'].forEach(k=>{const e=document.getElementById(k);if(e){e.classList.remove('on','go')}});document.querySelectorAll('.pbpop').forEach(e=>e.remove())}return}
    // turn banner: when the active hero changes after setup
    if(G.phase!=='setup'&&(PB.turn!==G.turn||PB.act!==G.active)&&G.active>=0){PB.turn=G.turn;PB.act=G.active;const pl=G.pl[G.active];const mine=!!pl&&pl.human&&G.mode!=='ai'&&(me<0||me===G.active);banner(mine?'Your turn':pl.nm+'’s turn',mine)}
    // new log lines: caption each rival step; hold the computer so every step is readable
    const nw=(G.log||[]).filter(l=>l.n>PB.ln).reverse();PB.ln=G.ln||0;
    for(const l of nw){const rival=l.s>=0&&G.pl[l.s]&&!G.pl[l.s].human;
      if(rival&&UI.hold!==undefined){UI.hold=Date.now()+Math.round(1000/(UI.speed||1))}
      if(l.s>=-1&&!/^A new dungeon|rolls highest/.test(l.t))caption(l.t,rival)}
    // score pops: any hero's level changed
    for(const p of G.pl){const was=PB.lvl[p.i];if(was!=null&&p.lvl!==was){const d=p.lvl-was;const why=((G.log||[]).find(l=>/level|kills?|defeat|beat|wins|sells|reaches/i.test(l.t)&&l.t.indexOf(p.nm)>=0&&l.n>PB.ln-6)||{}).t||'';pop((p.human?'You':p.nm)+' '+(d>0?'+':'')+d+' level'+(Math.abs(d)>1?'s':''),why,d>0)}PB.lvl[p.i]=p.lvl}
  }
  document.addEventListener('click',e=>{const c=e.target.closest&&e.target.closest('#pbCap');if(c){c.classList.remove('on');if(typeof UI!=='undefined')UI.hold=0;if(typeof schedule==='function'){clearTimeout(aiTimer);aiTimer=null;schedule()}}},true);

  // tutorial chapters: a small pill under the progress bar ("Chapter 2 of 4: Your first fight")
  const CH=[['Set up your hero',['goal','elf','powers','bucket','ready','sellbtn','sellpick','sellconfirm']],['Your first fight',['kick','potion','run','bad','end1']],['Rivals and special cases',['curse','meddle','rivals','kick2','trouble','help','who','fight','win','charity']],['Ending the game',['last','finalfight','finale']]];
  setInterval(()=>{let e=document.getElementById('pbChap');let on=false,txt='';
    try{if(typeof GXT!=='undefined'&&GXT.active()){const st=GXT.state();if(st&&st.phase==='show'){const k=CH.findIndex(c=>c[1].includes(st.id));if(k>=0){on=true;txt='Chapter '+(k+1)+' of '+CH.length+': '+CH[k][0]}}}}catch(x){}
    if(!on){if(e)e.remove();return}
    if(!e){e=document.createElement('div');e.id='pbChap';e.className='pbchap';document.body.appendChild(e)}if(e.textContent!==txt)e.textContent=txt;
    const top=document.querySelector('.gxt-top');const r=top?top.getBoundingClientRect():{bottom:44};e.style.top=(r.bottom+2)+'px'},400);

  // phone: a "My cards" pill above the hand opens a big, readable list of the hand (the fanned hand cuts names off)
  function handPill(){let b=document.getElementById('pbHand');
    const ph=document.documentElement.classList.contains('ph');const mine=typeof G!=='undefined'&&G&&!G.winner&&typeof viewSeat==='function'&&viewSeat()>=0&&G.pl[viewSeat()]&&G.pl[viewSeat()].human;
    const hand=document.querySelector('.mine .hand');const tut=typeof GXT!=='undefined'&&GXT.active();
    if(!(ph&&mine&&hand&&!tut&&document.getElementById('modal').hidden&&!(typeof GX!=='undefined'&&GX.open))){if(b)b.remove();return}
    const n=G.pl[viewSeat()].hand.length;if(!n){if(b)b.remove();return}
    if(!b){b=document.createElement('button');b.id='pbHand';b.type='button';b.className='pbhand';b.addEventListener('click',()=>{try{GX.show('dkHand')}catch(e){}});document.body.appendChild(b)}
    const t='\u25B2 My cards ('+n+')';if(b.textContent!==t)b.textContent=t;const r=hand.getBoundingClientRect();b.style.top=(r.top-30)+'px'}
  const _after=after;window.pbAfter=function(){_after();handPill()};
  setInterval(()=>{try{handPill()}catch(e){}},700);
})();
