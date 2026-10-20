/* ---------- novelty.js: a late-run escalation layer (owner 20 Oct 2026: "the game is boring, repetitive, needs to be more creative"). Flag RET.novelty (default OFF for now, ?novelty=1 = on); off = the old game (no hooks act, no GR draws).
   It keeps a session clock (game seconds summed over stages) and a codex of what the player has seen (localStorage 'nr-novelty'), and always prefers the unseen:
     TWISTS   from session minute 8 (all of them by minute 28) a wave that already came in the last 5 min comes back with a twist from the deck: swift (+12% speed), armored (x1.5 hp, ring), gilded (x2 score, gold), tiny (r x0.85),
              lead (the first unit is a x2 hp leader worth x3), later combos of two. The wave id the director logs becomes id^twist. No twist adds bullets, telegraphs and gaps are untouched.
     EPOCHS   every 20 session-min a remix epoch: a new skin set (shape outline + colour on every enemy) and one more twist in the deck; banner REMIX + rule 'epoch:n'.
     EVENTS   every 5 session-min (no boss, not tutorial/lab) a mini-event with a 1.2 s tell and a reward: ambush (column with a 140 px gap), treasure convoy (gilded, x3 score),
              rest stop (+1 hp), rush (one armored gunship, x2 score), rival duel (an elite arrowhead). Later laps carry a twist (ev:ambush^swift).
     UNLOCKS  every 12 session-min a milestone with a NEW card: it adds a twist, an event or a skin to the decks, so hour 3 still brings something new.
   All art is placeholder shapes with stable ids (nv-skin-*, nv-tw-*, nv-ev-*): see ASSETS-NEEDED-2.md. ---------- */
