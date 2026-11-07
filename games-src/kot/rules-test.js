// Rules test (W386): "you can resolve your dice in any order" (rules check, MISSING). Usage: NODE_PATH=... node rules-test.js [kot2.html]
// Dice order: Automatic keeps hearts before claws (no question); Ask me asks when hearts and claws were both rolled and the heart can heal.
const { JSDOM } = require('jsdom'); const fs = require('fs'), path = require('path');
const html = fs.readFileSync(path.resolve(process.argv[2] || path.join(__dirname, 'kot2.html')), 'utf8');
function mk() {
  const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'http://localhost/' }); const w = dom.window;
  w.eval(`ANIM=0;AIDELAY=0;UI.paused=true;UI.n=4;UI.evo=false;UI.xp='trial';DEFEX={};setSeed(7);newGame('ai');
   G.pl.forEach(p=>{p.hp=10;p.vp=0;p.en=0;p.cards=[];p.mb=0;p.hand=[];p.evo=[]});G.city=1;G.bay=-1;G.active=0;G.home=0;G.ncards=undefined;PENDING=[];
   G.pl[0].human=true;G.pl[0].hp=5;window.ORD=[];const _h=heartUse;heartUse=function(){ORD.push('h');return _h.apply(this,arguments)};const _c=clawStep;clawStep=function(){ORD.push('c');return _c.apply(this,arguments)};`);
  return w;
}
const roll = w => w.eval(`G.phase='roll';G.rolls=0;G.dice=['H','H','C','C','3','2'].map(x=>({f:x,k:true}));resolve()`);
let pass = 0, fail = 0; const T = (n, ok, i) => { if (ok) pass++; else fail++; console.log((ok ? 'PASS ' : 'FAIL ') + n + (ok ? '' : ' ' + JSON.stringify(i))) };
{ const w = mk(); roll(w); const o = w.eval('ORD.join("")'), q = w.eval('!!(UI.choice&&UI.choice.title==="Dice order")');
  T('Automatic: hearts then claws, no question', o === 'hc' && !q, { o, q }) }
{ const w = mk(); w.eval(`UI.order='ask'`); roll(w); const q = w.eval('UI.choice&&UI.choice.title'), o0 = w.eval('ORD.join("")');
  T('Ask me: both hearts and claws rolled -> the order question appears before anything resolves', q === 'Dice order' && o0 === '', { q, o0 });
  w.eval(`{const c=UI.choice;UI.choice=null;c.cb('c')}`); const o = w.eval('ORD.join("")'); const hp = w.eval('G.pl[0].hp');
  T('... choosing claws first resolves claws, then hearts', o === 'ch', { o }); T('... the hearts still heal afterwards (5 -> 7)', hp === 7, { hp }) }
{ const w = mk(); w.eval(`UI.order='ask'`); roll(w); w.eval(`{const c=UI.choice;UI.choice=null;c.cb('h')}`); const o = w.eval('ORD.join("")');
  T('Ask me: choosing hearts first keeps the default order', o === 'hc', { o }) }
{ const w = mk(); w.eval(`UI.order='ask';G.city=-1`); w.eval(`G.phase='roll';G.rolls=0;G.dice=['H','H','3','2','1','1'].map(x=>({f:x,k:true}));resolve()`);
  T('Ask me: no claws rolled -> no question', !w.eval('!!(UI.choice&&UI.choice.title==="Dice order")'), {}) }
{ const w = mk(); w.eval(`UI.order='ask';G.city=0`); roll(w);
  T('Ask me: monster in Downtown cannot heal -> no question', !w.eval('!!(UI.choice&&UI.choice.title==="Dice order")'), {}) }
{ const w = mk(); w.eval(`G.goal=6;G.pl[0].human=false;G.pl[1].vp=6;G.active=1;checkWin(true)`); const win = w.eval('G.winner'); const w2 = mk(); w2.eval(`G.pl[1].vp=6;G.active=1;checkWin(true)`);
  T('coached short game: goal 6 wins at 6 stars, a normal game does not', win === 'P2' && !w2.eval('G.winner'), { win, normal: w2.eval('G.winner') }) }
console.log(`${fail ? 'FAIL' : 'PASS'} rules-test ${pass} ok, ${fail} failed`); process.exit(fail ? 1 : 0);
