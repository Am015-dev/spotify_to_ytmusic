// Newcomer-vs-Easy survival sim (headless, real data.js/engine.js/exp.js/ai.js). Seat 0 plays like a first-timer:
// keeps pairs/claws/energy, hearts only when hurt, uses every roll, buys the first affordable card, stays in Downtown until <=5 hearts.
// TOUCHPOL=1: the touch-bench newcomer (touch-bench.js policy: 1s only as triples, claws only with a target, slips, early stops, buys 75%, yields 80% at <=6).
// Usage: node newb-sim.js [games=60] [level=easy] [seed0=1]   prints win rate, KO rate, avg length.
const process=require('process');const vm=require('vm'),fs=require('fs'),path=require('path');
const pre=`var ANIM=0,AIDELAY=0,DEFN=4,DEFX='base',DEFEVO=false,YA=3,YB=0,MBT=8,DEFLV='easy',LVMIX=null,DEFEX=null;const SAVE='x';
const FACES=['1','2','3','E','C','H'];const MONS=[0,1,2,3,4,5,6,7,8].map(i=>({n:'M'+i}));
function render(){};function sfx(){};function snd(){};function refresh(){};function fx(){};`;
const files=['data.js','engine.js','exp.js','ai.js'];
const src=pre+files.map(f=>fs.readFileSync(path.join(__dirname,f),'utf8')).join('\n');
const Q=[];const ctx=vm.createContext({console,setTimeout:(f)=>{Q.push(f);return Q.length},clearTimeout(){},setInterval:()=>0,clearInterval(){},localStorage:{setItem(){},getItem(){return null}},document:{},window:{}});
vm.runInContext(src+';var YLDHP='+(+(process.env.YLD||6)),ctx);const S=e=>vm.runInContext(e,ctx);
S(`tender=o=>o.human;const _am=aiMark;aiMark=function(p){if(p.lvl!=='newb')return _am(p);
 const c=counts(),inT=inCity(p.i),miss=maxhp(p)-p.hp;let hw=inT?0:(p.hp<7?miss:0);let hk=0;
 G.dice.forEach(d=>{let k=false;if(d.t==='b'){d.k=d.f!=='O';return}if(d.t==='f'){d.k=d.f==='FA'||d.f==='FW';return}
  if(d.f==='1'||d.f==='2'||d.f==='3')k=c[d.f]>=2;else if(d.f==='E'||d.f==='C')k=true;else if(d.f==='H'){k=hk<hw;if(k)hk++}d.k=k})};
 const _ay=aiYield;aiYield=function(q,l){return q.lvl==='newb'?q.hp<=5:_ay(q,l)};
 const _bs=aiBuyStep;aiBuyStep=function(p){if(p.lvl!=='newb')return _bs(p);let k=-1;G.market.forEach((id,j)=>{if(k<0&&canBuy(p,j))k=j});if(k>=0)buy(k);else endTurn()};`);
const YLD=+(process.env.YLD||6);const HUMAN=`(function(){const TP=${+!!process.env.TOUCHPOL};const hi=G.pl.findIndex(q=>q.human);const p=cur();
 if(UI.choice){const c=UI.choice;UI.choice=null;const o=c.options;let k;if(/Stay or yield/.test(c.title)){const q=G.pl[c.who];k=TP?((q.hp<=6?Math.random()<.8:Math.random()<.1)?'yield':'stay'):(YLDHP>=q.hp?'yield':'stay')}else k=c.ai?String(c.ai()):o[0].k;if(!o.some(x=>String(x.k)===String(k)))k=o[0].k;c.cb(k);return}
 if(!p.human){UI.busy=false;UI.pending=false;aiStep();return}
 UI.busy=false;
 if(G.phase==='roll'&&TP){const c=counts(),inT=inCity(p.i),occ=G.city>=0||G.bay>=0;const want=[];G.dice.forEach((d,i)=>{if(d.k)return;const f=d.f;
   if(((f==='2'||f==='3')&&c[f]>=2)||(f==='1'&&c[f]>=3)||f==='E'||(f==='C'&&(inT||occ))||(f==='H'&&p.hp<7&&!inT))want.push(i)});
  if(want.length&&Math.random()<.12)want.splice(Math.floor(Math.random()*want.length),1);else if(Math.random()<.06){const fr=G.dice.map((d,i)=>d.k||want.includes(i)?-1:i).filter(i=>i>=0);if(fr.length)want.push(fr[Math.floor(Math.random()*fr.length)])}
  want.forEach(i=>G.dice[i].k=true);const free=G.dice.filter(d=>!d.k).length;
  if(G.rolls>0&&free&&!(G.rolls===1&&Math.random()<.15))doReroll('roll');else resolve();return}
 if(G.phase==='roll'){const c=counts(),inT=inCity(p.i);let free=0;G.dice.forEach((d,i)=>{if(d.k)return;const f=d.f;const w=((f==='1'||f==='2'||f==='3')&&c[f]>=2)||f==='C'||f==='E'||(f==='H'&&p.hp<7&&!inT);if(w)d.k=true;else free++});
  if(G.rolls>0&&free&&G.dice.some(d=>!d.k)){doReroll('roll')}else resolve();return}
 if(G.phase==='buy'&&TP){let k=-1;G.market.forEach((id,j)=>{if(k<0&&canBuy(p,j))k=j});if(k>=0&&Math.random()<.75&&!UI.tb){buy(k)}else{UI.tb=0;endTurn()}return}
 if(G.phase==='buy'){let k=-1;G.market.forEach((id,j)=>{if(k<0&&canBuy(p,j))k=j});if(k>=0)buy(k);else endTurn();return}
 UI.busy=false;aiStep()})()`;
const N=+process.argv[2]||60,LV=process.argv[3]||'easy',S0=+process.argv[4]||1;
let win=0,ko=0,turns=0,lastKO=0,done=0,stuck=0;
for(let g=0;g<N;g++){
  S(`UI.n=4;UI.evo=false;UI.xp='base';UI.lvl='${LV}';DEFEX={};setSeed(${S0+g});newGame('solo')`);
  let steps=0;Q.length=0;
  while(!S('G.winner')&&steps++<20000){
    const f=Q.shift();if(f){f();continue}
    S(HUMAN);}
  if(!S('G.winner')){stuck++;continue}
  done++;const w=S('G.winner');const me=S('G.pl.findIndex(q=>q.human)');if(w==='P'+(me+1))win++;if(!S('P('+me+').alive'))ko++;turns+=S('G.turn');globalThis.kos=(globalThis.kos||0)+S('G.pl.filter(q=>!q.alive).length');
}
console.log(JSON.stringify({level:LV,games:done,stuck,winRate:+(win/done).toFixed(3),koRate:+(ko/done).toFixed(3),avgTurn:+(turns/done).toFixed(1),avgKO:+((globalThis.kos||0)/done).toFixed(2)}));
