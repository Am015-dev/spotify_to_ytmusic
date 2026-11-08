// ===== Playable pass (W386, 7 Nov 2026): a newcomer can follow every turn. Presentation only, the rules never change. =====
// 1) every die says what it is (word under the face)   2) a big "Your turn" / "<Rival>'s turn" banner when the turn changes
// 3) the one line on the board says what to do now, with the roll number   4) a rival's turn reads as short captions, one per step
(function () {
  const $ = id => document.getElementById(id);
  const quiet = () => { try { return typeof tutOn === 'function' && tutOn() } catch (e) { return false } };
  // ---- 1) dice captions
  const LAB = { '1': 'STAR', '2': 'STAR', '3': 'STAR', E: 'ENERGY', H: 'HEAL', C: 'HIT', C2: 'HIT ×2', E2: 'ENERGY ×2', O: 'OUCH' };
  function dieLabels() {
    const di = $('dice'); if (!di || !(typeof G!=='undefined'&&G)) return;
    di.querySelectorAll('.die[data-die]').forEach(b => { const d = G.dice[+b.dataset.die]; if (!d) return; const l = LAB[d.f] || ''; if (b.dataset.lab !== l) { b.dataset.lab = l; b.dataset.f = d.f } });
  }
  try { new MutationObserver(dieLabels).observe($('dice') || document.body, { childList: true, subtree: !$('dice') }) } catch (e) { }
  // ---- 2) turn banner
  let key = '', hideT = 0;
  function banner() {
    if (!(typeof G!=='undefined'&&G) || G.winner || UI.intro || quiet() || (window.GX && GX.open) || /[?&]scn=/.test(location.search)) return;   // scenarios build one exact state: no transient overlay
    const k = G.gid + '/' + G.tid + '/' + G.active; if (k === key) return; key = k;
    let el = $('ccbanner'); if (!el) { el = document.createElement('div'); el.id = 'ccbanner'; el.setAttribute('aria-live', 'polite'); document.body.appendChild(el) }
    const p = cur(), me = typeof humanTurn === 'function' && humanTurn();
    el.style.setProperty('--bc', MONS[p.m].c);
    el.className = me ? 'me' : 'rival';
    el.innerHTML = me ? '<b>YOUR TURN</b><span>Roll the dice</span>' : `<b>${esc(mname(p))}’s turn</b><span>Watch what it does</span>`;
    void el.offsetWidth; el.classList.add('on'); clearTimeout(hideT); hideT = setTimeout(() => el.classList.remove('on'), me ? 1100 : 900);
  }
  // ---- 3) + 4) the line on the board (board.js bfLineText passes its text through here)
  const turnLogs = () => { const n0 = (typeof RECAP !== 'undefined' && RECAP.turnN) || 0; return G.log.filter(l => l.n > n0 && l.s === G.active) };
  window.ppLine = function (t) {
    try {
      if (!(typeof G !== 'undefined' && G) || G.winner || UI.intro || UI.choice || quiet()) return t;
      const p = cur();
      if (!humanTurn() && !(NET.on && G.pl[G.active].human)) {
        const ev = turnLogs()[0]; const s = ev ? String(ev.t).replace(/\s+/g, ' ') : '';
        if (G.phase === 'roll' && !s) return `${mname(p)} is rolling the dice…`;
        return s ? (s.length > 64 ? s.slice(0, 61) + '…' : s) : `${mname(p)} is thinking…`;
      }
      if (humanTurn() && G.phase === 'roll' && G.dice.length) { const tot = rerollsOf(p) + 1, n = Math.min(tot, Math.max(1, tot - G.rolls)); return `Roll ${n} of ${tot} · ${t}` }
      if (humanTurn() && G.phase === 'buy') return 'Buy phase · ' + t;
    } catch (e) { }
    return t;
  };
  window.ppAfter = function () { banner(); dieLabels(); try { coach() } catch (e) { } if (typeof bfLine === 'function') bfLine() };
  // ---- the guide's story beats in the tutorial: a speech card with the portrait (Dot Inkwell, the Clarion's reporter), never over a tap target for long
  let beatT = 0;
  window.ppBeat = function (head, text, ms) {
    if (typeof TUT_STORY === 'undefined') return;
    let el = $('ppbeat'); if (!el) { el = document.createElement('div'); el.id = 'ppbeat'; el.setAttribute('aria-live', 'polite'); document.body.appendChild(el) }
    const g = TUT_STORY.guide;
    el.style.setProperty('--bc', g.color);
    el.innerHTML = `<img src="${g.img}" alt="" onerror="this.replaceWith(Object.assign(document.createElement('i'),{textContent:'${g.emoji}'}))"><div>${head ? `<b>${esc(head)}</b>` : `<b>${esc(g.name)}</b>`}<span>${esc(text)}</span></div>`;
    el.classList.remove('on'); void el.offsetWidth; el.classList.add('on'); clearTimeout(beatT); beatT = setTimeout(() => el.classList.remove('on'), ms || (head ? 4200 : 2400));
  };
  // ---- the coached first game: tips from tut-story.js (COACH_TIPS), one bubble at a time, never blocks input
  const C = window.PPC = { on: false, seen: {}, rules: {}, cur: null, hideT: 0, ended: false };
  const hideCoach = () => { clearTimeout(C.hideT); const e = $('ppcoach'); if (e) e.classList.remove('on'); C.cur = null };
  function showCoach(t) {
    let el = $('ppcoach'); if (!el) { el = document.createElement('div'); el.id = 'ppcoach'; el.setAttribute('aria-live', 'polite'); document.body.appendChild(el);
      el.addEventListener('click', e => { if (e.target.closest('[data-pp-x]')) hideCoach(); else if (e.target.closest('[data-pp-skip]')) { hideCoach(); C.on = false; try { tutLeave() } catch (x) { } } else if (e.target.closest('[data-pp-play]')) { hideCoach(); const b = document.querySelector('[data-start="solo"]'); try { tutLeave() } catch (x) { } if (b) setTimeout(() => b.click(), 50) } else if (e.target.closest('[data-pp-story]')) { hideCoach(); try { tutLeave() } catch (x) { } try { GXC.open() } catch (x) { } } }) }
    const g = TUT_STORY.guide, txt = typeof t.say === 'function' ? t.say(HELP_()) : t.say;
    el.style.setProperty('--bc', g.color);
    el.innerHTML = `<img src="${g.img}" alt="" onerror="this.replaceWith(Object.assign(document.createElement('i'),{textContent:'${g.emoji}'}))"><div><b>${esc(t.head || g.name)}</b><span>${esc(txt)}</span>${t.html || ''}</div><button type="button" data-pp-x aria-label="Dismiss">×</button>`;
    el.classList.add('on'); C.cur = t.id; (t.rules || []).forEach(r => C.rules[r] = 1); C.seen[t.id] = 1;
    clearTimeout(C.hideT); if (!t.sticky) C.hideT = setTimeout(hideCoach, 8000);
  }
  const HELP_ = () => ({ vp: P(0).vp, rival: mname(G.pl.find(p => !p.human) || G.pl[1]) });
  function finalCard() {
    if (C.ended) return; C.ended = true; C.rules.final = 1; C.rules.later = 1; COACH_LATER.forEach(l => C.rules[l[0]] = 'later');
    const LS = { faces: 'each die says STAR, ENERGY, HEAL or HIT', preview: 'the yellow line previews your dice', setup: 'everyone starts with 10 hearts', goal: 'first to the star goal wins', roll3: 'up to three rolls a turn', extra: 'four of a kind adds 1 ★ per extra die', noheal: 'no healing inside Downtown', start2: 'starting a turn in Downtown pays +2 ★', yield: 'yield when hit in Downtown', ko: '0 ♥ means knocked out; last one standing wins', claws: 'claws hit the other zone', hearts: 'hearts heal 1 each', energy: 'energy buys cards', pair: 'a pair scores nothing; three of a kind scores', enter: 'an empty Downtown pulls you in for +1 ★', win20: '20 ★ is checked when your turn ends', rivals: 'rivals play like you', cards: 'power cards: tap to read, tap again to buy', types: 'PERMANENT cards stay, ONE-SHOT cards are used once', sweep: '♻ swaps the three cards for 2 ⚡', endturn: 'End turn keeps your saved ⚡', keep: 'tap dice to keep them, Roll for the rest', preview: 'the yellow line shows what your dice would score', rekeep: 'kept dice can be rolled again', triple: 'three of a kind scores its number in ★', stop: 'you may stop rolling early' };
    const miss = []; COACH_TIPS.forEach(t => { if (!C.seen[t.id]) (t.rules || []).forEach(r => { if (LS[r]) { miss.push(LS[r]); C.rules[r] = 'later' } }) });
    C.later = miss;
    const me = G.pl.find(p => p.human), w = G.winner === 'draw' ? null : G.pl[+G.winner.slice(1) - 1];
    const rows = G.pl.slice().sort((a, b) => b.vp - a.vp).map(p => `${p === me ? 'You' : mname(p)}: ${p.vp} ★, ${Math.max(0, p.hp)} ♥, ${p.cards.length} card${p.cards.length === 1 ? '' : 's'}`).join(' · ');
    showCoach({ id: 'final', head: w === me ? 'KING OF CROWN CITY!' : 'Final scoring', sticky: true,
      say: `${w ? (w === me ? 'You won' : mname(w) + ' won') : 'Nobody won'} with ${w ? w.vp : 0} ★ (${GOAL()} needed, or last standing). ${rows}.`,
      html: `<small>Not met in this game (see Help): ${miss.slice(0, 4).concat(COACH_LATER.slice(0, 2).map(l => l[1])).join('; ')}.</small><span class="pp-row"><button type="button" data-pp-play>Play a real game</button><button type="button" data-pp-story>Story mode</button></span>` });
    try { GXT.markDone(TUT_GAME) } catch (e) { }
  }
  function coach() {
    if (!C.on || !(typeof G !== 'undefined' && G) || !G.tut) return;
    if (G.winner) { if (UI.stats) finalCard(); return }
    if (C.cur) return;   // one bubble at a time
    for (const t of COACH_TIPS) { if (C.seen[t.id]) continue; let ok = false; try { ok = t.when() } catch (e) { } if (ok) { showCoach(t); return } }
  }
  window.ppCoachStart = function () { C.on = true; C.seen = {}; C.rules = {}; C.ended = false; hideCoach();
    const el = $('ppcoach'); setTimeout(() => { if (C.on && !C.cur && G && G.tut) { const t = COACH_TIPS[0]; if (t.when()) showCoach(Object.assign({}, t, { html: '<span class="pp-row"><button type="button" data-pp-skip>Skip tutorial</button></span>' })) } }, 400) };
  window.ppCoachStop = function () { C.on = false; hideCoach() };
  // for qa-bot: running = the coached game is on; explained = rule ids explained so far (or listed on the final card); done = the final card was shown
  Object.defineProperty(window, 'GXCOACH', { configurable: true, get: () => ({ running: !!(C.on && typeof G !== 'undefined' && G && G.tut && !G.winner), explained: Object.keys(C.rules), done: !!C.ended }) });
  document.addEventListener('keydown', e => { const t = e.target; if ((e.key === 'Enter' || e.key === ' ') && t && t.classList && t.classList.contains('pchip')) { e.preventDefault(); t.click() } });   // player chips are tabs (a div), keyboard works like a button
  window.addEventListener('load', () => setTimeout(dieLabels, 300));
})();

