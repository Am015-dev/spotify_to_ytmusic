#!/usr/bin/env node
// Clarity regressions found by blind playtests (Oct 2026). Usage: node clarity-test.js kot2.html
const {JSDOM}=require('jsdom');const fs=require('fs');const html=fs.readFileSync(process.argv[2]||'kot2.html','utf8');
function mk(seed){const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'http://localhost/?phone=1'});const w=dom.window;const errs=[];w.addEventListener('error',e=>errs.push(e.message));
  w.eval(`ANIM=0;AIDELAY=0;UI.paused=true;UI.n=4;UI.evo=false;UI.xp='off';DEFEX={};setSeed(${seed||7});newGame('solo');UI.hints=true;`);w.errs=errs;return w}
let pass=0,fail=0;const T=(name,ok,info)=>{if(ok)pass++;else fail++;console.log((ok?'PASS ':'FAIL ')+name+(ok?'':' '+JSON.stringify(info)))};
const g=(w,e)=>w.eval(e);
// 1. "Keep suggested" keeps exactly the dice the outline marks
{let bad=[];for(let s=1;s<=12;s++){const w=mk(s);
  g(w,`G.active=G.pl.findIndex(p=>p.human);UI.choice=null;UI.busy=false;G.phase='roll';G.rolls=2;G.rollId++;G.dice=G.dice.length?G.dice:[];if(!G.dice.length)G.dice=Array.from({length:6},()=>({f:'1',k:false}));G.dice.forEach(d=>{d.k=false;d.f=['1','2','3','H','E','C'][rnd(6)]});render()`);
  const want=g(w,`JSON.stringify(G.dice.map((d,k)=>[...document.querySelectorAll('#dice .die')][k].classList.contains('sugg')))`);
  g(w,`uiAct({act:'hint'})`);const got=g(w,`JSON.stringify(G.dice.map(d=>!!d.k))`);if(want!==got)bad.push({s,want,got})}
 T('Keep suggested keeps exactly the outlined dice',!bad.length,bad.slice(0,3))}
// 2. Moving into an empty Downtown shows its +1 star in the result line itself (the "Why" line is hidden on phones)
{const w=mk(3);g(w,`G.active=G.pl.findIndex(p=>p.human);G.city=-1;UI.choice=null;G.phase='roll';G.rolls=0;G.dice=['1','2','3','E','H','H'].map(f=>({f,k:true}));resolve()`);
 const b=g(w,'UI.banner');T('forced move into Downtown is in the result line',/moves into Downtown[^<]*\+1★/.test(b.split('<div')[0]),b)}
// 3. When your turn comes back, the result line recaps what the computer turns changed, with every logged event on tap
{const w=mk(5);g(w,`UI.paused=true;UI.info=false`);const me=g(w,'G.pl.findIndex(p=>p.human)');
 // play until the human has had one turn and the computers have played after it
 let seen=0,rec='';for(let i=0;i<4000&&seen<3;i++){g(w,`if(UI.choice){const c=UI.choice;UI.choice=null;c.cb(c.cancel?null:c.options[0].k)}`);
   const st=g(w,`JSON.stringify({a:G.active,ph:G.phase,w:G.winner})`);const s=JSON.parse(st);if(s.w)break;
   if(s.a===me&&s.ph==='roll'){seen++;if(seen>=2){rec=g(w,'UI.banner');break}g(w,`resolve()`);}
   else if(s.a===me&&s.ph==='buy'){g(w,`endTurn()`)}
   else g(w,`try{aiStep()}catch(e){}`)}
 T('your next turn opens with a "While you waited" recap that lists the events',/While you waited/.test(rec)&&/<ol class="recap"><li>/.test(rec),rec.slice(0,300))}
console.log(`passed ${pass} failed ${fail}`);process.exit(fail?1:0);
