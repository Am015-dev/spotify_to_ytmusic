// ===================== the GUIDED first game (gameplay gate, W497) =====================
// The tutorial is a real two-player game on the stacked board of tutdata.js, played in a fixed order: each step teaches ONE rule,
// in ONE sentence of 12 words or fewer, with ONE highlighted tap (your move, or Next while Farid's scripted move is shown).
// Every core rule comes up in order: bidding, both markers, moving, last colour, taking, camels, every tribe, every tile,
// Mystics, goods sets and selling, djinns, the round, Shadows' kills, the last camel and the final count. Then a real game.
// Only the highlighted move is accepted while a step waits; Farid's moves are scripted (the AI is held) until the last turn.
// The count (coach.js pages) walks every scoring rule, one page per tap. guide-test.js walks it all by touch.
const GD=(()=>{
  const B=(spot)=>({act:'bid',spot}),S=(tile)=>({act:'start',tile}),D=(tile,c)=>({act:'step',tile,c});
  // who: 'me' = your highlighted move m; 'note' = Next (ms = Farid's moves played on Next); 'auto' = Farid's move played at once, no bubble
  const STEPS=[
   {id:'goal',who:'note',say:'Most points wins. Coins, land, people, goods and djinns score.'},
   {id:'bid',who:'me',m:B(5),say:'Bid for turn order: dearer spots play first. Tap 1 coin.'},
   {id:'bidfree',who:'note',ms:[B(6)],say:'Farid takes a free spot. Paid coins go to the bank.'},
   {id:'markers',who:'me',m:B(7),say:'Two players: you have two markers. Take a free spot.'},
   {id:'order',who:'note',ms:[B(8)],say:'Same price: the later bidder plays first. Farid goes second.'},
   {id:'lift',who:'me',m:S(24),say:'Your turn. Tap a tile to lift everyone on it.'},
   {id:'drop',who:'me',m:D(25,'merchant'),say:'Drop one per tile: up, down, left or right.'},
   {id:'noback',who:'me',m:D(26,'merchant'),say:'Never step straight back. Drop the next one onward.'},
   {id:'lastcolour',who:'me',m:D(27,'merchant'),say:'The last one must land on its own colour.'},
   {id:'take',who:'note',say:'You take every Trader there. Emptied tile: your camel claims it.'},
   {id:'traders',who:'me',m:{act:'tribe'},say:'Traders bring goods from the front of the row. Collect.'},
   {id:'stall',who:'me',m:{act:'tile',take:[2]},say:'Bazaar Stall: 3 coins buys one of the first three. Take this.'},
   {id:'mystics',who:'note',say:'Mystics help Masons, Shadows and shrines. They never score.'},
   {id:'sell',who:'me',m:{act:'sell',kinds:['fish','silk','wheat']},say:'Three different goods sell for 7 coins. Sell them.'},
   {id:'done',who:'me',m:{act:'end'},say:'Selling is the last part of a turn. Tap End turn.'},
   {id:'sages',who:'note',ms:[S(11),D(10,'elder'),D(9,'elder'),D(8,'elder'),{act:'tribe'}],say:'Farid takes four Sages. Each Sage is worth 2 points.'},
   {id:'shrine',who:'note',ms:[{act:'tile',dj:'wazira',pay:{el:2,fk:0}},{act:'end'}],say:'At a Shrine two Sages summon a djinn: points and a power.'},
   {id:'choose',who:'me',m:S(19),say:'Lift this mixed tile. You choose which colour drops where.'},
   {id:'chz',who:'me',m:D(20,'vizier'),say:'Drop an Advisor here. Keep the Mason for the end.'},
   {id:'pass',who:'me',m:D(21,'vizier'),say:'Any tile can be passed through. The other Advisor here.'},
   {id:'masonland',who:'me',m:D(15,'builder'),say:'The Mason lands on Masons. You take all four.'},
   {id:'masons',who:'me',m:{act:'tribe',fk:1},say:'Masons earn coins per blue tile around. Your Mystic adds one.'},
   {id:'hamlet',who:'me',m:{act:'tile',place:15},say:'Hamlet: you must raise a palace. Palaces score 5.'},
   {id:'done2',who:'me',m:{act:'end'},say:'Nothing to sell. Tap End turn.'},
   {id:'advisors',who:'note',ms:[S(5),D(4,'vizier'),D(3,'vizier'),D(2,'vizier'),{act:'tribe'}],say:'Advisors: 1 point each, plus 10 per rival with fewer.'},
   {id:'oasis',who:'note',ms:[{act:'tile',place:2},{act:'end'}],say:'Oasis: a palm tree must grow there. Palms score 3.'},
   {id:'round',who:'note',say:'Round over: goods and djinns refill. Bid again in play order.'},
   {id:'bid2',who:'me',m:B(6),say:'This time take a free spot.'},
   {id:'r2a',who:'auto',ms:[B(7)]},
   {id:'bid3',who:'me',m:B(8),say:'Your second marker takes the last free spot.'},
   {id:'zeros',who:'note',ms:[B(5)],say:'Only three free spots: Farid must pay, so he plays first.'},
   {id:'bazaar',who:'note',ms:[S(12),D(13,'builder'),D(19,'assassin'),D(18,'merchant'),{act:'tribe'},{act:'tile',take:[0,1]},{act:'end'}],say:'Grand Bazaar: Farid pays 6 coins for two of the first six.'},
   {id:'lift3',who:'me',m:S(29),say:'Lift these three. A Shadow will end on Shadows.'},
   {id:'s1',who:'me',m:D(28,'vizier'),say:'The Advisor drops here.'},
   {id:'s2',who:'me',m:D(22,'merchant'),say:'The Trader drops here.'},
   {id:'s3',who:'me',m:D(23,'assassin'),say:'The Shadow joins three Shadows. Take all four.'},
   {id:'end',who:'note',say:'That was your last camel: the game ends after this round.'},
   {id:'shadows',who:'me',m:{act:'tribe',kill:{pl:1,c:'vizier',fk:0}},say:'Shadows kill in reach, or a rival’s Advisor. Tap Farid’s glowing box.'},
   {id:'noaction',who:'me',m:{act:'tile',skip:1},say:'A Shrine needs two Sages. You have none: skip it.'},
   {id:'done3',who:'me',m:{act:'end'},say:'Tap End turn.'},
   {id:'rival',who:'note',ms:[S(21),D(15,'assassin'),D(9,'merchant'),D(8,'vizier'),D(7,'builder'),{act:'tribe'},{act:'tile',dj:'nakhla',pay:{el:2,fk:0}},{act:'end'}],say:'Farid plays by the same rules: Masons, then another djinn.'},
   {id:'lift4',who:'me',m:S(1),say:'Last turn. Lift this tile.'},
   {id:'t1',who:'me',m:D(7,'vizier'),say:'Drop the Advisor here.'},
   {id:'t2',who:'me',m:D(13,'assassin'),say:'Drop the Shadow here.'},
   {id:'t3',who:'me',m:D(14,'elder'),say:'The Sage lands on a Shrine holding a Sage.'},
   {id:'sages2',who:'me',m:{act:'tribe'},say:'You keep Sages: 2 points each, and they pay for djinns.'},
   {id:'summon',who:'me',m:{act:'tile',dj:'wahha',pay:{el:2,fk:0}},say:'Summon Wahha with your two Sages.'},
   {id:'power',who:'me',m:{act:'djinn',k:'wahha',t:22,pay:{el:0,fk:1}},say:'Use its power once per turn: pay your Mystic, plant a palm.'},
   {id:'last',who:'me',m:{act:'end'},say:'Tap End turn. The round ends, then the game.'}];
  return {STEPS,i:0,on:false,busy:false};
})();
const gdStep=()=>GD.on&&G&&G.coach&&!G.over?GD.STEPS[GD.i]||null:null;
function guideHeld(){return !!gdStep()}
const gdEq=(a,b)=>{const k=v=>JSON.stringify(v,(q,x)=>x&&typeof x==='object'&&!Array.isArray(x)?Object.keys(x).sort().reduce((o,z)=>(o[z]=x[z],o),{}):x);return k(a)===k(b)};
function guideBegin(){GD.on=true;GD.i=0;GD.busy=false;GD.told=[];document.body.classList.add('guiding')}
function guideEnd(){GD.on=false;GD.busy=false;document.body.classList.remove('guiding');document.querySelectorAll('.gd-hl').forEach(e=>e.classList.remove('gd-hl'))}
function gdNext(){GD.i++;GD.busy=false;if(!GD.STEPS[GD.i]){guideEnd();try{schedule()}catch(e){}}try{render()}catch(e){}}
// Farid's scripted moves, one every 0.6 s so they can be watched; 'ai' = his own computer turn
function gdPlay(ms,done){GD.busy=true;const q=ms==='ai'?null:ms.slice();
  const tick=()=>{if(!G||G.over){GD.busy=false;return}
    if(q){if(!q.length)return done();const m=q.shift();GD.go(m)}
    else{if(sideToAct()!==1||G.phase!=='turn')return done();const m=aiMove(1);if(!m)return done();GD.go(m)}
    setTimeout(tick,ANIM?650:0)};tick()}
