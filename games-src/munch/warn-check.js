// Headless check of the "about to win" warning: N seeded games, me (seat 0) vs 3 computers, seat 0 played by the Normal AI through the real render().
// Oracle: whenever a rival fights and resolving the fight right now would make them the winner, the dock must show .winwarn; and never otherwise.
const {JSDOM}=require('jsdom');const fs=require('fs');const html=fs.readFileSync('doorkick.html','utf8');const N=+process.argv[2]||50;
let sit=0,miss=0,falseAl=0,fightWins=0,fightWinsWarned=0,games=0,errs=[],counters={one:0,two:0,none:0};const missEx=[];
for(let g=0;g<N;g++){const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'http://localhost/'});const w=dom.window;w.console.error=(...a)=>errs.push(a.join(' '));
  w.eval('ANIM=0;AIDELAY=0;schedule=function(){}');w.eval(`setSeed(${9000+g*13});newGame('F',4)`);
  w.eval(`window.__chk=function(){const cb=G.cb;let truth=false;if(cb&&cb.who!==0&&!G.winner&&cb.mons.length){const who=cb.who;truth=!!sim(()=>{if(!winning(G.cb))return false;resolveWin();return G.winner==='P'+(who+1)})}
      const el=document.querySelector('#side .winwarn:not(.me)');return {truth,shown:!!el,txt:el?el.textContent:'',fk:cb?G.turn+':'+cb.who:''}}`);
  const warned=new Set();let steps=0;
  for(;steps<5000;steps++){const st=w.eval('JSON.stringify({win:G.winner,turn:G.turn})');const S=JSON.parse(st);if(S.win||S.turn>120)break;
    const c=JSON.parse(w.eval('JSON.stringify(__chk())'));
    if(c.truth){sit++;if(!c.shown){miss++;if(missEx.length<5)missEx.push(g+' t'+S.turn)}else{warned.add(c.fk);if(/Best counter/.test(c.txt))counters.one++;else if(/two cards/.test(c.txt))counters.two++;else counters.none++}}
    else if(c.shown){falseAl++}
    try{w.eval('(function(){const s=sideToAct();if(s<0)return;const m=aiMove(s);const r=performMove(m,s);if(!r.success)console.error("rejected "+r.error);refresh()})()')}catch(e){errs.push(String(e.stack).slice(0,300));break}}
  const fin=JSON.parse(w.eval('JSON.stringify({w:G.winner,t:G.winText,fk:G.out?G.out.turn+":"+G.out.who:""})'));games++;
  if(fin.w&&fin.w!=='P1'&&/defeating/.test(fin.t)){fightWins++;if(warned.has(fin.fk))fightWinsWarned++;else if(missEx.length<8)missEx.push('unwarned win g'+g+' '+fin.fk)}
  w.close()}
console.log(`games ${games}; situations ${sit}; warning shown ${sit-miss}; missed ${miss}; false alarms ${falseAl}`);
console.log(`rival wins by a fight ${fightWins}, warned during that fight ${fightWinsWarned}; counter advice: one-card ${counters.one}, two-card ${counters.two}, can't stop ${counters.none}`);
console.log('errors',errs.length,JSON.stringify(errs.slice(0,4)),'examples',JSON.stringify(missEx))
