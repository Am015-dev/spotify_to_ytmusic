// scenario tests: each builds a tiny position and checks one rule from rules.md
const {JSDOM}=require('jsdom');const fs=require('fs');const html=fs.readFileSync('doorkick.html','utf8');
let pass=0,fail=0;const out=[];
function T(name,code,ui){const dom=new JSDOM(html,{runScripts:'dangerously',url:'http://localhost/'});const w=dom.window;const errs=[];w.console.error=(...a)=>errs.push(a.join(' '));
  // ui=true keeps the real render(), so a test can look at the dock and click its buttons
  w.eval(ui?'ANIM=0;AIDELAY=0;schedule=function(){};setSeed(5);newGame("hot",4);UI.lastSeat=0;UI.pass=null':'ANIM=0;AIDELAY=0;render=function(){};schedule=function(){};refresh=function(){};setSeed(5);newGame("hot",4)');
  // helpers inside the page: give(seat,key) moves a card instance of key into a zone; fresh() clears hands
  w.eval(`function inst(k){const ids=Object.keys(G.C).map(Number).filter(i=>G.C[i]===k);for(const id of ids){for(const z of ['door','tr','dd','td']){const j=G[z].indexOf(id);if(j>=0){G[z].splice(j,1);return id}}}
      for(const id of ids){for(const p of G.pl){const j=p.hand.indexOf(id);if(j>=0){p.hand.splice(j,1);return id}}}throw new Error('no free '+k)}
    function give(s,k){const id=inst(k);P(s).hand.push(id);return id}
    function wear(s,k){const id=inst(k);P(s).eq.push({id,on:true});return id}
    function clearAll(){for(const p of G.pl){p.hand.forEach(id=>(cd(id).d==='door'?G.door:G.tr).unshift(id));p.hand=[];p.eq.forEach(e=>(cd(e.id).d==='door'?G.door:G.tr).unshift(e.id));p.eq=[];}G.phase='main';G.active=0;G.setupI=99;G.win=null;G.q=null}
    function fightNow(s,k){const id=inst(k);G.active=s;startCombat(s,id,'kick');return id}
    function act(m,s){const r=performMove(m,s===undefined?sideToAct():s);if(!r.success)throw new Error(r.error);return r}`);
  w.eval('clearAll()');let ok=false,msg='';try{const r=w.eval('(function(){'+code+'})()');ok=r===true;msg=r===true?'':'returned '+JSON.stringify(r)}catch(e){msg=String(e.message||e)}
  const inv=w.eval('checkInvariants()');if(inv.length&&!/no legal move/.test(inv[0])){ok=false;msg+=' INV '+inv[0]}if(errs.length){ok=false;msg+=' ERR '+errs[0]}
  if(ok)pass++;else{fail++;out.push('FAIL '+name+': '+msg)}w.close()}
