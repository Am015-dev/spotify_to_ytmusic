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
    const LS = { extra: 'four of a kind adds 1 ★ per extra die', noheal: 'no healing inside Downtown', start2: 'starting a turn in Downtown pays +2 ★', yield: 'yield when hit in Downtown', ko: '0 ♥ means knocked out; last one standing wins', claws: 'claws hit the other zone', hearts: 'hearts heal 1 each', energy: 'energy buys cards', pair: 'a pair scores nothing; three of a kind scores', enter: 'an empty Downtown pulls you in for +1 ★', win20: '20 ★ is checked when your turn ends', rivals: 'rivals play like you', cards: 'power cards: tap to read, tap again to buy', types: 'PERMANENT cards stay, ONE-SHOT cards are used once', sweep: '♻ swaps the three cards for 2 ⚡', endturn: 'End turn keeps your saved ⚡', keep: 'tap dice to keep them, Roll for the rest', rekeep: 'kept dice can be rolled again', triple: 'three of a kind scores its number in ★', stop: 'you may stop rolling early' };
    const miss = []; COACH_TIPS.forEach(t => { if (!C.seen[t.id]) (t.rules || []).forEach(r => { if (LS[r]) { miss.push(LS[r]); C.rules[r] = 'later' } }) });
    C.later = miss;
    const me = G.pl.find(p => p.human), w = G.winner === 'draw' ? null : G.pl[+G.winner.slice(1) - 1];
    const rows = G.pl.slice().sort((a, b) => b.vp - a.vp).map(p => `${p === me ? 'You' : mname(p)}: ${p.vp} ★, ${Math.max(0, p.hp)} ♥, ${p.cards.length} card${p.cards.length === 1 ? '' : 's'}`).join(' · ');
    showCoach({ id: 'final', head: w === me ? 'KING OF CROWN CITY!' : 'Final scoring', sticky: true,
      say: `${w ? (w === me ? 'You won' : mname(w) + ' won') : 'Nobody won'} with ${w ? w.vp : 0} ★ (20 needed, or last standing). ${rows}.`,
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
  window.addEventListener('load', () => setTimeout(dieLabels, 300));
})();
