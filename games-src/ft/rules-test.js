// Small rules tests for Sands of Qamar: node rules-test.js (exit 1 on failure)
const fs=require('fs'),vm=require('vm');const D=__dirname+'/src/';
const src=['data.js','djinns.js','engine.js','ai.js','rules-html.js'].map(f=>fs.readFileSync(D+f,'utf8')).join('\n')+';globalThis.__X={get G(){return G},set G(v){G=v},newGame,setSeed,scoreOf,finish,goodsScore,P,RULES_HTML,validMoves,performMove,sideToAct};';
let pass=0,fail=0;const T=(name,fn)=>{const ctx={console,Math,JSON,Date};vm.createContext(ctx);vm.runInContext(src,ctx);try{fn(ctx.__X);pass++}catch(e){fail++;console.log('FAIL',name,e.message)}};
const ok=(c,m)=>{if(!c)throw new Error(m)};
T('goods sets score again and again',X=>{ok(X.goodsScore(['fish','wheat','fish'])===4,'fish+wheat+fish = 3+1');ok(X.goodsScore(['ivory','jewels','gold','papyrus'])===13,'4 kinds = 13')});
T('equal totals share the win (engine)',X=>{X.setSeed(5);X.newGame({np:2,mode:'ai',ex:{}});const G=X.G;const a=X.scoreOf(G.pl[0]).total,b=X.scoreOf(G.pl[1]).total;G.pl[1].coins+=a-b;
  ok(X.scoreOf(G.pl[0]).total===X.scoreOf(G.pl[1]).total,'totals equalised');X.finish();ok(G.over.win.length===2,'both win');ok(/share the win/.test(G.winText),G.winText)});
T('the rules text says the same',X=>{ok(/Equal totals share the win/.test(X.RULES_HTML),'tie line');ok(!/Ties go to the player with more coins/.test(X.RULES_HTML),'old tie line')});
T('a later bidder on an equal price plays first',X=>{ok(/the one who bid later plays first/.test(X.RULES_HTML),'rules text')});
T('Advisor majority: +10 per rival with fewer',X=>{X.setSeed(6);X.newGame({np:3,mode:'ai',ex:{}});const G=X.G;G.pl[0].vz=3;G.pl[1].vz=1;G.pl[2].vz=3;
  const s=X.scoreOf(G.pl[0]);ok(s.advisors===3+10,'3 + 10 for the one rival with fewer, got '+s.advisors)});
console.log('rules tests: '+pass+' passed, '+fail+' failed');process.exit(fail?1:0);