T('warrior wins ties','P(0).lvl=2;const w=inst("warrior");P(0).cls.push(w);fightNow(0,"toads");return winning(G.cb)&&sideStr(G.cb)===monStr(G.cb)');
T('non-warrior loses ties','P(0).lvl=2;fightNow(0,"toads");return !winning(G.cb)');
T('level-up card cannot give level 10','P(0).lvl=9;give(0,"l1");return !validMoves(0).some(m=>m.act==="play"&&m.tgt===0)&&validMoves(0).some(m=>m.act==="play"&&m.tgt===1)');
T('kill can give level 10','P(0).lvl=9;wear(0,"wildfire");const x=inst("wizard");P(0).cls.push(x);fightNow(0,"imp");act({act:"fight"},0);let n=0;while(!G.winner&&G.phase==="combat"&&n++<9){act({act:"pass"})}return G.winner==="P1"');
T('cannot sell to level 10','P(0).lvl=9;give(0,"parrot");return !validMoves(0).some(m=>m.act==="sell")');
T('sell needs 1000 at once','P(0).lvl=2;const a=give(0,"stompy");const b=give(0,"swash");const r=performMove({act:"sell",cards:a+","+b},0);return !r.success');
T('sell 1300 gives 1 level, no change','P(0).lvl=2;const a=give(0,"parrot");act({act:"sell",cards:""+a},0);return P(0).lvl===3');
T('halfling sells one item double','P(0).lvl=2;P(0).race.push(inst("halfling"));const a=give(0,"stompy");const b=give(0,"swash");act({act:"sell",cards:a+","+b},0);return P(0).lvl===3');
T('halfling -1 to run away','P(0).race.push(inst("halfling"));fightNow(0,"inferno");return runMod(P(0),G.cb,G.cb.mons[0])===-1');
T('elf +1 run, sneakers +2','P(0).race.push(inst("elf"));wear(0,"sneakers");fightNow(0,"inferno");return runMod(P(0),G.cb,G.cb.mons[0])===3');
T('mixed heritage single halfling has no -1','P(0).race.push(inst("halfling"));P(0).half=inst("mixed");fightNow(0,"inferno");return runMod(P(0),G.cb,G.cb.mons[0])===0');
T('monster bonus vs elf','P(0).race.push(inst("elf"));fightNow(0,"leech");return monStr(G.cb)===14');
T('grave gnawers: level only','P(0).lvl=3;wear(0,"rascal");wear(0,"stompy");fightNow(0,"gnawers");return sideStr(G.cb)===3');
T('pitchman: bonuses only','P(0).lvl=5;wear(0,"stompy");fightNow(0,"pitchman");return sideStr(G.cb)===2');
T('will not pursue level 4 or below','P(0).lvl=4;fightNow(0,"inferno");act({act:"run"},0);return G.phase==="post"&&P(0).lvl===4&&!P(0).dead');
T('pharaoh costs 2 levels on flight above 3','P(0).lvl=5;fightNow(0,"pharaoh");const d6s=[];act({act:"run"},0);return P(0).lvl<=3');
T('pinch mites cannot be escaped','P(0).lvl=1;wear(0,"stompy");fightNow(0,"mites");G.cb.mb=10;act({act:"run"},0);return P(0).eq.length===0');
T('curse from kicked door hits you (rotten luck)','P(0).lvl=3;const id=inst("hexlvl");G.door.push(id);act({act:"kick"},0);return P(0).lvl===2');
T('flip-flops stop a kicked curse','P(0).lvl=3;wear(0,"flipflops");const id=inst("hexlvl");G.door.push(id);act({act:"kick"},0);return P(0).lvl===3');
T('ring of undoing is asked to a human','P(0).lvl=3;give(0,"undoring");const c=give(1,"hexlvl");G.active=1;G.phase="main";act({act:"play",card:c,tgt:0},1);return G.q&&G.q.kind==="ward"&&G.q.who===0');
T('plus-one doubles the monster','P(0).lvl=1;fightNow(0,"toads");const c=give(1,"plusone");G.cb.stage="others";G.cb.ord=[1,2,3];G.cb.oi=0;act({act:"play",card:c,tgt:0},1);return monStr(G.cb)===4&&G.cb.mons.length===2');
T('parrot: treasure but no level','P(0).lvl=2;fightNow(0,"skygrif");const c=give(0,"parrot");act({act:"play",card:c,tgt:0},0);return P(0).lvl===2&&P(0).hand.length===4&&G.phase==="post"');
T('charity goes to the lowest level','P(0).lvl=5;P(1).lvl=2;P(2).lvl=3;P(3).lvl=2;for(let i=0;i<7;i++)give(0,["hexlvl","toads","imp","stompy","swash","l1","l2"][i]);G.phase="post";act({act:"end"},0);return G.phase==="charity"&&validMoves(0).every(m=>m.act==="give"&&(m.tgt===1||m.tgt===3))');
T('lowest discards instead','P(0).lvl=1;for(let i=0;i<6;i++)give(0,["hexlvl","toads","imp","stompy","swash","l1"][i]);G.phase="post";act({act:"end"},0);return G.phase==="charity"&&validMoves(0).every(m=>m.act==="toss")');
T('dwarf hand limit 6','P(0).race.push(inst("dwarf"));P(0).lvl=3;for(let i=0;i<6;i++)give(0,["hexlvl","toads","imp","stompy","swash","l1"][i]);G.phase="post";act({act:"end"},0);return G.phase!=="charity"');
T('one Big item only','const a=give(0,"buzzsaw");act({act:"play",card:a},0);const b=give(0,"boulderitem");act({act:"play",card:b},0);return bigCount(P(0))===1&&P(0).hand.includes(b)===false&&checkInvariants().length===0');
T('dwarf any number of Big items','P(0).race.push(inst("dwarf"));const a=give(0,"buzzsaw");act({act:"play",card:a},0);const b=give(0,"boulderitem");act({act:"play",card:b},0);return bigCount(P(0))===2');
T('two hands max','const a=give(0,"swash");act({act:"play",card:a},0);const b=give(0,"rascal");act({act:"play",card:b},0);const c=give(0,"pole");act({act:"play",card:c},0);return P(0).eq.find(e=>e.id===c).on===false');
T('restricted item carried, not worn','const a=give(0,"zaphat");act({act:"play",card:a},0);return P(0).eq[0].on===false');
T('loophole lets you wear it','const a=give(0,"zaphat");act({act:"play",card:a},0);const l=give(0,"loophole");act({act:"play",card:l,tgt:a},0);return P(0).eq[0].on===true&&pStr(P(0))===4');
T('death: looting highest level first','P(0).lvl=2;P(1).lvl=5;P(2).lvl=3;P(3).lvl=4;wear(0,"stompy");wear(0,"swash");give(0,"l1");P(1).human=false;P(2).human=false;P(3).human=false;die(P(0),"test");return P(0).dead&&P(1).hand.length===1&&P(3).hand.length===1&&P(2).hand.length===1');
T('smoke and mirrors swaps a monster','P(0).lvl=1;fightNow(0,"inferno");const s=give(0,"mirrors");const m=give(0,"imp");act({act:"play",card:s,tgt:0,opt:m},0);return G.cb.mons.length===1&&mdef(G.cb.mons[0]).k==="imp"');
T('borrow an item that makes you win','P(0).lvl=1;fightNow(0,"toads");const b=give(0,"borrow");const w=wear(1,"stompy");return validMoves(0).some(m=>m.act==="play"&&m.card===b&&m.opt===w)');
T('sudden gust takes worn headgear','const h=wear(1,"bucket");const g=give(0,"hexgust");act({act:"play",card:g,tgt:1},0);return !P(1).eq.length');
T('hen hat: -1 to die rolls, gone with headgear','const h=wear(1,"bucket");const g=give(0,"hexhen");act({act:"play",card:g,tgt:1},0);const a=persMod(P(1),"die")===-1;const g2=give(0,"hexgust");act({act:"play",card:g2,tgt:1},0);return a&&persMod(P(1),"die")===0');
T('gender swap: -5 next fight','P(1).lvl=6;const g=give(0,"hexsex");act({act:"play",card:g,tgt:1},0);return P(1).sex==="m"&&pStr(P(1))===1');
T('elf helper gains a level','P(0).lvl=1;P(1).lvl=5;P(1).race.push(inst("elf"));P(1).human=false;fightNow(0,"sirens");act({act:"ask",tgt:1,opt:1},0);if(G.q)act({act:"opt",opt:"yes"},1);if(G.cb.help!==1)return "no help";act({act:"fight"},0);let n=0;while(G.phase==="combat"&&n++<9)act({act:"pass"});return P(1).lvl===6&&P(0).lvl===2');
T('pergola: no help','fightNow(0,"pergola");return !validMoves(0).some(m=>m.act==="ask")');
T('shieldmaiden gives a woman 1 treasure','P(0).sex="f";const n=P(0).hand.length;fightNow(0,"amazon");return G.phase==="post"&&P(0).hand.length===n+1');
T('divine: clerics go up','P(2).cls.push(inst("cleric"));P(2).lvl=4;const d=inst("favor");gain(P(0),d);return P(2).lvl===5');
T('treasure pile draws 3','const n=P(0).hand.length;const d=inst("pile");gain(P(0),d);return P(0).hand.length===n+3');
T('tax: others pay or lose','wear(0,"stompy");wear(1,"bucket");P(1).lvl=4;const t=give(2,"hextax");G.active=2;act({act:"play",card:t,tgt:0},2);if(G.q)act({act:"pick",opt:0},0);return P(0).eq.length===0&&P(1).eq.length===0&&P(1).lvl===3');
T('mixed heritage: a second race replaces the older one','P(0).half=inst("mixed");P(0).race.push(inst("elf"));P(0).race.push(inst("dwarf"));const h=give(0,"halfling");act({act:"play",card:h},0);return P(0).race.length===2&&isRace(P(0),"halfling")&&isRace(P(0),"dwarf")');
T('same race again just replaces the card','P(0).half=inst("mixed");P(0).race.push(inst("elf"));const h=give(0,"elf");act({act:"play",card:h},0);return P(0).race.length===1');
T('cleric resurrection takes the top door discard, not the paid card','P(0).cls.push(inst("cleric"));const top=inst("elf");G.dd.push(top);const pay=give(0,"dwarf");act({act:"resurrect",card:pay},0);return P(0).hand.includes(top)&&!P(0).hand.includes(pay)&&G.dd.includes(pay)&&!G.dd.includes(top)&&G.kicked===top');
T('rummaging rod: a pick in the dock, one button per discard','const a=inst("imp");const b=inst("elf");const c=inst("stompy");G.dd.push(a,b);G.td.push(c);const rod=give(0,"rod");UI.lastSeat=0;UI.pass=null;render();const m=validMoves(0).find(x=>x.card===rod&&x.act==="play");if(!m)return "rod not playable";act(m,0);render();if(!G.q||G.q.kind!=="pick")return "no pick question";const pool=G.dd.concat(G.td).filter(x=>x!==rod);const btns=[...document.querySelectorAll("#side #prompt [data-mv]")].filter(x=>JSON.parse(x.dataset.mv).act==="pick");if(btns.length!==pool.length||btns.length!==G.q.opts.length)return "buttons "+btns.length+" vs discards "+pool.length;const i=G.q.opts.indexOf(b);btns[i].dispatchEvent(new MouseEvent("click",{bubbles:true}));return P(0).hand.includes(b)&&!G.dd.includes(b)&&!G.q',true);
console.log('rules tests: '+pass+' passed, '+fail+' failed');out.forEach(x=>console.log(x));