// the move the current step asks for (also what the hint finger points at)
function gdTarget(st){if(!st)return null;const q=s=>document.querySelector(s);
  if(st.who!=='me')return q('#coach button');
  const m=st.m;if(UI.chz){const j=UI.chz.opts.findIndex(o=>gdEq(o.m,m));if(j>=0)return q(`[data-chz="${j}"]`)}
  if(m.act==='djinn'){if(UI.pendDj&&UI.pendDj.k===m.k)return tileEl(m.t);return [...document.querySelectorAll('[data-pw]')].find(b=>{try{return JSON.parse(b.dataset.pw).k===m.k}catch(e){return false}})||null}
  if(m.act==='tribe'&&m.kill){if(m.kill.pl!=null)return q(`[data-seat="${m.kill.pl}"]`);return tileEl(m.kill.tile)}
  let el=null;try{el=fingerEl(m)}catch(e){}
  if(!el&&m.act==='sell'){el=[...document.querySelectorAll('[data-mv]')].find(b=>{try{const x=JSON.parse(b.dataset.mv);return x.act==='sell'&&gdEq(x,m)}catch(e){return false}})||null;
    if(!el){const k=m.kinds.find(r=>!(UI.sellSel||[]).includes(r));el=k?q(`[data-sell="${k}"],[data-res="${k}"]`):null}}
  return el}
