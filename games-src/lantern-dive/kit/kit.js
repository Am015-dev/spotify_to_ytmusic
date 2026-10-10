// ===================== Lantern Dive art kit (LDKit) =====================
// Vector drawings (SVG strings) for cards, backs, job cards, tokens, divers and icons. When painted pictures exist (KIT.ART, made by
// ../paint/paint.js) the kit draws them inside its frames; without them it falls back to its own vector emblems, so the game never
// shows a hole. Everything is original. Sizes in CSS px.
(function (g) {
'use strict';
const D = g.LDDATA || (typeof require === 'function' ? require('../game/src/data.js') : null);
const SU = D.suits;
const FONT = "Nunito,'Trebuchet MS','Segoe UI',system-ui,'DejaVu Sans',sans-serif";
const f = n => Math.round(n * 100) / 100;
const INK = '#0b1f3a', PAPER = '#f5eed9', PAPER2 = '#e9dfc2', NAVY = '#0e2146', GOLD = '#ffd873';
const KIT = { SUITS: SU, ART: {}, FONT, INK, PAPER, GOLD };
const cached = {}; const key = (...a) => a.join('|');
let UID = 0; const uid = p => p + (++UID);
const svgOpen = (w, h, vb, extra) => `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${w}" height="${h}" viewBox="${vb}"${extra || ''}>`;

// ---------- vector emblems in a 100 x 100 box ----------
function emblemInner(s, o) {
  o = o || {}; const c = SU[s], fill = o.mono || c.c, dk = o.mono || c.dk, st = `stroke="${INK}" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round"`;
  switch (s) {
    case 0: // coral: a branching fan
      return `<path d="M50 94V64M50 64C40 56 28 54 24 38M50 64C60 54 72 56 78 38M50 64C50 50 44 40 46 22M24 38C20 30 22 22 26 18M78 38C82 30 80 22 76 18M46 22C44 16 48 10 52 8" fill="none" stroke="${INK}" stroke-width="17" stroke-linecap="round" stroke-linejoin="round"/><path d="M50 94V64M50 64C40 56 28 54 24 38M50 64C60 54 72 56 78 38M50 64C50 50 44 40 46 22M24 38C20 30 22 22 26 18M78 38C82 30 80 22 76 18M46 22C44 16 48 10 52 8" fill="none" stroke="${fill}" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/><circle cx="26" cy="18" r="4.5" fill="${dk}"/><circle cx="76" cy="18" r="4.5" fill="${dk}"/><circle cx="52" cy="8" r="4.5" fill="${dk}"/>`;
    case 1: // tide: a curling wave
      return `<path d="M8 74C12 44 34 24 58 26C78 28 90 44 86 60C82 48 70 44 62 50C56 56 60 66 70 66C58 80 24 90 8 74Z" fill="${fill}" ${st}/><path d="M16 74C26 66 40 66 52 72M22 62C32 56 44 56 54 60" fill="none" stroke="#fff" stroke-width="3.6" opacity=".7" stroke-linecap="round"/><circle cx="72" cy="40" r="3.6" fill="#fff" opacity=".85"/>`;
    case 2: // kelp: three wavy blades
      return `<path d="M50 96C34 76 56 62 44 44C34 30 40 16 48 8C62 22 58 38 54 50C48 64 62 78 50 96Z" fill="${fill}" ${st}/><path d="M42 92C24 74 34 56 26 42C22 34 24 26 28 20C38 30 40 46 38 58C36 70 46 80 42 92Z" fill="${dk}" ${st}/><path d="M60 92C74 76 66 62 74 48C78 40 76 30 72 24C64 34 62 48 62 58C62 70 56 80 60 92Z" fill="${fill}" ${st}/><path d="M48 20C52 40 52 60 50 84" fill="none" stroke="#fff" stroke-width="2.8" opacity=".55" stroke-linecap="round"/>`;
    case 3: { // sunstar: a rounded starfish
      let p = ''; for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2 - Math.PI / 2, r = i % 2 ? 24 : 46; p += (i ? 'L' : 'M') + f(50 + Math.cos(a) * r) + ' ' + f(52 + Math.sin(a) * r); }
      let dots = ''; for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2 - Math.PI / 2; dots += `<circle cx="${f(50 + Math.cos(a) * 26)}" cy="${f(52 + Math.sin(a) * 26)}" r="3.2" fill="${dk}"/>`; }
      return `<path d="${p}Z" fill="${fill}" ${st} stroke-width="5"/>${dots}<circle cx="50" cy="52" r="6" fill="#fff" opacity=".7"/>`;
    }
    default: // lantern: a glowing lure on a stalk
      return `<circle cx="50" cy="46" r="40" fill="#ffe08a" opacity=".22"/><circle cx="50" cy="46" r="30" fill="#ffe08a" opacity=".3"/><path d="M26 92C22 70 40 62 48 50" fill="none" stroke="${INK}" stroke-width="9" stroke-linecap="round"/><path d="M26 92C22 70 40 62 48 50" fill="none" stroke="${o.mono || '#a97d1c'}" stroke-width="4.4" stroke-linecap="round"/><circle cx="52" cy="36" r="19" fill="${o.mono || '#ffe9a6'}" ${st}/><circle cx="52" cy="36" r="11" fill="#fff8d6"/><circle cx="46" cy="30" r="4.4" fill="#fff"/><path d="M52 6V13M24 18L29 22M80 18L75 22M16 40H23M88 40H81" stroke="${o.mono || '#ffd873'}" stroke-width="3.6" stroke-linecap="round"/>`;
  }
}
const emblemSVG = (s, size, o) => `${svgOpen(size, size, '0 0 100 100')}${emblemInner(s, o)}</svg>`;
KIT.emblemSVG = emblemSVG; KIT.emblemInner = emblemInner;
const artImg = (id, x, y, w, h) => KIT.ART[id] ? `<image href="${KIT.ART[id]}" x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" preserveAspectRatio="xMidYMid meet"/>` : '';
// painted emblem: clipped to a framed rounded square (big) or a disc (small corner pip) so the opaque painting reads as a picture on the card
function embArt(s, x, y, w, big) {
  const id = uid('e'), r = big ? w * .14 : w / 2, bw = Math.max(1, w * (big ? .035 : .06));
  const shape = big ? `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(w)}" rx="${f(r)}"/>` : `<circle cx="${f(x + w / 2)}" cy="${f(y + w / 2)}" r="${f(w / 2)}"/>`;
  return `<defs><clipPath id="${id}">${shape}</clipPath></defs><g clip-path="url(#${id})">${artImg('emb' + s, x, y, w, w).replace('xMidYMid meet', 'xMidYMid slice')}</g>`
    + (big ? `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(w)}" rx="${f(r)}" fill="none" stroke="#d9b04a" stroke-width="${f(bw)}"/>` : `<circle cx="${f(x + w / 2)}" cy="${f(y + w / 2)}" r="${f(w / 2 - bw / 2)}" fill="none" stroke="#ffffff" stroke-width="${f(bw)}" opacity=".9"/>`);
}
function emb(s, x, y, w, big) { return KIT.ART['emb' + s] ? embArt(s, x, y, w, big) : `<svg x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(w)}" viewBox="0 0 100 100">${emblemInner(s)}</svg>`; }

