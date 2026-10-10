// UI bug tests (jsdom, the real built page). Each test reproduces one bug from CLARITY-PLAN.md root cause 2/3 and checks the fix.
// node ui-test.js [path/to/page.html]   (default: thornbound.html next to this file). Exit code 1 on any failure.
const {JSDOM,VirtualConsole}=(()=>{try{return require('../../node_modules/jsdom')}catch(e){return require('jsdom')}})();const fs=require('fs');
const file=process.argv[2]||__dirname+'/thornbound.html';const html=fs.readFileSync(file,'utf8');
function page(phone){return new Promise(res=>{const vc=new VirtualConsole();const errs=[];vc.on('jsdomError',e=>!/getContext|Not implemented/.test(e.message)&&errs.push(String(e.message).slice(0,200)));vc.on('error',(...a)=>errs.push(a.join(' ').slice(0,300)));vc.on('warn',()=>{});
  const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://gns.test/'+(phone?'?phone=1':''),virtualConsole:vc,beforeParse(win){if(phone){Object.defineProperty(win,'innerWidth',{value:390,configurable:true});Object.defineProperty(win,'innerHeight',{value:763,configurable:true})}}});
  dom.window.addEventListener('load',()=>setTimeout(()=>{dom.window.eval('ANIM=0;AIDELAY=0;UI.speed=40');dom.window.__errs=errs;res(dom.window)},200))})}
// helpers evaluated inside the page
const HELP=`
window.T_drive=function(pred,max,level){max=max||6000;for(let i=0;i<max;i++){if(pred())return true;if(!G||G.over||!G.q)return false;const s=G.q.seats[0];const mv=aiChoose(s,level||'normal');if(!mv||!doMove(mv))return false}return pred()};
window.T_view=function(){UI.card=null;UI.evq=[];UI._rk=null;if(typeof NEWS!=='undefined'){NEWS.q=[];NEWS.cur=null}renderAll();return document.querySelector('#main').textContent+' || '+document.querySelector('#act').textContent+' || '+document.querySelector('#barstat').textContent};
`;
const tests=[];const test=(n,f)=>tests.push([n,f]);
// ---------------------------------------------------------------------------------------------------------------------------
test('end breakdown sums exactly to every final score (10 games)',async w=>{const bad=[];
  for(let g=0;g<10;g++){w.eval(`newGame('me',{np:${2+g%3},seed:${400+g}});G.pl[0].ai='normal'`);w.eval(`T_drive(()=>!!G.over,20000)`);
    if(!w.eval('!!G.over'))throw new Error('game '+g+' did not end');
    const h=w.eval('overBreakdown()');const d=w.document.createElement('div');d.innerHTML=h;const lis=[...d.querySelectorAll('.bd2 li')];
    const inf=w.eval('G.pl.map(p=>p.inf)');
    lis.forEach((li,s)=>{const t=(li.querySelector('span')||li).textContent;let sum=0;for(const part of t.split(/,\s*/)){const m=part.replace(/−/g,'-').match(/([+-]?\d+)\s*$/);if(m)sum+=+m[1]}
      if(sum!==inf[s])bad.push('game '+g+' seat '+s+': listed '+sum+' vs score '+inf[s]+' ('+t.slice(0,90)+')')})}
  if(bad.length)throw new Error(bad.slice(0,3).join(' | '))});
test('clash order reason: "least Influence" is not claimed when a Tactic gave the choice to the leader',async w=>{
  w.eval(`newGame('me',{np:2,faction:'clans',seed:5})`);w.eval(`T_drive(()=>G.q&&G.q.kind==='clashOrder',4000)`);
  w.eval(`G.rm.tempests=0;G.pl[0].inf=8;G.pl[1].inf=3;G.q.seats=[0];G.q.o[0]=G.q.o[G.q.seats[0]]||G.q.o[1]`);
  const t=w.eval('T_view()');if(/least Influence/.test(t))throw new Error('screen says: '+t.match(/[^.]*least Influence[^.]*/)[0])});