if(RET.novelty===undefined)RET.novelty=/[?&]novelty=1/.test(location.search);   // default OFF until vary-test (sandwich/wave spawn-near-ship) and variants-test (stage 45 looks) pass with it on
const NOV=window.NOV={T:(()=>{try{return +sessionStorage.getItem('nr-novelty-T')||0;}catch(e){return 0;}})(),lt:0,ep:0,evN:0,unN:0,last:{},buf:[],pend:[],stat:{tw:0,ev:0,un:0,ep:0,byTw:{},byEv:{}},
  EPM:20*60,EVM:5*60,UNM:12*60,REP:300,
  SK:[{id:'nv-skin-base',sh:'',c:''},{id:'nv-skin-tri',sh:'tri',c:'#7df9ff'},{id:'nv-skin-dia',sh:'dia',c:'#ff7ad9'},{id:'nv-skin-ring',sh:'ring',c:'#ffd166'},{id:'nv-skin-hex',sh:'hex',c:'#9dff7a'},{id:'nv-skin-star',sh:'star',c:'#c9a0ff'},{id:'nv-skin-sq',sh:'sq',c:'#ff9f5a'}],
  tw:['swift','armored'],ev:['ambush','convoy','rest'],
  /* milestones, in order: each adds to a deck (twist / event / combo) */
  UN:[{id:'unlock:tw-gilded',nm:'Gilded waves',tw:'gilded'},{id:'unlock:ev-rush',nm:'Rush event',ev:'rush'},{id:'unlock:tw-tiny',nm:'Tiny swarms',tw:'tiny'},{id:'unlock:ev-duel',nm:'Rival duel',ev:'duel'},
    {id:'unlock:tw-lead',nm:'Wave leaders',tw:'lead'},{id:'unlock:combo-swift-armored',nm:'Combo: swift + armored',tw:'swift+armored'},{id:'unlock:combo-tiny-swift',nm:'Combo: tiny + swift',tw:'tiny+swift'},
    {id:'unlock:combo-lead-gilded',nm:'Combo: lead + gilded',tw:'lead+gilded'},{id:'unlock:combo-armored-tiny',nm:'Combo: armored + tiny',tw:'armored+tiny'},{id:'unlock:combo-lead-swift',nm:'Combo: lead + swift',tw:'lead+swift'},
    {id:'unlock:combo-gilded-tiny',nm:'Combo: gilded + tiny',tw:'gilded+tiny'},{id:'unlock:combo-armored-lead',nm:'Combo: armored + lead',tw:'armored+lead'},{id:'unlock:combo-swift-gilded',nm:'Combo: swift + gilded',tw:'swift+gilded'},
    {id:'unlock:combo-tiny-lead',nm:'Combo: tiny + lead',tw:'tiny+lead'},{id:'unlock:combo-armored-gilded',nm:'Combo: armored + gilded',tw:'armored+gilded'}],
  EPTW:['swift+tiny','armored+swift','gilded+lead','tiny+armored','lead+tiny','gilded+swift','swift+lead','tiny+gilded'],
  s:0x2f6b1d,rr(){let t=(this.s=(this.s+0x6D2B79F5)>>>0);t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;},   // private stream: GR is never drawn
  cx:null,codex(){if(!this.cx){this.cx={};try{const o=JSON.parse(localStorage.getItem('nr-novelty')||'{}');if(o&&typeof o==='object')this.cx=o;}catch(e){}}return this.cx;},
  see(k){const c=this.codex();if(c[k])return false;c[k]=1;try{localStorage.setItem('nr-novelty',JSON.stringify(c));}catch(e){}return true;},
  on(){return RET.novelty&&!G.tut&&!G.lab;},
  ramp(){return Math.min(1,Math.max(0,(this.T-480)/1200));},   // twists ease in: none before session minute 8, every repeat from minute 28
  skin(){return this.SK[this.ep%this.SK.length];},
  /* the twist for a wave: none if its base has not come in the last 5 min; else unseen (base^tw) first, then the one used least recently */
  pick(base){const L=this.last[base];this.last[base]=this.T;if(L==null||this.T-L>this.REP)return'';if(this.rr()>=this.ramp())return'';
    const dk=this.tw,c=this.codex(),un=dk.filter(t=>!c[base+'^'+t]);
    if(un.length)return un[Math.floor(this.rr()*un.length)];
    let best=dk[0],bt=1e18;for(const t of dk){const u=this.last[base+'^'+t];const v=u==null?-1:u;if(v<bt){bt=v;best=t;}}return best;},
  twist(e,tw){if(!e||e.type==='boss'||e.nvx)return;e.nvx=tw;const p=tw.split('+');
    for(const k of p){if(k==='swift'){if(e.tk)e.tk*=1.12;if(typeof e.vx==='number')e.vx*=1.12;}
      else if(k==='armored'){e.hp=Math.ceil(e.hp*1.5);e.max=Math.max(e.max||0,e.hp);}
      else if(k==='gilded')e.score=Math.round((e.score||100)*2);
      else if(k==='tiny')e.r=Math.max(7,Math.round(e.r*.85));}},
  lead(es){const e=es.find(x=>x&&x.type!=='boss');if(!e)return;e.nvl=1;e.hp=Math.ceil(e.hp*2);e.max=Math.max(e.max||0,e.hp);e.score=Math.round((e.score||100)*3);},
  /* ---- the session clock (beats only tick while a run plays) ---- */
  tick(){const d=G.t-this.lt;this.lt=G.t;if(!(d>0&&d<5))return;this.T+=d;if((this.sv=(this.sv||0)+d)>10){this.sv=0;try{sessionStorage.setItem('nr-novelty-T',String(Math.round(this.T)));}catch(e){}}if(!this.on())return;
    const ep=Math.floor(this.T/this.EPM);if(ep>this.ep){this.ep=ep;this.stat.ep++;const sk=this.skin(),x=this.EPTW[(ep-1)%this.EPTW.length];if(this.tw.indexOf(x)<0)this.tw.push(x);
      if(!(G.banner&&G.banner.t>0))banner('REMIX',sk.sh?sk.sh.toUpperCase()+' SET · NEW TWIST':'NEW TWIST',false,2.4);NR.emit('rule',{id:'epoch:'+ep+':'+sk.id});}
    const un=Math.floor(this.T/this.UNM);if(un>this.unN&&this.unN<this.UN.length){const u=this.UN[this.unN++];this.stat.un++;if(u.tw&&this.tw.indexOf(u.tw)<0)this.tw.push(u.tw);if(u.ev&&this.ev.indexOf(u.ev)<0)this.ev.push(u.ev);
      if(!(G.banner&&G.banner.t>0))banner('NEW',u.nm,false,2.6);this.see(u.id);NR.emit('rule',{id:u.id});}
    const en_=Math.floor(this.T/this.EVM);if(en_>this.evN&&!G.boss&&!G.dead){this.evN=en_;this.event();}
    for(let i=this.pend.length-1;i>=0;i--)if(this.T>=this.pend[i].at){const p=this.pend.splice(i,1)[0];try{p.f();}catch(err){}}},
  /* ---- mini-events: a tell, then the event 1.2 s later (unseen event^twist first) ---- */
  event(){const c=this.codex(),lap=this.evN>this.ev.length;let ks=this.ev.filter(k=>!c['ev:'+k]);
    let k=ks.length?ks[Math.floor(this.rr()*ks.length)]:this.ev[Math.floor(this.rr()*this.ev.length)],tw='';
    if(!ks.length&&lap){const t=this.tw.filter(t=>t.indexOf('+')<0&&!c['ev:'+k+'^'+t]);if(t.length)tw=t[Math.floor(this.rr()*t.length)];}
    const id='ev:'+k+(tw?'^'+tw:'');this.see('ev:'+k);if(tw)this.see(id);this.stat.ev++;this.stat.byEv[k]=(this.stat.byEv[k]|0)+1;
    const tell={ambush:['AMBUSH','a column with one gap'],convoy:['TREASURE CONVOY','gold ships: x3 score'],rest:['REST STOP','+1 hull'],rush:['RUSH','one armored gunship: x2'],duel:['RIVAL','an elite duelist']}[k];
    banner(tell[0],tell[1],k==='ambush'||k==='rush',1.8);NR.emit('rule',{id});
    this.pend.push({at:this.T+1.2,f:()=>this.run(k,tw)});},
  run(k,tw){if(G.dead||!this.on())return;const out=[];
    if(k==='ambush'){const gy=110+this.rr()*(H-220),gap=140;for(let y=40;y<=H-40;y+=56)if(Math.abs(y-gy)>gap/2+14)out.push(en('drone',{x:W+40,y}));}
    else if(k==='convoy'){for(let i=0;i<3;i++){const e=en('drone',{x:W+40+i*60,y:H*.3+i*H*.2});e.hp=Math.ceil(e.hp*3);e.max=e.hp;e.score=Math.round((e.score||100)*3);e.nvx='gilded';out.push(e);}}
    else if(k==='rest'){if(P.hp<P.max){P.hp++;floater(P.x,P.y-30,'+1 HULL','#9dff7a');}}
    else if(k==='rush'){const e=en('gunship',{x:W+60,y:H/2});e.score=Math.round((e.score||1200)*2);e.nvx='armored';out.push(e);}
    else if(k==='duel'){const e=en('drone',{x:W+40,y:H/2});e.el=1;e.hp=Math.round(e.hp*4);e.max=e.hp;e.r=Math.round(e.r*1.25);e.score=Math.round((e.score||180)*4);e.nvl=1;out.push(e);}
    if(tw)for(const e of out)this.twist(e,tw);},
  /* ---- wave hook: the units this pattern spawned this frame get the twist ---- */
  wave(x){if(!this.on()||!x||!x.id||/^sig:/.test(x.id))return;const base=String(x.id),es=this.buf.filter(b=>b[0]===G.t).map(b=>b[1]);this.buf.length=0;
    const tw=this.pick(base);if(!tw)return;this.last[base+'^'+tw]=this.T;this.see(base+'^'+tw);this.stat.tw++;this.stat.byTw[tw]=(this.stat.byTw[tw]|0)+1;
    const ps=tw.split('+');if(ps.indexOf('lead')>=0)this.lead(es);for(const e of es)this.twist(e,tw);
    if(this.lastI&&this.lastI.t===G.t)this.lastI.I.nvx=tw;x.id=base+'^'+tw;},
  /* ---- draw: twist marks always, the epoch skin from epoch 1 ---- */
  mark(e){if(!RET.novelty||e.type==='boss')return;const sk=this.ep?this.skin():null;if(!e.nvx&&!e.nvl&&!(sk&&sk.sh))return;
    ctx.save();ctx.translate(e.x,e.y);ctx.lineWidth=2;const r=e.r+5;
    if(sk&&sk.sh){ctx.strokeStyle=sk.c;ctx.globalAlpha=.75;ctx.beginPath();const n={tri:3,dia:4,hex:6,star:10,sq:4}[sk.sh]||0;
      if(!n)ctx.arc(0,0,r,0,7);else for(let i=0;i<=n;i++){const a=(sk.sh==='sq'?Math.PI/4:-Math.PI/2)+i*2*Math.PI/n,q=sk.sh==='star'&&i%2?r*.55:r;ctx[i?'lineTo':'moveTo'](Math.cos(a)*q,Math.sin(a)*q);}ctx.stroke();ctx.globalAlpha=1;}
    const tw=e.nvx||'';
    if(tw.indexOf('armored')>=0){ctx.strokeStyle='#cfe3ff';ctx.beginPath();ctx.arc(0,0,r+4,0,7);ctx.stroke();}
    if(tw.indexOf('gilded')>=0){ctx.fillStyle='#ffd166';for(let i=0;i<3;i++){const a=i*2.09+(G.t*2);ctx.beginPath();ctx.moveTo(Math.cos(a)*r,Math.sin(a)*r-4);ctx.lineTo(Math.cos(a)*r+3,Math.sin(a)*r);ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r+4);ctx.lineTo(Math.cos(a)*r-3,Math.sin(a)*r);ctx.fill();}}
    if(tw.indexOf('swift')>=0){ctx.strokeStyle='#7df9ff';ctx.beginPath();ctx.moveTo(r+2,-5);ctx.lineTo(r+12,0);ctx.lineTo(r+2,5);ctx.stroke();}
    if(tw.indexOf('tiny')>=0){ctx.fillStyle='#9dff7a';ctx.beginPath();ctx.arc(0,-r-3,2.5,0,7);ctx.fill();}
    if(e.nvl){ctx.fillStyle='#ff7ad9';ctx.beginPath();ctx.moveTo(-7,-r-2);ctx.lineTo(0,-r-12);ctx.lineTo(7,-r-2);ctx.closePath();ctx.fill();}
    ctx.restore();}};
