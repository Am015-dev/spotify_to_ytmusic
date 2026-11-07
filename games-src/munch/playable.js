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
    if(!ANIM||G.winner){PB.ln=G.ln||0;return}
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
  window.pbAfter=after;
})();
