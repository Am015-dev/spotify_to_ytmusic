// Newcomer-vs-Easy survival sim (headless, real data.js/engine.js/exp.js/ai.js). Seat 0 plays like a first-timer:
// keeps pairs/claws/energy, hearts only when hurt, uses every roll, buys the first affordable card, stays in Downtown until <=5 hearts.
// Usage: node newb-sim.js [games=60] [level=easy] [seed0=1]   prints win rate, KO rate, avg length.
const vm=require('vm'),fs=require('fs'),path=require('path');
const pre=`var ANIM=0,AIDELAY=0,DEFN=4,DEFX='base',DEFEVO=false,YA=3,YB=0,MBT=8,DEFLV='easy',LVMIX=null,DEFEX=null;const SAVE='x';
const FACES=['1','2','3','E','C','H'];const MONS=[0,1,2,3,4,5,6,7,8].map(i=>({n:'M'+i}));
function render(){};function sfx(){};function snd(){};function refresh(){};function fx(){};`;
const files=['data.js','engine.js','exp.js','ai.js'];
const src=pre+files.map(f=>fs.readFileSync(path.join(__dirname,f),'utf8')).join('\n');
const Q=[];const ctx=vm.createContext({console,setTimeout:(f)=>{Q.push(f);return Q.length},clearTimeout(){},setInterval:()=>0,clearInterval(){},localStorage:{setItem(){},getItem(){return null}},document:{},window:{}});
vm.runInContext(src,ctx);const S=e=>vm.runInContext(e,ctx);
S(`const _am=aiMark;aiMark=function(p){if(p.lvl!=='newb')return _am(p);
 const c=counts(),inT=inCity(p.i),miss=maxhp(p)-p.hp;let hw=inT?0:(p.hp<7?miss:0);let hk=0;
 G.dice.forEach(d=>{let k=false;if(d.t==='b'){d.k=d.f!=='O';return}if(d.t==='f'){d.k=d.f==='FA'||d.f==='FW';return}
  if(d.f==='1'||d.f==='2'||d.f==='3')k=c[d.f]>=2;else if(d.f==='E'||d.f==='C')k=true;else if(d.f==='H'){k=hk<hw;if(k)hk++}d.k=k})};
 const _ay=aiYield;aiYield=function(q,l){return q.lvl==='newb'?q.hp<=5:_ay(q,l)};
 const _bs=aiBuyStep;aiBuyStep=function(p){if(p.lvl!=='newb')return _bs(p);let k=-1;G.market.forEach((id,j)=>{if(k<0&&canBuy(p,j))k=j});if(k>=0)buy(k);else endTurn()};`);
const N=+process.argv[2]||60,LV=process.argv[3]||'easy',S0=+process.argv[4]||1;
let win=0,ko=0,turns=0,lastKO=0,done=0,stuck=0;
for(let g=0;g<N;g++){
  S(`UI.n=4;UI.evo=false;UI.xp='base';UI.lvl='${LV}';DEFEX={};setSeed(${S0+g});newGame('ai');G.pl[${g%4}].lvl='newb'`);
  let steps=0;Q.length=0;
  while(!S('G.winner')&&steps++<20000){
    const f=Q.shift();if(f){f();continue}
    S('UI.busy=false;UI.pending=false;aiStep()');}
  if(!S('G.winner')){stuck++;continue}
  done++;const w=S('G.winner');const me=g%4;if(w==='P'+(me+1))win++;if(!S('P('+me+').alive'))ko++;turns+=S('G.turn');
}
console.log(JSON.stringify({level:LV,games:done,stuck,winRate:+(win/done).toFixed(3),koRate:+(ko/done).toFixed(3),avgTurn:+(turns/done).toFixed(1)}));