// ===== Addendum 5 (W386d): the player can SEE how they score =====
// live preview of the current dice, a reason pop + one rating line after each turn (versus a greedy keep), a leader mark on the score strip, a best-value card badge
(function () {
  const $ = id => document.getElementById(id);
  const ok = () => typeof G !== 'undefined' && G && !G.winner;
  const meSeat = () => G.pl.findIndex(p => p.human);
  const mine = () => ok() && G.active === meSeat() && !UI.intro && !UI.choice;
  const val = s => s.vp * 2 + s.en + s.hl + (s.targets && s.targets.length ? s.dmg * 1.5 : 0);
  // ---- live preview (above the dice)
  function pvHTML() {
    const p = cur(), s = scoreDice(p, G.dice), chips = [];
    if (s.vp) chips.push(`<b class="v">+${s.vp}★</b> from numbers`);
    if (s.en) chips.push(`<b class="e">+${s.en}⚡</b> energy`);
    if (s.hl) chips.push(`<b class="h">+${s.hl}♥</b> heal`);
    else if (G.dice.some(d => d.f === 'H') && !canHealDice(p)) chips.push('<b class="n">♥ no heal in Downtown</b>');
    if (s.dmg && s.targets.length) chips.push(`<b class="c">−${s.dmg}♥</b> hits ${s.targets.map(q => esc(mname(q))).slice(0, 2).join(', ')}${s.targets.length > 2 ? '…' : ''}`);
    else if (G.dice.some(d => d.f === 'C')) chips.push('<b class="n">claws: nobody to hit</b>');
    if (!inCity(p.i) && G.city === -1) chips.push('<b class="v">+1★</b> Downtown is empty: you move in');
    return chips.length ? chips.join(' · ') : 'Nothing scores yet: keep dice and roll again';
  }
  function preview() {
    const dw = $('dicewrap') || $('dice'); if (!dw) return;
    let el = $('pppreview'); if (!el) { el = document.createElement('div'); el.id = 'pppreview'; el.setAttribute('aria-live', 'polite'); (dw.parentNode || dw).insertBefore(el, dw) }   // ABOVE the tray, never over the dice
    const show = mine() && G.phase === 'roll' && G.dice.length && !document.querySelector('.gx-dock[data-bf="resolving"]');
    document.documentElement.classList.toggle('pp-mine-roll', !!show);
    document.documentElement.classList.toggle('pp-nobub', !!show && !/[?&]scn=/.test(location.search));   // the old text strip under the tray repeats the preview
    if (!show) { el.classList.remove('on'); return }
    const h = `<i>If you smash now:</i> ${pvHTML()}`; if (el.dataset.h !== h) { el.dataset.h = h; el.innerHTML = h } el.classList.add('on');
  }
  // ---- greedy keep: what a simple strategy averages from the same first roll
  let seed = 7; const rn = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;
  const FACE = ['1', '2', '3', 'E', 'C', 'H'];
  function greedy(p, faces, rerolls) {
    let tot = 0; const N = 120;
    for (let r = 0; r < N; r++) {
      let f = faces.slice();
      for (let k = 0; k < rerolls; k++) {
        const c = {}; f.forEach(x => c[x] = (c[x] || 0) + 1);
        let focus = null, best = -1; ['1', '2', '3'].forEach(n => { const sc = c[n] ? c[n] * 10 + (+n) : 0; if (sc > best) { best = sc; focus = n } });
        const hit = others(p).some(q => inCity(q.i) !== inCity(p.i)) || (inCity(p.i) && others(p).length);
        f = f.map(x => (x === focus || x === 'E' || (x === 'C' && hit) || (x === 'H' && canHealDice(p) && p.hp < maxhp(p))) ? x : FACE[Math.floor(rn() * 6)]);
      }
      tot += val(scoreDice(p, f.map(x => ({ f: x }))));
    }
    return tot / N;
  }
  const T = { first: null, shown: '', lastPh: '' };
  function track() {
    if (!ok()) return;
    const p = cur();
    if (mine() && G.phase === 'roll' && G.dice.length && T.first === null && G.rolls === rerollsOf(p)) T.first = { faces: G.dice.filter(d => !d.t).map(d => d.f), re: rerollsOf(p), tid: G.tid };
    const ph = mine() ? G.phase : '', was = T.lastPh; T.lastPh = ph;
    if (was === 'roll' && ph === 'buy') resolvedPop();
    if (!mine() && G.active !== meSeat()) T.first = T.first && T.first.tid === G.tid ? T.first : null;
  }
  const friendly = t => t.replace(/(\d+)★ from (\d+)×(\d)/g, (m, n, c, f) => `+${n}★ for ${c === '3' ? 'three' : c === '4' ? 'four' : c} ${f}s`).replace(/^(\d+)⚡$/, '+$1⚡ energy').replace(/^(\d+)★$/, '+$1★');
  function resolvedPop() {
    const p = cur(), me = meSeat(); const ev = G.log.find(l => l.s === me && /resolves/.test(l.t)); if (!ev) return;
    const body = String(ev.t).replace(/^.*?resolves[^:]*:\s*/, '').replace(/\.$/, '');
    const lines = body.split(/,\s*/).map(friendly).filter(Boolean);
    let rating = '';
    try {
      if (T.first) {
        const act = val(scoreDice(p, G.dice.filter(d => !d.t).map(d => ({ f: d.f })))), g = greedy(p, T.first.faces, T.first.re), d = act - g;
        const word = d >= 1 ? 'GOOD' : d >= -1.5 ? 'OKAY' : 'POOR';
        rating = `<em class="${word.toLowerCase()}">${word}</em> turn: you scored ${act.toFixed(1)} points of value; a greedy keep averages ${g.toFixed(1)}.`;
        window.PPRATE = { act, greedy: g, word };
      }
    } catch (e) { }
    T.first = null;
    let el = $('pppop'); if (!el) { el = document.createElement('div'); el.id = 'pppop'; el.setAttribute('aria-live', 'polite'); document.body.appendChild(el) }
    el.innerHTML = `<b>You smashed:</b><ul>${lines.map(l => `<li>${esc(l)}</li>`).join('')}</ul>${rating ? `<p>${rating}</p>` : ''}`;
    el.classList.remove('on'); void el.offsetWidth; el.classList.add('on'); clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove('on'), 4200);
  }
  // ---- score strip: the leader is marked; the best-value card wears a badge
  function strip() {
    if (!ok()) return;
    const alive = G.pl.filter(p => p.alive), top = Math.max.apply(null, alive.map(p => p.vp)), leaders = alive.filter(p => p.vp === top);
    // desktop: no chip strip, so a standings strip (you vs rivals, stars and hearts, leader marked) stays on screen
    const chipsOn = (() => { const e = $('pchips'); return !!(e && e.getClientRects().length) })();
    let st = $('ppstand'); if (!st) { st = document.createElement('div'); st.id = 'ppstand'; st.setAttribute('aria-label', 'Standings'); document.body.appendChild(st) }
    if (chipsOn) st.style.display = 'none'; else {
      st.style.display = 'flex';
      const html = G.pl.slice().sort((x, y) => y.vp - x.vp || y.hp - x.hp).map(q => `<span class="${q.human ? 'me' : ''} ${top > 0 && leaders.length === 1 && leaders[0] === q ? 'lead' : ''} ${q.alive ? '' : 'ko'}"><b>${q.human ? 'You' : esc(mname(q))}</b> ★${q.vp} ♥${Math.max(0, q.hp)}${top > 0 && leaders.length === 1 && leaders[0] === q ? ' ▲' : ''}</span>`).join('');
      if (st.dataset.h !== html) { st.dataset.h = html; st.innerHTML = html }
    }
    document.querySelectorAll('#pchips .pchip').forEach(c => { const k = +c.dataset.pm; c.classList.toggle('lead', top > 0 && leaders.length === 1 && leaders[0].i === k) });
    document.querySelectorAll('#pshop [data-shop], #buymini [data-card]').forEach(e => e.classList.remove('pp-best'));
    if (mine() && G.phase === 'buy' && !G.tut) { let k = -1; try { k = suggestCard(cur()) } catch (e) { } if (k >= 0) { const e = document.querySelector(`#pshop [data-shop="${k}"], #buymini [data-card="${k}"]`); if (e) e.classList.add('pp-best') } }
  }
  const _after = window.ppAfter;
  window.ppAfter = function () { _after && _after.apply(this, arguments); try { track(); preview(); strip() } catch (e) { console.error('ppAfter ' + e.message) } };
})();
