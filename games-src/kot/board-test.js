#!/usr/bin/env node
// Board-first regressions (phone layer, board.js). Usage: node board-test.js kot2.html
const {JSDOM}=require('jsdom');const fs=require('fs');const html=fs.readFileSync(process.argv[2]||'kot2.html','utf8');
function mk(seed){const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'http://localhost/?phone=1'});const w=dom.window;const errs=[];w.addEventListener('error',e=>errs.push(e.message));
  w.eval(`ANIM=0;AIDELAY=0;UI.paused=true;UI.n=4;UI.evo=false;UI.xp='off';DEFEX={};setSeed(${seed||7});newGame('solo');UI.intro=false;render()`);w.errs=errs;return w}
let pass=0,fail=0;const ok=(c,m)=>{if(c){pass++;console.log('PASS',m)}else{fail++;console.log('FAIL',m)}};
const click=(w,el)=>el.dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
const words=t=>t.trim().split(/\s+/).filter(x=>x&&!/^[·★⚡♥]$/.test(x)).length;
// 1. the score strip lives in the top bar
{const w=mk(3);const d=w.document;w.eval('PHONE.land=false;render()');ok(d.querySelector('header.gx-bar #pchips .pchip'),'portrait: monster chips sit in the top bar (score strip)');w.eval('PHONE.land=true;render()');ok(d.querySelector('.gx-dock > #pchips .pchip'),'landscape: the chips go back to the rail');
  ok(d.querySelectorAll('#menuwrap [data-bfm]').length===4,'the menu holds Cards, Yours, Monsters and Log');w.close()}
// 2. buying is tapping the card in the market: a tap shows a card, a tap on the shown (or starred) card buys it; a card you cannot afford never buys
{const w=mk(11);const d=w.document;w.eval(`while(!humanTurn()){G.active=(G.active+1)%G.pl.length}G.phase='buy';G.step=4;cur().en=20;render()`);
  const t0=d.querySelector('#pshop [data-shop="0"]');ok(t0,'the shop shows three cards in the tray');
  const n0=w.eval('cur().cards.length+G.disc.length'),e0=w.eval('cur().en'),id=w.eval('G.market[0]');
  ok(d.getElementById('btip').textContent.length>10,'a card\'s text sits on the board in the buy step');
  const fk=w.eval('suggestCard(cur())');const k2=fk===0?1:0;click(w,d.querySelector(`#pshop [data-shop="${k2}"]`));ok(w.eval('cur().en')===e0&&w.eval('BF.sel')===k2,'a tap on another card shows it (no purchase)');
  ok(/again to buy/.test(d.getElementById('bline').textContent),'the line says tap it again to buy');
  click(w,d.querySelector(`#pshop [data-shop="${k2}"]`));ok(w.eval('cur().en')<e0,'a tap on the shown card buys it');
  w.eval(`cur().en=0;BF.sel=-1;render()`);const e1=w.eval('cur().en'),m1=JSON.stringify(w.eval('G.market'));
  click(w,d.querySelector('#pshop [data-shop="1"]'));click(w,d.querySelector('#pshop [data-shop="1"]'));
  ok(w.eval('cur().en')===e1&&JSON.stringify(w.eval('G.market'))===m1,'a card you cannot afford is never bought');
  ok(/Need|only|can/i.test(d.getElementById('bline').textContent),'the line says why it cannot be bought');w.close()}
// 3. one short line (<= 8 words) for every state
{const w=mk(5);const d=w.document;const seen=[];
  for(let s=0;s<300&&!w.eval('G.winner');s++){w.eval(`if(UI.choice){const c=UI.choice;UI.choice=null;c.cb(c.options[0].k)}else if(humanTurn()){if(G.phase==='roll'){if(Math.random()<.5&&G.rolls>0){G.dice[0].k=true;doReroll('roll')}else resolve()}else if(G.phase==='buy')endTurn()}else aiStep();render()`);
    const t=d.getElementById('bline').textContent;if(t)seen.push(t)}
  const long=[...new Set(seen)].filter(t=>words(t)>8);ok(seen.length>20&&!long.length,'every line has at most 8 words'+(long.length?': '+long.join(' | '):''));ok(!w.errs.length,'no errors in a played game '+w.errs.slice(0,2).join(' '));w.close()}
// 4. knocked out in a solo game: fast forward and a New game button
{const w=mk(9);const d=w.document;w.eval(`const me=G.pl[meSeat()];me.hp=0;me.alive=false;G.active=(meSeat()+1)%G.pl.length;render()`);
  ok(d.getElementById('bko')&&!d.getElementById('bko').hidden,'a knocked-out player gets a New game button');ok(w.eval('AIDELAY')<=140,'the rest of the game plays fast');ok(/knocked out/.test(d.getElementById('bline').textContent),'the line says you are knocked out');w.close()}
console.log(`passed ${pass} failed ${fail}`);process.exit(fail?1:0)
