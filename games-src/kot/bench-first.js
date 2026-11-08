// First-game balance (headless, engine only, like logic-test): a 4-monster game where seat 0 is a stand-in for the player
// at a chosen skill against 3 rivals at a chosen skill. Prints seat 0's win rate.
//   node bench-first.js [N=400] [stand-in=normal|easy|hard] [rivals=easy|normal]
const vm=require('vm'),fs=require('fs'),path=require('path');
const N=+process.argv[2]||400,SK=process.argv[3]||'normal',RV=process.argv[4]||'easy';
const pre=`var ANIM=0,AIDELAY=0,DEFN=4,DEFX='base',DEFEVO=false,YA=3,YB=0,MBT=8,DEFLV='normal',LVMIX=null,DEFEX=null,Y_=false;const SAVE='x';
const FACES=['1','2','3','E','C','H'];const MONS=[0,1,2,3,4,5,6,7,8].map(i=>({n:'M'+i}));function render(){};function sfx(){};function snd(){};`;
const src=pre+['data.js','engine.js','exp.js','ai.js'].map(f=>fs.readFileSync(path.join(__dirname,f),'utf8')).join('\n')+'\nfunction schedule(){}';
const ctx=vm.createContext({console,setTimeout:(f)=>{Q.push(f);return 0},clearTimeout(){},setInterval:()=>0,clearInterval(){},localStorage:{setItem(){},getItem(){return null}},document:{},window:{},Math});
const Q=[];vm.runInContext(src,ctx);const S=e=>vm.runInContext(e,ctx);
let win=0,done=0,turns=0;
for(let g=0;g<N;g++){S(`UI.n=4;UI.evo=false;UI.xp='base';DEFEX={};UI.lvl='${RV}';setSeed(${7000+g*13});newGame('ai');G.pl.forEach(p=>{p.human=false;p.lvl='${RV}'});G.pl[0].lvl='${SK}'`);
  for(let t=0;t<20000;t++){if(S('!!G.winner'))break;
    if(Q.length){Q.shift()();continue}
    if(S('!!UI.choice')){S(`(()=>{const c=UI.choice;UI.choice=null;let k=c.ai?c.ai():c.options[0].k;if(!c.options.some(o=>o.k===k))k=c.options[0].k;c.cb(k)})()`);continue}
    S('UI.busy=false;UI.pending=false;aiStep()')}
  const w=S('G.winner');if(w){done++;turns+=S('G.turn')||0;if(w==='P1')win++}}
console.log(`stand-in ${SK} vs 3 ${RV} rivals · finished ${done}/${N} · win ${(100*win/Math.max(1,done)).toFixed(0)}% (fair share 25%) · avg turns ${(turns/Math.max(1,done)).toFixed(1)}`);
