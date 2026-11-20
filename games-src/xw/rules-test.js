// Headless rules test (W391): loads geo/data/exp/engine/ai into a vm with no page. Run: node rules-test.js
const fs = require('fs'), vm = require('vm'), path = require('path');
const C = { console, Math, Date, JSON, setTimeout, clearTimeout, performance: { now: Date.now } }; vm.createContext(C);
for (const f of ['geo', 'data', 'exp', 'engine', 'ai']) vm.runInContext(fs.readFileSync(path.join(__dirname, f + '.js'), 'utf8'), C, { filename: f });
const run = s => vm.runInContext(s, C); run('refresh=function(){};');
const fails = []; const T = (n, f) => { try { const r = f(); if (r !== true) fails.push(n + ': ' + r); } catch (e) { fails.push(n + ': threw ' + e.message); } };
T('tied-squads-second-faction-has-initiative', () => run(`(function(){ newGame({players:[{human:true},{human:true}],seed:4}); G.pts=[30,30]; G.init=0; G.q=null; var done=false; rollInitiative(function(){done=true}); return done && G.init===1 && !G.q; })()`));
T('lower-squad-total-has-initiative', () => run(`(function(){ newGame({players:[{human:false},{human:false}],seed:4}); G.pts=[31,30]; var d=false; rollInitiative(function(){d=true}); return d && G.init===1 && (G.pts=[29,30], rollInitiative(function(){}), G.init===0); })()`));
T('one-die-per-maneuver-not-per-asteroid', () => run(`(function(){ newGame({players:[{human:false},{human:false}],seed:5}); var s=G.ships[0]; s.x=450;s.y=450;s.h=0; G.ships.forEach(function(o){ if(o!==s){o.x=100;o.y=100;} });
  var m={s:1,t:'S',d:0,c:'w'}; var fp=finalPose(s,B(s),m); G.rocks=[0,1,2].map(function(i){var r=rockShape();r.x=fp.x+i*3;r.y=fp.y+i*3;return r;});
  G.log=[]; var d=false; executeMove(s,m,function(){d=true}); var n=G.log.filter(function(l){return /asteroid/.test(l.t);}).length; return n===1 || 'asteroid rolls '+n+' done '+d; })()`));
T('barrel-roll-blocked-by-asteroid-under-template', () => run(`(function(){ newGame({players:[{human:false},{human:false}],seed:6}); var s=G.ships[0]; s.x=450;s.y=450;s.h=0; G.ships.forEach(function(o){ if(o!==s){o.x=100;o.y=100;} }); G.rocks=[];
  var free=rollOptions(s).length; var b=B(s); var r=rockShape(); r.x=450; r.y=450+b/2+GEO.straight/2; r.r=6; G.rocks=[r];
  var left=rollOptions(s).filter(function(o){return o.dir<0;}).length, right=rollOptions(s).filter(function(o){return o.dir>0;}).length;
  return (free===10 && left===0 && right===5) || 'free '+free+' left '+left+' right '+right; })()`));
T('barrel-roll-blocked-by-asteroid-at-end', () => run(`(function(){ newGame({players:[{human:false},{human:false}],seed:6}); var s=G.ships[0]; s.x=450;s.y=450;s.h=0; G.ships.forEach(function(o){ if(o!==s){o.x=100;o.y=100;} });
  var b=B(s); var r=rockShape(); r.x=450; r.y=450-(b+GEO.straight); r.r=10; G.rocks=[r]; var right=rollOptions(s).filter(function(o){return o.dir>0;}).length; return right===0 || 'right '+right; })()`));
T('boost-blocked-by-asteroid-on-template', () => run(`(function(){ newGame({players:[{human:false},{human:false}],seed:6}); var s=G.ships[0]; s.x=450;s.y=450;s.h=0; G.ships.forEach(function(o){ if(o!==s){o.x=100;o.y=100;} }); G.rocks=[];
  var free=boostOptions(s).length; var b=B(s); var r=rockShape(); r.x=450+b/2+GEO.straight/2; r.y=450; r.r=5; G.rocks=[r];
  var opts=boostOptions(s); var straight=opts.filter(function(o){return o.m.t==='S';}).length; s.flags=s.flags||{}; return (free===3 && straight===0) || 'free '+free+' straight '+straight; })()`));
T('blocked-roll-and-boost-not-offered-as-actions', () => run(`(function(){ newGame({players:[{human:false},{human:false}],seed:6}); var s=G.ships[0]; s.x=450;s.y=450;s.h=0; G.ships.forEach(function(o){ if(o!==s){o.x=100;o.y=100;} });
  G.rocks=[-1,1].map(function(k){var r=rockShape(); r.x=450; r.y=450+k*(B(s)/2+GEO.straight/2); r.r=30; return r;}); return rollOptions(s).length===0 || 'roll opts '+rollOptions(s).length; })()`));
if (fails.length) { fails.forEach(f => console.log('FAIL case ' + f)); }
console.log(fails.length ? 'FAIL rules-test' : 'PASS rules-test'); process.exit(fails.length ? 1 : 0);