// ---------- playing cards ----------
const H = w => Math.round(w * 1.4);
// part: 'mat' (paper, frame, shading) | 'top' (numerals, small emblems) | undefined (everything incl. the big emblem)
function cardSVG(id, o) {
  o = o || {}; const w = o.w || 100, h = H(w), s = D.suitOf(id), v = D.valOf(id), c = SU[s], lan = s === 4;
  const k = key('c', id, w, o.part || '', o.dim ? 1 : 0, o.sel ? 1 : 0, o.small ? 1 : 0, KIT.ART.emb0 ? 1 : 0); if (cached[k] && !o.standalone) return cached[k];
  const r = w * .085, bw = Math.max(1.6, w * .026), gid = uid('g');
  let mat = `<defs><linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${lan ? '#16336b' : '#fffaf0'}"/><stop offset="1" stop-color="${lan ? '#0a1730' : PAPER2}"/></linearGradient></defs>`;
  mat += `<rect x="${f(bw / 2)}" y="${f(bw / 2)}" width="${f(w - bw)}" height="${f(h - bw)}" rx="${f(r)}" fill="url(#${gid})" stroke="${INK}" stroke-width="${f(bw)}"/>`;
  mat += `<rect x="${f(w * .05)}" y="${f(w * .05)}" width="${f(w * .9)}" height="${f(h - w * .1)}" rx="${f(r * .7)}" fill="none" stroke="${lan ? '#d9b04a' : c.c}" stroke-width="${f(Math.max(1.2, w * .02))}" opacity=".85"/>`;
  if (lan) { let st = ''; for (let i = 0; i < 9; i++) st += `<circle cx="${f(w * (.12 + ((i * 37) % 76) / 100))}" cy="${f(h * (.1 + ((i * 53) % 80) / 100))}" r="${f(w * (.008 + (i % 3) * .004))}" fill="#9fd0ff" opacity=".5"/>`; mat += st; }
  let mid = ''; const ew = w * .56;
  mid += emb(s, (w - ew) / 2, h * .5 - ew * .5, ew, true);
  const num = lan ? GOLD : c.dk, nfs = w * .3;
  let top = '';
  const corner = rot => `<g transform="${rot ? `rotate(180 ${f(w / 2)} ${f(h / 2)})` : ''}"><text x="${f(w * .15)}" y="${f(w * .36)}" font-family="${FONT}" font-weight="900" font-size="${f(nfs)}" fill="${num}" stroke="${lan ? INK : '#fff'}" stroke-width="${f(w * .02)}" paint-order="stroke" text-anchor="start">${v}</text>${emb(s, w * .1, w * .41, w * .2)}</g>`;
  top += corner(false) + corner(true);
  let body = (o.part === 'top' ? '' : mat) + (o.part ? '' : mid) + (o.part === 'mat' ? '' : top);
  if (o.part === 'mat') body = mat;
  let shade = o.dim ? `<rect width="${w}" height="${h}" rx="${f(r)}" fill="#0b1f3a" opacity=".42"/>` : '';
  const out = `${svgOpen(w, h, `0 0 ${w} ${h}`)}${body}${shade}</svg>`;
  if (!o.standalone) cached[k] = out; return out;
}
function backSVG(o) {
  o = o || {}; const w = o.w || 100, h = H(w), r = w * .085, bw = Math.max(1.6, w * .026), gid = uid('b');
  const k = key('b', w, KIT.ART.back ? 1 : 0); if (cached[k] && !o.standalone) return cached[k];
  let s = `<defs><linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1b4a8f"/><stop offset="1" stop-color="#0b2147"/></linearGradient><clipPath id="${gid}c"><rect x="${f(bw / 2)}" y="${f(bw / 2)}" width="${f(w - bw)}" height="${f(h - bw)}" rx="${f(r)}"/></clipPath></defs>`;
  s += `<rect x="${f(bw / 2)}" y="${f(bw / 2)}" width="${f(w - bw)}" height="${f(h - bw)}" rx="${f(r)}" fill="url(#${gid})"/>`;
  if (KIT.ART.back) s += `<g clip-path="url(#${gid}c)">${artImg('back', 0, 0, w, h).replace('xMidYMid meet', 'xMidYMid slice')}</g>`;
  else {
    let w2 = ''; for (let i = 0; i < 7; i++) w2 += `<path d="M0 ${f(h * (.1 + i * .14))}Q${f(w * .25)} ${f(h * (.04 + i * .14))} ${f(w * .5)} ${f(h * (.1 + i * .14))}T${f(w)} ${f(h * (.1 + i * .14))}" fill="none" stroke="#5aa3ff" stroke-width="${f(w * .018)}" opacity=".35"/>`;
    s += `<g clip-path="url(#${gid}c)">${w2}<circle cx="${f(w / 2)}" cy="${f(h / 2)}" r="${f(w * .3)}" fill="#ffe08a" opacity=".2"/></g>` + emb(4, w * .22, h * .5 - w * .28, w * .56, true);
  }
  s += `<rect x="${f(bw / 2)}" y="${f(bw / 2)}" width="${f(w - bw)}" height="${f(h - bw)}" rx="${f(r)}" fill="none" stroke="${INK}" stroke-width="${f(bw)}"/><rect x="${f(w * .05)}" y="${f(w * .05)}" width="${f(w * .9)}" height="${f(h - w * .1)}" rx="${f(r * .7)}" fill="none" stroke="#d9b04a" stroke-width="${f(Math.max(1, w * .016))}" opacity=".8"/>`;
  const out = `${svgOpen(w, h, `0 0 ${w} ${h}`)}${s}</svg>`; if (!o.standalone) cached[k] = out; return out;
}
// the reminder card (a card of this diver is lying face up in front of them)
function reminderSVG(o) { o = o || {}; const w = o.w || 100, h = H(w); return `${svgOpen(w, h, `0 0 ${w} ${h}`)}<rect x="1.5" y="1.5" width="${w - 3}" height="${h - 3}" rx="${f(w * .085)}" fill="#d9e9f7" stroke="${INK}" stroke-width="2.4"/><path d="M${f(w * .2)} ${f(h * .3)}H${f(w * .8)}M${f(w * .2)} ${f(h * .42)}H${f(w * .8)}M${f(w * .2)} ${f(h * .54)}H${f(w * .6)}" stroke="#4d78b3" stroke-width="${f(w * .05)}" stroke-linecap="round"/></svg>`; }

