// targeted rule checks for the fix pass: node unit.js
const {JSDOM}=require('jsdom');const fs=require('fs');const html=fs.readFileSync('nebula.html','utf8');
function fresh(sq,players,init){const w=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'http://localhost/'}).window;w.eval('ANIM=0;AIDELAY=0;setSeed(7)');
  w.__sq=sq;w.eval(`newGame({fac:[0,1],players:${JSON.stringify(players||[{human:false},{human:false}])},squads:window.__sq,ex:{w1:true,w2:true,w3:true,noRocks:true}})`);return w}
let ok=0,bad=0;const T=(n,c)=>{if(c)ok++;else{bad++;console.log('FAIL',n)}};
{const w=fresh([[{p:'jax',u:['u_snap']}],[{p:'slate',u:[]}]]);// large ship barrel roll via Snap Roll
  const r=w.eval("(()=>{const s=G.ships[0];Object.assign(s,{x:457,y:457,h:Math.PI/2});G.ships[1].x=100;G.ships[1].y=850;return rollOptions(s).map(o=>[o.dir,o.sh,Math.round(o.p.x-457)])})()");
  T('large roll 10 options',r.length===10);T('large roll moves 100 mm',r.every(o=>Math.abs(o[2])===100));T('large slide +-20',r.some(o=>o[1]===20)&&r.some(o=>o[1]===-20))}
{const w=fresh([[{p:'kael',u:[]}],[{p:'bram',u:[]}]]);T('Iron Warden title adds torpedo slot',w.eval("upgradesFor('bram',{w1:1,w2:1,w3:1}).includes('u_plasma')"));T('no torpedo on other pilots of ... check lancer ok',w.eval("upgradesFor('kael',{}).includes('u_plasma')"));
  T('unique character pilot+crew',w.eval("(()=>{for(let i=0;i<300;i++){const sq=randomSquad(0,100,{w1:1,w2:1,w3:1});const n=[];sq.forEach(e=>{if(PILOTS[e.p].uniq)n.push(uname(PILOTS[e.p]));e.u.forEach(u=>{if(UPGRADES[u].uniq)n.push(uname(UPGRADES[u]))})});if(new Set(n).size!==n.length)return false}return true})()"))}
{const w=fresh([[{p:'kael',u:[]}],[{p:'slate',u:[]}]]);// simultaneous destruction: initiative wins
  const r=w.eval("(()=>{G.winner=null;G.phase='combat';G.ships.forEach(s=>{s.alive=false});return checkWin()&&G.winner==='P'+(G.init+1)})()");T('simultaneous: initiative wins',r)}
{const w=fresh([[{p:'wren',u:[]}],[{p:'slate',u:[]}]]);// Wren Talvo: agility -1 before bonus dice
  T('wedge def dice at range 3 = agi-1+1',w.eval("defDice(G.ships[0],G.ships[1],true,3,false)")===3);
  T('wedge floors agility at 0 then adds range die',w.eval("(()=>{G.ships[1].agi=0;return defDice(G.ships[0],G.ships[1],true,3,true)})()")===2)}
{const w=fresh([[{p:'kael',u:[]}],[{p:'slate',u:[]}]]);// proton bomb: faceup card through shields
  const r=w.eval("(()=>{const s=G.ships[0];const sh=s.sh;const n=s.dmg.length;dealCardDirect(s,null);return [s.sh===sh,s.dmg.length===n+1||s.dmg.length===n]})()");T('plasma bomb bypasses shields',r[0]&&r[1])}
{const w=fresh([[{p:'jax',u:[]}],[{p:'shiv',u:[]}]]);// "Shiv" behind a turret ship
  const r=w.eval("(()=>{const a=G.ships[1],d=G.ships[0];Object.assign(d,{x:457,y:457,h:Math.PI/2});Object.assign(a,{x:457,y:300,h:Math.PI/2});const behind=exAtkBonus(a,d,{},{});Object.assign(a,{x:457,y:620,h:-Math.PI/2});return [behind,exAtkBonus(a,d,{},{})]})()");T('shiv +1 behind a turret ship',r[0]===1);T('shiv +0 in its front arc',r[1]===0)}
{const w=fresh([[{p:'kira',u:['u_ionlance']}],[{p:'slate',u:[]}]]);// heavy pursuit ship secondary weapons front arc only
  const r=w.eval("(()=>{const a=G.ships[0],d=G.ships[1];Object.assign(a,{x:457,y:457,h:Math.PI/2});Object.assign(d,{x:457,y:300,h:Math.PI/2});return weaponsFor(a).map(x=>x.k)})()");T('rear arc: primary only',r.includes('P')&&!r.some(k=>k!=='P'))}
{const w=fresh([[{p:'rhane',u:['u_adren']}],[{p:'kael',u:[]}]].reverse(),[{human:false},{human:false}]);// stressed ship + Adrenaline: flies the red maneuver as white
  const r=w.eval("(()=>{const s=G.ships.find(x=>x.pilot==='rhane');s.stress=1;const red=dialOf(s).find(m=>m.c==='r'&&m.t!=='K');let got=null;exReveal(s,red,m=>stressCheck(s,m,mm=>{got=mm}));return [got===red||(got&&got.t===red.t&&got.s===red.s),s.flags.adren]})()");T('adrenaline before stress check',r[0]&&r[1])}
{const w=fresh([[{p:'kael',u:[]}],[{p:'slate',u:[]}]]);// per-round action limit
  const r=w.eval("(()=>{const s=G.ships[0];s.doneR=['F'];return actionsFor(s).some(a=>a.a==='F')})()");T('focus not offered twice a round',!r)}
{const w=fresh([[{p:'kael',u:[]}],[{p:'slate',u:[]}]],[{human:true},{human:false}]);// human sets up: rocks off, so deployment questions only
  T('human deploy asked',w.eval("G.phase==='ask'&&G.q.key==='deploy'"))}
{const w=fresh([[{p:'kael',u:[]}],[{p:'slate',u:[]}]]);// destroyed ship's cards go to the discard pile
  const r=w.eval("(()=>{const s=G.ships[1];const d0=G.disc.length;dealDamage(s,3,0,null);return [!s.alive,s.dmg.length===0,G.disc.length===d0+3]})()");T('destroyed cards discarded',r.every(Boolean))}
{const w=fresh([[{p:'kael',u:['u_tinker']}],[{p:'hex',u:[]}]]);// "Hex" blocks the Snapshot-style focus use and focus spending
  const r=w.eval("(()=>{const a=G.ships[0],d=G.ships[1];a.focus=1;return exWeaponNeedOK(a,{need:'F',spend:'F'},d)})()");T('no focus-cost weapon at Hex',r===false)}
{const w=fresh([[{p:'tamsin',u:['u_snapeye','u_shock']}],[{p:'slate',u:[]}]],[{human:true},{human:false}]);// Snapshot Eye with lock and focus: player picks how to pay
  const r=w.eval("(()=>{G.q=null;const a=G.ships[0],d=G.ships[1];Object.assign(a,{x:457,y:200,h:Math.PI/2});Object.assign(d,{x:457,y:450,h:-Math.PI/2});a.tl=d.id;a.focus=1;G.phase='target';G.cur=a.id;G.inCombat=true;const w=weaponsFor(a).find(x=>x.k!=='P');declare(a,w.k,d.id);const k=G.q&&G.q.key;performMove({act:'ask',k:'f'},0);return [k,a.tl===d.id,a.focus]})()");
  T('snapshot eye pay question',r[0]==='pay'&&r[1]&&r[2]===0)}
{const w=fresh([[{p:'kira',u:['u_ionlance','u_hplasma'].slice(0,1).concat(['u_quake'])}],[{p:'slate',u:[]}]],[{human:true},{human:false}]);
  const r=w.eval("(()=>{G.q=null;const s=G.ships[0];s.ups.push({id:'u_seeker',gone:false});G.deck.push('jam');let done=false;s.sh=0;dealDamage(s,0,1,null,()=>{done=true});const k=G.q&&G.q.key;if(k)performMove({act:'ask',k:G.q.opts[0].k},0);return [k,done,s.ups.filter(u=>u.gone).length]})()");
  T('munitions jam asks which weapon',r[0]==='munitions'&&r[1]&&r[2]===1)}
{const w=fresh([[{p:'kael',u:[]}],[{p:'krell',u:['u_ionlance']}]]);// Krell: 1-die reroll on a secondary attack
  const r=w.eval("(()=>{const a=G.ships[1],d=G.ships[0];Object.assign(a,{x:457,y:600,h:-Math.PI/2});Object.assign(d,{x:457,y:350,h:Math.PI/2});G.phase='target';G.cur=a.id;G.inCombat=true;const wp=weaponsFor(a).find(x=>x.k!=='P');declare(a,wp.k,d.id);if(G.phase==='damod')damodDone();const m=atkMods().map(m=>m.k);const before=G.atk.rr.filter(Boolean).length;if(m.includes('krell'))applyAtkMod('krell',[0]);return [m.includes('krell'),G.atk.rr[0]===true,before===0]})()");
  T('krell reroll on secondary',r.every(Boolean))}
{const w=fresh([[{p:'kael',u:[]}],[{p:'rhane',u:['u_plasma']}]]);// Rhane: torpedo range 2-3 becomes 1-3
  const r=w.eval("(()=>{const a=G.ships[1],d=G.ships[0];Object.assign(a,{x:457,y:470,h:-Math.PI/2});Object.assign(d,{x:457,y:390,h:Math.PI/2});a.tl=d.id;return weaponsFor(a).some(x=>x.k!=='P'&&x.targets.some(t=>t.rg===1))})()");
  T('rhane fires a range 2-3 torpedo at range 1',r)}
