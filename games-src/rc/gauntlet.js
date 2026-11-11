// headless games: node gauntlet.js N [scen] [chars] ; env SEED
const fs=require('fs'),vm=require('vm');
const files=['data-gen.js','data.js','cards-ev.js','cards-adv.js','text.js','engine.js','phases.js','scen.js','moves.js','ai.js'];
const src=files.map(f=>fs.readFileSync(__dirname+'/'+f,'utf8')).join('\n')+'\n;globalThis.__={get G(){return G},newGame,setSeed,checkInvariants,aiPlan,aiPlanBest,startActions,planOpen,answer,aiChoose,render_game_to_text,UI};';
const N=+process.argv[2]||20,scen=process.argv[3]||'marooned',chars=(process.argv[4]||'carpenter,cook').split(',');
const WC={};let wins=0,rounds=0,why={},errs=0,viol={};const t0=Date.now();
for(let g=0;g<N;g++){const ctx={console,Math,JSON,Date,setTimeout:()=>0,clearTimeout(){},localStorage:{getItem(){return null},setItem(){},removeItem(){}},refresh(){},performance:{now:()=>Date.now()}};vm.createContext(ctx);
  let origErr=console.error;const cerr=[];ctx.console={log:console.log,error:(...a)=>cerr.push(a.join(' '))};
  if(process.env.AIWX)vm.runInContext('var AIWX='+process.env.AIWX,ctx);vm.runInContext(src,ctx);if(process.env.HOR)vm.runInContext('AIHOR='+process.env.HOR+';AIPLANS='+(process.env.NP||8)+';AISIMS='+(process.env.NS||4),ctx);const X=ctx.__;X.setSeed((+process.env.SEED||1000)+g);X.UI.pause=true;
  try{X.newGame(Object.assign({scen,chars,mode:'ai'},process.env.DIFF==='easy'?{diff:'easy',items:4,dog:true,friday:true}:process.env.DIFF==='hard'?{diff:'hard',items:1}:{}));let steps=0;
    while(!X.G.over&&steps++<400){const v=X.checkInvariants();for(const x of v)viol[x]=(viol[x]||0)+1;if(v.some(x=>/stuck/.test(x)))break;
      if(X.G.q){X.answer(X.aiChoose(X.G.q.title,X.G.q.opts,X.G.chars[X.G.q.who],X.G.q)||0);continue}
      if(X.planOpen()){(process.env.GREEDY?X.aiPlan:X.aiPlanBest)();const e=X.startActions();if(e){cerr.push('plan: '+e);break}}}
    const G=X.G;if(process.env.END)console.log("r"+G.round,G.over&&G.over.why,"fire",!!G.inv.built.fire,"pile",G.sc.pile,"crosses",G.sc.crosses&&G.sc.crosses.length,"roof",G.camp.roof,"built",Object.keys(G.inv.built).join(","));for(const l of G.log){const m=/takes (\d+) wounds? \(([^)]*)\)/.exec(l.t);if(m){const k=m[2].replace(/tile \d+/,"");WC[k]=(WC[k]||0)+(+m[1])}}if(process.env.LOG&&g==0)console.log(G.log.slice().reverse().map(l=>l.r+" "+l.t).join("\n"));if(G.over&&G.over.win)wins++;rounds+=G.round;const w=G.over?G.over.why:'no end';why[w]=(why[w]||0)+1}
  catch(e){errs++;console.log('ERR game',g,e.stack.split('\n').slice(0,4).join(' | '))}
  if(cerr.length){errs++;if(errs<6)console.log('console.error game',g,cerr.slice(0,3))}}
console.log(`${scen} ${chars} N=${N} wins ${wins} (${Math.round(wins/N*100)}%) avg round ${(rounds/N).toFixed(1)} errs ${errs} ${Date.now()-t0}ms`);console.log(why);console.log(Object.entries(WC).sort((a,b)=>b[1]-a[1]).slice(0,22).map(([k,v])=>k+":"+(v/N).toFixed(2)).join("  "));if(Object.keys(viol).length)console.log('violations',viol);
