// Headless rules test (W391): engine + AI in a vm, no page. Run: node rules-test.js [games=200]
const fs = require('fs'), vm = require('vm'), path = require('path');
const C = { console, Math, Date, JSON, setTimeout, clearTimeout, performance: { now: Date.now }, window: {}, document: {} }; vm.createContext(C);
for (const f of ['data', 'djinns', 'engine', 'ai']) vm.runInContext(fs.readFileSync(path.join(__dirname, 'src', f + '.js'), 'utf8'), C, { filename: f });
const run = s => vm.runInContext(s, C); run('UI.sim=true;');
const N = +process.argv[2] || 200, fails = [];
const T = (n, f) => { try { const r = f(); if (r !== true) fails.push(n + ': ' + r); } catch (e) { fails.push(n + ': threw ' + e.message); } };
run(`function playOne(sd,np,ex){ DEFSEED=sd; newGame({np:np,ex:ex||{},seats:Array.from({length:np},function(){return {human:false}})}); var g=0, trig=null, after=0, palmMax=0, palMax=0;
  while(!G.over && g++<30000){ var s=sideToAct(), m=aiMove(s); if(!m) return {stuck:'nomove '+G.phase+' '+G.step}; var was=G.endTrig; performMove(m,s);
    if(G.endTrig && !was) trig=G.turn; if(trig!=null && G.turn>trig) after++;
    var pm=0,pl=0; G.board.forEach(function(t){pm+=t.palm||0;pl+=t.pal||0}); palmMax=Math.max(palmMax,pm); palMax=Math.max(palMax,pl); }
  return {over:!!G.over, trig:trig, after:after, turn:G.turn, palmMax:palmMax, palMax:palMax}; }`);
T('game-ends-at-end-of-the-turn-of-the-last-camel', () => {
  let seen = 0; for (let sd = 1; sd <= 60; sd++) { const r = run(`playOne(${sd},${2 + sd % 3})`); if (r.stuck) return r.stuck; if (!r.over) return 'not over seed ' + sd; if (r.trig != null) { seen++; if (r.after) return 'turns continued after the last camel, seed ' + sd; } }
  return seen > 0 || 'no game reached the camel ending';
});
T('palm-and-palace-supply-is-finite', () => {
  for (let sd = 1; sd <= 60; sd++) { const r = run(`playOne(${sd},${2 + sd % 3})`); if (r.palmMax > 22 || r.palMax > 10) return 'over supply seed ' + sd + ' ' + r.palmMax + '/' + r.palMax; }
  return run(`(function(){ newGame({np:2,seats:[{human:false},{human:false}]}); G.sup={palm:0,pal:0}; var t=G.board.find(function(t){return !t.block}); var a=placeMoves(G.pl[0],t,'palm'), b=placeMoves(G.pl[0],t,'pal'); var k=G.board.find(function(t){return t.k==='oasis'}); placePalm(G.pl[0],k.i); return a.length===1&&a[0].skip&&b.length===1&&b[0].skip&&!k.palm; })()`);
});
let stuck = 0, bad = 0;
for (let i = 0; i < N; i++) { const r = run(`playOne(${i + 100},${2 + i % 3},${i % 4 === 1 ? '{thieves:1}' : i % 4 === 2 ? '{artisans:1}' : '{}'})`); if (r.stuck || !r.over) { stuck++; if (stuck < 3) console.log('stuck', i, r.stuck || ''); } }
console.log(`ai games ${N} stuck ${stuck}`); if (stuck) fails.push('stuck games ' + stuck);
fails.forEach(f => console.log('FAIL case ' + f)); console.log(fails.length ? 'FAIL rules-test' : 'PASS rules-test'); process.exit(fails.length ? 1 : 0);