test('a Tactic with markers is not called "once-only" (Open Waterways can be used once a round, 3 times)',async w=>{
  w.eval(`newGame('me',{np:2,faction:'clans',seed:11})`);const ok=w.eval(`T_drive(()=>G.q&&G.q.t==='menu'&&G.q.seats[0]===0&&TB.moves(G,0).some(m=>m.a==='t:cln_t2'),20000)`);if(!ok)throw new Error('no Open Waterways menu reached');
  w.eval(`UI.moreOpen=true`);const t=w.eval('T_view()')+w.eval(`(typeof GL!=='undefined'&&GL.tactic?GL.tactic[3]:'')`);
  if(/once-only|Each can be used once/i.test(t))throw new Error('text calls Tactics once-only: '+(t.match(/[^.]*(once-only|can be used once)[^.]*/i)||[''])[0])});
test('buying an HQ card: the option says HQ and the card sheet explains it does not go to the hand',async w=>{
  w.eval(`newGame('me',{np:2,faction:'clans',seed:3});G.pl[0].lore=4;TB.test.run(G,[['siteBuy',{seat:0}]])`);
  const t=w.eval('T_view()');if(!/Roving Mission/.test(t)||!/HQ/.test(t))throw new Error('siteBuy screen does not show the HQ option: '+t.slice(0,160));
  const id=w.eval(`G.pl[0].site.find(id=>TB.cardInfo(G,id).kind==='hq')`);const h=w.eval(`popCard(${id})`);
  if(!/(not|never) (a card for|go|goes|come|comes) (in)?(to )?your hand|stays in front of you|permanent/i.test(h))throw new Error('HQ card sheet does not explain it: '+h.replace(/<[^>]*>/g,' ').slice(0,200))});
test('the end-of-round card is not drawn over the next decision (no decision buttons under it)',async w=>{
  w.eval(`newGame('me',{np:3,seed:21})`);const ok=w.eval(`T_drive(()=>UI.evq.some(e=>e.t==='summary'),20000)`);if(!ok)throw new Error('no summary');w.eval(`T_drive(()=>G.q&&G.q.seats.includes(0),200)`);
  w.eval(`UI.evq=UI.evq.filter(e=>e.t==='summary');UI.card=null;pump()`);if(w.eval(`!(UI.card&&UI.card.ev&&UI.card.ev.t==='summary')`))throw new Error('summary card not shown');
  const n=w.document.querySelectorAll('#main [data-a=mv],#act [data-a=mv]').length;if(n)throw new Error(n+' decision buttons are rendered under the end-of-round card')});
test('hand cards keep their place while you hide cards (no reflow under the next tap)',async w=>{
  w.eval(`newGame('me',{np:2,seed:31})`);const ok=w.eval(`T_drive(()=>G.q&&G.q.kind==='place'&&G.q.seats.includes(0)&&G.pl[0].hand.length>=4,4000)`);if(!ok)throw new Error('no place step');
  w.eval('UI.card=null;UI.evq=[];renderAll()');const pos=()=>{const o={};for(const b of w.document.querySelectorAll('#handw .hc'))o[b.dataset.id]=b.style.left;return o};
  const a=pos();const ids=Object.keys(a);const play=ids[0];const k=w.eval(`(TB.moves(G,0).find(m=>m.id===${play})||{}).k`);w.eval(`humanMove(${JSON.stringify(k)});UI.card=null;UI.evq=[];renderAll()`);
  const b=pos();const moved=ids.filter(id=>id!==play&&b[id]!=null&&b[id]!==a[id]);if(moved.length)throw new Error(moved.length+' cards moved after a play: '+moved.map(id=>a[id]+'->'+b[id]).join(', '))});
test('steal shows "your N vs their M" and waits for a confirm instead of acting at once',async w=>{let found=false;
  for(let g=0;g<12&&!found;g++){w.eval(`newGame('me',{np:3,seed:${600+g}})`);found=w.eval(`T_drive(()=>G.q&&G.q.kind==='bidRes'&&G.q.seats[0]===0&&TB.moves(G,0).some(m=>m.t==='steal'),20000)`)}
  if(!found)throw new Error('no steal offer reached');w.eval('UI.card=null;UI.evq=[];renderAll()');
  const k=w.eval(`TB.moves(G,0).find(m=>m.t==='steal').k`);const btn=[...w.document.querySelectorAll('#main [data-k],#act [data-k],#handw [data-k]')].find(b=>b.dataset.k===k);if(!btn)throw new Error('no steal button');
  const n0=w.eval('G.logN');btn.dispatchEvent(new w.MouseEvent('click',{bubbles:true}));if(w.eval('G.logN')!==n0)throw new Error('the steal happened at once, with no preview');
  const t=w.document.body.textContent;if(!/\d+\s*(vs|against)\s*(their\s*)?\d+/i.test(t)&&!/beats/.test(t))throw new Error('no strength comparison shown')});