// ---------- tokens ----------
function pingSVG(o) {
  o = o || {}; const sz = o.size || 64, k = o.k || '', spent = !!o.spent;
  const col = spent ? '#c4473d' : '#35c27b', dk = spent ? '#7d1f18' : '#13734a';
  let s = svgOpen(sz, sz, '0 0 100 100');
  if (KIT.ART.ping && !spent) s += artImg('ping', 4, 4, 92, 92); else s += `<circle cx="50" cy="50" r="44" fill="${col}" stroke="${INK}" stroke-width="5"/><circle cx="50" cy="50" r="32" fill="none" stroke="#fff" stroke-width="3.4" opacity=".6"/><circle cx="50" cy="50" r="19" fill="none" stroke="#fff" stroke-width="3.4" opacity=".6"/><circle cx="50" cy="50" r="6" fill="#fff"/>`;
  if (spent) s += `<path d="M30 30L70 70M70 30L30 70" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity=".9"/>`;
  if (k === 'high') s += `<path d="M50 14L66 36H34Z" fill="#fff" stroke="${INK}" stroke-width="3"/>`;
  if (k === 'low') s += `<path d="M50 86L66 64H34Z" fill="#fff" stroke="${INK}" stroke-width="3"/>`;
  if (k === 'only') s += `<circle cx="50" cy="50" r="10" fill="#fff" stroke="${INK}" stroke-width="3"/>`;
  return s + '</svg>';
}
function flareSVG(o) { o = o || {}; const sz = o.size || 64, on = !!o.on; return `${svgOpen(sz, sz, '0 0 100 100')}${KIT.ART.flare ? artImg('flare', 4, 4, 92, 92) : `<path d="M50 90C30 90 26 66 34 58L66 58C74 66 70 90 50 90Z" fill="${on ? '#ff6a3a' : '#c8d4e6'}" stroke="${INK}" stroke-width="4"/><rect x="45" y="22" width="10" height="40" rx="4" fill="${on ? '#ffd873' : '#9fb2cf'}" stroke="${INK}" stroke-width="3.4"/>`}${on ? `<path d="M50 6L56 20L50 16L44 20Z" fill="#fff0a8" stroke="${INK}" stroke-width="2.6"/><circle cx="50" cy="14" r="22" fill="#ff9c3a" opacity=".35"/>` : ''}</svg>`; }
function cmdSVG(o) { const sz = (o && o.size) || 40; return `${svgOpen(sz, sz, '0 0 100 100')}${KIT.ART.cmd ? artImg('cmd', 2, 2, 96, 96) : `<circle cx="50" cy="50" r="44" fill="#ffd873" stroke="${INK}" stroke-width="5"/><path d="M50 22L58 44H82L62 58L70 82L50 66L30 82L38 58L18 44H42Z" fill="#c98a10" stroke="${INK}" stroke-width="3.4" stroke-linejoin="round"/>`}</svg>`; }

