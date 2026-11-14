// Twin Thrones card-text test: every card's description (the popup / All-cards line) must mention each of its effects.
// node cardtext-test.js -> prints failures, exit 1 on any.
var fs = require('fs'), D = require('./src/data.js'), src = fs.readFileSync(__dirname + '/src/ui.js', 'utf8');
var a = src.indexOf('  var COLN ='), b = src.indexOf('  // ---------- board skeleton');
var describe = new Function(src.slice(a, b) + '; return describe;')();
var fail = [], n = 0;
function need(c, txt, re) { if (!re.test(txt)) fail.push(c.nm + ': "' + txt + '" misses ' + re); }
D.CARDS.forEach(function (c) {
  var t = describe(c); n++;
  if (c.prod) Object.keys(c.prod).forEach(function (r) { need(c, t, new RegExp('makes ' + c.prod[r] + ' ' + r)); });
  if (c.choice) c.choice.forEach(function (r) { need(c, t, new RegExp(r)); });
  if (c.price) c.price.forEach(function (r) { need(c, t, new RegExp(r + '.*1 coin')); });
  if (c.shields) need(c, t, new RegExp(c.shields + ' shield'));
  if (c.sci) need(c, t, new RegExp('science: ' + c.sci));
  if (c.coin) need(c, t, new RegExp('\\+' + c.coin + ' coins'));
  if (c.perCol) { need(c, t, new RegExp('\\+' + c.perCol.coin + ' coins? per')); c.perCol.cols.forEach(function (k) { need(c, t, new RegExp(k)); }); if (c.vp) need(c, t, new RegExp(c.vp + ' points')); }
  if (c.perWonder) { need(c, t, new RegExp('\\+' + c.perWonder + ' coins per wonder')); if (c.vp) need(c, t, new RegExp(c.vp + ' points')); }
  if (c.guild) {
    var g = c.guild;
    if (g.per3) need(c, t, /1 point per 3 coins/); else { need(c, t, new RegExp('scores ' + g.vp + ' points? per')); g.cols.forEach(function (k) { need(c, t, new RegExp(k === 'purple' ? 'guild' : k)); }); if (g.coin) need(c, t, new RegExp('pays ' + g.coin + ' coin')); }
    need(c, t, /richer|more/);
  } else if (c.vp && !c.perCol && !c.perWonder) need(c, t, new RegExp(c.vp + ' points'));
  if (c.from) need(c, t, /chain/);
});
if (D.WONDERS) D.WONDERS.forEach(function (w) { if (!w.text) fail.push(w.nm + ': no text'); });
console.log(fail.length ? fail.join('\n') : 'cardtext: ' + n + ' cards ok'); process.exit(fail.length ? 1 : 0);