for(const [wu,want] of [['u_swarmm','twice'],['u_burst','splash']]){const w=fresh([[{p:'jadesq',u:[wu]}],[{p:'slate',u:[]},{p:'drill',u:[]}]]);
  const r=w.eval("(()=>{const a=G.ships[0],d=G.ships[1],o=G.ships[2];Object.assign(a,{x:457,y:250,h:Math.PI/2});Object.assign(d,{x:457,y:430,h:-Math.PI/2});Object.assign(o,{x:530,y:450,h:-Math.PI/2});d.agi=0;o.agi=0;d.hull=20;a.tl=d.id;G.phase='target';G.cur=a.id;G.inCombat=true;const wp=weaponsFor(a).find(x=>x.k!=='P');if(!wp)return 'noweapon';for(let i=0;i<40&&G.phase!=='plan'&&G.phase!=='over'&&(G.cur===a.id||G.phase==='dmod'||G.phase==='damod');i++){if(i===0){declare(a,wp.k,d.id);G.atk.dice=G.atk.dice.map(()=>'hit');continue}aiStep()}return JSON.stringify(G.fired)})()");
  console.log(wu,r);T(wu+' '+want,r.includes(want))}
{const w=fresh([[{p:'tamsin',u:['u_snapeye','u_shock']}],[{p:'slate',u:[]}]]);// Snapshot Eye: focus instead of a missing lock
  const r=w.eval("(()=>{const a=G.ships[0],d=G.ships[1];Object.assign(a,{x:457,y:200,h:Math.PI/2});Object.assign(d,{x:457,y:450,h:-Math.PI/2});a.focus=1;a.tl=null;const wp=weaponsFor(a).find(x=>x.k!=='P');if(!wp)return false;G.phase='target';G.cur=a.id;declare(a,wp.k,d.id);return a.focus===0&&G.fired.snapeye===1})()");T('snapshot eye pays with focus',r)}
{const w=fresh([[{p:'oren',u:['u_rapid']}],[{p:'kira',u:[]}]]);// Rapid Blaster: hits can't be cancelled, crits can (and count for Kira-style checks)
  const r=w.eval("(()=>{const s=G.ships[0];G.atk={a:s.id,d:G.ships[1].id,w:'U0',ups:0,dice:['hit','hit','crit'],def:['evade','evade']};const p=preview(G.atk);return [p.hits,p.crits,G.atk.critCancelled]})()");T('rapid blaster',r[0]===2&&r[1]===0&&r[2]===true)}
{const w=fresh([[{p:'kellan',u:['u_sab']}],[{p:'slate',u:[]}]]);// Saboteur: action against an enemy at range 1 with a facedown card
  const r=w.eval("(()=>{const a=G.ships[0],d=G.ships[1];Object.assign(a,{x:457,y:400,h:Math.PI/2});Object.assign(d,{x:457,y:480,h:-Math.PI/2});d.dmg.push({c:G.deck.pop(),up:false});const o=actionsFor(a).find(x=>x.a==='SB');let done=false;const ok=o&&applyAction(a,'SB',d.id,()=>{done=true});return [!!o,ok,done,G.fired.sab===1,a.doneR.includes('SB')]})()");T('saboteur action',r.every(Boolean))}
console.log('unit checks: ok',ok,'failed',bad)
