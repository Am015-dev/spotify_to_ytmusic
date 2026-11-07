// node bench-ai.js [games=100] [normal|hard]: the AI against a take-first-affordable bot (wonder every 4th turn, else sell), seats alternate.
var E=require('./src/engine.js'),AI=require('./src/ai.js');
function bot(G,st){var M=E.validMoves(G);if(!M.length)return null;
 if(G.phase==='draft'||G.pend.length)return M[0];
 st.t++;var w=M.filter(m=>m.t==='wonder');if(st.t%4===0&&w.length)return w[0];
 var b=M.filter(m=>m.t==='build');if(b.length)return b[0];var d=M.filter(m=>m.t==='discard');return d[0]||M[0]}
var N=+process.argv[2]||100,L=process.argv[3]||'hard',w=0,l=0,d=0,coins=0,n=0;
for(var s=1;s<=N;s++){var G=E.newGame({seed:s*17+3}),k=0,rng=function(){return E.rnd(G)},ai=s%2,st={t:0};
 while(!G.over&&k<600){var p=E.sideToAct(G),m=p===ai?AI.pick(G,L,rng):bot(G,st);if(!m)break;E.apply(G,m);k++}
 if(G.winner<0)d++;else if(G.winner===ai)w++;else l++;coins+=G.players[ai].coins;n++}
console.log(L+' vs take-first-affordable bot: win',w,'loss',l,'draw',d,'of',N,(100*w/N).toFixed(0)+'%','avg end coins',(coins/n).toFixed(0));
