// Scenario tutorial: every scenario must be WON by its scripted solution and LOST (with a message) by its wrong play. node scenarios-test.js
global.OH = require('./src/engine.js'); global.OHAI = require('./src/ai.js');
var C = require('./src/charters.js'), bad = 0;
C.SC.forEach(function (c, i) {
  var a = C.sRun(i, c.policy || c.solve), b = C.sRun(i, c.wrong);
  var ok = a.S.result && a.S.result.ok, lost = b.S.result && !b.S.result.ok && b.S.result.line;
  if (!ok || !lost) bad++;
  console.log((ok && lost ? 'PASS ' : 'FAIL ') + c.n + ' ' + c.id + ' solve=' + (a.bad ? 'illegal ' + JSON.stringify(a.bad) : a.S.result ? (a.S.result.ok ? 'win ' + a.S.result.stars + '*' : 'lost') : 'open') + ' acts=' + a.S.acts + ' spent=' + a.S.spent +
    ' score=' + OH.score(0).total + ':' + OH.score(1).total + ' wrong=' + (b.bad ? 'illegal ' + JSON.stringify(b.bad) : b.S.result ? (b.S.result.ok ? 'WON' : 'fail') : 'open'));
});
console.log(bad ? bad + ' scenario(s) broken' : 'all ' + C.SC.length + ' scenarios pass');
process.exit(bad ? 1 : 0);