function guideDraw(){const st=gdStep();document.querySelectorAll('.gd-hl').forEach(e=>e.classList.remove('gd-hl'));if(!st)return;
  if(st.who==='auto'){if(!GD.busy&&!UI.modal)gdPlay(st.ms,gdNext);return}
  if(UI.modal&&UI.modal!=='goal')return;if(UI.modal==='goal'){UI.modal=null}
  const e=coachEl();if(COACH.cur!=='gd:'+st.id){clearTimeout(COACH.t);e.querySelector('i').textContent=LORE.guide.face;
    e.querySelector('span').innerHTML='<b>'+esc(LORE.guide.name)+' · '+GD.STEPS.slice(0,GD.i+1).filter(s=>s.say).length+'/'+GD.STEPS.filter(s=>s.say).length+'</b>'+esc(st.say);
    COACH.cur='gd:'+st.id;COACH.shownAt=Date.now();if(!GD.told.includes(st.id))GD.told.push(st.id);
    const tc=document.getElementById('turnover');if(tc)tc.classList.remove('on');e.classList.add('on');try{fit()}catch(x){}}
  clearTimeout(COACH.t);e.classList.add('on');const b=e.querySelector('button');b.hidden=st.who==='me';b.textContent=GD.busy?'…':'Next ▶';b.setAttribute('aria-label','Next');
  const t=gdTarget(st);if(t&&!GD.busy)t.classList.add('gd-hl')}
// the bubble's button is Next while the guide runs (captured before the coach's own "Got it")
function gdHook(){const e=coachEl();if(e.dataset.gd)return;e.dataset.gd='1';
  e.addEventListener('click',ev=>{const st=gdStep();if(!st)return;ev.stopImmediatePropagation();ev.stopPropagation();if(st.who!=='note'||GD.busy||!ev.target.closest('button'))return;
    if(st.ms)gdPlay(st.ms,gdNext);else gdNext()},true)}
// only the highlighted move is accepted while a step waits for you
(function(){const og=go;GD.go=og;go=function(m){const st=gdStep();
  if(st&&sideToAct()===0&&P(0).human){if(st.who!=='me'||GD.busy||!gdEq(m,st.m)){toast('Tap the glowing spot.');try{render()}catch(e){}return}
    og(m);gdNext();return}
  return og(m)}})();
// while guided: no free coach tips, the hint finger shows the step's move
(function(){const oc=coachAfter;coachAfter=function(){if(gdStep()){gdHook();return guideDraw()}return oc.apply(this,arguments)}})();
(function(){if(typeof hlpAdvice!=='function')return;const oh=hlpAdvice;hlpAdvice=function(){const st=gdStep();if(st)return st.who==='me'?st.m:null;return oh.apply(this,arguments)}})();
window.GXGUIDE={get running(){return !!gdStep()},get step(){const s=gdStep();return s?{id:s.id,who:s.who,say:s.say||'',i:GD.i,busy:GD.busy}:null},get told(){return (GD.told||[]).slice()},
  get ids(){return GD.STEPS.filter(s=>s.say).map(s=>s.id)},get steps(){return GD.STEPS.filter(s=>s.say).map(s=>({id:s.id,say:s.say,who:s.who}))}};
// while a step waits for you, only its own target glows (a Shadow step that wants a rival's Advisor lights the seat, not 16 tiles)
(function(){const oc=computePick;computePick=function(){oc.apply(this,arguments);const st=gdStep();if(!st||st.who!=='me'||!st.m)return;const m=st.m;
  if(m.act==='tribe'&&m.kill){UI.pick=m.kill.tile!=null?[m.kill.tile]:[];UI.pickSeat=m.kill.pl!=null?[m.kill.pl]:[]}}})();
