// node net-strip-test.js [games=12]: what the host sends to online clients (netView in src/net.js) must not reveal hidden order:
// no RNG, every deck (goods, bag of people, items, djinns, Cutpurses) sorted, and a "poisoned" copy (decks reshuffled, RNG changed)
// must give a byte-identical packet. Sands is otherwise open information.
const fs=require('fs'),vm=require('vm');const D=__dirname+'/src/';
const nv=fs.readFileSync(D+'net.js','utf8').match(/function netView\(\)\{[^\n]*\}/)[0];
const src=['data.js','djinns.js','engine.js','ai.js'].map(f=>fs.readFileSync(D+f,'utf8')).join('\n')+'\n'+nv+';globalThis.__X={get G(){return G},set G(v){G=v},newGame,setSeed,sideToAct,aiMove,performMove,netView};';
const N=+process.argv[2]||12;let checks=0,leaks=0,diffs=0;const bad=[];
const shuf=(a,r)=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
for(let g=0;g<N;g++){const ctx={console:{log(){},error(){}},Math,JSON,Date};vm.createContext(ctx);vm.runInContext(src,ctx);const X=ctx.__X;
  X.setSeed(300+g);const np=2+g%4;X.newGame({np,mode:'ai',ex:{artisans:g%2===0,thieves:g%3===0,promos:true,sultan:np===5}});let n=0;
  while(!X.G.over&&n++<3000){if(n%9===0){const v=X.netView();checks++;
      if(v.rng!==0){leaks++;bad.push('rng sent')}
      for(const k of ['rdeck','bag','items','djDeck','thDeck'])if(Array.isArray(v[k])&&v[k].join()!==v[k].slice().sort().join()){leaks++;bad.push(k+' order sent')}
      const real=X.G,copy=JSON.parse(JSON.stringify(real));let s=g*7+n;const r=()=>{s=(s*16807)%2147483647;return s/2147483647};
      copy.rng=(real.rng+12345)>>>0;for(const k of ['rdeck','bag','items','djDeck','thDeck'])if(Array.isArray(copy[k]))shuf(copy[k],r);
      X.G=copy;const v2=X.netView();X.G=real;if(JSON.stringify(v)!==JSON.stringify(v2)){diffs++;if(bad.length<5)bad.push('poisoned copy differs')}}
    const s=X.sideToAct();const m=X.aiMove(s);if(!m||!X.performMove(m,s).success)break}}
console.log('net-strip test: '+N+' games, '+checks+' packets, leaks '+leaks+', poison differences '+diffs);bad.slice(0,5).forEach(b=>console.log('  '+b));
const okk=!leaks&&!diffs;console.log(okk?'NET-STRIP TEST PASSED':'NET-STRIP TEST FAILED');process.exit(okk?0:1);
