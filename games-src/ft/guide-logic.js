// GUIDE LOGIC: replays every scripted move of the guided first game (src/guide.js) on the real engine, headless.
// Each step's move must be legal at that moment, every sentence must be 12 words or fewer, and the last camel must end the game.
// Run: node guide-logic.js   (exit 1 on any problem)
const fs=require('fs'),vm=require('vm'),path=require('path');
const C={console,Math,Date,JSON,setTimeout,clearTimeout,performance:{now:Date.now},window:{},document:{}};vm.createContext(C);
for(const f of ['data','djinns','engine','ai','tutdata'])vm.runInContext(fs.readFileSync(path.join(__dirname,'src',f+'.js'),'utf8'),C,{filename:f});
const src=fs.readFileSync(path.join(__dirname,'src','guide.js'),'utf8');const gd=src.slice(src.indexOf('const GD='),src.indexOf('const gdStep='));
const run=s=>vm.runInContext(s,C);run('UI.sim=false;var DEFSEED=1;tutNew();'+gd);
const K=v=>JSON.stringify(v,(q,x)=>x&&typeof x==='object'&&!Array.isArray(x)?Object.keys(x).sort().reduce((o,z)=>(o[z]=x[z],o),{}):x);
const steps=run('GD.STEPS');const probs=[];
for(const st of steps){if(st.say&&st.say.trim().split(/\s+/).length>12)probs.push(st.id+': more than 12 words');
  const ms=st.who==='me'?[st.m]:(st.ms||[]);
  for(const m of ms){const v=JSON.parse(run('JSON.stringify(validMoves())'));const hit=v.find(x=>K(x)===K(m));
    if(!hit){probs.push(st.id+': illegal '+JSON.stringify(m));break}C.__m=hit;run('performMove(__m,sideToAct())')}}
if(!run('!!G.endTrig'))probs.push('the guided game does not place the last camel');
// the rest: Farid's own last turn, then the game must end
for(let i=0;i<60&&!run('!!G.over');i++){const s=run('sideToAct()');C.__m=run('aiMove('+s+')');run('performMove(__m,'+s+')')}
if(!run('!!G.over'))probs.push('the game does not end after the round');
console.log('guide-logic: '+steps.length+' steps, '+probs.length+' problems');for(const p of probs)console.log('  - '+p);process.exit(probs.length?1:0);
