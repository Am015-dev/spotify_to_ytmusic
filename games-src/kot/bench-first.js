// First-game balance (headless, engine only, like logic-test): a 4-monster game where seat 0 is a stand-in for the player
// at a chosen skill against 3 rivals at a chosen skill. Prints seat 0's win rate.
//   node bench-first.js [N=400] [stand-in=newbie|normal|easy|hard] [rivals=easy|normal] [players=4]
// newbie = the reviewer's new-player policy: keep any number with 2+ dice, claws and energy, hearts below 7 hp outside the city,
// stay in the city unless 5 hp or less, buy the first affordable card.
const vm=require('vm'),fs=require('fs'),path=require('path');
const N=+process.argv[2]||400,SK=process.argv[3]||'newbie',RV=process.argv[4]||'easy',NP=+process.argv[5]||4;
const pre=`var ANIM=0,AIDELAY=0,DEFN=4,DEFX='base',DEFEVO=false,YA=3,YB=0,MBT=8,DEFLV='normal',LVMIX=null,DEFEX=null,Y_=false;const SAVE='x';
const FACES=['1','2','3','E','C','H'];const MONS=[0,1,2,3,4,5,6,7,8].map(i=>({n:'M'+i}));function render(){};function sfx(){};function snd(){};`;
const newbie=`
const _mk=aiMarkLvl;aiMarkLvl=function(p){if(p.lvl!=='newbie')return _mk(p);const c=counts();
  G.dice.forEach(d=>{if(d.k)return;const f=d.f;d.k=(/[123]/.test(f)&&c[f]>=2)||f==='C'||f==='E'||(f==='H'&&p.hp<7&&!inCity(p.i))})};
const _y=aiYield;aiYield=function(q,l){if(q.lvl!=='newbie')return _y(q,l);return q.hp<=5};
const _b=aiBuyStep;aiBuyStep=function(p){if(p.lvl!=='newbie')return _b(p);for(let k=0;k<G.market.length;k++)if(canBuy(p,k)){buy(k);return}endTurn()};`;
const src=pre+['data.js','engine.js','exp.js','ai.js'].map(f=>fs.readFileSync(path.join(__dirname,f),'utf8')).join('\n')+'\nfunction schedule(){}'+newbie;
const ctx=vm.createContext({console,setTimeout:(f)=>{Q.push(f);return 0},clearTimeout(){},setInterval:()=>0,clearInterval(){},localStorage:{setItem(){},getItem(){return null}},document:{},window:{},Math});
const Q=[];vm.runInContext(src,ctx);const S=e=>vm.runInContext(e,ctx);
let win=0,done=0,turns=0;
for(let g=0;g<N;g++){S(`UI.n=${NP};UI.evo=false;UI.xp='base';DEFEX={};UI.lvl='${RV}';setSeed(${7000+g*13});newGame('ai');G.pl.forEach(p=>{p.human=false;p.lvl='${RV}'});G.pl[0].lvl='${SK}'`);
  for(let t=0;t<20000;t++){if(S('!!G.winner'))break;
    if(Q.length){Q.shift()();continue}
    if(S('!!UI.choice')){S(`(()=>{const c=UI.choice;UI.choice=null;let k=c.ai?c.ai():c.options[0].k;if(!c.options.some(o=>o.k===k))k=c.options[0].k;c.cb(k)})()`);continue}
    S('UI.busy=false;UI.pending=false;aiStep()')}
  const w=S('G.winner');if(w){done++;turns+=S('G.turn')||0;if(w==='P1')win++}}
console.log(`stand-in ${SK} vs ${NP-1} ${RV} rivals · finished ${done}/${N} · win ${(100*win/Math.max(1,done)).toFixed(0)}% (fair share ${Math.round(100/NP)}%) · avg turns ${(turns/Math.max(1,done)).toFixed(1)}`);