// ---------- icons (24 x 24, stroke = currentColor) ----------
const ICONS = {
  tick: '<path d="M4 12.5L9.5 18L20 6" />', cross: '<path d="M5 5L19 19M19 5L5 19" />', ping: '<circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="10.5"/>',
  flare: '<path d="M9 21H15L16 11H8Z"/><path d="M12 11V3M8 5L12 3L16 5"/>', clock: '<circle cx="12" cy="13" r="8"/><path d="M12 8V13L15 15M9 2H15"/>', book: '<path d="M4 5C7 4 10 4 12 6C14 4 17 4 20 5V19C17 18 14 18 12 20C10 18 7 18 4 19ZM12 6V20"/>',
  people: '<circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20C3 16 6 14 9 14S15 16 15 20M15 14C18 14 21 15.5 21 19"/>', list: '<path d="M6 3H17A2 2 0 0 1 19 5V19A2 2 0 0 1 17 21H6ZM6 3V21M10 8H16M10 12H16M10 16H14"/>',
  menu: '<path d="M4 7H20M4 12H20M4 17H20"/>', help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5C9.5 7 14.5 7 14.5 9.5C14.5 11.5 12 11.5 12 14M12 17V17.5"/>', undo: '<path d="M4 9H14A6 6 0 0 1 14 21H8M4 9L8 5M4 9L8 13"/>',
  eye: '<path d="M2 12C5 6 19 6 22 12C19 18 5 18 2 12Z"/><circle cx="12" cy="12" r="3"/>', bulb: '<path d="M9 18H15M10 21H14M12 3A6 6 0 0 0 8 14C9 15 9 16 9 18H15C15 16 15 15 16 14A6 6 0 0 0 12 3Z"/>', star: '<path d="M12 3L14.6 9L21 9.6L16 14L17.6 20.5L12 17L6.4 20.5L8 14L3 9.6L9.4 9Z"/>',
  lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8A4 4 0 0 1 16 8V11"/>', sound: '<path d="M4 9H8L13 5V19L8 15H4ZM16 9C18 11 18 13 16 15"/>', wave: '<path d="M2 14C5 9 8 9 11 14S17 19 22 10"/>'
};
function iconSVG(name, size) { return `<svg class="ic" viewBox="0 0 24 24" width="${size || 22}" height="${size || 22}" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${ICONS[name] || ''}</svg>`; }