test('guided game: the first suggested bid is not cancelled by the Court',async w=>{
  w.eval(`newGame('guided')`);w.eval(`UI.coachDone={goal:1,map:1,round:1}`);const k=w.eval(`(getRec(0,TB.moves(G,0))||{}).k`);if(!k)throw new Error('no suggested bid');
  w.eval(`humanMove(${JSON.stringify(k)})`);w.eval(`T_drive(()=>G.bidRev&&G.step==='bidres'||G.q&&G.q.kind==='bidRes',200)`);const b=w.eval(`G.bstr[0]`),p=w.eval(`TB.cardInfo(G,G.pl[0].bid).strength`);if(b!==p)throw new Error('your bid counts '+b+' instead of '+p)});
test('the occupier suggestion and its sentence agree (the "weakest card" is the pick)',async w=>{
  w.eval(`newGame('me',{np:2,faction:'clans',seed:44});const P=G.pl[0];for(const id of P.hand.slice())TB.test.put(G,id,'deck');TB.test.put(G,13,'hand');TB.test.put(G,14,'hand');TB.internal.askPick(0,'occupier','Riverbank Raiders: choose the card from your hand that will occupy it.',P.hand.map(id=>({k:'c'+id,id,label:TB.cardName(G,id)+' ('+TB.cardInfo(G,id).strength+')'})),'raiders',{s2:1,j:0})`);
  w.eval('ANIM=1');const t=w.eval('T_view()');w.eval('ANIM=0');const rec=w.eval(`(UI._rec||{}).id`);if(rec==null)return; // no suggestion is fine
  const weakest=w.eval(`G.pl[0].hand.slice().sort((a,b)=>TB.cardInfo(G,a).strength-TB.cardInfo(G,b).strength)[0]`);
  if(/weakest/i.test(t)&&w.eval(`TB.cardInfo(G,${rec}).strength`)!==w.eval(`TB.cardInfo(G,${weakest}).strength`))throw new Error('sentence says weakest but the pick is '+w.eval(`TB.cardInfo(G,${rec}).name+' ('+TB.cardInfo(G,${rec}).strength+')'`))});
test('Day step warns before a Deadly card eliminates yours (no "nothing else helps")',async w=>{
  w.eval(`newGame('me',{np:2,faction:'clans',seed:8,order:[0,1]});
    const T=TB.test;for(let r=0;r<3;r++){G.reg[r].down=[];G.reg[r].up=[]}
    T.put(G,12,'down',0);T.put(G,106,'down',0);T.put(G,4,'down',1);T.put(G,103,'down',1);T.put(G,5,'down',2);T.put(G,104,'down',2);
    T.giveKC(G,0,46,G.pl[0].hand[0],0);G.cord=[0,1,2];T.run(G,[['startRegion',{i:0}]])`);w.eval(`T_drive(()=>G.q&&G.q.t==='menu'&&G.q.seats[0]===0,40)`);
  if(!w.eval(`G.q&&G.q.t==='menu'&&G.q.seats[0]===0`))throw new Error('no Day menu for you: '+w.eval('G.q&&G.q.kind'));
  const t=w.eval('T_view()');if(/Nothing else here helps/.test(t))throw new Error('says nothing else helps while Poison Physician will eliminate your card');
  if(!/Deadly/.test(t)||!/eliminat/i.test(t))throw new Error('no warning about the Deadly card: '+t.slice(0,240))});
(async()=>{let pass=0,fail=0;for(const [n,f] of tests){const w=await page(false);w.eval(HELP);try{await f(w);pass++;console.log('PASS '+n)}catch(e){fail++;console.log('FAIL '+n+'\n     '+String(e.message).slice(0,400))}
  if(w.__errs.length)console.log('     page errors: '+w.__errs.slice(0,2).join(' | '));w.close()}
  console.log('\nui tests: '+pass+' passed, '+fail+' failed ('+file.replace(/.*\//,'')+')');process.exit(fail?1:0)})();
