// Emberclimb UI: DOM, board-first. Every picture is a NAMED SLOT (A(stem)) filled by media/<stem>.webp when present, else a placeholder.
(function () {
  var D = EC.D, E = EC.E, app = document.getElementById('app'), tscr = document.getElementById('tscr'), gameEl = document.getElementById('game');
  var Q = location.search;
  window.ANIM = !/anim=0/.test(Q); window.AIDELAY = 650;
  var UI = { sel: -1, pile: null, ov: null, busy: false, mode: 'title', pick: ['w'], moveLog: 0 };
  window.UI = UI;
  function h(tag, cls, txt, kids) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; (kids || []).forEach(function (k) { if (k) e.appendChild(k); }); return e; }
  function on(e, fn) { e.addEventListener('click', function (ev) { ev.stopPropagation(); fn(ev); }); return e; }
  // ---------- art slots: media/<stem>.webp (or .png) fills the slot when present; the placeholder shows otherwise
  var AS = window.ASSETS || { items: [] }, KIND = {}, PROBE = {};
  AS.items.forEach(function (it) { KIND[it.stem] = it; });
  function A(stem, label, o) {
    o = o || {}; var it = KIND[stem], kind = (it && it.kind) || o.kind || 'icon';
    var e = h('div', 'art k-' + kind + (o.cls ? ' ' + o.cls : '') + (o.noph ? ' noph' : '')); e.setAttribute('data-stem', stem);
    if (o.ph) e.style.setProperty('--ph', o.ph);
    e.appendChild(h('div', 'ph', label == null ? '' : label));
    if (PROBE[stem] === 1) { e.style.backgroundImage = 'url(media/' + stem + '.webp)'; e.classList.add('has'); }
    else if (PROBE[stem] === undefined && (window.MEDIA_PRESENT || []).indexOf(stem) >= 0) {
      PROBE[stem] = 0; var im = new Image();
      im.onload = function () { PROBE[stem] = 1; document.querySelectorAll('[data-stem="' + stem + '"]').forEach(function (n) { n.style.backgroundImage = 'url(media/' + stem + '.webp)'; n.classList.add('has'); }); };
      im.onerror = function () { PROBE[stem] = -1; };
      im.src = 'media/' + stem + '.webp';
    }
    return e;
  }
  window.EC_A = A;
  // owner art has landscape versions (<stem>-wide) for wide screens; phones keep the portrait picture
  function BG(stem) { var w = window.innerWidth > window.innerHeight * 1.1 && (window.MEDIA_PRESENT || []).indexOf(stem + '-wide') >= 0; return A(w ? stem + '-wide' : stem, '', { cls: 'bg', kind: 'bg' }); }
  // Addendum 7: three modes. Learn to play = the coached game (bubbles); Play = clean (default); Hints = top-bar toggle, off by default
  function learnOn() { try { return !!((window.GXT && GXT.active()) || (UI.coachOn && UI.coachOn())); } catch (e) { return false; } }
  try { UI.hints = localStorage.getItem('emberclimb.hints') === '1'; } catch (e) { UI.hints = false; }
  function modeCls() { var b = document.body; b.classList.toggle('hints-on', !!UI.hints); b.classList.toggle('learn', learnOn()); var hb = document.getElementById('hintsB'); if (hb) { hb.setAttribute('aria-pressed', String(!!UI.hints)); hb.setAttribute('aria-label', 'Hints: ' + (UI.hints ? 'on' : 'off')); hb.classList.toggle('on', !!UI.hints); } }
  UI.setHints = function (v) { UI.hints = !!v; try { localStorage.setItem('emberclimb.hints', UI.hints ? '1' : '0'); } catch (e) { } modeCls(); render(); };
  document.addEventListener('click', function (e) { var b = e.target && e.target.closest && e.target.closest('#hintsB'); if (b) { e.stopPropagation(); UI.setHints(!UI.hints); } }, true);
  // one-card Goal before turn 1 of a Play game (not in Learn to play or Story, which have their own intros)
  function goalCard(done) {
    var o = h('div', 'ec-goal'); o.setAttribute('role', 'dialog'); o.setAttribute('aria-label', 'Goal');
    var c = h('div', 'ec-goalc', null, [h('h2', '', 'Goal'), h('p', 'lead', 'Reach the top of the tower and defeat its guardian.'),
      h('ul', '', null, [h('li', '', 'Cards cost energy. Attacks cut HP. Block stops hits.'), h('li', '', 'Win fights to earn cards, gold and relics.'), h('li', '', 'If your HP hits 0, the climb ends.')])]);
    var b = on(h('button', 'btn', 'Climb'), function () { o.remove(); if (done) done(); }); b.id = 'goal-go'; c.appendChild(b); o.appendChild(c); document.body.appendChild(o);
  }
  UI.goalCard = goalCard;
  // the room's host (owner portraits): a face and one line of speech under the room title
  function host(stem, line) { var d = h('div', 'host'); d.appendChild(A(stem, '', { noph: 1, cls: 'hostpic', kind: 'portrait' })); d.appendChild(h('p', '', line)); return d; }
  var GLY = { atk: '⚔', def: '🛡', buf: '✦', deb: '☠', sleep: '💤', big: '⚔' };
  var TONE = { w: '#a8431f', s: '#2f7a46', a: '#2f6fa8', m: '#a8861c', n: '#777', z: '#555' };
  // ---------- helpers
  function G() { return E.G(); }
  // owner brief (8 Nov): a message stays at least 4 s + 1 s per 10 words, one at a time, and a tap closes it
  function readMs(t, ms) { var w = String(t || '').split(/\s+/).filter(Boolean).length; return Math.max(ms || 0, 4000 + 1000 * Math.ceil(w / 10)); }
  UI.readMs = readMs;
  function toast(t, ms, tries) { if (UI.mode === 'game' && !learnOn() && !UI.hints) return; var t0 = document.querySelector('.toast'); if (document.querySelector('.ec-say') || (t0 && Date.now() < (+t0.getAttribute('data-until') || 0))) { if ((tries || 0) < 30) setTimeout(function () { toast(t, ms, (tries || 0) + 1); }, 500); return; }   // wait for the coach bubble: one message at a time
    document.querySelectorAll('.toast').forEach(function (n) { n.remove(); }); var d = h('div', 'toast', t), dur = readMs(t, ms); d.style.animation = 'w4tin .2s ease-out'; setTimeout(function () { d.classList.add('w4tout'); }, Math.max(0, dur - 400)); d.setAttribute('data-until', String(Date.now() + dur)); document.body.appendChild(d); setTimeout(function () { d.remove(); }, dur); }
  function rectOf(w) { var e = document.querySelector('[data-w="' + w + '"]'); return e ? e.getBoundingClientRect() : null; }
  function popAt(w, txt, cls) {
    if (!window.ANIM) return; var r = rectOf(w); if (!r) return;
    var d = h('div', 'pop ' + cls, txt); d.style.left = (r.left + r.width / 2 - 14 + (Math.random() * 24 - 12)) + 'px'; d.style.top = (r.top + r.height * 0.35) + 'px';
    document.body.appendChild(d); setTimeout(function () { d.remove(); }, 950);
  }
  function fxAt(w, stem) { if (!window.ANIM) return; var r = rectOf(w); if (!r) return; var d = A(stem, '', { noph: 1, cls: 'fxs' }); d.style.cssText = 'position:fixed;z-index:68;pointer-events:none;width:' + Math.min(110, r.width) + 'px;height:' + Math.min(110, r.width) + 'px;left:' + (r.left + r.width / 2 - Math.min(110, r.width) / 2) + 'px;top:' + (r.top + r.height * .25) + 'px;animation:fxfade .6s forwards'; document.body.appendChild(d); setTimeout(function () { d.remove(); }, 650); }
  // W420 juice helpers: motion gate, flying numbers, hit-stop + stage quake, ember bursts, fanfare
  function moOk() { try { return !!window.ANIM && !(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches); } catch (e) { return !!window.ANIM; } }
  function numAt(w, n, kind, label) {
    if (!window.ANIM) return; var r = rectOf(w); if (!r) return; n = Math.max(0, n | 0);
    var d = h('div', 'w4num k-' + kind, null, [h('b', '', (kind === 'blk' || kind === 'heal' ? '+' : '-') + n)]); if (label) d.appendChild(h('i', '', label));
    d.style.setProperty('--fs', Math.round(Math.min(48, 20 + Math.sqrt(Math.max(1, n)) * 5)) + 'px'); d.style.top = (r.top + r.height * 0.28) + 'px'; d.style.left = '0px'; document.body.appendChild(d);
    var vw = document.documentElement.clientWidth, ww = d.offsetWidth, cx = Math.max(ww / 2 + 8, Math.min(vw - ww / 2 - 8, r.left + r.width / 2)); d.style.left = cx + 'px';
    if (moOk() && d.animate) {
      var room = Math.max(0, Math.min(cx - ww / 2 - 8, vw - 8 - cx - ww / 2)), dir = Math.random() < .5 ? -1 : 1, dx = dir * Math.min(room, 24 + Math.random() * 40);
      d.animate([{ transform: 'translate(-50%,0) scale(.4)', opacity: 0 }, { transform: 'translate(calc(-50% + ' + (dx * .3) + 'px),-44px) scale(1.25)', opacity: 1, offset: .2 }, { transform: 'translate(calc(-50% + ' + (dx * .75) + 'px),-66px) scale(1)', opacity: 1, offset: .65 }, { transform: 'translate(calc(-50% + ' + dx + 'px),-28px) scale(.9)', opacity: 0 }], { duration: 1150, easing: 'cubic-bezier(.2,.7,.4,1)', fill: 'forwards' });
    } else d.classList.add('still');
    setTimeout(function () { d.remove(); }, 1200);
  }
  function shakeEl(el, ms) { if (!el || !window.ANIM) return; setTimeout(function () { el.classList.add('shake'); setTimeout(function () { el.classList.remove('shake'); }, 360); }, ms || 0); }
  function bigHit(el) {
    if (!moOk()) return; if (el) el.classList.add('w4stop');
    setTimeout(function () { if (el) el.classList.remove('w4stop'); var st = document.getElementById('stage'); if (st) { st.classList.remove('w4quake'); void st.offsetWidth; st.classList.add('w4quake'); setTimeout(function () { st.classList.remove('w4quake'); }, 420); } }, 90);
  }
  function embers(n, big) {
    if (!moOk()) return; var wr = h('div', 'w4emb'), W = document.documentElement.clientWidth, H = window.innerHeight; document.body.appendChild(wr);
    for (var i = 0; i < n; i++) { var p = h('i'), sz = 4 + Math.random() * (big ? 9 : 6); p.style.left = (W / 2 + (Math.random() - .5) * W * .25) + 'px'; p.style.top = (H * .38) + 'px'; p.style.width = p.style.height = sz + 'px'; wr.appendChild(p); if (p.animate) p.animate([{ transform: 'translate(0,0) scale(1)', opacity: 1 }, { transform: 'translate(' + ((Math.random() - .5) * W * .8) + 'px,' + (-(Math.random() * H * .4) - 30) + 'px) scale(.2)', opacity: 0 }], { duration: 900 + Math.random() * 900, easing: 'cubic-bezier(.1,.8,.3,1)', fill: 'forwards' }); }
    setTimeout(function () { wr.remove(); }, 2000);
  }
  function fanfare(boss) {
    SFX('fanfare'); if (boss) SFX('boss'); if (!window.ANIM) return; var o = document.querySelector('.turnban'); if (o) o.remove();
    var d = h('div', 'turnban win' + (boss ? ' boss' : ''), null, [h('b', '', boss ? 'Guardian slain!' : 'Victory!')]); d.setAttribute('role', 'status'); document.body.appendChild(d);
    setTimeout(function () { if (d.parentNode) d.remove(); }, boss ? 1800 : 1200); embers(boss ? 70 : 34, boss);
  }
  function drain() {
    var g = G(); if (!g) return; var q = g.q; g.q = []; var bossF = !!(g.b ? g.b.kind === 'b' : UI.fs && UI.fs.kind === 'b');
    q.forEach(function (f) {
      var el = document.querySelector('[data-w="' + f.w + '"]');
      switch (f.k) {
        case 'dmg': var bg = f.x !== 'blocked' && f.x !== 'poison' && f.n >= 12; fxAt(f.w, f.x === 'poison' ? 'fx-poison-cloud' : 'fx-slash'); if (f.x === 'str') fxAt(f.w, 'fx-fire-burst'); SFX(f.x === 'blocked' ? 'block' : bg ? 'crit' : 'hit'); if (f.x === 'blocked') popAt(f.w, 'Blocked', 'dmg'); else numAt(f.w, f.n, f.x === 'poison' ? 'poison' : 'dmg', f.x === 'poison' ? 'poison' : (UI.lastName || '')); if (bg) bigHit(el); shakeEl(el, bg ? 95 : 0); break;
        case 'hitme': var bh = f.x !== 'blocked' && (f.n >= 12 || bossF); if (f.x === 'burn' || f.x === 'str') fxAt(f.w, 'fx-fire-burst'); SFX(f.x === 'blocked' ? 'block' : bh ? 'crit' : 'hurt'); if (f.x === 'blocked') popAt(f.w, 'Blocked', 'dmg'); else numAt(f.w, f.n, 'dmg', f.x === 'spikes' ? 'spikes' : f.x === 'burn' ? 'burn' : ''); if (f.x === 'spikes') { toast('Spikes! Attacking it cost you ' + f.n + ' HP'); try { UI.coachReact && UI.coachReact('poor', 'spikes'); } catch (e) { } } if (bh) bigHit(el); shakeEl(el, bh ? 95 : 0); break;
        case 'hp': break;
        case 'blk': SFX('block'); fxAt(f.w, 'fx-block-burst'); numAt(f.w, f.n, 'blk', 'Block'); break;
        case 'heal': SFX('heal'); fxAt(f.w, 'fx-heal-sparkle'); numAt(f.w, f.n, 'heal', 'HP'); break;
        case 'buff': if (f.x === 'str') fxAt(f.w, 'fx-fire-burst'); SFX('buff'); popAt(f.w, f.x === 'str' ? '+' + f.n + ' Strength' : f.x === 'spikes' ? 'Spikes ' + f.n : f.x === 'nrg' ? '+' + f.n + ' Energy' : 'Power!', 'buf'); break;
        case 'debuff': popAt(f.w, (f.x === 'poison' ? 'Poison' : f.x === 'vuln' ? 'Vulnerable' : 'Weak') + (f.n ? ' ' + f.n : ''), 'deb'); break;
        case 'die': if (window.ANIM) { var d = h('div', 'pop die', '🎲 ' + f.n); d.appendChild(A('die-' + f.n, '', { noph: 1, cls: 'dieart' })); d.style.left = '40%'; d.style.top = '36%'; document.body.appendChild(d); setTimeout(function () { d.remove(); }, 1000); } break;
        case 'act': if (f.x === 'atk' && el && window.ANIM) { el.classList.add('lunge'); setTimeout(function () { el.classList.remove('lunge'); }, 480); } break;
        case 'kill': popAt(f.w, 'Down!', 'dmg'); break;
        case 'relic': toast('Relic: ' + D.RELICS[f.x].name); break;
        case 'turn': if (+f.n > 0 && g.hs.length > 1) toast(D.H[g.hs[+f.w.slice(1)].k].name + ' acts'); break;
      }
    });
  }
  // ---------- card element
  // the one number that matters on a card (shown big on the picture): damage, block or poison
  function keyNum(e) {
    var o = e.ops || [], i, k;
    for (i = 0; i < o.length; i++) { k = o[i][0];
      if (k === 'dmg' || k === 'all' || k === 'dmgx') return ['a', '⚔' + o[i][1]];
      if (k === 'hit') return ['a', '⚔' + o[i][1] + '×' + o[i][2]];
      if (k === 'blk') return ['b', '🛡' + o[i][1]];
      if (k === 'poison' || k === 'poisonAll') return ['p', '☠' + o[i][1]];
      if (k === 'shiv') return ['a', '🗡×' + o[i][1]]; }
    return null;
  }
  // tap-hold on a hand card (about 0.45 s) shows the whole card big; the click that follows is swallowed
  // drag the real card (owner verdict 8 Nov): pick it up, legal foes glow, drop on a foe (or above the hand for a skill) to play; a tap still works
  function dragPlay(el, i) {
    var sx = 0, sy = 0, gh = null, on0 = false, hot = -1;
    function foes() { return [].slice.call(document.querySelectorAll('.en[data-w]')).filter(function (n) { return !n.classList.contains('dead'); }); }
    function under(x, y) { var t = -1; foes().forEach(function (n) { var r = n.getBoundingClientRect(); if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) t = +n.getAttribute('data-w').slice(1); }); return t; }
    function end() { document.body.classList.remove('ec-dragging'); var ar0 = document.getElementById('w485arrow'); if (ar0) ar0.remove(); document.removeEventListener('pointermove', mv, true); document.removeEventListener('pointerup', up, true); document.removeEventListener('pointercancel', cancel, true); if (gh) gh.remove(); gh = null; document.querySelectorAll('.en.w4drop,.en.glow').forEach(function (n) { n.classList.remove('w4drop'); }); }
    function mv(ev) {
      if (!on0) { if (Math.abs(ev.clientX - sx) + Math.abs(ev.clientY - sy) < 14) return; on0 = true; UI.dragging = 1; UI.sel = i; var g = G(), hh = g.hs[g.b.cur], tg = hh && hh.hand[i] && E.eff(hh.hand[i]).tgt; var r = { width: el.offsetWidth, height: el.offsetHeight }, cw1 = el.parentNode ? getComputedStyle(el.parentNode).getPropertyValue('--cw') : ''; gh = el.cloneNode(true); gh.classList.remove('sel'); gh.classList.add('w4ghost'); render(); document.body.classList.add('ec-dragging'); gh.style.cssText = (cw1 ? '--cw:' + cw1 + ';' : '') + 'position:fixed;z-index:95;pointer-events:none;width:' + r.width + 'px;height:' + r.height + 'px;left:0;top:0;transform:translate(' + (ev.clientX - r.width / 2) + 'px,' + (ev.clientY - r.height * .7) + 'px) rotate(-4deg) scale(1.08)'; document.body.appendChild(gh); if (tg) foes().forEach(function (n) { n.classList.add('glow'); }); }
      if (gh) { var w = parseFloat(gh.style.width), hgt = parseFloat(gh.style.height); gh.style.transform = 'translate(' + (ev.clientX - w / 2) + 'px,' + (ev.clientY - hgt * .7) + 'px) rotate(-4deg) scale(1.08)'; }
      if (STAGE() && gh) arrowTo(ev.clientX, ev.clientY, hot >= 0, gh);
      var t = under(ev.clientX, ev.clientY); if (t !== hot) { hot = t; foes().forEach(function (n) { n.classList.toggle('w4drop', +n.getAttribute('data-w').slice(1) === t); }); if (t >= 0) { try { navigator.vibrate && navigator.vibrate(10); } catch (e) { } } }
      ev.preventDefault();
    }
    function up(ev) {
      var was = on0; end(); if (!was) return; UI.dragging = 0; UI.peeked = Date.now(); var g = G(); if (!g || !g.b || g.b.ph !== 'p' || UI.busy) { render(); return; }
      var hh = g.hs[g.b.cur], c = hh.hand[i], tg = c && E.eff(c).tgt, t = under(ev.clientX, ev.clientY), hr = document.querySelector('.hand'), above = hr && ev.clientY < hr.getBoundingClientRect().top - 10;
      if (tg && t >= 0) { try { navigator.vibrate && navigator.vibrate(18); } catch (e) { } playIt(i, t); }
      else if (!tg && above) { try { navigator.vibrate && navigator.vibrate(18); } catch (e) { } playIt(i); }
      else { UI.sel = -1; render(); }
    }
    function cancel() { end(); UI.dragging = 0; UI.sel = -1; render(); }
    el.addEventListener('pointerdown', function (ev) { if (UI.busy || (window.GXT && GXT.active())) return; sx = ev.clientX; sy = ev.clientY; on0 = false; hot = -1; document.addEventListener('pointermove', mv, true); document.addEventListener('pointerup', up, true); document.addEventListener('pointercancel', cancel, true); });
    el.style.touchAction = 'none';
  }
  // W485 targeting arrow: a dashed curve with a head from the dragged card's top to the finger, gold over a legal foe
  function arrowTo(x, y, hit, gh) {
    var NS = 'http://www.w3.org/2000/svg', sv = document.getElementById('w485arrow');
    if (!sv) { sv = document.createElementNS(NS, 'svg'); sv.id = 'w485arrow'; sv.setAttribute('aria-hidden', 'true'); sv.innerHTML = '<defs><marker id="w485ah" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse"><path d="M0 0 10 5 0 10z" fill="currentColor"/></marker></defs><path class="w485ap" fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round" stroke-dasharray="2 12" marker-end="url(#w485ah)"/>'; document.body.appendChild(sv); }
    var hd = document.querySelector('.hand.fan'), r = hd ? hd.getBoundingClientRect() : { left: 0, width: innerWidth, top: innerHeight - 160 }, sx = r.left + r.width / 2, sy = r.top + 10;
    if (Math.abs(y - sy) < 40) { sv.style.display = 'none'; return; } sv.style.display = '';
    var cx = (sx + x) / 2 + (x - sx) * -.2, cy = Math.min(sy, y) - 60;
    sv.querySelector('.w485ap').setAttribute('d', 'M' + sx + ' ' + sy + ' Q' + cx + ' ' + cy + ' ' + x + ' ' + (y - 10)); sv.classList.toggle('hit', !!hit);
    if (gh) gh.style.opacity = '.55';
  }
  function holdPeek(el, c) {
    var t = 0, x0 = 0, y0 = 0;
    function stop() { if (t) { clearTimeout(t); t = 0; } }
    el.addEventListener('pointerdown', function (ev) { x0 = ev.clientX; y0 = ev.clientY; stop(); t = setTimeout(function () { t = 0; UI.peeked = Date.now(); var pk = h('div', 'peek'); pk.appendChild(cardEl(c)); var close = function (e2) { if (e2) { e2.stopPropagation(); } pk.remove(); }; pk.addEventListener('pointerdown', close); document.body.appendChild(pk); }, 450); });
    el.addEventListener('pointermove', function (ev) { if (Math.abs(ev.clientX - x0) + Math.abs(ev.clientY - y0) > 12) stop(); });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (n) { el.addEventListener(n, stop); });
    el.addEventListener('contextmenu', function (ev) { ev.preventDefault(); });
  }
  function cardEl(c, o) {
    o = o || {}; var e = E.eff(c), d = D.CARDS[c.id];
    var el = h('div', 'card t-' + e.type + (d.rar === 'r' ? ' rare' : d.rar === 'u' ? ' unc' : ''));
    var art = h('div', 'cart'), ca = A(c.id, '', { ph: TONE[d.hero] }), cph = ca.querySelector('.ph'); if (cph) { cph.textContent = ''; cph.appendChild(svgIc(({ A: 'atk', S: 'blk', P: 'str', X: 'unk' })[e.type] || 'unk')); } art.appendChild(ca);
    var ct = h('div', 'ct', e.name); art.appendChild(h('span', 'cty', ({ A: 'Attack', S: 'Skill', P: 'Power', X: 'Status' })[e.type] || ''));
    el.appendChild(ct); el.appendChild(art);
    if (e.cost !== -1 && e.fl.indexOf('u') < 0) el.appendChild(h('div', 'cx', e.cost === 'X' ? 'X' : String(e.cost)));
    var kk = keyNum(e); if (kk) el.appendChild(h('div', 'ck k-' + kk[0], kk[1]));
    var cb = h('div', 'cb'); E.lines(e).forEach(function (l) { cb.appendChild(h('span', 'cl', l)); }); el.appendChild(cb);
    // (the full-card gem/frame overlays are not drawn: they covered the card picture and its rule text)
    return el;
  }
  // ---------- screens
  function render() {
    var g = G(); app.innerHTML = ''; tscr.innerHTML = ''; modeCls();
    if (UI.mode === 'title' || !g) { gameEl.hidden = true; tscr.hidden = false; try { GX.close(); } catch (e) { } try { GXH.hide(); } catch (e) { } return title(); }
    tscr.hidden = true; gameEl.hidden = false;
    document.body.classList.toggle('ec-stage', g.scr === 'battle' && STAGE()); document.body.classList.toggle('ec-stagemap', g.scr === 'map' && STAGE());
    if (g.scr !== 'battle') { var tb0 = document.querySelector('.turnban'); if (tb0) tb0.remove(); }
    if (g.scr === 'map') mapScr(); else if (g.scr === 'battle') battle(); else if (g.scr === 'reward') reward();
    else if (g.scr === 'rest') rest(); else if (g.scr === 'shop') shop(); else if (g.scr === 'event') event(); else if (g.scr === 'over') over();
    if (UI.ov) overlay();
    dock(g);
    if (UI.lastScr !== g.scr) { if (g.scr === 'reward' || (g.scr === 'over' && g.won)) SFX('win'); else if (g.scr === 'over') SFX('lose'); UI.lastScr = g.scr; }
    if (UI.camp && UI.bossLine && g.scr === 'reward' && g.map[g.at] && g.map[g.at].t === 'b' && UI.bossPost !== g.at + ':' + g.floor && !(window.GXT && GXT.active())) { UI.bossPost = g.at + ':' + g.floor; UI.bossLine('post'); }
    tutEvt();
    try { document.body.classList.toggle('ec-free', !!(UI.tutFree && UI.tutFree())); } catch (e) { }
    if (!window.EC_NOSAVE) E.save(); drain(); try { if (window.GXMUS) GXMUS.sync(); } catch (e) { }
  }
  function tutEvt() {
    var g = G(); if (!g) return;
    try { if (window.GXT && GXT.active()) { var tk = g.rw && g.rw.took || {}; GXT.act({ type: 'event', w: 'scr', scr: g.scr, ph: g.b && g.b.ph, pots: (g.pots || []).filter(Boolean).length, relic: !!tk.relic, took0: !!tk.c0, shopSel: UI.shopSel == null ? -1 : UI.shopSel, bought: !!(g.shop && g.shop.items.some(function (x) { return x.sold; })), evres: !!(g.evn && g.evn.res) }); } } catch (e) { }
  }
  UI.render = render;
  setInterval(function () { try { var fr = !!(UI.tutFree && UI.tutFree()); document.body.classList.toggle('ec-free', fr); var eb = document.getElementById('end'); if (fr && eb && eb.disabled) eb.disabled = false; if (UI.mode !== 'title') tutEvt(); } catch (e) { } }, 200);   // guide free-play steps hide the bubble (the dock line instructs)
  function tutOk(a) { try { if (UI.tutFree && UI.tutFree()) return true; var ok = !(window.GXT && GXT.active()) || GXT.act(a); if (!ok) { toast('Do the glowing step first'); var dm = document.getElementById('dockmsg'); if (dm) dm.textContent = 'Do the glowing step first.'; } return ok; } catch (e) { return true; } }
  function muteBtn() { var b = on(h('button', 'chip tap', SND.on ? '🔊' : '🔇'), function () { SND.toggle(); toast(SND.on ? 'Sound on' : 'Sound off'); render(); }); b.setAttribute('aria-label', SND.on ? 'Sound on: tap to mute' : 'Sound off: tap to unmute'); b.id = 'mute'; return b; }
  function tutBtn(cls) { try { var first = !GXT.status('emberclimb').seen && !localStorage.getItem('emberclimb.save'); var w = h('div'); w.innerHTML = GXT.menuHTML({ game: 'emberclimb', first: first, cls: cls || 'btn alt', launch: function () { UI.ov = null; UI.tutStart(); } }); return w.firstChild; } catch (e) { return null; } }
  function title() {
    if (UI.sub === 'quick') return quick();
    var s = h('div'); s.id = 'title';
    s.appendChild(BG('bg-title'));
    s.appendChild(h('div', '', null, [h('h1', '', 'EMBERCLIMB'), h('p', 'sub', 'Climb the tower. Build your deck.')]));
    var first = false; try { first = !GXT.status('emberclimb').seen && !localStorage.getItem('emberclimb.save'); } catch (e) { }
    var main = h('div', 'tmain'), row = h('div', 'trow');
    var story = on(h('button', first ? 'btn alt' : 'btn primary', 'Story'), function () { try { GXC.open(); } catch (e) { UI.sub = 'quick'; render(); } }); story.id = 'story';
    if (first) { var tb = tutBtn('btn primary'); if (tb) main.appendChild(tb); row.appendChild(story); } else main.appendChild(story);
    row.appendChild(on(h('button', 'btn alt', 'Quick game'), function () { UI.sub = 'quick'; render(); }));
    row.appendChild(on(h('button', 'btn alt', 'How to play'), function () { GXH.rules(null); }));
    var sv = null; try { sv = localStorage.getItem('emberclimb.save'); } catch (e) { }
    if (sv) row.appendChild(on(h('button', 'btn alt', 'Continue'), function () { if (E.load()) { UI.mode = 'game'; render(); resume(); } }));
    row.appendChild(on(h('button', 'btn alt', 'Settings'), function () { GX.show('setd'); })); row.lastChild.id = 'settingsT';
    row.appendChild(muteBtn());
    main.appendChild(row); s.appendChild(main); tscr.appendChild(s);
  }
  // Story unlocks: Rogue, Automaton and Monk join the Quick game after Story chapters 2, 3 and 4 (campaign.json unlock ids hero-s / hero-a / hero-m); ?unlock=all opens everything
  var HNEED = { s: ['hero-s', 'Beat Story chapter 2 to unlock'], a: ['hero-a', 'Beat Story chapter 3 to unlock'], m: ['hero-m', 'Beat Story chapter 4 to unlock'] };
  function heroOpen(k) {
    if (!HNEED[k] || /unlock=all/.test(Q)) return true;
    try { if (!window.GXC || !GXC.data || !GXC.data()) return true; return GXC.unlocked().some(function (u) { return u.id === HNEED[k][0]; }); } catch (e) { return true; }
  }
  UI.heroOpen = heroOpen;
  // Story relic unlocks: these relics stay out of the random pool (rewards, shop, events) until their chapter is beaten (campaign.json unlock type 'relic'); ?unlock=all opens all
  var RLOCK = ['clover-dice', 'gold-tooth', 'smoking-censer', 'tin-flute', 'healing-moss', 'gale-cloak', 'whetstone-ring', 'phoenix-ash'];
  function lockedRelics() {
    if (/unlock=all/.test(Q)) return [];
    try { if (!window.GXC || !GXC.data || !GXC.data()) return []; var u = GXC.unlocked(); return RLOCK.filter(function (id) { return !u.some(function (x) { return x.type === 'relic' && x.id === id; }); }); } catch (e) { return []; }
  }
  UI.lockedRelics = lockedRelics;
  var ng0 = E.newGame; E.newGame = function (o) { E.lock(lockedRelics()); return ng0.call(E, o); };
  function quick() {
    var s = h('div', 'pick'); s.id = 'title';
    s.appendChild(BG('bg-title'));
    var t = h('div', '', null, [h('h1', '', 'EMBERCLIMB'), h('p', 'sub', 'Climb the tower. Build your deck.')]); s.appendChild(t);
    var hs = h('div', 'heroes');
    ['w', 's', 'a', 'm'].forEach(function (k) {
      var H = D.H[k], lk = !heroOpen(k), b = h('button', 'hero' + (UI.pick.indexOf(k) >= 0 ? ' sel' : '') + (lk ? ' locked' : ''), null, [A('hero-' + k, H.name.split(' ')[0], { ph: TONE[k] }), h('b', '', H.name.split(' ')[0]), h('i', '', lk ? '\uD83D\uDD12 Story' : H.role)]);
      b.setAttribute('data-hero', k);
      on(b, function () { if (lk) { toast(HNEED[k][1]); return; } if (!UI.duo) { UI.pick = [k]; } else { var i = UI.pick.indexOf(k); if (i >= 0) { if (UI.pick.length > 1) UI.pick.splice(i, 1); } else { UI.pick.push(k); if (UI.pick.length > 2) UI.pick.shift(); } } render(); });
      hs.appendChild(b);
    });
    var mid = h('div', '', null, [hs, h('div', 'refline', D.H[UI.pick[UI.pick.length - 1]].mech)]); mid.style.cssText = 'display:flex;flex-direction:column;gap:8px;align-items:center;width:100%';
    s.appendChild(mid);
    // climb length: one act (default), all three acts, or three acts + the final act (Ember Tyrant)
    var seg = h('div', 'seg'); seg.setAttribute('role', 'group'); seg.setAttribute('aria-label', 'Climb length'); UI.acts = UI.acts || 1;
    [[1, '1 act'], [3, '3 acts'], [4, '3 acts + finale']].forEach(function (o) { var b = on(h('button', UI.acts === o[0] ? 'on' : '', o[1]), function () { UI.acts = o[0]; render(); }); b.setAttribute('data-acts', o[0]); b.setAttribute('aria-pressed', String(UI.acts === o[0])); seg.appendChild(b); });
    mid.appendChild(seg);
    var row = h('div', 'row'); row.appendChild(on(h('button', 'btn alt', UI.duo ? '− Second hero' : '+ Second hero'), function () { UI.duo = !UI.duo; if (!UI.duo) UI.pick = [UI.pick[UI.pick.length - 1]]; render(); })); row.appendChild(on(h('button', 'btn alt', 'Back'), function () { UI.sub = ''; render(); })); var go = on(h('button', 'btn', UI.pick.length > 1 ? 'Climb together' : 'Climb'), function () { start(); }); go.id = 'play'; row.appendChild(go);
    var wrap = h('div', '', null, [h('div', 'refline', UI.duo ? 'Two heroes, shared map. Pass the screen. Tap to pick both.' : 'Tap a hero to pick them. Use + Second hero to play together.'), row]); wrap.style.cssText = 'display:flex;flex-direction:column;gap:10px;align-items:center';
    s.appendChild(wrap); tscr.appendChild(s);
  }
  UI.restart = function () { var g = G(); if (!g) return; var hs = g.hs.map(function (x) { return x.k; }), ga = g.acts || 1; E.clear(); E.newGame({ heroes: hs, acts: Math.min(3, ga), final: ga > 3 ? 1 : 0 }); UI.ov = null; UI.sel = -1; UI.mode = 'game'; render(); };
  UI.leave = function () { if (UI.camp) { UI.camp = null; window.EC_NOSAVE = 0; UI.mode = 'title'; UI.sub = ''; render(); try { GXC.open(); } catch (e) { } } else { UI.mode = 'title'; UI.sub = ''; render(); } };
  function start() { var a = UI.acts || 1; E.newGame({ heroes: UI.pick.slice(), acts: a > 3 ? 3 : a, final: a > 3 ? 1 : 0 }); UI.sub = ''; UI.mode = 'game'; UI.sel = -1; render(); if (!/[?&]scn=/.test(location.search)) goalCard(); }
  function resume() { var g = G(); if (g && g.scr === 'battle' && g.b.ph === 'e') enemyPhase(); }
  // hero HP + gold go in the shell bar (chips, not buttons); potions and the End turn button live in the dock
  function hud() {
    var g = G(), t = document.getElementById('hud'); t.innerHTML = '';
    g.hs.forEach(function (x) { t.appendChild(h('span', 'chip', '♥ ' + ((x.dead || x.hp <= 0 || (g.scr === 'over' && !g.won)) ? 0 : x.hp) + '/' + x.mhp)); });
    t.appendChild(h('span', 'chip', '● ' + g.gold));
    if ((g.acts || 1) > 1) t.appendChild(h('span', 'chip', 'Act ' + g.act + '/' + g.acts));
  }
  function potRow() {
    var g = G(), p = h('div', 'pots');
    for (var i = 0; i < g.pslots; i++) (function (i) {
      var id = g.pots[i];
      if (!id) { p.appendChild(h('span', 'pot', '')); return; }
      var b = h('button', 'pot full', null, [A('pot-' + id, D.POTIONS[id].name, { ph: '#5a8a5a' })]); b.setAttribute('aria-label', D.POTIONS[id].name); on(b, function () { usePot(i); }); p.appendChild(b);
    })(i);
    return p;
  }
  // dock: what to do now (one line) + End turn + potions
  function dock(g) {
    var m = document.getElementById('dockmsg'), a = document.getElementById('dockact'), t = document.getElementById('dockt'); m.textContent = ''; a.innerHTML = ''; a.parentNode.querySelectorAll('.pcinfo').forEach(function (n) { n.remove(); });
    var txt = '', ttl = 'Your move';
    if (g.scr === 'map') { txt = 'Pick a glowing room.'; ttl = 'Climb'; }
    else if (g.scr === 'battle') {
      var b = g.b, ch = g.hs[b.cur >= 0 ? b.cur : 0]; ttl = b.ph === 'p' ? 'Your turn' : 'Enemy turn';
      var anyOk = b.ph === 'p' && ch.hand.some(function (c) { return E.canPlay(ch, c) && (E.cost(ch, c) <= ch.en || E.eff(c).cost === 'X'); });
      if (b.ph !== 'p') txt = UI.cap || 'The enemy is acting. Tap to speed up.';
      else if (UI.sel >= 0 && needTarget()) txt = 'Now tap the glowing enemy to play ' + E.eff(ch.hand[UI.sel]).name + '.';
      else if (UI.sel >= 0) txt = 'Tap ' + E.eff(ch.hand[UI.sel]).name + ' again to play it.';
      else if (anyOk) txt = 'Tap a glowing card to pick it. You have ' + ch.en + ' energy.';
      else txt = 'No more cards you can play. Tap End turn.';
      if (b.ph === 'p' && UI.endBtn && window.innerWidth < 1024) a.appendChild(UI.endBtn);   // PC: End turn stays by the hand (R1)
    }
    else if (g.scr === 'reward') { txt = 'Pick a card to add, or skip.'; ttl = 'Reward'; }
    else if (g.scr === 'rest') { txt = 'Rest, or smith a card.'; ttl = 'Campfire'; }
    else if (g.scr === 'shop') { txt = 'Tap an item, then Buy.'; ttl = 'Shop'; }
    else if (g.scr === 'event') { txt = 'Choose one.'; ttl = 'Event'; }
    else if (g.scr === 'over') { txt = g.won ? 'You won this climb.' : 'This climb is over.'; ttl = 'Result'; }
    m.textContent = txt; t.textContent = ttl; var ap = document.getElementById('game'); if (ap) ap.classList.toggle('ec-over', g.scr === 'over');
    if (g.scr === 'map' && STAGE()) { var lg = h('div', 'w485leg'); 'm e r s t v'.split(' ').forEach(function (k) { lg.appendChild(h('span', 'w485lgi t-' + k, null, [nodeIc(k), document.createTextNode(k === 'v' ? 'Event' : NODEL[k])])); }); a.appendChild(lg); }
    if (g.scr !== 'over') a.appendChild(potRow());
    if (g.scr === 'battle' && g.relics && g.relics.length) { var pi = h('div', 'pcinfo', null, [h('b', '', 'Relics')]); g.relics.forEach(function (id) { pi.appendChild(h('div', 'rl', null, [A('relic-' + id, '✦', { ph: '#8a6a2a' }), h('span', '', null, [h('b', '', D.RELICS[id].name), document.createTextNode(D.RELICS[id].t)])])); }); a.parentNode.appendChild(pi); }
    // PC side panel: the deck you climb with, as small card pictures (R1 polish: fill the panel with something useful)
    if (g.scr === 'battle' && window.innerWidth >= 1024) { var hd = g.hs[g.b && g.b.cur >= 0 ? g.b.cur : 0], cnt = {}, ord = []; hd.deck.forEach(function (c) { if (!cnt[c.id]) { cnt[c.id] = 0; ord.push(c); } cnt[c.id]++; }); var dp = h('div', 'pcinfo pcdeck', null, [h('b', '', 'Your deck (' + hd.deck.length + ')')]), dg = h('div', 'pcdg'); ord.forEach(function (c) { var t = h('div', 'pcdc', null, [A(c.id, '', { cls: 'pcda', kind: 'card', noph: 1 }), h('span', '', D.CARDS[c.id].name + (cnt[c.id] > 1 ? ' x' + cnt[c.id] : ''))]); dg.appendChild(t); }); dp.appendChild(dg); a.parentNode.appendChild(dp); }
    UI.endBtn = null;
  }
  var NODEG = { m: '⚔', e: '💀', r: '🔥', s: '🛒', v: '?', t: '🎁', b: '👑' }, NODEN = { m: 'node-monster', e: 'node-elite', r: 'node-rest', s: 'node-shop', v: 'node-event', t: 'node-treasure', b: 'node-boss' };
  var NODEHINT = { m: function () { return 'fight: card'; }, e: function () { return 'high risk: relic'; }, r: function () { return 'heal ' + (3 * (D.SCALE || 3) + (E.has('healing-moss') ? 10 : 0)); }, s: function () { return 'shop ● ' + G().gold; }, v: function () { return 'event'; }, t: function () { return 'free relic'; }, b: function () { return 'boss'; } };   // W420
  function mapScr() {
    var g = G(); hud();
    var m = h('div'); m.id = 'map'; m.setAttribute('data-board', '1'); var SGM = STAGE(), mroot = m;
    if (SGM) { app.appendChild(relicBar(g)); var mi = h('div', 'w485mapin'); mi.style.height = Math.max(560, ((g.F || 9) + 2) * 86) + 'px'; m.appendChild(mi); m.appendChild(h('div', 'w485mapsp')); mroot = m; m = mi; }
    m.appendChild(BG('bg-map'));
    function pos(n) { return { x: (n.c + 0.5) / 4 * 100, y: 100 - (n.f - 0.5) / ((G().F || 9) + 1.5) * 100 }; }
    var NS = 'http://www.w3.org/2000/svg', svg = document.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', '0 0 100 100'); svg.setAttribute('preserveAspectRatio', 'none');
    g.map.forEach(function (n) { n.nx.forEach(function (k) { var a = pos(n), b = pos(g.map[k]), l = document.createElementNS(NS, 'line'); l.setAttribute('x1', a.x); l.setAttribute('y1', a.y); l.setAttribute('x2', b.x); l.setAttribute('y2', b.y); l.setAttribute('stroke', n.vis ? '#f2872b' : '#6b5040'); l.setAttribute('stroke-width', '2'); l.setAttribute('vector-effect', 'non-scaling-stroke'); l.setAttribute('stroke-dasharray', n.vis ? '' : '4 4'); svg.appendChild(l); }); });
    m.appendChild(svg);
    var rc = E.reachable();
    g.map.forEach(function (n) {
      var p = pos(n), ok = rc.indexOf(n.id) >= 0;
      var b = h('button', 'node t-' + n.t + (ok ? ' glow' : '') + (n.vis ? ' vis' : '') + (g.at === n.id ? ' here' : ''), null, [A(NODEN[n.t], NODEG[n.t], { ph: '#3a2a20' })]);
      if (SGM) { b.appendChild(nodeIc(n.t)); if (ok) b.appendChild(h('span', 'w485nl', NODEL[n.t])); }
      b.style.left = p.x + '%'; b.style.top = p.y + '%'; b.setAttribute('aria-label', D.NODES[n.t]); if (ok && NODEHINT[n.t]) b.appendChild(h('span', 'w4ntag' + (n.t === 'e' || n.t === 'b' ? ' hot' : ''), NODEHINT[n.t]()));   // W420 value hint
      if (ok) on(b, function () { var go = function () { E.performMove({ t: 'go', n: n.id }); UI.sel = -1; render(); if (G().scr === 'battle') beginBattleUI(); }; if (n.t === 'b' && UI.camp && UI.bossLine && !(window.GXT && GXT.active())) UI.bossLine('pre').then(go); else go(); });
      else b.disabled = true;
      m.appendChild(b);
    });
    var QI = (window.EC_STORY || {}).quick; if (QI && UI.hints && !UI.camp && g.at < 0 && !(window.GXT && GXT.active()) && UI.qIntro !== g.seed && UI.say) { UI.qIntro = g.seed; setTimeout(function () { UI.say(QI.intro[Math.abs(g.seed | 0) % QI.intro.length], 4200); }, 200); }
    app.appendChild(mroot);
    if (SGM) { var fy = null; g.map.forEach(function (n) { if (rc.indexOf(n.id) >= 0) { var y = pos(n).y; fy = fy == null ? y : Math.max(fy, y); } }); var sy = UI.mapY != null && UI.mapAt === g.at ? UI.mapY : (fy == null ? 1e6 : m.offsetHeight * fy / 100 - mroot.clientHeight * .7); mroot.scrollTop = sy; mroot.addEventListener('scroll', function () { UI.mapY = mroot.scrollTop; UI.mapAt = g.at; }); }
  }
  var NODEL = { m: 'Fight', e: 'Elite', r: 'Rest', s: 'Shop', v: 'Event', t: 'Chest', b: 'Boss' };
  var NODEI = { m: '<path d="M3 19 15 7l1.6 1.6L4.6 20.6zM14 4.5l5.5-1-1 5.5-2.2-1.1zM21 19 9 7 7.4 8.6l12 12zM10 4.5 4.5 3.5l1 5.5 2.2-1.1z"/>',
    e: '<path fill-rule="evenodd" d="M12 4c-4.6 0-7.5 2.8-7.5 6.6 0 2.4 1.3 3.7 2.1 4.6V18h2v2h2v-2h2.8v2h2v-2h2v-2.8c.8-.9 2.1-2.2 2.1-4.6C19.5 6.8 16.6 4 12 4zm-3 6.2a1.9 1.9 0 1 0 0 3.8 1.9 1.9 0 0 0 0-3.8zm6 0a1.9 1.9 0 1 0 0 3.8 1.9 1.9 0 0 0 0-3.8zM2 3l4 4-1.4.8zm20 0-4 4 1.4.8z"/>',
    r: '<path d="M12 2c1 4 7 6 7 12a7 7 0 0 1-14 0c0-3 1-5 3-7 0 2 1 3 2 3 0-3 1-6 2-8zM4 21h16v2H4z"/>',
    s: '<path fill-rule="evenodd" d="M6 8h12l1.5 13h-15zM9 8V7a3 3 0 0 1 6 0v1h-1.6V7a1.4 1.4 0 0 0-2.8 0v1z"/>',
    v: '<path d="M9 8c0-4 7-4 7 0 0 3-4 3-4 6h-2.2c0-4 4-4 4-6s-2.6-2-2.6 0zM10 17h3v3h-3z"/>',
    t: '<path fill-rule="evenodd" d="M3 10h18v10H3zm7.5 2v3h3v-3zM5 5h14l2 4H3z"/>',
    b: '<path d="M3 18 2 7l5.2 4L12 4l4.8 7L22 7l-1 11zM3 19.5h18V22H3z"/>' };
  function nodeIc(t) { var d = document.createElement('span'); d.className = 'w485ni'; d.innerHTML = '<svg viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor" aria-hidden="true">' + (NODEI[t] || NODEI.v) + '</svg>'; return d; }
  // ---------- battle
  // intent icons: one code-drawn picture per intent / debuff kind (named stems in assets.json so art can replace them); tap an intent to read it
  var ICO = {
    atk: '<path d="M4 20 16 8l1.5 1.5L5.5 21.5zM15 5l5-1-1 5-2-1z"/>', blk: '<path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z"/>',
    str: '<path d="M12 3l7 8h-4.5v10h-5V11H5z"/>', weak: '<path d="M12 21l-7-8h4.5V3h5v10H19z"/>',
    vuln: '<circle cx="12" cy="12" r="7" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M11 2h2v6h-2zM11 16h2v6h-2zM2 11h6v2H2zM16 11h6v2h-6z"/>',
    frail: '<path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-dasharray="3 2"/><path d="M12 5l-2 5 3 2-2 6" fill="none" stroke="currentColor" stroke-width="2"/>',
    poison: '<path d="M12 2c4 5 7 8 7 12a7 7 0 0 1-14 0c0-4 3-7 7-12z"/>', burn: '<path d="M12 2c1 4 7 6 7 13a7 7 0 0 1-14 0c0-3 1-5 3-7 0 2 1 3 2 3 0-3 1-6 2-9z"/>',
    slime: '<path d="M4 17c0-6 3-10 8-10s8 4 8 10c0 3-2 4-3 2-1 3-3 3-4 0-1 3-3 3-4 0-1 2-5 2-5-2z"/>',
    daze: '<path d="M12 12c0-2 3-2 3 0s-5 3-5-1c0-5 8-5 8 1 0 7-11 6-11-2" fill="none" stroke="currentColor" stroke-width="2.2"/>',
    sleep: '<path d="M4 6h8L4 14h8v2H3v-2l7-8H4zM14 13h6l-6 6h6v2h-8v-2l5-5h-3z"/>', unk: '<path d="M9 8c0-4 7-4 7 0 0 3-4 3-4 6h-2c0-4 4-4 4-6s-3-2-3 0zM10 17h3v3h-3z"/>'
  };
  function svgIc(k) { var d = document.createElement('span'); d.className = 'ico'; d.innerHTML = '<svg viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor" aria-hidden="true">' + (ICO[k] || ICO.unk) + '</svg>'; return d; }
  UI.svgIc = svgIc;
  // art slot with a code-drawn picture as its placeholder
  function IA(stem, k) { var e = A(stem, '', { ph: 'transparent' }); var ph = e.querySelector('.ph'); if (ph) { ph.textContent = ''; ph.appendChild(svgIc(k)); } return e; }
  var CARDK = { burn: 'burn', slimed: 'slime', dazed: 'daze' };
  function intentParts(e) {
    var it = e.intent, g = G(), P = []; if (!it) return [{ k: 'unk', s: 'intent-unknown', t: '?', say: 'Unknown: this enemy has not shown its next move.' }];
    if (it.sleep) return [{ k: 'sleep', s: 'intent-sleep', t: 'Asleep', cap: 'sleeps', say: 'Asleep: it does nothing for ' + e.asleep + ' more turn' + (e.asleep === 1 ? '' : 's') + ' unless you hurt it.' }];
    if (it.atk) {
      var h0 = g.hs[it.tg] || g.hs[0], d; try { d = E.previewHit(g.b.en.indexOf(e), g.hs.indexOf(h0)); } catch (x) { d = it.atk; } if (d == null || isNaN(d)) d = it.atk;
      var n = it.hits || 1, t = n > 1 ? d + 'x' + n : String(d); if (it.all) t += ' all'; if (g.hs.length > 1 && !it.all) t += ' → ' + D.H[h0.k].name.split(' ')[0];
      P.push({ k: 'atk', s: d * n >= 20 ? 'intent-attack-big' : 'intent-attack', t: 'Hits ' + t, cap: 'attacks for ' + (n > 1 ? d + ' x ' + n : d), say: 'Attack: hits ' + (n > 1 ? n + ' times for ' + d + ' each' : 'for ' + d) + ' damage (Block soaks it first).' });
    }
    if (it.blk) P.push({ k: 'blk', s: 'intent-defend', t: 'Block ' + it.blk, cap: 'raises ' + it.blk + ' Block', say: 'Block: it gains ' + it.blk + ' Block, so your attacks do less.' });
    if (it.str) P.push({ k: 'str', s: 'intent-buff', t: 'Strength +' + it.str, cap: 'grows stronger (+' + it.str + ')', say: 'Buff: it gains ' + it.str + ' Strength, so every later attack hits harder.' });
    if (it.weak) P.push({ k: 'weak', s: 'intent-weak', t: 'Weak ' + it.weak, cap: 'makes you Weak', say: 'Weak: each of your hits deals 3 less. One Weak is used up per attack (max 3).' });
    if (it.vuln) P.push({ k: 'vuln', s: 'intent-vuln', t: 'Vulnerable ' + it.vuln, cap: 'makes you Vulnerable', say: 'Vulnerable: you take double damage from a hit. One is used up per attack (max 3).' });
    if (it.frail) P.push({ k: 'frail', s: 'intent-frail', t: 'Frail ' + it.frail, cap: 'makes you Frail', say: 'Frail: your Block is 25% weaker for ' + it.frail + ' turns.' });
    if (it.poison) P.push({ k: 'poison', s: 'intent-poison', t: 'Poison ' + it.poison, cap: 'poisons you', say: 'Poison: lose 1 HP per poison at the end of the turn, ignoring Block. It stays.' });
    if (it.add) { var ck = CARDK[it.add[0]] || 'unk', cn = D.CARDS[it.add[0]] ? D.CARDS[it.add[0]].name : 'junk'; P.push({ k: ck, s: ck === 'unk' ? 'intent-debuff' : 'intent-' + ck, t: '+' + it.add[1] + ' ' + cn, cap: 'adds ' + it.add[1] + ' ' + cn + ' to your deck', say: 'Junk: adds ' + it.add[1] + ' ' + cn + ' to your discard pile. It clogs your deck.' }); }
    if (it.spikes) P.push({ k: 'blk', s: 'intent-defend', t: 'Spikes ' + it.spikes, cap: 'grows spikes (' + it.spikes + ')', say: 'Spikes: until its next move, every attack card you play on it hurts you for ' + it.spikes + '. Use skills or block that turn.' });
    if (!P.length) P.push({ k: 'unk', s: 'intent-unknown', t: '?', say: 'Unknown: it is up to something. Watch out.' });
    return P;
  }
  UI.intentParts = intentParts;
  function intentBox(e) {
    var P = intentParts(e), main = P[0].k, cls = main === 'atk' ? 'atk' : main === 'blk' ? 'def' : (main === 'str' || main === 'sleep' || main === 'unk') ? 'buf' : 'deb';
    var b = h('button', 'intent ' + cls); b.type = 'button'; b.setAttribute('aria-label', 'Enemy intent: ' + P.map(function (p) { return p.say; }).join(' '));
    if (main === 'atk') { try { var it = e.intent, g = G(), tg = it.all ? g.hs : [g.hs[it.tg] || g.hs[0]], d0 = E.previewHit(g.b.en.indexOf(e), g.hs.indexOf(tg[0])) * (it.hits || 1), hot = tg.some(function (t) { return t && !t.dead && d0 >= t.hp * .25; }); if (hot) b.classList.add('w4hot'); if (moOk()) b.classList.add(hot ? 'w4danger' : 'w4atk'); } catch (x) { } }   // W420 pulse
    var sg0 = STAGE(); P.forEach(function (p, k) { if (sg0 && k > 1) return; b.appendChild(IA(p.s, p.k)); if (p.t) b.appendChild(h('span', '', sg0 ? p.t.replace(/^Hits /, '').replace(/^(Block|Strength|Weak|Vulnerable|Frail|Poison|Spikes) \+?/, function (m, w) { return w === 'Strength' ? '+' : ''; }) : p.t)); });
    on(b, function () { UI.explain(P); });
    return b;
  }
  UI.explain = function (P) {
    var old = document.querySelector('.itip'); if (old) old.remove();
    var t = h('div', 'itip'); t.setAttribute('role', 'dialog'); t.appendChild(h('b', '', 'Enemy intent'));
    P.forEach(function (p) { var r = h('div', 'irow', null, [IA(p.s, p.k), h('span', '', p.say)]); t.appendChild(r); });
    t.appendChild(h('i', '', 'Tap to close'));
    t.addEventListener('click', function () { t.remove(); }); document.body.appendChild(t); setTimeout(function () { if (t.parentNode) t.remove(); }, 9000);
  };
  function stChips(o) {
    var w = h('div', 'stc'); [['str', 'Strength'], ['vuln', 'Vulnerable'], ['weak', 'Weak'], ['poison', 'Poison'], ['frail', 'Frail']].forEach(function (p) { if (o.st[p[0]]) w.appendChild(h('span', '', null, [A('st-' + p[0], '', { noph: 1 }), document.createTextNode(p[1] + ' ' + o.st[p[0]])])); });
    return w;
  }
  // W485 stage layout (phone): heroes left, foes right on one floor, fanned hand, orb / piles / End turn in the corners. ?stage=0 = the old layout
  function STAGE() { return !/[?&]stage=0/.test(Q) && window.innerWidth < 1024; }
  UI.STAGE = STAGE;
  function relicBar(g) {
    var r = h('div', 'w485top');
    var rl = h('div', 'w485rel'); (g.relics || []).forEach(function (id) { var R = D.RELICS[id]; if (!R) return; var b = h('button', 'w485r', null, [A('relic-' + id, '✦', { ph: '#8a6a2a' })]); b.type = 'button'; b.setAttribute('aria-label', R.name + ': ' + R.t); on(b, function () { UI.explain([{ k: 'str', s: 'relic-' + id, say: R.name + ': ' + R.t }]); }); rl.appendChild(b); });
    if (!(g.relics || []).length) rl.appendChild(h('span', 'w485none', 'No relics yet'));
    r.appendChild(rl);
    r.appendChild(h('span', 'w485fl', (g.acts > 1 ? 'Act ' + g.act + ' · ' : '') + 'Floor ' + Math.max(1, g.floor || 0) + '/' + ((g.F || 9) + 1)));
    if (g.scr === 'battle') r.appendChild(potRow());
    return r;
  }
  // stage hero: the figure on the floor, HP bar under it, block as a shield badge, statuses and powers under the bar
  function heroFig(g, b, hh, i, PV) {
    var H = D.H[hh.k], p = h('div', 'hfig' + (b.cur === i && b.ph === 'p' ? ' act' : '') + (hh.dead ? ' dead' : '')); p.setAttribute('data-w', 'h' + i);
    var fg = h('div', 'w485fig'); fg.appendChild(A('hero-' + hh.k, H.name.split(' ')[0], { ph: TONE[hh.k] })); p.appendChild(fg);
    if (hh.stance !== 'n') p.appendChild(h('div', 'w485stance s-' + hh.stance, hh.stance === 'w' ? 'Wrath' : 'Calm'));
    if (hh.k === 'a' && hh.orbs.length) { var ob = h('div', 'orbs'); hh.orbs.forEach(function (o) { var ox = h('div', 'orb ' + o.k, o.k === 'D' ? String(o.v) : ''); ox.appendChild(A('orb-' + o.k, '', { noph: 1, cls: 'orbart' })); ob.appendChild(ox); }); p.appendChild(ob); }
    var bar = h('div', 'bar', null, [h('i'), h('b', '', hh.hp + '/' + hh.mhp)]); bar.querySelector('i').style.width = (100 * Math.max(0, hh.hp) / hh.mhp) + '%';
    if (hh.blk) bar.appendChild(h('span', 'w485shield', String(hh.blk)));
    p.appendChild(h('div', 'nm', H.name.split(' ')[0])); p.appendChild(bar); p.appendChild(stChips(hh));
    var pw = Object.keys(hh.pw); if (pw.length) p.appendChild(h('div', 'stc', null, pw.map(function (k) { return h('span', '', k + ' ' + hh.pw[k]); })));
    var inc = incoming(g, i); if (inc > 0 && !hh.dead) { var net = Math.max(0, inc - hh.blk); p.appendChild(h('div', 'w4inc' + (net > 0 ? ' cut' : ''), net > 0 ? 'Incoming ' + net : 'All blocked')); }
    if (PV && (PV.blk[i] > 0 || PV.heal[i] > 0)) p.appendChild(h('div', 'w4hb', PV.blk[i] > 0 ? '+' + PV.blk[i] + ' block' : '+' + PV.heal[i] + ' HP'));
    return p;
  }
  function needTarget() { var g = G(), h0 = g.hs[g.b.cur], c = h0.hand[UI.sel]; return c && E.eff(c).tgt; }
  function battle() {
    var g = G(), b = g.b, cur = g.hs[b.cur >= 0 ? b.cur : 0];
    hud();
    var st = h('div'); st.id = 'stage'; st.setAttribute('data-board', '1'); st.appendChild(A(b.kind === 'b' ? 'bg-boss-' + g.boss : b.kind === 'e' ? 'bg-elite' : 'bg-battle-' + (1 + ((g.floor - 1) % 3)), '', { cls: 'bg', kind: 'bg' }));
    var SG = STAGE(); if (SG) st.appendChild(relicBar(g));
    var en = h('div', 'enemies'), tgtMode = b.ph === 'p' && UI.sel >= 0 && needTarget(), PV = previewSel(g, b);
    var fk = g.act + ':' + g.floor + ':' + g.at; if (!UI.fs || UI.fs.key !== fk) UI.fs = { key: fk, kind: b.kind, hp0: g.hs.reduce(function (a, x) { return a + x.hp; }, 0), mhp: g.hs.reduce(function (a, x) { return a + x.mhp; }, 0), waste: 0, turns: 1, over: 0 }; UI.fs.turns = Math.max(UI.fs.turns, b.turn || 1);
    b.en.forEach(function (e, i) {
      var d = D.ENEMIES[e.id];
      var x = h('div', 'en' + (e.dead ? ' dead' : '') + (tgtMode && !e.dead ? ' glow' : ''));
      x.setAttribute('data-w', 'e' + i);
      if (!e.dead) x.appendChild(intentBox(e));
      x.appendChild(A('enemy-' + (d.img || e.id), d.name, { ph: '#6a3a2a' })); if (e.spk) x.appendChild(h('div', 'spkchip', 'Spikes ' + e.spk));
      if (b.ph === 'e' && UI.actor === i) x.classList.add('acting');
      if (e.blk) x.appendChild(h('div', 'blkchip', '🛡' + e.blk));
      x.appendChild(h('div', 'nm', d.name));
      x.appendChild(h('div', 'bar', null, [h('i'), h('b', '', e.hp + '/' + e.mhp)])); x.querySelector('.bar i').style.width = (100 * e.hp / e.mhp) + '%';
      if (SG && e.blk) x.querySelector('.bar').appendChild(h('span', 'w485shield', String(e.blk)));
      x.appendChild(stChips(e));
      if (!e.dead) on(x, function () { onEnemy(i); });   // tap the enemy to play the lifted attack on it (restored: lost in the W420 rewrite; tools/tap-enemy.js guards it)
      var pv = PV && PV.en[i]; if (pv && !e.dead && (pv.dmg > 0 || pv.kill)) x.appendChild(h('div', 'w4pv' + (pv.kill ? ' kill' : ''), null, [h('b', '', (PV.rnd ? '~' : '') + '-' + (pv.kill ? pv.dmg : pv.hpLoss)), h('i', '', pv.kill ? 'kills' : pv.stripped ? pv.stripped + ' block off' : (whyMods(cur, cur.hand[UI.sel], e) || 'HP'))]));   // W420 value preview
      en.appendChild(x);
    });
    if (SG) en.style.setProperty('--n', b.en.length);
    var mid = h('div', 'mid');
    if (SG) { var ar = h('div', 'arena'), hsd = h('div', 'hside'); hsd.style.setProperty('--n', g.hs.length); ar.appendChild(hsd); ar.appendChild(en); st.appendChild(ar); mid = hsd; } else st.appendChild(en);
    g.hs.forEach(function (hh, i) {
      if (SG) { mid.appendChild(heroFig(g, b, hh, i, PV)); return; }
      var H = D.H[hh.k], p = h('div', 'heropan' + (b.cur === i && b.ph === 'p' ? ' act' : '') + (hh.dead ? ' dead' : ''));
      p.setAttribute('data-w', 'h' + i);
      p.appendChild(A('hero-' + hh.k, H.name.split(' ')[0], { ph: TONE[hh.k] }));
      var inf = h('div', 'inf'); var nmr = h('div', 'nm', H.name.split(' ')[0] + (hh.stance !== 'n' ? '  ' + (hh.stance === 'w' ? 'Wrath' : 'Calm') : '')); if (hh.blk) nmr.appendChild(h('span', 'w4blk', '🛡 ' + hh.blk + ' Block')); if (hh.stance !== 'n') nmr.appendChild(A('stance-' + hh.stance, '', { noph: 1, cls: 'stanceart' })); inf.appendChild(nmr);
      inf.appendChild(h('div', 'bar', null, [h('i'), h('b', '', hh.hp + '/' + hh.mhp)])); inf.querySelector('.bar i').style.width = (100 * hh.hp / hh.mhp) + '%';
      inf.appendChild(stChips(hh));
      var inc = incoming(g, i); if (inc > 0 && !hh.dead) { var net = Math.max(0, inc - hh.blk); inf.appendChild(h('div', 'w4inc' + (net > 0 ? ' cut' : ''), net > 0 ? 'Incoming ' + net : 'Incoming ' + inc + ', blocked')); }
      if (PV && (PV.blk[i] > 0 || PV.heal[i] > 0)) p.appendChild(h('div', 'w4hb', PV.blk[i] > 0 ? '+' + PV.blk[i] + ' block' : '+' + PV.heal[i] + ' HP'));   // W420
      if (hh.k === 'a') { var ob = h('div', 'orbs'); hh.orbs.forEach(function (o) { var ox = h('div', 'orb ' + o.k, o.k === 'D' ? String(o.v) : ''); ox.appendChild(A('orb-' + o.k, '', { noph: 1, cls: 'orbart' })); ob.appendChild(ox); }); inf.appendChild(ob); }
      var pw = Object.keys(hh.pw); if (pw.length) inf.appendChild(h('div', 'stc', null, pw.map(function (k) { return h('span', '', k + ' ' + hh.pw[k]); })));
      p.appendChild(inf); mid.appendChild(p);
    });
    var emax = Math.max(cur.en, 3 + (E.has('dawnstone') ? 1 : 0) + ((cur.pw && cur.pw.deva) || 0));
    var en0 = h('div', 'energy', null, [A('icon-energy', '', { noph: 1 }), h('span', '', String(b.ph === 'p' ? cur.en : 0) + (SG ? '/' + emax : '')), h('em', 'enl', 'Energy')]); en0.setAttribute('aria-label', 'Energy ' + (b.ph === 'p' ? cur.en : 0) + ' of ' + emax);
    if (SG) st.appendChild(en0); else { mid.appendChild(en0); st.appendChild(mid); }
    // controls row (piles left, end turn right), then the hand
    var anyOk0 = (b.ph === 'p' ? cur.hand : []).some(function (c) { return E.canPlay(cur, c) && (E.cost(cur, c) <= cur.en || E.eff(c).cost === 'X'); });
    var ctl = h('div', 'ctl');
    if (SG) {
      var pile = function (id, cls, n, lab, ov) { var pb = on(h('button', 'w485pile ' + cls, null, [h('i', 'w485pc'), h('b', '', String(n))]), function () { if (Date.now() < (UI.dealT || 0) || b.ph !== 'p') return; UI.ov = ov; render(); }); pb.id = id; pb.type = 'button'; pb.setAttribute('aria-label', lab + ': ' + n + ' cards'); return pb; };
      st.appendChild(pile('drawpile', 'draw', cur.draw.length, 'Draw pile', 'draw')); st.appendChild(pile('discpile', 'disc', cur.disc.length, 'Discard pile', 'disc'));
      if (b.ph === 'p') { var ebs = on(h('button', 'btn w485end' + (anyOk0 ? '' : ' pulse'), 'End turn'), endTurn); ebs.id = 'end'; ebs.type = 'button'; try { if (window.GXT && GXT.active() && !UI.tutFree()) ebs.disabled = true; } catch (e) { } st.appendChild(ebs); }
      else st.appendChild(h('div', 'w485end w485wait', 'Enemy turn'));
    } else if (b.ph === 'p') {
      ctl.appendChild(h('div', 'piles', null, [(function (dc) { dc.id = 'drawpile'; return dc; })(on(h('button', 'chip', 'Draw ' + cur.draw.length), function () { if (Date.now() < (UI.dealT || 0)) return; UI.ov = 'draw'; render(); })), on(h('button', 'chip', 'Used ' + cur.disc.length), function () { if (Date.now() < (UI.dealT || 0)) return; UI.ov = 'disc'; render(); }), h('span', 'chip', 'Turn ' + b.turn)]));
      var eb = on(h('button', 'btn' + (anyOk0 ? '' : ' pulse'), 'End turn'), endTurn); eb.id = 'end'; UI.endBtn = eb; if (window.innerWidth >= 1024) { eb.classList.add('w4endpc'); ctl.appendChild(eb); } try { if (window.GXT && GXT.active() && !UI.tutFree()) eb.disabled = true; } catch (e) { }
    }
    st.appendChild(ctl);
    var hand = h('div', 'hand'), hc = b.ph === 'p' ? cur.hand : []; var nn = hc.length;
    if (SG) { hand.classList.add('fan'); var cw0 = Math.max(64, Math.min(112, Math.floor((document.documentElement.clientWidth - 16) / (1 + .7 * Math.max(0, nn - 1))))); hand.style.setProperty('--cw', cw0 + 'px'); st.style.setProperty('--hh', Math.round(Math.min(112, Math.floor((document.documentElement.clientWidth - 16) / 3.8)) * 1.5 + 26) + 'px'); } else if (nn > 5) { hand.classList.add('dense'); hand.style.setProperty('--cw', 'min(var(--hw),' + Math.floor((document.documentElement.clientWidth - 12) / (1 + .82 * (nn - 1))) + 'px)'); }
    hc.forEach(function (c, i) {
      var ok = E.canPlay(cur, c) && (E.cost(cur, c) <= cur.en || E.eff(c).cost === 'X'), el = cardEl(c); el.classList.add(ok ? 'ok' : 'no'); if (UI.sel === i) el.classList.add('sel');
      if (SG) { var off = i - (nn - 1) / 2; el.style.setProperty('--rot', (off * (nn > 6 ? 3.5 : 5)) + 'deg'); el.style.setProperty('--dy', Math.min(22, off * off * (nn > 6 ? 2 : 4)) + 'px'); el.style.zIndex = 10 + i; }
      el.setAttribute('data-c', i); holdPeek(el, c); if (ok) dragPlay(el, i); on(el, function () { if (UI.peeked && Date.now() - UI.peeked < 700) return; onCard(i); }); hand.appendChild(el);
    });
    if (UI.sel >= 0) hand.classList.add('hassel');
    st.appendChild(hand);
    if (b.ph === 'p' && cur.mir > 0) { var mb = on(h('button', 'chip mir', 'Miracle x' + cur.mir + ': +1 energy'), function () { if (UI.busy) return; E.performMove({ t: 'mir' }); render(); }); mb.id = 'mir'; ctl.appendChild(mb); }
    if (b.ph === 'p' && b.scry) {   // Scry: see the top cards of your draw pile, tap the ones to discard, then Done
      var sh = g.hs[b.scry.h], top = sh.draw.slice(-b.scry.n).reverse(); UI.scryOut = UI.scryOut || {};
      var so = h('div', 'ov scry'); so.appendChild(h('h2', '', 'Scry: tap cards to discard'));
      var sg = h('div', 'grid'); top.forEach(function (c, k) { var ce = cardEl(c); if (UI.scryOut[k]) ce.classList.add('no'); on(ce, function () { UI.scryOut[k] = !UI.scryOut[k]; render(); }); sg.appendChild(ce); }); so.appendChild(sg);
      var sd = on(h('button', 'btn', 'Done'), function () { var keep = []; top.forEach(function (c, k) { if (!UI.scryOut[k]) keep.push(k); }); UI.scryOut = {}; E.performMove({ t: 'scry', keep: keep }); render(); }); sd.id = 'scry-done'; so.appendChild(sd);
      st.appendChild(so);
    }
    app.appendChild(st);
    var dk = b.turn + ':' + b.cur; if (b.ph === 'p' && UI.drawKey !== dk && !b.scry) { UI.drawKey = dk; dealIn(hand); }   // W420 draw animation
    if (PV && sl0()) { var bt = [], rr0 = sl0().getBoundingClientRect(), vw0 = document.documentElement.clientWidth; g.hs.forEach(function (x, k) { if (PV.blk[k] > 0) bt.push('+' + PV.blk[k] + ' block' + (g.hs.length > 1 ? ' ' + D.H[x.k].name.split(' ')[0] : '')); if (PV.heal[k] > 0) bt.push('+' + PV.heal[k] + ' HP'); });
      if (bt.length) { var fb = h('div', 'w4hbf', bt.join(', ')); st.appendChild(fb); var fw = fb.offsetWidth, rx = rr0.right + 8; if (rx + fw > vw0 - 8) rx = Math.max(8, rr0.left - 8 - fw); fb.style.left = rx + 'px'; fb.style.top = Math.max(8, rr0.top + 10) + 'px'; } }   // W420 block preview beside the lifted card
    function sl0() { return hand.querySelector('.card.sel'); }
    var sl = hand.querySelector('.card.sel'); if (sl) { var rr = sl.getBoundingClientRect(), vw = document.documentElement.clientWidth; if (rr.left < 4) sl.style.setProperty('--sx', (4 - rr.left) + 'px'); else if (rr.right > vw - 4) sl.style.setProperty('--sx', (vw - 4 - rr.right) + 'px'); }
  }
  // W420: value preview of the selected card (dry run in the engine on a copy), incoming damage per hero, why-text, draw animation
  function playable(h0, c) { return c && E.canPlay(h0, c) && (E.eff(c).cost === 'X' || E.cost(h0, c) <= h0.en); }
  function previewSel(g, b) {
    if (b.ph !== 'p' || UI.sel < 0 || UI.busy || !E.previewPlay) return null; var cur = g.hs[b.cur], c = cur && cur.hand[UI.sel]; if (!playable(cur, c)) return null;
    var e = E.eff(c), out = { en: [], blk: [], heal: [], rnd: false }, take = function (p) { if (!p) return; out.blk = p.blk; out.heal = p.heal; out.rnd = p.rnd; };
    try {
      if (e.tgt) b.en.forEach(function (en, i) { if (en.dead) return; var p = E.previewPlay(b.cur, UI.sel, i); if (p) { out.en[i] = p.en[i]; take(p); } });
      else { var p = E.previewPlay(b.cur, UI.sel); if (p) { out.en = p.en; take(p); } }
    } catch (x) { return null; }
    return out;
  }
  function incoming(g, hi) {
    var t = 0; if (!g.b) return 0;
    g.b.en.forEach(function (e, ei) { var it = e.intent; if (e.dead || !it || !it.atk || it.sleep) return; var tgi = g.hs[it.tg] ? it.tg : 0; if (!it.all && tgi !== hi) return; var d = 0; try { d = E.previewHit(ei, hi); } catch (x) { d = it.atk; } t += (d || 0) * (it.hits || 1); });
    return t;
  }
  function whyMods(h0, c, tg) {
    var e = c && E.eff(c), s = [], str = (h0.st && h0.st.str) || 0, wk = h0.st && h0.st.weak > 0, vu = tg && tg.st && tg.st.vuln > 0, SC = D.SCALE || 3;
    if (!e || e.type !== 'A') return '';
    if (str) s.push((str > 0 ? '+' : '') + str + ' Str'); if (h0.stance === 'w') s.push('Wrath +' + SC);
    if (wk && !vu) s.push('Weak -' + SC); if (vu && !wk) s.push('x2 Vuln');
    return s.join(', ');
  }
  function whyOf(h0, c, tg) { var m = whyMods(h0, c, tg); return E.eff(c).name + (m ? ' ' + m.replace('x2 Vuln', 'x2 Vulnerable') : ''); }
  function dealIn(hand) {
    var cs = hand.querySelectorAll('.card'); if (!cs.length) return; SFX('draw'); if (!moOk()) return; UI.dealT = Date.now() + 360 + cs.length * 70 + 80;   // cards fly from the Draw chip: a tap there opens no pile meanwhile
    var dp = document.getElementById('drawpile'), pr = dp && dp.getBoundingClientRect();
    [].forEach.call(cs, function (c, i) {
      if (!c.animate) return; var r = c.getBoundingClientRect(), dx = pr ? pr.left + pr.width / 2 - (r.left + r.width / 2) : -160, dy = pr ? pr.top + pr.height / 2 - (r.top + r.height / 2) : 0;
      c.animate([{ transform: 'translate(' + dx + 'px,' + dy + 'px) scale(.3) rotate(-14deg)', opacity: 0, offset: 0 }], { duration: 360, delay: i * 70, easing: 'cubic-bezier(.2,.8,.3,1.15)', fill: 'backwards' });
    });
  }
  function bossOf(b) { var x = b && b.en.filter(function (e) { return D.ENEMIES[e.id] && D.ENEMIES[e.id].boss; })[0]; return x ? x.id : null; }
  function beginBattleUI() { UI.sel = -1; render(); var g = G(), bid = g && g.b && g.b.kind === 'b' && bossOf(g.b); if (bid && UI.bossIntro) UI.bossIntro(bid, function () { }); }   // no 'Your turn' flash: the dock line says whose turn it is and stays
  // W420 boss intro: video (when media/boss-<id>.mp4 is listed in window.MEDIA_VIDEO) or a zooming still, name + act line, Skip; ends on video end or after 6 s
  UI.bossIntro = function (bossId, done) {
    done = done || function () { };
    try { if ((window.GXT && GXT.active()) || (/[?&]scn=/.test(location.search) && !/[?&]scn=bossintro(&|$)/.test(location.search))) return done(); } catch (e) { }
    var d = D.ENEMIES[bossId]; if (!d) return done();
    var g = G(), vids = window.MEDIA_VIDEO || [], ov = h('div', 'w4boss'), fin = false, tmr = 0; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-label', d.name + ' intro');
    function end() { if (fin) return; fin = true; clearTimeout(tmr); if (moOk()) { ov.classList.add('out'); setTimeout(function () { ov.remove(); }, 250); } else ov.remove(); done(); }
    if (vids.indexOf('boss-' + bossId) >= 0) {
      var v = document.createElement('video'); v.muted = true; v.setAttribute('muted', ''); v.playsInline = true; v.setAttribute('playsinline', ''); v.autoplay = true; v.setAttribute('autoplay', ''); v.className = 'w4bv'; v.src = 'media/boss-' + bossId + '.mp4';
      v.addEventListener('ended', end); ov.appendChild(v); try { var pp = v.play(); if (pp && pp.catch) pp.catch(function () { }); } catch (e) { }
    } else ov.appendChild(A('enemy-' + (d.img || bossId), '', { ph: '#3a160c', cls: 'w4bimg' + (moOk() ? ' zoom' : ''), kind: 'bg' }));
    ov.appendChild(h('div', 'w4bt', null, [h('h1', '', d.name), h('p', '', 'Act ' + ((g && g.act) || 1) + ' guardian')]));
    var sk = on(h('button', 'btn primary', 'Skip'), end); sk.id = 'boss-skip'; ov.appendChild(sk);
    document.body.appendChild(ov); SFX('boss'); tmr = setTimeout(end, 6000);
  };
  function flyCard(ci, ti, done) {
    if (STAGE()) return flyStage(ci, ti, done);
    var cel = document.querySelector('.hand [data-c="' + ci + '"]'), tel = ti != null ? document.querySelector('[data-w="e' + ti + '"]') : document.querySelector('.mid');
    if (!moOk() || !cel || !tel || !cel.animate) return done();
    var a = cel.getBoundingClientRect(), b = tel.getBoundingClientRect(), f = cel.cloneNode(true); f.classList.remove('sel'); f.classList.add('fly');
    f.style.left = a.left + 'px'; f.style.top = a.top + 'px'; f.style.margin = '0';
    var kf = [{ transform: 'translate(0,0) scale(1)', opacity: 1 }, { transform: 'translate(0,-16px) scale(1.18)', opacity: 1, offset: .25 }, { transform: 'translate(' + (b.left + b.width / 2 - a.left - a.width / 2) + 'px,' + (b.top + b.height / 2 - a.top - a.height / 2) + 'px) scale(.5) rotate(18deg)', opacity: .15 }];
    [2, 1].forEach(function (k) { var t = f.cloneNode(true); t.classList.add('w4trail'); document.body.appendChild(t); var ta = t.animate(kf, { duration: 320, delay: k * 35, easing: 'ease-in', fill: 'backwards' }); ta.onfinish = function () { t.remove(); }; setTimeout(function () { if (t.parentNode) t.remove(); }, 700); });
    document.body.appendChild(f);
    var an = f.animate(kf, { duration: 320, easing: 'ease-in' });
    an.onfinish = function () { f.remove(); tel.classList.add('w4impact'); setTimeout(function () { tel.classList.remove('w4impact'); }, 300); done(); }; setTimeout(function () { if (f.parentNode) { f.remove(); } }, 700);
  }
  // W485 stage: the played card jumps to the centre big, holds ~400 ms, then flies into its target (a foe, or the hero for skills)
  function flyStage(ci, ti, done) {
    var g = G(), cel = document.querySelector('.hand [data-c="' + ci + '"]'), tel = ti != null ? document.querySelector('[data-w="e' + ti + '"]') : document.querySelector('[data-w="h' + (g.b.cur >= 0 ? g.b.cur : 0) + '"]');
    if (!moOk() || !cel || !tel || !cel.animate) return done();
    var hd = cel.parentNode, cw = hd ? getComputedStyle(hd).getPropertyValue('--cw') : '', w = cel.offsetWidth, hh = cel.offsetHeight, a = cel.getBoundingClientRect(), b = tel.getBoundingClientRect();
    var f = cel.cloneNode(true); f.classList.remove('sel'); f.classList.add('fly', 'w485play'); f.style.cssText = (cw ? '--cw:' + cw + ';' : '') + 'position:fixed;z-index:90;margin:0;left:0;top:0;width:' + w + 'px;height:' + hh + 'px;pointer-events:none';
    var vw = document.documentElement.clientWidth, vh = window.innerHeight, sc = Math.min(1.7, (vw * .5) / w), x0 = a.left + a.width / 2 - w / 2, y0 = a.top + a.height / 2 - hh / 2, xc = vw / 2 - w / 2, yc = vh * .42 - hh / 2, xt = b.left + b.width / 2 - w / 2, yt = b.top + b.height * .4 - hh / 2;
    var T = function (x, y, s2, r) { return 'translate(' + x + 'px,' + y + 'px) scale(' + s2 + ') rotate(' + (r || 0) + 'deg)'; };
    document.body.appendChild(f); cel.style.visibility = 'hidden';
    var an = f.animate([{ transform: T(x0, y0, 1), opacity: 1 }, { transform: T(xc, yc, sc), opacity: 1, offset: .22 }, { transform: T(xc, yc, sc), opacity: 1, offset: .74 }, { transform: T(xt, yt, .45, ti != null ? 16 : 0), opacity: .1 }], { duration: wt(820), easing: 'ease-in-out' });
    var fin = false, end = function () { if (fin) return; fin = true; f.remove(); tel.classList.add('w4impact'); setTimeout(function () { tel.classList.remove('w4impact'); }, 300); done(); };
    an.onfinish = end; setTimeout(end, wt(820) + 400);
  }
  function onCard(i) {
    var g = G(); if (g.b.ph !== 'p' || UI.busy) return; var cur = g.hs[g.b.cur], c = cur.hand[i];
    if (!tutOk({ type: 'tap', w: 'card', id: c.id })) return;
    if (!(E.canPlay(cur, c) && (E.eff(c).cost === 'X' || E.cost(cur, c) <= cur.en))) { UI.sel = i; render(); toast(E.eff(c).fl.indexOf('u') >= 0 ? 'Cannot play' : 'Not enough energy'); UI.sel = -1; return; }
    if (UI.sel !== i) { UI.sel = i; render(); return; }
    var al = g.b.en.map(function (e, k) { return e.dead ? -1 : k; }).filter(function (k) { return k >= 0; });
    if (E.eff(c).tgt && al.length > 1) { toast('Tap an enemy'); return; }
    playIt(i, E.eff(c).tgt ? al[0] : undefined);
  }
  function onEnemy(i) { var g = G(); if (g.b.ph === 'p' && UI.sel >= 0 && needTarget()) playIt(UI.sel, i); }
  function playIt(ci, ti) {
    var g = G(), mv = { t: 'play', h: g.b.cur, c: ci }; if (ti != null) mv.e = ti;
    var hc0 = g.hs[g.b.cur], cc0 = hc0.hand[ci]; UI.lastName = whyOf(hc0, cc0, ti != null ? g.b.en[ti] : null); SFX('play'); UI.busy = true; flyCard(ci, ti, function () {
      UI.busy = false; UI.sel = -1; g = G(); if (!g || !g.b || g.scr !== 'battle') { render(); return; }   // R1: the fight can end while the card flies
      var tg = ti != null ? g.b.en[ti] : null, wasV = tg && tg.st.vuln > 0, wasD = tg && tg.dead;
      try { var pv = E.previewPlay && E.previewPlay(g.b.cur, ci, ti); if (pv && UI.fs) pv.en.forEach(function (x) { UI.fs.over += x ? x.over : 0; }); } catch (x) { }
      E.performMove(mv); render(); UI.lastName = ''; afterMove();
      try { if (UI.coachReact && tg) { if (!wasD && tg.dead) UI.coachReact('good', 'kill'); else if (wasV) UI.coachReact('good', 'double'); } } catch (e) { }
    });
  }
  function afterMove() { var g = G(); if (g.scr !== 'battle') { render(); } }
  function usePot(i) {
    var g = G(); if (g.scr !== 'battle' || g.b.ph !== 'p') { toast('Use in a fight'); return; }
    var id = g.pots[i];
    if (D.POTIONS[id].tgt) { var al = g.b.en.map(function (e, k) { return e.dead ? -1 : k; }).filter(function (k) { return k >= 0; }); E.performMove({ t: 'pot', p: i, e: al[0] }); }
    else E.performMove({ t: 'pot', p: i });
    render();
  }
  function endTurn() {
    var g = G(); if (g.scr !== 'battle' || g.b.ph !== 'p' || UI.busy) return; if (!tutOk({ type: 'tap', w: 'end' })) return; UI.sel = -1;
    try { var hh0 = g.hs[g.b.cur]; if (UI.coachReact && hh0 && hh0.en > 0 && hh0.hand.some(function (c) { return E.canPlay(hh0, c) && E.cost(hh0, c) <= hh0.en && E.eff(c).type !== 'X'; })) UI.coachReact('poor', 'leftover'); UI.hp0 = hh0.hp; UI.bk0 = hh0.blk; if (UI.fs && hh0.en > 0 && hh0.hand.some(function (c) { return playable(hh0, c) && E.eff(c).type !== 'X'; })) UI.fs.waste += hh0.en; } catch (e) { }
    E.performMove({ t: 'end' }); render();
    if (G().scr === 'battle' && G().b.ph === 'e') enemyPhase(); else render();
  }
  // big centre banner: whose turn it is (tap anywhere to dismiss early)
  function banner(txt, cls) {
    var o = document.querySelector('.turnban'); if (o) o.remove(); if (!window.ANIM) return;
    var d = h('div', 'turnban ' + (cls || ''), null, [h('b', '', txt)]); d.setAttribute('role', 'status'); document.body.appendChild(d);
    setTimeout(function () { if (d.parentNode) d.remove(); }, UI.fast ? 450 : 1000);
  }
  UI.banner = banner;
  // enemy turn, one thing at a time: banner, then for each enemy: it glows + caption of what it does (wait), it acts (animation + pops), result caption (wait). Tap anywhere to speed up.
  function wt(ms) { return UI.fast ? Math.round(ms / 3) : ms; }
  function enemyPhase() {
    if (!window.ANIM) { E.settle(); render(); return; }
    UI.busy = true; UI.fast = false; UI.cap = ''; UI.actor = -1;
    var spd = function () { UI.fast = true; }; document.addEventListener('pointerdown', spd, true);
    var done = function () { document.removeEventListener('pointerdown', spd, true); UI.busy = false; UI.actor = -1; UI.cap = ''; render(); try { var gq = G(), hq = gq.hs[0]; if (UI.coachReact && gq.scr === 'battle' && UI.hp0 != null) { var lost = UI.hp0 - hq.hp; if (lost >= 8 && UI.bk0 === 0) UI.coachReact('poor', 'hurt'); else if (lost === 0 && UI.bk0 > 0) UI.coachReact('good', 'blocked'); } } catch (e) { } var g = G(); if (g && g.scr === 'battle' && g.b && g.b.ph === 'p') 0; };
    UI.cap = 'Enemy turn: watch what each enemy does.'; render();
    (function loop() {
      var g = G(); if (!g || g.scr !== 'battle' || !g.b || g.b.ph !== 'e') return done();
      var ei = g.b.ei, e = g.b.en[ei];
      if (!e || e.dead) { E.step(); return setTimeout(loop, 30); }
      var nm = D.ENEMIES[e.id].name, P = intentParts(e), hh = g.hs[(e.intent && e.intent.tg) || 0] || g.hs[0], hp0 = hh.hp, bk0 = hh.blk;
      UI.actor = ei; UI.cap = nm + ' ' + P.map(function (p) { return p.cap || p.t; }).join(' and ') + '.'; render();
      setTimeout(function () {
        var g1 = G(); if (!g1 || !g1.b || g1.scr !== 'battle') return done();   // R1: guard delayed callbacks
        E.step(); var g2 = G(); render();
        var lost = hp0 - hh.hp, soak = Math.max(0, Math.min(bk0, bk0 - hh.blk));
        if (g2.scr === 'battle' && (lost > 0 || soak > 0)) { UI.cap = (lost > 0 ? 'You lost ' + lost + ' HP' : 'No damage') + (soak > 0 ? ' (' + soak + ' blocked by your Block).' : '.'); var dm = document.getElementById('dockmsg'); if (dm) dm.textContent = UI.cap; }
        setTimeout(loop, wt(lost > 0 || soak > 0 ? 900 : 500));
      }, wt(800));
    })();
  }
  // ---------- other screens
  function reward() {
    var g = G(), r = g.rw, s = h('div', 'reward');
    s.appendChild(A('bg-reward', '', { cls: 'bg', kind: 'bg' }));
    s.appendChild(h('h2', '', r.treasure ? 'Treasure!' : 'Victory!'));
    var rk = g.act + ':' + g.floor + ':' + g.at, wasB = g.map[g.at] && g.map[g.at].t === 'b';
    if (!r.treasure && UI.fanKey !== rk) { UI.fanKey = rk; fanfare(wasB); }
    if (!r.treasure && UI.fs && UI.fs.key === rk) s.appendChild(rateLine(g, UI.fs));   // W420 fight rating
    s.appendChild(h('div', 'chip', '● +' + r.gold + ' gold'));
    if (r.pot && !r.took.pot) { var pb = on(h('button', 'item', null, [A('pot-' + r.pot, D.POTIONS[r.pot].name, { ph: '#5a8a5a' }), h('span', '', D.POTIONS[r.pot].name)]), function () { E.performMove({ t: 'takepot' }); render(); }); pb.style.width = '140px'; s.appendChild(pb); }
    if (r.relics && !r.took.relic) { var rl = h('div', 'picks'); r.relics.forEach(function (id, i) { if (!id || r.took['r' + i]) return; var b = on(h('button', 'item', null, [A('relic-' + id, D.RELICS[id].name, { ph: '#8a6a2a' }), h('b', '', D.RELICS[id].name), h('span', '', D.RELICS[id].t)]), function () { E.performMove({ t: 'relic', i: i }); render(); }); b.style.width = '130px'; rl.appendChild(b); }); s.appendChild(rl); }
    Object.keys(r.cards).forEach(function (hi) {
      if (r.took['c' + hi]) return; if (g.hs.length > 1) s.appendChild(h('div', 'chip', D.H[g.hs[hi].k].name + ': pick a card'));
      else s.appendChild(h('div', 'sub', 'Add one card to your deck'));
      var pk = h('div', 'picks'); r.cards[hi].forEach(function (id, i) { var c = cardEl({ id: id, u: 0 }); c.setAttribute('data-pick', i); c.classList.add('w4rw'); (c.querySelector('.cart') || c).appendChild(h('span', 'w4vt', valTag(id))); on(c, function () { if (!tutOk({ type: 'tap', w: 'pick', i: i })) return; E.performMove({ t: 'pick', h: +hi, i: i }); render(); }); pk.appendChild(c); }); s.appendChild(pk);
      s.appendChild(on(h('button', 'btn alt', 'Skip'), function () { E.performMove({ t: 'skip', h: +hi }); render(); }));
    });
    var lv = on(h('button', 'btn', 'Continue'), function () { E.performMove({ t: 'leave' }); render(); }); lv.id = 'leave'; s.appendChild(lv);
    hud(); app.appendChild(s);
  }
  // W420: one-line fight rating + reward value tags
  function rateLine(g, f) {
    var lost = Math.max(0, f.hp0 - g.hs.reduce(function (a, x) { return a + x.hp; }, 0)), good = lost <= Math.max(6, Math.round(f.mhp * .12)) && f.waste <= 1;
    var t = good ? 'Good fight: lost ' + lost + ' HP' + (f.waste ? ', ' + f.waste + ' energy unspent' : ', no wasted energy') : 'Poor fight: took ' + lost + ' HP' + (f.waste ? ', ' + f.waste + ' energy unspent over ' + f.turns + ' turn' + (f.turns === 1 ? '' : 's') : lost > 0 ? ', block more before big hits' : '');
    if (f.over >= 10) t += ', ' + f.over + ' overkill';
    return h('div', 'w4rate ' + (good ? 'good' : 'poor'), t);
  }
  function valTag(id) {
    var e = E.eff({ id: id, u: 0 }), s = JSON.stringify(e.ops);
    if (e.type === 'P' || /"(str|dblStr|focus|power)"/.test(s)) return 'scales';
    if (/"(dmg|hit|all|dmgx|bodyslam|chan|chanX|evoke2|evokeX|shiv|poison|poisonAll|dblPoison)"/.test(s)) return '+dmg';
    if (/"blk"/.test(s)) return 'block';
    if (/"(draw|nrg|scry|mir)"/.test(s)) return 'draw';
    return 'utility';
  }
  function deckPicker(title, hi, filter, cb) {
    var g = G(), ov = h('div', 'ov'); ov.appendChild(h('h2', '', title, [on(h('button', 'x', '✕'), function () { UI.ov = null; render(); })]));
    var gr = h('div', 'grid'); g.hs[hi].deck.forEach(function (c, i) { if (!filter(c)) return; var el = cardEl(c); on(el, function () { cb(i); }); gr.appendChild(el); });
    ov.appendChild(gr); return ov;
  }
  function rest() {
    var g = G(), s = h('div', 'reward'); s.appendChild(A('bg-rest', '', { cls: 'bg', kind: 'bg' }));
    var hi = g.rest.todo[0], hh = g.hs[hi], H = D.H[hh.k];
    s.appendChild(h('h2', '', 'Campfire')); s.appendChild(host('cast-healer', 'Sit, climber. Heal ' + (9 + (E.has('healing-moss') ? 10 : 0)) + ' HP, or sharpen one card.'));
    if (g.hs.length > 1) s.appendChild(h('div', 'chip', H.name));
    var amt = 3 * (D.SCALE || 3) + (E.has('healing-moss') ? 10 : 0);
    var b1 = on(h('button', 'btn', 'Rest: heal ' + amt), function () { E.performMove({ t: 'heal', h: hi }); UI.ov = null; render(); }); b1.id = 'rest-heal';
    var b2 = on(h('button', 'btn alt', 'Smith: upgrade a card'), function () { UI.ov = 'smith'; render(); }); b2.id = 'rest-smith';
    s.appendChild(b1); s.appendChild(b2); hud(); app.appendChild(s);
  }
  function shop() {
    var g = G(), s = h('div', 'reward'); s.appendChild(A('bg-shop', '', { cls: 'bg', kind: 'bg' }));
    s.appendChild(h('h2', '', 'Wayside Market')); s.appendChild(host('cast-merchant', 'The first relic and potion are cheaper today.'));
    var it = h('div', 'items');
    g.shop.items.forEach(function (x, i) {
      var nm = x.t === 'card' ? D.CARDS[x.id].name : x.t === 'relic' ? D.RELICS[x.id].name : D.POTIONS[x.id].name;
      var art = x.t === 'card' ? A(x.id, nm, { ph: TONE[D.CARDS[x.id].hero] }) : x.t === 'relic' ? A('relic-' + x.id, nm, { ph: '#8a6a2a' }) : A('pot-' + x.id, nm, { ph: '#5a8a5a' });
      var b = h('button', 'item' + (x.sold ? ' sold' : '') + (g.gold < x.p ? ' poor' : ''), null, [art, h('span', '', nm), h('span', 'price', '● ' + x.p)]);
      if (UI.shopSel === i) b.classList.add('picked');
      on(b, function () { UI.shopSel = i; render(); }); it.appendChild(b);
    });
    var rm = on(h('button', 'item' + (g.shop.removed ? ' sold' : ''), null, [A('icon-remove', '✂', { ph: '#7a3a3a' }), h('span', '', 'Remove a card'), h('span', 'price', '● ' + g.shop.rm)]), function () { if (g.gold < g.shop.rm) { toast('Not enough gold'); return; } UI.ov = 'remove'; render(); });
    it.appendChild(rm); s.appendChild(it);
    var sx = g.shop.items[UI.shopSel];
    if (sx && !sx.sold) {
      var nm2 = sx.t === 'card' ? D.CARDS[sx.id].name : sx.t === 'relic' ? D.RELICS[sx.id].name : D.POTIONS[sx.id].name, dt = h('div', 'shopdet');
      if (sx.t === 'card') { var ce = cardEl({ id: sx.id, u: 0 }); ce.classList.add('big'); dt.appendChild(ce); }
      else dt.appendChild(h('div', 'refline', nm2 + ': ' + (sx.t === 'relic' ? D.RELICS[sx.id].t : D.POTIONS[sx.id].t)));
      var bb = on(h('button', 'btn' + (g.gold < sx.p ? ' alt' : ''), 'Buy ' + nm2 + ' (● ' + sx.p + ')'), function () { if (!E.performMove({ t: 'buy', i: UI.shopSel })) toast(g.gold < sx.p ? 'Not enough gold' : 'No room'); else UI.shopSel = -1; render(); }); bb.id = 'buy';
      dt.appendChild(bb); s.insertBefore(dt, it);
    } else s.insertBefore(h('div', 'sub', 'Tap an item to see what it does.'), it); var slv = on(h('button', 'btn', 'Leave'), function () { UI.shopSel = -1; E.performMove({ t: 'leave' }); render(); }); slv.id = 'shop-leave'; slv.classList.add('shopleave'); var sh2 = s.querySelector('h2'); if (sh2 && sh2.after) sh2.after(slv); else s.appendChild(slv);
    hud(); app.appendChild(s);
  }
  function event() {
    var g = G(), ev = D.EVENTS[g.evn.id], s = h('div', 'reward'); s.appendChild(A('bg-event', '', { cls: 'bg', kind: 'bg' }));
    s.appendChild(h('h2', '', ev.name)); s.appendChild(host('cast-teller', ev.q)); s.appendChild(A('event-' + g.evn.id, ev.name, { cls: 'evart', ph: '#4a3a5a', kind: 'card' }));
    if (g.evn.res) { s.appendChild(h('div', 'sub', g.evn.res)); var evl = on(h('button', 'btn', 'Continue'), function () { E.performMove({ t: 'leave' }); render(); }); evl.id = 'ev-leave'; s.appendChild(evl); }
    else {
      s.appendChild(h('div', 'sub', ev.q)); var o = h('div', 'opts');
      ev.o.forEach(function (x, i) { var b = on(h('button', 'btn alt', x.t), function () { E.performMove({ t: 'opt', i: i }); if (G().evn.pend) UI.ov = 'evpick'; render(); }); if (x.cost && g.gold < x.cost) b.disabled = true; o.appendChild(b); }); s.appendChild(o);
    }
    hud(); app.appendChild(s);
  }
  // ---------- result screens (defeat + victory): cause, floors, deck (tap = large card), relics, Story stars; used for Quick and Story
  function bigCard(c) { var pk = h('div', 'peek'); pk.appendChild(cardEl(c)); pk.addEventListener('pointerdown', function (e) { e.stopPropagation(); pk.remove(); }); pk.addEventListener('click', function () { pk.remove(); }); document.body.appendChild(pk); }
  function resultScr(r, done) {
    var g = G(); try { hud(); } catch (e) { }   // R1: the top-bar HP must match the result (0 when fallen)
    var s = h('div', 'over res'); s.appendChild(A(g.won ? 'bg-victory' : 'bg-defeat', '', { cls: 'bg panelbg', kind: 'bg' }));
    s.appendChild(h('h1', '', g.won ? ((g.F || 9) >= 9 ? 'SUMMIT!' : 'CLIMB WON!') : 'FALLEN'));
    var bossId = g.boss, kid = g.won ? bossId : g.killer, kd = kid && D.ENEMIES[kid];
    var cause = h('div', 'cause');
    if (kd && (!g.won || g.floor >= g.F)) cause.appendChild(A('enemy-' + kid, '', { ph: '#6a3a2a', cls: 'cause-art' }));
    var full = g.floor >= g.F; if (g.won && !full) { kd = null; }
    cause.appendChild(h('div', 'sub', g.won ? (full ? 'Final boss down: ' + (D.ENEMIES[bossId] ? D.ENEMIES[bossId].name : 'the tower boss') + '.' : 'The guided fight is won.') : (kd ? 'Felled by ' + kd.name + (g.killIn === 'b' ? ' (boss)' : g.killIn === 'e' ? ' (elite)' : '') + '.' : 'Your own cards finished you.')));
    s.appendChild(cause);
    var QS = (window.EC_STORY || {}).quick; if (QS && !UI.camp && !window.EC_NOSAVE) s.appendChild(h('div', 'storyline', g.won ? QS.won : QS.lost));
    var tot = g.hs.reduce(function (a, x) { return a + x.deck.length; }, 0);
    s.appendChild(h('div', 'chip rstat', 'Floors ' + Math.min(g.floor, g.F) + ' / ' + g.F + '   Deck ' + tot + '   Relics ' + g.relics.length + '   Gold ' + g.gold));
    if (r) {
      var sr = h('div', 'rstars'); for (var i = 0; i < 3; i++) sr.appendChild(h('span', i < r.stars ? 'on' : '', '★'));
      s.appendChild(h('div', 'storyline', null, [sr, h('span', '', (r.def.title || 'Story') + (r.won ? ' · best ' + (r.best || r.stars) + ' of ' + (r.def.maxStars || 3) + ' stars' : ' · not cleared yet'))]));
      (r.def.stars || []).forEach(function (st, i) { s.appendChild(h('div', 'rstar' + (i < r.stars ? ' on' : ''), (i < r.stars ? '★ ' : '☆ ') + st.text)); });
      (r.unlocks || []).forEach(function (u) { s.appendChild(h('div', 'runl', 'Unlocked: ' + u.text)); });
    }
    var dk = h('div', 'rsec'); dk.appendChild(h('b', '', 'Final deck (tap a card)'));
    var gr = h('div', 'rgrid'); g.hs.forEach(function (x) { var seen = {}, order = []; x.deck.forEach(function (c) { var k = c.id + (c.u ? '+' : ''); if (!seen[k]) { seen[k] = { c: c, n: 0 }; order.push(k); } seen[k].n++; }); order.forEach(function (k) { var o = seen[k], t = on(h('button', 'rcard t-' + E.eff(o.c).type, null, [A(o.c.id, '', { cls: 'rart', kind: 'card', noph: 1 }), h('span', '', E.eff(o.c).name), h('i', '', o.n > 1 ? '×' + o.n : '')]), function () { bigCard(o.c); }); t.setAttribute('aria-label', 'View ' + E.eff(o.c).name); gr.appendChild(t); }); });
    dk.appendChild(gr); s.appendChild(dk);
    var rl = h('div', 'rsec'); rl.appendChild(h('b', '', 'Relics (tap for text)'));
    var rr = h('div', 'rrow'); g.relics.forEach(function (id) { var t = on(h('button', 'rrel', null, [A('relic-' + id, '✦', { ph: '#8a6a2a' })]), function () { toast(D.RELICS[id].name + ': ' + D.RELICS[id].t, 3200); }); t.setAttribute('aria-label', D.RELICS[id].name); rr.appendChild(t); });
    rl.appendChild(rr); s.appendChild(rl);
    var bt = h('div', 'rbtns');
    var again = on(h('button', 'btn', 'Play again'), function () { done('again'); }); again.id = 'again'; bt.appendChild(again);
    if (r) { var mp = on(h('button', 'btn alt', 'Story map'), function () { done('map'); }); mp.id = 'rmap'; bt.appendChild(mp); }
    if (r && r.won) { var nx = on(h('button', 'btn', 'Next chapter'), function () { done('next'); }); nx.id = 'rnext'; bt.insertBefore(nx, bt.firstChild); }
    var tt = on(h('button', 'btn alt', 'Title'), function () { done('title'); }); tt.id = 'rtitle'; bt.appendChild(tt);
    s.appendChild(bt); app.appendChild(s);
  }
  UI.showResult = function (r) {
    return new Promise(function (resolve) {
      var g = G(); if (!g) return resolve('map');
      var dn = function (pick) { UI.lastRes = null;
        if (pick === 'title') { try { UI.campExit(); } catch (e) { } return; }
        resolve(pick);
      }; UI.lastRes = { r: r, done: dn }; app.innerHTML = ''; resultScr(r, dn);
    });
  };
  function over() {
    var g = G();
    if (UI.camp && UI.lastRes) { resultScr(UI.lastRes.r, UI.lastRes.done); return; }   // a redraw (sound toggle, menu) keeps the chapter result on screen
    if (UI.camp && !(UI.coach && UI.coach.on)) { var s0 = h('div', 'over'); if (!UI.fin) { UI.fin = 1; setTimeout(function () { window.EC_NOSAVE = 0; try { GXC.finish(G()); } catch (e) { } }, 500); } app.appendChild(s0); return; }
    resultScr(null, function (pick) { if (pick === 'again') UI.restart(); else { E.clear(); UI.mode = 'title'; render(); } });
  }
  function overlay() {
    var g = G(), ov = null;
    function close() { UI.ov = null; render(); }
    if (UI.ov === 'relics') {
      ov = h('div', 'ov'); ov.appendChild(h('h2', '', 'Relics', [on(h('button', 'x', '✕'), close)]));
      var gr = h('div', 'items'); g.relics.forEach(function (id) { gr.appendChild(h('div', 'item', null, [A('relic-' + id, D.RELICS[id].name, { ph: '#8a6a2a' }), h('b', '', D.RELICS[id].name), h('span', '', D.RELICS[id].t)])); }); ov.appendChild(gr);
    } else if (UI.ov === 'deck' || UI.ov === 'draw' || UI.ov === 'disc') {
      ov = h('div', 'ov'); ov.appendChild(h('h2', '', UI.ov === 'deck' ? 'Your deck' : UI.ov === 'draw' ? 'Draw pile' : 'Discard pile', [on(h('button', 'x', '✕'), close)]));
      var gg = h('div', 'grid'), cards = []; if (UI.ov === 'deck') g.hs.forEach(function (x) { cards = cards.concat(x.deck); }); else { var cu = g.hs[g.b.cur]; cards = UI.ov === 'draw' ? cu.draw.slice().sort(function (a, b) { return a.id < b.id ? -1 : 1; }) : cu.disc; }
      cards.forEach(function (c) { gg.appendChild(cardEl(c)); }); ov.appendChild(gg);
    } else if (UI.ov === 'smith') { var hi = g.rest.todo[0]; ov = deckPicker('Upgrade which card?', hi, function (c) { return !c.u && D.CARDS[c.id].ops.length && D.CARDS[c.id].hero !== 'z'; }, function (i) { E.performMove({ t: 'upg', h: hi, c: i }); UI.ov = null; render(); }); }
    else if (UI.ov === 'remove') { ov = h('div', 'ov'); ov.appendChild(h('h2', '', 'Remove which card?', [on(h('button', 'x', '✕'), close)])); var gr2 = h('div', 'grid'); g.hs.forEach(function (x, hi) { x.deck.forEach(function (c, i) { var el = cardEl(c); on(el, function () { E.performMove({ t: 'remove', h: hi, c: i }); UI.ov = null; render(); }); gr2.appendChild(el); }); }); ov.appendChild(gr2); }
    else if (UI.ov === 'evpick') { ov = deckPicker(g.evn.pend === 'rem' ? 'Remove which card?' : 'Upgrade which card?', 0, function (c) { return g.evn.pend === 'rem' || (!c.u && D.CARDS[c.id].ops.length); }, function (i) { E.performMove({ t: 'evpick', c: i }); UI.ov = null; render(); }); }
    if (ov) { ov.addEventListener('click', function (e) { if (e.target === ov) close(); }); app.appendChild(ov); }
  }
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && UI.ov) { UI.ov = null; render(); } });
  // test + automation hooks
  window.render_game_to_text = function () { var g = G(); if (!g) return JSON.stringify({ mode: UI.mode }); return JSON.stringify({ scr: g.scr, floor: g.floor, gold: g.gold, hs: g.hs.map(function (x) { return { k: x.k, hp: x.hp, en: x.en, hand: x.hand ? x.hand.map(function (c) { return c.id; }) : [] }; }), enemies: g.b ? g.b.en.map(function (e) { return { id: e.id, hp: e.hp, intent: e.intent }; }) : null }); };
  window.EC_FORCE_END = function () { var g = G(); if (!g) return; if (g.b) { g.b.en.forEach(function (e) { e.hp = 0; e.dead = 1; }); } };
  window.EC_WIN_FIGHT = function () { var g = G(); g.b.en.forEach(function (e) { e.hp = 1; }); };
  window.EC_FORCE_RESULT = function (won) { var g = G(); g.scr = 'over'; g.won = won ? 1 : 0; g.b = null; render(); };
  /* Menu jump chips (shared nav) only scroll; mark the chosen one so the tap visibly registers (E6) */
  document.addEventListener('click', function (e) {
    var c = e.target && e.target.closest && e.target.closest('.gx-set-nav .gx-chip'); if (!c) return;
    [].forEach.call(c.parentNode.children, function (x) { x.removeAttribute('aria-current'); }); c.setAttribute('aria-current', 'true');
  });
  UI.start = start; UI.fit = function () { };
  UI.mode = 'title'; render();
})();