// ---------- divers: five original portraits + the drone ----------
const DIV = [
  { n: 'Nerea', helm: '#e2607f', skin: '#8a5a3c', hair: '#2a1a14', tone: '#f6c8d2' },
  { n: 'Bram', helm: '#3f82da', skin: '#efc8a0', hair: '#7a4a20', tone: '#cfe0f8' },
  { n: 'Sumi', helm: '#3fa86d', skin: '#f0c9a8', hair: '#10131c', tone: '#c9eed8' },
  { n: 'Dag', helm: '#f1b82e', skin: '#d39b6c', hair: '#c0782c', tone: '#fbe8b0' },
  { n: 'Lio', helm: '#9b6ae6', skin: '#5d3a28', hair: '#18110d', tone: '#e2d4f8' }
];
KIT.DIVERS = DIV;
function avatarSVG(i, o) {
  o = o || {}; const sz = o.size || 64, kk = key('a', i, sz, KIT.ART['diver' + i] ? 1 : 0); if (cached[kk]) return cached[kk];
  const a = DIV[i % 5]; let s = svgOpen(sz, sz, '0 0 100 100');
  if (KIT.ART['diver' + (i % 5)]) s += artImg('diver' + (i % 5), 0, 0, 100, 100);
  else s += `<circle cx="50" cy="50" r="48" fill="${a.tone}" stroke="${INK}" stroke-width="3"/><path d="M14 98C14 72 32 66 50 66S86 72 86 98Z" fill="${a.helm}" stroke="${INK}" stroke-width="3.4"/><ellipse cx="50" cy="44" rx="25" ry="27" fill="${a.skin}" stroke="${INK}" stroke-width="3.4"/><path d="M26 40C30 20 70 20 74 40C66 30 34 30 26 40Z" fill="${a.hair}"/><circle cx="41" cy="46" r="3.6" fill="${INK}"/><circle cx="59" cy="46" r="3.6" fill="${INK}"/><path d="M42 58Q50 64 58 58" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/><ellipse cx="50" cy="42" rx="33" ry="35" fill="#bfe8ff" opacity=".22" stroke="${a.helm}" stroke-width="5"/>`;
  return cached[kk] = s + '</svg>';
}
function droneSVG(o) {
  o = o || {}; const sz = o.size || 64, kk = key('d', sz, KIT.ART.drone ? 1 : 0); if (cached[kk]) return cached[kk]; let s = svgOpen(sz, sz, '0 0 100 100');
  if (KIT.ART.drone) s += artImg('drone', 0, 0, 100, 100);
  else s += `<circle cx="50" cy="50" r="48" fill="#cfe9f5" stroke="${INK}" stroke-width="3"/><ellipse cx="50" cy="56" rx="34" ry="26" fill="#f1b82e" stroke="${INK}" stroke-width="4"/><circle cx="50" cy="52" r="15" fill="#0e2146" stroke="${INK}" stroke-width="3.6"/><circle cx="50" cy="52" r="7" fill="#ffd873"/><circle cx="46" cy="48" r="2.6" fill="#fff"/><path d="M50 30V18M44 18H56" stroke="${INK}" stroke-width="4" stroke-linecap="round"/><path d="M20 62L10 70M80 62L90 70" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>`;
  return cached[kk] = s + '</svg>';
}
// ---------- job cards ----------
// short names for chips and for the table (full wording is in data.js)
const SHORT = D.tasks.map(t => t.s);
KIT.SHORT = SHORT;
function stateMark(st, sz) { return st > 0 ? `<g transform="translate(${sz - 20} 4)"><circle cx="10" cy="10" r="10" fill="#2fb36d" stroke="${INK}" stroke-width="2"/><path d="M5 10.5L8.8 14L15.5 6.5" fill="none" stroke="#fff" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/></g>` : st < 0 ? `<g transform="translate(${sz - 20} 4)"><circle cx="10" cy="10" r="10" fill="#d8453b" stroke="${INK}" stroke-width="2"/><path d="M6 6L14 14M14 6L6 14" stroke="#fff" stroke-width="2.8" stroke-linecap="round"/></g>` : ''; }
function diffDots(d, w, x0, y0) { let s = ''; for (let i = 0; i < d; i++) s += `<circle cx="${f(x0 + i * 9)}" cy="${f(y0)}" r="3.6" fill="#ffd873" stroke="${INK}" stroke-width="1.4"/>`; return s; }
// a job card as an SVG (used for the mini chips): face with the short name; w x h px
function jobMini(id, o) {
  o = o || {}; const w = o.w || 120, h = o.h || 44, st = o.st || 0, col = o.np ? o.np - 3 : 1; const d = D.tasks[id].d[col];
  const bar = st > 0 ? '#2fb36d' : st < 0 ? '#d8453b' : '#e0a31c';
  return `${svgOpen(w, h, `0 0 ${w} ${h}`)}<rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="7" fill="${st < 0 ? '#f6d9d4' : st > 0 ? '#dff3e4' : '#fbf3dd'}" stroke="${INK}" stroke-width="2"/><rect x="1" y="1" width="8" height="${h - 2}" rx="4" fill="${bar}"/>${stateMark(st, w)}</svg>`;
}
function jobBig(id, o) { return jobMini(id, o); }
Object.assign(KIT, { cardSVG, backSVG, reminderSVG, pingSVG, flareSVG, cmdSVG, iconSVG, avatarSVG, droneSVG, jobMini, stateMark, diffDots, H,
  setArt(m) { KIT.ART = m || {}; for (const k in cached) delete cached[k]; },
  dataURL: s => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(s),
  el: s => { const t = document.createElement('template'); t.innerHTML = s.trim(); return t.content.firstChild; } });
g.LDKit = KIT;
if (typeof module === 'object' && module.exports) module.exports = KIT;
})(typeof globalThis !== 'undefined' ? globalThis : this);
