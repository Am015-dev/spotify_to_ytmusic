// Validates data/cards.json + data/corps.json against CARD-SPEC.md and the structural targets in COMPONENTS.md.
// Usage: node data/validate.js [--curve]   (exit 1 on any error)
const fs = require('fs'), path = require('path');
const D = __dirname;
const cards = JSON.parse(fs.readFileSync(path.join(D, 'cards.json'), 'utf8'));
const corps = JSON.parse(fs.readFileSync(path.join(D, 'corps.json'), 'utf8'));
const T = JSON.parse(fs.readFileSync(path.join(D, 'targets.json'), 'utf8'));
const errs = [], warn = [];
const R = ['mc', 'steel', 'ti', 'plant', 'energy', 'heat'], CR = ['microbe', 'animal', 'science', 'fighter'];
const TAGS = ['building', 'space', 'science', 'power', 'earth', 'jovian', 'plant', 'microbe', 'animal', 'city'];
const OPS = { prod: ['r', 'n'], gain: ['r', 'n'], lose: ['r', 'n'], rprod: ['r', 'n'], rres: ['r', 'n'], temp: ['n'], oxy: ['n'], ocean: ['n'], tr: ['n'], tile: ['t'], draw: ['n'], addres: ['n', 'to'], gainper: ['r', 'n', 'per'], prodper: ['r', 'n', 'per'], choose: ['opts'], useres: ['n'] };
const EFF = { disc: ['n'], onTag: ['tag', 'do'], onTile: ['t', 'do'], steelVal: ['n'], tiVal: ['n'], reqSlack: ['n'], stdDisc: ['n'], greenCost: ['n'], heatAsMc: [], onPay: ['min', 'do'] };
const PER = /^(tag:\w+|tagAll:\w+|cities|citiesAll|oceans|greeneries|greeneriesAll)$/;
const PV = { mc: 5, steel: 8, ti: 12, plant: 8, energy: 7.5, heat: 4 }, GV = { mc: 1, steel: 2, ti: 3, plant: 1.5, energy: 1.2, heat: 0.8, microbe: 1.5, animal: 3, science: 2, fighter: 4 };
function chkOps(ops, where, card) {
  if (!Array.isArray(ops)) { errs.push(where + ': ops must be an array'); return 0; }
  let v = 0;
  for (const o of ops) {
    const need = OPS[o.op];
    if (!need) { errs.push(where + ': unknown op ' + JSON.stringify(o)); continue; }
    for (const f of need) if (o[f] === undefined) errs.push(where + ': op ' + o.op + ' missing ' + f);
    if (o.r && !R.includes(o.r)) errs.push(where + ': bad resource ' + o.r);
    if (o.per && !PER.test(o.per)) errs.push(where + ': bad per ' + o.per);
    if (o.tag && !TAGS.includes(o.tag)) errs.push(where + ': bad tag ' + o.tag);
    if (o.op === 'tile' && !['city', 'greenery', 'special'].includes(o.t)) errs.push(where + ': bad tile ' + o.t);
    if (o.op === 'addres') { const k = o.kind || (card && card.res); if (!CR.includes(k)) errs.push(where + ': addres needs kind/res'); }
    if (o.op === 'choose') { let best = 0; o.opts.forEach((l, i) => { best = Math.max(best, chkOps(l, where + '.opt' + i, card)); }); v += best; continue; }
    const n = o.n || 0;
    if (o.op === 'prod') v += n * PV[o.r];
    else if (o.op === 'gain') v += n * GV[o.r];
    else if (o.op === 'lose') v -= n * GV[o.r];
    else if (o.op === 'rprod') v += n * PV[o.r] * 0.5;
    else if (o.op === 'rres') v += n * GV[o.r] * 0.4;
    else if (['temp', 'oxy', 'ocean'].includes(o.op)) v += n * (o.op === 'ocean' ? 10 : 8);
    else if (o.op === 'tr') v += n * 7;
    else if (o.op === 'tile') v += o.t === 'city' ? 12 : o.t === 'greenery' ? 15 : 6;
    else if (o.op === 'draw') v += n * 3.5;
    else if (o.op === 'addres') v += n * (GV[o.kind || card.res] || 1);
    else if (o.op === 'gainper') v += n * 3 * GV[o.r] / (o.div || 1);
    else if (o.op === 'prodper') v += n * 2.5 * PV[o.r] / (o.div || 1);
  }
  return v;
}
function chkEff(effs, where, card) {
  let v = 0;
  for (const e of effs || []) {
    const k = Object.keys(EFF).find(x => e[x] !== undefined || e.e === x);
    const kind = e.e || k;
    if (!EFF[kind]) { errs.push(where + ': unknown effect ' + JSON.stringify(e)); continue; }
    for (const f of EFF[kind]) if (e[f] === undefined) errs.push(where + ': effect ' + kind + ' missing ' + f);
    if (e.do) v += 3 * chkOps(e.do, where + '.do', card);
    else v += 12;
  }
  return v;
}
function chkReq(req, where) {
  if (!req) return 0;
  let pen = 0;
  for (const k of Object.keys(req)) {
    const q = req[k];
    if (['temp', 'oxy', 'ocean'].includes(k)) {
      if (q.min === undefined && q.max === undefined) errs.push(where + ': req ' + k + ' needs min or max');
      if (k === 'temp' && ((q.min ?? q.max) % 2 !== 0 || (q.min ?? q.max) < -30 || (q.min ?? q.max) > 8)) errs.push(where + ': temp req must be even, -30..8');
      if (k === 'oxy' && ((q.min ?? q.max) < 0 || (q.min ?? q.max) > 14)) errs.push(where + ': oxy req 0..14');
      if (k === 'ocean' && ((q.min ?? q.max) < 0 || (q.min ?? q.max) > 9)) errs.push(where + ': ocean req 0..9');
      pen += 3;
    } else if (k === 'tags') { for (const t of Object.keys(q)) if (!TAGS.includes(t)) errs.push(where + ': bad req tag ' + t); pen += 2; }
    else if (k === 'prod') { for (const r of Object.keys(q)) if (!R.includes(r)) errs.push(where + ': bad req prod ' + r); pen += 2; }
    else if (k === 'cities' || k === 'greeneries') pen += 2;
    else errs.push(where + ': unknown req ' + k);
  }
  return pen;
}
const ids = new Set(), names = new Set(), curve = [];
for (const c of cards) {
  const w = c.id + ' ' + c.name;
  if (ids.has(c.id)) errs.push('dup id ' + c.id); ids.add(c.id);
  if (names.has(c.name.toLowerCase())) errs.push('dup name ' + c.name); names.add(c.name.toLowerCase());
  if (!['auto', 'active', 'event'].includes(c.type)) errs.push(w + ': bad type');
  if (!(c.cost >= 0 && c.cost <= 45)) errs.push(w + ': bad cost');
  for (const t of c.tags || []) if (!TAGS.includes(t)) errs.push(w + ': bad tag ' + t);
  if (!c.text || c.text.split(/\s+/).length > 22) errs.push(w + ': text missing or over 22 words');
  if (c.type !== 'active' && (c.effect || c.action)) errs.push(w + ': only active cards have effect/action');
  if (c.type === 'active' && !(c.effect && c.effect.length) && !(c.action && c.action.length)) errs.push(w + ': active card needs effect or action');
  if (c.res && !CR.includes(c.res)) errs.push(w + ': bad res');
  if (c.type === 'event' && c.vp && typeof c.vp === 'object') errs.push(w + ': events only flat vp');
  let v = chkOps(c.play || [], w + '.play', c) + chkEff(c.effect, w + '.effect', c);
  for (const a of c.action || []) { const g = chkOps(a.do, w + '.action.do', c) - chkOps(a.cost || [], w + '.action.cost', c) * -0; const cst = (a.cost || []).reduce((s, o) => s + (o.op === 'lose' ? o.n * GV[o.r] : o.op === 'useres' ? o.n * (GV[c.res] || 1) : 0), 0); v += Math.max(0, chkOps(a.do, w, c) - cst) * 5; }
  if (typeof c.vp === 'number') v += c.vp * 5; else if (c.vp) v += 6;
  const pen = chkReq(c.req, w);
  const tagv = (c.tags || []).length * 1.5;
  curve.push([c.id, c.name, c.cost, Math.round(v + pen + tagv - (c.cost + 3))]);
}
for (const c of corps) {
  if (!c.name || !(c.mc >= 0)) errs.push('corp ' + c.id + ': name/mc');
  chkOps(c.start || [], 'corp ' + c.id + '.start', c); chkEff(c.effect, 'corp ' + c.id + '.effect', c);
  for (const a of c.action || []) chkOps(a.do, 'corp ' + c.id + '.action', c);
}
// structure targets
const cnt = (f) => cards.filter(f).length, tol = T.tolerance;
const check = (label, got, want, t = tol) => { if (Math.abs(got - want) > t) errs.push(`structure: ${label} = ${got}, target ${want} (+-${t})`); else console.log(`  ${label}: ${got} (target ${want})`); };
check('project cards', cards.length, T.total, 0);
for (const k of ['auto', 'active', 'event']) check('type ' + k, cnt(c => c.type === k), T.types[k], 0);
for (const t of TAGS) check('tag ' + t, cnt(c => (c.tags || []).includes(t)), T.tags[t]);
check('no tag (non-event)', cnt(c => c.type !== 'event' && !(c.tags || []).length), T.noTag);
for (const [b, want] of Object.entries(T.costBands)) { const [lo, hi] = b.split('-').map(Number); check('cost ' + b, cnt(c => c.cost >= lo && c.cost <= hi), want, 5); }
for (const [k, want] of Object.entries(T.req)) check('req ' + k, cnt(c => c.req && c.req[k] !== undefined), want, 4);
for (const [k, want] of Object.entries(T.res)) check('res ' + k, cnt(c => c.res === k), want, 2);
check('cards with VP', cnt(c => c.vp), T.vpCards, 8);
check('corporations', corps.filter(c => !c.beginner).length, T.corps, 0);
if (process.argv.includes('--curve')) { curve.sort((a, b) => Math.abs(b[3]) - Math.abs(a[3])); console.log('furthest off curve (value - cost - 3):'); curve.slice(0, 25).forEach(r => console.log('  ', r.join(' | '))); }
if (errs.length) { console.log('ERRORS (' + errs.length + '):\n' + errs.slice(0, 60).join('\n')); process.exit(1); }
console.log('OK: ' + cards.length + ' cards, ' + corps.length + ' corporations');
