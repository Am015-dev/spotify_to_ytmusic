// Clarity checks (jsdom, real render): every change to your hero while you waited is listed with its cause,
// lessons show once, and "Play suggested cards" says what it played. Usage: node clarity-test.js
const {JSDOM}=require('jsdom');const fs=require('fs');const html=fs.readFileSync(process.argv[2]||'doorkick.html','utf8');
let pass=0,fail=0;const out=[];
function T(name,code){const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'http://localhost/'});const w=dom.window;const errs=[];w.console.error=(...a)=>errs.push(a.join(' '));
  w.eval('ANIM=0;AIDELAY=0;schedule=function(){};setSeed(5);newGame("F",4);UI.pass=null');
  w.eval(`function inst(k){const ids=Object.keys(G.C).map(Number).filter(i=>G.C[i]===k);for(const id of ids){for(const z of ['door','tr','dd','td']){const j=G[z].indexOf(id);if(j>=0){G[z].splice(j,1);return id}}}
      for(const id of ids){for(const p of G.pl){const j=p.hand.indexOf(id);if(j>=0){p.hand.splice(j,1);return id}}}throw new Error('no free '+k)}
    function give(s,k){const id=inst(k);P(s).hand.push(id);return id}
    function wear(s,k){const id=inst(k);P(s).eq.push({id,on:true});return id}
    function clearAll(){for(const p of G.pl){p.hand.forEach(id=>(cd(id).d==='door'?G.door:G.tr).unshift(id));p.hand=[];p.eq.forEach(e=>(cd(e.id).d==='door'?G.door:G.tr).unshift(e.id));p.eq=[];}G.phase='main';G.active=0;G.setupI=99;G.win=null;G.q=null;G.cb=null}
    function act(m,s){const r=performMove(m,s===undefined?sideToAct():s);if(!r.success)throw new Error(r.error);return r}
    function dock(){return document.querySelector('#prompt').textContent}`);
  w.eval('clearAll()');let ok=false,msg='';try{const r=w.eval('(function(){'+code+'})()');ok=r===true;msg=r===true?'':'returned '+JSON.stringify(r)}catch(e){msg=String(e.message||e)}
  if(errs.length){ok=false;msg+=' ERR '+errs[0]}if(ok)pass++;else{fail++;out.push('FAIL '+name+': '+msg)}w.close()}
// before: a curse on another player's turn took your boots and the dock never said so (blind playtest r1)
T('recap names a lost item and the curse that took it',`wear(0,'stompy');G.turn=5;render();
  G.active=2;G.turn=6;const c=give(2,'hexsock');act({act:'play',card:c,tgt:0},2);render();
  if(P(0).eq.length)return 'boots still worn';G.active=0;G.turn=9;G.phase='main';render();const t=dock();
  return /While you waited/.test(t)&&/Stompy Boots/.test(t)&&/Sock Goblin/.test(t)||t`);
T('recap explains a rival level change',`G.turn=5;render();G.active=1;G.turn=6;const c=give(1,'l1');act({act:'play',card:c,tgt:1},1);
  G.active=0;G.turn=9;G.phase='main';render();const t=dock();return new RegExp(P(1).nm+': level 1 → 2').test(t)&&/up a level/.test(t)||t`);
T('no recap when nothing changed',`G.turn=5;render();G.active=1;G.turn=6;render();G.active=0;G.turn=9;render();return !/While you waited/.test(dock())||dock()`);
T('a lesson shows once in a teaching game, never in a normal one',`try{localStorage.removeItem('dkd_learned')}catch(e){}G.learn=false;render();if(/Your turn:/.test(dock()))return 'lesson without learn';
  G.learn=true;render();if(!/Your turn:/.test(dock()))return 'no lesson';document.querySelector('[data-a=learned]').click();return !/Your turn:/.test(dock())`);
T('play suggested cards says what it played and the new strength',`const a=give(0,'warrior');give(0,'stompy');render();const b=document.querySelector('[data-a=autoplay]');if(!b)return dock();
  const s0=pStr(P(0));b.click();const t=dock();return P(0).cls.length===1&&pStr(P(0))>s0&&/You played:/.test(t)&&new RegExp('Strength '+s0+' → '+pStr(P(0))).test(t)||t`);
T('run button shows the odds',`G.active=0;const id=inst('rattle');startCombat(0,id,'kick');G.cb.stage='act';P(0).lvl=1;render();const b=[...document.querySelectorAll('#prompt button')].find(x=>/Run away/.test(x.textContent));return !!b&&/\\d+%|sure|impossible/.test(b.textContent)||(b&&b.textContent)||dock()`);
T('one tap gives away the extra cards and says where they went',`for(const k of ['rattle','hellmouse','l1','stompy','warrior','wizard','thief','cleric'])give(0,k);P(0).lvl=1;P(1).lvl=1;P(2).lvl=3;P(3).lvl=3;P(0).lvl=2;G.phase='post';act({act:'end'},0);if(G.phase!=='charity')return G.phase;render();
  const b=document.querySelector('[data-a=autocharity]');if(!b)return dock();b.click();return G.phase!=='charity'&&P(0).hand.length<=5&&/You gave away:/.test(document.querySelector('#side').textContent)||[G.phase,P(0).hand.length]`);
console.log(out.join('\n'));console.log(`clarity tests: ${pass} passed, ${fail} failed`);process.exit(fail?1:0)