NR.on('spawn',e=>{if(RET.novelty){NOV.buf.push([G.t,e]);if(NOV.buf.length>60)NOV.buf.shift();}});
NR.on('fmUnit',x=>{if(!RET.novelty||!x)return;NOV.lastI={t:G.t,I:x.I};if(x.I&&x.I.nvx&&x.e&&!x.e.nvx&&x.e.t===0&&NOV.buf.every(b=>b[1]!==x.e||b[0]!==G.t))NOV.twist(x.e,x.I.nvx);});
NR.on('pattern',x=>{try{NOV.wave(x);}catch(err){}});
NR.on('kill',x=>{const e=x&&x.e;if(!RET.novelty||!e||x.boss||!window.SH||!(e.nvx||e.nvl))return;const tw=e.nvx||'';   // tougher units pay for their extra hull (econ stays ~10-12 h)
  NOV.na=(NOV.na||0)+(tw.indexOf('armored')>=0?.5:0)+(e.nvl?1:0)+(tw.indexOf('gilded')>=0?.25:0);while(NOV.na>=1){NOV.na--;try{SH.award(e,1);}catch(err){}}});
NR.on('beat',()=>{if(RET.novelty)try{NOV.tick();}catch(err){}});
NR.on('runStart',()=>{NOV.lt=0;NOV.buf.length=0;NOV.pend.length=0;});
{const de=drawEnemy;drawEnemy=function(e,t){de(e,t);try{NOV.mark(e);}catch(err){}};NOV.drawE=(e,t)=>drawEnemy(e,t);}   // (drawE: the test draws through the real hook)
